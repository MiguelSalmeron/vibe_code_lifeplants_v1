import type { Route } from "./+types/biblioteca-de-plantas";
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { Search, Filter, Leaf } from "lucide-react";
import styles from "./biblioteca-de-plantas.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Biblioteca de Plantas - LifePlants" },
    {
      name: "description",
      content: "Explora nuestra colección de especies nativas documentadas.",
    },
  ];
}

export default function BibliotecaDePlantas() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Biblioteca de Plantas
            </h1>
            <p className={styles.heroDescription}>
              Explora nuestra colección de especies nativas documentadas
            </p>
          </div>
        </section>

        {/* Library Content */}
        <section className={styles.librarySection}>
          <div className={styles.libraryHeader}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Buscar plantas por nombre, familia o características..."
                className={styles.searchInput}
              />
            </div>
            <button className={styles.filterButton}>
              <Filter size={20} />
              <span>Filtros</span>
            </button>
          </div>

          {/* Empty State */}
          <div className={styles.emptyState}>
            <Leaf className={styles.emptyIcon} size={80} />
            <h2 className={styles.emptyTitle}>Biblioteca en Construcción</h2>
            <p className={styles.emptyDescription}>
              Pronto podrás explorar nuestra colección de plantas nativas.
              Esta sección estará disponible cuando se implemente el sistema de administración.
            </p>
            <div className={styles.comingSoonBadge}>Próximamente</div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
