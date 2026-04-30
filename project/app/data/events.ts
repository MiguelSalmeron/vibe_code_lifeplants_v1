import type { Event } from "../types/event";

export const upcomingEvents: Event[] = [
	{
		id: "local-upcoming-1",
		title: "Taller de Compostaje Urbano",
		description:
			"Aprende a transformar residuos orgánicos en abono para huertas caseras y jardines comunitarios.",
		category: "taller",
		location: "Casa Cultural LifePlants, Bogotá",
		date: "2026-05-11",
		time: "09:00 - 12:00",
		startsAt: "2026-05-11",
		imageUrl:
			"https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
		active: true,
		capacity: 40,
		registered: 24,
		difficulty: "fácil",
		registrationUrl: "https://lifeplants.org/voluntario.html",
	},
	{
		id: "local-upcoming-2",
		title: "Jornada de Limpieza de Quebrada",
		description:
			"Nos reunimos para retirar residuos, clasificar material reciclable y restaurar una zona ribereña.",
		category: "limpieza",
		location: "Parque Ecológico El Salitre",
		date: "2026-05-25",
		time: "07:30 - 11:30",
		startsAt: "2026-05-25",
		imageUrl:
			"https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
		active: true,
		capacity: 120,
		registered: 79,
		difficulty: "moderado",
		registrationUrl: "https://lifeplants.org/eventos.html",
	},
	{
		id: "local-upcoming-3",
		title: "Seminario: Plantas Nativas y Polinizadores",
		description:
			"Encuentro educativo sobre especies nativas para jardines urbanos resilientes y biodiversos.",
		category: "educativo",
		location: "Auditorio Biblioteca Ambiental",
		date: "2026-06-07",
		time: "16:00 - 18:30",
		startsAt: "2026-06-07",
		imageUrl:
			"https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80",
		active: true,
		capacity: 80,
		registered: 42,
		difficulty: "fácil",
	},
];

export const pastEvents: Event[] = [
	{
		id: "local-past-1",
		title: "Reforestación Comunitaria 2026",
		description:
			"Actividad de voluntariado con siembra de especies nativas y mantenimiento de plántulas en vivero.",
		category: "voluntariado",
		location: "Cerros Orientales",
		date: "2026-02-16",
		time: "08:00 - 13:00",
		startsAt: "2026-02-16",
		endsAt: "2026-02-16",
		imageUrl:
			"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
		active: true,
		capacity: 150,
		registered: 150,
		difficulty: "avanzado",
	},
];
