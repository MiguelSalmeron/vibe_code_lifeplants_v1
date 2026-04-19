import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./header.module.css";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsNavOpen(false);
    document.body.style.overflow = "";
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  const closeMenu = () => {
    setIsNavOpen(false);
  };

  return (
    <>
      <div className={`${styles.overlay} ${isNavOpen ? styles.navOpen : ""}`} onClick={closeMenu} aria-hidden="true" />
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""} ${className || ""}`}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <img src="/logo.jpg" alt="LifePlants Logo" className={styles.logoImage} />
            <span>LifePlants</span>
          </Link>

          <nav className={`${styles.nav} ${isNavOpen ? styles.navOpen : ""}`}>
            <ul className={styles.navLinks}>
              <li>
                <Link to="/laboratorio" className={styles.navLink} onClick={closeMenu}>
                  Laboratorio de Campo
                </Link>
              </li>
              <li>
                <Link to="/#what-we-do" className={styles.navLink} onClick={closeMenu}>
                  Qué Hacemos
                </Link>
              </li>
              <li>
                <Link to="/#who-we-are" className={styles.navLink} onClick={closeMenu}>
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link to="/eventos" className={styles.navLink} onClick={closeMenu}>
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/ia" className={styles.navLink} onClick={closeMenu}>
                  RAIZ IA
                </Link>
              </li>
              <li>
                <Link to="/#get-involved" className={styles.navLink} onClick={closeMenu}>
                  Involúcrate
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <a
              href="https://hcb.hackclub.com/donations/start/lifeplants"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donateButton}
              onClick={closeMenu}
            >
              Donar
            </a>
            <button
              className={styles.mobileMenuButton}
              aria-label={isNavOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isNavOpen}
              onClick={() => setIsNavOpen((current) => !current)}
            >
              {isNavOpen ? <X className={styles.menuIcon} /> : <Menu className={styles.menuIcon} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
