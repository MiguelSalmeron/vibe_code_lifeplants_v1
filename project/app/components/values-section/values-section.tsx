import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./values-section.module.css";

interface ValuesSectionProps {
  className?: string;
}

export function ValuesSection({ className }: ValuesSectionProps) {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: valuesRef, isVisible: valuesVisible } = useScrollAnimation({ threshold: 0.1 });

  const values = [
    {
      title: "Transparencia",
      description: "Buscamos honestidad. Operamos bajo el principio de 'Cuentas Claras' con reportes financieros y métricas de impacto públicos.",
    },
    {
      title: "Open Source",
      description: "El conocimiento se comparte. Nos comprometemos a licenciar y compartir públicamente el conocimiento que generamos.",
    },
    {
      title: "Impacto Tangible",
      description: "Resultados medibles sobre teoría pura. Priorizamos la entrega de soluciones prácticas y demostrables.",
    },
  ];

  return (
    <section className={`${styles.section} ${className || ""}`}>
      <div className={styles.container}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`${styles.header} ${headerVisible ? styles.fadeInUp : styles.hidden}`}
        >
          <span className={styles.label}>Nuestros Principios</span>
          <h2 className={styles.title}>Valores Inquebrantables</h2>
        </div>

        <div
          ref={valuesRef as React.RefObject<HTMLDivElement>}
          className={`${styles.values} ${valuesVisible ? styles.fadeInStagger : styles.hidden}`}
        >
          {values.map((value, index) => (
            <div key={index} className={styles.valueCard} style={{ animationDelay: `${index * 0.15}s` }}>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueDescription}>{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
