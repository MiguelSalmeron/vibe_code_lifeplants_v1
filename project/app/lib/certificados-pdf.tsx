import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

import type { CertificadoFirestoreDoc } from "./certificados-store";
import {
  buildPublicAssetUrl,
  CERTIFICATE_BRANDING,
  formatCertificateDate,
  resolveCertificateSigner,
} from "./certificados-utils";

export type CertificatePdfVariantOptions = {
  hideSignature?: boolean;
  includeSdeamLogo?: boolean;
  orientation?: "portrait" | "landscape";
};

type GenerateCertificatePdfOptions = {
  certificate: CertificadoFirestoreDoc;
  qrDataUrl: string;
  variant?: CertificatePdfVariantOptions;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#f8fbf8",
  },
  frame: {
    borderWidth: 3,
    borderColor: "#1f5f3b",
    borderStyle: "solid",
    borderRadius: 10,
    height: "100%",
    padding: 26,
    justifyContent: "space-between",
    position: "relative",
  },
  frameLandscape: {
    padding: 20,
  },
  logosRow: {
    marginHorizontal: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginBottom: 14,
  },
  logo: {
    width: 108,
    height: 108,
    objectFit: "contain",
  },
  logoPartner: {
    width: 96,
    height: 96,
    objectFit: "contain",
  },
  logosRowLandscape: {
    marginBottom: 14,
    gap: 14,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 6,
    color: "#2d4f3b",
    fontFamily: "Helvetica",
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    color: "#163a26",
    marginBottom: 16,
    fontFamily: "Times-Roman",
  },
  titleLandscape: {
    fontSize: 24,
    marginBottom: 12,
  },
  body: {
    textAlign: "center",
    color: "#274737",
    fontSize: 13,
    marginBottom: 8,
    fontFamily: "Times-Roman",
  },
  bodyLandscape: {
    marginBottom: 6,
  },
  participant: {
    textAlign: "center",
    fontSize: 28,
    color: "#0e3b24",
    marginBottom: 12,
    fontFamily: "Times-Roman",
  },
  participantLandscape: {
    fontSize: 24,
    marginBottom: 9,
  },
  details: {
    textAlign: "center",
    fontSize: 14,
    color: "#284938",
    marginBottom: 6,
    fontFamily: "Times-Roman",
  },
  verificationCode: {
    textAlign: "center",
    fontSize: 12,
    color: "#365845",
    marginBottom: 6,
    fontFamily: "Helvetica",
    letterSpacing: 0.4,
  },
  detailsLandscape: {
    fontSize: 12,
    marginBottom: 5,
  },
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  footerLandscape: {
    marginTop: 20,
  },
  legal: {
    width: "35%",
    fontSize: 10,
    color: "#365845",
    lineHeight: 1.5,
    fontFamily: "Helvetica",
  },
  legalNoSignature: {
    width: "52%",
  },
  legalLandscape: {
    width: "33%",
    fontSize: 9,
  },
  signature: {
    width: "42%",
    alignItems: "center",
    textAlign: "center",
  },
  signatureLandscape: {
    width: "44%",
  },
  signatureImage: {
    width: 170,
    height: 74,
    objectFit: "contain",
    marginBottom: 4,
  },
  signatureImageLandscape: {
    width: 180,
    height: 78,
  },
  signatureLine: {
    width: "88%",
    borderTopWidth: 1,
    borderTopColor: "#5a7a67",
    borderTopStyle: "solid",
    marginBottom: 3,
  },
  signerName: {
    fontSize: 12,
    color: "#1f4230",
    marginBottom: 2,
    fontFamily: "Times-Roman",
  },
  signerRole: {
    fontSize: 10,
    color: "#3e604d",
    fontFamily: "Helvetica",
  },
  qr: {
    width: 110,
    height: 110,
  },
  qrLandscape: {
    width: 104,
    height: 104,
  },
});

type CertificateDocumentProps = GenerateCertificatePdfOptions & {
  logoSrc: string;
  sdeamLogoSrc: string;
  signatureSrc: string;
  signerName: string;
  signerRole: string;
};

const CertificateDocument = ({
  certificate,
  qrDataUrl,
  logoSrc,
  sdeamLogoSrc,
  signatureSrc,
  signerName,
  signerRole,
  variant,
}: CertificateDocumentProps) => {
  const orientation = variant?.orientation ?? "portrait";
  const isLandscape = orientation === "landscape";
  const hideSignature = variant?.hideSignature ?? false;
  const showSdeamLogo = Boolean(variant?.includeSdeamLogo && sdeamLogoSrc);

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={[styles.frame, isLandscape ? styles.frameLandscape : null]}>
        <View>
          <View style={[styles.logosRow, isLandscape ? styles.logosRowLandscape : null]}>
            <Image style={styles.logo} src={logoSrc} />
            {showSdeamLogo ? <Image style={styles.logoPartner} src={sdeamLogoSrc} /> : null}
          </View>
          <Text style={styles.subtitle}>LIFEPLANTS</Text>
          <Text style={[styles.title, isLandscape ? styles.titleLandscape : null]}>Certificado de Participacion</Text>
          <Text style={[styles.body, isLandscape ? styles.bodyLandscape : null]}>Se certifica que</Text>
          <Text style={[styles.participant, isLandscape ? styles.participantLandscape : null]}>
            {certificate.nombreParticipante}
          </Text>
          <Text style={[styles.body, isLandscape ? styles.bodyLandscape : null]}>
            ha completado satisfactoriamente la actividad
          </Text>
          <Text style={[styles.details, isLandscape ? styles.detailsLandscape : null]}>{certificate.tipoActividad}</Text>
          <Text style={[styles.details, isLandscape ? styles.detailsLandscape : null]}>
            Fecha de emision: {formatCertificateDate(certificate.fechaEmision)}
          </Text>
          <Text style={[styles.verificationCode, isLandscape ? styles.detailsLandscape : null]}>
            Codigo de verificacion: {certificate.uuid}
          </Text>
        </View>

        <View style={[styles.footer, isLandscape ? styles.footerLandscape : null]}>
          <Text
            style={[
              styles.legal,
              hideSignature ? styles.legalNoSignature : null,
              isLandscape ? styles.legalLandscape : null,
            ]}
          >
            Este documento es valido exclusivamente si el certificado figura como activo en el verificador oficial de
            LifePlants.
          </Text>

          {!hideSignature ? (
            <View style={[styles.signature, isLandscape ? styles.signatureLandscape : null]}>
              {signatureSrc ? (
                <Image
                  style={[styles.signatureImage, isLandscape ? styles.signatureImageLandscape : null]}
                  src={signatureSrc}
                />
              ) : null}
              <View style={styles.signatureLine} />
              <Text style={styles.signerName}>{signerName}</Text>
              <Text style={styles.signerRole}>{signerRole}</Text>
            </View>
          ) : null}

          <Image style={[styles.qr, isLandscape ? styles.qrLandscape : null]} src={qrDataUrl} />
        </View>
      </View>
    </Page>
  </Document>
  );
};

const resolveAssetIfAvailable = async (assetPath: string) => {
  const isAbsoluteUrl = /^https?:\/\//i.test(assetPath);
  const url = isAbsoluteUrl ? assetPath : buildPublicAssetUrl(assetPath);
  if (!url) {
    return "";
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    return url;
  } catch {
    return "";
  }
};

export const generateCertificatePdfBlob = async (options: GenerateCertificatePdfOptions) => {
  const signer = resolveCertificateSigner(options.certificate);

  const [logoSrc, sdeamLogoSrc, signatureSrc] = await Promise.all([
    resolveAssetIfAvailable(CERTIFICATE_BRANDING.logoPath),
    resolveAssetIfAvailable(CERTIFICATE_BRANDING.sdeamLogoPath),
    resolveAssetIfAvailable(signer.signatureUrl),
  ]);

  const instance = pdf(
    <CertificateDocument
      {...options}
      logoSrc={logoSrc}
      sdeamLogoSrc={sdeamLogoSrc}
      signatureSrc={signatureSrc}
      signerName={signer.name}
      signerRole={signer.role}
    />,
  );
  return instance.toBlob();
};

export const downloadCertificatePdf = async (options: GenerateCertificatePdfOptions) => {
  const blob = await generateCertificatePdfBlob(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `certificado-${options.certificate.uuid}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
