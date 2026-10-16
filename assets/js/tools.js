(function () {
  // Pestañas genéricas
  document.querySelectorAll('[data-tabs]').forEach(function (wrap) {
    var tabs = wrap.querySelectorAll('[role="tab"]');
    var panels = wrap.querySelectorAll('.tabpanel');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t); });
        panels.forEach(function (p) { p.hidden = p.id !== t.getAttribute('aria-controls'); });
      });
    });
  });

  // Inversa de la normal estándar (Acklam)
  function qnorm(p) {
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
      b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
      c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
      d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var pl = 0.02425, q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p <= 1 - pl) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  function $(id) { return document.getElementById(id); }
  function num(id) { return parseFloat($(id).value); }
  function f(x, d) { return isFinite(x) ? x.toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'; }
  function row(k, v) { return '<div class="row"><span>' + k + '</span><b>' + v + '</b></div>'; }

  // 1) Tamaño muestral
  if ($('ss-out')) {
    var ssMode = 'prop';
    var calcSS = function () {
      var za = qnorm(1 - num('ss-alpha') / 2), zb = qnorm(num('ss-power'));
      var k = num('ss-k') || 1, drop = (num('ss-drop') || 0) / 100, n1, extra = '';
      if (ssMode === 'prop') {
        var p1 = num('ss-p1') / 100, p2 = num('ss-p2') / 100;
        if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || p1 === p2) { $('ss-out').innerHTML = '<p>Ingresa dos proporciones distintas entre 0 y 100.</p>'; return; }
        n1 = Math.pow(za + zb, 2) * (p1 * (1 - p1) + p2 * (1 - p2) / k) / Math.pow(p1 - p2, 2);
      } else {
        var delta = Math.abs(num('ss-delta')), sd = num('ss-sd');
        if (!(delta > 0 && sd > 0)) { $('ss-out').innerHTML = '<p>Ingresa una diferencia y una desviación estándar mayores que 0.</p>'; return; }
        n1 = Math.pow(za + zb, 2) * sd * sd * (1 + 1 / k) / (delta * delta);
      }
      var a1 = Math.ceil(n1 / (1 - drop)), a2 = Math.ceil(n1 * k / (1 - drop));
      $('ss-out').innerHTML = '<div class="big">' + (a1 + a2) + '</div><p style="margin:4px 0 14px;color:var(--muted)">participantes en total</p>' +
        row('Grupo 1', a1) + row('Grupo 2', a2) + row('Sin pérdidas', Math.ceil(n1) + ' + ' + Math.ceil(n1 * k)) +
        row('Z α/2 · Z β', f(za, 3) + ' · ' + f(zb, 3)) +
        '<small>Comparación bilateral, sin corrección por continuidad. Úsalo como estimación inicial y justifícalo en tu protocolo.</small>';
    };
    document.querySelectorAll('#ss-form input,#ss-form select').forEach(function (el) { el.addEventListener('input', calcSS); });
    document.querySelectorAll('[data-ss]').forEach(function (b) {
      b.addEventListener('click', function () {
        ssMode = b.dataset.ss;
        document.querySelectorAll('[data-ss]').forEach(function (x) { x.classList.toggle('on', x === b); });
        $('ss-prop').hidden = ssMode !== 'prop'; $('ss-mean').hidden = ssMode !== 'mean';
        calcSS();
      });
    });
    calcSS();
  }

  // 2) Medidas de asociación 2x2
  if ($('as-out')) {
    var calcAs = function () {
      var a = num('as-a'), b = num('as-b'), c = num('as-c'), d = num('as-d');
      if (![a, b, c, d].every(function (x) { return x >= 0; })) { $('as-out').innerHTML = '<p>Completa la tabla con números mayores o iguales a 0.</p>'; return; }
      var note = '';
      if (a === 0 || b === 0 || c === 0 || d === 0) { a += .5; b += .5; c += .5; d += .5; note = 'Se añadió 0.5 a cada celda por haber ceros.'; }
      var n1 = a + b, n0 = c + d, r1 = a / n1, r0 = c / n0;
      var rr = r1 / r0, or = (a * d) / (b * c), rd = r1 - r0, z = 1.959964;
      var serr = Math.sqrt(1 / a - 1 / n1 + 1 / c - 1 / n0), seor = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
      var serd = Math.sqrt(r1 * (1 - r1) / n1 + r0 * (1 - r0) / n0);
      var ci = function (est, se) { return f(Math.exp(Math.log(est) - z * se), 2) + '–' + f(Math.exp(Math.log(est) + z * se), 2); };
      var nnt = rd === 0 ? '—' : f(Math.ceil(1 / Math.abs(rd)), 0) + (rd > 0 ? ' (NNH)' : ' (NNT)');
      var warn = r0 > 0.1 ? '<div class="warn">El riesgo en no expuestos es ' + f(r0 * 100, 1) + ' %: con un desenlace común, el OR (' + f(or, 2) + ') se aleja del RR (' + f(rr, 2) + '). No interpretes el OR como riesgo relativo.</div>' : '';
      $('as-out').innerHTML = row('Riesgo expuestos', f(r1 * 100, 1) + ' %') + row('Riesgo no expuestos', f(r0 * 100, 1) + ' %') +
        row('RR (IC 95 %)', f(rr, 2) + ' (' + ci(rr, serr) + ')') + row('OR (IC 95 %)', f(or, 2) + ' (' + ci(or, seor) + ')') +
        row('Diferencia de riesgos', f(rd * 100, 1) + ' pp (' + f((rd - z * serd) * 100, 1) + ' a ' + f((rd + z * serd) * 100, 1) + ')') + row('NNT / NNH', nnt) +
        warn + (note ? '<small>' + note + '</small>' : '');
    };
    document.querySelectorAll('#as-form input').forEach(function (el) { el.addEventListener('input', calcAs); });
    calcAs();
  }

  // 3) OR -> RR dado el riesgo basal
  if ($('cv-out')) {
    var calcCv = function () {
      var or = num('cv-or'), p0 = num('cv-p0') / 100;
      if (!(or > 0 && p0 > 0 && p0 < 1)) { $('cv-out').innerHTML = '<p>Ingresa un OR mayor que 0 y un riesgo basal entre 0 y 100.</p>'; return; }
      var rr = or / ((1 - p0) + p0 * or), p1 = rr * p0;
      $('cv-out').innerHTML = '<div class="big">' + f(rr, 2) + '</div><p style="margin:4px 0 14px;color:var(--muted)">RR aproximado</p>' +
        row('Riesgo en expuestos', f(p1 * 100, 1) + ' %') + row('Diferencia de riesgos', f((p1 - p0) * 100, 1) + ' pp') +
        '<small>Fórmula de Zhang &amp; Yu: RR = OR / [(1 − P0) + P0 × OR]. Aplícala también a los límites del IC como aproximación.</small>';
    };
    document.querySelectorAll('#cv-form input').forEach(function (el) { el.addEventListener('input', calcCv); });
    calcCv();
  }
})();
