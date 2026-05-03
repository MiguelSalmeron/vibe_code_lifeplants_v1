import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/identificador-plantas";
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { Link, type LinksFunction } from "react-router";
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Leaf,
  Loader2,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  RefreshCcw,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import styles from "./identificador-plantas.module.css";
import { appCheck } from "../lib/firebase";
import { getToken } from "firebase/app-check";

// ── Model selector ──
const MODELS = [
  { key: "mini",  label: "Raiz Mini",  provider: "Gemini 2.5 Pro", emoji: "🌱" },
  { key: "stark", label: "Raiz Stark", provider: "Gemini 3.1 Pro", emoji: "⚡" },
  { key: "max",   label: "Raiz Max",   provider: "Claude",         emoji: "✦" },
] as const;
type ModelKey = typeof MODELS[number]["key"];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RAIZ IA - LifePlants" },
    {
      name: "description",
      content: "Conversa con RAIZ, el asistente de inteligencia ambiental de LifePlants.",
    },
  ];
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap",
  },
];

type ChatRole = "user" | "model";

interface ChatMessage {
  id: string;
  role: ChatRole;
  parts: [{ text: string }];
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const createMessageId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${randomPart}`;
};

const createWelcomeMessage = (): ChatMessage => ({
  id: createMessageId(),
  role: "model",
  parts: [
    {
      text: "Bienvenido, soy RAIZ. Estoy aquí para ayudarte con temas de biodiversidad, proyectos de LifePlants y consultas generales. Si lo deseas, podemos abordar cada conversación con un enfoque reflexivo, claro y orientado a la vida real.",
    },
  ],
});

const starterPrompts = [
  "Dame una reflexión filosófica sobre cómo tomar mejores decisiones.",
  "Contame sin rodeos qué es LifePlants y por qué importa.",
  "Cómo dejo de procrastinar sin perder mi paz mental.",
  "Soltame flora nicaragüense nativa que valga la pena conocer.",
];

const topicCards = [
  {
    title: "Flora y biodiversidad",
    description: "Especies nativas, ecosistemas locales y conservación en Nicaragua y Centroamérica.",
  },
  {
    title: "Proyectos LifePlants",
    description: "Misión, visión, iniciativas y participación comunitaria con impacto ambiental.",
  },
  {
    title: "Voluntariado y aliados",
    description: "Formas de sumar apoyo, colaborar o lanzar una alianza con la red de LifePlants.",
  },
  {
    title: "Restauración ecológica",
    description: "Acciones para recuperar hábitats, enriquecer suelo y fortalecer cobertura vegetal.",
  },
];

const BOTTOM_THRESHOLD = 96;

const isScrolledToBottom = (container: HTMLDivElement) => {
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  return distanceFromBottom <= BOTTOM_THRESHOLD;
};

const scrollMessagesToBottom = (container: HTMLDivElement) => {
  container.scrollTo({
    top: container.scrollHeight - container.clientHeight,
    behavior: container.scrollHeight > container.clientHeight ? "smooth" : "auto",
  });
};

export default function IdentificadorPlantas() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelKey>("mini");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Onboarding hint — shown once until user interacts with the model selector
  const [showModelHint, setShowModelHint] = useState(() => {
    try { return !localStorage.getItem("raiz_model_hint_seen"); }
    catch { return true; }
  });

  // Response flash — brief glow when AI replies
  const [responseFlash, setResponseFlash] = useState(false);
  const prevMsgCountRef = useRef(0);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const isMountedRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const transcriptRef = useRef("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);
  const chatSessionRef = useRef(0);
  // ── Audio element for server-side TTS playback ──
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeModelData = MODELS.find((m) => m.key === selectedModel) ?? MODELS[0];

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Flash the model badge when a new AI message arrives
  useEffect(() => {
    const count = messages.length;
    const lastMsg = messages[count - 1];
    if (count > prevMsgCountRef.current && lastMsg?.role === "model") {
      setResponseFlash(true);
      const t = window.setTimeout(() => setResponseFlash(false), 2200);
      prevMsgCountRef.current = count;
      return () => window.clearTimeout(t);
    }
    prevMsgCountRef.current = count;
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const updateNearBottomState = () => {
      isNearBottomRef.current = isScrolledToBottom(container);
    };

    updateNearBottomState();
    container.addEventListener("scroll", updateNearBottomState, { passive: true });

    return () => {
      container.removeEventListener("scroll", updateNearBottomState);
    };
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isNearBottomRef.current) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      if (isNearBottomRef.current) {
        scrollMessagesToBottom(container);
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [messages, isSending]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeRequestControllerRef.current?.abort();
      speechRecognitionRef.current?.stop();
      // Stop any playing TTS audio on unmount
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const chatEndpoint = import.meta.env.VITE_RAIZ_CHAT_ENDPOINT || "/api/chat";
  const ttsEndpoint = import.meta.env.VITE_RAIZ_TTS_ENDPOINT ||
    (() => {
      const derivedEndpoint = chatEndpoint.replace(/\/chat(?=\/?$|[?#])/, "/tts");
      return derivedEndpoint !== chatEndpoint ? derivedEndpoint : "/api/tts";
    })();

  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const sendHistory = async (history: ChatMessage[], model: ModelKey, signal: AbortSignal) => {
    let appCheckToken = "";
    if (appCheck) {
      try {
        const tokenResult = await getToken(appCheck, false);
        appCheckToken = tokenResult.token;
      } catch (err) {
        console.warn("App Check Token fetch failed:", err);
      }
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (appCheckToken) {
      headers["X-Firebase-AppCheck"] = appCheckToken;
    }

    const response = await fetch(chatEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ history, model }),
      signal,
    });

    if (!response.ok) {
      const responseBody = await response.json().catch(() => ({}));
      const message = responseBody?.error || "No se pudo completar la respuesta de RAIZ.";
      throw new Error(message);
    }

    const data = (await response.json()) as { reply?: string };
    if (!data.reply) {
      throw new Error("RAIZ no devolvio una respuesta valida.");
    }

    return data.reply;
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    setSpeakingMessageId(null);
  };

  const stopAllVoiceCapture = () => {
    transcriptRef.current = "";
    speechRecognitionRef.current?.stop();
    setIsListening(false);
  };

  const focusComposer = () => {
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleNewChat = () => {
    activeRequestControllerRef.current?.abort();
    activeRequestControllerRef.current = null;
    requestSequenceRef.current += 1;
    chatSessionRef.current += 1;

    stopAllVoiceCapture();
    stopSpeaking();
    setMessages([createWelcomeMessage()]);
    setInput("");
    setError(null);
    setCopiedMessageId(null);
    setSidebarQuery("");
    setIsSending(false);
    if (isMobile) {
      setSidebarOpen(false);
    }
    focusComposer();
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    setError(null);
    if (isMobile) {
      setSidebarOpen(false);
    }
    focusComposer();
  };

  const normalizedSidebarQuery = sidebarQuery.trim().toLowerCase();
  const filteredTopics = topicCards.filter((topic) => {
    if (!normalizedSidebarQuery) {
      return true;
    }

    return `${topic.title} ${topic.description}`.toLowerCase().includes(normalizedSidebarQuery);
  });

  const recentConversation = messages.filter((message) => message.role === "user").slice(-4).reverse();
  const assistantReplies = messages.filter((message) => message.role === "model").length;

  // ── speakMessage: voz Neural2 femenina desde el servidor (Google Cloud TTS) ──
  const speakMessage = async (message: ChatMessage) => {
    if (!isVoiceModeEnabled || message.role !== "model") return;

    // Toggle off if same message is already playing
    if (speakingMessageId === message.id) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setSpeakingMessageId(message.id);

    const text = message.parts[0]?.text || "";
    if (!text) {
      setSpeakingMessageId(null);
      return;
    }

    try {
      let appCheckToken = "";
      if (appCheck) {
        try {
          const tokenResult = await getToken(appCheck, false);
          appCheckToken = tokenResult.token;
        } catch (err) {
          console.warn("App Check Token fetch failed:", err);
        }
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (appCheckToken) {
        headers["X-Firebase-AppCheck"] = appCheckToken;
      }

      const res = await fetch(ttsEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const responseBody = await res.json().catch(() => ({}));
        const message = responseBody?.error || "TTS no disponible";
        throw new Error(message);
      }

      const { audioBase64 } = (await res.json()) as { audioBase64: string };
      if (!audioBase64 || !isMountedRef.current) {
        setSpeakingMessageId(null);
        return;
      }

      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      currentAudioRef.current = audio;

      audio.onended = () => {
        if (isMountedRef.current) setSpeakingMessageId(null);
      };
      audio.onerror = () => {
        if (isMountedRef.current) {
          setSpeakingMessageId(null);
          setError("No se pudo reproducir el audio.");
        }
      };

      await audio.play();
    } catch {
      if (isMountedRef.current) {
        setSpeakingMessageId(null);
        setError("No se pudo generar audio de voz en este momento.");
      }
    }
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.parts[0]?.text || "");
      setCopiedMessageId(message.id);
      window.setTimeout(() => {
        if (isMountedRef.current) {
          setCopiedMessageId(null);
        }
      }, 1800);
    } catch {
      setError("No se pudo copiar el mensaje. Revisa permisos del navegador.");
    }
  };

  const submitUserText = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isSending) {
      return;
    }

    stopAllVoiceCapture();
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    const sessionId = chatSessionRef.current;

    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      parts: [{ text: cleanText }],
    };
    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const reply = await sendHistory(nextHistory, selectedModel, controller.signal);

      const isStaleRequest =
        !isMountedRef.current ||
        controller.signal.aborted ||
        requestId !== requestSequenceRef.current ||
        sessionId !== chatSessionRef.current;

      if (isStaleRequest) {
        return;
      }

      const modelMessage: ChatMessage = {
        id: createMessageId(),
        role: "model",
        parts: [{ text: reply }],
      };

      setMessages((previousMessages) => [...previousMessages, modelMessage]);

      if (isVoiceModeEnabled) {
        window.setTimeout(() => {
          if (isMountedRef.current && requestId === requestSequenceRef.current) {
            speakMessage(modelMessage);
          }
        }, 80);
      }
    } catch (requestError) {
      if (controller.signal.aborted) {
        return;
      }

      const fallbackError = "Error de conexion con RAIZ. Intenta de nuevo en unos segundos.";
      setError(requestError instanceof Error ? requestError.message : fallbackError);
    } finally {
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
      }

      if (isMountedRef.current && requestId === requestSequenceRef.current && sessionId === chatSessionRef.current) {
        setIsSending(false);
      }
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (isSending) {
      return;
    }

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    const sessionId = chatSessionRef.current;

    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;

    const modelMessageIndex = messages.findIndex((message) => message.id === messageId && message.role === "model");
    if (modelMessageIndex < 0) {
      return;
    }

    const previousUserIndex = [...messages]
      .slice(0, modelMessageIndex)
      .reverse()
      .findIndex((message) => message.role === "user");

    if (previousUserIndex < 0) {
      setError("No hay un mensaje previo del usuario para regenerar esta respuesta.");
      return;
    }

    const originalUserIndex = modelMessageIndex - 1 - previousUserIndex;
    const baseHistory = messages.slice(0, originalUserIndex + 1);

    setError(null);
    setIsSending(true);
    stopSpeaking();

    try {
      const regeneratedReply = await sendHistory(baseHistory, selectedModel, controller.signal);

      const isStaleRequest =
        !isMountedRef.current ||
        controller.signal.aborted ||
        requestId !== requestSequenceRef.current ||
        sessionId !== chatSessionRef.current;

      if (isStaleRequest) {
        return;
      }

      const regeneratedMessage: ChatMessage = {
        id: createMessageId(),
        role: "model",
        parts: [{ text: regeneratedReply }],
      };

      setMessages((previousMessages) => [...previousMessages, regeneratedMessage]);

      if (isVoiceModeEnabled) {
        window.setTimeout(() => {
          if (isMountedRef.current && requestId === requestSequenceRef.current) {
            speakMessage(regeneratedMessage);
          }
        }, 80);
      }
    } catch (requestError) {
      if (controller.signal.aborted) {
        return;
      }

      const fallbackError = "No fue posible regenerar la respuesta de RAIZ.";
      setError(requestError instanceof Error ? requestError.message : fallbackError);
    } finally {
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
      }

      if (isMountedRef.current && requestId === requestSequenceRef.current && sessionId === chatSessionRef.current) {
        setIsSending(false);
      }
    }
  };

  const startVoiceInput = () => {
    if (isSending || isListening) {
      return;
    }

    if (!isSpeechRecognitionSupported) {
      setError("Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.");
      return;
    }

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError("No se pudo inicializar el modo voz en este dispositivo.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    speechRecognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "es-NI";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        transcriptRef.current = transcript;
        setInput(transcript);
      }
    };

    recognition.onerror = (voiceError) => {
      const message = voiceError.error === "not-allowed"
        ? "Permiso de microfono denegado. Habilitalo para usar modo voz."
        : "No se pudo capturar tu voz. Intenta nuevamente.";
      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      const transcript = transcriptRef.current.trim();
      transcriptRef.current = "";
      setIsListening(false);

      if (transcript) {
        void submitUserText(transcript);
      }
    };

    setError(null);
    setIsListening(true);
    recognition.start();
  };

  const stopVoiceInput = () => {
    stopAllVoiceCapture();
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitUserText(input);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    void submitUserText(input);
  };

  return (
    <div className={styles.page}>
      <Header className={styles.desktopHeader} />
      <main className={styles.main}>
        <header className={styles.mobileHeader}>
          <Link to="/" className={styles.backLink} aria-label="Volver al inicio de LifePlants">
            <ChevronLeft size={18} />
            <span>Volver</span>
          </Link>

          <div className={styles.mobileHeaderCenter}>
            <div className={styles.mobileHeaderTitleRow}>
              <Bot className={styles.mobileHeaderIcon} />
              <span className={styles.mobileHeaderTitle}>Asistente RAIZ</span>
            </div>
            <div className={styles.mobileHeaderStatusRow}>
              <span className={styles.mobileHeaderStatus}>Conectado</span>
              <span className={styles.mobileHeaderBeta}>BETA</span>
            </div>
          </div>
        </header>

        <div className={`${styles.shell} ${sidebarOpen ? "" : styles.shellCollapsed}`}>
          {sidebarOpen && (
            <button
              type="button"
              className={styles.sidebarBackdrop}
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar panel lateral"
            />
          )}

          <aside className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
            <div className={styles.sidebarTop}>
              <div className={styles.brandLockup}>
                <div className={styles.brandMark}>
                  <Bot className={styles.brandIcon} />
                </div>
                <div>
                  <p className={styles.brandKicker}>LifePlants AI</p>
                  <h1 className={styles.brandTitle}>RAIZ</h1>
                </div>
              </div>
              <p className={styles.sidebarText}>
                Un espacio inmersivo para explorar biodiversidad, ciencia ambiental y los proyectos de LifePlants.
              </p>
              <button type="button" className={styles.newChatButton} onClick={handleNewChat}>
                <Sparkles size={16} />
                Nuevo chat
              </button>
            </div>

            <label className={styles.searchBox}>
              <span className={styles.searchLabel}>Buscar temas</span>
              <div className={styles.searchField}>
                <Leaf size={16} className={styles.searchIcon} />
                <input
                  value={sidebarQuery}
                  onChange={(event) => setSidebarQuery(event.target.value)}
                  className={styles.searchInput}
                  placeholder="Filtra temas, ideas o enfoques"
                  aria-label="Buscar temas"
                />
              </div>
            </label>

            <section className={styles.sidebarSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Atajos rápidos</h2>
                <span className={styles.sectionCount}>{starterPrompts.length}</span>
              </div>
              <div className={styles.promptList}>
                {starterPrompts.map((prompt) => (
                  <button key={prompt} type="button" className={styles.promptChip} onClick={() => handlePromptSelect(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.sidebarSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Actividad reciente</h2>
                <span className={styles.sectionCount}>{assistantReplies}</span>
              </div>
              <div className={styles.recentList}>
                {recentConversation.length > 0 ? (
                  recentConversation.map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      className={styles.recentItem}
                      onClick={() => handlePromptSelect(message.parts[0]?.text || "")}
                    >
                      <span className={styles.recentRole}>Tú</span>
                      <span className={styles.recentText}>{message.parts[0]?.text}</span>
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>Aún no hay mensajes recientes.</div>
                )}
              </div>
            </section>

            <section className={styles.sidebarSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Temas que puedes consultar</h2>
                <span className={styles.sectionCount}>{filteredTopics.length}</span>
              </div>
              <div className={styles.topicGrid}>
                {filteredTopics.map((topic) => (
                  <article key={topic.title} className={styles.topicCard}>
                    <h3 className={styles.topicTitle}>{topic.title}</h3>
                    <p className={styles.topicDescription}>{topic.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </aside>

          <section className={styles.workspace}>
            <header className={styles.workspaceHeader}>
              <button
                type="button"
                className={styles.sidebarToggle}
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label={sidebarOpen ? "Colapsar panel lateral" : "Expandir panel lateral"}
                title={sidebarOpen ? "Colapsar panel" : "Expandir panel"}
              >
                {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
              </button>

              <div className={styles.workspaceHeading}>
                <div className={styles.workspaceEyebrow}>
                  <span className={styles.statusDot} />
                  Conectado
                </div>
                <h2 className={styles.workspaceTitle}>Asistente RAIZ</h2>
                <p className={styles.workspaceSubtitle}>
                  IA conversacional para ambiente y temas generales: filosofía práctica, claridad y acción.
                </p>
              </div>

              <div className={styles.workspaceStats}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{messages.length}</span>
                  <span className={styles.statLabel}>mensajes</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{assistantReplies}</span>
                  <span className={styles.statLabel}>respuestas IA</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{isVoiceModeEnabled ? "ON" : "OFF"}</span>
                  <span className={styles.statLabel}>modo voz</span>
                </div>

                {/* ── Model selector ── */}
                <div className={styles.modelSelector} ref={modelSelectorRef}>
                  <button
                    type="button"
                    className={[
                      styles.modelBadge,
                      modelDropdownOpen ? styles.modelBadgeOpen : "",
                      showModelHint ? styles.modelBadgePulse : "",
                      responseFlash && !showModelHint ? styles.modelBadgeFlash : "",
                    ].join(" ")}
                    onClick={() => {
                      setModelDropdownOpen((prev) => !prev);
                      if (showModelHint) {
                        setShowModelHint(false);
                        try { localStorage.setItem("raiz_model_hint_seen", "1"); } catch {}
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={modelDropdownOpen}
                    aria-label="Seleccionar modelo de IA"
                  >
                    {showModelHint && (
                      <span className={styles.hintDot} aria-hidden />
                    )}
                    <span className={styles.modelBadgeDot} />
                    <span className={styles.modelBadgeName}>{activeModelData.label}</span>
                    <span className={styles.modelBadgeTier}>{activeModelData.provider}</span>
                    <ChevronDown size={13} className={styles.modelBadgeChevron} />
                  </button>

                  {showModelHint && (
                    <div className={styles.modelHintTooltip} role="tooltip" aria-live="polite">
                      <span className={styles.modelHintArrow} aria-hidden />
                      <span className={styles.modelHintIcon}>✦</span>
                      ¡Ahora puedes elegir un modelo!
                    </div>
                  )}

                  {modelDropdownOpen && (
                    <div className={styles.modelDropdown} role="listbox" aria-label="Modelos disponibles">
                      <p className={styles.modelDropdownHeader}>Seleccionar Modelo</p>
                      {MODELS.map((model) => (
                        <button
                          key={model.key}
                          type="button"
                          role="option"
                          aria-selected={selectedModel === model.key}
                          className={`${styles.modelOption} ${styles[`modelOption_${model.key}`]} ${
                            selectedModel === model.key ? styles.modelOptionActive : ""
                          }`}
                          onClick={() => {
                            setSelectedModel(model.key);
                            setModelDropdownOpen(false);
                          }}
                        >
                          <span className={styles.modelOptionIcon}>{model.emoji}</span>
                          <span className={styles.modelOptionInfo}>
                            <span className={styles.modelOptionName}>{model.label}</span>
                            <span className={styles.modelOptionProvider}>{model.provider}</span>
                          </span>
                          {selectedModel === model.key && (
                            <span className={styles.modelOptionCheck} aria-hidden>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </header>

            <article className={styles.chatPanel}>
              <header className={styles.chatHeader}>
                <div className={styles.chatTitleWrap}>
                  <Bot className={styles.chatTitleIcon} />
                  <div>
                    <h3 className={styles.chatTitle}>Cabina de conversación</h3>
                    <p className={styles.chatSubtitle}>Escribe, habla o elige un atajo para iniciar una conversación.</p>
                  </div>
                </div>

                <div className={styles.chatStatusWrap}>
                  <span className={styles.chatStatus}>Conectado</span>
                  <span className={styles.betaBadge}>BETA</span>
                </div>
              </header>

              <div className={styles.messages} ref={messagesContainerRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageRow} ${message.role === "user" ? styles.userRow : styles.modelRow}`}
                  >
                    <div
                      className={`${styles.messageBubble} ${
                        message.role === "user" ? styles.userBubble : styles.modelBubble
                      }`}
                    >
                      {message.parts[0]?.text}
                      {message.role === "model" && (
                        <div className={styles.messageActions}>
                          <button
                            type="button"
                            className={styles.messageActionButton}
                            onClick={() => speakMessage(message)}
                            aria-label={speakingMessageId === message.id ? "Pausar audio" : "Reproducir audio"}
                            disabled={!isVoiceModeEnabled}
                          >
                            {speakingMessageId === message.id ? <Pause size={14} /> : <Volume2 size={14} />}
                          </button>
                          <button
                            type="button"
                            className={styles.messageActionButton}
                            onClick={() => copyMessage(message)}
                            aria-label="Copiar respuesta"
                          >
                            {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          <button
                            type="button"
                            className={styles.messageActionButton}
                            onClick={() => handleRegenerate(message.id)}
                            aria-label="Regenerar respuesta"
                            disabled={isSending}
                          >
                            <RefreshCcw size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className={`${styles.messageRow} ${styles.modelRow}`}>
                    <div className={`${styles.messageBubble} ${styles.modelBubble} ${styles.loadingBubble}`}>
                      <Loader2 className={styles.loader} />
                      RAIZ está escribiendo...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className={styles.errorState} role="status">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form className={styles.chatComposer} onSubmit={handleSendMessage}>
                <div className={styles.composerMain}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Escribe tu pregunta: ambiente, estudio, ideas, decisiones o lo que querás explorar..."
                    className={styles.chatInput}
                    rows={4}
                    disabled={isSending}
                  />
                  <div className={styles.composerHintRow}>
                    <span className={styles.composerHint}>Presiona Enter para enviar, Shift+Enter para saltos de línea.</span>
                    <span className={styles.composerHint}>{isVoiceModeEnabled ? "Voz activa" : "Voz desactivada"}</span>
                  </div>
                </div>

                <div className={styles.composerActions}>
                  <button
                    type="button"
                    className={`${styles.voiceButton} ${isListening ? styles.voiceButtonActive : ""}`}
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={isSending}
                    aria-label={isListening ? "Detener microfono" : "Activar microfono"}
                  >
                    {isListening ? <MicOff className={styles.sendIcon} /> : <Mic className={styles.sendIcon} />}
                    <span>{isMobile ? (isListening ? "Escucha" : "Hablar") : (isListening ? "Escuchando" : "Hablar")}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.voiceModeButton} ${isVoiceModeEnabled ? styles.voiceModeActive : ""}`}
                    onClick={() => {
                      setIsVoiceModeEnabled((previousValue) => {
                        const nextValue = !previousValue;
                        if (!nextValue) {
                          stopSpeaking();
                        }
                        return nextValue;
                      });
                    }}
                    aria-label="Activar o desactivar modo voz"
                  >
                    <Volume2 className={styles.sendIcon} />
                    <span>{isMobile ? (isVoiceModeEnabled ? "Audio ON" : "Audio OFF") : (isVoiceModeEnabled ? "Modo voz: ON" : "Modo voz: OFF")}</span>
                  </button>
                  <button type="submit" className={styles.sendButton} disabled={!input.trim() || isSending}>
                    <Send className={styles.sendIcon} />
                    <span>{isMobile ? "Enviar" : "Enviar"}</span>
                  </button>
                </div>
              </form>
            </article>
          </section>
        </div>

        <button
          type="button"
          className={styles.helpButton}
          aria-label="Ayuda"
          title="Ayuda"
          onClick={() => handlePromptSelect("Explícame cómo puedo usar RAIZ en modo voz.")}
        >
          ?
        </button>
      </main>
      <Footer />
    </div>
  );
}
