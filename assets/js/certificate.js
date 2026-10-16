(function () {
  var form = document.getElementById('verify-form');
  if (!form) return;
  var out = document.getElementById('verify-out');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = document.getElementById('vcode').value.trim().toUpperCase();
    var list = window.EPI_CERTS || [];
    var hit = list.filter(function (c) { return String(c.code).toUpperCase() === code; })[0];
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    out.innerHTML = hit
      ? '<div class="ok"><b>Certificado válido</b><br>' + esc(hit.name) + ' · ' + esc(hit.course) + (hit.date ? ' · ' + esc(hit.date) : '') + '</div>'
      : '<div class="no"><b>No encontramos ese código.</b><br>Revisa que esté bien escrito o <a href="contacto.html?tema=Certificado">escríbenos</a>.</div>';
  });
})();
