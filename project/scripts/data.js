// Data for Initiatives
const initiatives = [
  {
    id: "restoration",
    title: "Restauración de Plantas",
    description: "Trabajamos activamente en la restauración de ecosistemas degradados, plantando especies nativas y recuperando la biodiversidad vegetal en áreas urbanas y rurales.",
    imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80",
    linkUrl: "#"
  },
  {
    id: "education",
    title: "Programas Educativos",
    description: "Desarrollamos programas educativos para escuelas y comunidades, enseñando la importancia de la vida vegetal y cómo cada persona puede contribuir a la conservación.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    linkUrl: "#"
  },
  {
    id: "community",
    title: "Alcance Comunitario",
    description: "Organizamos eventos comunitarios, talleres de jardinería urbana y jornadas de plantación para conectar a las personas con la naturaleza y fomentar la participación activa.",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80",
    linkUrl: "#"
  },
  {
    id: "advocacy",
    title: "Defensoría Ambiental",
    description: "Abogamos por políticas públicas que protejan los espacios verdes, promovemos la legislación ambiental y trabajamos con gobiernos locales para crear ciudades más sostenibles.",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80",
    linkUrl: "#"
  }
];

// Data for Involvement Options
const involvementOptions = [
  {
    id: "donate",
    title: "Donar",
    description: "Devuelve a las áreas naturales. Tu donación se destinará a preservar nuestros bosques y humedales vitales.",
    icon: "heart",
    buttonText: "Donar ahora",
    buttonUrl: "/donar.html",
    isPrimary: true
  },
  {
    id: "volunteer",
    title: "Ser Voluntario",
    description: "Aporta nueva vitalidad a tu comunidad convirtiéndote en un Super Administrador de Senderos.",
    icon: "users",
    buttonText: "Ver oportunidades",
    buttonUrl: "/voluntario.html",
    isPrimary: false
  },
  {
    id: "partner",
    title: "Asociarse",
    description: "Participa en nuestra misión a través del patrocinio corporativo y el voluntariado.",
    icon: "handshake",
    buttonText: "Más información",
    buttonUrl: "#partner",
    isPrimary: false
  },
  {
    id: "events",
    title: "Participar en Eventos",
    description: "Recorre los parques de la ciudad, aprende sobre la vida silvestre local o ensucia tus manos en un día de administración.",
    icon: "calendar",
    buttonText: "Explorar eventos",
    buttonUrl: "/eventos.html",
    isPrimary: false
  }
];

// SVG Icons
const icons = {
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  handshake: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"></path><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path><path d="m21 3 1 11h-2"></path><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path><path d="M3 4h8"></path></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>'
};

// Data for Plants
const plants = [
  {
    id: 1,
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis",
    use: "medicinal",
    region: "africa",
    type: "suculenta",
    description: "Planta medicinal conocida por sus propiedades curativas y cosméticas.",
    imageUrl: "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=600&q=80",
    popularity: 95,
    dateAdded: "2025-01-15"
  },
  {
    id: 2,
    name: "Roble",
    scientificName: "Quercus robur",
    use: "industrial",
    region: "europa",
    type: "arbol",
    description: "Árbol majestuoso usado en construcción y carpintería.",
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&q=80",
    popularity: 88,
    dateAdded: "2025-01-10"
  },
  {
    id: 3,
    name: "Lavanda",
    scientificName: "Lavandula angustifolia",
    use: "ornamental",
    region: "europa",
    type: "arbusto",
    description: "Planta aromática apreciada por su fragancia y flores moradas.",
    imageUrl: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600&q=80",
    popularity: 92,
    dateAdded: "2025-01-20"
  },
  {
    id: 4,
    name: "Menta",
    scientificName: "Mentha spicata",
    use: "medicinal",
    region: "europa",
    type: "hierba",
    description: "Hierba aromática con propiedades medicinales y culinarias.",
    imageUrl: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&q=80",
    popularity: 85,
    dateAdded: "2025-02-01"
  },
  {
    id: 5,
    name: "Tomate",
    scientificName: "Solanum lycopersicum",
    use: "alimenticio",
    region: "sudamerica",
    type: "hierba",
    description: "Planta alimenticia cultivada por sus frutos comestibles.",
    imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&q=80",
    popularity: 98,
    dateAdded: "2025-01-25"
  },
  {
    id: 6,
    name: "Bambú",
    scientificName: "Bambusa vulgaris",
    use: "industrial",
    region: "asia",
    type: "hierba",
    description: "Planta de rápido crecimiento usada en construcción sostenible.",
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80",
    popularity: 87,
    dateAdded: "2025-01-18"
  },
  {
    id: 7,
    name: "Rosa",
    scientificName: "Rosa gallica",
    use: "ornamental",
    region: "europa",
    type: "arbusto",
    description: "Flor ornamental clásica apreciada por su belleza y aroma.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    popularity: 96,
    dateAdded: "2025-01-12"
  },
  {
    id: 8,
    name: "Orquídea",
    scientificName: "Phalaenopsis",
    use: "ornamental",
    region: "asia",
    type: "hierba",
    description: "Planta ornamental exótica con flores espectaculares.",
    imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80",
    popularity: 94,
    dateAdded: "2025-02-05"
  },
  {
    id: 9,
    name: "Eucalipto",
    scientificName: "Eucalyptus globulus",
    use: "medicinal",
    region: "sudamerica",
    type: "arbol",
    description: "Árbol medicinal con propiedades respiratorias.",
    imageUrl: "https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?w=600&q=80",
    popularity: 82,
    dateAdded: "2025-01-08"
  },
  {
    id: 10,
    name: "Hiedra",
    scientificName: "Hedera helix",
    use: "ornamental",
    region: "europa",
    type: "trepadora",
    description: "Planta trepadora ideal para cubrir muros y paredes.",
    imageUrl: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&q=80",
    popularity: 79,
    dateAdded: "2025-01-22"
  },
  {
    id: 11,
    name: "Cacao",
    scientificName: "Theobroma cacao",
    use: "alimenticio",
    region: "centroamerica",
    type: "arbol",
    description: "Árbol tropical del que se obtiene el chocolate.",
    imageUrl: "https://images.pexels.com/photos/4040626/pexels-photo-4040626.jpeg?w=600&q=80",
    popularity: 91,
    dateAdded: "2025-01-28"
  },
  {
    id: 12,
    name: "Jengibre",
    scientificName: "Zingiber officinale",
    use: "medicinal",
    region: "asia",
    type: "hierba",
    description: "Rizoma medicinal y culinario con propiedades antiinflamatorias.",
    imageUrl: "https://images.pexels.com/photos/161556/ginger-plant-asia-rhizome-161556.jpeg?w=600&q=80",
    popularity: 89,
    dateAdded: "2025-02-02"
  },
  {
    id: 13,
    name: "Pino",
    scientificName: "Pinus sylvestris",
    use: "industrial",
    region: "europa",
    type: "arbol",
    description: "Árbol conífero usado en la industria maderera.",
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80",
    popularity: 84,
    dateAdded: "2025-01-14"
  },
  {
    id: 14,
    name: "Jazmín",
    scientificName: "Jasminum officinale",
    use: "ornamental",
    region: "asia",
    type: "trepadora",
    description: "Planta trepadora con flores fragantes y aromáticas.",
    imageUrl: "https://images.unsplash.com/photo-1553984840-b8cbc34f5215?w=600&q=80",
    popularity: 86,
    dateAdded: "2025-01-30"
  },
  {
    id: 15,
    name: "Aguacate",
    scientificName: "Persea americana",
    use: "alimenticio",
    region: "centroamerica",
    type: "arbol",
    description: "Árbol frutal originario de Mesoamérica.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80",
    popularity: 97,
    dateAdded: "2025-02-03"
  },
  {
    id: 16,
    name: "Cactus",
    scientificName: "Opuntia ficus-indica",
    use: "ornamental",
    region: "centroamerica",
    type: "suculenta",
    description: "Planta suculenta resistente a la sequía.",
    imageUrl: "https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?w=600&q=80",
    popularity: 80,
    dateAdded: "2025-01-16"
  },
  {
    id: 17,
    name: "Café",
    scientificName: "Coffea arabica",
    use: "alimenticio",
    region: "sudamerica",
    type: "arbusto",
    description: "Arbusto tropical del que se obtiene el café.",
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
    popularity: 99,
    dateAdded: "2025-02-04"
  },
  {
    id: 18,
    name: "Palmera",
    scientificName: "Cocos nucifera",
    use: "alimenticio",
    region: "caribe",
    type: "arbol",
    description: "Árbol tropical del que se obtiene el coco.",
    imageUrl: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&q=80",
    popularity: 90,
    dateAdded: "2025-01-19"
  }
];
