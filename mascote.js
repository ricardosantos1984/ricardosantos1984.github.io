/* Bit, a mascote do site: um robozinho que passeia por todo o ecrã (a pé ou a voar) e dá dicas de IA.
   Clicar nele = dica nova e uma caixa para lhe fazer perguntas sobre IA.
   As respostas estão todas neste ficheiro (lista SABE): não há IA nem servidor por trás,
   nada do que se escreve sai do browser. Pode esconder-se (fica guardado neste browser). */
(function () {
  if (window.__bit) return; window.__bit = true;
  var guarda = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var parado = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pagina = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';

  var OLA = {
    index: 'Olá! Sou o Bit, a mascote do site. Clica em mim para uma dica ou para me fazeres perguntas sobre IA.',
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

  /* O que o Bit sabe. k = palavras ou expressões (sem acentos, minúsculas) que ativam a resposta;
     r = resposta; l = [texto, página] opcional; w = peso (respostas genéricas pesam menos). */
  var SABE = [
    { k: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'viva'], r: 'Olá! Pergunta-me o que quiseres sobre IA: o que é um token, um agente, um prompt, o n8n…', w: 0.8 },
    { k: ['obrigado', 'obrigada', 'fixe', 'boa', 'top'], r: 'De nada! Bip bop. Se tiveres mais perguntas, estou por aqui a passear.', w: 0.8 },
    { k: ['quem es', 'es tu', 'teu nome', 'como te chamas', 'bit', 'mascote', 'es um robo', 'es uma ia'], r: 'Sou o Bit, a mascote deste site. Não sou uma IA a sério: as minhas respostas foram escritas à mão e escolho a que melhor combina com a tua pergunta.', w: 0.9 },
    { k: ['contacto', 'contactar', 'falar com o ricardo', 'falar com ele', 'falar contigo', 'deixar mensagem', 'mandar mensagem', 'enviar mensagem', 'email do ricardo', 'telefone', 'numero', 'ajuda do ricardo', 'orcamento', 'reparacao', 'reparar'], r: 'Podes deixar uma mensagem ao Ricardo aqui mesmo: chega ao WhatsApp dele e ele responde no chat do site quando puder.', l: ['Abrir o chat', '#chat'] },
    { k: ['ricardo', 'quem fez', 'dono do site', 'autor', 'quem criou'], r: 'O site é do Ricardo Santos, técnico de informática de Tomar, que está a aprender a usar IA no dia a dia e regista aqui o que vai construindo.', l: ['Ver o início', './'] },
    { k: ['como foi feito', 'site foi feito', 'construido', 'como fizeste o site', 'fez o site'], r: 'Este site foi construído a conversar com uma IA (o Claude): o Ricardo descreve o que quer e a IA escreve o código e publica no GitHub.', l: ['Ver o diário', 'diario.html'] },
    { k: ['o que e ia', 'o que e a ia', 'inteligencia artificial', 'o que e inteligencia', 'ia generativa', 'generativa'], r: 'IA é um programa que aprendeu com muitos exemplos a fazer tarefas que pareciam só de pessoas: escrever, traduzir, ver imagens. A IA generativa cria conteúdo novo a partir de um pedido.', l: ['Como funciona a IA', 'aprender.html#como-funciona'], w: 0.7 },
    { k: ['como funciona', 'funciona a ia', 'como aprende', 'treino', 'treinada', 'como pensa', 'adivinha'], r: 'A IA é treinada com milhares de milhões de textos e aprende padrões. Para responder, parte a pergunta em tokens e vai escolhendo, um a um, o pedaço mais provável a seguir.', l: ['Explicação em 6 passos', 'aprender.html#como-funciona'] },
    { k: ['llm', 'modelo de linguagem', 'modelos de linguagem', 'large language'], r: 'LLM (Large Language Model) é um modelo de linguagem: um programa treinado com enormes quantidades de texto para prever e escrever texto. O ChatGPT, o Claude e o Gemini são LLM.', l: ['Glossário', 'aprender.html#glossario'] },
    { k: ['machine learning', 'aprendizagem automatica', 'rede neuronal', 'redes neuronais', 'rede neural', 'redes neurais', 'neuronios', 'deep learning'], r: 'Machine learning é ensinar um programa com exemplos em vez de regras escritas à mão. As redes neuronais são a técnica mais usada: muitas camadas de "neurónios" artificiais que ajustam ligações até acertarem.', l: ['Vídeos de fundamentos', 'videos.html#fundamentos'] },
    { k: ['token', 'tokens'], r: 'Um token é um pedacinho de texto, mais ou menos ¾ de uma palavra. Os modelos leem, escrevem e cobram por tokens.', l: ['Glossário', 'aprender.html#glossario'] },
    { k: ['janela de contexto', 'contexto', 'memoria', 'lembra'], r: 'A janela de contexto é quanto texto a IA consegue "ter em mente" de uma vez: a conversa, os documentos e as instruções. Fora disso, não se lembra.', l: ['Glossário', 'aprender.html#glossario'] },
    { k: ['alucinacao', 'alucinacoes', 'alucina', 'inventa', 'inventar', 'erra', 'engana', 'mente', 'errada', 'confiar'], r: 'Alucinação é quando a IA inventa uma resposta com toda a confiança. Acontece porque ela prevê texto provável, não consulta factos. Confirma sempre números, datas e nomes.' },
    { k: ['prompt', 'prompts', 'pedir', 'perguntar a ia', 'bom pedido', 'escrever para a ia'], r: 'Um prompt é o pedido que fazes à IA. Para ser bom: diz o objetivo, dá contexto, pede um formato, mostra um exemplo e define limites. E pede para ajustar a seguir!', l: ['8 dicas para bons prompts', 'aprender.html#prompts'] },
    { k: ['agente', 'agentes', 'agent'], r: 'Um agente de IA, além de responder, decide passos e usa ferramentas (agenda, email, pesquisa) para completar uma tarefa sozinho. O assistente do Ricardo no WhatsApp é um agente.', l: ['Vídeos sobre agentes', 'videos.html#agentes'] },
    { k: ['mcp', 'conector', 'conectores', 'model context protocol', 'ligar a ia'], r: 'MCP (Model Context Protocol) é uma forma padrão de ligar a IA a apps e dados, como uma ficha USB. É assim que o Claude fala com o Gmail, a Drive ou o n8n.', l: ['Vídeos sobre MCP', 'videos.html#mcp'] },
    { k: ['api', 'apis', 'chave da api', 'chave api'], r: 'Uma API é a porta de entrada de um serviço para outros programas. O n8n usa APIs para falar com o Gmail ou o Gemini. A chave da API é como uma senha: nunca se partilha.' },
    { k: ['automacao', 'automacoes', 'automatizar', 'automatico'], r: 'Uma automação é uma tarefa que corre sozinha quando acontece algo: uma hora marcada, um email novo. O Ricardo tem várias: avisos da casa, menu semanal, resumo dos emails…', l: ['O que corre sozinho', './#automacoes'] },
    { k: ['fluxo', 'workflow', 'workflows', 'fluxos'], r: 'Um fluxo (workflow) é a sequência de passos de uma automação: um gatilho que a faz arrancar e depois ações ligadas umas às outras.', l: ['Vídeos de n8n', 'videos.html#automacao'] },
    { k: ['n8n'], r: 'O n8n é uma ferramenta para montar automações em blocos, sem programar muito. O Ricardo tem-no instalado no PC e é lá que correm os fluxos dele.', l: ['Vídeos de n8n', 'videos.html#n8n'] },
    { k: ['ifttt'], r: 'O IFTTT faz automações simples do tipo "se acontece isto, faz aquilo". Foi a primeira automação do Ricardo: o tempo em Tomar todas as manhãs.', l: ['Vídeos de IFTTT', 'videos.html#ifttt'] },
    { k: ['oauth', 'iniciar sessao com google', 'autorizacao'], r: 'OAuth é o "Iniciar sessão com Google/Microsoft": dá autorização a uma app sem lhe dares a tua palavra-passe.' },
    { k: ['webhook', 'webhooks'], r: 'Um webhook é um endereço que fica à escuta: quando outra app lhe envia algo (por exemplo, uma mensagem do WhatsApp), o fluxo arranca.' },
    { k: ['rag', 'documentos', 'meus ficheiros', 'base de conhecimento'], r: 'RAG é dar à IA os documentos certos antes de ela responder: em vez de inventar, consulta a tua informação. O NotebookLM funciona assim.', l: ['Vídeos sobre RAG', 'videos.html#rag'] },
    { k: ['embedding', 'embeddings', 'vetor', 'vetores'], r: 'Embeddings transformam texto em números que guardam o significado: frases parecidas ficam com números parecidos. É a base da pesquisa inteligente e do RAG.' },
    { k: ['multimodal', 'ver imagens', 'le imagens', 'ler fotos', 'ouve', 'foto do contador'], r: 'Uma IA multimodal entende mais do que texto: imagens, som e vídeo. É assim que, na app da casa do Ricardo, a IA lê os números na foto de um contador.' },
    { k: ['imagem', 'imagens', 'desenhar', 'desenha', 'difusao', 'gerar imagem', 'criar imagens', 'fotos falsas'], r: 'As IAs de imagens usam modelos de difusão: partem de ruído aleatório e vão-no limpando, passo a passo, até aparecer a imagem que pediste.', l: ['Vídeos: como a IA cria imagens', 'videos.html#imagens'] },
    { k: ['video', 'videos com ia', 'criar video', 'veo', 'sora', 'gerar video'], r: 'Modelos como o Veo e o Sora aprenderam como o mundo se mexe e geram vídeos a partir de texto, imagem a imagem, mantendo tudo coerente.', l: ['Vídeos: como a IA cria vídeos', 'videos.html#videos-ia'] },
    { k: ['deepfake', 'deepfakes', 'burla', 'burlas', 'golpe', 'golpes', 'voz falsa', 'falso'], r: 'Um deepfake é um vídeo, voz ou foto falsos feitos com IA. Se alguém "conhecido" pedir dinheiro ou dados com urgência, confirma por outro meio antes de fazer seja o que for.', l: ['Vídeos sobre segurança', 'videos.html#seguranca'] },
    { k: ['seguro', 'seguranca', 'privacidade', 'dados pessoais', 'perigoso', 'perigo', 'palavra-passe', 'password', 'senha'], r: 'Regras de ouro: nunca dês palavras-passe, dados do banco ou documentos de identificação a uma IA, e confirma a informação importante. Eu não guardo nada do que escreves aqui.', l: ['Vídeos sobre segurança', 'videos.html#seguranca'] },
    { k: ['emprego', 'empregos', 'trabalho', 'substituir', 'tirar', 'profissoes', 'futuro', 'etica'], r: 'A IA muda muitas profissões: faz depressa tarefas repetitivas, mas precisa de pessoas para decidir, verificar e ter responsabilidade. Quem a souber usar fica em vantagem.', l: ['Vídeos: ética e trabalho', 'videos.html#etica'] },
    { k: ['estudar', 'estudo', 'escola', 'aluno', 'alunos', 'testes', 'tpc', 'trabalhos de casa'], r: 'A IA é um bom explicador: pede-lhe resumos, perguntas de treino ou que explique de outra maneira. Mas faz tu o trabalho, senão não aprendes!', l: ['Vídeos: estudar com IA', 'videos.html#estudar'] },
    { k: ['programar', 'programacao', 'codigo', 'vibe coding', 'criar app', 'criar apps', 'fazer uma app', 'criar um site', 'fazer um site'], r: '"Vibe coding" é descrever o que queres e deixar a IA escrever o código. Dá para criar sites e apps sem saber programar, mas convém ir testando e perceber o básico.', l: ['Vídeos: criar apps com IA', 'videos.html#vibe-coding'] },
    { k: ['local', 'offline', 'sem internet', 'ollama', 'no meu computador', 'no pc'], r: 'Dá para correr modelos de IA no teu próprio computador, sem internet e sem enviar dados para fora, com ferramentas como o Ollama. Pede um PC com boa memória.', l: ['Vídeos: IA no teu computador', 'videos.html#ia-local'] },
    { k: ['claude', 'anthropic'], r: 'O Claude é o assistente de IA da Anthropic. É com ele que o Ricardo está a aprender: criou este site e liga-se ao email, à Drive e ao n8n dele.', l: ['Vídeos do Claude', 'videos.html#claude'] },
    { k: ['chatgpt', 'openai', 'gpt'], r: 'O ChatGPT é o assistente de conversa da OpenAI: escreve, resume, traduz e responde a perguntas. Foi o que tornou a IA generativa conhecida de toda a gente.', l: ['Vídeos do ChatGPT', 'videos.html#chatgpt'] },
    { k: ['gemini', 'google ai', 'ai studio'], r: 'O Gemini é a IA da Google. O Ricardo usa-o dentro do n8n para resumir emails, criar o menu semanal e ler fotos. A chave gratuita cria-se no Google AI Studio.', l: ['Vídeos do Gemini', 'videos.html#gemini'] },
    { k: ['copilot', 'microsoft'], r: 'O Copilot é o assistente da Microsoft, presente no Windows, no Edge e no Office.', l: ['Vídeos do Copilot', 'videos.html#copilot'] },
    { k: ['perplexity', 'pesquisar', 'pesquisa na internet'], r: 'O Perplexity é uma IA de pesquisa: procura na internet e responde com um resumo e as fontes indicadas, para poderes confirmar.', l: ['Vídeos do Perplexity', 'videos.html#perplexity'] },
    { k: ['notebooklm', 'notebook lm', 'resumir documentos', 'podcast'], r: 'No NotebookLM carregas os teus documentos e a IA resume-os, responde a perguntas sobre eles e até cria um podcast. Ótimo para estudar.', l: ['Vídeos do NotebookLM', 'videos.html#notebooklm'] },
    { k: ['whatsapp', 'waha', 'assistente'], r: 'O Ricardo tem um agente de IA no WhatsApp: escreve-lhe do telemóvel e ele responde com a agenda, o tempo ou a lista de compras. A ponte entre o WhatsApp e o n8n chama-se WAHA.', l: ['Vídeos: IA no WhatsApp', 'videos.html#whatsapp-ia'] },
    { k: ['docker', 'contentor', 'container', 'contentores'], r: 'O Docker corre programas em "contentores": pacotes com tudo o que o programa precisa, isolados do resto do PC.', l: ['Vídeos de Docker', 'videos.html#docker'] },
    { k: ['supabase', 'base de dados', 'bases de dados', 'sql'], r: 'Uma base de dados é onde as apps guardam a informação de forma organizada. A app da casa do Ricardo usa o Supabase, que também trata das contas e dos ficheiros.', l: ['Vídeos de Supabase', 'videos.html#supabase'] },
    { k: ['github', 'github pages', 'alojar', 'publicar site', 'alojamento'], r: 'O GitHub guarda código e, com o GitHub Pages, aloja sites de graça. É onde vive este site.', l: ['Vídeos de GitHub Pages', 'videos.html#github-pages'] },
    { k: ['canva', 'design', 'cartaz', 'apresentacao'], r: 'O Canva tem ferramentas de IA para criar imagens, apresentações e cartazes a partir de uma descrição.', l: ['Vídeo do Canva', 'videos.html#canva'] },
    { k: ['ferramenta', 'ferramentas', 'qual a melhor', 'melhor ia', 'que ia usar', 'qual usar', 'app de ia'], r: 'Não há uma melhor para tudo. Para conversar e escrever: Claude, ChatGPT ou Gemini. Para pesquisar com fontes: Perplexity. Para estudar documentos: NotebookLM.', l: ['Ver as ferramentas', 'ferramentas.html'], w: 0.9 },
    { k: ['gratis', 'gratuito', 'gratuita', 'pagar', 'custa', 'preco', 'quanto custa'], r: 'Quase todas as IAs têm uma versão gratuita boa para começar: Claude, ChatGPT, Gemini, Copilot e Perplexity. As pagas dão mais uso e modelos mais fortes.', l: ['Ver as ferramentas', 'ferramentas.html'] },
    { k: ['comecar', 'aprender', 'iniciante', 'por onde', 'primeiros passos', 'do zero', 'curso'], r: 'Começa por conversar com uma IA sobre algo que conheces bem, para veres onde acerta e onde falha. Depois vê o percurso do Ricardo e os vídeos de fundamentos.', l: ['Aprender IA', 'aprender.html'] },
    { k: ['videos', 'ver videos', 'tutorial', 'tutoriais', 'youtube'], r: 'O site tem dezenas de vídeos, quase todos em português, arrumados por tema e por ferramenta.', l: ['Abrir os vídeos', 'videos.html'], w: 0.8 },
    { k: ['diario', 'novidades', 'o que ha de novo', 'ultimas'], r: 'No diário está tudo o que o Ricardo foi construindo com IA, dia a dia.', l: ['Abrir o diário', 'diario.html'], w: 0.8 },
    { k: ['app da casa', 'nossa casa', 'app casa', 'casa'], r: 'A Nossa Casa é a app da família do Ricardo: ementas, compras com comparação de preços, despesas, contadores lidos por foto… Foi toda construída com IA.', l: ['Ver no diário', 'diario.html'], w: 0.8 },
    { k: ['piada', 'anedota', 'conta uma'], r: 'Porque é que o robô foi ao médico? Porque tinha um vírus! Bip bip bip.', w: 0.9 },
    { k: ['idade', 'anos tens', 'quando nasceste'], r: 'Nasci a 10 de novembro de 2026. Ainda sou novinho, mas já sei andar e voar!', w: 0.9 },
    { k: ['consciencia', 'sentimentos', 'sente', 'pensa', 'inteligente', 'viva', 'vivo'], r: 'As IAs de hoje são muito boas a prever texto, e os especialistas ainda discutem o que isso significa. Eu cá sou só um robozinho com respostas escritas à mão.', w: 0.9 }
  ];
  var SUGESTOES = ['O que é um token?', 'Como escrever um bom prompt?', 'O que é um agente de IA?', 'A IA pode enganar-se?', 'Por onde começo?', 'O que é o n8n?'];
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function responder(q) {
    var n = ' ' + norm(q) + ' ', pal = n.trim().split(' '), melhor = null, pts = 0;
    for (var i = 0; i < SABE.length; i++) {
      var e = SABE[i], s = 0;
      for (var j = 0; j < e.k.length; j++) {
        var k = e.k[j];
        if (k.indexOf(' ') > 0) { if (n.indexOf(' ' + k + ' ') >= 0 || n.indexOf(' ' + k) >= 0 && k.length > 8) s += 3; }
        else if (pal.indexOf(k) >= 0) s += 2;
        else if (k.length >= 5 && pal.some(function (p) { return p.indexOf(k) === 0; })) s += 1.5;
      }
      s *= e.w || 1;
      if (s > pts) { pts = s; melhor = e; }
    }
    return pts >= 1.5 ? melhor : null;
  }

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
    '#bit .bit-f .bit-x{display:block;margin:.4rem 0 0;padding:0;border:0;background:none;color:#7fa3b0;font:400 .68rem "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}' +
    '#bit .bit-f .bit-x:hover{color:#46e3ee}' +
    '#bit.conversa .bit-f{width:min(270px,calc(100vw - 24px));max-width:none}' +
    '#bit .bit-l{display:none;margin-top:.35rem;color:#46e3ee;font-weight:600;text-decoration:underline;text-underline-offset:3px}' +
    '#bit .bit-l.on{display:block;width:max-content;max-width:100%}' +
    '#bit .bit-q,#bit .bit-s{display:none}' +
    '#bit.conversa .bit-q{display:flex;gap:.35rem;margin-top:.55rem}' +
    '#bit.conversa .bit-s{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.45rem}' +
    '#bit .bit-q input{flex:1;min-width:0;padding:.45rem .55rem;border:1px solid rgba(110,220,235,.38);border-radius:7px;background:#06101a;color:#e4f3f7;font:400 16px/1.2 Manrope,system-ui,sans-serif}' +
    '#bit .bit-q input:focus{outline:2px solid #46e3ee;outline-offset:1px}' +
    '#bit .bit-q button{padding:0 .7rem;border:0;border-radius:7px;background:#46e3ee;color:#061a22;font:700 .95rem Manrope,system-ui,sans-serif;cursor:pointer}' +
    '#bit .bit-s button{padding:.2rem .5rem;border:1px solid rgba(110,220,235,.3);border-radius:999px;background:none;color:#a9d6df;font:500 .72rem Manrope,system-ui,sans-serif;cursor:pointer}' +
    '#bit .bit-s button:hover{border-color:#46e3ee;color:#46e3ee}' +
    '#bit .bit-b{display:flex;justify-content:space-between;gap:.8rem}' +
    '#bit .bit-chat{display:none;width:100%;margin-top:.5rem;padding:.4rem .6rem;border:1px solid #ffb547;border-radius:8px;background:rgba(255,181,71,.08);color:#ffb547;font:600 .8rem Manrope,system-ui,sans-serif;cursor:pointer}' +
    '#bit .bit-chat:hover{background:rgba(255,181,71,.18)}' +
    '#bit.conversa .bit-chat{display:block}' +
    '#bit-volta{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:40;width:34px;height:34px;border-radius:50%;border:1px solid rgba(110,220,235,.38);background:#0d1a28;color:#46e3ee;font-size:16px;line-height:1;cursor:pointer;opacity:.75}' +
    '#bit-volta:hover{opacity:1}' +
    '@media print{#bit,#bit-volta{display:none}}' +
    '@media (prefers-reduced-motion:reduce){#bit *{animation:none!important}}';
  document.head.appendChild(css);

  var el, fala, txt, lig, inp, sug, x = 20, y = 0, ax = 0, ay = 0, dir = 1, estado = 'andar', ate = 0, ultimo = 0, tFala = 0, iDica = -1, raf = 0;

  function criar() {
    el = document.createElement('div'); el.id = 'bit';
    el.innerHTML =
      '<div class="bit-f"><span class="bit-t" role="status" aria-live="polite"></span><a class="bit-l" href="#"></a>' +
        '<form class="bit-q" autocomplete="off"><input type="text" maxlength="140" placeholder="Pergunta-me sobre IA…" aria-label="Pergunta para o Bit" enterkeyhint="send"><button type="submit" aria-label="Enviar pergunta">➤</button></form>' +
        '<div class="bit-s"></div>' +
        '<button type="button" class="bit-chat">💬 Falar com o Ricardo</button>' +
        '<div class="bit-b"><button type="button" class="bit-x" data-x="esconder">esconder o Bit</button><button type="button" class="bit-x" data-x="fechar">fechar ✕</button></div></div>' +
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
    fala = el.querySelector('.bit-f'); txt = fala.querySelector('.bit-t'); lig = fala.querySelector('.bit-l'); inp = fala.querySelector('input'); sug = fala.querySelector('.bit-s');
    el.querySelector('.bit-c').addEventListener('click', function () {
      el.classList.remove('salto'); void el.offsetWidth; el.classList.add('salto');
      iDica = (iDica + 1 + Math.floor(Math.random() * (DICAS.length - 1))) % DICAS.length;
      conversa(DICAS[iDica], null, true);
    });
    fala.querySelector('[data-x=esconder]').addEventListener('click', function () { guarda.set('bit-escondido', '1'); remover(); botaoVoltar(); });
    fala.querySelector('[data-x=fechar]').addEventListener('click', function () { calar(); });
    fala.querySelector('.bit-chat').addEventListener('click', abrirChat);
    lig.addEventListener('click', function (e) { if (lig.getAttribute('href') === '#chat') { e.preventDefault(); abrirChat(); } });
    fala.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); perguntar(inp.value); });
    sug.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) perguntar(b.textContent); });
    inp.addEventListener('focus', function () { clearTimeout(tFala); });
    inp.addEventListener('blur', function () { if (el && el.classList.contains('conversa')) espera(15000); });
    fala.addEventListener('keydown', function (e) { if (e.key === 'Escape') calar(); });
    x = parado ? Math.max(8, window.innerWidth - 60) : 20; y = chao(); alvo();
    por();
    setTimeout(function () { if (el) dizer(guarda.get('bit-visto') ? (OLA[pagina] || OLA.index) : OLA.index, 6000); guarda.set('bit-visto', '1'); }, 1400);
    if (!parado) { el.classList.add('andar'); ultimo = 0; raf = requestAnimationFrame(passo); }
  }

  function por() {
    el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    el.classList.toggle('baixo', y < 280);
    el.classList.toggle('esq', dir < 0);
    // manter o balão dentro do ecrã
    var w = fala.offsetWidth || 200, min = 8 - x, max = window.innerWidth - 8 - w - x;
    fala.style.left = Math.max(min, Math.min(max, 23 - w / 2)) + 'px';
  }

  function mostrar(t, l) {
    txt.textContent = t;
    if (l) { lig.textContent = l[0] + ' →'; lig.href = l[1]; lig.classList.add('on'); } else lig.classList.remove('on');
    el.classList.add('fala'); estado = 'parado'; el.classList.remove('andar'); por();
  }
  function calar() {
    clearTimeout(tFala); if (!el) return;
    el.classList.remove('fala', 'conversa'); if (inp) inp.blur();
    if (!parado) { estado = 'andar'; el.classList.add('andar'); ate = performance.now() + 6000 + Math.random() * 9000; }
  }
  function espera(ms) { clearTimeout(tFala); tFala = setTimeout(function () { if (el && document.activeElement !== inp) calar(); }, ms); }
  // fala curta (cumprimento ou dica espontânea), sem caixa de perguntas
  function dizer(t, ms) { if (el.classList.contains('conversa')) return; mostrar(t, null); espera(ms); }
  // balão com caixa de perguntas (ao clicar no Bit)
  function conversa(t, l, comSugestoes) {
    el.classList.add('conversa');
    sug.innerHTML = '';
    if (comSugestoes) {
      var op = SUGESTOES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
      op.forEach(function (o) { var b = document.createElement('button'); b.type = 'button'; b.textContent = o; sug.appendChild(b); });
    }
    mostrar(t, l); espera(15000);
  }
  function abrirChat() { calar(); if (window.chatSite) window.chatSite.abrir(); }
  // usado pelo chat para avisar que o Ricardo respondeu
  window.bitDiz = function (t) { if (!el) { if (window.chatSite) window.chatSite.abrir(); return; } conversa(t, ['Abrir o chat', '#chat'], false); };
  function perguntar(q) {
    q = String(q || '').trim(); if (!q) { inp.focus(); return; }
    var r = responder(q);
    inp.value = '';
    if (r) conversa(r.r, r.l || null, false);
    else conversa('Hmm, isso ainda não sei responder. Sei falar de IA: tokens, prompts, agentes, automações, segurança, ferramentas… Experimenta uma destas:', null, true);
    el.classList.remove('salto'); void el.offsetWidth; el.classList.add('salto');
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
