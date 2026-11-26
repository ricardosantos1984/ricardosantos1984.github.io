// Menu no telemóvel: mostra um esbatido do lado onde há mais opções e centra a página atual.
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function marcar() {
    var max = nav.scrollWidth - nav.clientWidth;
    nav.classList.toggle('mais-esq', nav.scrollLeft > 4);
    nav.classList.toggle('mais-dir', max > 4 && nav.scrollLeft < max - 4);
  }
  var atual = nav.querySelector('a.on, a[aria-current="page"]');
  if (atual && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = atual.offsetLeft - (nav.clientWidth - atual.offsetWidth) / 2;
  }
  nav.addEventListener('scroll', marcar, { passive: true });
  window.addEventListener('resize', marcar);
  marcar();
})();
