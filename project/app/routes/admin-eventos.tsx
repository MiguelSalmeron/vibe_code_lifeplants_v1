import { FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "../lib/firebase";
import { mapEventDoc, sortEventsByStartDate } from "../lib/events-store";
import { formatFirestoreError } from "../lib/firestore-errors";
import type { Event, EventCategory, EventDifficulty } from "../types/event";
import styles from "./admin-eventos.module.css";

type AdminOutletContext = {
  user: User;
};

type EventFormState = {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  date: string;
  time: string;
  startsAt: string;
  endsAt: string;
  imageUrl: string;
  registrationUrl: string;
  capacity: string;
  difficulty: "" | EventDifficulty;
};

const defaultFormState: EventFormState = {
  title: "",
  description: "",
  category: "educativo",
  location: "",
  date: "",
  time: "",
  startsAt: "",
  endsAt: "",
  imageUrl: "",
  registrationUrl: "",
  capacity: "",
  difficulty: "",
};

const buildBasePayload = (form: EventFormState, user: User, now = serverTimestamp()) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  category: form.category,
  location: form.location.trim(),
  date: form.date || form.startsAt,
  time: form.time || "Por confirmar",
  startsAt: form.startsAt || form.date,
  endsAt: form.endsAt || form.startsAt || form.date,
  imageUrl:
    form.imageUrl.trim() || "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80",
  registrationUrl: form.registrationUrl.trim() || null,
  capacity: form.capacity ? Number(form.capacity) : null,
  difficulty: form.difficulty || null,
  updatedAt: now,
  updatedBy: user.uid,
});

export default function AdminEventos() {
  const { user } = useOutletContext<AdminOutletContext>();
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<EventFormState>(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      return;
    }

    const eventsQuery = query(collection(db, "eventos"));
    return onSnapshot(
      eventsQuery,
      (snapshot) => {
        setEvents(sortEventsByStartDate(snapshot.docs.map(mapEventDoc)).reverse());
      },
      (error) => {
        setError(formatFirestoreError(error, "No se pudo cargar la colección de eventos."));
      },
    );
  }, []);

  const handleFieldChange = <T extends keyof EventFormState>(field: T, value: EventFormState[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateOrUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!db) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await updateDoc(doc(db, "eventos", editingId), {
          ...buildBasePayload(form, user),
        });
        setMessage("Evento actualizado correctamente.");
      } else {
        await addDoc(collection(db, "eventos"), {
          ...buildBasePayload(form, user),
          registered: 0,
          active: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        });
        setMessage("Evento creado correctamente.");
      }

      setForm(defaultFormState);
      setEditingId(null);
    } catch (error) {
      setError(formatFirestoreError(error, "No se pudo guardar el evento. Revisa permisos o conexión."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      date: event.date,
      time: event.time,
      startsAt: event.startsAt || event.date,
      endsAt: event.endsAt || event.startsAt || event.date,
      imageUrl: event.imageUrl,
      registrationUrl: event.registrationUrl || "",
      capacity: event.capacity ? String(event.capacity) : "",
      difficulty: event.difficulty || "",
    });
    setMessage(null);
    setError(null);
  };

  const toggleActive = async (event: Event) => {
    if (!db) {
      return;
    }

    try {
      await updateDoc(doc(db, "eventos", event.id), {
        active: event.active === false,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
    } catch (error) {
      setError(formatFirestoreError(error, "No se pudo actualizar el estado del evento."));
    }
  };

  if (!db) {
    return <p className={styles.feedback}>Configura Firestore para habilitar el CRUD de eventos.</p>;
  }

  return (
    <section className={styles.page}>
      <article className={styles.card}>
        <h2>{editingId ? "Editar evento" : "Nuevo evento"}</h2>
        <form className={styles.form} onSubmit={handleCreateOrUpdate}>
          <label>
            Título
            <input
              value={form.title}
              onChange={(nextEvent) => handleFieldChange("title", nextEvent.target.value)}
              required
            />
          </label>
          <label>
            Categoría
            <select
              value={form.category}
              onChange={(nextEvent) => handleFieldChange("category", nextEvent.target.value as EventCategory)}
            >
              <option value="taller">Taller</option>
              <option value="limpieza">Limpieza</option>
              <option value="educativo">Educativo</option>
              <option value="voluntariado">Voluntariado</option>
            </select>
          </label>
          <label>
            Fecha inicio
            <input
              type="date"
              value={form.startsAt}
              onChange={(nextEvent) => handleFieldChange("startsAt", nextEvent.target.value)}
              required
            />
          </label>
          <label>
            Fecha fin
            <input
              type="date"
              value={form.endsAt}
              onChange={(nextEvent) => handleFieldChange("endsAt", nextEvent.target.value)}
            />
          </label>
          <label>
            Hora
            <input value={form.time} onChange={(nextEvent) => handleFieldChange("time", nextEvent.target.value)} />
          </label>
          <label>
            Ubicación
            <input value={form.location} onChange={(nextEvent) => handleFieldChange("location", nextEvent.target.value)} required />
          </label>
          <label>
            URL de imagen o GIF
            <input value={form.imageUrl} onChange={(nextEvent) => handleFieldChange("imageUrl", nextEvent.target.value)} />
            <small className={styles.fieldHint}>Pega una URL directa a una imagen o a un GIF animado.</small>
          </label>
          <label>
            URL de inscripción
            <input
              value={form.registrationUrl}
              onChange={(nextEvent) => handleFieldChange("registrationUrl", nextEvent.target.value)}
            />
          </label>
          <label>
            Cupos
            <input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(nextEvent) => handleFieldChange("capacity", nextEvent.target.value)}
            />
          </label>
          <label>
            Dificultad
            <select
              value={form.difficulty}
              onChange={(nextEvent) => handleFieldChange("difficulty", nextEvent.target.value as EventFormState["difficulty"])}
            >
              <option value="">Sin definir</option>
              <option value="fácil">Fácil</option>
              <option value="moderado">Moderado</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </label>
          <label className={styles.fullWidth}>
            Descripción
            <textarea
              rows={4}
              value={form.description}
              onChange={(nextEvent) => handleFieldChange("description", nextEvent.target.value)}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          {error && <p className={styles.errorDetails}>Si persiste, revisa reglas, índice o el projectId desplegado.</p>}
          {message && <p className={styles.feedback}>{message}</p>}
          <div className={styles.actions}>
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar evento" : "Crear evento"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(defaultFormState);
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </article>

      <article className={styles.card}>
        <h2>Eventos registrados</h2>
        <div className={styles.list}>
          {events.map((event) => (
            <div key={event.id} className={styles.item}>
              <div>
                <h3>{event.title}</h3>
                <p>
                  {event.startsAt || event.date} · {event.location}
                </p>
                <span className={event.active === false ? styles.statusOff : styles.statusOn}>
                  {event.active === false ? "Inactivo" : "Activo"}
                </span>
              </div>
              <div className={styles.itemActions}>
                <button type="button" onClick={() => handleEdit(event)}>
                  Editar
                </button>
                <button type="button" onClick={() => toggleActive(event)}>
                  {event.active === false ? "Activar" : "Archivar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
