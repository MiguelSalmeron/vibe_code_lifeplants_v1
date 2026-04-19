import { Target, Eye } from "lucide-react";
import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./mission-vision-section.module.css";

interface MissionVisionSectionProps {
  className?: string;
}

export function MissionVisionSection({ className }: MissionVisionSectionProps) {
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className={`${styles.section} ${className || ""}`}>
      <div className={styles.container}>
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className={`${styles.grid} ${gridVisible ? styles.fadeInStagger : styles.hidden}`}
        >
          <div className={styles.card} style={{ animationDelay: "0s" }}>
            <Target className={styles.icon} />
            <h2 className={styles.title}>Misión</h2>
            <p className={styles.description}>
              Desarrollar e integrar soluciones tecnológicas innovadoras que reduzcan el impacto
              ambiental, promuevan el uso responsable de los recursos naturales y contribuyan a un
              desarrollo sostenible, demostrando que el progreso tecnológico puede y debe ir de la
              mano con el cuidado del planeta.
            </p>
          </div>

          <div className={styles.card} style={{ animationDelay: "0.2s" }}>
            <Eye className={styles.icon} />
            <h2 className={styles.title}>Visión</h2>
            <p className={styles.description}>
              Buscamos llegar a cada espacio del país y una expansión internacional a regiones como
              Centroamérica o cualquier parte del mundo impactando a miles de estudiantes y
              personas alrededor de todo el mundo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
