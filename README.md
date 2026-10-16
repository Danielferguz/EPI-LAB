# EPI—LAB

Sitio web estático de **EPI-LAB** (Epidemiology · Evidence · Data). HTML + CSS + JS sin build ni dependencias; se publica tal cual en GitHub Pages.

**Marca:** Teal `#5BA7B8` · Burgundy `#8B2E3B` · Charcoal `#4D4D4D` · Gris `#D9D9D9`. Tipografías: Montserrat (títulos) y Source Sans 3 (texto). Las variables de color están al inicio de `assets/css/style.css`.

## Páginas
`index` · `calendario` · `cursos` · `programas` · `instituciones` · `nosotros` · `investigacion` · `recursos` · `certificado` · `blog` (+ `blog/*.html`) · `contacto` · `404`

## Qué editar (sin tocar HTML)
- `assets/js/config.js` — URL de **META GRADE**, del **libro**, del **aula virtual**, de la **tienda**, WhatsApp y correo. Vacío = botón gris «próximamente».
- `assets/data/courses.js` — catálogo de cursos: `date` (ISO, p. ej. `"2026-11-14"`), `duration` y `status` (`abierto` / `proximo` / `agotado`). Alimenta *Cursos* y *Calendario*.
- `assets/data/certificates.js` — certificados verificables en la página *Certificado*.

## Publicar en GitHub Pages
1. Haz merge de esta rama a `main`.
2. **Settings → Pages → Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` publica en cada push a `main`.

## Pendientes
- Equipo/Faculty (`nosotros.html`), proyectos y publicaciones (`investigacion.html`): bloques de ejemplo.
- Descargas de `recursos.html`, PDFs de brochures y horas académicas de los programas.
- El menú y el pie están repetidos en cada página; si los cambias, actualiza todas.
