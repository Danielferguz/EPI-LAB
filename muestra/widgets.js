/* EPI-LAB · simuladores y calculadoras de las unidades. Todo en el navegador, sin dependencias.
   Matemática en EPI_M (probada con node: ../pruebas/probar_matematica.js). */
(function (root) {
  'use strict';
  /* ───────── matemática ───────── */
  function pnorm(x) { // A&S 7.1.26 sobre erf; error < 1,5e-7
    var s = x < 0 ? -1 : 1, z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.3275911 * z);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
    return 0.5 * (1 + s * y);
  }
  function qnorm(p) { // Acklam, error relativo < 1,15e-9
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239],
      b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
      c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
      d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416], q, r;
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - 0.02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function tabla(a, b, c, d) { // a,b = expuestos con/sin evento; c,d = no expuestos con/sin evento
    var n1 = a + b, n0 = c + d, r1 = n1 ? a / n1 : NaN, r0 = n0 ? c / n0 : NaN, z = 1.959964, o = {};
    o.r1 = r1; o.r0 = r0; o.rd = r1 - r0;
    o.rr = a && c ? r1 / r0 : NaN; var se = Math.sqrt(1 / a - 1 / n1 + 1 / c - 1 / n0);
    o.rrCI = isFinite(se) && a && c ? [Math.exp(Math.log(o.rr) - z * se), Math.exp(Math.log(o.rr) + z * se)] : null;
    o.or = a && b && c && d ? (a * d) / (b * c) : NaN; var se2 = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
    o.orCI = isFinite(se2) && isFinite(o.or) ? [Math.exp(Math.log(o.or) - z * se2), Math.exp(Math.log(o.or) + z * se2)] : null;
    var se3 = Math.sqrt(r1 * (1 - r1) / n1 + r0 * (1 - r0) / n0);
    o.rdCI = isFinite(se3) ? [o.rd - z * se3, o.rd + z * se3] : null;
    o.nnt = o.rd ? 1 / Math.abs(o.rd) : Infinity; o.odds1 = b ? a / b : NaN; o.odds0 = d ? c / d : NaN;
    return o;
  }
  function rrDesdeOR(or, p0) { return or / (1 - p0 + p0 * or); }
  function nProp(p1, p2, alfa, pot, r) { // por grupo (grupo 1); r = n2/n1
    r = r || 1; var za = qnorm(1 - alfa / 2), zb = qnorm(pot), pb = (p1 + r * p2) / (1 + r), qb = 1 - pb;
    var num = za * Math.sqrt((1 + 1 / r) * pb * qb) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / r);
    return num * num / ((p1 - p2) * (p1 - p2));
  }
  function nMedia(delta, sd, alfa, pot, r) {
    r = r || 1; var za = qnorm(1 - alfa / 2), zb = qnorm(pot);
    return (1 + 1 / r) * sd * sd * (za + zb) * (za + zb) / (delta * delta);
  }
  function potProp(p1, p2, n, alfa) { // n por grupo, r = 1
    var za = qnorm(1 - alfa / 2), pb = (p1 + p2) / 2, qb = 1 - pb;
    return pnorm((Math.abs(p1 - p2) * Math.sqrt(n) - za * Math.sqrt(2 * pb * qb)) / Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)));
  }
  function wilson(x, n) { var z = 1.959964, p = x / n, d = 1 + z * z / n, c = p + z * z / (2 * n), s = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [(c - s) / d, (c + s) / d]; }
  function mh(estratos) { // razón de riesgos de Mantel-Haenszel; cada estrato [a,b,c,d]
    var num = 0, den = 0; estratos.forEach(function (e) { var a = e[0], b = e[1], c = e[2], d = e[3], N = a + b + c + d; num += a * (c + d) / N; den += c * (a + b) / N; });
    return num / den;
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var M = { pnorm: pnorm, qnorm: qnorm, tabla: tabla, rrDesdeOR: rrDesdeOR, nProp: nProp, nMedia: nMedia, potProp: potProp, wilson: wilson, mh: mh, rng: rng };
  root.EPI_M = M;
  if (typeof module !== 'undefined') module.exports = M;
  if (typeof document === 'undefined') return;

  /* ───────── utilidades de interfaz ───────── */
  function f(x, d) { return isFinite(x) ? x.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'; }
  function pc(x, d) { return isFinite(x) ? f(x * 100, d == null ? 1 : d) + ' %' : '—'; }
  function ci(c, d) { return c ? f(c[0], d) + ' a ' + f(c[1], d) : '—'; }
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
  var uid = 0;
  function num(label, val, o) { o = o || {}; var id = 'w' + (++uid); return '<label for="' + id + '">' + label + '<input id="' + id + '" type="number" inputmode="decimal" value="' + val + '"' + (o.min != null ? ' min="' + o.min + '"' : '') + (o.max != null ? ' max="' + o.max + '"' : '') + (o.step ? ' step="' + o.step + '"' : '') + ' data-k="' + o.k + '"></label>'; }
  function range(label, k, min, max, step, val, fmt) { var id = 'w' + (++uid); return '<div class="rng"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-k="' + k + '"><b data-v="' + k + '"></b></div>'; }
  function vals(host) { var v = {}; [].forEach.call(host.querySelectorAll('[data-k]'), function (i) { v[i.dataset.k] = i.type === 'range' || i.type === 'number' ? parseFloat(i.value) : i.value; }); return v; }
  function bind(host, fn) { host.addEventListener('input', fn); fn(); }
  function svgOpen(w, h) { return '<svg class="ch" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Gráfico">'; }

  var W = {};

  /* Tabla 2×2: riesgos, odds y razones con IC 95 % */
  W.tabla2x2 = function (host, cfg) {
    var p = cfg.preset || [24, 80, 40, 305], tit = cfg.title || 'Calculadora 2×2';
    host.innerHTML = '<div class="w"><h3>' + tit + '</h3><div class="row">' +
      '<table class="t22"><tr><th></th><th>Con evento</th><th>Sin evento</th></tr><tr><th>' + (cfg.exp || 'Expuestos') + '</th><td>' + num('a', p[0], { min: 0, k: 'a' }) + '</td><td>' + num('b', p[1], { min: 0, k: 'b' }) + '</td></tr><tr><th>' + (cfg.noexp || 'No expuestos') + '</th><td>' + num('c', p[2], { min: 0, k: 'c' }) + '</td><td>' + num('d', p[3], { min: 0, k: 'd' }) + '</td></tr></table></div>' +
      '<div class="out" aria-live="polite"></div><div class="msg info"></div></div>';
    bind(host, function () {
      var v = vals(host), t = tabla(v.a, v.b, v.c, v.d), o = host.querySelector('.out');
      o.innerHTML = [['Riesgo expuestos', pc(t.r1), 'a / (a + b)'], ['Riesgo no expuestos', pc(t.r0), 'c / (c + d)'], ['Odds expuestos', f(t.odds1, 2), 'a / b'], ['Odds no expuestos', f(t.odds0, 2), 'c / d'],
        ['RR (razón de riesgos)', f(t.rr, 2), 'IC 95 %: ' + ci(t.rrCI, 2), 1], ['OR (odds ratio)', f(t.or, 2), 'IC 95 %: ' + ci(t.orCI, 2), 1], ['Diferencia de riesgos', f(t.rd * 100, 1) + ' pp', 'IC 95 %: ' + (t.rdCI ? f(t.rdCI[0] * 100, 1) + ' a ' + f(t.rdCI[1] * 100, 1) : '—')], ['NNT / NNH', isFinite(t.nnt) ? f(Math.ceil(t.nnt), 0) : '—', t.rd > 0 ? 'personas para un evento adicional' : 'personas para evitar un evento']]
        .map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('');
      var m = host.querySelector('.msg'), r0 = t.r0;
      m.textContent = isFinite(t.rr) && isFinite(t.or) ? (r0 > 0.1 ? 'El desenlace es frecuente (riesgo en no expuestos ' + pc(r0, 0) + '): el OR (' + f(t.or, 2) + ') se aleja más de 1 que el RR (' + f(t.rr, 2) + ').' : 'El desenlace es poco frecuente: el OR (' + f(t.or, 2) + ') se parece al RR (' + f(t.rr, 2) + ').') : 'Escribe conteos mayores que cero en las cuatro celdas para calcular RR y OR.';
    });
  };

  /* OR ↔ RR según riesgo basal */
  W.orrr = function (host, cfg) {
    host.innerHTML = '<div class="w"><h3>Cuando el OR exagera el RR</h3><div class="row">' + range('Riesgo en no expuestos', 'p0', 0.01, 0.8, 0.01, cfg.p0 || 0.12) + range('Odds ratio', 'or', 0.2, 6, 0.05, cfg.or || 2.29) + '</div><div class="out" aria-live="polite"></div><div id="g"></div></div>';
    bind(host, function () {
      var v = vals(host), rr = rrDesdeOR(v.or, v.p0), r1 = v.p0 * rr;
      host.querySelector('[data-v=p0]').textContent = pc(v.p0, 0); host.querySelector('[data-v=or]').textContent = f(v.or, 2);
      host.querySelector('.out').innerHTML = [['RR equivalente', f(rr, 2), 'para ese OR y ese riesgo basal', 1], ['Riesgo en expuestos', pc(Math.min(r1, 1)), r1 > 1 ? 'no es posible: el OR es demasiado alto' : ''], ['Exageración', f((v.or - 1) / (rr - 1 || 1), 2) + '×', 'del exceso del OR sobre el del RR']]
        .map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('');
      var Wd = 560, H = 240, px = function (p) { return 44 + p * (Wd - 60); }, py = function (y) { return H - 30 - (y - 0.2) / 5.8 * (H - 50); }, d1 = '', d2 = '';
      for (var p = 0.01; p <= 0.8; p += 0.01) d1 += (d1 ? 'L' : 'M') + px(p).toFixed(1) + ' ' + py(Math.max(0.2, Math.min(6, rrDesdeOR(v.or, p)))).toFixed(1);
      host.querySelector('#g').innerHTML = svgOpen(Wd, H) + '<line class="ax" x1="44" y1="' + py(1) + '" x2="' + (Wd - 16) + '" y2="' + py(1) + '"/>' +
        [0, 0.2, 0.4, 0.6, 0.8].map(function (t) { return '<text x="' + px(t) + '" y="' + (H - 10) + '" text-anchor="middle">' + Math.round(t * 100) + ' %</text>'; }).join('') +
        [1, 2, 3, 4, 5, 6].map(function (t) { return '<text x="36" y="' + (py(t) + 4) + '" text-anchor="end">' + t + '</text>'; }).join('') +
        '<path class="ln" d="' + d1 + '"/><line class="dash" x1="' + px(v.p0) + '" y1="10" x2="' + px(v.p0) + '" y2="' + (H - 30) + '"/><circle cx="' + px(v.p0) + '" cy="' + py(Math.max(0.2, Math.min(6, rr))) + '" r="5" fill="var(--burg)"/>' +
        '<text x="' + (Wd - 16) + '" y="' + (py(v.or) - 6) + '" text-anchor="end">OR = ' + f(v.or, 2) + ' (línea de referencia)</text><line class="dash" x1="44" y1="' + py(v.or) + '" x2="' + (Wd - 16) + '" y2="' + py(v.or) + '"/>' +
        '<text x="' + (Wd / 2) + '" y="16" text-anchor="middle">RR equivalente según el riesgo en no expuestos</text></svg>';
    });
  };

  /* Tamaño de muestra */
  W.muestra = function (host, cfg) {
    var tipo = cfg.tipo || 'prop';
    host.innerHTML = '<div class="w"><h3>Tamaño de muestra · ' + (tipo === 'prop' ? 'comparar dos proporciones' : 'comparar dos medias') + '</h3><div class="row">' +
      (tipo === 'prop' ? num('Proporción grupo control', cfg.p1 || 0.3, { step: 0.01, min: 0.001, max: 0.999, k: 'p1' }) + num('Proporción grupo intervención', cfg.p2 || 0.2, { step: 0.01, min: 0.001, max: 0.999, k: 'p2' }) : num('Diferencia a detectar (Δ)', cfg.delta || 5, { step: 0.1, min: 0.01, k: 'delta' }) + num('Desviación estándar (σ)', cfg.sd || 12, { step: 0.1, min: 0.01, k: 'sd' })) +
      num('Alfa (bilateral)', 0.05, { step: 0.005, min: 0.001, max: 0.2, k: 'alfa' }) + num('Potencia', 0.8, { step: 0.05, min: 0.5, max: 0.99, k: 'pot' }) + num('Razón n2/n1', 1, { step: 0.5, min: 0.25, max: 4, k: 'r' }) + num('Pérdidas (%)', 10, { step: 1, min: 0, max: 60, k: 'perd' }) + '</div><div class="out" aria-live="polite"></div><div class="msg info"></div></div>';
    bind(host, function () {
      var v = vals(host), n1 = tipo === 'prop' ? nProp(v.p1, v.p2, v.alfa, v.pot, v.r) : nMedia(v.delta, v.sd, v.alfa, v.pot, v.r), ok = isFinite(n1) && n1 > 0;
      var c1 = Math.ceil(n1), c2 = Math.ceil(n1 * v.r), f1 = Math.ceil(c1 / (1 - v.perd / 100)), f2 = Math.ceil(c2 / (1 - v.perd / 100));
      host.querySelector('.out').innerHTML = ok ? [['Grupo 1 (sin pérdidas)', f(c1, 0), ''], ['Grupo 2 (sin pérdidas)', f(c2, 0), ''], ['Total sin pérdidas', f(c1 + c2, 0), ''], ['Total con pérdidas', f(f1 + f2, 0), f(f1, 0) + ' + ' + f(f2, 0), 1]].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('') : '';
      host.querySelector('.msg').textContent = ok ? 'Texto para el protocolo: «Con un alfa bilateral de ' + f(v.alfa, 2) + ', una potencia de ' + pc(v.pot, 0) + (tipo === 'prop' ? ' y proporciones esperadas de ' + pc(v.p1, 0) + ' y ' + pc(v.p2, 0) : ', una diferencia de ' + f(v.delta, 1) + ' y una desviación estándar de ' + f(v.sd, 1)) + ', se requieren ' + f(c1, 0) + ' y ' + f(c2, 0) + ' participantes por grupo; con ' + f(v.perd, 0) + ' % de pérdidas, ' + f(f1 + f2, 0) + ' en total.»' : 'Revisa los valores: no se puede calcular con estos datos.';
    });
  };

  /* Curva de potencia */
  W.potencia = function (host, cfg) {
    host.innerHTML = '<div class="w"><h3>Potencia según el tamaño de muestra</h3><div class="row">' + num('Proporción control', cfg.p1 || 0.3, { step: 0.01, min: 0.01, max: 0.99, k: 'p1' }) + num('Proporción intervención', cfg.p2 || 0.2, { step: 0.01, min: 0.01, max: 0.99, k: 'p2' }) + num('Alfa', 0.05, { step: 0.005, min: 0.001, max: 0.2, k: 'alfa' }) + range('n por grupo', 'n', 10, 600, 5, cfg.n || 100) + '</div><div class="out" aria-live="polite"></div><div id="g"></div></div>';
    bind(host, function () {
      var v = vals(host), pw = potProp(v.p1, v.p2, v.n, v.alfa), n80 = nProp(v.p1, v.p2, v.alfa, 0.8, 1);
      host.querySelector('[data-v=n]').textContent = f(v.n, 0);
      host.querySelector('.out').innerHTML = [['Potencia con ese n', pc(pw, 0), 'probabilidad de detectar la diferencia', 1], ['n por grupo para 80 %', f(Math.ceil(n80), 0), ''], ['Diferencia', f((v.p1 - v.p2) * 100, 1) + ' pp', '']].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('');
      var Wd = 560, H = 240, px = function (n) { return 44 + (n - 10) / 590 * (Wd - 60); }, py = function (y) { return H - 30 - y * (H - 50); }, d = '';
      for (var n = 10; n <= 600; n += 5) d += (d ? 'L' : 'M') + px(n).toFixed(1) + ' ' + py(potProp(v.p1, v.p2, n, v.alfa)).toFixed(1);
      host.querySelector('#g').innerHTML = svgOpen(Wd, H) + [0, 0.25, 0.5, 0.75, 1].map(function (t) { return '<line class="ax" x1="44" x2="' + (Wd - 16) + '" y1="' + py(t) + '" y2="' + py(t) + '"/><text x="38" y="' + (py(t) + 4) + '" text-anchor="end">' + Math.round(t * 100) + ' %</text>'; }).join('') +
        [100, 200, 300, 400, 500, 600].map(function (t) { return '<text x="' + px(t) + '" y="' + (H - 10) + '" text-anchor="middle">' + t + '</text>'; }).join('') +
        '<line class="dash" x1="44" x2="' + (Wd - 16) + '" y1="' + py(0.8) + '" y2="' + py(0.8) + '"/><path class="ln" d="' + d + '"/><circle cx="' + px(v.n) + '" cy="' + py(pw) + '" r="5" fill="var(--burg)"/><text x="' + (Wd / 2) + '" y="14" text-anchor="middle">Potencia (eje vertical) y n por grupo (eje horizontal)</text></svg>';
    });
  };

  /* Intervalos de confianza: cobertura por muestreo repetido */
  W.ic = function (host, cfg) {
    var semilla = 7, filas = [];
    host.innerHTML = '<div class="w"><h3>¿Qué significa «95 % de confianza»?</h3><div class="row">' + range('Proporción verdadera', 'p', 0.05, 0.95, 0.01, cfg.p || 0.3) + range('Tamaño de cada muestra', 'n', 20, 400, 10, cfg.n || 60) + '<button class="btn" type="button" data-a="mas">Sacar 50 muestras</button><button class="btn ghost" type="button" data-a="limpiar">Empezar de nuevo</button></div><div class="out" aria-live="polite"></div><div id="g"></div></div>';
    function dibujar() {
      var v = vals(host), tot = filas.length, ok = filas.filter(function (r) { return r.ok; }).length;
      host.querySelector('[data-v=p]').textContent = pc(v.p, 0); host.querySelector('[data-v=n]').textContent = f(v.n, 0);
      host.querySelector('.out').innerHTML = [['Intervalos que contienen el valor verdadero', tot ? pc(ok / tot, 1) : '—', ok + ' de ' + tot, 1], ['Muestras sacadas', f(tot, 0), 'cada línea es un estudio'], ['Esperado', '≈ 95 %', 'a largo plazo']].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('');
      var Wd = 560, H = 270, lo0 = Math.max(0, v.p - 0.3), hi0 = Math.min(1, v.p + 0.3), px = function (p) { return 24 + (p - lo0) / (hi0 - lo0) * (Wd - 48); }, ult = filas.slice(-50), s = svgOpen(Wd, H) + '<line class="dash" x1="' + px(v.p) + '" x2="' + px(v.p) + '" y1="8" y2="' + (H - 18) + '"/><text x="' + px(v.p) + '" y="' + (H - 4) + '" text-anchor="middle">valor verdadero ' + pc(v.p, 0) + '</text><text x="24" y="' + (H - 4) + '">' + pc(lo0, 0) + '</text><text x="' + (Wd - 24) + '" y="' + (H - 4) + '" text-anchor="end">' + pc(hi0, 0) + '</text>';
      ult.forEach(function (r, i) { var y = 12 + i * ((H - 40) / 50); s += '<line x1="' + px(r.lo) + '" x2="' + px(r.hi) + '" y1="' + y + '" y2="' + y + '" stroke="' + (r.ok ? 'var(--teal)' : 'var(--burg)') + '" stroke-width="' + (r.ok ? 1.6 : 2.6) + '"/><circle cx="' + px(r.p) + '" cy="' + y + '" r="1.8" fill="' + (r.ok ? 'var(--teal)' : 'var(--burg)') + '"/>'; });
      host.querySelector('#g').innerHTML = s + '</svg>';
    }
    host.addEventListener('click', function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === 'limpiar') filas = []; else { var v = vals(host), r = rng(semilla += 101); for (var i = 0; i < 50; i++) { var x = 0; for (var j = 0; j < v.n; j++) if (r() < v.p) x++; var w = wilson(x, v.n); filas.push({ p: x / v.n, lo: w[0], hi: w[1], ok: w[0] <= v.p && v.p <= w[1] }); } }
      dibujar();
    });
    host.addEventListener('input', function () { filas = []; dibujar(); }); dibujar();
  };

  /* Confusión: estrato vs crudo */
  var PRESETS = {
    exagera: { etiqueta: 'Confusión que exagera el efecto', trat: 'Catéter', ctrl: 'Fístula', ev: 'Muerte al año', est: ['Menores de 65 años', 'Mayores de 65 años'], d: [[[5, 95, 16, 384], null], [[80, 320, 18, 82], null]] },
    simpson: { etiqueta: 'Paradoja de Simpson', trat: 'Tratamiento nuevo', ctrl: 'Tratamiento habitual', ev: 'Éxito', est: ['Enfermedad leve', 'Enfermedad grave'], d: [[[9, 1, 80, 20], null], [[40, 60, 3, 7], null]] }
  };
  W.confusion = function (host, cfg) {
    var pk = cfg.preset || 'exagera', P = PRESETS[pk];
    var E = P.est, d = P.d.map(function (x) { return x[0]; });
    host.innerHTML = '<div class="w"><h3>' + P.etiqueta + '</h3><p style="margin:0;color:var(--muted)">Evento: <b>' + P.ev + '</b>. Cambia los conteos de cada estrato y compara el resultado crudo con el ajustado por estrato.</p><div class="row">' +
      d.map(function (e, i) { return '<div><b style="font:700 .9rem var(--head)">' + E[i] + '</b><table class="t22"><tr><th></th><th>Con evento</th><th>Sin evento</th></tr><tr><th>' + P.trat + '</th><td>' + num('a', e[0], { min: 0, k: 'a' + i }) + '</td><td>' + num('b', e[1], { min: 0, k: 'b' + i }) + '</td></tr><tr><th>' + P.ctrl + '</th><td>' + num('c', e[2], { min: 0, k: 'c' + i }) + '</td><td>' + num('d', e[3], { min: 0, k: 'd' + i }) + '</td></tr></table></div>'; }).join('') +
      '</div><div class="out" aria-live="polite"></div><div class="msg info"></div></div>';
    bind(host, function () {
      var v = vals(host), es = [0, 1].map(function (i) { return [v['a' + i], v['b' + i], v['c' + i], v['d' + i]]; }), cr = es[0].map(function (_, j) { return es[0][j] + es[1][j]; }), tc = tabla.apply(null, cr), mhRR = mh(es), t = es.map(function (e) { return tabla.apply(null, e); });
      host.querySelector('.out').innerHTML = [['RR crudo', f(tc.rr, 2), 'todos los pacientes juntos', 1], ['RR ' + E[0], f(t[0].rr, 2), ''], ['RR ' + E[1], f(t[1].rr, 2), ''], ['RR ajustado (Mantel-Haenszel)', f(mhRR, 2), 'combina los estratos', 1]].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('');
      var dif = Math.abs(Math.log(tc.rr / mhRR)), rev = (tc.rr > 1) !== (mhRR > 1);
      host.querySelector('.msg').textContent = rev ? 'El resultado crudo apunta en sentido contrario al de cada estrato: es la paradoja de Simpson. La variable que define los estratos (' + E.join(' / ').toLowerCase() + ') confunde la comparación.' : dif > 0.1 ? 'El RR crudo (' + f(tc.rr, 2) + ') difiere del ajustado (' + f(mhRR, 2) + ') en más del 10 %: hay confusión. Quien recibe ' + P.trat.toLowerCase() + ' no es comparable con quien recibe ' + P.ctrl.toLowerCase() + ' en ' + E.join(' / ').toLowerCase() + '.' : 'Crudo y ajustado son parecidos: con estos datos, la variable de los estratos no confunde.';
    });
  };

  /* Sesgo de selección: participación diferencial */
  W.seleccion = function (host, cfg) {
    var real = cfg.real || [100, 900, 1000, 9000];
    host.innerHTML = '<div class="w"><h3>Cómo la participación distorsiona el OR</h3><p style="margin:0;color:var(--muted)">Población fuente sin asociación real entre exposición y enfermedad (OR = ' + f(tabla.apply(null, real).or, 2) + '). Cambia la probabilidad de participar en cada celda.</p><div class="row">' +
      range('Expuestos enfermos', 'pa', 0.1, 1, 0.05, 0.9) + range('Expuestos sanos', 'pb', 0.1, 1, 0.05, 0.5) + range('No expuestos enfermos', 'pc', 0.1, 1, 0.05, 0.5) + range('No expuestos sanos', 'pd', 0.1, 1, 0.05, 0.5) + '</div><div class="out" aria-live="polite"></div><div class="msg info"></div></div>';
    bind(host, function () {
      var v = vals(host); ['pa', 'pb', 'pc', 'pd'].forEach(function (k) { host.querySelector('[data-v=' + k + ']').textContent = pc(v[k], 0); });
      var o = [real[0] * v.pa, real[1] * v.pb, real[2] * v.pc, real[3] * v.pd], t = tabla.apply(null, o), r = tabla.apply(null, real);
      host.querySelector('.out').innerHTML = [['OR verdadero', f(r.or, 2), 'en la población fuente'], ['OR observado', f(t.or, 2), 'solo entre quienes participan', 1], ['Participantes', f(o.reduce(function (s, x) { return s + x; }, 0), 0), 'esperados']].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('');
      host.querySelector('.msg').textContent = Math.abs(Math.log(t.or / r.or)) < 0.05 ? 'La participación es proporcional en las cuatro celdas: el OR observado coincide con el verdadero.' : 'Como la participación depende a la vez de la exposición y de la enfermedad, el OR observado (' + f(t.or, 2) + ') ya no refleja el verdadero (' + f(r.or, 2) + '). Esto es un sesgo de selección.';
    });
  };

  /* Aleatorización simple vs por bloques */
  W.aleatorizacion = function (host, cfg) {
    var sem = 11;
    host.innerHTML = '<div class="w"><h3>Aleatorización simple y por bloques</h3><div class="row">' + range('Participantes', 'n', 20, 200, 2, cfg.n || 40) + '<label for="mt">Método<select id="mt" data-k="m"><option value="simple">Simple (moneda)</option><option value="bloques">Bloques de 4</option></select></label><button class="btn" type="button" data-a="una">Asignar</button><button class="btn ghost" type="button" data-a="mil">Repetir 1000 veces</button></div><div class="out" aria-live="polite"></div><div id="g"></div></div>';
    function asignar(n, m, r) { var g = [], i; if (m === 'simple') { for (i = 0; i < n; i++) g.push(r() < 0.5 ? 1 : 0); } else { while (g.length < n) { var b = [0, 0, 1, 1]; for (i = 3; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } g = g.concat(b); } g = g.slice(0, n); } return g; }
    function mostrar(txt) { host.querySelector('.out').innerHTML = txt; }
    host.addEventListener('input', function () { host.querySelector('[data-v=n]').textContent = f(vals(host).n, 0); });
    host.querySelector('[data-v=n]').textContent = f(vals(host).n, 0);
    host.addEventListener('click', function (e) {
      var a = e.target.dataset && e.target.dataset.a; if (!a) return; var v = vals(host), r = rng(sem += 17), s;
      if (a === 'una') { var g = asignar(v.n, v.m, r), n1 = g.reduce(function (x, y) { return x + y; }, 0); mostrar([['Grupo intervención', f(n1, 0), ''], ['Grupo control', f(v.n - n1, 0), ''], ['Diferencia', f(Math.abs(2 * n1 - v.n), 0), 'participantes de más en un grupo', 1]].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('')); host.querySelector('#g').innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:3px">' + g.map(function (x) { return '<span style="width:14px;height:14px;border-radius:3px;background:' + (x ? 'var(--teal)' : 'var(--burg)') + '"></span>'; }).join('') + '</div><p class="why">Azul: intervención · Burdeos: control</p>'; }
      else { var h = {}, mx = 0, tot = 0; for (var i = 0; i < 1000; i++) { var gg = asignar(v.n, v.m, r), d = Math.abs(2 * gg.reduce(function (x, y) { return x + y; }, 0) - v.n); h[d] = (h[d] || 0) + 1; mx = Math.max(mx, d); tot += d; }
        var Wd = 560, H = 220, bw = (Wd - 60) / (mx + 1), top = Math.max.apply(null, Object.keys(h).map(function (k) { return h[k]; }));
        s = svgOpen(Wd, H); for (var k = 0; k <= mx; k++) { var hh = (h[k] || 0) / top * (H - 60); s += '<rect x="' + (44 + k * bw) + '" y="' + (H - 30 - hh) + '" width="' + (bw - 2) + '" height="' + hh + '" fill="var(--teal)"/><text x="' + (44 + k * bw + bw / 2) + '" y="' + (H - 14) + '" text-anchor="middle">' + k + '</text>'; }
        host.querySelector('#g').innerHTML = s + '<text x="' + (Wd / 2) + '" y="14" text-anchor="middle">Diferencia de tamaño entre grupos en 1000 repeticiones</text></svg>'; mostrar([['Diferencia media', f(tot / 1000, 1), 'participantes', 1], ['Diferencia máxima', f(mx, 0), 'en 1000 repeticiones']].map(function (k) { return '<div class="kpi' + (k[3] ? ' hot' : '') + '"><small>' + k[0] + '</small><b>' + k[1] + '</b><i>' + k[2] + '</i></div>'; }).join('')); }
    });
  };

  /* Selector de diseño */
  var ARBOL = {
    q1: { q: '¿El investigador asigna la exposición o intervención?', o: [['Sí, la asigna', 'q2'], ['No, solo observa', 'q3']] },
    q2: { q: '¿La asignación es al azar?', o: [['Sí', 'r_eca'], ['No', 'r_cuasi']] },
    q3: { q: '¿Compara grupos o estima asociaciones?', o: [['No, solo describe', 'r_desc'], ['Sí, compara', 'q4']] },
    q4: { q: '¿Cómo se eligen los participantes?', o: [['Por la exposición (se sigue hacia el desenlace)', 'r_cohorte'], ['Por el desenlace (casos y controles)', 'r_cc'], ['Sin elegir por exposición ni desenlace, en un momento dado', 'r_trans']] },
    r_eca: { r: 'Ensayo clínico aleatorizado', d: 'Mejor diseño para estimar el efecto de una intervención: la aleatorización equilibra, en promedio, los factores conocidos y desconocidos.', m: 'RR, RD, HR · reporte CONSORT' },
    r_cuasi: { r: 'Ensayo no aleatorizado / cuasi-experimental', d: 'El investigador asigna, pero sin azar; hay más riesgo de confusión y se necesita ajustar.', m: 'RR, RD · reporte TREND' },
    r_desc: { r: 'Estudio descriptivo (serie de casos, ecológico, reporte)', d: 'Describe frecuencia, distribución o características; no estima efectos.', m: 'Prevalencia, proporciones · reporte STROBE / CARE' },
    r_cohorte: { r: 'Estudio de cohortes', d: 'Parte de personas con y sin exposición y las sigue en el tiempo; mide incidencia.', m: 'RR, HR, razón de tasas · reporte STROBE' },
    r_cc: { r: 'Estudio de casos y controles', d: 'Parte de personas con la enfermedad (casos) y sin ella (controles) y compara su exposición pasada. Eficiente para enfermedades raras.', m: 'OR · reporte STROBE' },
    r_trans: { r: 'Estudio transversal', d: 'Mide exposición y desenlace al mismo tiempo en una muestra; estima prevalencia.', m: 'Prevalencia, RP, OR · reporte STROBE' }
  };
  W.diseno = function (host) {
    var ruta = ['q1'];
    function dibujar() {
      var k = ruta[ruta.length - 1], n = ARBOL[k], h = '<div class="w"><h3>¿Qué diseño es?</h3>';
      if (n.q) h += '<p style="margin:0;font-weight:600">' + n.q + '</p><div class="row">' + n.o.map(function (o) { return '<button class="btn ghost" type="button" data-n="' + o[1] + '">' + o[0] + '</button>'; }).join('') + '</div>';
      else h += '<div class="msg ok"><b>' + n.r + '</b><br>' + n.d + '<br><small>' + n.m + '</small></div>';
      if (ruta.length > 1) h += '<div class="row"><button class="btn ghost" type="button" data-n="__atras">Volver</button><button class="btn ghost" type="button" data-n="__ini">Empezar de nuevo</button></div>';
      host.innerHTML = h + '</div>';
    }
    host.addEventListener('click', function (e) { var n = e.target.dataset && e.target.dataset.n; if (!n) return; if (n === '__atras') ruta.pop(); else if (n === '__ini') ruta = ['q1']; else ruta.push(n); dibujar(); }); dibujar();
  };

  /* Clasificar escenarios */
  W.clasificar = function (host, cfg) {
    var items = cfg.items, i = 0, ok = 0, opts = cfg.opts;
    function dibujar() {
      if (i >= items.length) { host.innerHTML = '<div class="w"><div class="msg ' + (ok === items.length ? 'ok' : 'info') + '"><b>' + ok + ' de ' + items.length + ' correctas.</b></div><div class="row"><button class="btn ghost" type="button" data-n="r">Repetir</button></div></div>'; return; }
      var it = items[i]; host.innerHTML = '<div class="w"><h3>' + (cfg.title || 'Clasifica el escenario') + ' (' + (i + 1) + '/' + items.length + ')</h3><p style="margin:0">' + it.t + '</p><div class="row">' + opts.map(function (o, j) { return '<button class="btn ghost" type="button" data-n="' + j + '">' + o + '</button>'; }).join('') + '</div><div class="fb" aria-live="polite"></div></div>';
    }
    host.addEventListener('click', function (e) {
      var n = e.target.dataset && e.target.dataset.n; if (n == null) return;
      if (n === 'r') { i = 0; ok = 0; dibujar(); return; } if (n === 'sig') { i++; dibujar(); return; }
      var it = items[i], fb = host.querySelector('.fb'); if (fb.dataset.done) return; fb.dataset.done = 1; var good = +n === it.a; if (good) ok++;
      fb.innerHTML = '<div class="msg ' + (good ? 'ok' : 'bad') + '">' + (good ? 'Correcto. ' : 'No exactamente. Respuesta: <b>' + opts[it.a] + '</b>. ') + it.w + '</div><div class="row"><button class="btn" type="button" data-n="sig">' + (i + 1 < items.length ? 'Siguiente' : 'Ver resultado') + '</button></div>';
    }); dibujar();
  };

  root.EPI_W = W;
})(typeof window !== 'undefined' ? window : globalThis);
