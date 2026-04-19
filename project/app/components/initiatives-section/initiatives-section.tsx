import { InitiativeCard } from "../initiative-card/initiative-card";
import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./initiatives-section.module.css";

export interface Initiative {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
}

interface InitiativesSectionProps {
  /**
   * Section title
   * @important
   */
  title: string;
  /**
   * List of initiatives to display
   */
  initiatives: Initiative[];
  className?: string;
}

export function InitiativesSection({ title, initiatives, className }: InitiativesSectionProps) {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="what-we-do" className={`${styles.section} ${className || ""}`}>
      <div className={styles.container}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`${styles.header} ${headerVisible ? styles.fadeInUp : styles.hidden}`}
        >
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className={`${styles.grid} ${gridVisible ? styles.fadeInStagger : styles.hidden}`}
        >
          {initiatives.map((initiative, index) => (
            <div
              key={initiative.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <InitiativeCard {...initiative} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
