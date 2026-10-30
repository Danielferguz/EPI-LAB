/* Índices del aula: muestra el progreso guardado en este navegador en cada tarjeta. */
document.querySelectorAll('.idx a').forEach(function (a) { var p = 0; try { p = +localStorage.getItem('epi-aula-p:' + a.dataset.id) || 0; } catch (e) { } a.querySelector('i').style.width = p + '%'; });
