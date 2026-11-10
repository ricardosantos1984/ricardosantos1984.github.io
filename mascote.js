/* Bit, a mascote do site: um robozinho que passeia por todo o ecrã (a pé ou a voar) e dá dicas de IA.
   Clicar nele = dica nova. Pode esconder-se (fica guardado neste browser). */
(function () {
  if (window.__bit) return; window.__bit = true;
  var guarda = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var parado = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pagina = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';

  var OLA = {
    index: 'Olá! Sou o Bit, a mascote do site. Clica em mim para uma dica de IA.',
    diario: 'Este é o diário: o que o Ricardo vai construindo com IA, dia a dia.',
    aprender: 'Aqui aprende-se IA do zero. Começa por "Como funciona a IA".',
    videos: 'Tantos vídeos! Escolhe um tema lá em cima para saltar direto.',
    ferramentas: 'Estas são as ferramentas que o Ricardo usa. "Ver vídeos" leva-te aos tutoriais.',
    privacidade: 'Eu não guardo nada sobre ti. Só me lembro se me mandaste esconder.'
  };
  var DICAS = [
    'Dica: diz à IA para que queres a resposta. O objetivo muda tudo.',
    'Dica: dá um exemplo do que queres. Vale mais do que dez regras.',
    'A IA pode inventar com confiança (alucinação). Confirma números e datas.',
    'Um token é um pedacinho de palavra. A IA lê e escreve em tokens.',
    'Dica: pede "pergunta-me o que faltar antes de responder".',
    'Um agente de IA não só responde: escolhe ferramentas e age.',
    'RAG = dar à IA os documentos certos antes de ela responder.',
    'Dica: tarefas grandes correm melhor em passos pequenos.',
    'Nunca dês palavras-passe nem dados do banco a uma IA.',
    'Vídeo ou voz estranhos a pedir dinheiro? Pode ser deepfake. Confirma por outro meio.',
    'A primeira resposta é um rascunho. Pede para melhorar!',
    'Uma automação é uma tarefa que corre sozinha. Eu adoro automações. Bip!',
    'Sabias? Este site foi construído a conversar com uma IA.',
    'Dica: pede um formato. Lista, tabela, email, 3 frases…',
    'Os modelos multimodais também veem imagens e ouvem som.',
    'Bip bop! Estou só a esticar as pernas.'
  ];

  var css = document.createElement('style');
  css.textContent =
    '#bit{position:fixed;left:0;top:0;z-index:40;width:46px;height:54px;pointer-events:none;will-change:transform}' +
    '#bit .bit-c{position:absolute;inset:0;border:0;padding:0;background:none;cursor:pointer;pointer-events:auto;-webkit-tap-highlight-color:transparent;filter:drop-shadow(0 0 8px rgba(70,227,238,.35))}' +
    '#bit .bit-c:focus-visible{outline:2px solid #46e3ee;outline-offset:3px;border-radius:10px}' +
    '#bit svg{display:block;width:46px;height:54px;overflow:visible}' +
    '#bit.esq .bit-c{transform:scaleX(-1)}' +
    '#bit .perna{transform-box:fill-box;transform-origin:50% 0}' +
    '#bit .braco{transform-box:fill-box;transform-origin:50% 10%}' +
    '#bit .olho{transform-box:fill-box;transform-origin:50% 50%;animation:bit-pisca 4.2s infinite}' +
    '#bit .luz{animation:bit-luz 1.6s ease-in-out infinite}' +
    '#bit.andar .p1{animation:bit-passo .5s linear infinite}' +
    '#bit.andar .p2{animation:bit-passo .5s linear infinite reverse}' +
    '#bit.andar .b1{animation:bit-braco .5s linear infinite reverse}' +
    '#bit.andar .b2{animation:bit-braco .5s linear infinite}' +
    '#bit.andar .tudo{animation:bit-balanco .5s ease-in-out infinite}' +
    '#bit .chama{opacity:0;transform-box:fill-box;transform-origin:50% 0}' +
    '#bit.voar .chama{opacity:1;animation:bit-chama .18s ease-in-out infinite alternate}' +
    '#bit.voar .perna{animation:none}' +
    '#bit.voar .tudo{animation:bit-flutua 1s ease-in-out infinite}' +
    '@keyframes bit-chama{from{transform:scaleY(.6)}to{transform:scaleY(1.3)}}' +
    '@keyframes bit-flutua{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-2px) rotate(4deg)}}' +
    '#bit.baixo .bit-f{bottom:auto;top:62px}' +
    '#bit.salto .tudo{animation:bit-salto .45s ease-out}' +
    '@keyframes bit-passo{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(22deg)}}' +
    '@keyframes bit-braco{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}' +
    '@keyframes bit-balanco{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}' +
    '@keyframes bit-salto{0%,100%{transform:translateY(0)}45%{transform:translateY(-12px)}}' +
    '@keyframes bit-pisca{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}' +
    '@keyframes bit-luz{0%,100%{opacity:1}50%{opacity:.35}}' +
    '#bit .bit-f{position:absolute;bottom:62px;left:0;width:max-content;max-width:min(230px,calc(100vw - 24px));padding:.6rem .75rem;background:#0d1a28;color:#e4f3f7;border:1px solid rgba(110,220,235,.38);border-radius:10px;font:500 .82rem/1.4 Manrope,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45);pointer-events:auto;opacity:0;visibility:hidden;transform:translateY(6px);transition:opacity .2s,transform .2s,visibility .2s}' +
    '#bit.fala .bit-f{opacity:1;visibility:visible;transform:none}' +
    '#bit .bit-f button{display:block;margin:.4rem 0 0;padding:0;border:0;background:none;color:#7fa3b0;font:400 .68rem "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}' +
    '#bit .bit-f button:hover{color:#46e3ee}' +
    '#bit-volta{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:40;width:34px;height:34px;border-radius:50%;border:1px solid rgba(110,220,235,.38);background:#0d1a28;color:#46e3ee;font-size:16px;line-height:1;cursor:pointer;opacity:.75}' +
    '#bit-volta:hover{opacity:1}' +
    '@media print{#bit,#bit-volta{display:none}}' +
    '@media (prefers-reduced-motion:reduce){#bit *{animation:none!important}}';
  document.head.appendChild(css);

  var el, fala, txt, x = 20, y = 0, ax = 0, ay = 0, dir = 1, estado = 'andar', ate = 0, ultimo = 0, tFala = 0, iDica = -1, raf = 0;

  function criar() {
    el = document.createElement('div'); el.id = 'bit';
    el.innerHTML =
      '<div class="bit-f" role="status" aria-live="polite"><span></span><button type="button">esconder o Bit</button></div>' +
      '<button class="bit-c" type="button" aria-label="Bit, a mascote do site: clica para uma dica de IA">' +
      '<svg viewBox="0 0 46 54" aria-hidden="true"><g class="tudo">' +
        '<line x1="23" y1="9" x2="23" y2="3.5" stroke="#46e3ee" stroke-width="1.6" stroke-linecap="round"/>' +
        '<circle class="luz" cx="23" cy="3" r="2.6" fill="#ffb547"/>' +
        '<rect class="braco b1" x="5" y="29" width="5" height="12" rx="2.5" fill="#12283a" stroke="#46e3ee" stroke-width="1.3"/>' +
        '<rect class="braco b2" x="36" y="29" width="5" height="12" rx="2.5" fill="#12283a" stroke="#46e3ee" stroke-width="1.3"/>' +
        '<path class="chama" d="M15 51.5q2.5 8 5 0zM26 51.5q2.5 8 5 0z" fill="#ffb547"/>' +
        '<rect class="perna p1" x="14.5" y="41" width="6" height="11" rx="3" fill="#12283a" stroke="#46e3ee" stroke-width="1.3"/>' +
        '<rect class="perna p2" x="25.5" y="41" width="6" height="11" rx="3" fill="#12283a" stroke="#46e3ee" stroke-width="1.3"/>' +
        '<rect x="11" y="27" width="24" height="17" rx="5" fill="#0d1a28" stroke="#46e3ee" stroke-width="1.5"/>' +
        '<path d="M19 35.5l3 3 5-6" fill="none" stroke="#ffb547" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<rect x="6" y="9" width="34" height="20" rx="7" fill="#0d1a28" stroke="#46e3ee" stroke-width="1.6"/>' +
        '<rect x="10.5" y="13" width="25" height="12" rx="4.5" fill="#06101a"/>' +
        '<ellipse class="olho" cx="19" cy="19" rx="2.4" ry="3" fill="#46e3ee"/>' +
        '<ellipse class="olho" cx="29.5" cy="19" rx="2.4" ry="3" fill="#46e3ee"/>' +
      '</g></svg></button>';
    document.body.appendChild(el);
    fala = el.querySelector('.bit-f'); txt = fala.querySelector('span');
    el.querySelector('.bit-c').addEventListener('click', function () {
      el.classList.remove('salto'); void el.offsetWidth; el.classList.add('salto');
      iDica = (iDica + 1 + Math.floor(Math.random() * (DICAS.length - 1))) % DICAS.length;
      dizer(DICAS[iDica], 6500);
    });
    fala.querySelector('button').addEventListener('click', function () { guarda.set('bit-escondido', '1'); remover(); botaoVoltar(); });
    x = parado ? Math.max(8, window.innerWidth - 60) : 20; y = chao(); alvo();
    por();
    setTimeout(function () { if (el) dizer(guarda.get('bit-visto') ? (OLA[pagina] || OLA.index) : OLA.index, 6000); guarda.set('bit-visto', '1'); }, 1400);
    if (!parado) { el.classList.add('andar'); ultimo = 0; raf = requestAnimationFrame(passo); }
  }

  function por() {
    el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    el.classList.toggle('baixo', y < 190);
    el.classList.toggle('esq', dir < 0);
    // manter o balão dentro do ecrã
    var w = fala.offsetWidth || 200, min = 8 - x, max = window.innerWidth - 8 - w - x;
    fala.style.left = Math.max(min, Math.min(max, 23 - w / 2)) + 'px';
  }

  function dizer(t, ms) {
    txt.textContent = t; el.classList.add('fala'); por();
    estado = 'parado'; el.classList.remove('andar');
    clearTimeout(tFala);
    tFala = setTimeout(function () {
      if (!el) return; el.classList.remove('fala');
      if (!parado) { estado = 'andar'; el.classList.add('andar'); ate = performance.now() + 6000 + Math.random() * 9000; }
    }, ms);
  }

  function passo(t) {
    if (!el) return;
    var dt = ultimo ? Math.min(60, t - ultimo) : 16; ultimo = t;
    if (estado === 'andar' && !document.hidden) {
      var dx = ax - x, dy = ay - y, d = Math.sqrt(dx * dx + dy * dy), v = dt * (voa ? 0.06 : 0.038);
      if (d <= v + 1) { x = ax; y = ay; alvo(); }
      else { x += (dx / d) * v; y += (dy / d) * v; if (Math.abs(dx) > 2) dir = dx > 0 ? 1 : -1; }
      if (!ate) ate = t + 7000 + Math.random() * 8000;
      if (t > ate) { // pausa para olhar à volta; de vez em quando dá uma dica sozinho
        ate = 0;
        if (Math.random() < 0.3) { iDica = (iDica + 1) % DICAS.length; dizer(DICAS[iDica], 5500); }
        else { estado = 'parado'; el.classList.remove('andar'); setTimeout(function () { if (el && !el.classList.contains('fala')) { alvo(); estado = 'andar'; el.classList.add('andar'); } }, 1200 + Math.random() * 1800); }
      }
      por();
    }
    raf = requestAnimationFrame(passo);
  }

  // limites do passeio: abaixo da barra do topo, acima do fundo do ecrã
  var voa = false;
  function chao() { return Math.max(80, window.innerHeight - 62); }
  // escolhe o próximo destino: às vezes caminha pelo "chão", outras vezes voa para outro ponto do ecrã
  function alvo() {
    var W = Math.max(60, window.innerWidth - 54), c = chao();
    ax = 8 + Math.random() * (W - 8);
    if (y >= c - 2 && Math.random() < 0.35) ay = c;        // passeio pelo chão
    else ay = Math.random() < 0.25 ? c : 76 + Math.random() * Math.max(1, c - 76);
    voa = !parado && Math.abs(ay - y) > 6;
    if (el) el.classList.toggle('voar', voa);
  }

  function remover() { cancelAnimationFrame(raf); clearTimeout(tFala); if (el) el.remove(); el = null; }
  function botaoVoltar() {
    var b = document.createElement('button'); b.id = 'bit-volta'; b.type = 'button'; b.textContent = '🤖';
    b.setAttribute('aria-label', 'Mostrar o Bit, a mascote do site'); b.title = 'Mostrar o Bit';
    b.onclick = function () { guarda.set('bit-escondido', ''); b.remove(); criar(); };
    document.body.appendChild(b);
  }
  window.addEventListener('resize', function () { if (el) { x = Math.min(x, Math.max(8, window.innerWidth - 54)); y = parado ? chao() : Math.min(y, chao()); ax = Math.min(ax, Math.max(8, window.innerWidth - 54)); ay = Math.min(ay, chao()); por(); } });

  function arrancar() { if (guarda.get('bit-escondido') === '1') botaoVoltar(); else criar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
