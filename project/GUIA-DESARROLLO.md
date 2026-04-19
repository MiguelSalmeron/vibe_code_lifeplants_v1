# Guía de Desarrollo / Development Guide

## ES

### Propósito

Esta guía describe cómo trabajar en la aplicación activa de LifePlants. El proyecto usa React Router v7 con Vite, TypeScript y Firebase. La meta es mantener consistencia entre rutas, componentes, estilos, datos y despliegue.

### Stack real

- React 19
- React Router v7
- Vite 7
- TypeScript 5.9
- Firebase Auth, Firestore, Hosting y Functions
- Radix UI, Lucide React, Sonner, Zod, React Hook Form

### Estructura de trabajo

- `app/routes.ts` define las rutas públicas y admin.
- `app/root.tsx` define el layout base, fuentes y providers.
- `app/routes/` contiene páginas y subrutas.
- `app/components/` contiene secciones y componentes reutilizables.
- `app/lib/` concentra acceso a Firebase y lógica compartida.
- `app/data/` guarda contenido estático y catálogos.
- `app/styles/` contiene reset, tokens, tema y estilos globales.

### Reglas de edición

1. Edita primero el módulo de la página o componente.
2. Ajusta estilos en el archivo CSS correspondiente.
3. Actualiza datos o utilidades antes de tocar la composición visual.
4. Actualiza `app/routes.ts` al final si agregas o renombras rutas.

### Comandos útiles

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

### Patrón para nuevas páginas

- Crea un archivo en `app/routes/` con nombre kebab-case.
- Exporta el componente y, si aplica, `loader` o `action`.
- Registra la ruta en `app/routes.ts`.
- Reutiliza componentes existentes antes de crear nuevos.

### Patrón para componentes

- Prefiere componentes pequeños y enfocados.
- Mantén el estilo cerca del componente cuando sea específico.
- Reutiliza `app/components/ui/` cuando exista una pieza equivalente.
- Usa `app/components/` para composición de dominio.

### Estilos y tokens

- Usa los tokens definidos en `app/styles/tokens/` y `app/styles/theme.css`.
- No introduzcas colores o espaciados arbitrarios si existe un token equivalente.
- Mantén la jerarquía visual clara: títulos, subtítulos, texto, acciones y ayudas.
- Si agregas una variación visual nueva, documenta el motivo.

### Firebase y datos

- La configuración de cliente vive en `app/lib/firebase.ts`.
- La lectura/escritura de eventos vive en `app/lib/events-store.ts`.
- Los permisos admin se validan por claim y por reglas de Firestore.
- Los endpoints `/api/*` se resuelven contra Firebase Functions en desarrollo y producción.

### Buenas prácticas

- Escribe TypeScript estricto y explícito cuando el tipo no sea obvio.
- Evita duplicar lógica entre páginas similares.
- No mezcles el flujo React con el legado HTML como si fueran la misma app.
- Documenta cualquier cambio de contrato de datos o de ruta.

### Solución de problemas

- Si una ruta no carga, revisa `app/routes.ts` y el nombre del archivo.
- Si Firebase falla, revisa variables `VITE_FIREBASE_*` y la inicialización en `app/lib/firebase.ts`.
- Si `/api/chat` falla en local, revisa el proxy de `vite.config.ts`.

## EN

### Purpose

This guide explains how to work on the active LifePlants application. The project uses React Router v7 with Vite, TypeScript, and Firebase. The goal is to keep routes, components, styles, data, and deployment aligned.

### Working rules

1. Edit the page module or component first.
2. Adjust styles in the matching CSS file.
3. Update data or utilities before changing composition.
4. Update `app/routes.ts` last when you add or rename routes.
- ✅ Usar etiquetas semánticas
- ✅ Incluir textos alternativos descriptivos

## 🔍 Debugging

### Chrome DevTools
```javascript
// Console logging
console.log('Variable:', variable);
console.table(arrayData);
console.error('Error:', error);

// Breakpoints
debugger; // Pausa ejecución aquí
```

### Validación
- HTML: https://validator.w3.org/
- CSS: https://jigsaw.w3.org/css-validator/
- Accesibilidad: https://wave.webaim.org/

## 📦 Deployment

### Sitios estáticos (Recomendado)

#### Netlify
```bash
# Arrastrar carpeta completa a netlify.com/drop
# O conectar repositorio Git
```

#### Vercel
```bash
npm install -g vercel
vercel
```

#### GitHub Pages
```bash
# Push a rama gh-pages
git checkout -b gh-pages
git push origin gh-pages
```

### Servidor tradicional
```bash
# Subir todos los archivos HTML, CSS, JS y carpetas
# Asegurar que index.html esté en la raíz
```

## 🐛 Problemas Comunes

### Las imágenes no cargan
- ✅ Verificar rutas relativas/absolutas
- ✅ Comprobar que el servidor sirve archivos estáticos
- ✅ Revisar CORS si las imágenes son externas

### CSS no se aplica
- ✅ Verificar orden de archivos CSS en HTML
- ✅ Comprobar especificidad de selectores
- ✅ Limpiar caché del navegador

### JavaScript no funciona
- ✅ Revisar consola del navegador para errores
- ✅ Verificar que scripts se cargan después del DOM
- ✅ Comprobar que las funciones están definidas antes de usarse

## 📚 Recursos

### Documentación
- MDN Web Docs: https://developer.mozilla.org/
- CSS Tricks: https://css-tricks.com/
- Web.dev: https://web.dev/

### Herramientas
- Can I Use: https://caniuse.com/
- CSS Grid Generator: https://cssgrid-generator.netlify.app/
- Flexbox Froggy: https://flexboxfroggy.com/

### Imágenes
- Unsplash: https://unsplash.com/
- Pexels: https://pexels.com/
- Pixabay: https://pixabay.com/

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

© 2026 LifePlants. Todos los derechos reservados.

---

**¿Preguntas?** Contacta al equipo de desarrollo.
