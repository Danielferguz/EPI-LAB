/* Carga una unidad del curso y muestra solo un tema (fragmento) con el motor del aula. Uso: tema.html?u=<unidad>&n=<n.º de tema> */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), u = q.get('u') || '', n = +q.get('n'), cat = window.EPI_CATALOGO || [], t = null;
  if (!/^[a-z0-9-]+$/i.test(u)) return;
  cat.forEach(function (c) { c.u.forEach(function (x) { if (x.id === u) x.temas.forEach(function (y) { if (y.n === n) t = y; }); }); });
  if (!t) { document.getElementById('app').textContent = 'Tema no encontrado.'; return; }
  var L = ['guardia.js', 'vendor/katex/katex.min.js', 'widgets.js', 'anim.js', 'anim2.js', 'anim3.js', 'anim4.js', 'plantillas.js'].map(function (f) { return 'motor/' + f; }).concat(['u/' + u + '.js']);
  (function sig(i) {
    if (i === L.length) { window.TEMA = { n: n, tipo: { s: 'slides', l: 'lectura', p: 'practica', q: 'quiz' }[t.k], a: t.a, b: t.b }; var s = document.createElement('script'); s.src = 'motor/aula.js'; document.body.appendChild(s); return; }
    var s = document.createElement('script'); s.src = L[i]; s.onload = function () { sig(i + 1); }; s.onerror = function () { sig(i + 1); }; document.body.appendChild(s);
  })(0);
})();
