/* EPI-LAB · explicadores animados (3.ª serie): estadística desde cero. Cada uno narra en lenguaje llano, con un ejemplo y su interpretación.
   Media y mediana, desviación estándar paso a paso, histograma, valor p por simulación y azar frente a sesgo. */
(function (root) {
  'use strict';
  var W = root.EPI_W, M = root.EPI_M, U = root.EPI_U;
  if (!W || !M || !U || typeof document === 'undefined') return;
  var f = U.f, kpi = U.kpi, clamp = U.clamp, stepper = U.stepper, tween = U.tween, motionOk = U.motionOk;
  function rngSel(label, id, min, max, step, val, k) { return '<div class="rng"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-k="' + k + '"><b data-v="' + k + '"></b></div>'; }
  function vals(host) { var o = {}; [].forEach.call(host.querySelectorAll('[data-k]'), function (i) { o[i.dataset.k] = (i.type === 'range' || i.type === 'number') ? +i.value : i.value; }); return o; }
  var ids = 0, SV = 'style="fill:var(--sky)"', SA = 'style="fill:var(--amber)"', SC = 'style="fill:var(--coral)"', SL = 'style="fill:var(--leaf)"';
  function normal(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function media(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function mediana(a) { var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length; return n % 2 ? s[(n - 1) >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  function sayBox(txt) { return '<div class="say" aria-live="polite">' + txt + '</div>'; }

  /* ───────── 1 · Media y mediana desde cero ───────── */
  W.centro = function (host, cfg) {
    var base = [3, 4, 4, 5, 5, 6, 7], EXT = 30, Wd = 580, H = 250, lo = 0, hi = 32;
    function px(x) { return 30 + (x - lo) / (hi - lo) * (Wd - 60); }
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'El promedio y la mediana, paso a paso') + '</h3><div class="say"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Días de hospitalización de siete pacientes, con la media y la mediana"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out'), mAnim = null, prevM = media(base);
    var T = [
      '<b>Paso 1 · Los datos.</b> Cada punto es un paciente y su posición es cuántos <b>días estuvo hospitalizado</b>: 3, 4, 4, 5, 5, 6 y 7 días.',
      '<b>Paso 2 · El promedio (media).</b> Suma todos los días y divide entre el número de pacientes: <b>34 ÷ 7 = 4,9 días</b>. Es el punto de equilibrio: si los puntos fueran pesos sobre una regla, la regla se sostendría justo ahí.',
      '<b>Paso 3 · La mediana.</b> Ordena los valores y toma el del medio: con siete pacientes es el cuarto, <b>5 días</b>. La mitad de los pacientes estuvo menos que eso y la otra mitad más.',
      '<b>Paso 4 · Llega un caso extremo.</b> Un paciente con complicaciones se queda <b>30 días</b>. Mira qué pasa con la media y con la mediana.',
      '<b>Paso 5 · Quién se movió.</b> La media saltó de 4,9 a <b>8,0 días</b>: ya no describe a casi nadie. La mediana sigue en <b>5 días</b>, el paciente típico.',
      '<b>Paso 6 · Cómo decidir.</b> Si los datos son simétricos usa la <b>media</b>. Si hay valores extremos o una cola larga (estancias, costos, triglicéridos) usa la <b>mediana</b>. Informa siempre cuál usaste.'
    ];
    function draw(i, mShow) {
      var dat = i >= 3 ? base.concat([EXT]) : base, m = i >= 3 && mShow != null ? mShow : media(dat), md = mediana(dat), s = '<line class="ax" x1="30" x2="' + (Wd - 30) + '" y1="190" y2="190"/>', k, cnt = {};
      for (k = 0; k <= 30; k += 5) s += '<text x="' + px(k) + '" y="212" text-anchor="middle">' + k + '</text>';
      s += '<text x="' + (Wd / 2) + '" y="238" text-anchor="middle">Días de hospitalización</text>';
      dat.forEach(function (x, j) { cnt[x] = (cnt[x] || 0) + 1; var ext = i >= 3 && j === dat.length - 1; s += '<circle cx="' + px(x) + '" cy="' + (176 - cnt[x] * 20) + '" r="9" ' + (ext ? SC : SV) + ' opacity=".92"' + (ext ? ' class="nw"' : '') + '/>'; });
      if (i >= 1) s += '<polygon points="' + px(m) + ',192 ' + (px(m) - 10) + ',212 ' + (px(m) + 10) + ',212" ' + SA + '/><line x1="' + px(m) + '" x2="' + px(m) + '" y1="30" y2="192" style="stroke:var(--amber);stroke-width:3"/><text x="' + px(m) + '" y="22" text-anchor="middle" style="fill:var(--amber);font-weight:800;font-size:13px">media ' + f(m, 1) + '</text>';
      if (i >= 2) s += '<line x1="' + px(md) + '" x2="' + px(md) + '" y1="48" y2="192" style="stroke:var(--leaf);stroke-width:3;stroke-dasharray:6 4"/><text x="' + px(md) + '" y="44" text-anchor="middle" style="fill:var(--leaf);font-weight:800;font-size:13px">mediana ' + f(md, 1) + '</text>';
      svg.innerHTML = s;
      out.innerHTML = i >= 1 ? kpi('Media', f(m, 1) + ' días', i >= 4 ? 'arrastrada por el extremo' : 'punto de equilibrio', 1) + (i >= 2 ? kpi('Mediana', f(md, 1) + ' días', 'el valor del medio', 1) : '') + kpi('Pacientes', dat.length, i >= 3 ? 'con el caso extremo' : 'sin casos extremos') : '';
    }
    stepper(host, T.length, function (i) {
      say.innerHTML = T[i]; if (mAnim) mAnim();
      if (i === 4 && motionOk()) { var a = media(base), b = media(base.concat([EXT])); mAnim = tween(1100, function (t) { draw(4, a + (b - a) * t); }); } else draw(i, null);
    }, { ms: 4200 });
  };

  /* ───────── 2 · Desviación estándar construida paso a paso ───────── */
  W.dispersion = function (host, cfg) {
    var D = { a: { nom: 'Pacientes muy distintos entre sí', v: [4, 6, 7, 8, 10, 13] }, b: { nom: 'Pacientes parecidos entre sí', v: [7, 7.5, 8, 8, 8.5, 9] } }, Wd = 580, H = 250, sel = 'a';
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'La desviación estándar: cuánto se alejan los datos del promedio') + '</h3><div class="row"><label for="dsd' + (++ids) + '">Ejemplo<select id="dsd' + ids + '" data-k="d"><option value="a">' + D.a.nom + '</option><option value="b">' + D.b.nom + '</option></select></label></div><div class="say"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Distancia de cada valor a la media y cuadrados"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out'), S;
    function py(v) { return 215 - v * 14; }
    function draw(i) {
      var v = D[sel].v, n = v.length, m = media(v), dev = v.map(function (x) { return x - m; }), ss = dev.reduce(function (a, d) { return a + d * d; }, 0), vr = ss / (n - 1), sd = Math.sqrt(vr), s = '<line class="ax" x1="30" x2="' + (Wd - 20) + '" y1="215" y2="215"/>', k;
      var T = [
        '<b>Paso 1 · Los datos.</b> Seis pacientes y sus <b>días de espera</b> para una consulta: ' + v.map(function (x) { return f(x, v === D.b.v ? 1 : 0); }).join(', ') + '. Queremos un número que diga <b>cuánto varían</b>.',
        '<b>Paso 2 · La media</b> es ' + f(m, 1) + ' días. Es la línea de referencia: ¿qué tan lejos está cada paciente de ella?',
        '<b>Paso 3 · La distancia de cada uno.</b> Resta la media a cada valor. Algunos quedan por encima (+) y otros por debajo (−); si las sumas, se cancelan y da cero.',
        '<b>Paso 4 · Elevar al cuadrado.</b> Para que no se cancelen, cada distancia se multiplica por sí misma. Es el área de un cuadrado: las distancias grandes pesan mucho más.',
        '<b>Paso 5 · La varianza.</b> Suma las áreas (' + f(ss, 1) + ') y divídelas entre n − 1 = ' + (n - 1) + ': <b>' + f(vr, 2) + '</b>. Está en «días al cuadrado», que no se entiende bien.',
        '<b>Paso 6 · La desviación estándar (DE).</b> Raíz cuadrada de la varianza: <b>' + f(sd, 2) + ' días</b>. Se interpreta así: <b>en promedio, un paciente se aleja unos ' + f(sd, 1) + ' días de la media</b>. Si los datos forman una campana, cerca de 2 de cada 3 caen entre ' + f(m - sd, 1) + ' y ' + f(m + sd, 1) + '.'
      ];
      say.innerHTML = T[i];
      var xs = function (j) { return 70 + j * 84; };
      if (i >= 5) s += '<rect x="30" y="' + py(m + sd) + '" width="' + (Wd - 50) + '" height="' + (py(m - sd) - py(m + sd)) + '" ' + SL + ' opacity=".16" class="nw"/>';
      if (i >= 3) v.forEach(function (x, j) { var d = Math.abs(dev[j]) * 14, y0 = dev[j] >= 0 ? py(m + dev[j]) : py(m); if (i >= 3 && i < 5 && d > 0) s += '<rect x="' + (xs(j) + 10) + '" y="' + (dev[j] >= 0 ? py(m) - d : py(m)) + '" width="' + d + '" height="' + d + '" ' + SA + ' opacity=".35" stroke="var(--amber)" class="nw"/>'; });
      v.forEach(function (x, j) {
        s += '<line x1="' + xs(j) + '" x2="' + xs(j) + '" y1="215" y2="' + py(x) + '" style="stroke:var(--line);stroke-width:2"/>';
        if (i >= 2) s += '<line x1="' + xs(j) + '" x2="' + xs(j) + '" y1="' + py(m) + '" y2="' + py(x) + '" style="stroke:' + (dev[j] >= 0 ? 'var(--coral)' : 'var(--sky)') + ';stroke-width:4" class="nw"/><text x="' + (xs(j) - 8) + '" y="' + ((py(x) + py(m)) / 2 + 4) + '" text-anchor="end" style="font-size:11px;font-weight:700;fill:' + (dev[j] >= 0 ? 'var(--coral)' : 'var(--sky)') + '">' + (dev[j] >= 0 ? '+' : '') + f(dev[j], 1) + '</text>';
        s += '<circle cx="' + xs(j) + '" cy="' + py(x) + '" r="8" ' + SV + '/><text x="' + xs(j) + '" y="233" text-anchor="middle">Paciente ' + (j + 1) + '</text>';
      });
      if (i >= 1) s += '<line x1="30" x2="' + (Wd - 20) + '" y1="' + py(m) + '" y2="' + py(m) + '" style="stroke:var(--amber);stroke-width:3"/><text x="' + (Wd - 24) + '" y="' + (py(m) - 6) + '" text-anchor="end" style="fill:var(--amber);font-weight:800">media ' + f(m, 1) + '</text>';
      svg.innerHTML = s;
      out.innerHTML = (i >= 4 ? kpi('Suma de cuadrados', f(ss, 1), 'áreas sumadas') : '') + (i >= 4 ? kpi('Varianza', f(vr, 2), 'suma ÷ (n − 1)', i === 4) : '') + (i >= 5 ? kpi('Desviación estándar', f(sd, 2), 'en días, las unidades originales', 1) : '');
    }
    S = stepper(host, 6, draw, { ms: 4600 });
    host.addEventListener('change', function (e) { if (e.target.dataset.k === 'd') { sel = e.target.value; S.go(S.i); } });
  };

  /* ───────── 3 · Del dato al histograma ───────── */
  W.histograma = function (host, cfg) {
    var rnd = M.rng(33), hb = [], est = [], i, Wd = 580, H = 250;
    for (i = 0; i < 80; i++) hb.push(10.3 + 1.3 * normal(rnd));
    for (i = 0; i < 80; i++) est.push(Math.round(Math.exp(1.45 + 0.7 * normal(rnd)) * 10) / 10 + 1);
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Del dato al histograma: ¿qué forma tienen mis datos?') + '</h3><div class="row"><label for="hd' + (++ids) + '">Datos de 80 pacientes<select id="hd' + ids + '" data-k="d"><option value="hb">Hemoglobina (g/dL)</option><option value="es">Estancia hospitalaria (días)</option></select></label>' + rngSel('Ancho de cada barra (la «caja» donde se cuentan los pacientes)', 'hw' + ids, 1, 6, 1, 3, 'w') + '</div><div class="say"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Histograma"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out');
    function dib() {
      var v = vals(host), d = v.d === 'es' ? est : hb, mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), ancho = v.d === 'es' ? v.w * 1.5 : v.w * 0.5, u = v.d === 'es' ? 'días' : 'g/dL', lo = Math.floor(mn / ancho) * ancho, nb = Math.ceil((mx - lo) / ancho + 1e-9), c = [], k, s = '';
      for (k = 0; k < nb; k++) c.push(0); d.forEach(function (x) { c[Math.min(nb - 1, Math.floor((x - lo) / ancho))]++; });
      var top = Math.max.apply(null, c), bw = (Wd - 70) / nb, ps = function (n) { return 200 - n / top * 150; };
      host.querySelector('[data-v=w]').textContent = f(ancho, 1) + ' ' + u;
      s += '<line class="ax" x1="40" x2="' + (Wd - 20) + '" y1="200" y2="200"/>';
      c.forEach(function (n, j) { var x = 40 + j * bw; s += '<rect class="hbar" x="' + (x + 1.5) + '" y="' + ps(n) + '" width="' + (bw - 3) + '" height="' + (200 - ps(n)) + '" style="fill:' + (n === top ? 'var(--amber)' : 'var(--sky)') + ';opacity:.92;transform-box:fill-box;transform-origin:bottom;animation:grow .5s ease both"/>'; if (nb <= 14 && n) s += '<text x="' + (x + bw / 2) + '" y="' + (ps(n) - 5) + '" text-anchor="middle" style="font-weight:700">' + n + '</text>'; if (nb <= 12 || j % 2 === 0) s += '<text x="' + (x + bw / 2) + '" y="218" text-anchor="middle">' + f(lo + j * ancho, v.d === 'es' ? 0 : 1) + '</text>'; });
      s += '<text x="' + (Wd / 2) + '" y="242" text-anchor="middle">' + (v.d === 'es' ? 'Días de estancia' : 'Hemoglobina (g/dL)') + '</text><text x="12" y="125" transform="rotate(-90 12 125)" text-anchor="middle">Número de pacientes</text>';
      svg.innerHTML = s;
      var m = media(d), md = mediana(d), sk = d.reduce(function (a, x) { return a + Math.pow((x - m) / M.sdMuestra(d), 3); }, 0) / d.length, forma = Math.abs(sk) < 0.4 ? 'casi simétrica (forma de campana)' : sk > 0 ? 'asimétrica con cola larga a la derecha' : 'asimétrica con cola larga a la izquierda';
      var cons = nb < 5 ? 'Con barras tan anchas se pierde el detalle: casi no se ve la forma.' : nb > 16 ? 'Con barras tan angostas aparece ruido: cada barra tiene muy pocos pacientes.' : 'Es un buen ancho: se ve la forma sin demasiado ruido.';
      say.innerHTML = '<b>Cómo leerlo.</b> Cada barra cuenta cuántos pacientes caen en su caja; la barra más alta (en amarillo) es donde se concentran. La forma es <b>' + forma + '</b>. ' + cons + (sk > 0.4 ? ' Como hay cola a la derecha, la <b>mediana</b> (' + f(md, 1) + ') describe mejor al paciente típico que la media (' + f(m, 1) + ').' : ' Aquí media (' + f(m, 1) + ') y mediana (' + f(md, 1) + ') casi coinciden.');
      out.innerHTML = kpi('Barras', nb, 'más barras = más detalle') + kpi('Media', f(m, 1) + ' ' + u, '', 1) + kpi('Mediana', f(md, 1) + ' ' + u, '', 1) + kpi('Forma', sk > 0.4 ? 'cola a la derecha' : Math.abs(sk) < 0.4 ? 'simétrica' : 'cola a la izquierda', 'asimetría ' + f(sk, 2));
    }
    host.addEventListener('input', dib); host.addEventListener('change', dib); dib();
  };

  /* ───────── 4 · El valor p por simulación ───────── */
  W.valorp = function (host, cfg) {
    var N = 20, Wd = 580, H = 250, rnd = M.rng(77), cnt = [], i, tot = 0;
    for (i = 0; i <= N; i++) cnt.push(0);
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'El valor p: ¿podría ser solo suerte?') + '</h3><div class="say"></div><div class="row">' + rngSel('Pacientes que mejoraron con el tratamiento (de 20)', 'vp' + (++ids), 8, 19, 1, cfg.obs || 15, 'k') + '<button type="button" class="btn" data-a="1">Simular 1 estudio</button><button type="button" class="btn" data-a="50">Simular 50</button><button type="button" class="btn" data-a="1000">Simular 1000</button><button type="button" class="btn ghost" data-a="0">Borrar</button></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Histograma de estudios simulados sin efecto"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out');
    function extremo(j, k) { return Math.abs(j - N / 2) >= Math.abs(k - N / 2); }
    function dib() {
      var k = +host.querySelector('[data-k=k]').value, bw = (Wd - 70) / (N + 1), mxp = 0.19, j, s = '<line class="ax" x1="40" x2="' + (Wd - 20) + '" y1="200" y2="200"/>', pEx = M.binomP2(k, N, 0.5), sim = 0;
      host.querySelector('[data-v=k]').textContent = k + ' de ' + N + ' (' + Math.round(k / N * 100) + ' %)';
      for (j = 0; j <= N; j++) { var pj = M.binomPmf(j, N, 0.5), x = 40 + j * bw, hh = (tot ? cnt[j] / tot : pj) / mxp * 150, ex = extremo(j, k); if (ex) sim += cnt[j];
        s += '<rect x="' + (x + 2) + '" y="' + (200 - Math.min(hh, 175)) + '" width="' + (bw - 4) + '" height="' + Math.min(hh, 175) + '" style="fill:' + (ex ? 'var(--coral)' : 'var(--sky)') + ';opacity:' + (tot ? '.9' : '.28') + '"/><text x="' + (x + bw / 2) + '" y="218" text-anchor="middle">' + j + '</text>'; }
      s += '<text x="' + (Wd / 2) + '" y="242" text-anchor="middle">Pacientes que mejoran por casualidad, de 20, si el tratamiento no hace nada</text>';
      s += '<line x1="' + (40 + k * bw + bw / 2) + '" x2="' + (40 + k * bw + bw / 2) + '" y1="30" y2="200" style="stroke:var(--amber);stroke-width:3;stroke-dasharray:6 4"/><text x="' + (40 + k * bw + bw / 2) + '" y="24" text-anchor="middle" style="fill:var(--amber);font-weight:800;font-size:12px">tu estudio: ' + k + '</text>';
      svg.innerHTML = s;
      var pTxt = pEx < 0.001 ? '< 0,001' : f(pEx, 3), veredicto = pEx < 0.05 ? 'Un resultado tan extremo sería <b>raro</b> si el tratamiento no hiciera nada: hay <b>evidencia</b> de que algo ocurre. Cuidado: el valor p no dice que el efecto sea grande ni importante.' : 'Un resultado así es <b>fácil de ver por pura suerte</b>: <b>no hay evidencia suficiente</b> de efecto. No significa que el tratamiento no sirva; significa que este estudio no alcanza para saberlo.';
      say.innerHTML = tot ? '<b>Lo que ves.</b> Cada barra es el resultado de estudios inventados en los que <b>el tratamiento no hace nada</b> (cada paciente mejora con probabilidad 50 %). Las barras <b style="color:var(--coral)">rojas</b> son resultados tan o más extremos que el tuyo. <b>El valor p es la proporción de estudios simulados que cae en rojo: ' + f(sim / tot * 100, 1) + ' %</b> (el cálculo exacto da ' + pTxt + '). ' + veredicto : '<b>La pregunta.</b> En un estudio, ' + k + ' de 20 pacientes mejoraron. Si el tratamiento <b>no hiciera nada</b>, esperaríamos unos 10 de 20. ¿Qué tan raro es ver ' + k + '? Pulsa <b>Simular</b>: cada simulación es un estudio inventado donde solo manda la suerte. Las barras claras muestran lo esperado.';
      out.innerHTML = kpi('Estudios simulados', tot, 'sin efecto real') + kpi('En rojo (tan extremos como el tuyo)', tot ? f(sim / tot * 100, 1) + ' %' : '—', 'valor p simulado', 1) + kpi('Valor p exacto', pTxt, pEx < 0.05 ? 'menor que 0,05' : 'mayor que 0,05', 1);
    }
    host.addEventListener('click', function (e) { var a = e.target.dataset && e.target.dataset.a; if (a == null) return; a = +a; if (!a) { for (i = 0; i <= N; i++) cnt[i] = 0; tot = 0; } else for (var r = 0; r < a; r++) { var b = 0, q; for (q = 0; q < N; q++) if (rnd() < 0.5) b++; cnt[b]++; tot++; } dib(); });
    host.addEventListener('input', dib); dib();
  };

  /* ───────── 5 · Azar frente a sesgo ───────── */
  W.sesgoazar = function (host, cfg) {
    var Wd = 580, H = 250, rnd = M.rng(5), z = [], i, cx = 190, cy = 125, e = 11;
    for (i = 0; i < 80; i++) z.push([normal(rnd), normal(rnd)]);
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Azar y sesgo: dos formas distintas de equivocarse') + '</h3><div class="say"></div><div class="row">' + rngSel('Sesgo: error sistemático (mala medición, grupos no comparables…)', 'sb' + (++ids), 0, 7, 0.5, cfg.sesgo || 0, 's') + rngSel('Azar: variación entre mediciones', 'sa' + ids, 0.4, 4, 0.2, cfg.azar || 1.2, 'a') + rngSel('Tamaño de la muestra (n)', 'sn' + ids, 3, 80, 1, cfg.n || 10, 'n') + '</div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Diana con los resultados de varios estudios"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out');
    function dib() {
      var v = vals(host), n = v.n, bx = v.s * 0.8, by = -v.s * 0.6, s = '', k, mx = 0, my = 0, pts = [];
      host.querySelector('[data-v=s]').textContent = f(v.s, 1); host.querySelector('[data-v=a]').textContent = f(v.a, 1); host.querySelector('[data-v=n]').textContent = n;
      for (k = 0; k < n; k++) { var x = bx + v.a * z[k][0], y = by + v.a * z[k][1]; pts.push([x, y]); mx += x; my += y; } mx /= n; my /= n;
      for (k = 10; k >= 2; k -= 2) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + k * e + '" style="fill:' + (k % 4 === 2 ? 'var(--soft)' : 'var(--surface)') + ';stroke:var(--line);stroke-width:1.5"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + e + '" style="fill:var(--coral)"/>';
      pts.forEach(function (p) { s += '<circle cx="' + (cx + p[0] * e) + '" cy="' + (cy + p[1] * e) + '" r="4.5" style="fill:var(--sky);stroke:var(--surface);stroke-width:1.2;opacity:.95"/>'; });
      s += '<path d="M' + (cx + mx * e - 8) + ' ' + (cy + my * e) + 'h16M' + (cx + mx * e) + ' ' + (cy + my * e - 8) + 'v16" style="stroke:var(--amber);stroke-width:4;stroke-linecap:round"/>';
      s += '<text x="400" y="62" style="font-weight:700;fill:var(--coral)">● el valor verdadero (diana)</text><text x="400" y="92" style="font-weight:700;fill:var(--sky)">● cada punto: un estudio</text><text x="400" y="122" style="font-weight:700;fill:var(--amber)">+ el promedio de los estudios</text>';
      svg.innerHTML = s;
      var sesgo = Math.sqrt(mx * mx + my * my), disp = Math.sqrt(pts.reduce(function (a, p) { return a + (p[0] - mx) * (p[0] - mx) + (p[1] - my) * (p[1] - my); }, 0) / n);
      var q = v.s < 1 ? (v.a < 1.5 ? 'Aciertan y se agrupan: <b>poco sesgo y poco azar</b>, la situación ideal.' : 'Se reparten alrededor del centro: <b>poco sesgo pero mucho azar</b>. Con más pacientes (sube n) el promedio se acerca al centro.') : (v.a < 1.5 ? 'Se agrupan pero lejos del centro: <b>mucho sesgo y poco azar</b>. Resultados muy consistentes… y consistentemente equivocados.' : 'Dispersos y descentrados: <b>sesgo y azar a la vez</b>.');
      say.innerHTML = '<b>Cómo leerlo.</b> ' + q + ' <b>Prueba esto:</b> sube el tamaño de la muestra. El azar se reduce (el promedio se acomoda) pero el sesgo no desaparece: <b>más datos no corrigen un mal diseño</b>.';
      out.innerHTML = kpi('Distancia del promedio al centro', f(sesgo, 1), 'sesgo (más el azar que queda)', 1) + kpi('Dispersión de los estudios', f(disp, 1), 'azar: cuánto varían entre sí', 1) + kpi('Estudios', n, 'puntos azules');
    }
    host.addEventListener('input', dib); dib();
  };
})(typeof window !== 'undefined' ? window : globalThis);
