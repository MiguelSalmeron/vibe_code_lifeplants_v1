import type { LucideIcon } from "lucide-react";
import styles from "./involvement-card.module.css";
import classNames from "classnames";

interface InvolvementCardProps {
  /**
   * Title of the involvement option
   * @important
   */
  title: string;
  /**
   * Description text
   * @important
   */
  description: string;
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;
  /**
   * Button text
   * @important
   */
  buttonText: string;
  /**
   * Button link URL
   * @format url
   */
  buttonUrl?: string;
  /**
   * Whether this is a primary action (uses orange color)
   */
  isPrimary?: boolean;
  className?: string;
}

export function InvolvementCard({
  title,
  description,
  icon: Icon,
  buttonText,
  buttonUrl = "#",
  isPrimary = false,
  className,
}: InvolvementCardProps) {
  const isExternalLink = buttonUrl.startsWith("http");
  
  return (
    <article className={`${styles.card} ${className || ""}`}>
      <div className={styles.iconContainer}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a 
          href={buttonUrl} 
          className={classNames(styles.button, { [styles.buttonPrimary]: isPrimary })}
          {...(isExternalLink && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {buttonText}
        </a>
      </div>
    </article>
  );
}
