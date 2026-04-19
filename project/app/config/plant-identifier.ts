/**
 * Configuración del Identificador de Plantas por IA
 * 
 * Este archivo centraliza la configuración de la API de identificación de plantas.
 * Cambia estos valores cuando integres tu API real.
 */

export const plantIdentifierConfig = {
  /**
   * URL base de la API de identificación de plantas
   * Ejemplo: "https://api.plantnet.org/v2/identify"
   * Por ahora usa un endpoint simulado
   */
  apiEndpoint: "/api/identify-plant",

  /**
   * API Key (se debe mover a variables de entorno en producción)
   * Usa process.env.PLANT_API_KEY en producción
   */
  apiKey: "YOUR_API_KEY_HERE",

  /**
   * Configuración de la cámara/upload
   */
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.9,
  },

  /**
   * Configuración de la API
   */
  api: {
    timeout: 30000, // 30 segundos
    retries: 3,
  },

  /**
   * Mensajes de instrucción para el usuario
   */
  messages: {
    title: "Identificar una Planta",
    subtitle: "Sube una foto y nuestra IA te ayudará a descubrir qué planta es. Para mejores resultados, asegúrate de que la foto sea clara y enfocada.",
    uploadButton: "Subir desde Galería",
    cameraButton: "Usar Cámara",
    processingMessage: "Analizando imagen...",
    errorMessage: "No se pudo identificar la planta. Intenta con otra foto.",
    tips: [
      "Usa fotos con buena iluminación",
      "Enfoca las hojas o flores claramente",
      "Evita sombras y reflejos",
      "Toma la foto desde cerca",
    ],
  },
};

/**
 * Función para identificar planta
 * 
 * ESTADO: PRÓXIMAMENTE
 * Esta función estará disponible cuando se integre una API de identificación de plantas.
 * 
 * APIs recomendadas:
 * - PlantNet API: https://my.plantnet.org/
 * - Plant.id by Kindwise: https://web.plant.id/
 * - iNaturalist API: https://www.inaturalist.org/pages/api+reference
 * 
 * Ejemplo de implementación con PlantNet:
 * 
 * export async function identifyPlant(imageFile: File): Promise<PlantIdentificationResult> {
 *   const formData = new FormData();
 *   formData.append("images", imageFile);
 *   formData.append("organs", "leaf"); // o "flower", "fruit", etc.
 *   
 *   const response = await fetch(
 *     `https://my-api.plantnet.org/v2/identify/all?api-key=${plantIdentifierConfig.apiKey}`,
 *     {
 *       method: "POST",
 *       body: formData,
 *     }
 *   );
 *   
 *   const data = await response.json();
 *   
 *   return {
 *     success: true,
 *     plant: {
 *       scientificName: data.results[0].species.scientificNameWithoutAuthor,
 *       commonName: data.results[0].species.commonNames[0] || "Nombre no disponible",
 *       family: data.results[0].species.family.scientificNameWithoutAuthor,
 *       confidence: data.results[0].score,
 *       description: `Planta identificada con ${Math.round(data.results[0].score * 100)}% de confianza`,
 *     },
 *   };
 * }
 */
export async function identifyPlant(imageFile: File): Promise<PlantIdentificationResult> {
  // Función pendiente de implementación
  // Por ahora, no se procesa la imagen
  console.log("Imagen recibida:", imageFile.name);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: false,
        error: "La función de identificación estará disponible próximamente.",
      });
    }, 1000);
  });
}

export interface PlantIdentificationResult {
  success: boolean;
  plant?: {
    scientificName: string;
    commonName: string;
    family: string;
    confidence: number;
    description: string;
    care?: {
      light: string;
      water: string;
      temperature: string;
      humidity: string;
    };
    imageUrl?: string;
  };
  error?: string;
}
