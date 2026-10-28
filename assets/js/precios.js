(function () {
  var root = document.getElementById('plans'); if (!root) return;
  var E = window.EPI || {}, P = E.prices || {}, cur = P.currency || 'USD';
  function m(n) { return n == null ? 'Por anunciar' : new Intl.NumberFormat('es', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n); }
  function btn(label, href, hot) { return href ? '<a class="btn ' + (hot ? 'btn-primary' : 'btn-ghost') + '" href="' + href + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>' : '<a class="btn btn-ghost" href="contacto.html?tema=Planes">Avísame</a>'; }
  var shop = E.shop || E.virtualClassroom || '';
  var plans = [
    { h: 'Curso', p: m(P.course), s: 'por curso', li: ['Videos, lecturas y talleres', P.toolsIncludedMonths + ' meses de herramientas incluidos', 'Certificado de finalización'], b: btn('Ver cursos', 'cursos.html', true), hot: true },
    { h: 'Herramientas · mensual', p: m(P.toolsMonth), s: 'por persona y mes', li: ['Acceso a todas las herramientas', 'Cancela cuando quieras'], b: btn('Suscribirme', shop) },
    { h: 'Herramientas · anual', p: m(P.toolsYear), s: 'por persona y año', li: ['Acceso a todas las herramientas', 'Ahorro frente al plan mensual'], b: btn('Suscribirme', shop) },
    { h: 'Grupos', p: m(P.groupPerPersonMonth), s: 'por persona y mes · desde ' + (P.groupMinSeats || 5) + ' personas', li: ['Cursos y herramientas para equipos', 'Una factura para todo el grupo'], b: '<a class="btn btn-ghost" href="contacto.html?tema=Plan%20grupal">Pedir cotización</a>' }
  ];
  root.innerHTML = plans.map(function (x) { return '<article class="plan' + (x.hot ? ' hot' : '') + '"><h3>' + x.h + '</h3><div class="price">' + x.p + ' <small>' + x.s + '</small></div><ul>' + x.li.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' + x.b + '</article>'; }).join('');
})();
