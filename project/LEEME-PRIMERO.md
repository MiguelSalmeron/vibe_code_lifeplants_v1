# Leeme Primero / Read Me First

## ES

Este repositorio documenta la aplicación activa de LifePlants basada en React Router v7, Vite, TypeScript y Firebase. Si estás empezando, esta es la mejor ruta de entrada para entender qué se usa hoy y dónde editar cada cosa.

### Qué debes leer primero

1. [README.md](README.md) para la visión general del proyecto.
2. [INICIO-RAPIDO.md](INICIO-RAPIDO.md) para levantar el entorno.
3. [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md) para convenciones de trabajo.
4. [ADMIN-EVENTOS-SETUP.md](ADMIN-EVENTOS-SETUP.md) si tocarás eventos o permisos.
5. [CONFIGURACION-API-PLANTAS.md](CONFIGURACION-API-PLANTAS.md) si trabajarás en el identificador de plantas.

### Arquitectura oficial

- Frontend principal: `app/`
- Rutas: `app/routes.ts`
- Layout base: `app/root.tsx`
- Datos y servicios: `app/data/` y `app/lib/`
- Hosting y deploy: `firebase.json` + `build/client`
- Funciones: `raiz/functions`

### Qué debes evitar asumir

- No asumas que `index.html` y los archivos HTML de la raíz son la app principal.
- No asumas que el flujo estático es el camino oficial de desarrollo.
- No asumas que la documentación histórica describe el estado actual sin verificarla.

### Flujo rápido

```bash
npm install
npm run dev
```

### Rutas principales

- `/` -> inicio
- `/laboratorio` -> laboratorio de campo
- `/biblioteca-de-plantas` -> biblioteca de plantas
- `/ia` -> identificador de plantas y chat integrado
- `/eventos` -> eventos públicos
- `/admin` -> panel administrativo

### Documentación histórica

Los archivos [CONVERSION-COMPLETA.md](CONVERSION-COMPLETA.md) y [RESUMEN-CONVERSION.md](RESUMEN-CONVERSION.md) se mantienen como referencia histórica. Su contenido se actualizó para evitar contradicciones con el estado actual.

## EN

This repository documents the active LifePlants application built with React Router v7, Vite, TypeScript, and Firebase. If you are getting started, this is the best entry point to understand the current architecture and where to edit each area.

### What to read first

1. [README.md](README.md) for the project overview.
2. [INICIO-RAPIDO.md](INICIO-RAPIDO.md) to start the environment.
3. [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md) for working conventions.
4. [ADMIN-EVENTOS-SETUP.md](ADMIN-EVENTOS-SETUP.md) if you will touch events or permissions.
5. [CONFIGURACION-API-PLANTAS.md](CONFIGURACION-API-PLANTAS.md) if you will work on plant identification.

### Quick flow

```bash
npm install
npm run dev
```
