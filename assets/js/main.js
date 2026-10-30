(function () {
  var E = window.EPI || {};
  var logo = document.querySelector('.logo');
  var ROOT = logo ? logo.getAttribute('href').replace('index.html', '') : '';

  // Menú móvil
  var btn = document.querySelector('.menu-btn');
  var list = document.getElementById('menu');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  // Submenús (táctil / teclado)
  document.querySelectorAll('.sub-toggle').forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var li = t.parentNode, open = !li.classList.contains('open');
      document.querySelectorAll('.has-sub.open').forEach(function (x) { x.classList.remove('open'); x.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('open', open); t.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) document.querySelectorAll('.has-sub.open').forEach(function (x) { x.classList.remove('open'); });
  });

  // Barra de progreso + sombra del header
  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  var header = document.querySelector('.site-header');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', h.scrollTop > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Animación de entrada
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  } else { els.forEach(function (e) { e.classList.add('in'); }); }

  // Enlaces configurables (META GRADE, libro…) desde config.js
  document.querySelectorAll('[data-epi-link]').forEach(function (a) {
    var u = E[a.getAttribute('data-epi-link')];
    if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; }
    else {
      a.classList.add('is-off'); a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true');
      if (a.hasAttribute('data-epi-quiet')) a.setAttribute('title', 'Próximamente');
      else if (!a.querySelector('.soon')) a.insertAdjacentHTML('beforeend', ' <span class="soon" style="font-size:.7em;opacity:.8">(próximamente)</span>');
    }
  });


  // Buscador lateral → catálogo (?q=)
  if (list) {
    var fq = document.createElement('form'); fq.className = 'side-search'; fq.setAttribute('role', 'search'); fq.action = ROOT + 'cursos.html'; fq.method = 'get';
    fq.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="search" name="q" placeholder="Buscar cursos…" aria-label="Buscar cursos" autocomplete="off"><kbd>/</kbd>';
    list.insertBefore(fq, list.firstChild);
    document.addEventListener('keydown', function (e) { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); fq.querySelector('input').focus(); } });
    var cur = list.querySelector('.has-sub [aria-current="page"]'); if (cur) cur.closest('.has-sub').classList.add('open');
  }

  // Inicio: continuar la unidad de muestra o invitar a probarla
  var cont = document.getElementById('continue');
  if (cont) {
    var p = 0; try { p = +localStorage.getItem('epi-aula-p:c1-u2') || 0; } catch (e) { }
    cont.innerHTML = '<div class="eyebrow">' + (p ? 'Continúa donde quedaste' : 'Prueba antes de inscribirte') + '</div><h3>Medidas de asociación y de efecto</h3><p>Unidad gratuita con calculadora 2×2, lectura, práctica y cuestionario. Sin registro.</p><div class="meter" aria-label="Progreso"><i style="width:' + p + '%"></i></div><a class="btn btn-primary" href="' + ROOT + 'muestra/index.html">' + (p ? 'Seguir (' + p + ' %)' : 'Probar una unidad gratis') + '</a>';
  }

  // Botón flotante: WhatsApp si hay número, si no, contacto
  var wa = document.createElement('a');
  wa.className = 'wa';
  var num = (E.whatsapp || '').replace(/\D/g, '');
  wa.href = num ? 'https://wa.me/' + num + '?text=' + encodeURIComponent('Hola EPI-LAB, quisiera más información.') : ROOT + 'contacto.html';
  if (num) { wa.target = '_blank'; wa.rel = 'noopener'; }
  wa.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>' + (num ? 'WhatsApp' : 'Escríbenos') + '</span>';
  if (!num) wa.style.background = 'var(--teal-600)';
  document.body.appendChild(wa);

  // Pasos interactivos "From Question to Decision"
  var flow = document.querySelector('.flow[data-interactive]');
  if (flow) {
    var items = [].slice.call(flow.querySelectorAll('li'));
    var panel = document.getElementById('flow-panel');
    var cur = 0, timer = null;
    var show = function (i) {
      cur = i;
      items.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
      var b = items[i].querySelector('button');
      panel.style.opacity = 0;
      setTimeout(function () {
        panel.innerHTML = '<h3>' + b.dataset.title + '</h3><p>' + b.dataset.text + '</p><a href="' + b.dataset.href + '">' + b.dataset.cta + ' →</a>';
        panel.style.opacity = 1;
      }, 140);
    };
    var play = function () { stop(); timer = setInterval(function () { show((cur + 1) % items.length); }, 4500); };
    var stop = function () { if (timer) clearInterval(timer); timer = null; };
    items.forEach(function (li, i) { li.querySelector('button').addEventListener('click', function () { show(i); stop(); }); });
    flow.parentNode.addEventListener('mouseenter', stop);
    flow.parentNode.addEventListener('mouseleave', function () { if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) play(); });
    show(0);
    if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) play();
  }

  // Filtro del blog
  var bf = document.getElementById('blog-filter');
  if (bf) {
    var posts = [].slice.call(document.querySelectorAll('.post'));
    var q = bf.querySelector('input'), cat = 'all';
    var apply = function () {
      var t = q.value.toLowerCase(), n = 0;
      posts.forEach(function (p) {
        var ok = (cat === 'all' || p.dataset.cat === cat) && p.textContent.toLowerCase().indexOf(t) > -1;
        p.hidden = !ok; if (ok) n++;
      });
      document.getElementById('blog-empty').hidden = n > 0;
    };
    q.addEventListener('input', apply);
    bf.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () {
        bf.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on'); cat = b.dataset.cat; apply();
      });
    });
  }

  // Formulario de contacto -> mailto
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var body = 'Nombre: ' + d.get('nombre') + '\nInstitución: ' + d.get('inst') + '\n\n' + d.get('msg');
      window.location.href = 'mailto:' + (E.email || form.dataset.to) + '?subject=' + encodeURIComponent('[EPI-LAB] ' + d.get('tema')) + '&body=' + encodeURIComponent(body);
    });
  }
})();

/* Formularios de calculadoras y de verificación: se resuelven en la página (antes lo hacía un onsubmit en línea, que la CSP bloquea). */
document.addEventListener("submit", function (e) { if (e.target.matches && e.target.matches("#verify-form,#ss-form,#as-form,#cv-form")) e.preventDefault(); });
