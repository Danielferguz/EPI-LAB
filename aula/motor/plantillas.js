/* EPI-LAB · plantillas interactivas: texto con campos, hojas tipo planilla y listas de verificación.
   EPI_W.plantilla / hoja / checklist (host, cfg). Todo se genera y se copia en el navegador. */
(function (root) {
  'use strict';
  var W = root.EPI_W; if (!W || typeof document === 'undefined') return;
  var uid = 0;
  function e(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function copiar(texto, btn, area) {
    var ok = function () { var t = btn.textContent; btn.textContent = 'Copiado ✓'; setTimeout(function () { btn.textContent = t; }, 1600); };
    function plan_b() { try { var a = area || document.createElement('textarea'); if (!area) { a.value = texto; document.body.appendChild(a); } a.select(); document.execCommand('copy'); if (!area) a.remove(); ok(); } catch (x) { btn.textContent = 'Selecciona y copia (Ctrl+C)'; if (area) area.select(); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, plan_b); else plan_b();
  }
  function bajar(nombre, texto, mime, nota) {
    try { var u = URL.createObjectURL(new Blob(['﻿' + texto], { type: mime || 'text/plain;charset=utf-8' })), a = document.createElement('a'); a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }
    catch (x) { if (nota) nota.textContent = 'Tu navegador bloqueó la descarga: usa «Copiar» y pega en un archivo.'; }
  }

  /* Texto con campos: escribe a la izquierda, el documento se arma a la derecha. */
  W.plantilla = function (host, cfg) {
    var id = 'pl' + (++uid), campos = cfg.campos || [];
    host.innerHTML = '<div class="w tpl"><h3>' + e(cfg.title || 'Plantilla') + '</h3>' + (cfg.ayuda ? '<p class="why">' + e(cfg.ayuda) + '</p>' : '') + '<div class="tplg"><div class="tplf">' + campos.map(function (c, i) {
      var cid = id + '_' + i, v = c.def != null ? c.def : '';
      return '<label for="' + cid + '">' + e(c.label) + (c.op ? '<select id="' + cid + '" data-k="' + c.k + '">' + c.op.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + e(o) + '</option>'; }).join('') + '</select>' : (c.largo ? '<textarea id="' + cid + '" data-k="' + c.k + '" rows="2" placeholder="' + e(c.ph || '') + '">' + e(v) + '</textarea>' : '<input id="' + cid + '" data-k="' + c.k + '" type="text" value="' + e(v) + '" placeholder="' + e(c.ph || '') + '">')) + '</label>';
    }).join('') + '</div><div class="tplo"><textarea class="tpls" rows="10" aria-label="Documento generado" readonly></textarea><div class="row"><button type="button" class="btn" data-a="c">Copiar texto</button><button type="button" class="btn ghost" data-a="d">Descargar .txt</button></div><p class="why nota"></p></div></div></div>';
    var out = host.querySelector('.tpls'), nota = host.querySelector('.nota');
    function armar() {
      var v = {}; campos.forEach(function (c) { var i = host.querySelector('[data-k="' + c.k + '"]'); v[c.k] = i.value.trim(); });
      out.value = cfg.salida.replace(/\{(\w+)\}/g, function (_, k) { var c = campos.filter(function (x) { return x.k === k; })[0]; return v[k] || '[' + (c ? c.label : k) + ']'; });
      out.rows = Math.min(18, Math.max(6, out.value.split('\n').length + 2));
    }
    host.addEventListener('input', armar); host.addEventListener('change', armar);
    host.addEventListener('click', function (ev) { var a = ev.target.dataset && ev.target.dataset.a; if (a === 'c') copiar(out.value, ev.target, out); if (a === 'd') bajar((cfg.archivo || 'plantilla') + '.txt', out.value, 'text/plain;charset=utf-8', nota); });
    armar();
  };

  /* Hoja tipo planilla: columnas fijas, filas editables, copia a Excel (TSV) y descarga CSV. */
  W.hoja = function (host, cfg) {
    var cols = cfg.cols, filas = (cfg.filas || []).map(function (r) { return r.slice(); }), id = 'hj' + (++uid);
    host.innerHTML = '<div class="w tpl"><h3>' + e(cfg.title || 'Hoja de trabajo') + '</h3>' + (cfg.ayuda ? '<p class="why">' + e(cfg.ayuda) + '</p>' : '') + '<div class="hoja"><table><thead><tr>' + cols.map(function (c) { return '<th>' + e(c) + '</th>'; }).join('') + '<th></th></tr></thead><tbody></tbody></table></div><div class="row"><button type="button" class="btn ghost" data-a="+">+ Fila</button><button type="button" class="btn" data-a="t">Copiar para Excel</button><button type="button" class="btn ghost" data-a="d">Descargar CSV</button></div><p class="why nota"></p></div>';
    var tb = host.querySelector('tbody'), nota = host.querySelector('.nota');
    function pintar() { tb.innerHTML = filas.map(function (r, i) { return '<tr>' + cols.map(function (c, j) { return '<td><input aria-label="' + e(c) + ' fila ' + (i + 1) + '" data-i="' + i + '" data-j="' + j + '" value="' + e(r[j] == null ? '' : r[j]) + '"></td>'; }).join('') + '<td><button type="button" class="x" data-del="' + i + '" aria-label="Quitar fila ' + (i + 1) + '">×</button></td></tr>'; }).join(''); }
    function tsv() { return [cols].concat(filas).map(function (r) { return cols.map(function (_, j) { return String(r[j] == null ? '' : r[j]).replace(/[\t\n]/g, ' '); }).join('\t'); }).join('\n'); }
    function csv() { return [cols].concat(filas).map(function (r) { return cols.map(function (_, j) { var s = String(r[j] == null ? '' : r[j]); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(','); }).join('\r\n'); }
    host.addEventListener('input', function (ev) { var d = ev.target.dataset; if (d && d.i != null) filas[+d.i][+d.j] = ev.target.value; });
    host.addEventListener('click', function (ev) {
      var t = ev.target, d = t.dataset || {};
      if (d.del != null) { filas.splice(+d.del, 1); pintar(); } else if (d.a === '+') { filas.push(cols.map(function () { return ''; })); pintar(); }
      else if (d.a === 't') copiar(tsv(), t); else if (d.a === 'd') bajar((cfg.nombre || 'hoja') + '.csv', csv(), 'text/csv;charset=utf-8', nota);
    });
    pintar();
  };

  /* Lista de verificación con progreso y resumen de lo pendiente. */
  W.checklist = function (host, cfg) {
    var items = cfg.items, id = 'ck' + (++uid), hecho = {};
    host.innerHTML = '<div class="w tpl"><h3>' + e(cfg.title || 'Lista de verificación') + '</h3>' + (cfg.ayuda ? '<p class="why">' + e(cfg.ayuda) + '</p>' : '') + '<div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + items.length + '"><i></i></div><p class="why cnt"></p><ul class="ckl">' + items.map(function (it, i) { return '<li><label><input type="checkbox" data-i="' + i + '"><span><b>' + e(it.n || (i + 1)) + '.</b> ' + e(it.t) + (it.d ? '<small>' + e(it.d) + '</small>' : '') + '</span></label></li>'; }).join('') + '</ul><div class="row"><button type="button" class="btn" data-a="p">Copiar pendientes</button><button type="button" class="btn ghost" data-a="r">Reiniciar</button></div></div>';
    var barra = host.querySelector('.prog i'), cnt = host.querySelector('.cnt');
    function act() { var n = Object.keys(hecho).filter(function (k) { return hecho[k]; }).length; barra.style.width = (100 * n / items.length) + '%'; host.querySelector('.prog').setAttribute('aria-valuenow', n); cnt.textContent = n + ' de ' + items.length + ' puntos cumplidos' + (n === items.length ? ' ✓' : ''); }
    host.addEventListener('change', function (ev) { var i = ev.target.dataset && ev.target.dataset.i; if (i == null) return; hecho[i] = ev.target.checked; act(); });
    host.addEventListener('click', function (ev) {
      var a = ev.target.dataset && ev.target.dataset.a; if (a === 'r') { hecho = {}; [].forEach.call(host.querySelectorAll('input'), function (x) { x.checked = false; }); act(); }
      if (a === 'p') copiar((cfg.title || 'Pendientes') + '\n' + items.map(function (it, i) { return hecho[i] ? null : '- [ ] ' + (it.n || (i + 1)) + '. ' + it.t; }).filter(Boolean).join('\n'), ev.target);
    });
    act();
  };
})(typeof window !== 'undefined' ? window : globalThis);
