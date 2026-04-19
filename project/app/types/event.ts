export type EventCategory = "taller" | "limpieza" | "educativo" | "voluntariado";

export type EventDifficulty = "fácil" | "moderado" | "avanzado";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  date: string;
  time: string;
  startsAt?: string;
  endsAt?: string;
  imageUrl: string;
  active?: boolean;
  capacity?: number;
  registered?: number;
  difficulty?: EventDifficulty;
  registrationUrl?: string;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseISODate = (value: string) => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const parseEventDate = (value?: string, endOfDay = false) => {
  if (!value) {
    return null;
  }

  const isoDate = parseISODate(value);
  if (isoDate) {
    if (endOfDay) {
      isoDate.setHours(23, 59, 59, 999);
    } else {
      isoDate.setHours(0, 0, 0, 0);
    }
    return isoDate;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const isEventVisibleNow = (event: Event, now = new Date()) => {
  if (event.active === false) {
    return false;
  }

  const fallbackDate = event.endsAt || event.startsAt || event.date;
  const eventEnd = parseEventDate(fallbackDate, true);

  if (!eventEnd) {
    return true;
  }

  return eventEnd.getTime() >= now.getTime();
};

export const splitEventsByVigency = (events: Event[], now = new Date()) => {
  const upcoming: Event[] = [];
  const past: Event[] = [];

  for (const event of events) {
    if (isEventVisibleNow(event, now)) {
      upcoming.push(event);
      continue;
    }

    past.push(event);
  }

  return { upcoming, past };
};
