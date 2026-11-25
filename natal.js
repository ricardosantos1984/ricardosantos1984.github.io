/* Brilho de Natal — de 20 de novembro a 6 de janeiro.
   Neve a cair, fio de luzes no topo, faixa de Boas Festas com contagem para o Natal
   e um toque dourado nos títulos. Respeita "reduzir movimento" e pode desligar-se a neve. */
(function () {
  const agora = new Date();
  const lx = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);
  const ano = +lx.slice(0, 4), mes = +lx.slice(5, 7), dia = +lx.slice(8, 10);
  const epoca = (mes === 11 && dia >= 20) || mes === 12 || (mes === 1 && dia <= 6);
  if (!epoca) return;

  const ler = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- estilos ----------
  const css = document.createElement('style');
  css.textContent =
    'body.natal h1{text-shadow:0 0 18px rgba(255,181,71,.35),0 0 2px rgba(255,255,255,.4)}' +
    '.natal-luzes{position:fixed;left:0;right:0;top:0;height:16px;z-index:35;pointer-events:none;display:flex;justify-content:space-around;padding:0 6px}' +
    '.natal-luzes::before{content:"";position:absolute;left:0;right:0;top:3px;height:6px;border-bottom:1.5px solid rgba(228,243,247,.25);border-radius:0 0 50% 50%/0 0 100% 100%}' +
    '.natal-luzes i{position:relative;top:7px;width:7px;height:10px;border-radius:50% 50% 45% 45%;background:var(--c);box-shadow:0 0 8px 2px var(--c);animation:natal-pisca 1.6s ease-in-out infinite;animation-delay:var(--d)}' +
    '.natal-luzes i::before{content:"";position:absolute;left:1.5px;top:-3px;width:4px;height:3px;background:#4f6877;border-radius:1px}' +
    '@keyframes natal-pisca{0%,100%{opacity:1}50%{opacity:.25;box-shadow:none}}' +
    '.natal-faixa{position:relative;z-index:5;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:10px auto 0;max-width:min(1100px,calc(100% - 32px));padding:9px 14px;border-radius:12px;' +
      'background:linear-gradient(90deg,rgba(229,57,53,.16),rgba(255,181,71,.14),rgba(31,143,78,.16));border:1px solid rgba(255,181,71,.35);color:var(--ink,#e4f3f7);font:600 14px/1.4 var(--body,system-ui);text-align:center}' +
    '.natal-faixa b{color:#ffcf7a}' +
    '.natal-faixa .nf-cont{font-family:var(--mono,monospace);font-size:12px;padding:2px 8px;border-radius:999px;background:rgba(6,11,18,.55);border:1px solid rgba(255,181,71,.3);color:#ffcf7a}' +
    '.natal-faixa button{background:none;border:1px solid rgba(228,243,247,.25);color:inherit;border-radius:999px;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer}' +
    '.natal-faixa button:hover{border-color:#ffcf7a}' +
    '.natal-neve{position:fixed;inset:0;z-index:30;pointer-events:none}' +
    '@media (prefers-reduced-motion: reduce){.natal-luzes i{animation:none}}' +
    '@media print{.natal-luzes,.natal-faixa,.natal-neve{display:none}}';
  document.head.appendChild(css);

  function iniciar() {
    document.body.classList.add('natal');

    // ---------- fio de luzes ----------
    const cores = ['#e53935', '#ffb547', '#46e3ee', '#3ba55c', '#ff7ab6'];
    const luzes = document.createElement('div');
    luzes.className = 'natal-luzes'; luzes.setAttribute('aria-hidden', 'true');
    const n = Math.max(10, Math.min(40, Math.round(innerWidth / 42)));
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      b.style.setProperty('--c', cores[i % cores.length]);
      b.style.setProperty('--d', (i % 4) * 0.4 + 's');
      luzes.appendChild(b);
    }
    document.body.appendChild(luzes);

    // ---------- faixa de Boas Festas ----------
    const natal = Date.UTC(mes === 1 ? ano - 1 : ano, 11, 25);
    const hoje = Date.UTC(ano, mes - 1, dia);
    const faltam = Math.round((natal - hoje) / 86400000);
    const cont = faltam > 1 ? 'Faltam ' + faltam + ' dias para o Natal' : faltam === 1 ? 'Amanhã é Natal!' : faltam === 0 ? 'Hoje é Natal! 🎁' : (mes === 1 ? 'Feliz ' + ano + '! 🥂' : 'Boas Festas! 🥂');
    const faixa = document.createElement('div');
    faixa.className = 'natal-faixa'; faixa.setAttribute('role', 'note');
    faixa.innerHTML = '<span>🎄 <b>Boas Festas!</b> O Ricardo e o Bit desejam-te um Natal cheio de luz (e de boas automações).</span>' +
      '<span class="nf-cont">' + cont + '</span>' +
      '<button type="button" class="nf-neve"></button>';
    const topo = document.querySelector('header.topbar') || document.querySelector('header');
    if (topo && topo.parentNode) topo.parentNode.insertBefore(faixa, topo.nextSibling); else document.body.prepend(faixa);

    // ---------- neve ----------
    let ligada = ler('natal-neve') !== 'nao' && !calmo;
    const btn = faixa.querySelector('.nf-neve');
    const rotulo = () => { btn.textContent = ligada ? '❄️ Parar a neve' : '❄️ Pôr a neve'; btn.setAttribute('aria-pressed', ligada ? 'true' : 'false'); };
    let cv = null, ctx = null, flocos = [], raf = 0, W = 0, H = 0;
    const medir = () => { if (!cv) return; const r = devicePixelRatio || 1; W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0); };
    const novo = (topo) => ({ x: Math.random() * W, y: topo ? -10 : Math.random() * H, r: 0.8 + Math.random() * 2.2, v: 0.3 + Math.random() * 0.9, f: Math.random() * Math.PI * 2, a: 0.35 + Math.random() * 0.5 });
    function passo() {
      ctx.clearRect(0, 0, W, H);
      for (const s of flocos) {
        s.y += s.v; s.f += 0.01; s.x += Math.sin(s.f) * 0.35;
        if (s.y > H + 5) Object.assign(s, novo(true));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')'; ctx.fill();
      }
      raf = requestAnimationFrame(passo);
    }
    function ligar() {
      if (cv) return;
      cv = document.createElement('canvas'); cv.className = 'natal-neve'; cv.setAttribute('aria-hidden', 'true');
      ctx = cv.getContext('2d'); document.body.appendChild(cv); medir();
      const qt = Math.round(Math.min(110, Math.max(35, (W * H) / 16000)));
      flocos = Array.from({ length: qt }, () => novo(false));
      raf = requestAnimationFrame(passo);
    }
    function desligar() { cancelAnimationFrame(raf); if (cv) cv.remove(); cv = null; flocos = []; }
    addEventListener('resize', medir);
    document.addEventListener('visibilitychange', () => { if (!cv) return; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(passo); });
    btn.onclick = () => { ligada = !ligada; gravar('natal-neve', ligada ? 'sim' : 'nao'); ligada ? ligar() : desligar(); rotulo(); };
    rotulo(); if (ligada) ligar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
