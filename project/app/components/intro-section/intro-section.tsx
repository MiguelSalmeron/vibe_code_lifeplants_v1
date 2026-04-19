import { useScrollAnimation } from "../../hooks/use-scroll-animation";
import styles from "./intro-section.module.css";

interface IntroSectionProps {
  /**
   * Section label or category
   * @important
   */
  label: string;
  /**
   * Main title of the section
   * @important
   */
  title: string;
  /**
   * Description text
   * @important
   */
  description: string;
  /**
   * Image URL
   * @important
   * @format image-url
   */
  imageUrl: string;
  className?: string;
}

export function IntroSection({ label, title, description, imageUrl, className }: IntroSectionProps) {
  const { elementRef: imageRef, isVisible: imageVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="who-we-are" className={`${styles.section} ${className || ""}`}>
      <div className={styles.container}>
        <div
          ref={imageRef as React.RefObject<HTMLDivElement>}
          className={`${styles.mediaContainer} ${imageVisible ? styles.fadeInLeft : styles.hidden}`}
        >
          <img src={imageUrl} alt={title} className={styles.image} />
        </div>

        <div
          ref={contentRef as React.RefObject<HTMLDivElement>}
          className={`${styles.content} ${contentVisible ? styles.fadeInRight : styles.hidden}`}
        >
          <span className={styles.label}>{label}</span>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
    </section>
  );
}
