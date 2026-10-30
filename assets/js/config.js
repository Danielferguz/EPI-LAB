/* Configuración editable de EPI-LAB. Vacío ("") o null = se muestra «Próximamente / Por anunciar». */
window.EPI = {
  metaGrade: "",          // URL de META GRADE
  book: "",               // URL del libro (tienda, PDF, Drive…)
  virtualClassroom: "",   // URL de la escuela en Thinkific, p. ej. "https://aula.epi-lab.org"
  shop: "",               // URL del catálogo / checkout general en Thinkific
  whatsapp: "",           // número con código de país y sin símbolos, p. ej. "51950876703"
  email: "contacto@epi-lab.org",
  // Compra por curso: id (assets/data/courses.js) → URL del producto en Thinkific.
  checkout: { p1: "" },
  // Acceso a cada herramienta (assets/data/herramientas.js). "" = disponible solo desde el aula / próximamente.
  tools: { "epi-data": "", "epi-causal": "", "epi-graphics": "", "epi-ml": "", "epi-predic": "", "epi-rob": "", "epi-its": "", "meta-grade": "" },
  // Precios (sin inventar cifras: null = «Por anunciar»). Moneda: "USD" o "EUR".
  // Borrador comentado por el autor: grupo de más de 5 personas ≈ 120 por persona y mes; herramientas solas ≈ 100. Definir antes de publicar.
  prices: { currency: "USD", course: null, toolsMonth: null, toolsYear: null, groupMinSeats: 5, groupPerPersonMonth: null, toolsIncludedMonths: 3 }
};
