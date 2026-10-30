/* EPI-LAB · explicadores animados (4.ª serie): pruebas de hipótesis. Elegir la prueba, ANOVA, datos pareados y rangos de Mann-Whitney.
   Cada uno narra el paso a paso en lenguaje llano y termina con su interpretación. Matemática en EPI_M (probada contra scipy). */
(function (root) {
  'use strict';
  var W = root.EPI_W, M = root.EPI_M, U = root.EPI_U;
  if (!W || !M || !U || typeof document === 'undefined') return;
  var f = U.f, kpi = U.kpi, stepper = U.stepper;
  function rngSel(label, id, min, max, step, val, k) { return '<div class="rng"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-k="' + k + '"><b data-v="' + k + '"></b></div>'; }
  var ids = 0, SV = 'style="fill:var(--sky)"', SA = 'style="fill:var(--amber)"', SC = 'style="fill:var(--coral)"', SL = 'style="fill:var(--leaf)"';
  function media(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function pTxt(p) { return p < 0.001 ? '< 0,001' : f(p, 3); }

  /* ───────── 1 · Elegir la prueba de hipótesis ───────── */
  var DIS = {
    num: { nom: 'Una variable numérica (medidas, puntajes)', d: {
      uno: ['Un grupo frente a un valor de referencia', '¿Los datos tienen forma de campana (o n ≥ 30)?', ['t de una muestra', 'Compara la media del grupo con un valor conocido.', 'Media (DE), diferencia con el valor de referencia, IC 95 % y p', 't.test(x, mu = valor)', 'Hemoglobina media de 10,3 frente a un valor de referencia de 11'], ['Wilcoxon de una muestra', 'Compara la mediana con un valor conocido usando rangos.', 'Mediana (rango intercuartílico) y p', 'wilcox.test(x, mu = valor)', 'Estancia hospitalaria (muy asimétrica) frente a 5 días']],
      dos: ['Dos grupos distintos de pacientes (independientes)', '¿Los datos de cada grupo tienen forma de campana (o n ≥ 30 por grupo)?', ['t de Welch', 'Compara las medias de dos grupos sin exigir varianzas iguales.', 'Media (DE) por grupo, diferencia de medias con IC 95 % y p', 't.test(y ~ grupo)', 'Hemoglobina con y sin tratamiento'], ['Mann-Whitney (suma de rangos de Wilcoxon)', 'Compara dos grupos usando el orden de los datos, no sus valores.', 'Mediana (rango intercuartílico) por grupo y p', 'wilcox.test(y ~ grupo)', 'Días de estancia en dos hospitales']],
      par: ['Dos mediciones en los mismos pacientes (antes y después)', '¿Las diferencias (después − antes) tienen forma de campana?', ['t pareada', 'Trabaja con la diferencia de cada paciente consigo mismo.', 'Diferencia media con IC 95 % y p', 't.test(antes, despues, paired = TRUE)', 'Presión arterial antes y después de un fármaco'], ['Wilcoxon de rangos con signo', 'Pareada, pero usando el orden de las diferencias.', 'Mediana de las diferencias y p', 'wilcox.test(antes, despues, paired = TRUE)', 'Puntaje de dolor antes y después']],
      tres: ['Tres o más grupos distintos', '¿Cada grupo tiene forma de campana y varianzas parecidas?', ['ANOVA de un factor', 'Pregunta con una sola prueba si alguna media difiere; después se comparan pares (post hoc).', 'Media (DE) por grupo, F con sus grados de libertad y p', 'aov(y ~ grupo); TukeyHSD()', 'Dolor con tres fármacos'], ['Kruskal-Wallis', 'La versión por rangos del ANOVA.', 'Mediana (RIC) por grupo y p', 'kruskal.test(y ~ grupo)', 'Estancia en tres servicios']],
      rel: ['Relación entre dos variables numéricas', '¿La relación parece una recta y no hay valores extremos?', ['Correlación de Pearson', 'Mide qué tan alineados están los puntos en una recta.', 'r con IC 95 % y p', 'cor.test(x, y)', 'Edad y presión arterial'], ['Correlación de Spearman', 'Mide si una variable sube cuando sube la otra, usando rangos.', 'rho de Spearman y p', 'cor.test(x, y, method = "spearman")', 'Triglicéridos y glucosa']] } },
    cat: { nom: 'Una variable de categorías (sí/no, grupos)', d: {
      dos: ['Dos grupos distintos de pacientes (independientes)', '¿Casi todas las frecuencias esperadas son 5 o más (menos del 20 % de celdas por debajo de 5)?', ['χ² de Pearson', 'Compara lo observado con lo que se esperaría si no hubiera relación.', 'Frecuencias y porcentajes por grupo y p', 'chisq.test(tabla)', 'Lesión renal aguda según duración del bypass'], ['Prueba exacta de Fisher', 'Calcula el valor p exacto cuando hay pocos casos.', 'Frecuencias y porcentajes por grupo y p', 'fisher.test(tabla)', 'Una complicación rara en dos grupos pequeños']],
      par: ['Los mismos pacientes medidos dos veces (sí/no antes y después)', '¿Hay 25 o más pares que cambiaron?', ['McNemar (χ²)', 'Mira solo a los pacientes que cambiaron de categoría.', 'Pares discordantes y p', 'mcnemar.test(tabla)', 'Fiebre sí/no antes y después de un antibiótico'], ['McNemar exacto (binomial)', 'Igual, con el cálculo exacto cuando cambiaron pocos.', 'Pares discordantes y p exacto', 'binom.test(b, b + c, 0.5)', 'Pocos pacientes cambiaron de categoría']],
      varias: ['Tres o más grupos o categorías', '¿Casi todas las frecuencias esperadas son 5 o más?', ['χ² de Pearson (tabla de r × c)', 'Una sola prueba para toda la tabla.', 'Frecuencias y porcentajes por grupo y p', 'chisq.test(tabla)', 'Depresión según tres niveles de apoyo familiar'], ['Fisher-Freeman-Halton (exacta)', 'Versión exacta para tablas mayores; o agrupa categorías.', 'Frecuencias y porcentajes y p exacto', 'fisher.test(tabla)', 'Tabla con muchas celdas casi vacías']] } },
    tiempo: { nom: 'Tiempo hasta un evento (con censura)', d: {
      surv: ['Dos o más grupos seguidos en el tiempo', '¿Quieres comparar las curvas de supervivencia?', ['Log-rank', 'Compara las curvas completas, usando también a los censurados.', 'Curvas de Kaplan-Meier, mediana de supervivencia y p', 'survdiff(Surv(tiempo, evento) ~ grupo)', 'Catéter frente a fístula'], ['Modelo de Cox', 'Si necesitas ajustar por otras variables y estimar un HR.', 'HR con IC 95 % y p', 'coxph(Surv(tiempo, evento) ~ grupo + edad)', 'Mortalidad ajustada por edad y diabetes']] } }
  };
  W.arbolpruebas = function (host, cfg) {
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Elige la prueba de hipótesis: tres preguntas') + '</h3><div class="row"><label for="ap1' + (++ids) + '">1 · ¿Qué mide tu desenlace?<select id="ap1' + ids + '" data-k="tipo"><option value="num">' + DIS.num.nom + '</option><option value="cat">' + DIS.cat.nom + '</option><option value="tiempo">' + DIS.tiempo.nom + '</option></select></label><label for="ap2' + ids + '">2 · ¿Cómo son los grupos?<select id="ap2' + ids + '" data-k="dis"></select></label><label for="ap3' + ids + '">3 · <span class="q3"></span><select id="ap3' + ids + '" data-k="sup"><option value="si">Sí</option><option value="no">No</option></select></label></div><div class="ruta"></div><div class="say"></div></div>';
    var sT = host.querySelector('[data-k=tipo]'), sD = host.querySelector('[data-k=dis]'), sS = host.querySelector('[data-k=sup]'), q3 = host.querySelector('.q3'), say = host.querySelector('.say'), ruta = host.querySelector('.ruta');
    function llena() { var d = DIS[sT.value].d, k; sD.innerHTML = ''; for (k in d) sD.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + d[k][0] + '</option>'); }
    function dib() {
      var d = DIS[sT.value].d[sD.value] || DIS[sT.value].d[Object.keys(DIS[sT.value].d)[0]], r = sS.value === 'si' ? d[2] : d[3]; q3.textContent = d[1];
      if (sT.value === 'tiempo') sS.options[0].textContent = 'Solo comparar curvas', sS.options[1].textContent = 'Ajustar por otras variables'; else sS.options[0].textContent = 'Sí', sS.options[1].textContent = 'No';
      ruta.innerHTML = '<span class="chip c1">' + DIS[sT.value].nom.split(' (')[0] + '</span><i>→</i><span class="chip c2">' + d[0] + '</span><i>→</i><span class="chip c3">' + (sS.value === 'si' ? 'Sí' : 'No') + '</span><i>→</i><span class="chip c4">' + r[0] + '</span>';
      say.innerHTML = '<b>Prueba recomendada: ' + r[0] + '.</b> ' + r[1] + '<br><b>Ejemplo:</b> ' + r[4] + '.<br><b>Qué reportar:</b> ' + r[2] + '.<br><b>En R:</b> <code>' + r[3] + '</code>';
      say.style.animation = 'none'; void say.offsetWidth; say.style.animation = 'rise .5s ease both';
    }
    sT.addEventListener('change', function () { llena(); dib(); }); host.addEventListener('change', function (e) { if (e.target !== sT) dib(); });
    llena(); dib();
  };

  /* ───────── 2 · ANOVA: ¿varían más los grupos entre sí que dentro de sí? ───────── */
  W.anova = function (host, cfg) {
    var G = [[5, 6, 7, 6, 6], [8, 9, 7, 9, 8], [10, 9, 11, 10, 12]], NM = ['Fármaco A', 'Fármaco B', 'Fármaco C'], COL = ['var(--sky)', 'var(--amber)', 'var(--leaf)'], Wd = 580, H = 250, S;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'ANOVA: tres grupos, un solo cociente F') + '</h3><div class="say"></div><div class="row">' + rngSel('Separación entre los grupos (1 = datos del ejemplo)', 'an' + (++ids), 0, 2, 0.1, 1, 'k') + '</div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Tres grupos de pacientes con sus medias y la media global"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out');
    function dib(i) {
      var k = +host.querySelector('[data-k=k]').value, gm0 = media([].concat.apply([], G)), D = G.map(function (g) { var mg = media(g); return g.map(function (x) { return x + (k - 1) * (mg - gm0); }); }), all = [].concat.apply([], D), gm = media(all);
      host.querySelector('[data-v=k]').textContent = f(k, 1);
      var ssb = 0, ssw = 0; D.forEach(function (g) { var mg = media(g); ssb += g.length * (mg - gm) * (mg - gm); g.forEach(function (x) { ssw += (x - mg) * (x - mg); }); });
      var d1 = 2, d2 = all.length - 3, F = (ssb / d1) / (ssw / d2), p = M.pF(F, d1, d2), s = '<line class="ax" x1="30" x2="' + (Wd - 20) + '" y1="215" y2="215"/>';
      function py(v) { return 215 - (v - 2) * 15; } function xs(gi, j) { return 90 + gi * 170 + (j - 2) * 20; }
      for (var v = 4; v <= 14; v += 2) s += '<text x="22" y="' + (py(v) + 4) + '" text-anchor="end">' + v + '</text><line x1="26" x2="' + (Wd - 20) + '" y1="' + py(v) + '" y2="' + py(v) + '" style="stroke:var(--line);stroke-dasharray:2 5"/>';
      if (i >= 1) s += '<line x1="30" x2="' + (Wd - 20) + '" y1="' + py(gm) + '" y2="' + py(gm) + '" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:7 4"/><text x="' + (Wd - 24) + '" y="' + (py(gm) - 6) + '" text-anchor="end" style="font-weight:800;fill:var(--ink)">media global ' + f(gm, 1) + '</text>';
      D.forEach(function (g, gi) { var mg = media(g);
        g.forEach(function (x, j) { s += '<circle cx="' + xs(gi, j) + '" cy="' + py(x) + '" r="7" style="fill:' + COL[gi] + '" opacity=".9"/>'; if (i >= 3) s += '<line x1="' + xs(gi, j) + '" x2="' + xs(gi, j) + '" y1="' + py(x) + '" y2="' + py(mg) + '" style="stroke:var(--coral);stroke-width:2.5" class="nw"/>'; });
        if (i >= 1) s += '<line x1="' + (xs(gi, 0) - 16) + '" x2="' + (xs(gi, 4) + 16) + '" y1="' + py(mg) + '" y2="' + py(mg) + '" style="stroke:' + COL[gi] + ';stroke-width:4"/>';
        if (i >= 2) s += '<line x1="' + (xs(gi, 4) + 28) + '" x2="' + (xs(gi, 4) + 28) + '" y1="' + py(gm) + '" y2="' + py(mg) + '" style="stroke:var(--violet);stroke-width:5" class="nw"/>';
        s += '<text x="' + xs(gi, 2) + '" y="236" text-anchor="middle" style="font-weight:700">' + NM[gi] + ' · media ' + f(mg, 1) + '</text>'; });
      svg.innerHTML = s;
      var T = [
        '<b>Paso 1 · Los datos.</b> Tres fármacos y la mejoría del dolor (puntos) de 5 pacientes con cada uno. Pregunta: ¿los tres funcionan igual o alguno difiere? Comparar de dos en dos obligaría a hacer tres pruebas; el ANOVA responde con <b>una sola</b>.',
        '<b>Paso 2 · Las medias.</b> Cada grupo tiene su media (línea de color) y todos juntos tienen una media global (línea punteada). Si los fármacos fueran iguales, las tres medias estarían casi sobre la línea punteada.',
        '<b>Paso 3 · Variación entre grupos.</b> Las barras violeta miden cuánto se aleja la media de cada grupo de la media global. Se elevan al cuadrado y se suman (ponderando por el tamaño): <b>' + f(ssb, 1) + '</b>.',
        '<b>Paso 4 · Variación dentro de los grupos.</b> Las líneas rojas miden cuánto se aleja cada paciente de la media de su propio grupo: es la variación «normal» entre pacientes con el mismo fármaco. Suma de cuadrados: <b>' + f(ssw, 1) + '</b>.',
        '<b>Paso 5 · El cociente F.</b> F = (' + f(ssb, 1) + ' ÷ 2) ÷ (' + f(ssw, 1) + ' ÷ 12) = <b>' + f(F, 2) + '</b>. Si los grupos solo difirieran por suerte, F estaría cerca de 1. ' + (p < 0.05 ? 'Aquí es mucho mayor: <b>p ' + (p < 0.001 ? '< 0,001' : '= ' + f(p, 3)) + '</b>, hay evidencia de que al menos un fármaco difiere. El ANOVA no dice cuál: eso lo dicen las comparaciones post hoc.' : 'Aquí es chico: <b>p = ' + f(p, 3) + '</b>, los datos son compatibles con que los tres fármacos funcionen igual.') + ' Mueve la separación entre grupos y observa cómo cambia F.'
      ];
      say.innerHTML = T[i]; out.innerHTML = i >= 2 ? kpi('Entre grupos', f(ssb, 1), 'suma de cuadrados') + (i >= 3 ? kpi('Dentro de grupos', f(ssw, 1), 'suma de cuadrados') : '') + (i >= 4 ? kpi('F', f(F, 2), 'gl = 2 y 12', 1) + kpi('Valor p', pTxt(p), p < 0.05 ? 'menor que 0,05' : 'mayor que 0,05', 1) : '') : '';
    }
    S = stepper(host, 5, dib, { ms: 5200 }); host.addEventListener('input', function () { S.go(S.i); });
  };

  /* ───────── 3 · Datos pareados ───────── */
  W.pareada = function (host, cfg) {
    var A = [150, 142, 160, 155, 148, 165, 152, 158], B = [144, 140, 151, 150, 147, 158, 149, 150], n = 8, Wd = 580, H = 250;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Datos pareados: cada paciente es su propio control') + '</h3><div class="say"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Presión arterial antes y después en ocho pacientes"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out');
    var d = A.map(function (a, i) { return a - B[i]; }), md = media(d), sd = Math.sqrt(d.reduce(function (s, x) { return s + (x - md) * (x - md); }, 0) / (n - 1)), se = sd / Math.sqrt(n), t = md / se, p = M.ptDos(t, n - 1), tc = M.qt(0.975, n - 1), wel = M.welch(media(A), Math.sqrt(A.reduce(function (s, x) { return s + Math.pow(x - media(A), 2); }, 0) / 7), 8, media(B), Math.sqrt(B.reduce(function (s, x) { return s + Math.pow(x - media(B), 2); }, 0) / 7), 8);
    function dib(i) {
      var s = '<line class="ax" x1="30" x2="' + (Wd - 20) + '" y1="215" y2="215"/>';
      function py(v) { return 215 - (v - 135) * 6.2; } function py2(v) { return 215 - (v + 2) * 14; }
      if (i < 2) { for (var v = 140; v <= 165; v += 5) s += '<text x="22" y="' + (py(v) + 4) + '" text-anchor="end">' + v + '</text><line x1="26" x2="' + (Wd - 20) + '" y1="' + py(v) + '" y2="' + py(v) + '" style="stroke:var(--line);stroke-dasharray:2 5"/>';
        A.forEach(function (a, k) { s += '<line x1="150" x2="430" y1="' + py(a) + '" y2="' + py(B[k]) + '" style="stroke:var(--coral);stroke-width:2.2;opacity:.75"/><circle cx="150" cy="' + py(a) + '" r="6" ' + SV + '/><circle cx="430" cy="' + py(B[k]) + '" r="6" ' + SL + '/>'; });
        s += '<text x="150" y="238" text-anchor="middle" style="font-weight:800">Antes</text><text x="430" y="238" text-anchor="middle" style="font-weight:800">Después</text><text x="290" y="20" text-anchor="middle">Presión sistólica (mm Hg) de 8 pacientes</text>'; }
      else { for (var q = 0; q <= 10; q += 2) s += '<text x="22" y="' + (py2(q) + 4) + '" text-anchor="end">' + q + '</text><line x1="26" x2="' + (Wd - 20) + '" y1="' + py2(q) + '" y2="' + py2(q) + '" style="stroke:var(--line);stroke-dasharray:2 5"/>';
        d.forEach(function (x, k) { var cx = 70 + k * 62; s += '<line x1="' + cx + '" x2="' + cx + '" y1="' + py2(0) + '" y2="' + py2(x) + '" style="stroke:var(--coral);stroke-width:3" class="nw"/><circle cx="' + cx + '" cy="' + py2(x) + '" r="8" ' + SC + '/><text x="' + cx + '" y="' + (py2(x) - 12) + '" text-anchor="middle" style="font-weight:800">' + x + '</text><text x="' + cx + '" y="236" text-anchor="middle">Paciente ' + (k + 1) + '</text>'; });
        s += '<line x1="30" x2="' + (Wd - 20) + '" y1="' + py2(0) + '" y2="' + py2(0) + '" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:6 4"/><text x="' + (Wd - 24) + '" y="' + (py2(0) - 6) + '" text-anchor="end">sin cambio (0)</text>';
        if (i >= 3) s += '<line x1="30" x2="' + (Wd - 20) + '" y1="' + py2(md) + '" y2="' + py2(md) + '" style="stroke:var(--amber);stroke-width:3.5"/><text x="' + (Wd - 24) + '" y="' + (py2(md) - 6) + '" text-anchor="end" style="font-weight:800;fill:var(--amber)">diferencia media ' + f(md, 2) + '</text>'; }
      svg.innerHTML = s;
      var T = [
        '<b>Paso 1 · Los datos.</b> Ocho pacientes con la presión sistólica <b>antes y después</b> de un fármaco. Cada línea une al mismo paciente: no son dos grupos distintos, son <b>los mismos pacientes medidos dos veces</b>.',
        '<b>Paso 2 · Por qué importa.</b> Unos pacientes parten de 142 y otros de 165: esa diferencia entre personas es ruido que no nos interesa. Si comparamos antes con después como si fueran grupos distintos, ese ruido tapa el efecto.',
        '<b>Paso 3 · La diferencia de cada paciente.</b> Resta antes − después en cada uno: 6, 2, 9, 5, 1, 7, 3 y 8 mm Hg. Ahora hay <b>un solo número por paciente</b> y todos son positivos: la presión bajó en los ocho.',
        '<b>Paso 4 · Resumen.</b> La diferencia media es <b>' + f(md, 2) + ' mm Hg</b> y su desviación estándar ' + f(sd, 2) + '. El error estándar es ' + f(sd, 2) + ' ÷ √8 = ' + f(se, 2) + '.',
        '<b>Paso 5 · La prueba t pareada.</b> t = ' + f(md, 2) + ' ÷ ' + f(se, 2) + ' = <b>' + f(t, 2) + '</b> con 7 grados de libertad: <b>p = ' + pTxt(p) + '</b>. El IC 95 % de la diferencia va de ' + f(md - tc * se, 1) + ' a ' + f(md + tc * se, 1) + ' mm Hg. Si hubiéramos ignorado el emparejamiento (t de Welch), p sería ' + f(wel.p, 3) + ': <b>emparejar gana potencia</b>.'
      ];
      say.innerHTML = T[i]; out.innerHTML = i >= 3 ? kpi('Diferencia media', f(md, 2) + ' mm Hg', 'antes − después', 1) + (i >= 4 ? kpi('t pareada', f(t, 2), 'gl = 7') + kpi('Valor p', pTxt(p), 'pareada', 1) + kpi('IC 95 %', f(md - tc * se, 1) + ' a ' + f(md + tc * se, 1), 'de la diferencia') + kpi('p si se ignora el pareo', f(wel.p, 3), 'solo para comparar') : '') : '';
    }
    stepper(host, 5, dib, { ms: 4800 });
  };

  /* ───────── 4 · Mann-Whitney con rangos ───────── */
  W.rangos = function (host, cfg) {
    var EJ = { a: { nom: 'Grupos parecidos', A: [3, 5, 8, 9], B: [4, 7, 10, 12, 15] }, b: { nom: 'Grupos bien separados', A: [3, 4, 5, 6], B: [8, 9, 11, 12, 14] } }, Wd = 580, H = 250, sel = 'a', S;
    host.innerHTML = '<div class="w anim"><h3>' + (cfg.title || 'Mann-Whitney: comparar usando el orden, no los valores') + '</h3><div class="row"><label for="rg' + (++ids) + '">Ejemplo<select id="rg' + ids + '" data-k="e"><option value="a">' + EJ.a.nom + '</option><option value="b">' + EJ.b.nom + '</option></select></label></div><div class="say"></div><svg class="ch" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Valores de dos grupos ordenados con sus rangos"></svg><div class="out"></div></div>';
    var svg = host.querySelector('svg'), say = host.querySelector('.say'), out = host.querySelector('.out');
    function dib(i) {
      var A = EJ[sel].A, B = EJ[sel].B, all = A.map(function (x) { return [x, 0]; }).concat(B.map(function (x) { return [x, 1]; })).sort(function (a, b) { return a[0] - b[0]; }), r = M.mwExacto(A, B), N = all.length, s = '';
      var xs = function (k) { return 50 + k * 56; };
      all.forEach(function (o, k) { var cy = i === 0 ? 150 - (o[0] % 4) * 6 : 120; s += '<circle cx="' + (i === 0 ? 40 + o[0] * 34 : xs(k)) + '" cy="' + (i === 0 ? 150 : 120) + '" r="19" style="fill:' + (o[1] ? 'var(--amber)' : 'var(--sky)') + '" opacity=".93"/><text x="' + (i === 0 ? 40 + o[0] * 34 : xs(k)) + '" y="' + (i === 0 ? 155 : 125) + '" text-anchor="middle" style="fill:#fff;font-weight:800;font-size:14px">' + o[0] + '</text>';
        if (i >= 2) s += '<text x="' + xs(k) + '" y="170" text-anchor="middle" style="font-weight:800;font-size:15px;fill:' + (o[1] ? 'var(--amber)' : 'var(--sky)') + '" class="nw">rango ' + (k + 1) + '</text>'; });
      if (i === 0) s += '<text x="290" y="30" text-anchor="middle">Los valores en su escala (azul: grupo A · amarillo: grupo B)</text>'; else s += '<text x="290" y="30" text-anchor="middle">Ordenados de menor a mayor · azul: grupo A · amarillo: grupo B</text>';
      if (i >= 3) s += '<text x="290" y="215" text-anchor="middle" style="font-weight:800;font-size:14px;fill:var(--sky)">Suma de rangos A = ' + f(r.R1, 0) + '</text><text x="290" y="238" text-anchor="middle" style="font-weight:800;font-size:14px;fill:var(--amber)">Suma de rangos B = ' + f(r.R2, 0) + '</text>';
      svg.innerHTML = s;
      var n1 = A.length, n2 = B.length, T = [
        '<b>Paso 1 · Los datos.</b> Dos grupos pequeños de pacientes (por ejemplo, días de estancia). Con tan pocos datos y quizá asimétricos, la prueba t no es segura. Mann-Whitney <b>no usa los valores, usa su orden</b>.',
        '<b>Paso 2 · Ordena todo junto.</b> Mezcla los ' + N + ' valores y ordénalos de menor a mayor, sin olvidar de qué grupo es cada uno.',
        '<b>Paso 3 · Asigna rangos.</b> El menor recibe el rango 1, el siguiente el 2, y así hasta ' + N + '. Un valor extremo (15 o 100) recibe solo un rango más: por eso la prueba resiste los extremos.',
        '<b>Paso 4 · Suma los rangos de cada grupo.</b> A suma <b>' + f(r.R1, 0) + '</b> y B suma <b>' + f(r.R2, 0) + '</b> (entre los dos siempre suman ' + (N * (N + 1) / 2) + '). Si no hubiera diferencia, el reparto sería parecido al tamaño de cada grupo.',
        '<b>Paso 5 · El estadístico U y el valor p.</b> U = ' + f(r.R1, 0) + ' − ' + n1 + '·' + (n1 + 1) + '/2 = <b>' + f(r.U1, 0) + '</b>. Se mira cuántas de las ' + (function () { var c = 1, k; for (k = 0; k < n1; k++) c = c * (N - k) / (k + 1); return Math.round(c); })() + ' formas posibles de repartir los rangos darían un U tan extremo: <b>p = ' + f(r.p, 3) + '</b>. ' + (r.p < 0.05 ? 'Es poco probable que sea solo suerte: hay evidencia de que un grupo tiende a tener valores mayores.' : 'Es fácil de obtener por suerte: con tan pocos datos no hay evidencia suficiente de diferencia.')
      ];
      say.innerHTML = T[i]; out.innerHTML = i >= 3 ? kpi('Suma de rangos A', f(r.R1, 0), 'n = ' + n1) + kpi('Suma de rangos B', f(r.R2, 0), 'n = ' + n2) + (i >= 4 ? kpi('U', f(r.U1, 0), 'mínimo posible 0', 1) + kpi('Valor p exacto', pTxt(r.p), 'bilateral', 1) : '') : '';
    }
    S = stepper(host, 5, dib, { ms: 4800 }); host.addEventListener('change', function (e) { if (e.target.dataset.k === 'e') { sel = e.target.value; S.go(S.i); } });
  };
})(typeof window !== 'undefined' ? window : globalThis);
