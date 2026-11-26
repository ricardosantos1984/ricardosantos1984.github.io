// Menu no telemóvel: mostra um esbatido do lado onde há mais opções e centra a página atual.
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function marcar() {
    var max = nav.scrollWidth - nav.clientWidth;
    nav.classList.toggle('mais-esq', nav.scrollLeft > 4);
    nav.classList.toggle('mais-dir', max > 4 && nav.scrollLeft < max - 4);
  }
  function centrar() {
    var atual = nav.querySelector('a.on, a[aria-current="page"]');
    if (!atual || nav.scrollWidth <= nav.clientWidth) return;
    var n = nav.getBoundingClientRect(), a = atual.getBoundingClientRect();
    var alvo = nav.scrollLeft + (a.left - n.left) - (n.width - a.width) / 2;
    nav.style.scrollBehavior = 'auto';
    nav.scrollLeft = Math.max(0, alvo);
    nav.style.scrollBehavior = '';
    marcar();
  }
  nav.addEventListener('scroll', marcar, { passive: true });
  window.addEventListener('resize', marcar);
  marcar();
  centrar();
  // as letras do Google Fonts podem chegar depois e mudar as larguras
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(centrar);
  window.addEventListener('load', centrar);
})();
