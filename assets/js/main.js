(function () {
  var btn = document.querySelector('.menu-btn');
  var list = document.querySelector('.nav ul');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }
  var els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });

  // Formulario de contacto -> mailto (sin backend)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var body = 'Nombre: ' + d.get('nombre') + '\nInstitución: ' + d.get('inst') + '\n\n' + d.get('msg');
      window.location.href = 'mailto:' + form.dataset.to + '?subject=' + encodeURIComponent('[EPI-LAB] ' + d.get('tema')) + '&body=' + encodeURIComponent(body);
    });
  }
})();
