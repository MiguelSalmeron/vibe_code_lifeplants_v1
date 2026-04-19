import { Heart, Users, Handshake, Calendar } from "lucide-react";
import type { InvolvementOption } from "../components/involvement-section/involvement-section";

export const involvementOptions: InvolvementOption[] = [
  {
    id: "donate",
    title: "Donar",
    description:
      "Devuelve a las áreas naturales. Tu donación se destinará a preservar nuestros bosques y humedales vitales.",
    icon: Heart,
    buttonText: "Donar ahora",
    buttonUrl: "https://hcb.hackclub.com/donations/start/lifeplants",
    isPrimary: true,
  },
  {
    id: "volunteer",
    title: "Ser Voluntario",
    description: "Aporta nueva vitalidad a tu comunidad convirtiéndote en un Super Administrador de Senderos.",
    icon: Users,
    buttonText: "Ver oportunidades",
    buttonUrl: "#volunteer",
    isPrimary: false,
  },
  {
    id: "partner",
    title: "Asociarse",
    description: "Participa en nuestra misión a través del patrocinio corporativo y el voluntariado.",
    icon: Handshake,
    buttonText: "Más información",
    buttonUrl: "#partner",
    isPrimary: false,
  },
  {
    id: "events",
    title: "Participar en Eventos",
    description:
      "Recorre los parques de la ciudad, aprende sobre la vida silvestre local o ensucia tus manos en un día de administración.",
    icon: Calendar,
    buttonText: "Explorar eventos",
    buttonUrl: "/eventos",
    isPrimary: false,
  },
];
