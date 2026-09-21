const CONFIG = {

  /* ---------- Sobre mí (P1) ---------- */
  perfil: {
    nombre: "Anas",
    apellidos: "El Khaldi",
    dorsal: "27",                                   // tu "número de piloto"
    titular: "Estudiant d’ASIX · Sistemes i xarxes",
    foto: "",                                       // ruta de tu foto, p. ej. "foto.jpg" (vertical 4:5). Vacío = espacio reservado
    presentacion: [
      "He acabat el cicle de grau mitjà de Sistemes Microinformàtics i Xarxes (SMX) i actualment estic cursant primer d’Administració de Sistemes Informàtics en Xarxa (ASIX) a l’Institut Sa Palomera, a Blanes.",
      "M’interessen els sistemes, les xarxes, les bases de dades i l’administració de servidors. M’agrada aprendre practicant, documentar el que faig i continuar millorant."
    ],
    estudiando: {
      titulo: "Administració de Sistemes Informàtics en Xarxa (ASIX)",
      detalle: "1r curs · Institut Sa Palomera · Blanes"
    },
    ficha: [
      { etiqueta: "Especialidad",   valor: "Sistemas y redes" },
      { etiqueta: "Idiomas",        valor: "Català i castellà" },
      { etiqueta: "Disponibilidad", valor: "Obert a oportunitats d’aprenentatge" },
      { etiqueta: "Ubicación",      valor: "Blanes, Girona" }
    ],
    intereses: [
      "Administración de sistemas", "Desarrollo web", "Automatización con scripts",
      "Ciberseguridad básica", "Software libre", "Simracing y Fórmula 1"
    ],
    objetivos: [
      { titulo: "Esta temporada",  texto: "Conseguir prácticas en un equipo de sistemas o de desarrollo." },
      { titulo: "Próxima temporada", texto: "Certificarme en redes (CCNA) y consolidar Linux." },
      { titulo: "A largo plazo",   texto: "Trabajar en infraestructura y automatización, cerca de DevOps." }
    ]
  },

  /* ---------- Menú: tabla de clasificación ----------
     La "clave" NO se cambia (enlaza cada fila con su página).
     Puedes editar nombre, tiempo y radio. Consejo: pon los tiempos de menor a mayor. */
  secciones: [
    { clave: "sobre-mi",     nombre: "Sobre mí",         tiempo: "01:12.350", radio: "Presentación del piloto antes de la salida" },
    { clave: "habilidades",  nombre: "Mis habilidades",  tiempo: "01:12.842", radio: "Telemetría: cómo rinde el coche" },
    { clave: "formacion",    nombre: "Mi formación",     tiempo: "01:13.290", radio: "Historial de temporadas" },
    { clave: "experiencia",  nombre: "Mi experiencia",   tiempo: "01:13.775", radio: "Hitos conseguidos en pista" },
    { clave: "contacto",     nombre: "Contacto",         tiempo: "01:14.120", radio: "Vuelta final: hablemos por radio" }
  ],

  /* ---------- Habilidades (P2) ----------
     nivel: de 0 a 100. aprendiendo: true muestra la etiqueta "Aprendiendo". */
  habilidades: [
    { nombre: "Python bàsic", grupo: "Programació", nivel: 40, aprendiendo: true },
    { nombre: "HTML i CSS", grupo: "Programació", nivel: 45, aprendiendo: true },
    { nombre: "JavaScript", grupo: "Programació", nivel: 25, aprendiendo: true },
    { nombre: "SQL / PostgreSQL", grupo: "Bases de dades", nivel: 45, aprendiendo: true },
    { nombre: "Linux", grupo: "Sistemes", nivel: 40, aprendiendo: true },
    { nombre: "Xarxes i Packet Tracer", grupo: "Xarxes", nivel: 45, aprendiendo: true },
    { nombre: "Windows Server i Active Directory", grupo: "Sistemes", nivel: 35, aprendiendo: true },
    { nombre: "Bash bàsic", grupo: "Scripting", nivel: 30, aprendiendo: true }
  ],

  /* ---------- Formación (P3) ----------
     estado: "en-curso" o "finalizado". "dato" es opcional. */
  formacion: [
    { periodo: "Actualment", titulo: "Administració de Sistemes Informàtics en Xarxa (ASIX)", centro: "Institut Sa Palomera · Blanes",
      detalle: "Cursant primer curs. Formació en sistemes, xarxes, bases de dades i administració de serveis.",
      estado: "en-curso" },
    { periodo: "Finalitzat", titulo: "Sistemes Microinformàtics i Xarxes (SMX)", centro: "Cicle formatiu de grau mitjà",
      detalle: "Cicle formatiu de grau mitjà completat abans de començar ASIX.",
      estado: "finalizado" }
  ],

  /* ---------- Experiencia y proyectos (P4) ----------
     destacado: true marca el hito con la etiqueta morada "Vuelta rápida" (solo uno). */
  experiencia: [
    { tipo: "Projecte acadèmic", titulo: "Base de dades Hospital Montserrat", lugar: "ASIX · Bases de dades i sistemes", fecha: "Projecte de classe",
      resumen: "Treball acadèmic sobre una base de dades amb seguretat i disponibilitat.",
      metrica: { valor: "SQL", etiqueta: "PostgreSQL i administració de dades" },
      detalles: ["Treball amb PostgreSQL i rols d'accés.", "Estudi de SSL, registre d'accessos i emmascarament de dades.", "Plantejament de disponibilitat del servei."],
      tecnologias: ["PostgreSQL", "Linux", "Seguretat"] , destacado: true },
    { tipo: "Pràctica de xarxes", titulo: "Configuració de xarxes amb VLAN", lugar: "ASIX · Packet Tracer", fecha: "Pràctiques de classe",
      resumen: "Simulació i configuració de xarxes per practicar la connectivitat i la segmentació.",
      metrica: { valor: "IP", etiqueta: "Adreçament i connectivitat" },
      detalles: ["Configuració de VLAN i adreçament IP.", "Pràctiques amb encaminament i ACL.", "Verificació de connectivitat."],
      tecnologias: ["Packet Tracer", "VLAN", "RIPv2", "ACL"] },
    { tipo: "Pràctica de programació", titulo: "Exercicis amb Python i Bash", lugar: "ASIX", fecha: "Pràctiques de classe",
      resumen: "Petits programes i scripts per practicar la lògica i automatitzar tasques bàsiques.",
      metrica: { valor: "CLI", etiqueta: "Scripts i automatització bàsica" },
      detalles: ["Exercicis amb variables, condicions i bucles.", "Scripts Bash amb paràmetres.", "Programes senzills amb Python."],
      tecnologias: ["Python", "Bash", "Linux"] }
  ],

  /* ---------- Contacto (P5) ---------- */
  contacto: {
    email: "",
    github:   { texto: "Afegeix el teu usuari",       url: "https://Afegeix el teu usuari" },
    linkedin: { texto: "Afegeix el teu perfil",  url: "https://www.Afegeix el teu perfil" },
    cv: {
      archivo: "",                                   // p. ej. "mi-cv.pdf" (súbelo junto a index.html). Vacío = se genera un CV de ejemplo con tus datos
      nombreDescarga: "CV-Anas-El-Khaldi.pdf"
    },
    despedida: {
      titulo: "Bandera a cuadros",
      texto: "Has completado la vuelta final. Gracias por recorrer mi carta de presentación hasta la meta. Si crees que encajo en tu equipo, escríbeme: la radio está abierta."
    }
  }
};
window.CONFIG = CONFIG;
