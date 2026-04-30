import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

import type { CertificadoFirestoreDoc } from "./certificados-store";

const CERT_BASE_URL = "https://lifeplants.org";

export const CERTIFICATE_BRANDING = {
  logoPath: "/logo.jpg",
  sdeamLogoPath: "/sdeam.png",
  signaturePath: "/firma.png",
  signerLine: "Miguel Salmeron - Director General de LifePlants",
  signerName: "Miguel Salmeron",
  signerRole: "Director General de LifePlants",
};

export type CertificateSignerResolved = {
  id: string;
  name: string;
  role: string;
  signatureUrl: string;
  line: string;
};

export const resolveCertificateSigner = (certificate?: Partial<CertificadoFirestoreDoc> | null): CertificateSignerResolved => {
  const name = certificate?.firmanteNombre?.trim() || CERTIFICATE_BRANDING.signerName;
  const role = certificate?.firmanteRol?.trim() || CERTIFICATE_BRANDING.signerRole;
  const signatureUrl = certificate?.firmanteFirmaUrl?.trim() || CERTIFICATE_BRANDING.signaturePath;
  const id = certificate?.firmanteId?.trim() || "legacy-default";

  return {
    id,
    name,
    role,
    signatureUrl,
    line: `${name} - ${role}`,
  };
};

export const buildPublicAssetUrl = (assetPath: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}${assetPath}`;
};

export const buildVerificationUrl = (uuid: string) => {
  const normalizedUuid = uuid.trim();
  return `${CERT_BASE_URL}/verificar?id=${encodeURIComponent(normalizedUuid)}`;
};

export const formatCertificateDate = (value: Timestamp | Date) => {
  const date = value instanceof Timestamp ? value.toDate() : value;
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
};

export const buildLinkedInCertificationUrl = (certificate: CertificadoFirestoreDoc) => {
  const issueDate = certificate.fechaEmision.toDate();
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: certificate.tipoActividad,
    organizationName: "LifePlants",
    issueYear: String(issueDate.getFullYear()),
    issueMonth: String(issueDate.getMonth() + 1),
    certUrl: buildVerificationUrl(certificate.uuid),
    certId: certificate.uuid,
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

export const getQrDataUrlFromElement = (element: HTMLElement | null) => {
  if (!element) {
    return null;
  }

  const canvas = element.querySelector("canvas");
  if (!canvas) {
    return null;
  }

  return canvas.toDataURL("image/png");
};
