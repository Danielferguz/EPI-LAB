/* EPI-LAB Academia · lógica del catálogo, el reproductor de cursos y el certificado.
   Datos: window.EPI_CATALOGO (generado por construir_academia.py) y window.EPI_CONFIG. Progreso: solo en este navegador (localStorage).
   Acceso: si el servidor ofrece api/me (Cloudflare Access + matrículas) se muestran solo los cursos del usuario; si no, el aula es abierta. */
(function () {
  'use strict';
  var CAT = window.EPI_CATALOGO || [], CFG = window.EPI_CONFIG || {}, P = document.body.dataset.p;
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var AREAS = { 'EPI-METHODS': ['#2E79C7', 'Métodos de investigación', 'Diseño, sesgos, tamaño de muestra y lectura crítica.'], 'EPI-CLINICAL': ['#2C8A57', 'Epidemiología clínica', 'De la pregunta clínica a la decisión con pacientes.'],
    'EPI-DATA': ['#2F7F92', 'Datos y estadística', 'Estadística, R y análisis con las herramientas EPI.'], 'EPI-CAUSAL': ['#6F4FB8', 'Inferencia causal', 'Confusión, grafos, puntajes de propensión y g-métodos.'],
    'EPI-EVIDENCE': ['#C9801A', 'Evidencia y revisiones', 'Búsqueda, riesgo de sesgo, metaanálisis y GRADE.'], 'EPI-RESEARCH': ['#8B2E3B', 'Escritura y gestión de la investigación', 'Protocolos, reporte, ética y ciencia abierta.'] };

  /* ── progreso (por tema) ── */
  function hechos(u) { try { return JSON.parse(localStorage.getItem('epi-aula-t:' + u) || '[]'); } catch (e) { return []; } }
  function marcar(u, n, v) { var a = hechos(u), k = a.indexOf(n); if (v && k < 0) a.push(n); if (!v && k > -1) a.splice(k, 1); try { localStorage.setItem('epi-aula-t:' + u, JSON.stringify(a)); } catch (e) { } }
  function cursoStats(c) { var t = 0, d = 0; c.u.forEach(function (u) { var h = hechos(u.id); u.temas.forEach(function (x) { t++; if (h.indexOf(x.n) > -1) d++; }); }); return { total: t, hechos: d, pct: t ? Math.round(100 * d / t) : 0 }; }
  function horas(c) { var m = c.u.reduce(function (s, u) { return s + (u.m || 30); }, 0); return Math.round(m / 30) / 2; }

  /* ── acceso ── */
  function acceso() {
    return fetch('api/me', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return { modo: 'seguro', email: j.email || '', cursos: j.cursos || [], admin: !!j.admin }; }).catch(function () { return { modo: 'abierto', email: '', cursos: null, admin: false }; });
  }
  function permite(a, id) { return !a.cursos || a.admin || a.cursos.indexOf('*') > -1 || a.cursos.indexOf(id) > -1; }
  function usuario(a) { return a.email ? '<span class="user"><b>' + esc(a.email) + '</b><a href="/cdn-cgi/access/logout">Salir</a></span>' : ''; }
  function barra(a, extra) { return '<div class="nav"><a class="brand" href="index.html"><b>EPI</b>-LAB <span style="font-weight:600;color:var(--mut)">Academia</span></a>' + (extra || '') + '<span class="sp"></span>' + (CFG.sitio ? '<a class="s" href="' + esc(CFG.sitio) + '">Sitio EPI-LAB</a>' : '') + usuario(a) + '</div>'; }

  /* ── catálogo ── */
  function catalogo(a) {
    var mis = CAT.filter(function (c) { return permite(a, c.id); });
    var ult = null; try { ult = JSON.parse(localStorage.getItem('epi-aula-ult') || 'null'); } catch (e) { }
    var uc = ult && mis.filter(function (c) { return c.id === ult.c; })[0];
    var html = barra(a) + '<div class="wrap"><div class="hero"><div><h1>Tus cursos</h1><p>' + (a.modo === 'seguro' ? 'Cursos asignados a tu cuenta.' : 'Aula abierta: todos los cursos están disponibles por ahora.') + ' Avanza a tu ritmo: cada curso tiene unidades y cada unidad, varios temas con diapositivas animadas, lectura, práctica y cuestionario.</p></div><img src="motor/mascota/saludar.webp" alt=""></div>';
    if (uc) { var s0 = cursoStats(uc); html += '<div class="cont"><div><small>Continúa donde lo dejaste</small><b>' + esc(uc.t) + '</b> · ' + s0.pct + ' %</div><a class="btn" href="curso.html?c=' + uc.id + '&u=' + encodeURIComponent(ult.u) + '&n=' + ult.n + '">Continuar →</a></div>'; }
    if ((CFG.recursos || []).length) html += '<details class="area" style="--a:#6F4FB8"><summary><h2>Material de apoyo</h2><span class="n">' + CFG.recursos.length + ' archivos</span></summary><p class="ad">Datos, plantillas de Quarto y código en R con sus resultados.</p><ul style="margin:0 0 24px;padding-left:20px;display:grid;gap:6px">' + CFG.recursos.map(function (r) { return '<li><a href="' + esc(r.href) + '"' + (/\.(qmd|zip)$/.test(r.href) ? ' download' : ' target="_blank" rel="noopener"') + '>' + esc(r.t) + '</a></li>'; }).join('') + '</ul></details>';
    html += '<div class="tools"><input id="q" type="search" placeholder="Buscar un curso o un tema…" aria-label="Buscar"></div><div id="lst"></div></div>';
    $('#app').innerHTML = html;
    function pintar(q) {
      q = (q || '').toLowerCase().trim(); var out = '', n = 0;
      Object.keys(AREAS).forEach(function (ar) {
        var cs = mis.filter(function (c) { return c.area === ar && (!q || (c.t + ' ' + c.d + ' ' + c.u.map(function (u) { return u.t + ' ' + u.temas.map(function (x) { return x.t; }).join(' '); }).join(' ')).toLowerCase().indexOf(q) > -1); });
        if (!cs.length) return; n += cs.length; var A = AREAS[ar];
        out += '<details class="area" open style="--a:' + A[0] + '"><summary><h2>' + esc(A[1]) + '</h2><span class="n">' + cs.length + (cs.length === 1 ? ' curso' : ' cursos') + '</span></summary><p class="ad">' + esc(A[2]) + '</p><div class="cards">' + cs.map(function (c) {
          var s = cursoStats(c), nt = s.total; return '<a class="cc" style="--a:' + A[0] + '" href="curso.html?c=' + c.id + '"><div class="band"></div><div class="cb"><h3>' + esc(c.t) + '</h3><p>' + esc(c.d) + '</p><div class="meta"><span>' + c.u.length + ' unidades</span><span>' + nt + ' temas</span><span>≈ ' + horas(c) + ' h</span></div></div><div class="foot"><div class="bar"><i style="width:' + s.pct + '%"></i></div><span>' + (s.pct === 100 ? 'Completo ✓' : s.pct + ' %') + '</span></div></a>';
        }).join('') + '</div></details>';
      });
      $('#lst').innerHTML = n ? out : '<div class="vacio">' + (mis.length ? 'No hay cursos que coincidan con tu búsqueda.' : 'Todavía no tienes cursos asignados. Escribe a EPI-LAB para activar tu acceso' + (a.email ? ' (' + esc(a.email) + ').' : '.')) + '</div>';
    }
    pintar(''); $('#q').addEventListener('input', function () { pintar(this.value); });
  }

  /* ── reproductor ── */
  function plano(c) { var r = []; c.u.forEach(function (u) { u.temas.forEach(function (x) { r.push({ u: u, x: x }); }); }); return r; }
  var TIPOS = { s: 'Diapositivas', l: 'Lectura', p: 'Práctica', q: 'Cuestionario' };
  function curso(a) {
    var q = new URLSearchParams(location.search), c = CAT.filter(function (z) { return z.id === q.get('c'); })[0];
    if (!c || !permite(a, c.id)) { $('#app').innerHTML = barra(a) + '<div class="denegado"><h1>' + (c ? 'No tienes acceso a este curso' : 'Curso no encontrado') + '</h1><p>' + (c ? 'Tu cuenta no tiene este curso asignado. Escribe a EPI-LAB para activarlo.' : 'Revisa el enlace o vuelve al catálogo.') + '</p><a class="btn" href="index.html">Volver a mis cursos</a></div>'; return; }
    var L = plano(c), cur = 0, ui = q.get('u'), un = +q.get('n');
    if (ui) { var i0 = L.findIndex(function (z) { return z.u.id === ui && z.x.n === un; }); if (i0 > -1) cur = i0; }
    else { var i1 = L.findIndex(function (z) { return hechos(z.u.id).indexOf(z.x.n) < 0; }); cur = i1 > -1 ? i1 : 0; }
    document.title = c.t + ' · EPI-LAB Academia';
    $('#app').innerHTML = barra(a, '<button class="btn ghost sm burger" id="bg" aria-label="Contenido del curso">☰ Contenido</button>') +
      '<div class="player"><aside class="side" id="sd"></aside><section class="mainp"><header><div class="tt"><small id="mi"></small><h1 id="mt"></h1></div><span class="user" id="mp"></span></header><iframe id="fr" title="Tema del curso" allow="fullscreen" allowfullscreen></iframe><div class="pie"><button class="btn ghost" id="ant">← Anterior</button><button class="btn ghost" id="mk"></button><span class="sp"></span><button class="btn" id="sig">Siguiente →</button></div></section></div><div class="toast" id="ts"></div>';
    function lateral() {
      var s = cursoStats(c), act = L[cur];
      $('#sd').innerHTML = '<div class="sh"><h2>' + esc(c.t) + '</h2><div class="bar"><i style="width:' + s.pct + '%"></i></div><small>' + s.hechos + ' de ' + s.total + ' temas completados · ' + s.pct + ' %</small></div>' + c.u.map(function (u) {
        var hh = hechos(u.id), d = u.temas.filter(function (x) { return hh.indexOf(x.n) > -1; }).length, open = u.id === act.u.id;
        return '<div class="un' + (open ? ' open' : '') + (d === u.temas.length ? ' hecha' : '') + '" data-u="' + u.id + '"><button type="button"><b>' + esc(u.t) + '</b><span>' + u.temas.length + ' temas · ' + (u.m || 30) + ' min</span><em>' + (d === u.temas.length ? '✓ ' : '') + d + '/' + u.temas.length + '</em></button><ol>' + u.temas.map(function (x) {
          return '<li><a href="#" data-u="' + u.id + '" data-n="' + x.n + '" class="' + (hh.indexOf(x.n) > -1 ? 'hecho ' : '') + (open && x.n === act.x.n ? 'act' : '') + '"><span class="ck">' + (hh.indexOf(x.n) > -1 ? '✓' : '') + '</span><span>' + esc(x.t) + '</span><span class="ty">' + TIPOS[x.k] + '</span></a></li>'; }).join('') + '</ol></div>'; }).join('');
      $('#mp').innerHTML = '<span>' + s.pct + ' %</span>';
    }
    function cargar(push) {
      var z = L[cur], d = hechos(z.u.id).indexOf(z.x.n) > -1;
      $('#fr').src = 'tema.html?u=' + encodeURIComponent(z.u.id) + '&n=' + z.x.n;
      $('#mi').textContent = z.u.t + ' · tema ' + z.x.n + ' de ' + z.u.temas.length + ' · ' + TIPOS[z.x.k]; $('#mt').textContent = z.x.t;
      $('#ant').disabled = cur === 0; $('#ant').textContent = cur > 0 && L[cur - 1].u.id !== z.u.id ? '← Unidad anterior' : '← Tema anterior'; var ult = cur === L.length - 1;
      var sg = $('#sig'); sg.textContent = ult ? 'Finalizar curso 🎓' : (L[cur + 1].u.id !== z.u.id ? 'Siguiente unidad →' : 'Siguiente tema →');
      $('#mk').textContent = d ? '✓ Completado' : 'Marcar como completado'; $('#mk').className = 'btn ' + (d ? 'ok' : 'ghost');
      lateral(); try { localStorage.setItem('epi-aula-ult', JSON.stringify({ c: c.id, u: z.u.id, n: z.x.n })); history[push ? 'pushState' : 'replaceState'](null, '', 'curso.html?c=' + c.id + '&u=' + encodeURIComponent(z.u.id) + '&n=' + z.x.n); } catch (e) { }
      $('#sd').classList.remove('on');
    }
    function toast(t) { var e = $('#ts'); e.textContent = t; e.classList.add('on'); setTimeout(function () { e.classList.remove('on'); }, 2200); }
    function hecho(v) { var z = L[cur]; marcar(z.u.id, z.x.n, v); cargarEstado(); }
    function cargarEstado() { var z = L[cur], d = hechos(z.u.id).indexOf(z.x.n) > -1; $('#mk').textContent = d ? '✓ Completado' : 'Marcar como completado'; $('#mk').className = 'btn ' + (d ? 'ok' : 'ghost'); lateral(); }
    $('#mk').onclick = function () { var z = L[cur]; hecho(hechos(z.u.id).indexOf(z.x.n) < 0); };
    $('#ant').onclick = function () { if (cur > 0) { cur--; cargar(true); } };
    $('#sig').onclick = function () {
      var z = L[cur]; marcar(z.u.id, z.x.n, true);
      if (cur < L.length - 1) { cur++; cargar(true); } else if (cursoStats(c).pct === 100) location.href = 'certificado.html?c=' + c.id; else { cargarEstado(); toast('Aún quedan temas por completar'); }
    };
    $('#sd').addEventListener('click', function (e) {
      var l = e.target.closest('a[data-n]'), b = e.target.closest('.un > button');
      if (l) { e.preventDefault(); var i = L.findIndex(function (z) { return z.u.id === l.dataset.u && z.x.n === +l.dataset.n; }); if (i > -1) { cur = i; cargar(true); } }
      else if (b) b.parentNode.classList.toggle('open');
    });
    $('#bg').onclick = function () { $('#sd').classList.toggle('on'); };
    window.addEventListener('message', function (e) {
      if (e.source !== $('#fr').contentWindow || !e.data || e.data.epi !== 'tema') return;
      var z = L[cur]; if (e.data.u !== z.u.id || e.data.n !== z.x.n) return;
      if (hechos(z.u.id).indexOf(z.x.n) < 0) { marcar(z.u.id, z.x.n, true); cargarEstado(); toast('Tema completado ✓'); }
    });
    window.addEventListener('popstate', function () { location.reload(); });
    cargar(false);
  }

  /* ── certificado ── */
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36).toUpperCase().padStart(7, '0'); }
  var LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="26" width="6" height="26" rx="1.5" fill="#4D4D4D"/><rect x="20" y="18" width="6" height="34" rx="1.5" fill="#5BA7B8"/><rect x="30" y="34" width="6" height="18" rx="1.5" fill="#5BA7B8"/><rect x="40" y="42" width="6" height="10" rx="1.5" fill="#4D4D4D"/><circle cx="22" cy="10" r="6" fill="#8B2E3B"/><circle cx="52" cy="40" r="5" fill="#5BA7B8"/></svg>';
  function certificado(a) {
    var q = new URLSearchParams(location.search), c = CAT.filter(function (z) { return z.id === q.get('c'); })[0], vista = q.get('vista') === '1';
    if (!c || !permite(a, c.id)) { $('#app').innerHTML = barra(a) + '<div class="denegado"><h1>Curso no disponible</h1><a class="btn" href="index.html">Volver a mis cursos</a></div>'; return; }
    var s = cursoStats(c), nt = c.u.reduce(function (z, u) { return z + u.temas.length; }, 0);
    if (s.pct < 100 && !vista) { $('#app').innerHTML = barra(a) + '<div class="denegado"><h1>Aún no completas el curso</h1><p>Llevas ' + s.hechos + ' de ' + s.total + ' temas (' + s.pct + ' %). Al completar todos los temas podrás generar tu certificado.</p><div class="bar" style="margin:0 0 20px"><i style="width:' + s.pct + '%"></i></div><a class="btn" href="curso.html?c=' + c.id + '">Seguir con el curso</a></div>'; return; }
    var nom = ''; try { nom = localStorage.getItem('epi-aula-nombre') || ''; } catch (e) { }
    $('#app').innerHTML = barra(a) + '<div class="cert-wrap"><div class="cert-form"><h2>Tu certificado de finalización</h2><p style="margin:0;color:var(--mut)">' + (vista ? 'Vista previa (el certificado real exige completar todos los temas). ' : '¡Felicitaciones, completaste el curso! ') + 'Escribe tu nombre tal como quieres que aparezca.</p><label for="nm">Nombre completo</label><input id="nm" value="' + esc(nom) + '" autocomplete="name" maxlength="70"><button class="btn" id="gn" type="button">Generar certificado</button></div><div id="ct"></div></div>';
    function generar() {
      var n = $('#nm').value.trim(); if (!n) { $('#nm').focus(); return; } try { localStorage.setItem('epi-aula-nombre', n); } catch (e) { }
      var f = new Date(), fs = f.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }), cod = 'EPI-' + hash(n.toLowerCase() + '|' + c.id + '|' + f.toISOString().slice(0, 10));
      $('#ct').innerHTML = '<div class="cert"><div class="logo">' + LOGO + '<span><b>EPI</b>-LAB</span></div><div class="cuerpo"><div class="ti">Certificado de finalización</div><div class="pre">EPI-LAB certifica que</div><div class="nom">' + esc(n) + '</div><div class="pre">completó el curso</div><div class="cur">' + esc(c.t) + '</div><div class="det">' + c.u.length + ' unidades · ' + nt + ' temas · ' + horas(c) + ' horas académicas estimadas</div></div><div class="pie2"><div><b>Fecha de emisión</b><br>' + fs + '<br><b>Código</b> ' + cod + (CFG.firmante ? '<br><b>' + esc(CFG.firmante) + '</b>' + (CFG.respaldo ? '<br>' + esc(CFG.respaldo) : '') : '') + '</div><div class="sello">EPI-<br>LAB</div><div style="text-align:right"><b>' + esc(CFG.web || 'EPI-LAB') + '</b><br>Material educativo con datos simulados.<br>Constancia autogenerada a partir del progreso registrado.</div></div></div><p class="cert-act" style="text-align:center;margin-top:18px"><button class="btn" id="pdf" type="button">Descargar PDF / Imprimir</button> <a class="btn ghost" href="index.html">Volver a mis cursos</a></p>';
      $('#pdf').onclick = function () { window.print(); }; $('#ct').scrollIntoView({ behavior: 'smooth' });
    }
    $('#gn').onclick = generar; $('#nm').addEventListener('keydown', function (e) { if (e.key === 'Enter') generar(); });
  }

  acceso().then(function (a) { if (P === 'catalogo') catalogo(a); else if (P === 'curso') curso(a); else if (P === 'cert') certificado(a); });
})();
