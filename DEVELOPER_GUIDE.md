# Guía de Desarrollador - Lifeplants

## 1. Descripción General del Proyecto

Lifeplants es una aplicación web interactiva diseñada para entusiastas de la botánica y la jardinería. La plataforma permite a los usuarios identificar plantas mediante inteligencia artificial, acceder a una biblioteca de especímenes, registrarse en eventos y obtener certificados de participación. Incluye también un panel de administración para gestionar eventos, firmantes y certificados.

## 2. Stack Tecnológico

La aplicación está construida con un stack moderno basado en TypeScript.

### Frontend:
- **Framework:** React 19
- **Build Tool:** Vite
- **Enrutado:** React Router 7
- **Lenguaje:** TypeScript
- **Estilos:**
  - Tailwind CSS para utilidades.
  - Archivos CSS globales en `styles/` (`theme.css`, `tokens.css`, `global.css`, `components.css`, `reset.css`).
  - Módulos CSS (`.module.css`) para componentes específicos.
- **UI/Componentes:**
  - Arquitectura basada en Radix UI.
  - Lucide React para iconos.
  - Herramientas complementarias: Embla Carousel, Recharts, Sonner (Toasts), Vaul, CMDK.
- **Formularios:** React Hook Form + Zod.
- **Documentos:** `@react-pdf/renderer` para creación de PDF y `react-qrcode-logo` para QR.

### Backend & Infraestructura:
- **Firebase:** Firestore, Hosting, Storage y Functions.

## 3. Estructura de Carpetas

```
/
├── app/
│   ├── components/  # Componentes de UI genéricos y específicos del proyecto.
│   ├── data/        # Mock data (ej. events.ts para próximos/pasados eventos).
│   ├── lib/         # Capa de datos y utilidades (stores de firebase, utils para PDFs).
│   ├── routes/      # Vistas correspondientes a cada ruta de la app.
│   └── routes.ts    # Configuración de enrutado de React Router.
├── public/          # Assets estáticos (ej. firma.png, sdeam.png).
├── raiz/
│   ├── functions/   # Cloud Functions de Firebase.
│   └── public/      # Archivos estáticos legacy o del hosting base.
├── scripts/         # Scripts de Typescript.
├── styles/          # Hojas de estilo globales (variables, reset, temas).
└── package.json     # Configuración de dependencias y scripts NPM.
```

## 4. Componentes

Los componentes en `app/components/` se dividen en dos categorías principales. 

### Componentes de Dominio (Específicos de la App):
- **AlertBanner:** Muestra avisos globales. Props: `message`, `linkUrl`, `linkText`, `className`.
- **Footer / Header:** Elementos fijos de navegación. Props: `className`.
- **HeroSection:** Sección principal (landing). Props: `title`, `subtitle`, `motto`, `backgroundImage`, `className`.
- **InitiativeCard / InitiativesSection:** Muestran iniciativas. Props: `title`, `description`, `imageUrl`, `linkUrl` (InitiativeCard) y `title`, `initiatives` (InitiativesSection).
- **IntroSection:** Sección de introducción con imagen. Props: `label`, `title`, `description`, `imageUrl`, `className`.
- **InvolvementCard / InvolvementSection:** Tarjetas de participación/voluntariado.
- **LabQuickAccess:** Acceso rápido a las herramientas de laboratorio. Sin props.
- **MissionVisionSection / ResourceLibrarySection / ValuesSection:** Secciones informativas para la landing page. Props: `className`.

### Componentes de UI Base (`app/components/ui/`):
Una extensa biblioteca de componentes primitivos y compuestos tipo "Shadcn UI", que incluyen:
`accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `card`, `carousel`, `chart`, `checkbox`, `color-scheme-toggle`, `command`, `dialog`, `drawer`, `dropdown-menu`, `form`, `input`, `input-otp`, `label`, `popover`, `radio-group`, `select`, `sidebar`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `tooltip`, entre otros.

## 5. Rutas / Navegación

Definido en `app/routes.ts`:
- **Públicas:** `/`, `/laboratorio`, `/biblioteca-de-plantas`, `/ia`, `/eventos` y `/verificar`.
- **Redirecciones:** `/laboratorio-de-campo` a `/laboratorio`, `/identificador-plantas` a `/ia`.
- **Administración (`/admin`):**
  - Raíz (`/admin/`)
  - Gestión de eventos (`/admin/eventos`)
  - Gestión de certificados (`/admin/certificados`)

## 6. Estado Global y Capa de Datos

No se utiliza una librería tradicional de estado global tipo Redux, Zustand o Jotai para el estado de la aplicación general. En su lugar, el proyecto maneja el estado de las siguientes formas:

- **Contextos React (Context API):** Están estrictamente delimitados a la capa de UI para proveer funcionalidad de componentes complejos. Se encuentran instanciados internamente en:
  - `ChartContext` (`chart.tsx`): Para compartir configuración y tooltips de gráficos.
  - `CarouselContext` (`carousel.tsx`): Para la navegación del carrusel.
  - `SidebarContext` (`sidebar.tsx`): Para controlar el estado expandido/colapsado de la barra lateral.
  - `FormFieldContext` / `FormItemContext` (`form.tsx`): Para enlazar inputs con validaciones de `react-hook-form`.

- **Capa de Datos de Firebase (Stores):** Todo lo que respecta a persistencia y lógica de negocio se expone a través de módulos exportados desde `app/lib/`, que actúan como "stores" o repositorios de servicios interactuando directamente con Firestore:
  - `certificados-store.ts`: Funciones para `crearCertificado`, `obtenerCertificado`, `revocarCertificado`, `listarCertificados`.
  - `firmantes-store.ts`: Funciones para `crearFirmante`, `listarFirmantes`, `obtenerFirmante`, `actualizarFirmante`, `activarFirmante/desactivarFirmante`.
  - Los datos estáticos del frontend se consumen desde `app/data/events.ts` (`upcomingEvents`, `pastEvents`).

## 7. Estilos y Tema

El sistema visual utiliza **CSS puro acoplado a CSS Modules y variables CSS**, sin depender exclusivamente de Tailwind para todo.

- **Sistema de Temas (Dark/Light Mode):** Sí, el proyecto tiene soporte nativo para temas claro y oscuro.
  - Está gestionado por el paquete `@dazl/color-scheme`.
  - El usuario puede cambiarlo usando el componente `ColorSchemeToggle` (ubicado en `app/components/ui/color-scheme-toggle/`).
  - Los colores cambian dinámicamente gracias a variables definidas en el archivo `styles/theme.css` (ej. `--color-neutral-1` reacciona según la paleta), que se importa globalmente en `app/root.tsx`.
- **Organización de CSS:** `tokens.css` para constantes de diseño, `global.css` y `components.css` para aplicación general de estilos y overrides.

## 8. Scripts Disponibles (`npm run ...`)

- `dev` / `build` / `start`: Scripts de ciclo de vida de React Router / Vite.
- `typecheck`: Validación TypeScript.
- `admin:set-claim` / `admin:clear-claim`: Scripts mediante Firebase Functions para dar/quitar roles de administrador a los usuarios por email.
- `deploy:firestore` / `deploy:hosting` / `deploy:full`: Comandos para desplegar reglas, frontend y todas las configuraciones a la infraestructura de Firebase.

## 9. Seguridad Implementada

La infraestructura de Lifeplants cuenta con una serie de protecciones en Backend y Frontend para evitar el uso indebido de los servicios:

- **Reglas de Firestore (PII):** Los datos sensibles de usuarios en la colección `users` están bloqueados; un usuario solo puede leer y modificar su propio documento, impidiendo consultas masivas no autorizadas.
- **Firebase App Check con reCAPTCHA Enterprise:** El cliente web integra App Check, inyectando un token en el header `X-Firebase-AppCheck` para cada llamada a las Cloud Functions protegidas (`/api/chat` y `/api/tts`). Cuenta con resiliencia SSR y bypass local de desarrollo.
- **Cloud Functions Rate Limit:** Las APIs de backend validan activamente el token de App Check y controlan la tasa de peticiones mediante el módulo `express-rate-limit` (limitado a 5 peticiones por minuto por IP para TTS, por ejemplo) para mitigar el agotamiento de cuotas y ataques DDoS.
