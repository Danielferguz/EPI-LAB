/* EPI-LAB · reproductor de unidades: diapositivas interactivas, lectura, práctica y cuestionario.
   Lee window.UNIDAD (ver construir.py). Progreso solo en este navegador (localStorage). */
(function () {
  'use strict';
  var U = window.UNIDAD, W = window.EPI_W || {}, root = document.getElementById('app');
  if (!U || !root) return;
  var T = window.TEMA; // modo tema (academia): solo se muestra un fragmento de la unidad y se avisa a la página contenedora al terminarlo
  if (T) { U = Object.assign({}, U, { base: U.id, id: U.id + '.t' + T.n }); if (T.tipo === 'slides') U.slides = U.slides.slice(T.a, T.b + 1); document.documentElement.classList.add('tema'); }
  var hechoTema = 0; function hecho() { if (T && !hechoTema) { hechoTema = 1; try { parent.postMessage({ epi: 'tema', u: U.base, n: T.n }, '*'); } catch (e) { } } }
  try { document.documentElement.setAttribute('data-area', String(U.area || '').toLowerCase().replace(/^epi-/, '').replace(/[^a-z]/g, '')); } catch (e) { }
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var KEY = 'epi-aula:' + U.id, st = { vistas: [], practica: [], quiz: null };
  try { var g = JSON.parse(localStorage.getItem(KEY) || 'null'); if (g) st = g; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var nS = U.slides.length, nP = (U.practica || []).length, hasQ = (U.quiz || []).length > 0;

  /* ── marco ── */
  root.innerHTML = '<div class="shell"><div class="top"><div class="top-row"><a class="brand" href="' + (U.indice || '#') + '"' + (U.indice ? '' : ' aria-disabled="true"') + '><b>EPI</b>-LAB</a><div class="crumb">' + U.curso + ' <span>· ' + U.unidad + '</span></div><div class="prog" role="progressbar" aria-label="Progreso de la unidad" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="pct" id="pct">0 %</div></div>' +
    '<div class="tabs" role="tablist"><button role="tab" data-t="slides">Diapositivas</button><button role="tab" data-t="lectura">Lectura</button><button role="tab" data-t="practica">Práctica</button><button role="tab" data-t="quiz">Cuestionario</button></div></div>' +
    '<h1 class="ut">' + U.titulo + '</h1><p class="lead">' + (U.resumen || '') + '</p>' +
    '<section class="panel" id="p-slides"></section><section class="panel" id="p-lectura" hidden></section><section class="panel" id="p-practica" hidden></section><section class="panel" id="p-quiz" hidden></section></div>';
  function progreso() {
    var partes = [nS ? st.vistas.length / nS : 1, nP ? st.practica.length / nP : 1, hasQ ? ((st.quiz && st.quiz.pct) || 0) / 100 : 1], p = Math.round(100 * (partes[0] * 0.4 + (U.lectura ? (st.leida ? 0.1 : 0) : 0.1) + partes[1] * 0.2 + partes[2] * 0.3));
    $('.prog i').style.width = p + '%'; $('#pct').textContent = p + ' %'; $('.prog').setAttribute('aria-valuenow', p);
    try { localStorage.setItem('epi-aula-p:' + U.id, p); } catch (e) { }
  }

  /* ── pestañas ── */
  function tab(t) {
    [].forEach.call(document.querySelectorAll('.tabs button'), function (b) { b.setAttribute('aria-selected', b.dataset.t === t); });
    ['slides', 'lectura', 'practica', 'quiz'].forEach(function (k) { $('#p-' + k).hidden = k !== t; });
    if (t === 'lectura') { st.leida = 1; save(); progreso(); if (T && T.tipo === 'lectura') setTimeout(hecho, 8000); }
    if (!T) try { history.replaceState(null, '', '#' + t); } catch (e) { }
  }
  $('.tabs').addEventListener('click', function (e) { if (e.target.dataset.t) tab(e.target.dataset.t); });

  /* ── diapositivas ── */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Fórmulas: $...$ (en línea) y $$...$$ (destacadas) con KaTeX si está cargado. */
  function kt(t, d) { var k = window.katex; if (!k) return '<code>' + esc(t) + '</code>'; try { return k.renderToString(t, { throwOnError: false, displayMode: !!d, strict: false }); } catch (e) { return esc(t); } }
  function hlR(c) { // resaltado mínimo de R (comentarios, textos, números, funciones y operadores)
    return String(c).replace(/(#.*$)|("[^"\n]*"|'[^'\n]*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_.][\w.]*)(?=\()|(<-|\|>|%>%|~)|([&<>])/gm, function (m, com, str, num, fn, op, ch) {
      if (ch) return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch];
      var k = com ? 'c' : str ? 's' : num ? 'n' : fn ? 'f' : 'o'; return '<i class="r' + k + '">' + esc(m) + '</i>';
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return; var cb = b.closest('.cb'), t = cb ? cb.querySelector('code').textContent : '';
    function listo() { var o = b.textContent; b.textContent = 'Copiado ✓'; setTimeout(function () { b.textContent = o; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(listo, plan); else plan();
    function plan() { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); listo(); } catch (x) { } document.body.removeChild(a); }
  });
  function mf(h) { return typeof h === 'string' && h.indexOf('$') > -1 ? h.replace(/\$\$([^$]+)\$\$/g, function (_, t) { return kt(t, true); }).replace(/\$([^$\n]+)\$/g, function (_, t) { return kt(t, false); }) : h; }
  function renderTex(box) { [].forEach.call(box.querySelectorAll('.tex'), function (n) { if (window.katex) { try { window.katex.render(n.getAttribute('data-t'), n, { throwOnError: false, displayMode: n.getAttribute('data-d') === '1', strict: false }); } catch (e) { } } }); }
  var CONSTRUIBLES = { points: 1, formula: 1, table: 1, twobox: 1, steps: 1, glosario: 1 };
  function cuerpo(s) {
    var t = s.t, fr = s.build === false ? '' : ' fr';
    if (t === 'points') return '<ul' + (s.kind ? ' class="k-' + s.kind + '"' : '') + '>' + s.items.map(function (i) { return '<li class="' + fr.trim() + '">' + mf(i) + '</li>'; }).join('') + '</ul>';
    if (t === 'formula') return '<div class="fm' + (s.lines.length > 3 ? ' s' : '') + '">' + s.lines.map(function (l) { return '<div class="' + fr.trim() + '">' + mf(l) + '</div>'; }).join('') + '</div>';
    if (t === 'table') return '<table><tr>' + s.head.map(function (h) { return '<th>' + mf(h) + '</th>'; }).join('') + '</tr>' + s.rows.map(function (r) { return '<tr class="' + fr.trim() + '">' + r.map(function (c) { return '<td>' + mf(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    if (t === 'mapa') return '<div class="mapa">' + s.items.map(function (i) { return '<div class="mp f' + i.f + (i.hoy ? ' hoy' : '') + '"><b>' + i.n + '</b><span>' + mf(i.t) + '</span></div>'; }).join('') + '</div>' + (s.fases ? '<p class="mapaf">' + s.fases.map(function (x, k) { return '<i class="f' + k + '"></i>' + mf(x); }).join('') + '</p>' : '');
    if (t === 'twobox') { var b = function (x) { return '<div class="' + fr.trim() + '"><h3>' + mf(x[0]) + '</h3>' + x.slice(1, -1).map(function (y) { return '<p>' + mf(y) + '</p>'; }).join('') + '<p class="big">' + mf(x[x.length - 1]) + '</p></div>'; }; return '<div class="tb">' + b(s.left) + b(s.right) + '</div>'; }
    if (t === 'callout') { var KL = { ejemplo: 'Ejemplo', interpreta: 'Cómo se interpreta', cuidado: 'Ojo con esto', idea: 'Idea clave', resumen: 'En resumen' }; return '<div class="co' + (s.kind ? ' k-' + s.kind : '') + '">' + (s.kind && KL[s.kind] ? '<span class="ck">' + KL[s.kind] + '</span>' : '') + '<div>' + mf(s.body) + '</div></div>'; }
    if (t === 'glosario') return '<div class="glos">' + s.items.map(function (i) { return '<div class="' + fr.trim() + '"><b>' + mf(i[0]) + '</b><span>' + mf(i[1]) + '</span>' + (i[2] ? '<em>' + mf(i[2]) + '</em>' : '') + '</div>'; }).join('') + '</div>';
    if (t === 'paso') return '<div class="paso"><figure><img src="img/' + s.img + '" alt="' + esc(s.alt || s.title) + '" loading="lazy"></figure><div class="pc"><ol class="clics">' + s.clics.map(function (c) { return '<li><span>' + mf(c) + '</span></li>'; }).join('') + '</ol>' +
      (s.ocurre ? '<div class="ocurre"><span class="ot">Qué ocurre</span>' + mf(s.ocurre) + '</div>' : '') + (s.nota ? '<p class="pnota">' + mf(s.nota) + '</p>' : '') + '</div></div>';
    if (t === 'codigo') return '<div class="cod' + (s.img || s.out ? '' : ' solo') + '"><div class="cb"><div class="ch2"><span>' + esc(s.lang || 'R') + '</span><button type="button" class="cp" data-copy>Copiar código</button></div><pre><code>' + hlR(s.code) + '</code></pre></div>' +
      (s.img ? '<div class="co2 im"><img src="img/' + s.img + '" alt="' + esc(s.cap || s.title) + '" loading="lazy"></div>' : s.out ? '<div class="co2"><div class="ch2"><span>Salida en tu consola</span></div><pre>' + esc(s.out) + '</pre></div>' : '') + '</div>' + (s.cap ? '<p class="codcap">' + mf(s.cap) + '</p>' : '');
    if (t === 'shot') return '<div class="shotw"><img src="img/' + s.img + '" alt="' + esc(s.cap || s.title) + '" loading="lazy"><p>' + (s.cap || '') + '</p></div>';
    if (t === 'steps') return '<div class="steps' + (s.items.length > 4 ? ' two' : '') + '">' + s.items.map(function (i) { return '<div class="' + fr.trim() + '"><div><b>' + mf(i[0]) + '</b><span>' + mf(i[1] || '') + '</span></div></div>'; }).join('') + '</div>';
    if (t === 'reveal') return '<div class="rv">' + s.items.map(function (i) { return '<details><summary>' + mf(i[0]) + '</summary><p>' + mf(i[1]) + '</p></details>'; }).join('') + '</div>';
    if (t === 'calc') return '<div class="calc">' + (s.given ? '<div class="given">' + mf(s.given) + '</div>' : '') + s.steps.map(function (p, i) { return '<div class="cs fr' + (p.res ? ' res' : '') + '"><span class="n">' + (i + 1) + '</span><div class="m">' + (p.tex ? kt(p.tex, true) : '') + '</div><div class="e">' + mf(p.say || '') + '</div></div>'; }).join('') + '</div>';
    return '';
  }
  var LIBRES = { widget: 1, check: 1, calc: 1, codigo: 1, paso: 1 };
  /* Mascota: cada tipo de aviso tiene su pose; solo se muestra si la diapositiva deja espacio libre abajo a la derecha. */
  var MB = (function () { var sc = document.currentScript; return sc && sc.src ? sc.src.replace(/[^\/]*$/, '') : ''; })(); // las imágenes de la mascota viven junto a aula.js
  var POSE = { 'callout:ejemplo': 'analista', 'callout:interpreta': 'senalar', 'callout:cuidado': 'detective', 'callout:idea': 'idea', 'callout:resumen': 'celebrando', 'callout': 'orgullosa',
    'points:resumen': 'divulgadora', 'points:cuidado': 'preocupada', 'glosario': 'lectora', 'reveal': 'pensando', 'steps': 'determinada', 'codigo': 'notas', 'paso': 'guia' };
  var POSE_W = { centro: 'analista', dispersion: 'lectora', histograma: 'analista', valorp: 'pensando', sesgoazar: 'detective', arbolpruebas: 'guia', anova: 'analista', pareada: 'notas', rangos: 'exploradora' };
  function pose(s) { return s.m === 0 ? '' : (s.m || POSE[s.t + ':' + (s.kind || '')] || POSE[s.t] || ''); }
  function ajustaMascota(sl, nombre) {
    var st = sl.parentNode; if (!st || !nombre) return; var kids = [].filter.call(sl.children, function (c) { return c.nodeType === 1; }), last = kids[kids.length - 1]; if (!last) return;
    var libre = sl.clientHeight - (last.offsetTop + last.offsetHeight) - 8, hace = st.clientWidth * 0.12;
    if (libre >= hace) sl.classList.add('m-' + nombre);
  }
  function slideEl(s, i) {
    var libre = LIBRES[s.t] ? ' free' : '', stage = el('div', 'stage' + libre), sl = el('div', 'sl' + (s.t === 'title' ? ' cover' : '') + libre);
    if (s.t === 'title') sl.innerHTML = '<div class="eb">EPI-LAB · ' + U.unidad + '</div><h2>' + mf(s.title) + '</h2><p>' + mf(s.sub || U.curso) + '</p>';
    if (s.t === 'title') sl.insertAdjacentHTML('beforeend', '<div class="hola"><div class="bub">¡Hola! Te acompaño en esta unidad. Si algo no queda claro, vuelve atrás y mira el ejemplo.</div><img src="' + MB + 'mascota/saludar.webp" alt="" width="240" height="240"></div>');
    else {
      sl.innerHTML = '<div class="eb">' + U.curso + ' · ' + U.unidad + '</div><h2>' + mf(s.title) + '</h2>';
      if (s.t === 'widget') { var host = el('div', 'card'); sl.appendChild(host); (W[s.w] || function (h) { h.textContent = 'Simulador no disponible.'; })(host, s.cfg || {}); if (s.cap) sl.appendChild(el('p', 'why', mf(s.cap))); }
      else if (s.t === 'check') sl.appendChild(miniQuiz(s.q));
      else sl.insertAdjacentHTML('beforeend', cuerpo(s));
    }
    [].forEach.call(sl.children, function (c, k) { c.style.setProperty('--i', k); });
    if (s.t === 'widget') { var sy = sl.querySelector('.say'); if (sy && (POSE_W[s.w] || 'senalar')) sy.classList.add('m-' + (POSE_W[s.w] || 'senalar')); }
    stage.appendChild(sl); stage._ms = [sl, pose(s)]; return stage;
  }
  function miniQuiz(q) {
    var box = el('div', 'card'); box.innerHTML = '<h4 style="margin:0 0 8px">' + mf(q.q) + '</h4>' + q.o.map(function (o, i) { return '<label class="opt"><input type="radio" name="mq' + Math.random().toString(36).slice(2) + '" value="' + i + '"><span>' + mf(o) + '</span></label>'; }).join('') + '<div class="fbk" aria-live="polite"></div>';
    box.addEventListener('change', function (e) {
      var v = +e.target.value, fb = $('.fbk', box), opts = box.querySelectorAll('.opt'); opts.forEach(function (o, i) { o.classList.toggle('right', i === q.a); o.classList.toggle('wrong', i === v && v !== q.a); });
      fb.innerHTML = '<div class="msg ' + (v === q.a ? 'ok' : 'bad') + '">' + (v === q.a ? 'Correcto. ' : 'Revisa: ') + mf(q.why) + '</div>';
    }); return box;
  }
  var cur = 0, deck = $('#p-slides'), frs = [], rev = 0;
  deck.innerHTML = '<div class="deck"><div id="slot"></div><div class="nav"><button type="button" id="prev">← Anterior</button><div class="dots" id="dots"></div><button type="button" id="fs" aria-label="Pantalla completa" title="Pantalla completa">⛶</button><button type="button" id="next">Siguiente →</button></div><details class="notes" id="nt"><summary>Guion de esta diapositiva</summary><p></p></details></div>';
  var dots = $('#dots'); U.slides.forEach(function (s, i) { var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', 'Diapositiva ' + (i + 1)); b.dataset.i = i; dots.appendChild(b); });
  function etiqueta() {
    var n = $('#next'), ultimo = cur === nS - 1;
    n.textContent = rev < frs.length ? 'Revelar (' + (rev + 1) + '/' + frs.length + ') →' : 'Siguiente →'; n.disabled = ultimo && rev >= frs.length;
    $('#prev').disabled = cur === 0 && rev === 0;
  }
  function show(i, completa) {
    var dir = i >= cur ? 1 : -1; cur = Math.max(0, Math.min(nS - 1, i)); var s = U.slides[cur], stage = slideEl(s, cur);
    stage.classList.add(dir > 0 ? 'dir-next' : 'dir-prev'); $('#slot').replaceChildren(stage);
    if (stage._ms && stage._ms[1]) ajustaMascota(stage._ms[0], stage._ms[1]);
    frs = [].slice.call(stage.querySelectorAll('.fr')); rev = 0; if (completa) { frs.forEach(function (x) { x.classList.add('on'); }); rev = frs.length; }
    [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', k === cur); d.classList.toggle('seen', st.vistas.indexOf(k) > -1); });
    var nt = $('#nt'); nt.style.display = s.n ? '' : 'none'; $('p', nt).textContent = s.n || ''; etiqueta();
    if (st.vistas.indexOf(cur) < 0) { st.vistas.push(cur); save(); progreso(); }
    if (T && T.tipo === 'slides' && cur === nS - 1 && !frs.length) hecho();
  }
  function adelante() { if (rev < frs.length) { frs[rev++].classList.add('on'); etiqueta(); if (T && T.tipo === 'slides' && cur === nS - 1 && rev >= frs.length) hecho(); } else if (cur < nS - 1) show(cur + 1); }
  function atras() { if (rev > 0) { frs[--rev].classList.remove('on'); etiqueta(); } else if (cur > 0) show(cur - 1, true); }
  $('#prev').onclick = atras; $('#next').onclick = adelante;
  dots.addEventListener('click', function (e) { if (e.target.dataset.i != null) show(+e.target.dataset.i); });
  var fsb = $('#fs'); if (!document.documentElement.requestFullscreen) fsb.style.display = 'none';
  fsb.onclick = function () { try { var st0 = $('#slot .stage'); if (document.fullscreenElement) document.exitFullscreen(); else st0.requestFullscreen(); } catch (e) { } };
  document.addEventListener('keydown', function (e) {
    if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName) && e.key === ' ' || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || $('#p-slides').hidden) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); adelante(); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); atras(); }
    else if (e.key === 'Home') show(0); else if (e.key === 'End') show(nS - 1, true); else if (e.key === 'f' || e.key === 'F') fsb.click();
  });

  /* ── lectura ── */
  $('#p-lectura').innerHTML = '<article class="read">' + (U.lectura || '<p>Esta unidad no tiene lectura.</p>') + '</article>'; renderTex($('#p-lectura'));

  /* ── práctica ── */
  var pr = $('#p-practica'); if (!nP) pr.innerHTML = '<p class="lead">Esta unidad no tiene práctica.</p>';
  (U.practica || []).forEach(function (t, i) {
    var c = el('div', 'card task'); c.innerHTML = '<h3>' + t.t + '</h3><div>' + t.p + '</div>';
    if (t.w) { var h = el('div'); c.appendChild(h); (W[t.w] || function () { })(h, t.cfg || {}); }
    if (t.r) c.insertAdjacentHTML('beforeend', '<details><summary>Ver respuesta modelo</summary><div style="margin-top:8px">' + t.r + '</div></details>');
    var b = el('button', 'btn ghost', st.practica.indexOf(i) > -1 ? 'Hecha ✓' : 'Marcar como hecha'); b.type = 'button'; b.style.justifySelf = 'start';
    b.onclick = function () { var k = st.practica.indexOf(i); if (k > -1) st.practica.splice(k, 1); else st.practica.push(i); b.textContent = st.practica.indexOf(i) > -1 ? 'Hecha ✓' : 'Marcar como hecha'; save(); progreso(); if (T && T.tipo === 'practica' && st.practica.length >= nP) hecho(); };
    c.appendChild(b); pr.appendChild(c); renderTex(c);
  });

  /* ── cuestionario ── */
  var qz = $('#p-quiz');
  function quiz() {
    if (!hasQ) { qz.innerHTML = '<p class="lead">Esta unidad no tiene cuestionario.</p>'; return; }
    qz.innerHTML = '<div class="card"><div id="qs">' + U.quiz.map(function (q, i) { return '<div class="q" data-i="' + i + '"><h4>' + (i + 1) + '. ' + q.q + '</h4>' + q.o.map(function (o, j) { return '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '"><span>' + o + '</span></label>'; }).join('') + '<div class="why" aria-live="polite"></div></div>'; }).join('') + '</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px"><button class="btn" id="chk" type="button">Comprobar respuestas</button><span id="sc" class="why"></span></div></div>';
    $('#chk').onclick = function () {
      var ok = 0, resp = 0; U.quiz.forEach(function (q, i) {
        var blk = $('.q[data-i="' + i + '"]', qz), sel = blk.querySelector('input:checked'); blk.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('right', 'wrong'); });
        if (!sel) { $('.why', blk).textContent = 'Sin responder.'; return; } resp++; var v = +sel.value, labs = blk.querySelectorAll('.opt'); labs[q.a].classList.add('right'); if (v === q.a) ok++; else labs[v].classList.add('wrong');
        $('.why', blk).innerHTML = (v === q.a ? '<b>Correcto.</b> ' : '<b>Revisa.</b> ') + q.why;
      });
      var pct = Math.round(100 * ok / U.quiz.length); $('#sc').textContent = resp < U.quiz.length ? 'Faltan ' + (U.quiz.length - resp) + ' por responder. Aciertos hasta ahora: ' + ok + '.' : 'Resultado: ' + ok + ' de ' + U.quiz.length + ' (' + pct + ' %)' + (pct >= 70 ? '. Unidad aprobada.' : '. Revisa las explicaciones y vuelve a intentarlo.');
      if (resp === U.quiz.length) { st.quiz = { pct: Math.max(pct, (st.quiz && st.quiz.pct) || 0) }; save(); progreso(); if (T && T.tipo === 'quiz') hecho(); }
    };
  }
  quiz();

  /* ── arranque ── */
  var h = T ? (T.tipo === 'slides' ? 'slides' : T.tipo) : (location.hash || '').slice(1); tab(['slides', 'lectura', 'practica', 'quiz'].indexOf(h) > -1 ? h : 'slides'); show(0); progreso();
})();
