import type { LucideIcon } from "lucide-react";
import { InvolvementCard } from "../involvement-card/involvement-card";
import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./involvement-section.module.css";

export interface InvolvementOption {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  buttonUrl?: string;
  isPrimary?: boolean;
}

interface InvolvementSectionProps {
  /**
   * Section title
   * @important
   */
  title: string;
  /**
   * List of involvement options
   */
  options: InvolvementOption[];
  className?: string;
}

export function InvolvementSection({ title, options, className }: InvolvementSectionProps) {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="get-involved" className={`${styles.section} ${className || ""}`}>
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
          {options.map((option, index) => (
            <div
              key={option.id}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <InvolvementCard {...option} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
