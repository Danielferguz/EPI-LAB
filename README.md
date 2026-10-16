# EPI—LAB

Sitio web estático de **EPI-LAB** (Epidemiology · Evidence · Data). HTML + CSS + un poco de JS, sin build ni dependencias.

## Estructura
- `index.html` Inicio · `nosotros.html` · `cursos.html` · `programas.html` · `investigacion.html` · `recursos.html` · `blog.html` · `contacto.html`
- `blog/` artículos de EPI-LAB Insights (copia `blog/or-vs-rr.html` como plantilla)
- `assets/css/style.css` paleta (variables `--blue-*` al inicio) y estilos
- `assets/js/main.js` menú móvil, animaciones y formulario de contacto

## Publicar en GitHub Pages
1. Haz merge de esta rama a `main`.
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. El workflow `.github/workflows/pages.yml` publica el sitio en cada push a `main`.

## Pendientes por editar
- Correo real (`contacto@epi-lab.org`) en `contacto.html` y enlaces a redes.
- Equipo/Faculty (`nosotros.html`), proyectos y publicaciones (`investigacion.html`): hoy son bloques de ejemplo.
- Descargas de `recursos.html` y PDFs de brochures.
- La barra de navegación y el pie están repetidos en cada página; si los cambias, actualiza todas.
