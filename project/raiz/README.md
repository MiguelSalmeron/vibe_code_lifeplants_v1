# RAIZ / Backend Notes
## ES
`raiz/` contiene el workspace del backend de LifePlants para Firebase Functions, pruebas locales y recursos vinculados al chat de RAIZ. La configuración activa del proyecto principal apunta a `raiz/functions` desde [firebase.json](../firebase.json).
### Qué vive aquí
- `functions/` -> Firebase Functions
- `public/` -> recursos estáticos del backend
- `firebase.json` -> configuración local del workspace
### Integración actual
- El frontend principal consume `/api/chat` y `/api/tts`.
- En desarrollo, `vite.config.ts` puede redirigir `/api/*` al emulador.
- En producción, Firebase Hosting y Functions resuelven los endpoints.
### Flujo local recomendado
```bash
firebase emulators:start --only functions
```
En otra terminal, desde la raíz del proyecto principal:
```bash
VITE_RAIZ_FUNCTIONS_ORIGIN="http://127.0.0.1:5001/<project>/us-central1" npm run dev
```
### Variables útiles
- `VERTEX_PROJECT`
- `VERTEX_LOCATION`
- `VERTEX_MODEL`
- `VERTEX_SERVICE_ACCOUNT_JSON`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
# RAIZ — Instrucciones de despliegue

Este backend ahora alimenta la ruta de chat integrada en la aplicacion React en /ia.

## Integracion actual

- Frontend integrado: /ia (ruta React de LifePlants)
- Endpoint consumido por la app: /api/chat
- Backend: Firebase Functions (function chat)
- Modelo: Gemini en Vertex AI (ADC)

## Estructura del proyecto

```
raiz/
├── firebase.json          ← configuración Firebase
├── public/
│   └── raiz.html          ← frontend (subir a lifeplants.org/raiz)
└── functions/
    ├── index.js           ← proxy seguro hacia Gemini
    └── package.json
```

## Paso 1 — Requisitos

```bash
npm install -g firebase-tools
firebase login
```

## Paso 2 — Conectar al proyecto Firebase de lifeplants.org

```bash
cd raiz/
firebase use --add
# Selecciona tu proyecto Firebase existente de lifeplants.org
```

## Paso 3 — Instalar dependencias de Functions

```bash
cd functions/
npm install
cd ..
```

Si aun no instalaste dependencias de la app principal:

```bash
cd ../
npm install
```

## Paso 4 — Guardar la API key de Gemini (SOLO UNA VEZ, queda en GCP Secret Manager)
## Paso 4 — Habilitar Vertex AI y permisos IAM (sin API key)

1. Habilita la API de Vertex AI en tu proyecto:

```bash
gcloud services enable aiplatform.googleapis.com --project life--plants-app
```

2. Da permiso de uso de Vertex AI a la cuenta de servicio de Cloud Functions:

```bash
gcloud projects add-iam-policy-binding life--plants-app \
  --member="serviceAccount:life--plants-app@appspot.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

Nota: este flujo usa ADC y NO requiere crear llaves JSON de cuentas de servicio.

## Paso 4B — Produccion sin ADC local: credenciales por JSON de Service Account

Si quieres que RAIZ opere en produccion sin depender de `gcloud auth application-default login`, usa una cuenta de servicio y expone su JSON como variable de entorno segura.

Variables soportadas por `functions/index.js`:

- `VERTEX_SERVICE_ACCOUNT_JSON`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`

El valor debe ser el contenido completo del JSON del service account de Google Cloud.

Comportamiento del backend:

- Si `GOOGLE_APPLICATION_CREDENTIALS` ya apunta a un archivo, se respeta.
- Si no existe y una de las variables JSON anteriores está presente, el backend escribe ese JSON en un archivo temporal y configura `GOOGLE_APPLICATION_CREDENTIALS` automaticamente.
- Si el JSON incluye `project_id` y no definiste `VERTEX_PROJECT`, el backend lo reutiliza.

Recomendacion de despliegue:

- En Cloud Run: agrega la variable de entorno como secret o env var protegida.
- En Firebase Functions v2: guarda el JSON como secret/env seguro y expone el contenido como `VERTEX_SERVICE_ACCOUNT_JSON`.
- Mantén ademas `VERTEX_LOCATION`, `VERTEX_MODEL` y `VERTEX_PROJECT` cuando quieras forzar valores concretos.

## Paso 5 — Deploy

```bash
firebase deploy
```

Listo. RAIZ estará en:
  https://lifeplants.org/raiz

Y el chat integrado en la app funcionara en:
  https://lifeplants.org/ia

La API key nunca toca el frontend. Los estudiantes solo ven la página.

---

## Notas de costos

- Firebase Functions: 2,000,000 invocaciones/mes gratis (Spark plan)
- Vertex AI Gemini: pago por uso segun modelo y tokens
- Si el tráfico crece, activa el plan Blaze (pay-as-you-go) — sigue siendo muy barato

## Para cambiar el System Prompt

Edita `functions/index.js`, busca `SYSTEM_PROMPT` y modifica el texto.
Luego: `firebase deploy --only functions`

## Desarrollo local (app React + Functions)

Antes de iniciar el emulador, autentica ADC con tu cuenta:

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project life--plants-app
```

Si ADC local no tiene permisos aun, RAIZ funciona en modo local-fallback durante el emulador para que puedas validar UI/flujo de chat.
En ese modo devuelve respuestas de prueba y no consume Vertex AI.

Si prefieres probar con credenciales de service account en local, exporta una de estas variables antes de iniciar el emulador:

```bash
export VERTEX_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

o

```bash
export GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

El backend convertira ese JSON a un archivo temporal y usara Vertex AI sin necesitar `gcloud auth application-default login`.

1. En una terminal, correr functions en modo emulador desde esta carpeta:

```bash
firebase emulators:start --only functions
```

2. En otra terminal, correr la app principal con proxy hacia el emulador:

```bash
cd ../
VITE_RAIZ_FUNCTIONS_ORIGIN="http://127.0.0.1:5001/<tu-proyecto-firebase>/us-central1" npm run dev
```

3. Abrir /ia y probar mensajes.

Tambien puedes definir un endpoint completo en el frontend con:

```bash
VITE_RAIZ_CHAT_ENDPOINT="http://127.0.0.1:5001/<tu-proyecto-firebase>/us-central1/chat"
VITE_RAIZ_TTS_ENDPOINT="http://127.0.0.1:5001/<tu-proyecto-firebase>/us-central1/tts"
```

Cuando `VITE_RAIZ_CHAT_ENDPOINT` esta definido, el frontend lo usa directamente y no depende del proxy.
Si tambien defines `VITE_RAIZ_TTS_ENDPOINT`, la voz usara ese endpoint de forma explicita.
Si no lo defines, el frontend intenta derivarlo automaticamente desde `VITE_RAIZ_CHAT_ENDPOINT` cambiando `/chat` por `/tts`.

## Variables opcionales

- VERTEX_PROJECT (override de project ID para pruebas locales)
- VERTEX_LOCATION (default: us-central1)
- VERTEX_MODEL (default: gemini-2.5-flash)
