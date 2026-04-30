import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type FieldValue,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "./firebase";

const FIRMANTES_COLLECTION = "firmantes";
const MAX_SIGNATURE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_SIGNATURE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export interface FirmanteDoc {
  id: string;
  nombre: string;
  rol: string;
  firmaUrl: string;
  firmaStoragePath: string;
  activo: boolean;
  creadoPor: string;
  timestamp: Timestamp;
  actualizadoEn?: Timestamp;
}

export interface CrearFirmanteInput {
  nombre: string;
  rol: string;
  firmaFile: File;
  creadoPor: string;
}

export interface ActualizarFirmanteInput {
  nombre?: string;
  rol?: string;
  firmaFile?: File;
  activo?: boolean;
}

const assertServicesConfigured = () => {
  if (!db || !storage) {
    throw new Error("Firebase no esta configurado para gestionar firmantes.");
  }
};

const sanitizeText = (value: string, fieldName: string) => {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }
  return normalized;
};

const assertSignatureFile = (file: File) => {
  if (!ALLOWED_SIGNATURE_TYPES.includes(file.type)) {
    throw new Error("La firma debe ser PNG, JPG o WEBP.");
  }

  if (file.size > MAX_SIGNATURE_SIZE_BYTES) {
    throw new Error("La firma no puede superar 5MB.");
  }
};

const toFirmanteDoc = (id: string, raw: Record<string, unknown>): FirmanteDoc => {
  return {
    id,
    nombre: typeof raw.nombre === "string" ? raw.nombre : "",
    rol: typeof raw.rol === "string" ? raw.rol : "",
    firmaUrl: typeof raw.firmaUrl === "string" ? raw.firmaUrl : "",
    firmaStoragePath: typeof raw.firmaStoragePath === "string" ? raw.firmaStoragePath : "",
    activo: raw.activo !== false,
    creadoPor: typeof raw.creadoPor === "string" ? raw.creadoPor : "",
    timestamp: raw.timestamp instanceof Timestamp ? raw.timestamp : Timestamp.now(),
    actualizadoEn: raw.actualizadoEn instanceof Timestamp ? raw.actualizadoEn : undefined,
  };
};

const buildSignatureStoragePath = (firmanteId: string, file: File) => {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "png";
  const safeExtension = extension && extension.length <= 8 ? extension : "png";
  return `firmantes/${firmanteId}/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;
};

const uploadFirmanteSignature = async (firmanteId: string, file: File) => {
  assertServicesConfigured();
  assertSignatureFile(file);

  const storagePath = buildSignatureStoragePath(firmanteId, file);
  const signatureRef = ref(storage, storagePath);
  await uploadBytes(signatureRef, file, { contentType: file.type });
  const firmaUrl = await getDownloadURL(signatureRef);

  return {
    firmaUrl,
    firmaStoragePath: storagePath,
  };
};

export const crearFirmante = async (input: CrearFirmanteInput) => {
  assertServicesConfigured();

  const nombre = sanitizeText(input.nombre, "nombre");
  const rol = sanitizeText(input.rol, "rol");
  const creadoPor = sanitizeText(input.creadoPor, "creadoPor");

  const firmanteRef = doc(collection(db, FIRMANTES_COLLECTION));
  const { firmaUrl, firmaStoragePath } = await uploadFirmanteSignature(firmanteRef.id, input.firmaFile);

  await setDoc(firmanteRef, {
    nombre,
    rol,
    firmaUrl,
    firmaStoragePath,
    activo: true,
    creadoPor,
    timestamp: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return firmanteRef.id;
};

export const listarFirmantes = async (soloActivos = false): Promise<FirmanteDoc[]> => {
  assertServicesConfigured();

  const firmantesQuery = soloActivos
    ? query(collection(db, FIRMANTES_COLLECTION), where("activo", "==", true))
    : query(collection(db, FIRMANTES_COLLECTION), orderBy("timestamp", "desc"));

  const snapshot = await getDocs(firmantesQuery);
  const firmantes = snapshot.docs.map((firmanteDoc) =>
    toFirmanteDoc(firmanteDoc.id, firmanteDoc.data() as Record<string, unknown>),
  );

  return firmantes.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
};

export const obtenerFirmante = async (firmanteId: string): Promise<FirmanteDoc | null> => {
  assertServicesConfigured();

  const normalizedId = sanitizeText(firmanteId, "firmanteId");
  const firmanteRef = doc(db, FIRMANTES_COLLECTION, normalizedId);
  const firmanteSnap = await getDoc(firmanteRef);

  if (!firmanteSnap.exists()) {
    return null;
  }

  return toFirmanteDoc(firmanteSnap.id, firmanteSnap.data() as Record<string, unknown>);
};

export const actualizarFirmante = async (firmanteId: string, input: ActualizarFirmanteInput) => {
  assertServicesConfigured();

  const normalizedId = sanitizeText(firmanteId, "firmanteId");
  const current = await obtenerFirmante(normalizedId);
  if (!current) {
    throw new Error("El firmante no existe.");
  }

  const updates: Record<string, string | boolean | FieldValue> = {
    actualizadoEn: serverTimestamp(),
  };

  if (typeof input.nombre === "string") {
    updates.nombre = sanitizeText(input.nombre, "nombre");
  }

  if (typeof input.rol === "string") {
    updates.rol = sanitizeText(input.rol, "rol");
  }

  if (typeof input.activo === "boolean") {
    updates.activo = input.activo;
  }

  if (input.firmaFile) {
    const { firmaUrl, firmaStoragePath } = await uploadFirmanteSignature(normalizedId, input.firmaFile);
    updates.firmaUrl = firmaUrl;
    updates.firmaStoragePath = firmaStoragePath;

    if (current.firmaStoragePath && current.firmaStoragePath !== firmaStoragePath) {
      try {
        await deleteObject(ref(storage, current.firmaStoragePath));
      } catch {
        // Non-blocking cleanup: keep update successful even if old image removal fails.
      }
    }
  }

  const firmanteRef = doc(db, FIRMANTES_COLLECTION, normalizedId);
  await updateDoc(firmanteRef, updates);
};

export const desactivarFirmante = async (firmanteId: string) => {
  await actualizarFirmante(firmanteId, { activo: false });
};

export const activarFirmante = async (firmanteId: string) => {
  await actualizarFirmante(firmanteId, { activo: true });
};
