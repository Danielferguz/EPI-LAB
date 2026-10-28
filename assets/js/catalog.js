(function () {
  var root = document.getElementById('catalog');
  var data = window.EPI_COURSES;
  if (!root || !data) return;
  var ICONS = window.EPI_ICONS || {};
  var R = {
    'epi-methods': { n: 'EPI-METHODS', c1: '#2F7F92', c2: '#1F5F6F' },
    'epi-data': { n: 'EPI-DATA', c1: '#4A98AA', c2: '#2F7F92' },
    'epi-causal': { n: 'EPI-CAUSAL', c1: '#8B2E3B', c2: '#5E1F29' },
    'epi-evidence': { n: 'EPI-EVIDENCE', c1: '#3A8294', c2: '#2E3338' },
    'epi-clinical': { n: 'EPI-CLINICAL', c1: '#5C6368', c2: '#2E3338' },
    'epi-research': { n: 'EPI-RESEARCH', c1: '#A5495A', c2: '#8B2E3B' }
  };
  var CATS = [
    { name: 'Fundamentos de la investigación clínica', sub: 'Diseño, metodología y epidemiología clínica', routes: ['epi-methods', 'epi-clinical'] },
    { name: 'Análisis de datos e inferencia causal', sub: 'Estadística, modelos y causalidad', routes: ['epi-data', 'epi-causal'] },
    { name: 'Evidencia y publicación científica', sub: 'Síntesis de evidencia, escritura y publicación', routes: ['epi-evidence', 'epi-research'] }
  ];
  var STATUS = { abierto: 'Inscripción abierta', proximo: 'Próximamente', agotado: 'Cupos agotados' };
  var flat = root.getAttribute('data-flat') === '1';
  var st = { route: 'all', level: 'all', q: '', view: root.getAttribute('data-view') || 'cards' };
  var grid = document.getElementById('cgrid'), count = document.getElementById('ccount');
  var dlg = document.getElementById('course-dialog');
  var E = window.EPI || {};

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function fmt(d) {
    if (!d) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (!m) return d;
    return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function card(c) {
    var r = R[c.route], when = fmt(c.date) || 'Fecha por anunciar';
    return '<article class="ccard" style="--c1:' + r.c1 + ';--c2:' + r.c2 + '">' +
      '<div class="cband"><span class="badge">' + STATUS[c.status] + '</span><span class="ic">' + (ICONS[c.route] || '') + '</span></div>' +
      '<div class="cbody"><div class="cmeta"><span class="lvl">' + r.n + '</span></div><h3>' + esc(c.title) + '</h3>' +
      '<div class="cmeta"><span>' + c.level + '</span><span>' + esc(when) + '</span>' + (c.duration ? '<span>' + esc(c.duration) + '</span>' : '') + '</div>' +
      '<button class="btn btn-ghost" data-id="' + c.id + '">Más información</button>' + (window.EPI_COURSE_DETAILS && window.EPI_COURSE_DETAILS[c.id] ? ' <a class="btn btn-primary" href="curso.html?c=' + c.id + '">Ver curso</a>' : '') + '</div></article>';
  }

  function render() {
    var q = norm(st.q);
    var rows = data.filter(function (c) {
      return (st.route === 'all' || c.route === st.route) && (st.level === 'all' || c.level === st.level) &&
        (!q || norm(c.title + ' ' + c.desc).indexOf(q) > -1);
    });
    count.textContent = rows.length + (rows.length === 1 ? ' curso' : ' cursos');
    if (!rows.length) { grid.className = ''; grid.innerHTML = '<div class="empty">No encontramos cursos con esos filtros.</div>'; return; }
    var cls = 'cgrid' + (st.view === 'list' ? ' list' : '');
    if (flat) {
      rows = rows.slice().sort(function (a, b) { return (a.date || '9999') < (b.date || '9999') ? -1 : 1; });
      grid.className = ''; grid.innerHTML = '<div class="' + cls + '">' + rows.map(card).join('') + '</div>'; return;
    }
    grid.className = '';
    grid.innerHTML = CATS.map(function (cat) {
      var items = rows.filter(function (c) { return cat.routes.indexOf(c.route) > -1; });
      if (!items.length) return '';
      return '<section class="cat-block"><div class="cat-title"><h3>' + cat.name + '</h3><span>' + cat.sub + '</span></div><div class="' + cls + '">' + items.map(card).join('') + '</div></section>';
    }).join('');
  }

  function openCourse(id) {
    var c = data.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var r = R[c.route], wa = (E.whatsapp || '').replace(/\D/g, '');
    var contact = 'contacto.html?tema=' + encodeURIComponent(r.n);
    dlg.innerHTML = '<div><div class="dlg-head" style="--c1:' + r.c1 + ';--c2:' + r.c2 + '"><span class="badge">' + r.n + ' · ' + STATUS[c.status] + '</span><h3>' + esc(c.title) + '</h3>' +
      '<span class="dlg-ic">' + (ICONS[c.route] || '') + '</span><button class="dlg-x" aria-label="Cerrar" data-close>×</button></div>' +
      '<div class="dlg-body"><p>' + esc(c.desc) + '</p><dl><dt>Nivel</dt><dd>' + c.level + '</dd><dt>Inicio</dt><dd>' + esc(fmt(c.date) || 'Por anunciar') + '</dd><dt>Duración</dt><dd>' + esc(c.duration || 'Por definir') + '</dd><dt>Área</dt><dd>' + r.n + '</dd></dl>' +
      '<div class="btn-row" style="margin:0">' + (window.EPI_COURSE_DETAILS && window.EPI_COURSE_DETAILS[c.id] ? '<a class="btn btn-primary" href="curso.html?c=' + c.id + '">Ver curso completo</a><a class="btn btn-ghost" href="' + contact + '">Solicitar información</a>' : '<a class="btn btn-primary" href="' + contact + '">Solicitar información</a>') +
      (wa ? '<a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent('Hola EPI-LAB, me interesa: ' + c.title) + '">WhatsApp</a>' : '') + '</div></div></div>';
    dlg.showModal();
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.id) openCourse(b.dataset.id);
    else if (b.dataset.route) { st.route = b.dataset.route; sync(); render(); }
    else if (b.dataset.view) { st.view = b.dataset.view; sync(); render(); }
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.hasAttribute('data-close')) dlg.close(); });
  document.getElementById('cq').addEventListener('input', function (e) { st.q = e.target.value; render(); });
  document.getElementById('clevel').addEventListener('change', function (e) { st.level = e.target.value; render(); });

  function sync() {
    root.querySelectorAll('[data-route]').forEach(function (b) { b.classList.toggle('on', b.dataset.route === st.route); });
    root.querySelectorAll('[data-view]').forEach(function (b) { b.classList.toggle('on', b.dataset.view === st.view); });
  }
  function fromHash() {
    var h = location.hash.replace('#', '');
    if (R[h]) { st.route = h; sync(); render(); }
  }
  window.addEventListener('hashchange', fromHash);
  sync(); render(); fromHash();
})();
