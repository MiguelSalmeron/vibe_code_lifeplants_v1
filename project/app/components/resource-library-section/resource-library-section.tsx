import { Link } from "react-router";
import { BookOpen, Search, Database, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./resource-library-section.module.css";

interface ResourceLibrarySectionProps {
  className?: string;
}

export function ResourceLibrarySection({ className }: ResourceLibrarySectionProps) {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });
  const { elementRef: ctaRef, isVisible: ctaVisible } = useScrollAnimation({ threshold: 0.2 });

  const features = [
    {
      icon: Database,
      title: "Biblioteca de Plantas",
      description:
        "Accede a información detallada sobre miles de especies vegetales, sus características y beneficios ambientales.",
    },
    {
      icon: Search,
      title: "Identificación de Especies",
      description:
        "Herramientas para identificar plantas y comprender sus necesidades de conservación y cuidado.",
    },
    {
      icon: BookOpen,
      title: "Recursos Educativos",
      description:
        "Materiales sobre problemáticas ambientales, soluciones tecnológicas y prácticas de sostenibilidad.",
    },
  ];

  return (
    <section id="resource-library" className={`${styles.section} ${className || ""}`}>
      <div className={styles.container}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`${styles.header} ${headerVisible ? styles.fadeInUp : styles.hidden}`}
        >
          <span className={styles.label}>Herramientas</span>
          <h2 className={styles.title}>Biblioteca de Recursos</h2>
          <p className={styles.description}>
            Ofrecemos herramientas como una biblioteca de recursos con información sobre plantas,
            problemáticas ambientales y soluciones tecnológicas para convertir la frustración
            climática en innovación tangible.
          </p>
        </div>

        <div
          ref={contentRef as React.RefObject<HTMLDivElement>}
          className={`${styles.content} ${contentVisible ? styles.fadeInStagger : styles.hidden}`}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={styles.feature} style={{ animationDelay: `${index * 0.15}s` }}>
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className={`${styles.cta} ${ctaVisible ? styles.fadeInUp : styles.hidden}`}
        >
          <Link to="/explorar-plantas" className={styles.ctaButton}>
            Explorar Biblioteca
            <ArrowRight className={styles.ctaIcon} />
          </Link>
        </div>
      </div>
    </section>
  );
}
