/* EPI-LAB · reproductor de unidades: diapositivas interactivas, lectura, práctica y cuestionario.
   Lee window.UNIDAD (ver construir.py). Progreso solo en este navegador (localStorage). */
(function () {
  'use strict';
  var U = window.UNIDAD, W = window.EPI_W || {}, root = document.getElementById('app');
  if (!U || !root) return;
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
    if (t === 'lectura') { st.leida = 1; save(); progreso(); }
    try { history.replaceState(null, '', '#' + t); } catch (e) { }
  }
  $('.tabs').addEventListener('click', function (e) { if (e.target.dataset.t) tab(e.target.dataset.t); });

  /* ── diapositivas ── */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cuerpo(s) {
    var t = s.t;
    if (t === 'points') return '<ul>' + s.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
    if (t === 'formula') return '<div class="fm">' + s.lines.map(function (l) { return '<div>' + l + '</div>'; }).join('') + '</div>';
    if (t === 'table') return '<table><tr>' + s.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' + s.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    if (t === 'twobox') { var b = function (x) { return '<div><h3>' + x[0] + '</h3>' + x.slice(1, -1).map(function (y) { return '<p>' + y + '</p>'; }).join('') + '<p class="big">' + x[x.length - 1] + '</p></div>'; }; return '<div class="tb">' + b(s.left) + b(s.right) + '</div>'; }
    if (t === 'callout') return '<div class="co">' + s.body + '</div>';
    if (t === 'shot') return '<div class="shotw"><img src="img/' + s.img + '" alt="' + esc(s.cap || s.title) + '" loading="lazy"><p>' + (s.cap || '') + '</p></div>';
    if (t === 'steps') return '<div class="steps' + (s.items.length > 4 ? ' two' : '') + '">' + s.items.map(function (i) { return '<div><div><b>' + i[0] + '</b><span>' + (i[1] || '') + '</span></div></div>'; }).join('') + '</div>';
    if (t === 'reveal') return '<div class="rv">' + s.items.map(function (i) { return '<details><summary>' + i[0] + '</summary><p>' + i[1] + '</p></details>'; }).join('') + '</div>';
    return '';
  }
  function slideEl(s, i) {
    var stage = el('div', 'stage' + (s.t === 'widget' || s.t === 'check' ? ' free' : '')), sl = el('div', 'sl' + (s.t === 'title' ? ' cover' : '') + (s.t === 'widget' || s.t === 'check' ? ' free' : ''));
    if (s.t === 'title') sl.innerHTML = '<div class="eb">EPI-LAB · ' + U.unidad + '</div><h2>' + s.title + '</h2><p>' + (s.sub || U.curso) + '</p>';
    else {
      sl.innerHTML = '<div class="eb">' + U.curso + ' · ' + U.unidad + '</div><h2>' + s.title + '</h2>';
      if (s.t === 'widget') { var host = el('div', 'card'); sl.appendChild(host); (W[s.w] || function (h) { h.textContent = 'Simulador no disponible.'; })(host, s.cfg || {}); if (s.cap) sl.appendChild(el('p', 'why', s.cap)); }
      else if (s.t === 'check') sl.appendChild(miniQuiz(s.q));
      else sl.insertAdjacentHTML('beforeend', cuerpo(s));
    }
    stage.appendChild(sl); return stage;
  }
  function miniQuiz(q) {
    var box = el('div', 'card'); box.innerHTML = '<h4 style="margin:0 0 8px">' + q.q + '</h4>' + q.o.map(function (o, i) { return '<label class="opt"><input type="radio" name="mq' + Math.random().toString(36).slice(2) + '" value="' + i + '"><span>' + o + '</span></label>'; }).join('') + '<div class="fbk" aria-live="polite"></div>';
    box.addEventListener('change', function (e) {
      var v = +e.target.value, fb = $('.fbk', box), opts = box.querySelectorAll('.opt'); opts.forEach(function (o, i) { o.classList.toggle('right', i === q.a); o.classList.toggle('wrong', i === v && v !== q.a); });
      fb.innerHTML = '<div class="msg ' + (v === q.a ? 'ok' : 'bad') + '">' + (v === q.a ? 'Correcto. ' : 'Revisa: ') + q.why + '</div>';
    }); return box;
  }
  var cur = 0, deck = $('#p-slides');
  deck.innerHTML = '<div class="deck"><div id="slot"></div><div class="nav"><button type="button" id="prev">← Anterior</button><div class="dots" id="dots"></div><button type="button" id="next">Siguiente →</button></div><details class="notes" id="nt"><summary>Guion de esta diapositiva</summary><p></p></details></div>';
  var dots = $('#dots'); U.slides.forEach(function (s, i) { var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', 'Diapositiva ' + (i + 1)); b.dataset.i = i; dots.appendChild(b); });
  function show(i) {
    cur = Math.max(0, Math.min(nS - 1, i)); var s = U.slides[cur]; $('#slot').replaceChildren(slideEl(s, cur));
    [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', k === cur); d.classList.toggle('seen', st.vistas.indexOf(k) > -1); });
    $('#prev').disabled = cur === 0; $('#next').disabled = cur === nS - 1; var nt = $('#nt'); nt.style.display = s.n ? '' : 'none'; $('p', nt).textContent = s.n || '';
    if (st.vistas.indexOf(cur) < 0) { st.vistas.push(cur); save(); progreso(); }
  }
  $('#prev').onclick = function () { show(cur - 1); }; $('#next').onclick = function () { show(cur + 1); };
  dots.addEventListener('click', function (e) { if (e.target.dataset.i != null) show(+e.target.dataset.i); });
  document.addEventListener('keydown', function (e) { if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || $('#p-slides').hidden) return; if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });

  /* ── lectura ── */
  $('#p-lectura').innerHTML = '<article class="read">' + (U.lectura || '<p>Esta unidad no tiene lectura.</p>') + '</article>';

  /* ── práctica ── */
  var pr = $('#p-practica'); if (!nP) pr.innerHTML = '<p class="lead">Esta unidad no tiene práctica.</p>';
  (U.practica || []).forEach(function (t, i) {
    var c = el('div', 'card task'); c.innerHTML = '<h3>' + t.t + '</h3><div>' + t.p + '</div>';
    if (t.w) { var h = el('div'); c.appendChild(h); (W[t.w] || function () { })(h, t.cfg || {}); }
    if (t.r) c.insertAdjacentHTML('beforeend', '<details><summary>Ver respuesta modelo</summary><div style="margin-top:8px">' + t.r + '</div></details>');
    var b = el('button', 'btn ghost', st.practica.indexOf(i) > -1 ? 'Hecha ✓' : 'Marcar como hecha'); b.type = 'button'; b.style.justifySelf = 'start';
    b.onclick = function () { var k = st.practica.indexOf(i); if (k > -1) st.practica.splice(k, 1); else st.practica.push(i); b.textContent = st.practica.indexOf(i) > -1 ? 'Hecha ✓' : 'Marcar como hecha'; save(); progreso(); };
    c.appendChild(b); pr.appendChild(c);
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
      if (resp === U.quiz.length) { st.quiz = { pct: Math.max(pct, (st.quiz && st.quiz.pct) || 0) }; save(); progreso(); }
    };
  }
  quiz();

  /* ── arranque ── */
  var h = (location.hash || '').slice(1); tab(['slides', 'lectura', 'practica', 'quiz'].indexOf(h) > -1 ? h : 'slides'); show(0); progreso();
})();
