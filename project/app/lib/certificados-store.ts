import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const CERTIFICADOS_COLLECTION = "certificados";
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CertificadoEstado = "activo" | "revocado";

export interface CertificadoFirmanteSnapshot {
  id: string;
  nombre: string;
  rol: string;
  firmaUrl: string;
}

export interface CertificadoFirestoreDoc {
  uuid: string;
  nombreParticipante: string;
  fechaEmision: Timestamp;
  tipoActividad: string;
  estado: CertificadoEstado;
  creadoPor: string;
  timestamp: Timestamp;
  firmanteId?: string;
  firmanteNombre?: string;
  firmanteRol?: string;
  firmanteFirmaUrl?: string;
  revocadoPor?: string;
  fechaRevocacion?: Timestamp;
}

export interface CrearCertificadoInput {
  nombreParticipante: string;
  fechaEmision: Timestamp;
  tipoActividad: string;
  creadoPor: string;
  firmante: CertificadoFirmanteSnapshot;
}

export interface ListarCertificadosFiltros {
  nombreParticipante?: string;
  estado?: CertificadoEstado;
  limit?: number;
}

const assertDbConfigured = () => {
  if (!db) {
    throw new Error("Firebase no esta configurado para certificados.");
  }
};

export const isValidUuidV4 = (uuid: string) => UUID_V4_REGEX.test(uuid.trim());

const sanitizeText = (value: string, fieldName: string) => {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }
  return normalized;
};

const toCertificadoDoc = (id: string, raw: Record<string, unknown>): CertificadoFirestoreDoc => {
  const estado = raw.estado === "revocado" ? "revocado" : "activo";

  return {
    uuid: typeof raw.uuid === "string" && raw.uuid ? raw.uuid : id,
    nombreParticipante: typeof raw.nombreParticipante === "string" ? raw.nombreParticipante : "",
    fechaEmision: raw.fechaEmision instanceof Timestamp ? raw.fechaEmision : Timestamp.now(),
    tipoActividad: typeof raw.tipoActividad === "string" ? raw.tipoActividad : "",
    estado,
    creadoPor: typeof raw.creadoPor === "string" ? raw.creadoPor : "",
    timestamp: raw.timestamp instanceof Timestamp ? raw.timestamp : Timestamp.now(),
    firmanteId: typeof raw.firmanteId === "string" ? raw.firmanteId : undefined,
    firmanteNombre: typeof raw.firmanteNombre === "string" ? raw.firmanteNombre : undefined,
    firmanteRol: typeof raw.firmanteRol === "string" ? raw.firmanteRol : undefined,
    firmanteFirmaUrl: typeof raw.firmanteFirmaUrl === "string" ? raw.firmanteFirmaUrl : undefined,
    revocadoPor: typeof raw.revocadoPor === "string" ? raw.revocadoPor : undefined,
    fechaRevocacion: raw.fechaRevocacion instanceof Timestamp ? raw.fechaRevocacion : undefined,
  };
};

export const crearCertificado = async (input: CrearCertificadoInput) => {
  assertDbConfigured();

  const nombreParticipante = sanitizeText(input.nombreParticipante, "nombreParticipante");
  const tipoActividad = sanitizeText(input.tipoActividad, "tipoActividad");
  const creadoPor = sanitizeText(input.creadoPor, "creadoPor");
  const firmanteId = sanitizeText(input.firmante.id, "firmante.id");
  const firmanteNombre = sanitizeText(input.firmante.nombre, "firmante.nombre");
  const firmanteRol = sanitizeText(input.firmante.rol, "firmante.rol");
  const firmanteFirmaUrl = sanitizeText(input.firmante.firmaUrl, "firmante.firmaUrl");

  if (!(input.fechaEmision instanceof Timestamp)) {
    throw new Error("fechaEmision debe ser un Timestamp de Firestore.");
  }

  const uuid = crypto.randomUUID();
  if (!isValidUuidV4(uuid)) {
    throw new Error("No se pudo generar un UUID v4 valido.");
  }

  const certificadoRef = doc(db, CERTIFICADOS_COLLECTION, uuid);

  await setDoc(certificadoRef, {
    uuid,
    nombreParticipante,
    fechaEmision: input.fechaEmision,
    tipoActividad,
    estado: "activo",
    creadoPor,
    firmanteId,
    firmanteNombre,
    firmanteRol,
    firmanteFirmaUrl,
    timestamp: serverTimestamp(),
  });

  return uuid;
};

export const obtenerCertificado = async (uuid: string): Promise<CertificadoFirestoreDoc | null> => {
  assertDbConfigured();

  const normalizedUuid = uuid.trim();
  if (!isValidUuidV4(normalizedUuid)) {
    throw new Error("El UUID del certificado no es valido.");
  }

  const certificadoRef = doc(db, CERTIFICADOS_COLLECTION, normalizedUuid);
  const certificadoSnap = await getDoc(certificadoRef);

  if (!certificadoSnap.exists()) {
    return null;
  }

  return toCertificadoDoc(certificadoSnap.id, certificadoSnap.data() as Record<string, unknown>);
};

export const revocarCertificado = async (uuid: string, adminEmail: string) => {
  assertDbConfigured();

  const normalizedUuid = uuid.trim();
  const normalizedAdminEmail = sanitizeText(adminEmail, "adminEmail").toLowerCase();

  if (!isValidUuidV4(normalizedUuid)) {
    throw new Error("El UUID del certificado no es valido.");
  }

  const certificadoRef = doc(db, CERTIFICADOS_COLLECTION, normalizedUuid);

  await updateDoc(certificadoRef, {
    estado: "revocado",
    revocadoPor: normalizedAdminEmail,
    fechaRevocacion: serverTimestamp(),
  });
};

export const listarCertificados = async (
  filtros: ListarCertificadosFiltros = {},
): Promise<CertificadoFirestoreDoc[]> => {
  assertDbConfigured();

  const byName = filtros.nombreParticipante?.trim();
  const byEstado = filtros.estado;
  const maxItems = filtros.limit && filtros.limit > 0 ? filtros.limit : undefined;

  let certificadosQuery;

  if (byName) {
    certificadosQuery = query(
      collection(db, CERTIFICADOS_COLLECTION),
      where("nombreParticipante", ">=", byName),
      where("nombreParticipante", "<=", `${byName}\uf8ff`),
      orderBy("nombreParticipante", "asc"),
      orderBy("fechaEmision", "desc"),
      ...(maxItems ? [limit(maxItems)] : []),
    );
  } else if (byEstado) {
    certificadosQuery = query(
      collection(db, CERTIFICADOS_COLLECTION),
      where("estado", "==", byEstado),
      orderBy("fechaEmision", "desc"),
      ...(maxItems ? [limit(maxItems)] : []),
    );
  } else {
    certificadosQuery = query(
      collection(db, CERTIFICADOS_COLLECTION),
      orderBy("fechaEmision", "desc"),
      ...(maxItems ? [limit(maxItems)] : []),
    );
  }

  const snapshot = await getDocs(certificadosQuery);
  let certificados = snapshot.docs.map((certificadoDoc) =>
    toCertificadoDoc(certificadoDoc.id, certificadoDoc.data() as Record<string, unknown>),
  );

  if (byName && byEstado) {
    certificados = certificados.filter((certificado) => certificado.estado === byEstado);
  }

  return certificados;
};
