import type { Route } from "./+types/eventos";
import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Clock, Users, ChevronRight, Filter } from "lucide-react";
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { Button } from "../components/ui/button/button";
import { Badge } from "../components/ui/badge/badge";
import { upcomingEvents, pastEvents } from "../data/events";
import type { Event } from "../types/event";
import { splitEventsByVigency } from "../types/event";
import { subscribeAllEvents } from "../lib/events-store";
import { isFirebaseConfigured } from "../lib/firebase";
import { formatFirestoreError } from "../lib/firestore-errors";
import styles from "./eventos.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Eventos - LifePlants" },
    {
      name: "description",
      content:
        "Participa en nuestros talleres, jornadas de limpieza y eventos educativos. Únete a la comunidad LifePlants y haz la diferencia.",
    },
  ];
}

type FilterCategory = "todos" | "taller" | "limpieza" | "educativo" | "voluntariado";

export default function Eventos() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("todos");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [events, setEvents] = useState<Event[]>([...upcomingEvents, ...pastEvents]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    setIsLoadingEvents(true);
    const unsubscribe = subscribeAllEvents(
      (nextEvents) => {
        setEvents(nextEvents);
        setEventsError(null);
        setIsLoadingEvents(false);
      },
      (error) => {
        setEventsError(formatFirestoreError(error, "No se pudieron cargar los eventos en tiempo real. Mostrando respaldo local."));
        setIsLoadingEvents(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const { upcoming: upcomingFromSource, past: pastFromSource } = useMemo(() => splitEventsByVigency(events), [events]);

  const filteredEvents =
    activeFilter === "todos"
      ? upcomingFromSource
      : upcomingFromSource.filter((event) => event.category === activeFilter);

  const categoryLabels: Record<Event["category"], string> = {
    taller: "Taller",
    limpieza: "Limpieza",
    educativo: "Educativo",
    voluntariado: "Voluntariado",
  };

  const difficultyLabels: Record<NonNullable<Event["difficulty"]>, string> = {
    fácil: "Fácil",
    moderado: "Moderado",
    avanzado: "Avanzado",
  };

  const formatDate = (dateString: string) => {
    // Si la fecha ya está formateada (como "Feb 28 - Mar 1, 2026"), devolverla tal cual
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // De lo contrario, formatear la fecha ISO
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvailableSpots = (event: Event) => {
    if (!event.capacity || !event.registered) return null;
    return event.capacity - event.registered;
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Eventos de LifePlants</h1>
            <p className={styles.heroSubtitle}>
              Participa en talleres, jornadas de limpieza y actividades educativas. <br />
              Juntos construimos una comunidad más verde y sostenible.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className={styles.filterSection}>
          <div className={styles.container}>
            <div className={styles.filterHeader}>
              <Filter className={styles.filterIcon} />
              <h2 className={styles.filterTitle}>Filtrar por categoría</h2>
            </div>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${activeFilter === "todos" ? styles.active : ""}`}
                onClick={() => setActiveFilter("todos")}
              >
                Todos
              </button>
              <button
                className={`${styles.filterButton} ${activeFilter === "taller" ? styles.active : ""}`}
                onClick={() => setActiveFilter("taller")}
              >
                Talleres
              </button>
              <button
                className={`${styles.filterButton} ${activeFilter === "limpieza" ? styles.active : ""}`}
                onClick={() => setActiveFilter("limpieza")}
              >
                Limpieza
              </button>
              <button
                className={`${styles.filterButton} ${activeFilter === "educativo" ? styles.active : ""}`}
                onClick={() => setActiveFilter("educativo")}
              >
                Educativos
              </button>
              <button
                className={`${styles.filterButton} ${activeFilter === "voluntariado" ? styles.active : ""}`}
                onClick={() => setActiveFilter("voluntariado")}
              >
                Voluntariado
              </button>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className={styles.eventsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Próximos Eventos</h2>
            {eventsError && (
              <p className={styles.noEventsText} role="status">
                {eventsError}
              </p>
            )}
            {eventsError && (
              <p className={styles.errorDetails}>
                Si ves permission-denied, revisa reglas y autenticación. Si ves failed-precondition, falta un índice o la consulta debe simplificarse.
              </p>
            )}
            <div className={styles.eventsGrid}>
              {filteredEvents.map((event) => {
                const availableSpots = getAvailableSpots(event);
                const spotsPercentage = event.capacity && event.registered
                  ? (event.registered / event.capacity) * 100
                  : 0;

                return (
                  <article key={event.id} className={styles.eventCard}>
                    <div className={styles.eventImageWrapper}>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className={styles.eventImage}
                      />
                      <div className={styles.eventBadges}>
                        <Badge variant="secondary" className={styles.categoryBadge}>
                          {categoryLabels[event.category]}
                        </Badge>
                        {event.difficulty && (
                          <Badge variant="outline" className={styles.difficultyBadge}>
                            {difficultyLabels[event.difficulty]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={styles.eventContent}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <div className={styles.eventMeta}>
                        <div className={styles.metaItem}>
                          <Calendar className={styles.metaIcon} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock className={styles.metaIcon} />
                          <span>{event.time}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <MapPin className={styles.metaIcon} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <p className={styles.eventDescription}>{event.description}</p>
                      {availableSpots !== null && (
                        <div className={styles.capacitySection}>
                          <div className={styles.capacityInfo}>
                            <Users className={styles.capacityIcon} />
                            <span className={styles.capacityText}>
                              {availableSpots > 0
                                ? `${availableSpots} cupos disponibles`
                                : "¡Cupos llenos!"}
                            </span>
                          </div>
                          <div className={styles.capacityBar}>
                            <div
                              className={styles.capacityFill}
                              style={{ width: `${spotsPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {event.registrationUrl ? (
                        <Button
                          className={styles.registerButton}
                          disabled={availableSpots === 0}
                          asChild
                        >
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {availableSpots === 0 ? "Inscripciones cerradas" : "Inscribirse"}
                            {availableSpots !== 0 && <ChevronRight className={styles.buttonIcon} />}
                          </a>
                        </Button>
                      ) : (
                        <Button
                          className={styles.registerButton}
                          disabled={availableSpots === 0}
                        >
                          {availableSpots === 0 ? "Inscripciones cerradas" : "Inscribirse"}
                          {availableSpots !== 0 && <ChevronRight className={styles.buttonIcon} />}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredEvents.length === 0 && (
              <div className={styles.noEvents}>
                <Calendar className={styles.noEventsIcon} />
                <p className={styles.noEventsText}>
                  {isLoadingEvents
                    ? "Cargando eventos..."
                    : "No hay eventos vigentes en esta categoría por el momento."}
                </p>
                {eventsError && <p className={styles.errorDetails}>{eventsError}</p>}
                <Button variant="outline" onClick={() => setActiveFilter("todos")}>
                  Ver todos los eventos
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Past Events Section */}
        <section className={styles.pastEventsSection}>
          <div className={styles.container}>
            <button
              className={styles.pastEventsToggle}
              onClick={() => setShowPastEvents(!showPastEvents)}
            >
              <h2 className={styles.sectionTitle}>Eventos Pasados</h2>
              <ChevronRight
                className={`${styles.toggleIcon} ${showPastEvents ? styles.rotated : ""}`}
              />
            </button>
            {showPastEvents && (
              <div className={styles.pastEventsGrid}>
                {pastFromSource.map((event) => (
                  <article key={event.id} className={styles.pastEventCard}>
                    <div className={styles.pastEventImageWrapper}>
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className={styles.eventImage}
                      />
                      <div className={styles.pastEventOverlay}>
                        <Badge variant="secondary">Finalizado</Badge>
                      </div>
                    </div>
                    <div className={styles.eventContent}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <div className={styles.eventMeta}>
                        <div className={styles.metaItem}>
                          <Calendar className={styles.metaIcon} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      </div>
                      <p className={styles.eventDescription}>{event.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>¿Quieres organizar un evento con nosotros?</h2>
            <p className={styles.ctaText}>
              Si tu organización o comunidad está interesada en colaborar con LifePlants,
              <br />
              contáctanos para crear un evento juntos.
            </p>
            <Button size="lg" className={styles.ctaButton}>
              Contactar
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
