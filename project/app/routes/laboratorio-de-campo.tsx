import type { Route } from "./+types/laboratorio-de-campo";
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { Library, Scan } from "lucide-react";
import { Link } from "react-router";
import styles from "./laboratorio-de-campo.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Laboratorio de Campo - LifePlants" },
    {
      name: "description",
      content: "Hub de herramientas de LifePlants: punto de partida para IA de identificación, biblioteca y utilidades de campo.",
    },
  ];
}

export default function LaboratorioDeCampo() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Laboratorio de Campo
            </h1>
            <p className={styles.heroDescription}>
              Este es tu punto de partida para herramientas de campo: biblioteca,
              identificador con IA y próximos módulos para conservación aplicada.
            </p>
          </div>
        </section>

        {/* Main Section Cards */}
        <section className={styles.mainSection}>
          <div className={styles.cardsGrid}>
            {/* Identificador de Plantas */}
            <Link to="/identificador-plantas" className={styles.sectionCard}>
              <div className={styles.cardIcon}>
                <Scan size={48} />
              </div>
              <h2 className={styles.cardTitle}>Identificador de Plantas</h2>
              <p className={styles.cardDescription}>
                Identifica plantas usando IA. Sube una foto y descubre qué planta es
              </p>
              <div className={styles.cardArrow}>
                →
              </div>
            </Link>

            {/* Biblioteca de Plantas */}
            <Link to="/biblioteca-de-plantas" className={styles.sectionCard}>
              <div className={styles.cardIcon}>
                <Library size={48} />
              </div>
              <h2 className={styles.cardTitle}>Biblioteca de Plantas</h2>
              <p className={styles.cardDescription}>
                Explora nuestra colección de especies nativas documentadas
              </p>
              <div className={styles.cardArrow}>
                →
              </div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
