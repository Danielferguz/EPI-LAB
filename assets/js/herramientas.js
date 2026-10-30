(function () {
  var root = document.getElementById('tools-grid'), T = window.EPI_TOOLS || [], E = window.EPI || {};
  if (!root) return;
  var AREA = { 'epi-methods': 'EPI-METHODS', 'epi-data': 'EPI-DATA', 'epi-causal': 'EPI-CAUSAL', 'epi-evidence': 'EPI-EVIDENCE', 'epi-clinical': 'EPI-CLINICAL', 'epi-research': 'EPI-RESEARCH' };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  root.innerHTML = T.map(function (t) {
    var u = E.tools && E.tools[t.id];
    return '<article class="toolcard rv"><div class="eyebrow">' + esc(t.tag) + '</div><h3>' + esc(t.name) + '</h3><p class="tg">' + esc(t.desc) + '</p>' +
      '<div class="chipbar">' + t.topics.map(function (x) { return '<span class="k">' + esc(x) + '</span>'; }).join('') + '</div>' +
      '<p class="meta">Se usa en: ' + t.routes.map(function (r) { return '<a href="cursos.html#' + r + '">' + AREA[r] + '</a>'; }).join(' · ') + '</p>' +
      (u ? '<a class="btn btn-primary" href="' + esc(u) + '" target="_blank" rel="noopener">Abrir ' + esc(t.name) + '</a>' : '<span class="btn btn-ghost is-off" aria-disabled="true">Disponible desde el aula virtual</span>') + '</article>';
  }).join('');
  // animación de entrada para contenido insertado
  [].forEach.call(root.querySelectorAll('.rv'), function (e) { e.classList.add('in'); });
})();
