/* EPI-LAB · explicadores animados (2.ª serie): estadística básica, supuestos, supervivencia, datos perdidos, GRADE, RoB 2 y ROC. */
(function (root) {
  'use strict';
  var W = root.EPI_W, M = root.EPI_M, U = root.EPI_U;
  if (!W || !M || !U || typeof document === 'undefined') return;
  var f = U.f, pc = U.pc, tx = U.tx, tex = U.tex, kpi = U.kpi, clamp = U.clamp;
  function rngSel(label, id, min, max, step, val, k) { return '<div class="rng"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-k="' + k + '"><b data-v="' + k + '"></b></div>'; }
  function vals(host) { var o = {}; [].forEach.call(host.querySelectorAll('[data-k]'), function (i) { o[i.dataset.k] = (i.type === 'range' || i.type === 'number') ? +i.value : i.value; }); return o; }
  var ids = 0;
  function normal(rnd) { var u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function quant(a, q) { var s = a.slice().sort(function (x, y) { return x - y; }), p = (s.length - 1) * q, i = Math.floor(p), r = p - i; return s[i] + (s[i + 1] !== undefined ? r * (s[i + 1] - s[i]) : 0); }

  /* ───────── 1 · Estadística descriptiva: media, mediana y valores atípicos ───────── */
  W.descriptiva = function (host, cfg) {
    var Wd = 580, H = 230, rnd, bases = {
      sim: { nom: 'Simétrica (hemoglobina, g/dL)', gen: function (r) { var a = []; for (var i = 0; i < 30; i++) a.push(10.3 + 1.3 * normal(r)); return a; }, u: 'g/dL' },
      ses: { nom: 'Sesgada (triglicéridos, mg/dL)', gen: function (r) { var a = []; for (var i = 0; i < 30; i++) a.push(Math.exp(4.9 + 0.55 * normal(r))); return a; }, u: 'mg/dL' },
      atip: { nom: 'Con valores atípicos (hemoglobina)', gen: function (r) { var a = []; for (var i = 0; i < 28; i++) a.push(10.3 + 1.1 * normal(r)); a.push(16.4, 17.1); return a; }, u: 'g/dL' }
    };
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Resumir un conjunto de datos') + '</h3><div class="row"><label for="ds' + (++ids) + '">Datos<select id="ds' + ids + '" data-k="d"><option value="sim">Simétrica</option><option value="ses">Sesgada</option><option value="atip">Con valores atípicos</option></select></label>' + rngSel('Añadir un valor extremo (0 = ninguno)', 'dx' + ids, 0, 100, 1, 0, 'x') + '</div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Puntos, caja y bigotes"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), cap = host.querySelector('.cap');
    function dib() {
      var v = vals(host), B = bases[v.d], dat = B.gen(M.rng(21)), mx = Math.max.apply(null, dat), mn = Math.min.apply(null, dat), ext = null;
      if (v.x > 0) { ext = mn + (mx - mn) * (1 + v.x / 60); dat.push(ext); mx = ext; }
      var n = dat.length, m = dat.reduce(function (a, b) { return a + b; }, 0) / n, sd = Math.sqrt(dat.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / (n - 1)), md = quant(dat, .5), q1 = quant(dat, .25), q3 = quant(dat, .75);
      var lo = Math.min(mn, 0 + mn) - (mx - mn) * 0.06, hi = mx + (mx - mn) * 0.06; function px(x) { return 30 + (x - lo) / (hi - lo) * (Wd - 60); }
      var s = '<line class="ax" x1="30" x2="' + (Wd - 30) + '" y1="' + (H - 40) + '" y2="' + (H - 40) + '"/>', i; for (i = 0; i <= 5; i++) { var tv = lo + (hi - lo) * i / 5; s += '<text x="' + px(tv) + '" y="' + (H - 20) + '" text-anchor="middle">' + f(tv, hi - lo > 30 ? 0 : 1) + '</text>'; }
      var srt = dat.slice().sort(function (a, b) { return a - b; }), cnt = {}; srt.forEach(function (x, k) { var key = Math.round(px(x) / 8); cnt[key] = (cnt[key] || 0) + 1; s += '<circle class="pt' + (ext !== null && Math.abs(x - ext) < 1e-9 ? ' ev' : '') + '" cx="' + px(x) + '" cy="' + (H - 52 - cnt[key] * 10) + '" r="4"/>'; });
      var by = 40, bh = 34, iqr = q3 - q1, wl = Math.min.apply(null, dat.filter(function (x) { return x >= q1 - 1.5 * iqr; })), wh = Math.max.apply(null, dat.filter(function (x) { return x <= q3 + 1.5 * iqr; }));
      s += '<line class="ci" x1="' + px(wl) + '" x2="' + px(q1) + '" y1="' + (by + bh / 2) + '" y2="' + (by + bh / 2) + '"/><line class="ci" x1="' + px(q3) + '" x2="' + px(wh) + '" y1="' + (by + bh / 2) + '" y2="' + (by + bh / 2) + '"/><rect x="' + px(q1) + '" y="' + by + '" width="' + (px(q3) - px(q1)) + '" height="' + bh + '" class="bx"/><line class="med" x1="' + px(md) + '" x2="' + px(md) + '" y1="' + by + '" y2="' + (by + bh) + '"/>';
      dat.filter(function (x) { return x < wl || x > wh; }).forEach(function (x) { s += '<circle class="atip" cx="' + px(x) + '" cy="' + (by + bh / 2) + '" r="4"/>'; });
      s += '<line class="dash" x1="' + px(m) + '" x2="' + px(m) + '" y1="22" y2="' + (H - 40) + '" style="stroke:var(--burg);stroke-width:2"/><text x="' + px(m) + '" y="16" text-anchor="middle" style="fill:var(--burg)">media ' + f(m, 1) + '</text><text x="' + px(md) + '" y="' + (by - 6) + '" text-anchor="middle" style="fill:var(--teal);font-weight:700">mediana ' + f(md, 1) + '</text>';
      svg.innerHTML = s; host.querySelector('[data-v=x]').textContent = v.x ? f(ext, 1) + ' ' + B.u : 'ninguno';
      out.innerHTML = kpi('Media', f(m, 1), 'se mueve con los extremos', 1) + kpi('Mediana', f(md, 1), 'casi no cambia', 1) + kpi('Desviación estándar', f(sd, 1), 'dispersión alrededor de la media') + kpi('Rango intercuartílico', f(q1, 1) + ' a ' + f(q3, 1), 'el 50 % central');
      cap.textContent = Math.abs(m - md) / sd > 0.1 ? 'La media (' + f(m, 1) + ') y la mediana (' + f(md, 1) + ') se separan: la distribución es asimétrica o hay valores extremos. Resume con mediana y rango intercuartílico.' : 'Media y mediana casi coinciden: la distribución es simétrica. Añade un valor extremo y observa cuánto se mueve la media y cuánto la mediana.';
    }
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 2 · Comparar dos medias (t de Welch) ───────── */
  W.comparar2 = function (host, cfg) {
    var Wd = 580, H = 220;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Comparar dos medias: la prueba t') + '</h3><div class="row">' + rngSel('Media del grupo 1', 'c1m' + (++ids), 8, 13, 0.1, cfg.m1 || 10.8, 'm1') + rngSel('Media del grupo 2', 'c2m' + ids, 8, 13, 0.1, cfg.m2 || 10.2, 'm2') + rngSel('DE (ambos grupos)', 'c3s' + ids, 0.5, 3, 0.1, cfg.sd || 1.4, 'sd') + rngSel('n por grupo', 'c4n' + ids, 10, 200, 1, cfg.n || 40, 'n') + '</div><div class="a22f"></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Diferencia de medias con su intervalo de confianza"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap');
    function dib() {
      var v = vals(host), r = M.welch(v.m1, v.sd, v.n, v.m2, v.sd, v.n), lo = Math.min(-1.5, r.lo - 0.4), hi = Math.max(1.5, r.hi + 0.4); function px(x) { return 40 + (x - lo) / (hi - lo) * (Wd - 80); }
      var s = '<line class="ax" x1="40" x2="' + (Wd - 40) + '" y1="150" y2="150"/>'; for (var t = Math.ceil(lo); t <= hi; t++) s += '<text x="' + px(t) + '" y="172" text-anchor="middle">' + t + '</text>';
      s += '<text x="' + (Wd / 2) + '" y="196" text-anchor="middle">Diferencia de medias (grupo 1 − grupo 2)</text><line class="dash" x1="' + px(0) + '" x2="' + px(0) + '" y1="30" y2="150"/><text x="' + px(0) + '" y="24" text-anchor="middle">0 = sin diferencia</text>';
      s += '<line class="ci" x1="' + px(r.lo) + '" x2="' + px(r.hi) + '" y1="90" y2="90" style="stroke-width:4;stroke:' + (r.lo > 0 || r.hi < 0 ? 'var(--teal)' : 'var(--muted)') + '"/><rect class="sq" x="' + (px(r.dif) - 8) + '" y="82" width="16" height="16" style="fill:' + (r.lo > 0 || r.hi < 0 ? 'var(--teal)' : 'var(--muted)') + '"/><text x="' + px(r.dif) + '" y="72" text-anchor="middle">' + f(r.dif, 2) + '</text><text x="' + px(r.lo) + '" y="116" text-anchor="middle">' + f(r.lo, 2) + '</text><text x="' + px(r.hi) + '" y="116" text-anchor="middle">' + f(r.hi, 2) + '</text>';
      svg.innerHTML = s; ['m1', 'm2', 'sd', 'n'].forEach(function (k) { host.querySelector('[data-v=' + k + ']').textContent = f(v[k], k === 'n' ? 0 : 1); });
      fo.innerHTML = tex('t=\\frac{\\bar x_1-\\bar x_2}{\\sqrt{s_1^2/n_1+s_2^2/n_2}}=\\frac{' + tx(r.dif, 2) + '}{' + tx(r.se, 3) + '}=' + tx(r.t, 2), true);
      out.innerHTML = kpi('Diferencia', f(r.dif, 2), 'IC 95 %: ' + f(r.lo, 2) + ' a ' + f(r.hi, 2), 1) + kpi('Valor p', r.p < 0.001 ? '< 0,001' : f(r.p, 3), 'prueba t de Welch', 1) + kpi('Estadístico t', f(r.t, 2), 'gl = ' + f(r.df, 1)) + kpi('¿IC incluye 0?', r.lo <= 0 && r.hi >= 0 ? 'Sí' : 'No', r.lo <= 0 && r.hi >= 0 ? 'compatible con ausencia de diferencia' : 'diferencia compatible solo con un sentido');
      cap.textContent = 'La prueba t compara la diferencia observada con el ruido esperable por azar (el error estándar). Con más n, el error estándar baja y el mismo efecto se vuelve más fácil de detectar; con más dispersión, ocurre lo contrario.';
    }
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 3 · Chi-cuadrado paso a paso ───────── */
  W.chi2 = function (host, cfg) {
    var p = cfg.preset || [[32, 55], [44, 129]], rows = cfg.filas || ['Con diabetes', 'Sin diabetes'], cols = cfg.cols || ['Con depresión', 'Sin depresión'];
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Prueba χ²: observados frente a esperados') + '</h3><div class="row"><table class="t22 c2"><tr><th></th>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>' + p.map(function (r, i) { return '<tr><th>' + rows[i] + '</th>' + r.map(function (x, j) { return '<td><input type="number" min="0" step="1" value="' + x + '" data-i="' + i + '" data-j="' + j + '" aria-label="' + rows[i] + ', ' + cols[j] + '"></td>'; }).join('') + '</tr>'; }).join('') + '</table></div><div class="a22f"></div><div class="out" aria-live="polite"></div><div class="c2e"></div><p class="cap"></p></div>';
    var out = host.querySelector('.out'), fo = host.querySelector('.a22f'), ee = host.querySelector('.c2e'), cap = host.querySelector('.cap');
    function dib() {
      var tab = p.map(function (r, i) { return r.map(function (_, j) { return Math.max(0, +host.querySelector('[data-i="' + i + '"][data-j="' + j + '"]').value || 0); }); }), r = M.chi2(tab), cont = 0;
      ee.innerHTML = '<table class="t22"><tr><th>Esperados (E)</th>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>' + r.E.map(function (fila, i) { return '<tr><th>' + rows[i] + '</th>' + fila.map(function (e, j) { var c = (tab[i][j] - e) * (tab[i][j] - e) / e; cont += c; return '<td style="background:color-mix(in srgb,var(--burg) ' + Math.min(60, c * 9) + '%,transparent)">' + f(e, 1) + '<br><small>(O−E)²/E = ' + f(c, 2) + '</small></td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      fo.innerHTML = tex('\\chi^2=\\sum\\frac{(O-E)^2}{E}=' + tx(r.chi, 2) + '\\qquad gl=(f-1)(c-1)=' + r.df, true);
      out.innerHTML = kpi('χ²', f(r.chi, 2), 'gl = ' + r.df, 1) + kpi('Valor p', r.p < 0.001 ? '< 0,001' : f(r.p, 3), r.p < 0.05 ? 'asociación estadísticamente detectable' : 'compatible con independencia', 1) + kpi('Total', f(r.N, 0), 'participantes');
      cap.textContent = 'Cada celda aporta (observado − esperado)² / esperado. Las celdas más oscuras son las que más se alejan de lo esperado si no hubiera asociación. Requiere esperados de al menos 5 en la mayoría de las celdas; si no, usa la prueba exacta de Fisher.';
    }
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 4 · Correlación ───────── */
  W.correlacion = function (host, cfg) {
    var Wd = 560, H = 270, rnd = M.rng(31), xs = [], zs = [], i; for (i = 0; i < 40; i++) { xs.push(normal(rnd)); zs.push(normal(rnd)); }
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Correlación de Pearson') + '</h3><div class="row">' + rngSel('Correlación objetivo (r)', 'cr' + (++ids), -0.95, 0.95, 0.05, cfg.r == null ? 0.7 : cfg.r, 'r') + '<label class="chk"><input type="checkbox" data-k="out"> Añadir un valor atípico</label></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Diagrama de dispersión"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), cap = host.querySelector('.cap');
    function dib() {
      var r0 = +host.querySelector('[data-k=r]').value, atip = host.querySelector('[data-k=out]').checked, x = xs.slice(), y = xs.map(function (v, k) { return r0 * v + Math.sqrt(1 - r0 * r0) * zs[k]; });
      if (atip) { x.push(3); y.push(-3); } var r = M.corr(x, y), o = M.ols(x, y); function px(v) { return 50 + (v + 4) / 8 * (Wd - 80); } function py(v) { return H - 30 - (v + 4) / 8 * (H - 60); }
      var s = '<line class="ax" x1="50" x2="' + (Wd - 30) + '" y1="' + py(0) + '" y2="' + py(0) + '"/><line class="ax" x1="' + px(0) + '" x2="' + px(0) + '" y1="20" y2="' + (H - 30) + '"/>';
      s += '<line class="fit" x1="' + px(-3.5) + '" y1="' + py(o.b0 - 3.5 * o.b1) + '" x2="' + px(3.5) + '" y2="' + py(o.b0 + 3.5 * o.b1) + '"/>'; x.forEach(function (v, k) { s += '<circle class="pt' + (atip && k === x.length - 1 ? ' ev' : '') + '" cx="' + px(v) + '" cy="' + py(y[k]) + '" r="' + (atip && k === x.length - 1 ? 6 : 4.5) + '"/>'; });
      svg.innerHTML = s; host.querySelector('[data-v=r]').textContent = f(r0, 2);
      out.innerHTML = kpi('r de Pearson', f(r, 2), atip ? 'con el valor atípico' : 'de estos datos', 1) + kpi('R² (r²)', f(r * r, 2), 'proporción de variabilidad compartida') + kpi('Pendiente de la recta', f(o.b1, 2), 'por cada unidad de x') + kpi('Fuerza', Math.abs(r) >= 0.7 ? 'Fuerte' : Math.abs(r) >= 0.4 ? 'Moderada' : 'Débil', 'orientativa');
      cap.textContent = atip ? 'Un solo valor atípico cambia mucho r y la recta. Revisa siempre el gráfico y no te quedes solo con el número.' : 'r mide la fuerza de la relación lineal, de −1 a +1. No dice nada sobre causalidad ni sobre relaciones no lineales. Añade el valor atípico para ver su efecto.';
    }
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 5 · Supuestos de la regresión lineal: diagnóstico de residuos ───────── */
  W.supuestos = function (host, cfg) {
    var Wd = 600, H = 250, rnd = M.rng(41), x = [], z = [], i; for (i = 0; i < 60; i++) { x.push(30 + 50 * rnd()); z.push(normal(rnd)); }
    var esc = {
      ok: { nom: 'Se cumplen', y: function (v, k) { return 90 + 0.9 * v + 5 * z[k]; }, t: 'Los residuos forman una nube sin patrón alrededor de 0: linealidad y varianza constante razonables.' },
      curva: { nom: 'Relación curva', y: function (v, k) { return 60 + 0.0178 * v * v + 5 * z[k]; }, t: 'Los residuos dibujan una curva (en forma de U). La relación no es lineal: añade un término cuadrático o transforma la variable.' },
      var: { nom: 'Varianza no constante', y: function (v, k) { return 90 + 0.9 * v + (0.12 * v - 2.5) * z[k] * 1.6; }, t: 'Los residuos se abren como un abanico. La varianza no es constante: usa errores estándar robustos (HC3), transforma el desenlace o modela la varianza.' },
      atip: { nom: 'Valor influyente', y: function (v, k) { return k === 0 ? 40 : 90 + 0.9 * v + 5 * z[k]; }, t: 'Un punto lejano arrastra la recta. Compruébalo con la distancia de Cook, verifica que no sea un error y analiza con y sin él.' }
    }, sel = 'ok';
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Diagnóstico de residuos') + '</h3><div class="row"><div class="seg">' + Object.keys(esc).map(function (k) { return '<button type="button" class="btn' + (k === sel ? '' : ' ghost') + '" data-s="' + k + '">' + esc[k].nom + '</button>'; }).join('') + '</div></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Dispersión y residuos contra valores ajustados"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), cap = host.querySelector('.cap');
    function dib() {
      var E = esc[sel], y = x.map(function (v, k) { return E.y(v, k); }), o = M.ols(x, y), fit = x.map(function (v) { return o.b0 + o.b1 * v; }), res = y.map(function (v, k) { return v - fit[k]; });
      var yl = Math.min.apply(null, y), yh = Math.max.apply(null, y), rr = Math.max.apply(null, res.map(Math.abs)); function px(v, a, b, o0, w) { return o0 + (v - a) / (b - a) * w; }
      var s = '<text x="150" y="14" text-anchor="middle" class="hd">Datos y recta ajustada</text><text x="450" y="14" text-anchor="middle" class="hd">Residuos frente a valores ajustados</text><line class="ax" x1="30" x2="270" y1="' + (H - 30) + '" y2="' + (H - 30) + '"/><line class="ax" x1="330" x2="570" y1="' + (H / 2 + 6) + '" y2="' + (H / 2 + 6) + '"/>';
      s += '<line class="fit" x1="' + px(30, 30, 80, 30, 240) + '" y1="' + (H - 30 - (o.b0 + o.b1 * 30 - yl) / (yh - yl) * (H - 70)) + '" x2="' + px(80, 30, 80, 30, 240) + '" y2="' + (H - 30 - (o.b0 + o.b1 * 80 - yl) / (yh - yl) * (H - 70)) + '"/>';
      x.forEach(function (v, k) { var inf = sel === 'atip' && k === 0; s += '<circle class="pt' + (inf ? ' ev' : '') + '" cx="' + px(v, 30, 80, 30, 240) + '" cy="' + (H - 30 - (y[k] - yl) / (yh - yl) * (H - 70)) + '" r="' + (inf ? 6 : 3.5) + '"/><circle class="pt' + (inf ? ' ev' : '') + '" cx="' + px(fit[k], Math.min.apply(null, fit), Math.max.apply(null, fit), 330, 240) + '" cy="' + (H / 2 + 6 - res[k] / rr * (H / 2 - 30)) + '" r="' + (inf ? 6 : 3.5) + '"/>'; });
      svg.innerHTML = s; out.innerHTML = kpi('R²', f(o.r2, 3), 'un R² alto no prueba que el modelo sea adecuado', 1) + kpi('Pendiente', f(o.b1, 2), 'por unidad de x') + kpi('Lectura de los residuos', sel === 'ok' ? 'Sin patrón' : 'Hay un patrón', sel === 'ok' ? 'supuestos razonables' : 'revisa el modelo', 1);
      cap.textContent = E.t;
    }
    host.querySelector('.seg').addEventListener('click', function (e) { var k = e.target.dataset && e.target.dataset.s; if (!k) return; sel = k; [].forEach.call(host.querySelectorAll('.seg .btn'), function (b) { b.classList.toggle('ghost', b.dataset.s !== k); }); dib(); }); dib();
  };

  /* ───────── 6 · Razón de riesgos instantáneos (HR) ───────── */
  W.hr = function (host, cfg) {
    var Wd = 560, H = 260;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Razón de riesgos instantáneos (HR) y curvas de supervivencia') + '</h3><div class="row">' + rngSel('HR del grupo tratado', 'hh' + (++ids), 0.2, 3, 0.05, cfg.hr || 0.6, 'hr') + rngSel('Mediana de supervivencia del control (meses)', 'hm' + ids, 6, 36, 1, cfg.med || 18, 'med') + '</div><div class="a22f"></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Dos curvas de supervivencia"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), fo = host.querySelector('.a22f'), cap = host.querySelector('.cap');
    function dib() {
      var v = vals(host), lam = Math.LN2 / v.med, T = 60; function px(t) { return 44 + t / T * (Wd - 70); } function py(s) { return H - 36 - s * (H - 66); }
      var s = '<line class="ax" x1="44" x2="' + (Wd - 26) + '" y1="' + py(0) + '" y2="' + py(0) + '"/>'; for (var i = 0; i <= 1; i += 0.25) s += '<line class="gl" x1="44" x2="' + (Wd - 26) + '" y1="' + py(i) + '" y2="' + py(i) + '"/><text x="38" y="' + (py(i) + 4) + '" text-anchor="end">' + f(i, 2) + '</text>'; for (i = 0; i <= 60; i += 12) s += '<text x="' + px(i) + '" y="' + (H - 16) + '" text-anchor="middle">' + i + '</text>'; s += '<text x="' + (Wd / 2) + '" y="' + (H - 2) + '" text-anchor="middle">Meses</text>';
      var d0 = '', d1 = ''; for (var t = 0; t <= T; t += 1) { d0 += (t ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(Math.exp(-lam * t)).toFixed(1); d1 += (t ? 'L' : 'M') + px(t).toFixed(1) + ' ' + py(Math.exp(-lam * v.hr * t)).toFixed(1); }
      var m1 = v.med / v.hr; s += '<path class="ln2" d="' + d0 + '"/><path class="ln" d="' + d1 + '"/><line class="dash" x1="44" x2="' + (Wd - 26) + '" y1="' + py(0.5) + '" y2="' + py(0.5) + '"/>';
      if (m1 <= T) s += '<line class="dash" x1="' + px(m1) + '" x2="' + px(m1) + '" y1="' + py(0.5) + '" y2="' + py(0) + '"/>'; s += '<line class="dash" x1="' + px(v.med) + '" x2="' + px(v.med) + '" y1="' + py(0.5) + '" y2="' + py(0) + '"/><text x="' + (Wd - 30) + '" y="30" text-anchor="end" style="fill:var(--burg)">Control</text><text x="' + (Wd - 30) + '" y="46" text-anchor="end" style="fill:var(--teal)">Tratamiento</text>';
      svg.innerHTML = s; host.querySelector('[data-v=hr]').textContent = f(v.hr, 2); host.querySelector('[data-v=med]').textContent = f(v.med, 0) + ' meses';
      var s24c = Math.exp(-lam * 24), s24t = Math.pow(s24c, v.hr); fo.innerHTML = tex('S_1(t)=S_0(t)^{HR}\\quad\\Rightarrow\\quad S_1(24)=' + tx(s24c, 3) + '^{' + tx(v.hr, 2) + '}=' + tx(s24t, 3), true);
      out.innerHTML = kpi('HR', f(v.hr, 2), v.hr < 1 ? 'menor riesgo instantáneo' : v.hr > 1 ? 'mayor riesgo instantáneo' : 'sin diferencia', 1) + kpi('Supervivencia a 24 meses', pc(s24t, 0), 'control: ' + pc(s24c, 0)) + kpi('Mediana tratamiento', f(m1, 1) + ' meses', 'control: ' + f(v.med, 0) + ' meses');
      cap.textContent = 'Un HR de ' + f(v.hr, 2) + ' significa que, en cualquier momento, quien recibe el tratamiento tiene ' + (v.hr < 1 ? f((1 - v.hr) * 100, 0) + ' % menos' : v.hr > 1 ? f((v.hr - 1) * 100, 0) + ' % más' : 'el mismo') + ' de riesgo instantáneo del evento que el control. No es un «riesgo relativo» acumulado.';
    }
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 7 · Prueba de log-rank paso a paso ───────── */
  W.logrank = function (host, cfg) {
    var D = M.DATOS.lr, R = M.logrank(D.t, D.e, D.g), Wd = 560, H = 240;
    function kmGrupo(g) { var t = [], e = []; D.t.forEach(function (x, i) { if (D.g[i] === g) { t.push(x); e.push(D.e[i]); } }); return M.km(t, e); }
    var K0 = kmGrupo(0), K1 = kmGrupo(1);
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Prueba de log-rank, un tiempo de evento a la vez') + '</h3><div class="a22g"><div class="hoja"><table class="t22 lrt"><tr><th>Tiempo</th><th>En riesgo (tot.)</th><th>En riesgo G1</th><th>Eventos</th><th>Ev. G1</th><th>E (G1)</th></tr>' + R.filas.map(function (r, i) { return '<tr data-i="' + i + '"><td>' + r.t + '</td><td>' + r.n + '</td><td>' + r.n1 + '</td><td>' + r.d + '</td><td>' + r.d1 + '</td><td>' + f(r.e1, 2) + '</td></tr>'; }).join('') + '</table></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Curvas de Kaplan-Meier de dos grupos"></svg></div><div class="a22f"></div><div class="out" aria-live="polite"></div><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), fo = host.querySelector('.a22f'), out = host.querySelector('.out'), cap = host.querySelector('.cap'), rows = host.querySelectorAll('.lrt tr[data-i]');
    function px(t) { return 40 + t / 28 * (Wd - 60); } function py(s) { return H - 34 - s * (H - 60); }
    function curva(K, cls) { var d = 'M' + px(0) + ' ' + py(1); K.forEach(function (r) { d += 'H' + px(r.t).toFixed(1) + 'V' + py(r.s).toFixed(1); }); return '<path class="' + cls + '" d="' + d + '"/>'; }
    function dib(step) {
      var s = '<line class="ax" x1="40" x2="' + (Wd - 20) + '" y1="' + py(0) + '" y2="' + py(0) + '"/>'; for (var i = 0; i <= 1; i += 0.25) s += '<line class="gl" x1="40" x2="' + (Wd - 20) + '" y1="' + py(i) + '" y2="' + py(i) + '"/><text x="34" y="' + (py(i) + 4) + '" text-anchor="end">' + f(i, 2) + '</text>'; for (i = 0; i <= 25; i += 5) s += '<text x="' + px(i) + '" y="' + (H - 14) + '" text-anchor="middle">' + i + '</text>';
      s += curva(K1, 'ln') + curva(K0, 'ln2') + '<text x="' + (Wd - 30) + '" y="24" text-anchor="end" style="fill:var(--teal)">Grupo 1 (tratamiento)</text><text x="' + (Wd - 30) + '" y="40" text-anchor="end" style="fill:var(--burg)">Grupo 0 (control)</text>';
      var k = Math.min(step, R.filas.length), tt = k ? R.filas[k - 1].t : 0; if (k) s += '<line class="dash" x1="' + px(tt) + '" x2="' + px(tt) + '" y1="20" y2="' + py(0) + '"/>'; svg.innerHTML = s;
      [].forEach.call(rows, function (r, j) { r.classList.toggle('on', j < k); r.classList.toggle('now', j === k - 1); });
      var O = 0, E = 0, V = 0; for (var j = 0; j < k; j++) { O += R.filas[j].d1; E += R.filas[j].e1; V += R.filas[j].v; }
      fo.innerHTML = step === 0 ? tex('\\chi^2=\\frac{(O_1-E_1)^2}{V}\\quad(1\\text{ gl})', true) : tex('O_1=' + O + ',\\; E_1=' + tx(E, 2) + ',\\; O_1-E_1=' + tx(O - E, 2) + (k === R.filas.length ? ',\\; V=' + tx(V, 2) + '\\;\\Rightarrow\\;\\chi^2=' + tx(R.chi, 2) : ''), true);
      out.innerHTML = k === R.filas.length ? kpi('χ² de log-rank', f(R.chi, 2), '1 grado de libertad', 1) + kpi('Valor p', f(R.p, 3), R.p < 0.05 ? 'curvas distintas' : 'compatible con curvas iguales', 1) + kpi('Observados / esperados G1', O + ' / ' + f(E, 1), 'esperados si no hubiera diferencia') : '';
      cap.textContent = step === 0 ? 'En cada tiempo con eventos se reparte el número esperado de eventos según el tamaño de cada grupo en riesgo. Si no hubiera diferencia entre grupos, lo observado sería parecido a lo esperado.' : k < R.filas.length ? 'Tiempo ' + tt + ': ' + R.filas[k - 1].d + ' evento(s) entre ' + R.filas[k - 1].n + ' en riesgo; al grupo 1 le corresponderían ' + f(R.filas[k - 1].e1, 2) + ' y tuvo ' + R.filas[k - 1].d1 + '.' : 'Se suman las diferencias observados − esperados de todos los tiempos y se compara con su variabilidad. El log-rank compara las curvas completas, no estima la magnitud (para eso, el HR de Cox).';
    }
    U.stepper(host.firstChild, R.filas.length + 1, dib, { ms: 1400 });
  };

  /* ───────── 8 · Datos perdidos: MCAR, MAR y MNAR ───────── */
  W.perdidos = function (host, cfg) {
    var Wd = 560, H = 270, rnd = M.rng(51), x = [], y = [], u = [], i; for (i = 0; i < 80; i++) { var xi = normal(rnd); x.push(xi); y.push(0.7 * xi + Math.sqrt(1 - 0.49) * normal(rnd)); u.push(rnd()); }
    var mec = { mcar: { nom: 'MCAR (completamente al azar)', p: function () { return 0.3; }, t: 'La pérdida no depende de nada observado ni no observado. Los casos completos son una muestra al azar: no hay sesgo (solo menos precisión).' }, mar: { nom: 'MAR (al azar, dado lo observado)', p: function (xi) { return clamp(0.3 + 0.28 * xi, 0.02, 0.9); }, t: 'La pérdida depende de x, que sí observamos. Los casos completos sesgan; se corrige con imputación múltiple o ponderación usando x.' }, mnar: { nom: 'MNAR (no al azar)', p: function (xi, yi) { return clamp(0.3 + 0.3 * yi, 0.02, 0.9); }, t: 'La pérdida depende del propio valor perdido. No se puede corregir con los datos observados: solo análisis de sensibilidad.' } }, sel = 'mcar';
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Tres mecanismos de datos perdidos') + '</h3><div class="row"><div class="seg">' + Object.keys(mec).map(function (k) { return '<button type="button" class="btn' + (k === sel ? '' : ' ghost') + '" data-s="' + k + '">' + mec[k].nom + '</button>'; }).join('') + '</div></div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Datos observados y perdidos"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), cap = host.querySelector('.cap');
    function px(v) { return 50 + (v + 3.5) / 7 * (Wd - 80); } function py(v) { return H - 30 - (v + 3.5) / 7 * (H - 60); }
    function dib() {
      var M0 = mec[sel], faltan = x.map(function (xi, k) { return u[k] < M0.p(xi, y[k]); }), yo = y.filter(function (_, k) { return !faltan[k]; }), xo = x.filter(function (_, k) { return !faltan[k]; }), mT = y.reduce(function (a, b) { return a + b; }, 0) / y.length, mO = yo.reduce(function (a, b) { return a + b; }, 0) / yo.length, sT = M.ols(x, y).b1, sO = M.ols(xo, yo).b1;
      var s = '<line class="ax" x1="50" x2="' + (Wd - 30) + '" y1="' + py(0) + '" y2="' + py(0) + '"/><line class="ax" x1="' + px(0) + '" x2="' + px(0) + '" y1="20" y2="' + (H - 30) + '"/>';
      x.forEach(function (xi, k) { s += faltan[k] ? '<circle class="pf" cx="' + px(xi) + '" cy="' + py(y[k]) + '" r="4.5"/>' : '<circle class="pt" cx="' + px(xi) + '" cy="' + py(y[k]) + '" r="4.5"/>'; }); svg.innerHTML = s;
      out.innerHTML = kpi('Datos perdidos', pc(faltan.filter(Boolean).length / x.length, 0), 'círculos huecos', 1) + kpi('Media de y', f(mO, 2), 'real: ' + f(mT, 2) + ' · sesgo ' + f(mO - mT, 2), 1) + kpi('Pendiente de y sobre x', f(sO, 2), 'real: ' + f(sT, 2));
      cap.textContent = M0.t;
    }
    host.querySelector('.seg').addEventListener('click', function (e) { var k = e.target.dataset && e.target.dataset.s; if (!k) return; sel = k; [].forEach.call(host.querySelectorAll('.seg .btn'), function (b) { b.classList.toggle('ghost', b.dataset.s !== k); }); dib(); }); dib();
  };

  /* ───────── 9 · GRADE: certeza de la evidencia ───────── */
  W.certeza = function (host, cfg) {
    var D = [['rob', 'Riesgo de sesgo'], ['inc', 'Inconsistencia'], ['ind', 'Evidencia indirecta'], ['imp', 'Imprecisión'], ['pub', 'Sesgo de publicación']], N = ['Muy baja', 'Baja', 'Moderada', 'Alta'], C = ['var(--bad)', 'var(--burg)', 'var(--teal-l)', 'var(--teal)'];
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Certeza de la evidencia (GRADE)') + '</h3><div class="row"><label for="gd' + (++ids) + '">Punto de partida<select id="gd' + ids + '" data-k="dis"><option value="4">Ensayos aleatorizados (alta)</option><option value="2">Estudios observacionales (baja)</option></select></label></div><div class="row">' + D.map(function (d, i) { return '<label for="g' + d[0] + ids + '">Bajar por ' + d[1].toLowerCase() + '<select id="g' + d[0] + ids + '" data-k="' + d[0] + '"><option value="0">Sin problema</option><option value="1">Serio (−1)</option><option value="2">Muy serio (−2)</option></select></label>'; }).join('') + '</div><div class="row up" hidden><label for="gu1' + ids + '">Subir por efecto grande<select id="gu1' + ids + '" data-k="efe"><option value="0">No</option><option value="1">Grande (+1)</option><option value="2">Muy grande (+2)</option></select></label><label for="gu2' + ids + '">Subir por gradiente dosis-respuesta<select id="gu2' + ids + '" data-k="dos"><option value="0">No</option><option value="1">Sí (+1)</option></select></label><label for="gu3' + ids + '">Subir por confusión residual a favor<select id="gu3' + ids + '" data-k="con"><option value="0">No</option><option value="1">Sí (+1)</option></select></label></div><div class="gr4" aria-live="polite"></div><p class="cap"></p></div>';
    var gr = host.querySelector('.gr4'), cap = host.querySelector('.cap'), up = host.querySelector('.up');
    function dib() {
      var v = vals(host), obs = +v.dis === 2; up.hidden = !obs; var bajar = D.reduce(function (acc, d) { return acc + (+v[d[0]]); }, 0), subir = obs && !bajar ? (+v.efe + +v.dos + +v.con) : 0, nivel = clamp(+v.dis - bajar + subir, 1, 4);
      gr.innerHTML = '<div class="gcir">' + [1, 2, 3, 4].map(function (k) { return '<span class="gc' + (k <= nivel ? ' on' : '') + '" style="' + (k <= nivel ? 'background:' + C[nivel - 1] : '') + '">⊕</span>'; }).join('') + '</div><b class="gn" style="color:' + C[nivel - 1] + '">Certeza ' + N[nivel - 1].toLowerCase() + '</b>';
      cap.textContent = (obs ? 'Los estudios observacionales parten de certeza baja y solo suben si no hay motivos para bajar y el efecto es grande, hay gradiente dosis-respuesta o la confusión residual iría en contra del efecto observado. ' : 'Los ensayos aleatorizados parten de certeza alta y bajan por cada limitación seria (−1) o muy seria (−2). ') + 'Resultado: ' + N[nivel - 1].toLowerCase() + ' (partida ' + (obs ? 'baja' : 'alta') + ', −' + bajar + (obs ? ', +' + subir : '') + ').';
    }
    host.addEventListener('change', dib); dib();
  };

  /* ───────── 10 · RoB 2: juicio global por dominios ───────── */
  W.rob2 = function (host, cfg) {
    var D = ['Proceso de aleatorización', 'Desviaciones de las intervenciones previstas', 'Datos de desenlace faltantes', 'Medición del desenlace', 'Selección del resultado informado'];
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'RoB 2: de los dominios al juicio global') + '</h3><div class="rob">' + D.map(function (d, i) { return '<div class="rb"><span class="dot" data-d="' + i + '"></span><label for="rb' + (++ids) + '">D' + (i + 1) + ' · ' + d + '<select id="rb' + ids + '" data-k="d' + i + '"><option value="0">Bajo riesgo</option><option value="1">Algunas preocupaciones</option><option value="2">Alto riesgo</option></select></label></div>'; }).join('') + '<div class="rb tot"><span class="dot" data-d="g"></span><b>Juicio global</b><span class="gl2"></span></div></div><p class="cap"></p></div>';
    var cap = host.querySelector('.cap'), N = ['Bajo riesgo de sesgo', 'Algunas preocupaciones', 'Alto riesgo de sesgo'], C = ['var(--ok)', '#E0A030', 'var(--bad)'];
    function dib() {
      var v = vals(host), js = D.map(function (_, i) { return +v['d' + i]; }), alto = js.some(function (x) { return x === 2; }), alg = js.filter(function (x) { return x === 1; }).length, g = alto ? 2 : alg ? 1 : 0;
      js.forEach(function (j, i) { host.querySelector('[data-d="' + i + '"]').style.background = C[j]; }); host.querySelector('[data-d=g]').style.background = C[g]; host.querySelector('.gl2').textContent = N[g];
      cap.textContent = alto ? 'Basta un dominio con alto riesgo para que el juicio global sea de alto riesgo.' : alg > 1 ? 'Sin dominios de alto riesgo, pero con varias preocupaciones: el juicio global es «algunas preocupaciones» y, si se acumulan y bajan sustancialmente la confianza, puede considerarse alto riesgo.' : alg === 1 ? 'Una preocupación sin dominios de alto riesgo: juicio global «algunas preocupaciones».' : 'Todos los dominios con bajo riesgo: juicio global de bajo riesgo de sesgo.';
    }
    host.addEventListener('change', dib); dib();
  };

  /* ───────── 11 · ROC: punto de corte, sensibilidad y especificidad ───────── */
  W.roc = function (host, cfg) {
    var Wd = 580, H = 250;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Punto de corte y curva ROC') + '</h3><div class="row">' + rngSel('Punto de corte', 'rc' + (++ids), -2, 4, 0.05, 1, 'c') + rngSel('Separación entre grupos (d)', 'rd' + ids, 0.2, 3, 0.1, cfg.d || 1.5, 'd') + rngSel('Prevalencia', 'rp' + ids, 1, 60, 1, 20, 'p') + '</div><div class="out" aria-live="polite"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Distribuciones de sanos y enfermos y curva ROC"></svg><p class="cap"></p></div>';
    var svg = host.querySelector('svg'), out = host.querySelector('.out'), cap = host.querySelector('.cap');
    function dib() {
      var v = vals(host), d = v.d, c = v.c, se = 1 - M.pnorm(c - d), sp = M.pnorm(c), auc = M.aucBinormal(d), r = M.dx(se, sp, v.p / 100); function dens(x, m) { return Math.exp(-0.5 * (x - m) * (x - m)) / Math.sqrt(2 * Math.PI); }
      var lo = -4, hi = d + 4; function px(x) { return 24 + (x - lo) / (hi - lo) * 270; } function py(y) { return 190 - y * 330; }
      function area(m, a, b, cls) { var s = 'M' + px(a) + ' ' + py(0); for (var x = a; x <= b + 1e-9; x += 0.05) s += 'L' + px(x).toFixed(1) + ' ' + py(dens(x, m)).toFixed(1); return '<path class="' + cls + '" d="' + s + 'L' + px(b) + ' ' + py(0) + 'Z"/>'; }
      function curva(m, cls) { var s = ''; for (var x = lo; x <= hi + 1e-9; x += 0.05) s += (s ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(dens(x, m)).toFixed(1); return '<path class="' + cls + '" d="' + s + '"/>'; }
      var s = '<line class="ax" x1="24" x2="294" y1="190" y2="190"/>' + area(d, c, hi, 'pw') + area(0, c, hi, 'sh') + curva(0, 'ln2') + curva(d, 'ln') + '<line class="dash" x1="' + px(c) + '" x2="' + px(c) + '" y1="26" y2="190"/><text x="' + px(c) + '" y="20" text-anchor="middle">corte</text><text x="' + px(0) + '" y="' + (py(0.4) - 6) + '" text-anchor="middle" style="fill:var(--burg)">Sanos</text><text x="' + px(d) + '" y="' + (py(0.4) - 6) + '" text-anchor="middle" style="fill:var(--teal)">Enfermos</text>';
      var ox = 340, oy = 20, w = 210; s += '<rect x="' + ox + '" y="' + oy + '" width="' + w + '" height="' + w + '" fill="none" class="ax"/><line class="gl" x1="' + ox + '" y1="' + (oy + w) + '" x2="' + (ox + w) + '" y2="' + oy + '"/>'; var dd = ''; for (var t = -4; t <= hi + 1e-9; t += 0.1) { var sx = M.pnorm(t), sy = 1 - M.pnorm(t - d); dd += (dd ? 'L' : 'M') + (ox + (1 - sx) * w).toFixed(1) + ' ' + (oy + (1 - sy) * w).toFixed(1); } s += '<path class="fit" d="' + dd + '"/><circle cx="' + (ox + (1 - sp) * w) + '" cy="' + (oy + (1 - se) * w) + '" r="6" style="fill:var(--burg)"/><text x="' + (ox + w / 2) + '" y="' + (oy + w + 22) + '" text-anchor="middle">1 − especificidad</text><text x="' + (ox - 8) + '" y="' + (oy + w / 2) + '" transform="rotate(-90 ' + (ox - 8) + ' ' + (oy + w / 2) + ')" text-anchor="middle">Sensibilidad</text>';
      svg.innerHTML = s; ['c', 'd', 'p'].forEach(function (k) { host.querySelector('[data-v=' + k + ']').textContent = f(v[k], k === 'p' ? 0 : 2) + (k === 'p' ? ' %' : ''); });
      out.innerHTML = kpi('Sensibilidad', pc(se, 0), 'enfermos con prueba positiva', 1) + kpi('Especificidad', pc(sp, 0), 'sanos con prueba negativa', 1) + kpi('AUC', f(auc, 2), 'área bajo la curva ROC') + kpi('VPP · VPN', pc(r.ppv, 0) + ' · ' + pc(r.npv, 0), 'con la prevalencia indicada');
      cap.textContent = 'Mover el punto de corte intercambia sensibilidad por especificidad: la curva ROC muestra todos los cortes a la vez. El AUC resume la capacidad de discriminar (0,5 = azar; 1 = perfecta) y no depende de la prevalencia; el valor predictivo sí.';
    }
    host.addEventListener('input', dib); dib();
  };
})(typeof window !== 'undefined' ? window : globalThis);
