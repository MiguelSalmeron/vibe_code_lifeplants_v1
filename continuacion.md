# Protocolo de Continuidad - Lifeplants

## Resumen de Progreso
Las fases críticas de seguridad han concluido exitosamente:
- **Fase A (Backend):** Completada. Se implementaron reglas estrictas de Firestore para proteger la PII, además de asegurar las Cloud Functions (`/api/chat` y `/api/tts`) verificando tokens de Firebase App Check y controlando la frecuencia de solicitudes mediante Rate Limiting (express-rate-limit).
- **Fase B (Frontend):** Completada. Se integró la inicialización de Firebase App Check usando `ReCaptchaEnterpriseProvider`, manejando correctamente entornos SSR y desarrollo local. Las llamadas a APIs inyectan el token con alta resiliencia ante fallos.

*Nota sobre reCAPTCHA:* El sistema queda a la espera de que el Ingeniero Principal inyecte la llave real de reCAPTCHA en el código (`project/app/lib/firebase.ts`) de forma manual para su activación final, este será el primer paso para la siguiente sesión.

## Tareas Pendientes (Auditoría de IA)
Para la próxima sesión de trabajo, el enfoque cambia de seguridad perimetral a optimización lógica y de negocio. Los siguientes puntos de la auditoría quedan pendientes:

- **Punto 7:** Optimización de tokens del modelo en el Chat.
- **Punto 8:** Manejo de contexto de conversación en memoria.
- **Punto 9:** Auditoría del manejo de memoria caché de las interacciones.
- **Punto 10:** Revisión de la lógica de fechas y Timezones (Asegurar UTC e internacionalización).
- **Punto 11:** Pulido final de componentes de UI y bugs menores de renderizado que derivan de discrepancias en fechas.
