# Setup Admin de Eventos / Events Admin Setup

## ES

Esta guía describe cómo habilitar y operar el panel de administración de eventos en la app React.

### Requisitos

- Firebase Authentication configurado
- Firestore habilitado
- Proyecto conectado a `firebase.json`
- Usuario con cuenta válida en Firebase Auth

### Variables de entorno

Configura las variables del cliente en el archivo `.env` del proyecto cuando corresponda:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_EMAILS`

### Cómo otorgar acceso admin

El acceso real se valida por custom claim `admin` y por la regla de Firestore.

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

Después de asignar el claim, la persona debe cerrar sesión y volver a entrar.

Desde la raíz del proyecto puedes ejecutarlo así:

```bash
npm run admin:set-claim -- --email tu-correo@dominio.com
```

Si tu sesión local de `gcloud` no sirve, el script también acepta un JSON de service account en una de estas variables:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `VERTEX_SERVICE_ACCOUNT_JSON`

El JSON debe incluir `client_email` y `private_key`.

### Reglas de Firestore

La colección `eventos` está protegida por [firestore.rules](firestore.rules):

- lectura pública solo para eventos activos
- lectura y escritura completas solo para admin

Despliegue de reglas:

```bash
firebase deploy --only firestore:rules --config firebase.json
```

### Rutas

- `/eventos` -> listado público
- `/admin` -> panel
- `/admin/eventos` -> CRUD de eventos

### Flujo recomendado

1. Crea o valida el usuario en Firebase Auth.
2. Asigna el claim `admin`.
3. Vuelve a iniciar sesión.
4. Entra a `/admin/eventos`.

## EN

This guide explains how to enable and operate the events admin panel in the React app.

### Security model

- Custom claim `admin` grants write access.
- Firestore rules are the final source of truth.
- Public users can only read active events.

