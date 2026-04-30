import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import type { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { isAfter, isBefore, endOfDay, startOfDay } from "date-fns";
import { QRCode } from "react-qrcode-logo";
import type { CertificatePdfVariantOptions } from "../lib/certificados-pdf";

import {
  crearCertificado,
  listarCertificados,
  revocarCertificado,
  type CertificadoEstado,
  type CertificadoFirestoreDoc,
} from "../lib/certificados-store";
import {
  buildVerificationUrl,
  downloadDataUrl,
  formatCertificateDate,
  getQrDataUrlFromElement,
  resolveCertificateSigner,
} from "../lib/certificados-utils";
import {
  activarFirmante,
  crearFirmante,
  desactivarFirmante,
  listarFirmantes,
  type FirmanteDoc,
} from "../lib/firmantes-store";
import { formatFirestoreError } from "../lib/firestore-errors";
import styles from "./admin-certificados.module.css";

type AdminOutletContext = {
  user: User;
};

const DEFAULT_LIMIT = 80;

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

const parseDateInput = (value: string) => {
  const normalized = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) {
    throw new Error("La fecha no tiene un formato valido (YYYY-MM-DD).");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("La fecha no es valida.");
  }

  return parsed;
};

export default function AdminCertificados() {
  const { user } = useOutletContext<AdminOutletContext>();

  const [nombreParticipante, setNombreParticipante] = useState("");
  const [tipoActividad, setTipoActividad] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [selectedFirmanteId, setSelectedFirmanteId] = useState("");

  const [nuevoFirmanteNombre, setNuevoFirmanteNombre] = useState("");
  const [nuevoFirmanteRol, setNuevoFirmanteRol] = useState("");
  const [nuevoFirmanteFirma, setNuevoFirmanteFirma] = useState<File | null>(null);
  const [firmantes, setFirmantes] = useState<FirmanteDoc[]>([]);
  const [isSavingFirmante, setIsSavingFirmante] = useState(false);
  const [firmantesError, setFirmantesError] = useState<string | null>(null);
  const [firmantesFeedback, setFirmantesFeedback] = useState<string | null>(null);

  const [searchNombre, setSearchNombre] = useState("");
  const [searchEstado, setSearchEstado] = useState<"todos" | CertificadoEstado>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [certificados, setCertificados] = useState<CertificadoFirestoreDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfVariantsByUuid, setPdfVariantsByUuid] = useState<Record<string, PdfVariantSelection>>({});

  const qrRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const firmantesActivos = useMemo(() => firmantes.filter((firmante) => firmante.activo), [firmantes]);

  const selectedFirmante = useMemo(
    () => firmantes.find((firmante) => firmante.id === selectedFirmanteId) || null,
    [firmantes, selectedFirmanteId],
  );

  const loadFirmantes = useCallback(async () => {
    setFirmantesError(null);
    try {
      const data = await listarFirmantes();
      setFirmantes(data);

      if (!selectedFirmanteId && data.length > 0) {
        const firstActive = data.find((firmante) => firmante.activo);
        if (firstActive) {
          setSelectedFirmanteId(firstActive.id);
        }
      }
    } catch (nextError) {
      setFirmantesError(formatFirestoreError(nextError, "No se pudieron cargar los firmantes."));
    }
  }, [selectedFirmanteId]);

  const loadCertificados = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarCertificados({
        nombreParticipante: searchNombre.trim() || undefined,
        estado: searchEstado === "todos" ? undefined : searchEstado,
        limit: DEFAULT_LIMIT,
      });
      setCertificados(data);
    } catch (nextError) {
      setError(formatFirestoreError(nextError, "No se pudieron cargar los certificados."));
    } finally {
      setIsLoading(false);
    }
  }, [searchNombre, searchEstado]);

  useEffect(() => {
    void loadCertificados();
  }, [loadCertificados]);

  useEffect(() => {
    void loadFirmantes();
  }, [loadFirmantes]);

  const certificadosFiltradosPorFecha = useMemo(() => {
    const desde = fechaDesde ? startOfDay(parseDateInput(fechaDesde)) : null;
    const hasta = fechaHasta ? endOfDay(parseDateInput(fechaHasta)) : null;

    return certificados.filter((certificado) => {
      const fecha = certificado.fechaEmision.toDate();

      if (desde && isBefore(fecha, desde)) {
        return false;
      }

      if (hasta && isAfter(fecha, hasta)) {
        return false;
      }

      return true;
    });
  }, [certificados, fechaDesde, fechaHasta]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      if (!fechaEmision) {
        throw new Error("Debes seleccionar la fecha de emision.");
      }

      if (!selectedFirmante || !selectedFirmante.activo) {
        throw new Error("Debes seleccionar un firmante activo para emitir el certificado.");
      }

      const fecha = Timestamp.fromDate(parseDateInput(fechaEmision));
      const uuid = await crearCertificado({
        nombreParticipante,
        tipoActividad,
        fechaEmision: fecha,
        creadoPor: user.email || user.uid,
        firmante: {
          id: selectedFirmante.id,
          nombre: selectedFirmante.nombre,
          rol: selectedFirmante.rol,
          firmaUrl: selectedFirmante.firmaUrl,
        },
      });

      setNombreParticipante("");
      setTipoActividad("");
      setFechaEmision("");
      setFeedback(`Certificado creado correctamente: ${uuid} (Firmante: ${selectedFirmante.nombre})`);
      await loadCertificados();
    } catch (nextError) {
      setError(formatFirestoreError(nextError, "No se pudo crear el certificado."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFirmante = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingFirmante(true);
    setFirmantesError(null);
    setFirmantesFeedback(null);

    try {
      if (!nuevoFirmanteFirma) {
        throw new Error("Debes seleccionar una imagen de firma.");
      }

      const id = await crearFirmante({
        nombre: nuevoFirmanteNombre,
        rol: nuevoFirmanteRol,
        firmaFile: nuevoFirmanteFirma,
        creadoPor: user.email || user.uid,
      });

      setNuevoFirmanteNombre("");
      setNuevoFirmanteRol("");
      setNuevoFirmanteFirma(null);
      setFirmantesFeedback("Firmante creado correctamente.");
      await loadFirmantes();
      setSelectedFirmanteId(id);
    } catch (nextError) {
      setFirmantesError(formatFirestoreError(nextError, "No se pudo crear el firmante."));
    } finally {
      setIsSavingFirmante(false);
    }
  };

  const handleToggleFirmante = async (firmante: FirmanteDoc) => {
    setFirmantesError(null);
    setFirmantesFeedback(null);

    try {
      if (firmante.activo) {
        await desactivarFirmante(firmante.id);
        setFirmantesFeedback(`Firmante desactivado: ${firmante.nombre}`);
      } else {
        await activarFirmante(firmante.id);
        setFirmantesFeedback(`Firmante activado: ${firmante.nombre}`);
      }

      await loadFirmantes();
    } catch (nextError) {
      setFirmantesError(formatFirestoreError(nextError, "No se pudo actualizar el estado del firmante."));
    }
  };

  const handleRevoke = async (uuid: string) => {
    setError(null);
    setFeedback(null);

    try {
      await revocarCertificado(uuid, user.email || user.uid);
      setFeedback(`Certificado revocado: ${uuid}`);
      await loadCertificados();
    } catch (nextError) {
      setError(formatFirestoreError(nextError, "No se pudo revocar el certificado."));
    }
  };

  const handleDownloadQr = (certificate: CertificadoFirestoreDoc) => {
    const dataUrl = getQrDataUrlFromElement(qrRefs.current[certificate.uuid]);
    if (!dataUrl) {
      setError("No se pudo exportar el QR del certificado.");
      return;
    }

    downloadDataUrl(dataUrl, `certificado-${certificate.uuid}.png`);
  };

  const getPdfVariant = (uuid: string): PdfVariantSelection => {
    return pdfVariantsByUuid[uuid] || DEFAULT_PDF_VARIANT;
  };

  const updatePdfVariant = (uuid: string, partial: Partial<PdfVariantSelection>) => {
    setPdfVariantsByUuid((current) => ({
      ...current,
      [uuid]: {
        ...(current[uuid] || DEFAULT_PDF_VARIANT),
        ...partial,
      },
    }));
  };

  const handleDownloadPdf = async (certificate: CertificadoFirestoreDoc) => {
    const dataUrl = getQrDataUrlFromElement(qrRefs.current[certificate.uuid]);
    if (!dataUrl) {
      setError("No se pudo generar el QR para el PDF.");
      return;
    }

    const selectedVariant = getPdfVariant(certificate.uuid);
    const variant: CertificatePdfVariantOptions = {
      hideSignature: selectedVariant.hideSignature,
      includeSdeamLogo: selectedVariant.includeSdeamLogo,
      orientation: selectedVariant.orientation,
    };

    try {
      const { downloadCertificatePdf } = await import("../lib/certificados-pdf");
      await downloadCertificatePdf({
        certificate,
        qrDataUrl: dataUrl,
        variant,
      });
    } catch {
      setError("No se pudo generar el PDF del certificado.");
    }
  };

  return (
    <section className={styles.page}>
      <article className={styles.card}>
        <h2>Firmantes</h2>
        <form className={styles.form} onSubmit={handleCreateFirmante}>
          <label>
            Nombre del firmante
            <input
              value={nuevoFirmanteNombre}
              onChange={(event) => setNuevoFirmanteNombre(event.target.value)}
              required
            />
          </label>
          <label>
            Rol del firmante
            <input value={nuevoFirmanteRol} onChange={(event) => setNuevoFirmanteRol(event.target.value)} required />
          </label>
          <label>
            Imagen de firma (PNG, JPG, WEBP)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                setNuevoFirmanteFirma(event.target.files?.[0] || null);
              }}
              required
            />
          </label>

          <button type="submit" disabled={isSavingFirmante}>
            {isSavingFirmante ? "Guardando firmante..." : "Agregar firmante"}
          </button>
        </form>

        {firmantesFeedback && <p className={styles.feedback}>{firmantesFeedback}</p>}
        {firmantesError && <p className={styles.error}>{firmantesError}</p>}

        <div className={styles.signersList}>
          {firmantes.length === 0 && <p className={styles.info}>Aun no hay firmantes registrados.</p>}
          {firmantes.map((firmante) => (
            <div key={firmante.id} className={styles.signerItem}>
              <div className={styles.signerMain}>
                <p className={styles.signerName}>{firmante.nombre}</p>
                <p className={styles.signerRole}>{firmante.rol}</p>
                <span className={firmante.activo ? styles.statusActive : styles.statusRevoked}>
                  {firmante.activo ? "activo" : "inactivo"}
                </span>
              </div>
              <img src={firmante.firmaUrl} alt={`Firma de ${firmante.nombre}`} className={styles.signerImage} />
              <div className={styles.signerActions}>
                <button type="button" onClick={() => void handleToggleFirmante(firmante)}>
                  {firmante.activo ? "Desactivar" : "Activar"}
                </button>
                <button type="button" onClick={() => setSelectedFirmanteId(firmante.id)}>
                  Usar para emitir
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className={styles.card}>
        <h2>Emitir certificado</h2>
        <form className={styles.form} onSubmit={handleCreate}>
          <label>
            Nombre del participante
            <input
              value={nombreParticipante}
              onChange={(event) => setNombreParticipante(event.target.value)}
              required
            />
          </label>
          <label>
            Tipo de actividad
            <input value={tipoActividad} onChange={(event) => setTipoActividad(event.target.value)} required />
          </label>
          <label>
            Fecha de emision
            <input type="date" value={fechaEmision} onChange={(event) => setFechaEmision(event.target.value)} required />
          </label>
          <label>
            Firmante
            <select
              value={selectedFirmanteId}
              onChange={(event) => setSelectedFirmanteId(event.target.value)}
              required
              disabled={firmantesActivos.length === 0}
            >
              <option value="">Selecciona un firmante activo</option>
              {firmantesActivos.map((firmante) => (
                <option key={firmante.id} value={firmante.id}>
                  {firmante.nombre} - {firmante.rol}
                </option>
              ))}
            </select>
          </label>

          {firmantesActivos.length === 0 && (
            <p className={styles.info}>Primero crea al menos un firmante activo para emitir certificados.</p>
          )}

          {selectedFirmante && (
            <div className={styles.signerPreview}>
              <img src={selectedFirmante.firmaUrl} alt={`Firma de ${selectedFirmante.nombre}`} className={styles.signatureImage} />
              <p className={styles.signatureLine}>
                {selectedFirmante.nombre} - {selectedFirmante.rol}
              </p>
            </div>
          )}

          <button type="submit" disabled={isSaving || firmantesActivos.length === 0}>
            {isSaving ? "Generando..." : "Generar certificado"}
          </button>
        </form>
        {feedback && <p className={styles.feedback}>{feedback}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </article>

      <article className={styles.card}>
        <h2>Certificados emitidos</h2>
        <div className={styles.filters}>
          <label>
            Buscar por nombre
            <input value={searchNombre} onChange={(event) => setSearchNombre(event.target.value)} />
          </label>
          <label>
            Estado
            <select value={searchEstado} onChange={(event) => setSearchEstado(event.target.value as "todos" | CertificadoEstado)}>
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="revocado">Revocado</option>
            </select>
          </label>
          <label>
            Fecha desde
            <input type="date" value={fechaDesde} onChange={(event) => setFechaDesde(event.target.value)} />
          </label>
          <label>
            Fecha hasta
            <input type="date" value={fechaHasta} onChange={(event) => setFechaHasta(event.target.value)} />
          </label>
          <button type="button" onClick={() => void loadCertificados()}>
            Actualizar
          </button>
        </div>

        {isLoading && <p className={styles.info}>Cargando certificados...</p>}
        {!isLoading && certificadosFiltradosPorFecha.length === 0 && (
          <p className={styles.info}>No hay certificados para los filtros seleccionados.</p>
        )}

        <div className={styles.list}>
          {certificadosFiltradosPorFecha.map((certificate) => (
            <div key={certificate.uuid} className={styles.item}>
              <div className={styles.itemMain}>
                {(() => {
                  const signer = resolveCertificateSigner(certificate);

                  return (
                    <>
                <h3>{certificate.nombreParticipante}</h3>
                <p>{certificate.tipoActividad}</p>
                <p>{formatCertificateDate(certificate.fechaEmision)}</p>
                <p className={styles.code}>{certificate.uuid}</p>
                <span className={certificate.estado === "activo" ? styles.statusActive : styles.statusRevoked}>
                  {certificate.estado}
                </span>

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
                    </>
                  );
                })()}
              </div>

              <div className={styles.itemQr} ref={(node) => {
                qrRefs.current[certificate.uuid] = node;
              }}>
                <QRCode
                  value={buildVerificationUrl(certificate.uuid)}
                  size={124}
                  ecLevel="M"
                  logoImage="/logo.jpg"
                  removeQrCodeBehindLogo={false}
                  logoWidth={14}
                  logoHeight={14}
                  quietZone={10}
                />
              </div>

              <div className={styles.itemActions}>
                <div className={styles.pdfVariantControls}>
                  <label className={styles.pdfOption}>
                    <input
                      type="checkbox"
                      checked={getPdfVariant(certificate.uuid).hideSignature}
                      onChange={(event) => {
                        updatePdfVariant(certificate.uuid, {
                          hideSignature: event.target.checked,
                        });
                      }}
                    />
                    Sin firma
                  </label>

                  <label className={styles.pdfOption}>
                    <input
                      type="checkbox"
                      checked={getPdfVariant(certificate.uuid).includeSdeamLogo}
                      onChange={(event) => {
                        updatePdfVariant(certificate.uuid, {
                          includeSdeamLogo: event.target.checked,
                        });
                      }}
                    />
                    Incluir logo SDEAM
                  </label>

                  <label className={styles.pdfOption}>
                    Orientacion
                    <select
                      value={getPdfVariant(certificate.uuid).orientation}
                      onChange={(event) => {
                        updatePdfVariant(certificate.uuid, {
                          orientation: event.target.value as "portrait" | "landscape",
                        });
                      }}
                    >
                      <option value="portrait">Vertical</option>
                      <option value="landscape">Horizontal</option>
                    </select>
                  </label>
                </div>

                <button type="button" onClick={() => handleDownloadQr(certificate)}>
                  Descargar QR PNG
                </button>
                <button type="button" onClick={() => void handleDownloadPdf(certificate)}>
                  Descargar PDF
                </button>
                <a href={buildVerificationUrl(certificate.uuid)} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  Verificar
                </a>
                <button
                  type="button"
                  disabled={certificate.estado === "revocado"}
                  onClick={() => void handleRevoke(certificate.uuid)}
                >
                  {certificate.estado === "revocado" ? "Ya revocado" : "Revocar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
