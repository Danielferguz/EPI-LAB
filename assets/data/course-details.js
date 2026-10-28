/* Detalle por curso (claves = id de courses.js). Genera la página curso.html. */
window.EPI_COURSE_DETAILS = {
 p1: {
  tool: "epi-data",
  format: "A tu ritmo · aula virtual",
  language: "Español",
  videoMin: 22,
  summary: "Aprende a elegir, ejecutar e interpretar la regresión logística y la regresión de Poisson con varianza robusta (RP, RR y razón de tasas) con ejemplos de nefrología y la herramienta EPI-DATA, que corre en tu navegador.",
  audience: ["Residentes, médicos e investigadores que analizan bases clínicas propias", "Estudiantes de posgrado en salud que redactan tesis o artículos", "Profesionales que quieren entender por qué el OR a veces exagera"],
  prereq: ["Conocer la tabla 2×2 y la idea de odds ratio", "Un computador con navegador actualizado; no se instala nada"],
  outcomes: ["Elegir entre OR, RP, RR y razón de tasas según el desenlace y el diseño", "Ejecutar e interpretar ambos modelos en EPI-DATA", "Revisar los supuestos básicos y entender sus límites", "Comparar el modelo crudo y el ajustado y evitar la falacia de la Tabla 2", "Redactar métodos y resultados siguiendo STROBE"],
  includes: ["Videos cortos con diapositivas y ejemplos", "4 lecturas de consulta rápida", "3 talleres prácticos con respuestas", "4 cuestionarios", "Acceso a EPI-DATA durante 3 meses", "Certificado de finalización"],
  modules: [
 {
  "t": "Unidad 0 · Bienvenida",
  "items": [
   {
    "t": "Bienvenida y cómo usar este curso",
    "k": "video",
    "m": 2
   }
  ]
 },
 {
  "t": "Unidad 1 · Elegir el modelo",
  "items": [
   {
    "t": "Del tipo de desenlace al modelo",
    "k": "video",
    "m": 2
   },
   {
    "t": "Riesgo, odds y por qué el OR puede exagerar",
    "k": "video",
    "m": 2
   },
   {
    "t": "Lectura 1 · Elegir el modelo",
    "k": "lectura"
   },
   {
    "t": "Cuestionario de la unidad",
    "k": "quiz"
   }
  ]
 },
 {
  "t": "Unidad 2 · Regresión logística",
  "items": [
   {
    "t": "Interpretar un OR de regresión logística",
    "k": "video",
    "m": 2
   },
   {
    "t": "Práctica guiada en EPI-DATA: logística",
    "k": "video",
    "m": 2
   },
   {
    "t": "Supuestos de la logística y cuánto confiar",
    "k": "video",
    "m": 2
   },
   {
    "t": "Lectura 2 · Regresión logística",
    "k": "lectura"
   },
   {
    "t": "Taller 1 · Logística con EPI-DATA (lesión renal aguda)",
    "k": "herramienta"
   },
   {
    "t": "Cuestionario de la unidad",
    "k": "quiz"
   }
  ]
 },
 {
  "t": "Unidad 3 · Poisson con varianza robusta",
  "items": [
   {
    "t": "Poisson con varianza robusta: RP y RR",
    "k": "video",
    "m": 2
   },
   {
    "t": "Práctica: OR frente a RP en hemodiálisis",
    "k": "video",
    "m": 2
   },
   {
    "t": "Razón de tasas con offset: conteos y persona-tiempo",
    "k": "video",
    "m": 2
   },
   {
    "t": "Lectura 3 · Poisson robusta y razón de tasas",
    "k": "lectura"
   },
   {
    "t": "Taller 2 · OR frente a RP con EPI-DATA (depresión en hemodiálisis)",
    "k": "herramienta"
   },
   {
    "t": "Taller 3 · Razón de tasas con EPI-DATA (peritonitis)",
    "k": "herramienta"
   },
   {
    "t": "Cuestionario de la unidad",
    "k": "quiz"
   }
  ]
 },
 {
  "t": "Unidad 4 · Reportar resultados",
  "items": [
   {
    "t": "Crudo versus ajustado y cómo leer el forest plot",
    "k": "video",
    "m": 2
   },
   {
    "t": "Cómo redactar métodos y resultados",
    "k": "video",
    "m": 2
   },
   {
    "t": "Lectura 4 · Reportar resultados",
    "k": "lectura"
   },
   {
    "t": "Cuestionario de la unidad",
    "k": "quiz"
   }
  ]
 }
],
  brochure: "assets/brochures/regresion-logistica-poisson.pdf",
  preview: "",
  faq: [
   ["¿Necesito saber programar?", "No. Todo el análisis se hace con EPI-DATA, sin código."],
   ["¿Mis datos salen de mi computador?", "No. EPI-DATA calcula en tu navegador; los datos no se envían a ningún servidor."],
   ["¿Los ejemplos son datos reales?", "Son datos simulados de nefrología creados para enseñar."],
   ["¿Quién narra los videos?", "Una voz sintética, para mantener una calidad constante entre lecciones."]
  ]
 }
};
