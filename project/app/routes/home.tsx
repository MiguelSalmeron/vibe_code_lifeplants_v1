import type { Route } from "./+types/home";
import styles from "./home.module.css";
import { AlertBanner } from "../components/alert-banner/alert-banner";
import { Header } from "../components/header/header";
import { HeroSection } from "../components/hero-section/hero-section";
import { IntroSection } from "../components/intro-section/intro-section";
import { MissionVisionSection } from "../components/mission-vision-section/mission-vision-section";
import { ValuesSection } from "../components/values-section/values-section";
import { InitiativesSection } from "../components/initiatives-section/initiatives-section";
import { LabQuickAccess } from "../components/lab-quick-access/lab-quick-access";
import { InvolvementSection } from "../components/involvement-section/involvement-section";
import { Footer } from "../components/footer/footer";
import { initiatives } from "../data/initiatives";
import { involvementOptions } from "../data/involvement-options";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LifePlants - No solo enseñamos; Construimos" },
    {
      name: "description",
      content:
        "LifePlants es una organización sin fines de lucro que conecta a las personas con la tecnología y el medio ambiente para luchar contra los efectos del cambio climático.",
    },
  ];
}

export default function Home() {
  return (
    <div className={styles.page}>
      <AlertBanner
        message="¡Las aplicaciones para nuestros programas de pasantías de verano 2026 abren el 17 de febrero!"
        linkUrl="#"
        linkText="Regístrate para recibir notificaciones"
      />
      <Header />
      <main>
        <HeroSection
          motto="No solo enseñamos; Construimos"
          title="Conectando tecnología, educación y medio ambiente"
          subtitle="Desarrollamos e integramos soluciones tecnológicas innovadoras que reducen el impacto ambiental, promoviendo el uso responsable de los recursos naturales."
          backgroundImage="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80"
        />
        <IntroSection
          label="¿Quiénes somos?"
          title="LifePlants: Creando una comunidad que hace la diferencia"
          description="LifePlants es una organización sin fines de lucro que además de ayudar a la conservación del medio ambiente, busca conectar con las personas y asimismo crear una comunidad receptiva que luche contra los efectos del cambio climático y haga una diferencia notable. Convertimos la frustración climática en innovación tangible a través de la tecnología, el medio ambiente y el aprendizaje cognitivo."
          imageUrl="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"
        />
        <MissionVisionSection />
        <ValuesSection />
        <InitiativesSection title="Qué hacemos" initiatives={initiatives} />
        <LabQuickAccess />
        <InvolvementSection title="Únete a nuestros esfuerzos" options={involvementOptions} />
      </main>
      <Footer />
    </div>
  );
}
