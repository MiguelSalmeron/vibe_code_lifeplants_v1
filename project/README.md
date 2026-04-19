# LifePlants

## ES

LifePlants es una aplicación web construida con React Router v7, Vite, TypeScript y Firebase. La documentación principal de este repositorio asume que la versión activa vive en `app/` y que el despliegue de producción sirve el build generado en `build/client`.

### Arquitectura oficial

- Frontend: React 19 + React Router v7 + Vite 7
- Lenguaje: TypeScript
- UI: componentes reutilizables en `app/components/`
- Datos: módulos locales en `app/data/` y servicios en `app/lib/`
- Backend: Firebase Hosting, Firestore y Functions

### Estructura relevante

```text
project/
|- app/                  # Código fuente React Router
|- public/               # Assets estáticos servidos por Vite/Firebase
|- build/                # Salida de producción
|- raiz/                 # Workspace de funciones y recursos de chat/RAIZ
|- prompts/              # Instrucciones para IA y patrones del proyecto
|- README.md             # Este archivo
|- LEEME-PRIMERO.md      # Entrada rápida a la documentación
|- INICIO-RAPIDO.md      # Onboarding operativo
|- GUIA-DESARROLLO.md    # Convenciones de desarrollo
`- firebase.json         # Hosting, rewrites y funciones
```

### Rutas activas

- `/` -> inicio
- `/laboratorio` y `/laboratorio-de-campo` -> laboratorio de campo
- `/biblioteca-de-plantas` -> biblioteca de plantas
- `/ia` y `/identificador-plantas` -> identificador de plantas
- `/eventos` -> eventos públicos
- `/admin` y `/admin/eventos` -> panel administrativo

### Scripts disponibles

- `npm run dev` -> servidor de desarrollo
- `npm run build` -> build de producción
- `npm run start` -> servidor local sobre `build/server/index.js`
- `npm run typecheck` -> typegen + TypeScript
- `npm run deploy:hosting` -> build + deploy de hosting
- `npm run deploy:full` -> build + deploy completo

### Inicio rápido

```bash
npm install
npm run dev
```

### Despliegue

```bash
npm run build
firebase deploy --config firebase.json
```

El hosting publica `build/client`. Las rutas de API se resuelven mediante Firebase Functions y el proxy de desarrollo definido en `vite.config.ts`.

### Documentación recomendada

1. [LEEME-PRIMERO.md](LEEME-PRIMERO.md)
2. [INICIO-RAPIDO.md](INICIO-RAPIDO.md)
3. [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md)
4. [ADMIN-EVENTOS-SETUP.md](ADMIN-EVENTOS-SETUP.md)
5. [CONFIGURACION-API-PLANTAS.md](CONFIGURACION-API-PLANTAS.md)

### Nota sobre HTML legado

Los archivos HTML de la raíz se conservan como referencia y compatibilidad histórica. La documentación operativa principal de este repositorio describe el flujo React Router + Firebase.

## EN

LifePlants is a web application built with React Router v7, Vite, TypeScript, and Firebase. The main documentation in this repository assumes the active application lives in `app/` and production serves the build generated in `build/client`.

### Official architecture

- Frontend: React 19 + React Router v7 + Vite 7
- Language: TypeScript
- UI: reusable components in `app/components/`
- Data: local modules in `app/data/` and services in `app/lib/`
- Backend: Firebase Hosting, Firestore, and Functions

### Quick start

```bash
npm install
npm run dev
```

### Production deploy

```bash
npm run build
firebase deploy --config firebase.json
```

### Legacy HTML note

The root HTML files are kept for historical reference and compatibility. The primary operational documentation describes the React Router + Firebase flow.
