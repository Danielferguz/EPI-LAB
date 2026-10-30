/* EPI-LAB · guardia de contenido: marca de agua con el correo del alumno y disuasivos de copia.
   LÍMITE: un navegador siempre recibe el HTML y el JS que muestra. Esto frena la copia casual (guardar la página,
   seleccionar, imprimir, atajos de teclado); no impide que alguien con conocimientos técnicos la obtenga.
   La protección real es de servidor (Cloudflare Access) y de contenido por usuario (marca de agua). Ver GUIA_PROTECCION.md. */
(function () {
  'use strict';
  var d = document, w = window;
  function cookie(n) { var m = d.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function quien() { // el correo verificado por el servidor (cookie) manda; ?email= solo es respaldo y no puede sobrescribirlo
    var c = cookie('epi_email'), q = '';
    if (!c) { try { q = new URLSearchParams(location.search).get('email') || ''; } catch (e) { }
      try { if (q) sessionStorage.setItem('epi-quien', q); else q = sessionStorage.getItem('epi-quien') || ''; } catch (e) { } }
    return (c || q || '').replace(/[^\w.@+\-]/g, '').slice(0, 80);
  }
  var st = d.createElement('style');
  st.textContent = '.stage,.read,.cs,.shotw,.co,.sl{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}input,textarea,select,.tpl *{-webkit-user-select:text;user-select:text}' +
    '@media print{body *{display:none!important}body::before{content:"Impresión no disponible. Material de uso personal de EPI-LAB.";display:block;padding:40px;font:16px sans-serif}}' +
    '#epi-marca{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;opacity:.09;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));align-content:space-around}' +
    '#epi-marca span{display:block;transform:rotate(-24deg);font:700 14px/2.6 Montserrat,system-ui,sans-serif;white-space:nowrap;color:#2B3035;text-align:center;padding:30px 0}' +
    '';
  (d.head || d.documentElement).appendChild(st);
  function marca() {
    if (d.getElementById('epi-marca')) return; var t = (quien() || 'Uso personal') + ' · EPI-LAB · ' + new Date().toLocaleDateString('es'), m = d.createElement('div'); m.id = 'epi-marca'; m.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 24; i++) { var s = d.createElement('span'); s.textContent = t; m.appendChild(s); } d.body.appendChild(m);
    new MutationObserver(function () { if (!d.getElementById('epi-marca')) d.body.appendChild(m); }).observe(d.body, { childList: true });
  }
  function editable(t) { return t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || (t.closest && t.closest('.tpl'))); }
  d.addEventListener('contextmenu', function (e) { if (!editable(e.target)) e.preventDefault(); });
  d.addEventListener('dragstart', function (e) { e.preventDefault(); });
  d.addEventListener('copy', function (e) { if (!editable(e.target) && !(d.activeElement && editable(d.activeElement))) e.preventDefault(); });
  d.addEventListener('cut', function (e) { if (!editable(e.target)) e.preventDefault(); });
  d.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase(), c = e.ctrlKey || e.metaKey;
    if (e.key === 'F12' || (c && !e.shiftKey && (k === 's' || k === 'u' || k === 'p')) || (c && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) || (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'u'))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  w.addEventListener('beforeprint', function (e) { try { d.body.style.visibility = 'hidden'; } catch (x) { } });
  w.addEventListener('afterprint', function () { try { d.body.style.visibility = ''; } catch (x) { } });
  if (d.body) marca(); else d.addEventListener('DOMContentLoaded', marca);
})();
