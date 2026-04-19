# Resumen de conversión / Conversion Summary

## ES

Este documento registra una etapa histórica del proyecto. LifePlants conserva recursos heredados en HTML/CSS/JS, pero el flujo operativo vigente de este repositorio es la aplicación React Router + Vite + Firebase.

### Qué cambió

- Se consolidó la app principal en `app/`.
- Se definieron rutas activas en `app/routes.ts`.
- Se conectó Firebase para hosting, Firestore y funciones.
- Se conservó una capa estática como referencia histórica y compatibilidad.

### Estado actual

- Desarrollo principal: `npm run dev`
- Build: `npm run build`
- Producción local: `npm run start`
- Despliegue: `firebase deploy --config firebase.json`

### Documentos relacionados

- [README.md](README.md)
- [LEEME-PRIMERO.md](LEEME-PRIMERO.md)
- [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md)

## EN

This document records a historical stage of the project. LifePlants still keeps legacy HTML/CSS/JS resources, but the active working flow in this repository is the React Router + Vite + Firebase application.

### What changed

- The main app was consolidated in `app/`.
- Active routes were defined in `app/routes.ts`.
- Firebase was wired for hosting, Firestore, and functions.
- The static layer was preserved for historical reference and compatibility.
