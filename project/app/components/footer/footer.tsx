import { Link } from "react-router";
import { Instagram, Linkedin, MessageCircle, Heart } from "lucide-react";
import styles from "./footer.module.css";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Link to="/" className={styles.footerLogo}>
            <img src="/logo.jpg" alt="LifePlants Logo" className={styles.footerLogoImage} />
            <span className={styles.footerLogoText}>LifePlants</span>
          </Link>
          <p className={styles.tagline}>Conservación y educación ambiental para un futuro sostenible</p>
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h3>NAVEGACIÓN</h3>
            <ul className={styles.links}>
              <li>
                <Link to="/" className={styles.link}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/laboratorio" className={styles.link}>
                  Laboratorio de Campo
                </Link>
              </li>
              <li>
                <Link to="/biblioteca-de-plantas" className={styles.link}>
                  Biblioteca de Plantas
                </Link>
              </li>
              <li>
                <Link to="/ia" className={styles.link}>
                  IA de Campo
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>INFORMACIÓN</h3>
            <p className={styles.infoText}>Versión actual: V5.0</p>
            <p className={styles.infoText}>Fecha de desarrollo: 03/04/2026</p>
            <a href="#site-info" className={styles.infoButton}>
              Información de la página
            </a>
          </div>

          <div className={styles.column}>
            <h3>APÓYANOS</h3>
            <p className={styles.infoText}>
              Tu donación nos ayuda a continuar con nuestra misión de conservación y educación ambiental.
            </p>
            <a 
              href="https://hcb.hackclub.com/donations/start/lifeplants"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateLink}
            >
              <Heart className={styles.heartIcon} />
              Hacer una Donación
            </a>
          </div>

          <div className={styles.column}>
            <h3>SÍGUENOS</h3>
            <div className={styles.socialIcons}>
              <a
                href="https://www.instagram.com/lifeplants_org/"
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className={styles.socialIcon} />
              </a>
              <a
                href="https://chat.whatsapp.com/CftbqRirziCDAE9VfHHVEF"
                className={styles.socialLink}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className={styles.socialIcon} />
              </a>
              <a
                href="https://www.linkedin.com/company/lifeplants/?viewAsMember=true"
                className={styles.socialLink}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className={styles.socialIcon} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>© 2026 LifePlants. Todos los derechos reservados.</p>
          <p className={styles.attribution}>Desarrollado con pasión para el mundo 🌱</p>
        </div>
      </div>
    </footer>
  );
}
