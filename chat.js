/* Chat "Falar com o Ricardo": as mensagens vão para o WhatsApp do Ricardo
   (através do n8n) e as respostas dele aparecem aqui.
   Guarda-se só neste browser um identificador aleatório da conversa; a
   base de dados só deixa ler a conversa a quem tem esse identificador. */
(function () {
  if (window.chatSite) return;
  var API = 'https://uthotfdcfwrdyivhwkpw.supabase.co/rest/v1/rpc/';
  var KEY = 'sb_publishable_1NO-glUWpi7oEzQUS2xX0A_7TS9qNpu';
  var g = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var mem = {};
  function ler(k) { var v = g.get(k); return v == null ? (mem[k] || null) : v; }
  function gravar(k, v) { mem[k] = v; g.set(k, v); }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function rpc(nome, corpo) {
    return fetch(API + nome, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error((j && j.message) || 'Não foi possível ligar ao chat.'); return j; }); });
  }

  var css = document.createElement('style');
  css.textContent =
    '#chat-site{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:45;width:min(360px,calc(100vw - 32px));height:min(520px,calc(100vh - 110px));display:none;flex-direction:column;background:#0d1a28;border:1px solid rgba(110,220,235,.38);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.55);font:400 .92rem/1.45 Manrope,system-ui,sans-serif;color:#e4f3f7;overflow:hidden}' +
    '#chat-site.on{display:flex}' +
    '#chat-site header{display:flex;align-items:center;gap:.6rem;padding:.75rem .9rem;border-bottom:1px solid rgba(110,220,235,.2);background:#0a1522}' +
    '#chat-site header b{flex:1;font-size:.98rem}' +
    '#chat-site header small{display:block;font-weight:400;color:#7fa3b0;font-size:.72rem}' +
    '#chat-site header button{border:0;background:none;color:#7fa3b0;font-size:1.3rem;line-height:1;cursor:pointer;padding:.2rem .35rem}' +
    '#chat-site header button:hover{color:#46e3ee}' +
    '#chat-site .cs-msgs{flex:1;overflow-y:auto;padding:.8rem;display:flex;flex-direction:column;gap:.5rem}' +
    '#chat-site .cs-m{max-width:85%;padding:.5rem .7rem;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}' +
    '#chat-site .cs-m time{display:block;margin-top:.15rem;font:400 .66rem "JetBrains Mono",ui-monospace,monospace;opacity:.6}' +
    '#chat-site .cs-v{align-self:flex-end;background:#46e3ee;color:#061a22;border-bottom-right-radius:4px}' +
    '#chat-site .cs-r{align-self:flex-start;background:#162c40;border:1px solid rgba(110,220,235,.2);border-bottom-left-radius:4px}' +
    '#chat-site .cs-info{align-self:center;max-width:95%;text-align:center;color:#7fa3b0;font-size:.78rem}' +
    '#chat-site .cs-erro{color:#ff9b9b}' +
    '#chat-site form{display:flex;flex-direction:column;gap:.4rem;padding:.6rem;border-top:1px solid rgba(110,220,235,.2)}' +
    '#chat-site .cs-l{display:flex;gap:.4rem}' +
    '#chat-site input,#chat-site textarea{flex:1;min-width:0;padding:.5rem .6rem;border:1px solid rgba(110,220,235,.38);border-radius:8px;background:#06101a;color:#e4f3f7;font:400 16px/1.3 Manrope,system-ui,sans-serif;resize:none}' +
    '#chat-site input:focus,#chat-site textarea:focus{outline:2px solid #46e3ee;outline-offset:1px}' +
    '#chat-site form button{padding:0 .9rem;border:0;border-radius:8px;background:#46e3ee;color:#061a22;font:700 .95rem Manrope,system-ui,sans-serif;cursor:pointer}' +
    '#chat-site form button:disabled{opacity:.5;cursor:default}' +
    '@media (max-width:480px){#chat-site{right:8px;left:8px;width:auto;bottom:calc(8px + env(safe-area-inset-bottom,0px));height:min(560px,calc(100vh - 80px))}}' +
    '@media print{#chat-site{display:none!important}}';
  document.head.appendChild(css);

  var painel, lista, campoNome, campoTexto, botao, ultimo = 0, timer = 0, aEnviar = false, aberto = false;
  var conv = ler('chat-conversa');

  function hora(iso) { try { var d = new Date(iso); return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function bolha(texto, classe, quando) {
    var d = document.createElement('div'); d.className = 'cs-m ' + classe; d.textContent = texto;
    if (quando) { var t = document.createElement('time'); t.textContent = (classe === 'cs-r' ? 'Ricardo · ' : '') + hora(quando); d.appendChild(t); }
    lista.appendChild(d); lista.scrollTop = lista.scrollHeight; return d;
  }
  function info(texto, erro) { var d = document.createElement('div'); d.className = 'cs-info' + (erro ? ' cs-erro' : ''); d.textContent = texto; lista.appendChild(d); lista.scrollTop = lista.scrollHeight; return d; }

  function criar() {
    painel = document.createElement('section'); painel.id = 'chat-site';
    painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-label', 'Conversa com o Ricardo');
    painel.innerHTML =
      '<header><b>Falar com o Ricardo<small>As mensagens chegam ao WhatsApp dele</small></b><button type="button" aria-label="Fechar o chat">✕</button></header>' +
      '<div class="cs-msgs" aria-live="polite"></div>' +
      '<form autocomplete="off"><input class="cs-nome" type="text" maxlength="60" placeholder="O teu nome (e email, se quiseres resposta por lá)" aria-label="O teu nome">' +
      '<div class="cs-l"><textarea rows="2" maxlength="1000" placeholder="Escreve a tua mensagem…" aria-label="Mensagem" enterkeyhint="send"></textarea><button type="submit">Enviar</button></div></form>';
    document.body.appendChild(painel);
    lista = painel.querySelector('.cs-msgs'); campoNome = painel.querySelector('.cs-nome'); campoTexto = painel.querySelector('textarea'); botao = painel.querySelector('form button');
    painel.querySelector('header button').onclick = fechar;
    painel.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    campoTexto.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } });
    painel.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); enviar(); });
    var n = ler('chat-nome'); if (n) { campoNome.value = n; campoNome.style.display = 'none'; }
    info('Olá! Deixa aqui a tua mensagem: chega ao WhatsApp do Ricardo e ele responde aqui quando puder. Podes fechar e voltar mais tarde, a conversa fica guardada neste browser.');
  }

  function carregar(primeira) {
    if (!conv) return Promise.resolve([]);
    return rpc('chat_ler', { p_conversa: conv, p_depois: ultimo }).then(function (ms) {
      var novasDoRicardo = 0;
      (ms || []).forEach(function (m) {
        if (painel) bolha(m.texto, m.de === 'ricardo' ? 'cs-r' : 'cs-v', m.criado_em);
        if (m.de === 'ricardo' && m.id > +(ler('chat-visto') || 0)) novasDoRicardo++;
        ultimo = Math.max(ultimo, m.id);
      });
      if (aberto) gravar('chat-visto', String(ultimo));
      return novasDoRicardo;
    }).catch(function (e) { if (painel && !primeira) { /* silencioso: tenta outra vez no próximo ciclo */ } return 0; });
  }

  function enviar() {
    var t = campoTexto.value.trim(); if (!t || aEnviar) return;
    var nome = campoNome.value.trim();
    if (!conv) { conv = uuid(); gravar('chat-conversa', conv); }
    aEnviar = true; botao.disabled = true;
    var temp = bolha(t, 'cs-v', null); temp.style.opacity = '.6';
    rpc('chat_enviar', { p_conversa: conv, p_texto: t, p_nome: nome || null }).then(function () {
      campoTexto.value = ''; temp.remove();
      if (nome) { gravar('chat-nome', nome); campoNome.style.display = 'none'; }
      if (!ler('chat-enviou')) { gravar('chat-enviou', '1'); setTimeout(function () { info('Mensagem enviada ✓ O Ricardo recebe-a no WhatsApp dentro de 1 a 2 minutos.'); }, 400); }
      return carregar();
    }).catch(function (e) {
      temp.remove(); info(e.message || 'Não foi possível enviar. Tenta outra vez.', true);
    }).then(function () { aEnviar = false; botao.disabled = false; campoTexto.focus(); });
  }

  function ciclo() { clearTimeout(timer); if (!aberto) return; carregar().then(function () { timer = setTimeout(ciclo, document.hidden ? 20000 : 5000); }); }
  function abrir() {
    if (!painel) { criar(); ultimo = 0; }
    aberto = true; painel.classList.add('on');
    if (!lista.querySelector('.cs-m') && conv) { ultimo = 0; }
    ciclo();
    setTimeout(function () { (campoNome.style.display === 'none' ? campoTexto : campoNome).focus(); }, 50);
  }
  function fechar() { aberto = false; clearTimeout(timer); if (painel) painel.classList.remove('on'); }

  // ao abrir uma página: se há resposta nova do Ricardo, avisa (o Bit diz, se estiver por perto)
  function verificarRespostas() {
    if (!conv) return;
    var antes = ultimo; ultimo = 0;
    rpc('chat_ler', { p_conversa: conv, p_depois: +(ler('chat-visto') || 0) }).then(function (ms) {
      ultimo = antes;
      var n = (ms || []).filter(function (m) { return m.de === 'ricardo'; }).length;
      if (n && window.bitDiz) window.bitDiz('O Ricardo respondeu-te no chat! 💬', 'abrir chat');
    }).catch(function () { ultimo = antes; });
  }

  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href="#chat"]'); if (a && !a.closest('#bit')) { e.preventDefault(); abrir(); } });
  window.chatSite = { abrir: abrir, fechar: fechar, temConversa: function () { return !!conv; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(verificarRespostas, 2500); });
  else setTimeout(verificarRespostas, 2500);
})();
