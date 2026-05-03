const { onRequest } = require("firebase-functions/v2/https");
const { VertexAI } = require("@google-cloud/vertexai");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const admin = require("firebase-admin");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

if (!admin.apps.length) {
  admin.initializeApp();
}

// --- Rate Limiting (In-Memory - Zero Cost) ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  // Limpieza ligera para no asfixiar memoria de la instancia
  if (rateLimitMap.size > 5000) {
    const cleanupTime = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetTime < cleanupTime) rateLimitMap.delete(key);
    }
  }

  return record.count <= MAX_REQUESTS_PER_WINDOW;
}

// --- App Check Validation ---
async function verifyAppCheck(req) {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    return true;
  }
  const appCheckToken = req.headers['x-firebase-appcheck'];
  if (!appCheckToken) return false;
  try {
    await admin.appCheck().verifyToken(appCheckToken);
    return true;
  } catch (err) {
    return false;
  }
}

const VERTEX_LOCATION =
  process.env.VERTEX_LOCATION ||
  process.env.GOOGLE_CLOUD_LOCATION ||
  process.env.FUNCTION_REGION ||
  "us-central1";
const VERTEX_MODEL = process.env.VERTEX_MODEL || "gemini-2.5-flash";
const VERTEX_SERVICE_ACCOUNT_JSON =
  process.env.VERTEX_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

const TTS_LANGUAGE_CODE = process.env.RAIZ_TTS_LANGUAGE_CODE || "es-ES";
const TTS_VOICE_NAME = process.env.RAIZ_TTS_VOICE_NAME || "es-ES-Chirp3-HD-Kore";
const TTS_SSML_GENDER = process.env.RAIZ_TTS_SSML_GENDER || "FEMALE";
const TTS_SPEAKING_RATE = Number(process.env.RAIZ_TTS_SPEAKING_RATE || 1.06);
const TTS_PITCH = Number(process.env.RAIZ_TTS_PITCH || 1.2);

function isChirpVoice(voiceName) {
  return /-chirp/i.test(String(voiceName || ""));
}

function buildAudioConfig(voiceName, fallbackLevel = 0) {
  const config = { audioEncoding: "MP3" };

  if (fallbackLevel <= 0 && Number.isFinite(TTS_SPEAKING_RATE) && TTS_SPEAKING_RATE > 0) {
    config.speakingRate = TTS_SPEAKING_RATE;
  }

  if (
    fallbackLevel <= 0 &&
    !isChirpVoice(voiceName) &&
    Number.isFinite(TTS_PITCH)
  ) {
    config.pitch = TTS_PITCH;
  }

  return config;
}

const BASE_SYSTEM_PROMPT = `Eres RAIZ, un asistente conversacional de Lifeplants (lifeplants.org).

Tu base nace en Nicaragua y en la idea de que tecnología y naturaleza pueden caminar juntas. Tu dominio fuerte es ambiente, biodiversidad y Lifeplants, pero no eres un bot encerrado en un solo tema.

ENFOQUE DE CONVERSACION:
- Responde con apertura total: si el usuario pregunta de estudio, tecnología, creatividad, trabajo, decisiones personales o cultura general, responde con normalidad y utilidad.
- No te bloquees ni rechaces preguntas por estar fuera de plantas.
- Usa el eje ambiental como valor agregado solo cuando realmente sume, sin forzarlo.

ESTILO Y VOZ:
- Muy filosófico: reflexivo, profundo y con ideas que inviten a pensar.
- Informal, cercano y con carácter: habla como alguien real, no como manual.
- Nicaragüense moderado: usa "vos" y expresiones locales de forma natural, sin exagerar.
- Puedes usar humor fino o ironía suave, pero sin perder calidez.
- Mantén respuestas claras y accionables: reflexión + pasos concretos.

LIMITES DE CALIDAD:
- No inventes datos, estadísticas o fechas que no conozcas con certeza.
- Si no sabes algo puntual, dilo con honestidad y da una alternativa útil.
- Responde en español por defecto, salvo que el usuario escriba en inglés.
- No insultes, no humilles y no respondas de forma agresiva.
- No te presentes en cada mensaje; solo si el usuario saluda o pregunta quién eres.
- Apunta a respuestas de 90-260 palabras, salvo que el usuario pida otro formato.`;

const MODEL_PERSONALITY_PROMPTS = {
  mini: `PERFIL ACTIVO: RAIZ MINI.

- Longitud: responde en maximo 2-3 lineas, salvo que el usuario pida expresamente detalle largo.
- Tono: calido, accesible y empatico.
- Formato: usa 2-3 emojis relevantes por respuesta.
- Nivel tecnico: simplificado para comprension rapida.
- Evita listas largas y explicaciones extensas por defecto.`,
  stark: `PERFIL ACTIVO: RAIZ STARK.

- Longitud: respuesta concisa pero completa en un parrafo estandar.
- Tono: formal, directo y ejecutivo.
- Formato: sin emojis; estructura clara.
- Nivel tecnico: preciso, sin adornos innecesarios.
- Prioriza claridad accionable y lenguaje profesional.`,
  max: `PERFIL ACTIVO: RAIZ MAX.

- Longitud: respuesta exhaustiva cuando aporte valor.
- Tono: autoridad tecnica; se permite ironia sutil solo cuando sea contextualmente apropiada.
- Formato: sin emojis; usa marcos de analisis, metricas y trade-offs cuando aplique.
- Nivel tecnico: maxima profundidad estrategica.
- Explicita supuestos, riesgos y recomendaciones priorizadas.`,
};

const MODEL_GENERATION_PRESETS = {
  mini: {
    temperature: 0.7,
    topP: 0.82,
    maxOutputTokens: 380,
    continuationOutputTokens: 220,
    maxContinuationPasses: 1,
  },
  stark: {
    temperature: 0.65,
    topP: 0.85,
    maxOutputTokens: 900,
    continuationOutputTokens: 600,
    maxContinuationPasses: 2,
  },
  max: {
    temperature: 0.78,
    topP: 0.92,
    maxOutputTokens: 1600,
    continuationOutputTokens: 1600,
    maxContinuationPasses: 3,
  },
};

const DEFAULT_MODEL_KEY = "mini";

const MAX_HISTORY_TURNS = 20;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 18000;
let modelClients = new Map();
let credentialsLoadedFromEnv = false;

function normalizeModelKey(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  if (value === "mini" || value === "stark" || value === "max") {
    return value;
  }
  return DEFAULT_MODEL_KEY;
}

function getModelGenerationPreset(modelKey) {
  return MODEL_GENERATION_PRESETS[modelKey] || MODEL_GENERATION_PRESETS[DEFAULT_MODEL_KEY];
}

function loadVertexCredentialsFromEnv() {
  if (credentialsLoadedFromEnv || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return;
  }

  if (!VERTEX_SERVICE_ACCOUNT_JSON) {
    return;
  }

  try {
    const credentials = JSON.parse(VERTEX_SERVICE_ACCOUNT_JSON);
    const tempCredentialsPath = path.join(os.tmpdir(), "raiz-vertex-service-account.json");

    fs.writeFileSync(tempCredentialsPath, JSON.stringify(credentials), {
      encoding: "utf8",
      mode: 0o600,
    });

    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredentialsPath;

    if (!process.env.VERTEX_PROJECT && credentials.project_id) {
      process.env.VERTEX_PROJECT = credentials.project_id;
    }

    credentialsLoadedFromEnv = true;
  } catch (error) {
    throw new Error(
      "La variable VERTEX_SERVICE_ACCOUNT_JSON o GOOGLE_APPLICATION_CREDENTIALS_JSON no contiene un JSON valido de service account.",
    );
  }
}

function getProjectId() {
  const envProject =
    process.env.VERTEX_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    process.env.PROJECT_ID;

  if (envProject) {
    return envProject;
  }

  try {
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
    if (firebaseConfig?.projectId) {
      return firebaseConfig.projectId;
    }
  } catch (_error) {
    // Ignore invalid FIREBASE_CONFIG JSON.
  }

  return null;
}

function getModelClient(modelKey) {
  if (modelClients.has(modelKey)) {
    return modelClients.get(modelKey);
  }

  loadVertexCredentialsFromEnv();

  const project = getProjectId();
  if (!project) {
    throw new Error("No se pudo resolver el PROJECT_ID para Vertex AI.");
  }

  const vertexAI = new VertexAI({ project, location: VERTEX_LOCATION });

  const personalityPrompt =
    MODEL_PERSONALITY_PROMPTS[modelKey] || MODEL_PERSONALITY_PROMPTS[DEFAULT_MODEL_KEY];

  const modelClient = vertexAI.getGenerativeModel({
    model: VERTEX_MODEL,
    systemInstruction: {
      role: "system",
      parts: [{ text: `${BASE_SYSTEM_PROMPT}\n\n${personalityPrompt}` }],
    },
  });

  modelClients.set(modelKey, modelClient);

  return modelClient;
}

function sanitizeText(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .trim()
    .slice(0, MAX_MESSAGE_CHARS);
}

function normalizeHistory(history) {
  let totalChars = 0;

  return history
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => {
      const role = turn?.role === "model" ? "model" : "user";
      const text = sanitizeText(turn?.parts?.[0]?.text);

      if (!text) {
        return null;
      }

      if (totalChars + text.length > MAX_TOTAL_CHARS) {
        return null;
      }

      totalChars += text.length;

      return {
        role,
        parts: [{ text }],
      };
    })
    .filter(Boolean);
}

function extractResponsePayload(response) {
  const candidate = response?.candidates?.[0];
  const parts = candidate?.content?.parts;

  if (!Array.isArray(parts) || parts.length === 0) {
    return {
      text: "",
      finishReason: String(candidate?.finishReason || ""),
    };
  }

  return {
    text: parts.map((part) => part?.text || "").join("").trim(),
    finishReason: String(candidate?.finishReason || ""),
  };
}

function mergeContinuationText(baseText, continuationText) {
  const base = String(baseText || "").trimEnd();
  const continuation = String(continuationText || "").trimStart();

  if (!base) {
    return continuation;
  }

  if (!continuation) {
    return base;
  }

  const maxOverlap = Math.min(base.length, continuation.length, 220);
  let overlap = 0;

  for (let size = maxOverlap; size >= 20; size -= 1) {
    const tail = base.slice(-size).toLowerCase();
    const head = continuation.slice(0, size).toLowerCase();
    if (tail === head) {
      overlap = size;
      break;
    }
  }

  if (overlap > 0) {
    return `${base}${continuation.slice(overlap)}`.trim();
  }

  return `${base}\n${continuation}`.trim();
}

function hasUnbalancedDoubleQuotes(text) {
  const quoteCount = (text.match(/"/g) || []).length;
  return quoteCount % 2 !== 0;
}

function looksIncomplete(text, finishReason) {
  const content = String(text || "").trim();
  if (!content) {
    return false;
  }

  if (finishReason === "MAX_TOKENS") {
    return true;
  }

  if (content.endsWith("...") || content.endsWith("…")) {
    return true;
  }

  if (hasUnbalancedDoubleQuotes(content)) {
    return true;
  }

  if (content.length > 220 && !/[.!?)]$/.test(content)) {
    return true;
  }

  return false;
}

function cleanAssistantText(text, modelKey) {
  const original = String(text || "");
  if (!original.trim()) {
    return "";
  }

  const keepsEmoji = modelKey === "mini";

  let cleaned = original
    // Remove markdown code fences while keeping the inner content.
    .replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, "$1")
    // Remove inline markdown links while preserving label text.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    // Remove markdown headings.
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    // Normalize markdown list markers.
    .replace(/^\s*[*+]\s+/gm, "- ")
    // Remove emphasis markers.
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove any remaining markdown marker characters that may be malformed.
    .replace(/[*_#`]+/g, "")
    // Remove inline backticks.
    .replace(/`([^`]+)`/g, "$1")
    .replace(/`+/g, "")
    // Remove common decorative symbols frequently emitted by LLM formatting.
    .replace(/[•◦▪▫●○◆◇■□▶▷►▸▹▻➤➜➝→↳↪※§¶†‡]/g, "")
    .replace(/[✦✧✨⭐🌟]/g, "")
    // Remove decorative prefixes at line start.
    .replace(/^[\t ]*[\-–—]?[\t ]*[\|>»·•◦▪▫●○◆◇■□▶▷►▸▹▻➤➜➝→↳↪✦✧✨⭐🌟]+\s*/gm, "")
    // Collapse repeated punctuation artifacts.
    .replace(/([!?.,;:]){4,}/g, "$1$1$1")
    // Normalize whitespace.
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!keepsEmoji) {
    cleaned = cleaned.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "");
  }

  // Keep output readable if cleaning removed too much content.
  if (!cleaned) {
    return original.trim().replace(/[ \t]{2,}/g, " ");
  }

  return cleaned;
}

async function generateReply(model, trimmedHistory, modelKey) {
  const preset = getModelGenerationPreset(modelKey);

  const baseGenerationConfig = {
    temperature: preset.temperature,
    maxOutputTokens: preset.maxOutputTokens,
    topP: preset.topP,
  };

  const firstResult = await model.generateContent({
    contents: trimmedHistory,
    generationConfig: baseGenerationConfig,
  });

  const firstResponse = await firstResult.response;
  const firstPayload = extractResponsePayload(firstResponse);

  let reply = firstPayload.text;
  let finishReason = firstPayload.finishReason;
  let usedContinuation = false;
  let continuationPasses = 0;

  while (reply && looksIncomplete(reply, finishReason) && continuationPasses < preset.maxContinuationPasses) {
    const continuationPrompt =
      continuationPasses === 0
        ? "Continuá exactamente desde donde te quedaste, sin repetir ideas ni volver al inicio. Cerrá la respuesta de forma completa y coherente."
        : "Dame solo el cierre final pendiente de la respuesta anterior, sin repetir ningún contenido.";

    const continuationHistory = normalizeHistory([
      ...trimmedHistory,
      { role: "model", parts: [{ text: reply }] },
      { role: "user", parts: [{ text: continuationPrompt }] },
    ]);

    if (continuationHistory.length === 0) {
      break;
    }

    const continuationResult = await model.generateContent({
      contents: continuationHistory,
      generationConfig: {
        ...baseGenerationConfig,
        maxOutputTokens: preset.continuationOutputTokens,
      },
    });

    const continuationResponse = await continuationResult.response;
    const continuationPayload = extractResponsePayload(continuationResponse);

    reply = mergeContinuationText(reply, continuationPayload.text);
    finishReason = continuationPayload.finishReason || finishReason;
    usedContinuation = true;
    continuationPasses += 1;

  }

  const cleanedReply = cleanAssistantText(reply, modelKey);

  return {
    reply: cleanedReply,
    finishReason,
    usedContinuation,
    continuationPasses,
  };
}

function isAdcOrPermissionError(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = error?.code;

  return (
    message.includes("could not load the default credentials") ||
    message.includes("unable to find credentials") ||
    message.includes("googleautherror") ||
    message.includes("permission") ||
    message.includes("unauthenticated") ||
    message.includes("invalid authentication") ||
    code === 401 ||
    code === 403 ||
    code === 7 ||
    code === 16
  );
}

function buildLocalFallbackReply(history, modelKey) {
  const lastUserTurn = [...history].reverse().find((turn) => turn?.role === "user");
  const question = lastUserTurn?.parts?.[0]?.text?.trim() || "";

  if (modelKey === "mini") {
    return [
      "RAIZ Mini en modo local: no tengo Vertex AI por ahora, pero seguimos aqui 🌱🙂",
      question
        ? `\n\nSobre \"${question}\": empeza con 1 accion pequena hoy y medila manana 📌✅`
        : "\n\nContame el tema y te doy un paso corto y claro para avanzar 🚀",
    ].join("");
  }

  if (modelKey === "stark") {
    return [
      "RAIZ Stark en modo local: Vertex AI no esta disponible temporalmente por credenciales ADC.",
      question
        ? `\n\nFoco recomendado para \"${question}\": definir objetivo, restriccion principal y siguiente accion verificable en 24 horas.`
        : "\n\nComparti el objetivo y te devuelvo una ruta concreta de ejecucion inmediata.",
    ].join("");
  }

  return [
    "RAIZ en modo local (sin acceso ADC): ahorita no tengo Vertex AI, pero seguimos conversando sin freno.",
    "\n\nIdea base:",
    question
      ? `\n- Sobre \"${question}\": pensá qué querés resolver, qué te limita hoy y cuál sería un primer paso pequeño pero real.`
      : "\n- Tirame cualquier tema: ambiental, técnico, creativo o personal, y lo trabajamos con cabeza y aterrizaje práctico.",
    "\n- Si querés, también lo conectamos con una acción ambiental concreta para esta semana.",
    "\n\nCuando habilités ADC (gcloud auth application-default login), esta misma ruta /ia responde con IA completa.",
  ].join("");
}

exports.chat = onRequest(
  {
    timeoutSeconds: 90,
    cors: [
      "https://lifeplants.org",
      "https://www.lifeplants.org",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ],
  },
  async (req, res) => {
    if (!checkRateLimit(req)) {
      return res.status(429).json({ error: "Demasiadas peticiones. Intenta más tarde." });
    }
    if (!(await verifyAppCheck(req))) {
      return res.status(401).json({ error: "Acceso no autorizado (App Check fallido)." });
    }

    // Solo POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const contentType = String(req.headers["content-type"] || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return res.status(415).json({ error: "Content-Type debe ser application/json" });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Cuerpo de solicitud inválido" });
    }

    if (JSON.stringify(req.body).length > 50 * 1024) {
      return res.status(413).json({ error: "Payload demasiado grande. Límite de 50KB excedido." });
    }

    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Formato inválido" });
    }

    const modelKey = normalizeModelKey(req.body?.model);

    const trimmedHistory = normalizeHistory(history);
    if (trimmedHistory.length === 0) {
      return res.status(400).json({ error: "Historial sin mensajes válidos" });
    }

    try {
      const model = getModelClient(modelKey);

      const startedAt = Date.now();
      const { reply, finishReason, usedContinuation, continuationPasses } = await generateReply(
        model,
        trimmedHistory,
        modelKey,
      );

      if (!reply) {
        return res.status(502).json({ error: "Respuesta vacía del modelo" });
      }

      console.info("chat_generation", {
        finishReason,
        modelKey,
        usedContinuation,
        continuationPasses,
        durationMs: Date.now() - startedAt,
      });

      return res.json({ reply, provider: "vertex-adc", model: modelKey });
    } catch (err) {
      if (isAdcOrPermissionError(err)) {
        return res.json({
          reply: buildLocalFallbackReply(trimmedHistory, modelKey),
          mode: "local-fallback",
          model: modelKey,
        });
      }

      console.error("Function error:", err);
      return res.status(500).json({
        error:
          "Lo sentimos, el servicio de IA no está disponible en este momento por un error de configuración.",
      });
    }
  }
);

// ── TTS: texto → audio MP3 con voz femenina natural (configurable) ───────────
const ttsClient = new TextToSpeechClient();

exports.tts = onRequest(
  {
    timeoutSeconds: 30,
    cors: [
      "https://lifeplants.org",
      "https://www.lifeplants.org",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ],
  },
  async (req, res) => {
    if (!checkRateLimit(req)) {
      return res.status(429).json({ error: "Demasiadas peticiones. Intenta más tarde." });
    }
    if (!(await verifyAppCheck(req))) {
      return res.status(401).json({ error: "Acceso no autorizado (App Check fallido)." });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    if (JSON.stringify(req.body || {}).length > 10 * 1024) {
      return res.status(413).json({ error: "Payload demasiado grande." });
    }
    const text = String(req.body?.text || "").trim().slice(0, 1000);
    if (!text) {
      return res.status(400).json({ error: "Texto vacío" });
    }

    try {
      const requestBase = {
        input: { text },
        voice: {
          languageCode: TTS_LANGUAGE_CODE,
          name: TTS_VOICE_NAME,
          ssmlGender: TTS_SSML_GENDER,
        },
      };

      let response;

      try {
        [response] = await ttsClient.synthesizeSpeech({
          ...requestBase,
          audioConfig: buildAudioConfig(TTS_VOICE_NAME, 0),
        });
      } catch (err) {
        const details = String(err?.details || err?.message || "").toLowerCase();
        const isInvalidArgument = err?.code === 3 || details.includes("invalid_argument");

        if (!isInvalidArgument) {
          throw err;
        }

        [response] = await ttsClient.synthesizeSpeech({
          ...requestBase,
          audioConfig: buildAudioConfig(TTS_VOICE_NAME, 1),
        });
      }

      const audioBase64 = response.audioContent.toString("base64");
      return res.json({ audioBase64 });
    } catch (err) {
      console.error("TTS error:", err);
      return res.status(500).json({ error: "No se pudo sintetizar el audio." });
    }
  }
);
