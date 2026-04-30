import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { QRCode } from "react-qrcode-logo";
import type { CertificatePdfVariantOptions } from "../lib/certificados-pdf";

import type { CertificadoFirestoreDoc } from "../lib/certificados-store";
import { isValidUuidV4, obtenerCertificado } from "../lib/certificados-store";
import {
  buildLinkedInCertificationUrl,
  buildVerificationUrl,
  formatCertificateDate,
  getQrDataUrlFromElement,
  resolveCertificateSigner,
} from "../lib/certificados-utils";
import { formatFirestoreError } from "../lib/firestore-errors";
import styles from "./verificar.module.css";

const VERIFY_DEBOUNCE_MS = 300;
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

type PdfVariantSelection = {
  hideSignature: boolean;
  includeSdeamLogo: boolean;
  orientation: "portrait" | "landscape";
};

const DEFAULT_PDF_VARIANT: PdfVariantSelection = {
  hideSignature: false,
  includeSdeamLogo: false,
  orientation: "portrait",
};

export default function VerificarCertificado() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [queryId, setQueryId] = useState(initialId);
  const [certificate, setCertificate] = useState<CertificadoFirestoreDoc | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pdfVariant, setPdfVariant] = useState<PdfVariantSelection>(DEFAULT_PDF_VARIANT);

  const debounceRef = useRef<number | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const attemptsRef = useRef<number[]>([]);

  const isBlocked = blockedUntil !== null && Date.now() < blockedUntil;

  useEffect(() => {
    if (!blockedUntil) {
      return;
    }

    const remainingMs = blockedUntil - Date.now();
    if (remainingMs <= 0) {
      setBlockedUntil(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setBlockedUntil(null);
      setError(null);
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, [blockedUntil]);

  const runVerification = async (uuid: string) => {
    const normalizedUuid = uuid.trim();

    if (!normalizedUuid) {
      setError("Ingresa un ID de certificado para verificar.");
      setCertificate(null);
      return;
    }

    if (!isValidUuidV4(normalizedUuid)) {
      setError("El formato del ID no es valido. Debe ser un UUID v4.");
      setCertificate(null);
      return;
    }

    const now = Date.now();
    const recentAttempts = attemptsRef.current.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (recentAttempts.length >= MAX_REQUESTS_PER_MINUTE) {
      setBlockedUntil(now + RATE_LIMIT_WINDOW_MS);
      setError("Demasiadas consultas, intenta mas tarde.");
      return;
    }

    const nextAttempts = [...recentAttempts, now];
    attemptsRef.current = nextAttempts;
    setAttempts(nextAttempts);
    setSearchParams({ id: normalizedUuid });
    setIsLoading(true);
    setError(null);
    setQrDataUrl(null);

    try {
      const result = await obtenerCertificado(normalizedUuid);

      if (!result) {
        setCertificate(null);
        setError("Certificado no encontrado.");
        return;
      }

      setCertificate(result);
    } catch (nextError) {
      setCertificate(null);
      setError(formatFirestoreError(nextError, "No se pudo verificar el certificado."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (uuid: string) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      void runVerification(uuid);
    }, VERIFY_DEBOUNCE_MS);
  };

  useEffect(() => {
    if (!initialId) {
      return;
    }

    handleVerify(initialId);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    attemptsRef.current = attempts;
  }, [attempts]);

  useEffect(() => {
    if (!certificate || certificate.estado !== "activo") {
      setQrDataUrl(null);
      return;
    }

    const timer = window.setTimeout(() => {
      const nextDataUrl = getQrDataUrlFromElement(qrContainerRef.current);
      setQrDataUrl(nextDataUrl);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [certificate]);

  useEffect(() => {
    setPdfVariant(DEFAULT_PDF_VARIANT);
  }, [certificate?.uuid]);

  const linkedInUrl = useMemo(() => {
    if (!certificate || certificate.estado !== "activo") {
      return null;
    }
    return buildLinkedInCertificationUrl(certificate);
  }, [certificate]);

  const canShowActions = certificate?.estado === "activo";
  const isNotFoundError = error === "Certificado no encontrado.";
  const signer = resolveCertificateSigner(certificate);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Verificacion de certificado</h1>
        <p>Escanea el QR o ingresa el codigo UUID para validar autenticidad.</p>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (!isBlocked) {
              handleVerify(queryId);
            }
          }}
        >
          <label>
            ID del certificado
            <input
              value={queryId}
              onChange={(event) => setQueryId(event.target.value)}
              placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
              disabled={isBlocked}
            />
          </label>
          <button type="submit" disabled={isBlocked || isLoading}>
            {isBlocked ? "Bloqueado temporalmente" : isLoading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        {isLoading && (
          <div className={styles.loading} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <p className={styles.info}>Consultando certificado...</p>
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {isNotFoundError && (
          <p className={styles.info}>Si necesitas ayuda, escribe a contacto@lifeplants.org con el UUID recibido.</p>
        )}

        {certificate && (
          <article className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <h2>{certificate.estado === "activo" ? "Certificado valido" : "Certificado revocado"}</h2>
              <span className={certificate.estado === "activo" ? styles.statusActive : styles.statusRevoked}>
                {certificate.estado}
              </span>
            </div>

            <dl className={styles.details}>
              <div>
                <dt>Participante</dt>
                <dd>{certificate.nombreParticipante}</dd>
              </div>
              <div>
                <dt>Actividad</dt>
                <dd>{certificate.tipoActividad}</dd>
              </div>
              <div>
                <dt>Fecha de emision</dt>
                <dd>{formatCertificateDate(certificate.fechaEmision)}</dd>
              </div>
              <div>
                <dt>UUID</dt>
                <dd>{certificate.uuid}</dd>
              </div>
            </dl>

            <div className={styles.signatureBlock}>
              <img
                src={signer.signatureUrl}
                alt="Firma institucional"
                className={styles.signatureImage}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <p className={styles.signatureLine}>{signer.line}</p>
            </div>

            {certificate.estado === "revocado" && (
              <p className={styles.warning}>Este certificado fue revocado y ya no es valido para acreditacion.</p>
            )}

            {canShowActions && (
              <div className={styles.actions}>
                <div ref={qrContainerRef} className={styles.qrPreview}>
                  <QRCode
                    value={buildVerificationUrl(certificate.uuid)}
                    size={176}
                    ecLevel="M"
                    logoImage="/logo.jpg"
                    removeQrCodeBehindLogo={false}
                    logoWidth={20}
                    logoHeight={20}
                    quietZone={12}
                  />
                </div>
                <div className={styles.actionButtons}>
                  <div className={styles.pdfVariantControls}>
                    <label className={styles.pdfOption}>
                      <input
                        type="checkbox"
                        checked={pdfVariant.hideSignature}
                        onChange={(event) => {
                          setPdfVariant((current) => ({
                            ...current,
                            hideSignature: event.target.checked,
                          }));
                        }}
                      />
                      Sin firma
                    </label>

                    <label className={styles.pdfOption}>
                      <input
                        type="checkbox"
                        checked={pdfVariant.includeSdeamLogo}
                        onChange={(event) => {
                          setPdfVariant((current) => ({
                            ...current,
                            includeSdeamLogo: event.target.checked,
                          }));
                        }}
                      />
                      Incluir logo SDEAM
                    </label>

                    <label className={styles.pdfOption}>
                      Orientacion
                      <select
                        value={pdfVariant.orientation}
                        onChange={(event) => {
                          setPdfVariant((current) => ({
                            ...current,
                            orientation: event.target.value as "portrait" | "landscape",
                          }));
                        }}
                      >
                        <option value="portrait">Vertical</option>
                        <option value="landscape">Horizontal</option>
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!qrDataUrl) {
                        setError("No se pudo generar el QR para PDF.");
                        return;
                      }

                      try {
                        const { downloadCertificatePdf } = await import("../lib/certificados-pdf");
                        const variant: CertificatePdfVariantOptions = {
                          hideSignature: pdfVariant.hideSignature,
                          includeSdeamLogo: pdfVariant.includeSdeamLogo,
                          orientation: pdfVariant.orientation,
                        };

                        await downloadCertificatePdf({
                          certificate,
                          qrDataUrl,
                          variant,
                        });
                      } catch {
                        setError("No se pudo generar el PDF del certificado.");
                      }
                    }}
                  >
                    Descargar Certificado PDF
                  </button>
                  {linkedInUrl && (
                    <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className={styles.linkAction}>
                      Agregar a LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </article>
        )}

        {!certificate && !error && !isLoading && <p className={styles.info}>Ingresa un UUID para iniciar la verificacion.</p>}
      </section>
    </main>
  );
}
