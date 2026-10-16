(function () {
  var root = document.getElementById('catalog');
  var data = window.EPI_COURSES;
  if (!root || !data) return;
  var R = {
    'epi-methods': { n: 'EPI-METHODS', c1: '#134E9C', c2: '#0A2540' },
    'epi-data': { n: 'EPI-DATA', c1: '#3B82D6', c2: '#134E9C' },
    'epi-causal': { n: 'EPI-CAUSAL', c1: '#0F3A6D', c2: '#071A33' },
    'epi-evidence': { n: 'EPI-EVIDENCE', c1: '#1D63C9', c2: '#0F3A6D' }
  };
  var STATUS = { abierto: 'Inscripción abierta', proximo: 'Próximamente', agotado: 'Cupos agotados' };
  var st = { route: 'all', level: 'all', q: '', view: 'cards' };
  var grid = document.getElementById('cgrid'), count = document.getElementById('ccount');
  var dlg = document.getElementById('course-dialog');
  var E = window.EPI || {};

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function render() {
    var q = norm(st.q);
    var rows = data.filter(function (c) {
      return (st.route === 'all' || c.route === st.route) && (st.level === 'all' || c.level === st.level) &&
        (!q || norm(c.title + ' ' + c.desc).indexOf(q) > -1);
    });
    count.textContent = rows.length + (rows.length === 1 ? ' curso' : ' cursos');
    grid.className = 'cgrid' + (st.view === 'list' ? ' list' : '');
    if (!rows.length) { grid.innerHTML = '<div class="empty">No encontramos cursos con esos filtros.</div>'; return; }
    grid.innerHTML = rows.map(function (c) {
      var r = R[c.route];
      var when = c.date || 'Fecha por anunciar';
      return '<article class="ccard" style="--c1:' + r.c1 + ';--c2:' + r.c2 + '">' +
        '<div class="cband"><span>' + r.n + '</span><span class="badge">' + STATUS[c.status] + '</span></div>' +
        '<div class="cbody"><h3>' + esc(c.title) + '</h3>' +
        '<div class="cmeta"><span class="lvl">' + c.level + '</span><span>' + esc(when) + '</span>' + (c.duration ? '<span>' + esc(c.duration) + '</span>' : '') + '</div>' +
        '<button class="btn btn-ghost" data-id="' + c.id + '">Más información</button></div></article>';
    }).join('');
  }

  function openCourse(id) {
    var c = data.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var r = R[c.route];
    var wa = (E.whatsapp || '').replace(/\D/g, '');
    var contact = 'contacto.html?tema=' + encodeURIComponent(r.n);
    dlg.innerHTML = '<div style="position:relative"><div class="dlg-head" style="--c1:' + r.c1 + ';--c2:' + r.c2 + '"><span class="badge">' + r.n + ' · ' + STATUS[c.status] + '</span><h3>' + esc(c.title) + '</h3>' +
      '<button class="dlg-x" aria-label="Cerrar" data-close>×</button></div>' +
      '<div class="dlg-body"><p>' + esc(c.desc) + '</p><dl><dt>Nivel</dt><dd>' + c.level + '</dd><dt>Inicio</dt><dd>' + esc(c.date || 'Por anunciar') + '</dd><dt>Duración</dt><dd>' + esc(c.duration || 'Por definir') + '</dd><dt>Ruta</dt><dd>' + r.n + '</dd></dl>' +
      '<div class="btn-row" style="margin:0"><a class="btn btn-primary" href="' + contact + '">Solicitar información</a>' +
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
