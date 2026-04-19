import { Link } from "react-router";
import { Microscope, Library, Scan, ArrowRight } from "lucide-react";
import styles from "./lab-quick-access.module.css";

export function LabQuickAccess() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Recursos</span>
          <h2 className={styles.title}>Laboratorio de Campo</h2>
          <p className={styles.description}>
            Explora nuestra colección de herramientas y biblioteca de plantas para la investigación y educación ambiental
          </p>
        </div>

        <div className={styles.grid}>
          {/* Tarjeta de Identificador de Plantas */}
          <Link to="/identificador-plantas" className={styles.card}>
            <div className={styles.iconWrapper}>
              <Scan className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>Identificador de Plantas</h3>
            <p className={styles.cardDescription}>
              Identifica plantas usando IA. Sube una foto y descubre qué planta es al instante
            </p>
            <div className={styles.cardFooter}>
              <span className={styles.linkText}>Identificar planta</span>
              <ArrowRight className={styles.arrow} />
            </div>
          </Link>

          {/* Tarjeta de Laboratorio de Campo */}
          <Link to="/laboratorio-de-campo" className={styles.card}>
            <div className={styles.iconWrapper}>
              <Microscope className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>Laboratorio de Campo</h3>
            <p className={styles.cardDescription}>
              Accede a nuestras herramientas de investigación y recursos educativos para el trabajo de campo
            </p>
            <div className={styles.cardFooter}>
              <span className={styles.linkText}>Explorar laboratorio</span>
              <ArrowRight className={styles.arrow} />
            </div>
          </Link>

          {/* Tarjeta de Biblioteca de Plantas */}
          <Link to="/biblioteca-de-plantas" className={styles.card}>
            <div className={styles.iconWrapper}>
              <Library className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>Biblioteca de Plantas</h3>
            <p className={styles.cardDescription}>
              Consulta nuestra base de datos de especies vegetales con información detallada y fotografías
            </p>
            <div className={styles.cardFooter}>
              <span className={styles.linkText}>Ver biblioteca</span>
              <ArrowRight className={styles.arrow} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
