import {
  collection,
  onSnapshot,
  where,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Event } from "../types/event";

const EVENTS_COLLECTION = "eventos";

const parseComparableDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

export const sortEventsByStartDate = (events: Event[]) =>
  [...events].sort((left, right) => {
    const leftValue = parseComparableDate(left.startsAt || left.date);
    const rightValue = parseComparableDate(right.startsAt || right.date);

    if (leftValue === null && rightValue === null) {
      return left.title.localeCompare(right.title);
    }

    if (leftValue === null) {
      return 1;
    }

    if (rightValue === null) {
      return -1;
    }

    return leftValue - rightValue;
  });

const toDateString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "toDate" in value) {
    const raw = (value as { toDate: () => Date }).toDate();
    return raw.toISOString().slice(0, 10);
  }

  return "";
};

export const mapEventDoc = (doc: QueryDocumentSnapshot<DocumentData>): Event => {
  const data = doc.data();

  return {
    id: doc.id,
    title: String(data.title || "Evento sin título"),
    description: String(data.description || ""),
    category: (data.category || "educativo") as Event["category"],
    location: String(data.location || "Por definir"),
    date: String(data.date || data.startsAt || ""),
    time: String(data.time || "Por confirmar"),
    startsAt: toDateString(data.startsAt),
    endsAt: toDateString(data.endsAt),
    imageUrl: String(data.imageUrl || "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80"),
    active: typeof data.active === "boolean" ? data.active : true,
    capacity: typeof data.capacity === "number" ? data.capacity : undefined,
    registered: typeof data.registered === "number" ? data.registered : undefined,
    difficulty: data.difficulty as Event["difficulty"],
    registrationUrl: typeof data.registrationUrl === "string" ? data.registrationUrl : undefined,
  };
};

export const subscribeAllEvents = (
  onData: (events: Event[]) => void,
  onError: (error: Error) => void,
) => {
  if (!db) {
    onData([]);
    return () => {};
  }

  const eventsQuery = query(collection(db, EVENTS_COLLECTION), where("active", "==", true));
  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      onData(sortEventsByStartDate(snapshot.docs.map(mapEventDoc)));
    },
    (error) => {
      onError(error);
    },
  );
};
