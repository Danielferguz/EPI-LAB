(function () {
  var E = window.EPI || {}, P = E.prices || {}, data = window.EPI_COURSES || [], det = window.EPI_COURSE_DETAILS || {};
  var root = document.getElementById('course'); if (!root) return;
  var id = new URLSearchParams(location.search).get('c') || 'p1';
  var c = data.filter(function (x) { return x.id === id; })[0];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function money(n) { return n == null ? 'Precio por anunciar' : new Intl.NumberFormat('es', { style: 'currency', currency: P.currency || 'USD', maximumFractionDigits: 0 }).format(n); }
  if (!c) { root.innerHTML = '<div class="wrap" style="padding:60px 0"><p>No encontramos ese curso. <a href="cursos.html">Ver el catálogo</a>.</p></div>'; return; }
  var d = det[id], link = E.checkout && E.checkout[id], tool = d && E.tools && E.tools[d.tool];
  document.title = c.title + ' · EPI-LAB';
  var md = document.querySelector('meta[name=description]'); if (md) md.content = d ? d.summary : c.desc;
  var K = { video: 'Video', lectura: 'Lectura', herramienta: 'Taller', quiz: 'Cuestionario' };
  var h = '<section class="title-block"><div class="wrap"><div class="eyebrow" style="justify-content:center">' + esc(c.route.toUpperCase()) + ' · ' + esc(c.level) + '</div><h1 style="font-size:clamp(1.9rem,4vw,3rem)">' + esc(c.title) + '</h1></div></section>';
  h += '<section class="section" style="padding-top:20px"><div class="wrap course-grid"><div>';
  h += '<p class="lead">' + esc(d ? d.summary : c.desc) + '</p>';
  if (d) {
    h += '<h2>Lo que lograrás</h2><ul class="checks">' + d.outcomes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    h += '<h2 style="margin-top:1.6em">Contenido</h2><div class="syl">' + d.modules.map(function (m, i) {
      return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(m.t) + '</summary><ul>' + m.items.map(function (it) {
        return '<li><span class="k ' + (it.k === 'herramienta' ? 'tool' : it.k === 'lectura' ? 'read' : '') + '">' + K[it.k] + '</span><span>' + esc(it.t) + (it.m ? ' <small style="color:var(--muted)">· ≈ ' + it.m + ' min</small>' : '') + '</span></li>';
      }).join('') + '</ul></details>';
    }).join('') + '</div>';
    h += '<h2 style="margin-top:1.6em">¿Para quién es?</h2><ul class="checks">' + d.audience.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    h += '<h2 style="margin-top:1.6em">Requisitos</h2><ul class="checks">' + d.prereq.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    if (d.preview) h += '<h2 style="margin-top:1.6em">Avance del curso</h2><div class="vid"><iframe src="' + esc(d.preview) + '" title="Avance del curso" loading="lazy" allowfullscreen></iframe></div>';
    h += '<h2 style="margin-top:1.6em">Preguntas frecuentes</h2><div class="faq" style="margin:0">' + d.faq.map(function (q) { return '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>'; }).join('') + '</div>';
  } else {
    h += '<div class="callout"><p>Los detalles de este curso se publicarán pronto. Déjanos tu correo y te avisamos.</p></div>';
  }
  h += '</div><aside class="buybox" aria-label="Inscripción"><div class="eyebrow">' + (c.status === 'abierto' ? 'Inscripción abierta' : 'Próximamente') + '</div>';
  h += '<div class="price">' + money(P.course) + '</div>';
  if (d) h += '<ul>' + d.includes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  h += link ? '<a class="btn btn-primary" href="' + esc(link) + '" target="_blank" rel="noopener">Inscribirme</a>' : '<a class="btn btn-primary" href="contacto.html?tema=' + encodeURIComponent(c.title) + '">Avísame cuando abra</a>';
  if (d && d.brochure) h += '<a class="btn btn-ghost" href="' + esc(d.brochure) + '">Descargar ficha (PDF)</a>';
  h += '<a class="btn btn-ghost" href="precios.html">Ver precios y planes</a>';
  if (d) h += '<p style="font-size:.85rem;color:var(--muted);margin:14px 0 0">' + esc(d.format) + ' · ' + esc(d.language) + (d.videoMin ? ' · ≈ ' + d.videoMin + ' min de video' : '') + '. ' + (tool ? '<a href="' + esc(tool) + '" target="_blank" rel="noopener">Abrir ' + esc(d.tool.toUpperCase()) + '</a>' : 'Herramienta disponible desde el aula.') + '</p>';
  h += '</aside></div></section>';
  root.innerHTML = h;
  if (d) {
    var ld = { '@context': 'https://schema.org', '@type': 'Course', name: c.title, description: d.summary, inLanguage: 'es', provider: { '@type': 'Organization', name: 'EPI-LAB' } };
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }
})();
