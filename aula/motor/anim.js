/* EPI-LAB · explicadores animados (SVG/CSS, sin dependencias salvo KaTeX opcional para fórmulas).
   Cada uno es EPI_W.<nombre>(host, cfg). Matemática en EPI_M (probada en ../pruebas). */
(function (root) {
  'use strict';
  var W = root.EPI_W, M = root.EPI_M;
  if (!W || !M || typeof document === 'undefined') return;

  /* ───────── utilidades ───────── */
  function f(x, d) { return isFinite(x) ? x.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'; }
  function pc(x, d) { return isFinite(x) ? f(x * 100, d == null ? 1 : d) + ' %' : '—'; }
  function tx(x, d) { return f(x, d).replace(',', '{,}'); }
  function tex(s, disp) { var k = root.katex; if (!k) return '<code>' + s + '</code>'; try { return k.renderToString(s, { throwOnError: false, displayMode: !!disp, strict: false }); } catch (e) { return s; } }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var uid = 0;
  function kpi(t, v, s, hot) { return '<div class="kpi' + (hot ? ' hot' : '') + '"><small>' + t + '</small><b>' + v + '</b><i>' + (s || '') + '</i></div>'; }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function tween(ms, fn, done) {
    var t0 = null, id; function tick(ts) { if (t0 === null) t0 = ts; var p = Math.min(1, (ts - t0) / ms); fn(ease(p)); if (p < 1) id = requestAnimationFrame(tick); else if (done) done(); }
    id = requestAnimationFrame(tick); return function () { cancelAnimationFrame(id); };
  }
  function motionOk() { return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches); }
  /* Control de pasos: ◀ ▶ ⏮ ⏭ y reproducción automática. */
  function stepper(host, n, onStep, o) {
    o = o || {}; var i = 0, timer = null, bar = document.createElement('div'); bar.className = 'ctl';
    bar.innerHTML = '<button type="button" class="btn ghost" data-c="ini" aria-label="Volver al inicio">⏮</button><button type="button" class="btn ghost" data-c="prev">◀ Atrás</button><button type="button" class="btn" data-c="next">Paso siguiente ▶</button><button type="button" class="btn ghost" data-c="play">▶ Reproducir</button><span class="cnt" aria-live="polite"></span>';
    host.appendChild(bar);
    function go(k) { i = clamp(k, 0, n - 1); bar.querySelector('.cnt').textContent = 'Paso ' + (i + 1) + ' de ' + n; bar.querySelector('[data-c=prev]').disabled = i === 0; bar.querySelector('[data-c=next]').disabled = i === n - 1; onStep(i); if (i === n - 1) stop(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } bar.querySelector('[data-c=play]').textContent = '▶ Reproducir'; }
    function play() { if (i >= n - 1) go(0); bar.querySelector('[data-c=play]').textContent = '❚❚ Pausa'; timer = setInterval(function () { if (!host.isConnected) { stop(); return; } if (i >= n - 1) stop(); else go(i + 1); }, o.ms || 2600); }
    bar.addEventListener('click', function (e) { var c = e.target.dataset && e.target.dataset.c; if (!c) return; if (c === 'play') { timer ? stop() : play(); return; } stop(); if (c === 'ini') go(0); if (c === 'prev') go(i - 1); if (c === 'next') go(i + 1); });
    go(0); return { go: go, get i() { return i; } };
  }
  function ready(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }

  /* ───────── 1 · Tabla 2×2 → riesgo → RR → odds → OR, paso a paso ───────── */
  W.anim2x2 = function (host, cfg) {
    var p = cfg.preset || [24, 80, 40, 305], a = p[0], b = p[1], c = p[2], d = p[3], t = M.tabla(a, b, c, d), n1 = a + b, n0 = c + d;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'De la tabla 2×2 al RR y al OR') + '</h3><div class="a22g"><table class="t22 a22t"><tr><th></th><th>Con evento</th><th>Sin evento</th><th class="tot">Total</th></tr>' +
      '<tr><th>' + (cfg.exp || 'Expuestos') + '</th><td data-k="a">' + a + '</td><td data-k="b">' + b + '</td><td class="tot" data-k="n1">' + n1 + '</td></tr>' +
      '<tr><th>' + (cfg.noexp || 'No expuestos') + '</th><td data-k="c">' + c + '</td><td data-k="d">' + d + '</td><td class="tot" data-k="n0">' + n0 + '</td></tr></table>' +
      '<svg class="ch a22s" viewBox="0 0 360 230" role="img" aria-label="Barras de riesgo y odds"></svg></div><div class="a22f" aria-live="polite"></div><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap'), tab = host.querySelector('.a22t');
    var rmax = Math.max(t.r1, t.r0), omax = Math.max(t.odds1, t.odds0), H = 150;
    function dibujar(step) {
      var sr = step >= 2, so = step >= 4, s = '<line class="ax" x1="20" x2="345" y1="190" y2="190"/>';
      function grp(x, v1, v0, mx, l1, l0, on, ttl, nuevo) {
        var h1 = mx ? H * v1 / mx : 0, h0 = mx ? H * v0 / mx : 0;
        return '<g class="gr' + (on ? ' on' : '') + (nuevo ? ' grow' : '') + '"><rect class="b1" x="' + x + '" y="' + (190 - h1) + '" width="46" height="' + h1 + '" rx="4"/><rect class="b0" x="' + (x + 62) + '" y="' + (190 - h0) + '" width="46" height="' + h0 + '" rx="4"/>' +
          '<text x="' + (x + 23) + '" y="' + (184 - h1) + '" text-anchor="middle">' + l1 + '</text><text x="' + (x + 85) + '" y="' + (184 - h0) + '" text-anchor="middle">' + l0 + '</text><text class="tt" x="' + (x + 54) + '" y="214" text-anchor="middle">' + ttl + '</text></g>';
      }
      s += grp(34, t.r1, t.r0, rmax, pc(t.r1), pc(t.r0), sr, 'Riesgo', step === 2) + grp(206, t.odds1, t.odds0, omax, f(t.odds1, 2), f(t.odds0, 2), so, 'Odds', step === 4);
      svg.innerHTML = s;
    }
    var hl = [['a', 'b', 'c', 'd'], ['n1', 'n0'], ['a', 'n1', 'c', 'n0'], [], ['a', 'b', 'c', 'd'], []];
    var pasos = [
      { c: 'Cuatro conteos: cuántas personas hay en cada combinación de exposición y evento.', t: '' },
      { c: 'Sumamos cada fila: el total de personas en cada grupo.', t: 'n_1 = a+b = ' + a + '+' + b + ' = ' + n1 + '\\qquad n_0 = c+d = ' + c + '+' + d + ' = ' + n0 },
      { c: 'Riesgo = personas con evento entre el total del grupo. Las barras muestran la comparación.', t: 'r_1=\\frac{a}{a+b}=\\frac{' + a + '}{' + n1 + '}=' + tx(t.r1, 3) + '\\qquad r_0=\\frac{c}{c+d}=\\frac{' + c + '}{' + n0 + '}=' + tx(t.r0, 3) },
      { c: 'El riesgo relativo divide un riesgo entre el otro: cuántas veces es mayor en los expuestos.', t: 'RR=\\frac{r_1}{r_0}=\\frac{' + tx(t.r1, 3) + '}{' + tx(t.r0, 3) + '}=\\mathbf{' + tx(t.rr, 2) + '}' },
      { c: 'Las odds comparan con evento frente a sin evento. El odds ratio divide las dos odds.', t: '\\text{odds}_1=\\frac{a}{b}=' + tx(t.odds1, 2) + '\\quad \\text{odds}_0=\\frac{c}{d}=' + tx(t.odds0, 2) + '\\quad OR=\\frac{a\\,d}{b\\,c}=\\frac{' + a + '\\cdot' + d + '}{' + b + '\\cdot' + c + '}=\\mathbf{' + tx(t.or, 2) + '}' },
      { c: t.r0 > 0.1 ? 'Interpretación: el desenlace es frecuente, así que el OR (' + f(t.or, 2) + ') se aleja más de 1 que el RR (' + f(t.rr, 2) + '). Léelo como «odds», no como veces más riesgo.' : 'Interpretación: el desenlace es poco frecuente, así que OR y RR casi coinciden.', t: 'RR=' + tx(t.rr, 2) + '\\;\\;(\\text{IC }95\\%:\\;' + tx(t.rrCI[0], 2) + '\\text{ a }' + tx(t.rrCI[1], 2) + ')\\qquad OR=' + tx(t.or, 2) + '\\;\\;(' + tx(t.orCI[0], 2) + '\\text{ a }' + tx(t.orCI[1], 2) + ')' }
    ];
    stepper(host.firstChild, pasos.length, function (i) {
      [].forEach.call(tab.querySelectorAll('[data-k]'), function (c) { c.classList.toggle('hl', hl[i].indexOf(c.dataset.k) > -1); });
      tab.classList.toggle('tots', i >= 1); fo.innerHTML = pasos[i].t ? tex(pasos[i].t, true) : ''; cap.textContent = pasos[i].c; dibujar(i);
    }, { ms: 3200 });
  };

  /* ───────── 2 · Curva normal: valor p y potencia ───────── */
  W.normal = function (host, cfg) {
    var modo = 'p', Wd = 560, H = 230, z0 = cfg.z || 1.96;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Valor p y potencia en la curva normal') + '</h3><div class="row"><div class="seg" role="tablist"><button type="button" class="btn" data-m="p">Valor p</button><button type="button" class="btn ghost" data-m="pot">Potencia</button></div></div>' +
      '<div class="row" id="ctl"></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Curva normal con áreas sombreadas"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), ctl = host.querySelector('#ctl'), cap = host.querySelector('.cap');
    function dens(x, m) { return Math.exp(-0.5 * (x - m) * (x - m)) / Math.sqrt(2 * Math.PI); }
    var X0 = -4, X1 = 8;
    function px(x, lo, hi) { return 30 + (x - lo) / (hi - lo) * (Wd - 60); } function py(y) { return H - 34 - y * 380; }
    function area(lo, hi, m, a, b, cls) { var d = 'M' + px(a, lo, hi) + ' ' + py(0); for (var x = a; x <= b + 1e-9; x += 0.05) d += 'L' + px(x, lo, hi).toFixed(1) + ' ' + py(dens(x, m)).toFixed(1); d += 'L' + px(b, lo, hi) + ' ' + py(0) + 'Z'; return '<path class="' + cls + '" d="' + d + '"/>'; }
    function curva(lo, hi, m, cls) { var d = ''; for (var x = lo; x <= hi + 1e-9; x += 0.05) d += (d ? 'L' : 'M') + px(x, lo, hi).toFixed(1) + ' ' + py(dens(x, m)).toFixed(1); return '<path class="' + cls + '" d="' + d + '"/>'; }
    function ejes(lo, hi) { var s = '<line class="ax" x1="30" x2="' + (Wd - 30) + '" y1="' + py(0) + '" y2="' + py(0) + '"/>'; for (var t = Math.ceil(lo); t <= hi; t++) s += '<text x="' + px(t, lo, hi) + '" y="' + (H - 12) + '" text-anchor="middle">' + t + '</text>'; return s; }
    function panelP() {
      ctl.innerHTML = '<div class="rng"><label for="nz">Estadístico z observado</label><input id="nz" type="range" min="-4" max="4" step="0.01" value="' + z0 + '" data-k="z"><b data-v="z"></b></div><label class="chk"><input type="checkbox" data-k="dos" checked> Bilateral</label><button type="button" class="btn ghost" data-z="1.96">z = 1,96</button><button type="button" class="btn ghost" data-z="2.58">z = 2,58</button>';
      function dib() {
        var z = +ctl.querySelector('[data-k=z]').value, dos = ctl.querySelector('[data-k=dos]').checked, p = dos ? 2 * (1 - M.pnorm(Math.abs(z))) : 1 - M.pnorm(z), s = ejes(-4, 4) + curva(-4, 4, 0, 'ln');
        if (dos) s += area(-4, 4, 0, -4, -Math.abs(z), 'sh') + area(-4, 4, 0, Math.abs(z), 4, 'sh'); else s += area(-4, 4, 0, z, 4, 'sh');
        s += '<line class="dash" x1="' + px(z, -4, 4) + '" x2="' + px(z, -4, 4) + '" y1="20" y2="' + py(0) + '"/><text x="' + px(z, -4, 4) + '" y="14" text-anchor="middle">z = ' + f(z, 2) + '</text>';
        svg.innerHTML = s; ctl.querySelector('[data-v=z]').textContent = f(z, 2);
        out.innerHTML = kpi('Valor p', p < 0.001 ? '< 0,001' : f(p, 3), dos ? 'dos colas' : 'una cola', 1) + kpi('¿p < 0,05?', p < 0.05 ? 'Sí' : 'No', 'umbral convencional') + kpi('Cálculo', 'p = ' + (dos ? '2 · ' : '') + 'P(Z ≥ ' + f(Math.abs(z), 2) + ')', 'área sombreada');
        cap.textContent = 'El valor p es el área bajo la curva de «no hay efecto» en los resultados tan extremos como el observado o más. Mueve z y mira cómo crece o se achica el área.';
      }
      ctl.oninput = dib; ctl.onclick = function (e) { if (e.target.dataset.z) { var r = ctl.querySelector('[data-k=z]'); r.value = e.target.dataset.z; dib(); } }; dib();
    }
    function panelPot() {
      ctl.innerHTML = '<div class="rng"><label for="nd">Tamaño del efecto (d de Cohen)</label><input id="nd" type="range" min="0.1" max="1.2" step="0.05" value="0.5" data-k="d"><b data-v="d"></b></div><div class="rng"><label for="nn">n por grupo</label><input id="nn" type="range" min="10" max="200" step="2" value="64" data-k="n"><b data-v="n"></b></div><div class="rng"><label for="na">Alfa</label><input id="na" type="range" min="0.01" max="0.1" step="0.01" value="0.05" data-k="a"><b data-v="a"></b></div>';
      function dib() {
        var v = {}; [].forEach.call(ctl.querySelectorAll('[data-k]'), function (i) { v[i.dataset.k] = +i.value; });
        var dl = v.d * Math.sqrt(v.n / 2), zc = M.qnorm(1 - v.a / 2), pot = M.pnorm(dl - zc) + M.pnorm(-dl - zc), lo = -4, hi = Math.max(8, dl + 4), s = ejes(lo, hi);
        s += area(lo, hi, 0, zc, hi, 'sh') + area(lo, hi, 0, lo, -zc, 'sh') + area(lo, hi, dl, zc, hi, 'pw') + curva(lo, hi, 0, 'ln') + curva(lo, hi, dl, 'ln2');
        s += '<line class="dash" x1="' + px(zc, lo, hi) + '" x2="' + px(zc, lo, hi) + '" y1="24" y2="' + py(0) + '"/><text x="' + px(zc, lo, hi) + '" y="18" text-anchor="middle">z crítico ' + f(zc, 2) + '</text>';
        s += '<text x="' + px(0, lo, hi) + '" y="' + (py(dens(0, 0)) - 8) + '" text-anchor="middle">Sin efecto (H₀)</text><text x="' + px(dl, lo, hi) + '" y="' + (py(dens(0, 0)) - 8) + '" text-anchor="middle">Con efecto (H₁)</text>';
        svg.innerHTML = s; ctl.querySelector('[data-v=d]').textContent = f(v.d, 2); ctl.querySelector('[data-v=n]').textContent = f(v.n, 0); ctl.querySelector('[data-v=a]').textContent = f(v.a, 2);
        out.innerHTML = kpi('Potencia', pc(pot, 0), 'área verde bajo H₁', 1) + kpi('Error tipo II (β)', pc(1 - pot, 0), 'no detectar el efecto') + kpi('δ', f(dl, 2), 'd · √(n/2)');
        cap.textContent = 'Rojo: el error tipo I (alfa) bajo «sin efecto». Verde: la potencia, es decir, la parte de la curva «con efecto» que supera el z crítico. Más n o un efecto mayor desplazan la curva verde a la derecha y la potencia sube.';
      }
      ctl.oninput = dib; ctl.onclick = null; dib();
    }
    host.querySelector('.seg').addEventListener('click', function (e) { var m = e.target.dataset && e.target.dataset.m; if (!m) return; modo = m; [].forEach.call(host.querySelectorAll('.seg .btn'), function (b) { b.classList.toggle('ghost', b.dataset.m !== m); }); (m === 'p' ? panelP : panelPot)(); });
    panelP();
  };

  /* ───────── 3 · Muestreo repetido: teorema del límite central ───────── */
  W.muestreo = function (host, cfg) {
    var Wd = 560, H = 250, rnd = M.rng(11), medias = [], pops = {
      normal: { nom: 'Normal', mu: 50, sd: 15, s: function () { var u = rnd() || 1e-9, v = rnd(); return 50 + 15 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); } },
      exp: { nom: 'Sesgada (exponencial)', mu: 50, sd: 50, s: function () { return -50 * Math.log(1 - rnd()); } },
      bi: { nom: 'Dos grupos (bimodal)', mu: 50, sd: Math.sqrt(261), s: function () { var u = rnd() || 1e-9, v = rnd(); return (rnd() < .5 ? 35 : 65) + 6 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); } }
    };
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Por qué la media de muestras se vuelve normal') + '</h3><div class="row"><label for="pp">Población<select id="pp" data-k="p"><option value="exp">Sesgada (exponencial)</option><option value="normal">Normal</option><option value="bi">Dos grupos (bimodal)</option></select></label><div class="rng"><label for="mn">Tamaño de cada muestra (n)</label><input id="mn" type="range" min="2" max="100" step="1" value="' + (cfg.n || 10) + '" data-k="n"><b data-v="n"></b></div></div>' +
      '<div class="row"><button type="button" class="btn" data-a="1">+1 muestra</button><button type="button" class="btn" data-a="20">+20</button><button type="button" class="btn" data-a="200">+200</button><button type="button" class="btn ghost" data-a="auto">▶ Animar</button><button type="button" class="btn ghost" data-a="rs">Reiniciar</button></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Histograma de medias muestrales"></svg><p class="cap">Cada punto cae en el histograma cuando se calcula la media de una muestra nueva.</p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), timer = null, B = 40, LO = 10, HI = 90;
    function v() { var o = {}; [].forEach.call(host.querySelectorAll('[data-k]'), function (i) { o[i.dataset.k] = i.type === 'range' ? +i.value : i.value; }); return o; }
    function una() { var o = v(), P = pops[o.p], s = 0; for (var i = 0; i < o.n; i++) s += P.s(); medias.push(s / o.n); }
    function dib(ultimo) {
      var o = v(), P = pops[o.p], se = P.sd / Math.sqrt(o.n), bins = new Array(B).fill(0), k = medias.length, i, mx, sd = NaN, m = NaN;
      for (i = 0; i < k; i++) { var b = Math.floor((medias[i] - LO) / (HI - LO) * B); bins[clamp(b, 0, B - 1)]++; }
      if (k) { m = medias.reduce(function (a, x) { return a + x; }, 0) / k; sd = k > 1 ? Math.sqrt(medias.reduce(function (a, x) { return a + (x - m) * (x - m); }, 0) / (k - 1)) : NaN; }
      var top = Math.max(8, Math.max.apply(null, bins)), bw = (Wd - 60) / B, s = '<line class="ax" x1="30" x2="' + (Wd - 30) + '" y1="' + (H - 30) + '" y2="' + (H - 30) + '"/>';
      for (i = 0; i < B; i++) { var h = bins[i] / top * (H - 60); s += '<rect class="hb" x="' + (30 + i * bw + 1) + '" y="' + (H - 30 - h) + '" width="' + (bw - 2) + '" height="' + h + '" rx="2"/>'; }
      if (k >= 5) { var d = ''; for (var x = LO; x <= HI; x += 0.5) { var y = k * (HI - LO) / B * Math.exp(-0.5 * Math.pow((x - P.mu) / se, 2)) / (se * Math.sqrt(2 * Math.PI)); d += (d ? 'L' : 'M') + (30 + (x - LO) / (HI - LO) * (Wd - 60)).toFixed(1) + ' ' + (H - 30 - y / top * (H - 60)).toFixed(1); } s += '<path class="ln2" d="' + d + '"/>'; }
      for (i = 10; i <= 90; i += 20) s += '<text x="' + (30 + (i - LO) / (HI - LO) * (Wd - 60)) + '" y="' + (H - 12) + '" text-anchor="middle">' + i + '</text>';
      s += '<line class="dash" x1="' + (30 + (P.mu - LO) / (HI - LO) * (Wd - 60)) + '" x2="' + (30 + (P.mu - LO) / (HI - LO) * (Wd - 60)) + '" y1="10" y2="' + (H - 30) + '"/>';
      svg.innerHTML = s; host.querySelector('[data-v=n]').textContent = f(o.n, 0);
      out.innerHTML = kpi('Muestras sacadas', f(k, 0), 'cada una con n = ' + o.n, 1) + kpi('Media de las medias', k ? f(m, 1) : '—', 'media poblacional = ' + f(P.mu, 0)) + kpi('Desviación de las medias', k > 1 ? f(sd, 2) : '—', 'teoría: σ/√n = ' + f(se, 2), 1);
    }
    host.addEventListener('click', function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (timer) { clearInterval(timer); timer = null; host.querySelector('[data-a=auto]').textContent = '▶ Animar'; if (a === 'auto') return; }
      if (a === 'rs') { medias = []; dib(); return; }
      if (a === 'auto') { host.querySelector('[data-a=auto]').textContent = '❚❚ Pausa'; timer = setInterval(function () { if (!host.isConnected || medias.length >= 600) { clearInterval(timer); timer = null; host.querySelector('[data-a=auto]').textContent = '▶ Animar'; return; } for (var j = 0; j < 4; j++) una(); dib(); }, 90); return; }
      for (var j = 0; j < +a; j++) una(); dib();
    });
    host.addEventListener('input', function () { medias = []; precarga(); dib(); });
    function precarga() { for (var j = 0; j < 30; j++) una(); } precarga(); dib();
  };

  /* ───────── 4 · Regresión lineal: mínimos cuadrados ───────── */
  W.regresion = function (host, cfg) {
    var D = M.DATOS.ols, o = M.ols(D.x, D.y), Wd = 560, H = 290;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Regresión lineal: elegir la recta que minimiza el error') + '</h3><div class="row"><div class="rng"><label for="rb0">Intercepto (b₀)</label><input id="rb0" type="range" min="40" max="130" step="0.1" value="100" data-k="b0"><b data-v="b0"></b></div><div class="rng"><label for="rb1">Pendiente (b₁)</label><input id="rb1" type="range" min="0" max="2" step="0.01" value="0.3" data-k="b1"><b data-v="b1"></b></div><button type="button" class="btn" data-a="ols">Ajustar por mínimos cuadrados</button></div><div class="a22f"></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Diagrama de dispersión con recta"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap'), r0 = host.querySelector('[data-k=b0]'), r1 = host.querySelector('[data-k=b1]');
    function px(x) { return 50 + (x - 30) / 60 * (Wd - 80); } function py(y) { return H - 40 - (y - 105) / 65 * (H - 70); }
    function dib() {
      var b0 = +r0.value, b1 = +r1.value, sse = 0, i, s = '<line class="ax" x1="50" x2="' + (Wd - 30) + '" y1="' + py(105) + '" y2="' + py(105) + '"/><line class="ax" x1="50" x2="50" y1="' + py(170) + '" y2="' + py(105) + '"/>';
      for (i = 30; i <= 90; i += 10) s += '<text x="' + px(i) + '" y="' + (H - 18) + '" text-anchor="middle">' + i + '</text>'; for (i = 110; i <= 170; i += 10) s += '<text x="44" y="' + (py(i) + 4) + '" text-anchor="end">' + i + '</text>';
      s += '<text x="' + (Wd / 2) + '" y="' + (H - 2) + '" text-anchor="middle">Edad (años)</text><text x="12" y="' + (H / 2) + '" transform="rotate(-90 12 ' + (H / 2) + ')" text-anchor="middle">Presión sistólica (mm Hg)</text>';
      for (i = 0; i < D.x.length; i++) { var yh = b0 + b1 * D.x[i], r = D.y[i] - yh; sse += r * r; s += '<line class="res" x1="' + px(D.x[i]) + '" x2="' + px(D.x[i]) + '" y1="' + py(D.y[i]) + '" y2="' + py(yh) + '"/>'; }
      s += '<line class="fit" x1="' + px(30) + '" y1="' + py(b0 + b1 * 30) + '" x2="' + px(90) + '" y2="' + py(b0 + b1 * 90) + '"/>'; for (i = 0; i < D.x.length; i++) s += '<circle class="pt" cx="' + px(D.x[i]) + '" cy="' + py(D.y[i]) + '" r="5"/>';
      svg.innerHTML = s; host.querySelector('[data-v=b0]').textContent = f(b0, 1); host.querySelector('[data-v=b1]').textContent = f(b1, 2);
      var r2 = 1 - sse / o.sst; fo.innerHTML = tex('\\hat{y}=b_0+b_1x=' + tx(b0, 1) + '+' + tx(b1, 2) + '\\,x \\qquad SSE=\\sum (y_i-\\hat{y}_i)^2=' + tx(sse, 0), true);
      out.innerHTML = kpi('Suma de cuadrados del error', f(sse, 0), 'mínimo posible: ' + f(o.sse, 0), 1) + kpi('R²', f(Math.max(0, r2), 3), 'mejor posible: ' + f(o.r2, 3)) + kpi('Interpretación', '+' + f(b1, 2) + ' mm Hg', 'por cada año más de edad');
      cap.textContent = Math.abs(sse - o.sse) < 1 ? 'Esta es la recta de mínimos cuadrados: ninguna otra recta tiene una suma de cuadrados menor. Pendiente 0,88: por cada año de edad, la presión sistólica media sube 0,88 mm Hg.' : 'Las líneas verticales son los residuos (lo que la recta no explica). Mueve los deslizadores para reducir la suma de cuadrados, o deja que el método lo haga.';
    }
    host.addEventListener('input', dib);
    host.addEventListener('click', function (e) { if (e.target.dataset.a !== 'ols') return; var a0 = +r0.value, a1 = +r1.value; tween(motionOk() ? 1100 : 1, function (t) { r0.value = a0 + (o.b0 - a0) * t; r1.value = a1 + (o.b1 - a1) * t; dib(); }); });
    dib();
  };

  /* ───────── 5 · Regresión logística: curva S, OR y máxima verosimilitud ───────── */
  W.logistica = function (host, cfg) {
    var D = M.datosLogit(), g = M.logit(D.x, D.y), Wd = 560, H = 290, jit = M.rng(5), jy = D.x.map(function () { return (jit() - 0.5) * 0.06; });
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Regresión logística: de la curva S al odds ratio') + '</h3><div class="row"><div class="rng"><label for="lb0">Intercepto (β₀)</label><input id="lb0" type="range" min="-10" max="0" step="0.05" value="-3" data-k="b0"><b data-v="b0"></b></div><div class="rng"><label for="lb1">Pendiente (β₁)</label><input id="lb1" type="range" min="0" max="0.08" step="0.001" value="0.01" data-k="b1"><b data-v="b1"></b></div><button type="button" class="btn" data-a="mle">Ajustar por máxima verosimilitud</button></div><div class="a22f"></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Curva logística con datos de 40 pacientes"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap'), r0 = host.querySelector('[data-k=b0]'), r1 = host.querySelector('[data-k=b1]'), llmax = M.ll(D.x, D.y, g.b0, g.b1);
    function px(x) { return 50 + (x - 40) / 180 * (Wd - 80); } function py(y) { return H - 40 - y * (H - 70); }
    function dib() {
      var b0 = +r0.value, b1 = +r1.value, s = '<line class="ax" x1="50" x2="' + (Wd - 30) + '" y1="' + py(0) + '" y2="' + py(0) + '"/>', i;
      for (i = 0; i <= 1; i += 0.25) s += '<line class="gl" x1="50" x2="' + (Wd - 30) + '" y1="' + py(i) + '" y2="' + py(i) + '"/><text x="44" y="' + (py(i) + 4) + '" text-anchor="end">' + Math.round(i * 100) + ' %</text>';
      for (i = 40; i <= 220; i += 30) s += '<text x="' + px(i) + '" y="' + (H - 18) + '" text-anchor="middle">' + i + '</text>';
      s += '<text x="' + (Wd / 2) + '" y="' + (H - 2) + '" text-anchor="middle">Tiempo de bypass (min)</text>';
      var d = ''; for (var x = 40; x <= 220; x += 2) d += (d ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(M.sig(b0 + b1 * x)).toFixed(1); s += '<path class="fit" d="' + d + '"/>';
      for (i = 0; i < D.x.length; i++) s += '<circle class="pt ' + (D.y[i] ? 'ev' : '') + '" cx="' + px(D.x[i]) + '" cy="' + py(D.y[i] + (D.y[i] ? -1 : 1) * Math.abs(jy[i])) + '" r="4.5"/>';
      svg.innerHTML = s; host.querySelector('[data-v=b0]').textContent = f(b0, 2); host.querySelector('[data-v=b1]').textContent = f(b1, 3);
      var ll = M.ll(D.x, D.y, b0, b1); fo.innerHTML = tex('\\ln\\frac{p}{1-p}=\\beta_0+\\beta_1x\\;\\Rightarrow\\; OR_{10\\text{ min}}=e^{10\\,\\beta_1}=e^{' + tx(10 * b1, 3) + '}=' + tx(Math.exp(10 * b1), 2), true);
      out.innerHTML = kpi('OR por cada 10 min', f(Math.exp(10 * b1), 2), 'e elevado a 10·β₁', 1) + kpi('Log-verosimilitud', f(ll, 1), 'máxima posible: ' + f(llmax, 1)) + kpi('Riesgo a los 120 min', pc(M.sig(b0 + b1 * 120), 0), 'según esta curva');
      cap.textContent = Math.abs(ll - llmax) < 0.05 ? 'Esta es la curva de máxima verosimilitud: la que hace más probables los datos observados. Cada 10 minutos más de bypass multiplica las odds por ' + f(Math.exp(10 * g.b1), 2) + '.' : 'Los puntos son pacientes (arriba: con lesión renal aguda; abajo: sin ella). Una curva mejor deja los puntos de arriba en la parte alta y los de abajo en la baja: la log-verosimilitud sube hacia su máximo.';
    }
    host.addEventListener('input', dib);
    host.addEventListener('click', function (e) {
      if (e.target.dataset.a !== 'mle') return; var tr = g.trace, k = 0; if (!motionOk()) { r0.value = g.b0; r1.value = g.b1; dib(); return; }
      var id = setInterval(function () { if (!host.isConnected || k >= tr.length) { clearInterval(id); return; } r0.value = clamp(tr[k][0], -10, 0); r1.value = clamp(tr[k][1], 0, 0.08); dib(); k++; }, 520);
    });
    dib();
  };

  /* ───────── 6 · Forest plot construido paso a paso ───────── */
  W.forest = function (host, cfg) {
    var D = M.DATOS.meta, k = D.rr.length, y = D.rr.map(Math.log), se = D.hi.map(function (h, i) { return (Math.log(h) - Math.log(D.lo[i])) / (2 * 1.959964); }), r = M.meta(y, se.map(function (s) { return s * s; })), z = 1.959964;
    var Wd = 580, H = 330, L = 0.25, Hh = 2, sw = r.w.reduce(function (a, x) { return a + x; }, 0), ya = 60;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Cómo se construye un forest plot') + '</h3><div class="row"><label class="chk"><input type="checkbox" data-k="re"> Efectos aleatorios</label></div><div class="a22f"></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Forest plot de seis estudios"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap'), re = host.querySelector('[data-k=re]');
    function px(v) { return 190 + (Math.log(v) - Math.log(L)) / (Math.log(Hh) - Math.log(L)) * 210; } function py(i) { return ya + i * 32; }
    function dib(step) {
      var s = '<text x="14" y="' + (ya - 24) + '" class="hd">Estudio</text><text x="190" y="' + (ya - 24) + '" class="hd">Razón de riesgos</text><text x="414" y="' + (ya - 24) + '" class="hd">RR (IC 95 %)</text><text x="' + (Wd - 12) + '" y="' + (ya - 24) + '" text-anchor="end" class="hd">Peso</text>';
      [0.25, 0.5, 1, 2].forEach(function (t) { s += '<line class="gl" x1="' + px(t) + '" x2="' + px(t) + '" y1="' + (ya - 12) + '" y2="' + (py(k) + 6) + '"/><text x="' + px(t) + '" y="' + (py(k + 1) + 6) + '" text-anchor="middle">' + t + '</text>'; });
      s += '<line class="dash" x1="' + px(1) + '" x2="' + px(1) + '" y1="' + (ya - 12) + '" y2="' + (py(k) + 6) + '"/>';
      for (var i = 0; i < k; i++) {
        var on = step > i, wp = r.w[i] / sw, sz = 5 + 13 * Math.sqrt(wp / (Math.max.apply(null, r.w) / sw));
        s += '<g class="fr2' + (on ? ' on' : '') + '"><text x="14" y="' + (py(i) + 4) + '">' + D.n[i] + '</text><line class="ci" x1="' + px(D.lo[i]) + '" x2="' + px(D.hi[i]) + '" y1="' + py(i) + '" y2="' + py(i) + '"/><rect class="sq" x="' + (px(D.rr[i]) - sz / 2) + '" y="' + (py(i) - sz / 2) + '" width="' + sz + '" height="' + sz + '"/><text x="414" y="' + (py(i) + 4) + '">' + f(D.rr[i], 2) + ' (' + f(D.lo[i], 2) + '–' + f(D.hi[i], 2) + ')</text><text x="' + (Wd - 12) + '" y="' + (py(i) + 4) + '" text-anchor="end">' + f(wp * 100, 0) + ' %</text><title>' + D.n[i] + ': RR ' + f(D.rr[i], 2) + ' (' + f(D.lo[i], 2) + ' a ' + f(D.hi[i], 2) + ')</title></g>';
      }
      var m = re.checked ? r.muR : r.mu, sm = re.checked ? r.seR : r.se, lo = Math.exp(m - z * sm), hi = Math.exp(m + z * sm), cy = py(k) + 10;
      s += '<g class="fr2' + (step >= k + 1 ? ' on' : '') + '"><polygon class="dm" points="' + px(lo) + ',' + cy + ' ' + px(Math.exp(m)) + ',' + (cy - 11) + ' ' + px(hi) + ',' + cy + ' ' + px(Math.exp(m)) + ',' + (cy + 11) + '"/><text x="14" y="' + (cy + 4) + '" style="font-weight:700">Efecto combinado</text><text x="414" y="' + (cy + 4) + '" style="font-weight:700">' + f(Math.exp(m), 2) + ' (' + f(lo, 2) + '–' + f(hi, 2) + ')</text></g>';
      svg.innerHTML = s;
      var q = r.q, tex1 = step >= k + 1 ? (re.checked ? '\\hat\\theta_{RE}=\\frac{\\sum w_i^*\\theta_i}{\\sum w_i^*},\\; w_i^*=\\frac{1}{v_i+\\tau^2}' : '\\hat\\theta=\\frac{\\sum w_i\\,\\theta_i}{\\sum w_i},\\; w_i=\\frac{1}{v_i},\\; \\theta_i=\\ln RR_i') : (step >= 1 ? 'w_i=\\frac{1}{v_i}=\\frac{1}{SE_i^2}\\quad(\\text{más precisión}\\Rightarrow\\text{más peso})' : '');
      fo.innerHTML = tex1 ? tex(tex1, true) : '';
      out.innerHTML = step >= k + 1 ? kpi('RR combinado', f(Math.exp(m), 2), 'IC 95 %: ' + f(lo, 2) + ' a ' + f(hi, 2), 1) + kpi('Heterogeneidad I²', pc(r.i2, 0), 'Q = ' + f(q, 2) + ' (gl = ' + (k - 1) + ')') + kpi('τ²', f(r.tau2, 3), 'varianza entre estudios') : '';
      cap.textContent = step === 0 ? 'Cada fila será un estudio. Pulsa «Paso siguiente» para añadirlos uno a uno.' : step <= k ? 'Estudio ' + step + ': el cuadrado es su estimación; la línea, su IC 95 %; el tamaño del cuadrado, su peso en el resultado combinado.' : ('El rombo es el efecto combinado: su centro es la estimación y sus puntas, el IC 95 %. ' + (hi < 1 ? 'Como no cruza la línea de 1, el conjunto sugiere un efecto protector.' : lo > 1 ? 'Como no cruza la línea de 1, el conjunto sugiere un aumento del riesgo.' : 'Como cruza la línea de 1, los datos son compatibles con ausencia de efecto.') + ' La heterogeneidad (I²) indica cuánto discrepan los estudios entre sí.');
    }
    var api = stepper(host.firstChild, k + 2, dib, { ms: 1500 }); re.addEventListener('change', function () { dib(api.i); });
  };

  /* ───────── 7 · Kaplan-Meier paso a paso ───────── */
  W.km = function (host, cfg) {
    var D = M.DATOS.km, tab = M.km(D.t, D.e), Wd = 560, H = 270, tmax = 22;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Curva de Kaplan-Meier, fila por fila') + '</h3><div class="a22g"><table class="t22 kmt"><tr><th>Tiempo</th><th>En riesgo</th><th>Eventos</th><th>Censuras</th><th>S(t)</th></tr>' + tab.map(function (r, i) { return '<tr data-i="' + i + '"><td>' + r.t + '</td><td>' + r.nr + '</td><td>' + r.d + '</td><td>' + r.c + '</td><td class="s">' + f(r.s, 3) + '</td></tr>'; }).join('') + '</table><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Curva de supervivencia"></svg></div><div class="a22f"></div><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap'), rows = host.querySelectorAll('.kmt tr[data-i]');
    function px(t) { return 44 + t / tmax * (Wd - 70); } function py(s) { return H - 36 - s * (H - 66); }
    function dib(step) {
      var s = '<line class="ax" x1="44" x2="' + (Wd - 20) + '" y1="' + py(0) + '" y2="' + py(0) + '"/>', i;
      for (i = 0; i <= 1; i += 0.25) s += '<line class="gl" x1="44" x2="' + (Wd - 20) + '" y1="' + py(i) + '" y2="' + py(i) + '"/><text x="38" y="' + (py(i) + 4) + '" text-anchor="end">' + f(i, 2) + '</text>';
      for (i = 0; i <= 20; i += 5) s += '<text x="' + px(i) + '" y="' + (H - 16) + '" text-anchor="middle">' + i + '</text>'; s += '<text x="' + (Wd / 2) + '" y="' + (H - 2) + '" text-anchor="middle">Tiempo (meses)</text>';
      var prevS = 1, prevT = 0, d = 'M' + px(0) + ' ' + py(1), shown = Math.min(step, tab.length);
      for (i = 0; i < shown; i++) { d += 'H' + px(tab[i].t).toFixed(1) + 'V' + py(tab[i].s).toFixed(1); prevS = tab[i].s; prevT = tab[i].t; }
      if (shown === tab.length) d += 'H' + px(tab[tab.length - 1].t).toFixed(1);
      s += '<path class="fit" d="' + d + '"/>';
      for (i = 0; i < shown; i++) if (tab[i].c) s += '<line class="ck" x1="' + px(tab[i].t) + '" x2="' + px(tab[i].t) + '" y1="' + (py(tab[i].s) - 7) + '" y2="' + (py(tab[i].s) + 7) + '"/>';
      if (step > tab.length) { var med = tab.filter(function (r) { return r.s <= 0.5; })[0]; if (med) s += '<line class="dash" x1="44" x2="' + px(med.t) + '" y1="' + py(0.5) + '" y2="' + py(0.5) + '"/><line class="dash" x1="' + px(med.t) + '" x2="' + px(med.t) + '" y1="' + py(0.5) + '" y2="' + py(0) + '"/><text x="' + (px(med.t) + 6) + '" y="' + (py(0.5) - 6) + '">mediana = ' + med.t + '</text>'; }
      svg.innerHTML = s;
      [].forEach.call(rows, function (r, j) { r.classList.toggle('on', j < shown); r.classList.toggle('now', j === shown - 1 && step <= tab.length); });
      var ev = tab.slice(0, shown).filter(function (r) { return r.d; }), expr = ev.map(function (r) { return '\\left(1-\\tfrac{' + r.d + '}{' + r.nr + '}\\right)'; }).join('');
      fo.innerHTML = step === 0 ? tex('S(t)=\\prod_{t_i\\le t}\\left(1-\\frac{d_i}{n_i}\\right)', true) : tex('S(' + tab[Math.min(shown, tab.length) - 1].t + ')=' + (expr || '1') + '=' + tx(tab[Math.min(shown, tab.length) - 1].s, 3), true);
      cap.textContent = step === 0 ? 'Cada fila es un momento con un evento o una censura. En cada evento la supervivencia se multiplica por (1 − eventos / en riesgo). Las censuras (marcas «|») salen del grupo en riesgo sin bajar la curva.' : step <= tab.length ? (tab[step - 1].d ? 'Tiempo ' + tab[step - 1].t + ': ' + tab[step - 1].d + ' evento(s) entre ' + tab[step - 1].nr + ' en riesgo; la curva baja.' : 'Tiempo ' + tab[step - 1].t + ': solo censura(s); la curva no baja, pero ' + tab[step - 1].c + ' persona(s) salen del grupo en riesgo.') : 'La mediana de supervivencia es el primer tiempo en que la curva llega a 0,5 o menos.';
    }
    stepper(host.firstChild, tab.length + 2, dib, { ms: 1800 });
  };

  /* ───────── 8 · DAG: confusor, mediador y colisionador ───────── */
  W.dag = function (host, cfg) {
    var ESC = {
      confusor: { nom: 'Confusor', nodos: { Z: [280, 40, 'Edad (Z)'], X: [90, 190, 'Catéter (X)'], Y: [470, 190, 'Mortalidad (Y)'] }, ar: [['Z', 'X'], ['Z', 'Y'], ['X', 'Y']], aj: 'Z', ruta: ['X', 'Z', 'Y'],
        t0: 'Sin ajustar: la ruta X ← Z → Y está abierta. La asociación entre catéter y mortalidad mezcla el efecto del catéter con el de la edad (sesgo de confusión).', t1: 'Al ajustar por Z (edad) se cierra la ruta de puerta trasera: lo que queda es el efecto de X sobre Y.' },
      mediador: { nom: 'Mediador', nodos: { X: [90, 190, 'Ejercicio (X)'], M: [280, 40, 'Presión arterial (M)'], Y: [470, 190, 'Riesgo CV (Y)'] }, ar: [['X', 'M'], ['M', 'Y'], ['X', 'Y']], aj: 'M', ruta: ['X', 'M', 'Y'],
        t0: 'Sin ajustar: la ruta X → M → Y es parte del efecto de X (efecto total). No es sesgo: es el camino por el que X actúa.', t1: 'Al ajustar por M se bloquea ese camino: ahora solo ves el efecto directo de X. Si querías el efecto total, ajustar por un mediador es un error.' },
      colisionador: { nom: 'Colisionador', nodos: { X: [90, 40, 'Talento (X)'], Y: [470, 40, 'Esfuerzo (Y)'], C: [280, 200, 'Ser seleccionado (C)'] }, ar: [['X', 'C'], ['Y', 'C']], aj: 'C', ruta: ['X', 'C', 'Y'],
        t0: 'Sin ajustar: la ruta X → C ← Y está cerrada porque C es un colisionador. X e Y no se asocian por esta vía.', t1: 'Al ajustar (o restringir) por C se abre la ruta y aparece una asociación espuria entre X e Y: es el sesgo del colisionador.' }
    }, sel = 'confusor', aj = false, Wd = 560, H = 250;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Rutas en un diagrama causal') + '</h3><div class="row"><div class="seg">' + Object.keys(ESC).map(function (k) { return '<button type="button" class="btn' + (k === sel ? '' : ' ghost') + '" data-s="' + k + '">' + ESC[k].nom + '</button>'; }).join('') + '</div><label class="chk"><input type="checkbox" data-k="aj"> <span class="al">Ajustar por la variable marcada</span></label></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Diagrama causal"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), cap = host.querySelector('.cap'), chk = host.querySelector('[data-k=aj]');
    function dib() {
      var E = ESC[sel], n = E.nodos, s = '<defs><marker id="ah' + (++uid) + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr"/></marker></defs>', mk = 'ah' + uid;
      var abierta = sel === 'colisionador' ? aj : !aj;
      E.ar.forEach(function (a, i) {
        var p = n[a[0]], q = n[a[1]], dx = q[0] - p[0], dy = q[1] - p[1], tt = Math.min(dx ? 80 / Math.abs(dx) : 9, dy ? 30 / Math.abs(dy) : 9), enRuta = a[0] === E.aj || a[1] === E.aj;
        s += '<line class="edge' + (enRuta ? (abierta ? ' open' : ' shut') : '') + '" x1="' + (p[0] + dx * tt) + '" y1="' + (p[1] + dy * tt) + '" x2="' + (q[0] - dx * tt) + '" y2="' + (q[1] - dy * tt) + '" marker-end="url(#' + mk + ')" style="animation-delay:' + i * 0.15 + 's"/>';
      });
      Object.keys(n).forEach(function (k) { var v = n[k], adj = aj && k === E.aj; s += '<g class="nd' + (adj ? ' adj' : '') + '"><rect x="' + (v[0] - 76) + '" y="' + (v[1] - 24) + '" width="152" height="48" rx="12"/><text x="' + v[0] + '" y="' + (v[1] + 5) + '" text-anchor="middle">' + v[2] + '</text>' + (adj ? '<text x="' + v[0] + '" y="' + (v[1] - 30) + '" text-anchor="middle" class="adjt">ajustado</text>' : '') + '</g>'; });
      svg.innerHTML = s; chk.parentNode.querySelector('.al').textContent = 'Ajustar por ' + E.nodos[E.aj][2];
      var sesgo = sel === 'confusor' ? !aj : sel === 'colisionador' ? aj : false;
      out.innerHTML = kpi('Ruta de la figura', abierta ? 'Abierta' : 'Cerrada', sel === 'mediador' ? 'camino causal de X a Y' : 'ruta no causal entre X e Y', 1) + kpi('¿Sesgo en el efecto de X?', sel === 'mediador' ? (aj ? 'Solo efecto directo' : 'Efecto total') : sesgo ? 'Sí' : 'No', sel === 'mediador' ? 'según lo que quieras estimar' : (sesgo ? 'asociación no causal' : 'ruta controlada'));
      cap.textContent = aj ? E.t1 : E.t0;
    }
    host.querySelector('.seg').addEventListener('click', function (e) { var s = e.target.dataset && e.target.dataset.s; if (!s) return; sel = s; aj = false; chk.checked = false; [].forEach.call(host.querySelectorAll('.seg .btn'), function (b) { b.classList.toggle('ghost', b.dataset.s !== s); }); dib(); });
    chk.addEventListener('change', function () { aj = chk.checked; dib(); }); dib();
  };

  /* ───────── 9 · Matriz de íconos: riesgo absoluto y relativo ───────── */
  W.iconos = function (host, cfg) {
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Riesgo absoluto y relativo con 100 personas') + '</h3><div class="row"><div class="rng"><label for="ir0">Riesgo sin tratamiento</label><input id="ir0" type="range" min="1" max="60" step="1" value="' + Math.round((cfg.r0 || 0.2) * 100) + '" data-k="r0"><b data-v="r0"></b></div><div class="rng"><label for="irr">Riesgo relativo</label><input id="irr" type="range" min="0.2" max="1.5" step="0.05" value="' + (cfg.rr || 0.75) + '" data-k="rr"><b data-v="rr"></b></div></div><div class="ia"><div><b>' + (cfg.g0 || 'Control') + '</b><div class="grid10" data-g="0"></div></div><div><b>' + (cfg.g1 || 'Tratamiento') + '</b><div class="grid10" data-g="1"></div></div></div><div class="out" aria-live="polite"></div><p class="cap"></p></div>';
    var gs = host.querySelectorAll('.grid10'), out = host.querySelector('.out'), cap = host.querySelector('.cap'), i, j;
    gs.forEach(function (g) { for (i = 0; i < 100; i++) g.insertAdjacentHTML('beforeend', '<span class="ic" style="transition-delay:' + (i * 8) + 'ms"></span>'); });
    function dib() {
      var r0 = +host.querySelector('[data-k=r0]').value, rr = +host.querySelector('[data-k=rr]').value, r1 = Math.min(100, Math.round(r0 * rr)), ev = [r0, r1];
      host.querySelector('[data-v=r0]').textContent = r0 + ' %'; host.querySelector('[data-v=rr]').textContent = f(rr, 2);
      gs.forEach(function (g, k) { [].forEach.call(g.children, function (c, idx) { c.classList.toggle('ev', idx < ev[k]); }); });
      var dr = (r1 - r0) / 100;
      out.innerHTML = kpi('Casos por 100', r0 + ' → ' + r1, 'control → tratamiento', 1) + kpi('Riesgo relativo', f(r0 ? r1 / r0 : NaN, 2), 'reducción relativa ' + f((1 - (r0 ? r1 / r0 : 1)) * 100, 0) + ' %') + kpi('Diferencia absoluta', f(dr * 100, 0) + ' pp', 'por cada 100 personas') + kpi('NNT', dr ? f(Math.ceil(1 / Math.abs(dr)), 0) : '—', dr < 0 ? 'tratar para evitar 1 caso' : 'expuestos por 1 caso extra');
      cap.textContent = 'Con el mismo riesgo relativo, un riesgo basal bajo da un beneficio absoluto pequeño. Prueba con un riesgo basal de 2 %: el RR no cambia, pero casi nadie se beneficia.';
    }
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 10 · Prueba diagnóstica: sensibilidad, especificidad y valor predictivo ───────── */
  W.dxsim = function (host, cfg) {
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Prueba diagnóstica con 1000 personas') + '</h3><div class="row"><div class="rng"><label for="dp">Prevalencia</label><input id="dp" type="range" min="1" max="60" step="1" value="' + Math.round((cfg.prev || 0.1) * 100) + '" data-k="p"><b data-v="p"></b></div><div class="rng"><label for="ds">Sensibilidad</label><input id="ds" type="range" min="50" max="100" step="1" value="' + Math.round((cfg.se || 0.9) * 100) + '" data-k="s"><b data-v="s"></b></div><div class="rng"><label for="de">Especificidad</label><input id="de" type="range" min="50" max="100" step="1" value="' + Math.round((cfg.sp || 0.8) * 100) + '" data-k="e"><b data-v="e"></b></div></div><canvas width="560" height="236" class="cv" role="img" aria-label="Mil personas coloreadas según resultado de la prueba y enfermedad"></canvas><div class="a22f"></div><div class="out" aria-live="polite"></div><p class="cap"></p></div>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d'), out = host.querySelector('.out'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap');
    function col(n) { var cs = getComputedStyle(host); return { tp: cs.getPropertyValue('--teal').trim() || '#2F7F92', fn: cs.getPropertyValue('--burg').trim() || '#8B2E3B', fp: '#E0A030', tn: cs.getPropertyValue('--muted').trim() || '#5E666D' }[n]; }
    function dib() {
      var p = +host.querySelector('[data-k=p]').value / 100, se = +host.querySelector('[data-k=s]').value / 100, sp = +host.querySelector('[data-k=e]').value / 100, r = M.dx(se, sp, p), N = 1000;
      host.querySelector('[data-v=p]').textContent = pc(p, 0); host.querySelector('[data-v=s]').textContent = pc(se, 0); host.querySelector('[data-v=e]').textContent = pc(sp, 0);
      var nums = ['tp', 'fn', 'fp', 'tn'].map(function (k) { return Math.round(r[k] * N); }), tot = nums.reduce(function (a, b) { return a + b; }, 0); nums[3] += N - tot;
      ctx.clearRect(0, 0, cv.width, cv.height); var i = 0, cols = 50, sz = 11; ['tp', 'fn', 'fp', 'tn'].forEach(function (k, g) { for (var j = 0; j < nums[g]; j++, i++) { ctx.globalAlpha = k === 'tn' ? 0.35 : 1; ctx.fillStyle = col(k); ctx.beginPath(); ctx.arc(8 + (i % cols) * sz + 2, 8 + Math.floor(i / cols) * sz + 2, 3.8, 0, 6.283); ctx.fill(); } });
      fo.innerHTML = tex('VPP=\\frac{VP}{VP+FP}=\\frac{' + nums[0] + '}{' + nums[0] + '+' + nums[2] + '}=' + tx(r.ppv * 100, 1) + '\\%', true);
      out.innerHTML = kpi('Valor predictivo positivo', pc(r.ppv, 0), 'de los positivos, enfermos', 1) + kpi('Valor predictivo negativo', pc(r.npv, 1), 'de los negativos, sanos') + kpi('Razón de verosimilitud +', f(r.lrp, 1), 'sens / (1 − esp)') + kpi('Razón de verosimilitud −', f(r.lrn, 2), '(1 − sens) / esp') + '<div class="leg"><span style="background:' + col('tp') + '"></span>Enfermo, positivo (' + nums[0] + ') <span style="background:' + col('fn') + '"></span>Enfermo, negativo (' + nums[1] + ') <span style="background:' + col('fp') + '"></span>Sano, positivo (' + nums[2] + ') <span style="background:' + col('tn') + '"></span>Sano, negativo (' + nums[3] + ')</div>';
      cap.textContent = 'La sensibilidad y la especificidad son propiedades de la prueba; el valor predictivo depende también de la prevalencia. Baja la prevalencia y mira cómo se multiplican los falsos positivos.';
    }
    host.addEventListener('input', dib); dib();
  };
  root.EPI_U = { f: f, pc: pc, tx: tx, tex: tex, kpi: kpi, clamp: clamp, tween: tween, stepper: stepper, motionOk: motionOk };
})(typeof window !== 'undefined' ? window : globalThis);
