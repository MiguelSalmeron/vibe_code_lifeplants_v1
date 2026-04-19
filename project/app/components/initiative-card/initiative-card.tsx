import { ArrowRight } from "lucide-react";
import styles from "./initiative-card.module.css";

interface InitiativeCardProps {
  /**
   * Title of the initiative
   * @important
   */
  title: string;
  /**
   * Description of the initiative
   * @important
   */
  description: string;
  /**
   * Image URL for the card
   * @important
   * @format image-url
   */
  imageUrl: string;
  /**
   * Link URL for more information
   * @format url
   */
  linkUrl?: string;
  className?: string;
}

export function InitiativeCard({ title, description, imageUrl, linkUrl = "#", className }: InitiativeCardProps) {
  return (
    <article className={`${styles.card} ${className || ""}`}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={linkUrl} className={styles.link}>
          Más información
          <ArrowRight className={styles.linkIcon} />
        </a>
      </div>
    </article>
  );
}
