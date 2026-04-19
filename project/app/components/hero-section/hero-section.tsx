import { ChevronDown } from "lucide-react";
import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./hero-section.module.css";

interface HeroSectionProps {
  /**
   * The main title displayed in the hero section
   * @important
   */
  title: string;
  /**
   * The subtitle or description text
   * @important
   */
  subtitle: string;
  /**
   * Optional motto text
   */
  motto?: string;
  /**
   * Background image URL
   * @important
   * @format image-url
   */
  backgroundImage: string;
  className?: string;
}

export function HeroSection({ title, subtitle, motto, backgroundImage, className }: HeroSectionProps) {
  const { elementRef: mottoRef, isVisible: mottoVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: subtitleRef, isVisible: subtitleVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className={`${styles.hero} ${className || ""}`}>
      <div className={styles.background}>
        <img src={backgroundImage} alt="" className={styles.backgroundImage} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        {motto && (
          <p
            ref={mottoRef as React.RefObject<HTMLParagraphElement>}
            className={`${styles.motto} ${mottoVisible ? styles.fadeInUp : styles.hidden}`}
          >
            {motto}
          </p>
        )}
        <h1
          ref={titleRef as React.RefObject<HTMLHeadingElement>}
          className={`${styles.title} ${titleVisible ? styles.fadeInUp : styles.hidden}`}
          style={{ animationDelay: "0.2s" }}
        >
          {title}
        </h1>
        <p
          ref={subtitleRef as React.RefObject<HTMLParagraphElement>}
          className={`${styles.subtitle} ${subtitleVisible ? styles.fadeInUp : styles.hidden}`}
          style={{ animationDelay: "0.4s" }}
        >
          {subtitle}
        </p>
      </div>

      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>Explorar</span>
        <ChevronDown className={styles.scrollIcon} />
      </div>
    </section>
  );
}
