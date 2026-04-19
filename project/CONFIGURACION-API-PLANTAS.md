# Configuración de la API de Identificación de Plantas / Plant Identifier API Setup

## ES

Este módulo vive en [app/config/plant-identifier.ts](app/config/plant-identifier.ts). Hoy funciona como una configuración de referencia para una futura integración de identificación de plantas, no como una ruta de producción ya cerrada.

### Estado actual

- `apiEndpoint` apunta a `/api/identify-plant`
- `identifyPlant()` devuelve una respuesta simulada
- El módulo define un contrato tipado para la respuesta esperada

### Qué debes cambiar cuando integres una API real

1. Sustituye `apiEndpoint` por el endpoint real.
2. Mueve la API key a variables de entorno.
3. Ajusta el mapeo de respuesta al tipo `PlantIdentificationResult`.
4. Verifica el tamaño y los formatos aceptados de archivo.

### Buenas prácticas

- Nunca dejes una API key real en el código fuente.
- Si la lógica vive en cliente, considera un proxy en Firebase Functions.
- Documenta el formato de respuesta antes de conectar el UI.

### Respuesta esperada

El contrato esperado debe incluir:

- nombre científico
- nombre común
- familia
- nivel de confianza
- descripción
- cuidados opcionales

### Prueba rápida

1. Abre la app en desarrollo.
2. Invoca el flujo que use este módulo.
3. Verifica el mensaje simulado o la respuesta real.

## EN

This module lives in [app/config/plant-identifier.ts](app/config/plant-identifier.ts). It currently acts as a reference configuration for a future plant identification integration, not as a finished production route.

### Current state

- `apiEndpoint` points to `/api/identify-plant`
- `identifyPlant()` returns a simulated response
- The module defines a typed contract for the expected result

### When wiring a real API

1. Replace `apiEndpoint` with the real service URL.
2. Move the API key into environment variables.
3. Map the response to `PlantIdentificationResult`.
4. Verify upload limits and allowed formats.


### ¿Puedo comprimir la imagen antes de enviarla?

Sí, usa un canvas para redimensionar:

```typescript
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = 800;  // Ancho máximo
        canvas.height = (img.height * 800) / img.width;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

---

**¡Listo!** 🌱 Con esta configuración, puedes integrar fácilmente cualquier API de identificación de plantas en el futuro.
