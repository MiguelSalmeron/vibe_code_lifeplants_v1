# Inicio Rápido / Quick Start

## ES

### 1. Instala dependencias

```bash
npm install
```

### 2. Inicia el entorno de desarrollo

```bash
npm run dev
```

### 3. Abre la aplicación

- Desarrollo local: `http://localhost:5173`
- Si estás usando el servidor de producción local: `npm run build` y `npm run start`

### Comandos útiles

```bash
npm run build
npm run start
npm run typecheck
```

### Qué vas a ver

- `/` como inicio
- `/laboratorio` para el laboratorio de campo
- `/biblioteca-de-plantas` para la biblioteca
- `/ia` para el identificador y chat
- `/eventos` para eventos públicos
- `/admin` para administración

### Variables importantes

- `VITE_RAIZ_FUNCTIONS_ORIGIN` para apuntar el proxy a Firebase Functions en emulador
- `VITE_ADMIN_EMAILS` para control de administración en la app

### Solución rápida de problemas

- Si `npm run dev` falla, verifica la versión de Node y reinstala dependencias.
- Si `/api/chat` falla en local, revisa el valor de `VITE_RAIZ_FUNCTIONS_ORIGIN`.
- Si el panel admin no aparece, confirma el usuario con claim `admin` y revisa Firestore rules.

## EN

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

### 3. Open the app

- Local development: `http://localhost:5173`
- Local production server: run `npm run build` and `npm run start`

### Useful commands

```bash
npm run build
npm run start
npm run typecheck
```

### Legacy note

The static HTML flow is kept for reference, but the active working flow in this repository is React Router + Firebase.
