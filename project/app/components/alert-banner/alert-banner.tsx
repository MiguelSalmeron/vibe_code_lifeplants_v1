import styles from "./alert-banner.module.css";

interface AlertBannerProps {
  /**
   * The message to display in the banner
   * @important
   */
  message: string;
  /**
   * Optional link URL
   * @format url
   */
  linkUrl?: string;
  /**
   * Optional link text
   */
  linkText?: string;
  className?: string;
}

export function AlertBanner({ message, linkUrl, linkText, className }: AlertBannerProps) {
  return (
    <div className={`${styles.banner} ${className || ""}`}>
      {message}{" "}
      {linkUrl && linkText && (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          {linkText}
        </a>
      )}
    </div>
  );
}
