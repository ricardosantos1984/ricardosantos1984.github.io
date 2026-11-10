/* Bit, a mascote do site: um robozinho que passeia por todo o ecrã (a pé ou a voar) e dá dicas de IA.
   Às vezes faz truques: vira foguetão ou carro, programa no portátil, dança,
   joga à bola, faz o pino, vira satélite ou drone, sobe para os títulos, espreita
   pela borda do ecrã e segue o rato… e se ninguém mexer na página, adormece.
   Muda de roupa conforme a hora, o dia e o tempo em Tomar: fita de corrida de manhã,
   equipamento de futsal à quarta à noite, guarda-chuva, óculos de sol ou cachecol
   (tempo da Open-Meteo), gorro de Pai Natal, máscara de Carnaval e abóbora no Halloween.
   Na página de vídeos, quando se abre um vídeo, aparece com pipocas.
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
    { k: ['que sabes fazer', 'o que fazes', 'habilidades', 'truques'], r: 'Sei responder a perguntas sobre IA, levar-te ao chat com o Ricardo… e fazer truques! Escreve "vira foguetão", "vira carro", "vira satélite", "vira drone", "dança", "joga à bola", "marca golo", "faz o pino", "sobe ao título", "espreita", "segue-me" ou "faz um truque". E mudo de roupa conforme a hora e o tempo em Tomar!', w: 0.9 },
    { k: ['piada', 'anedota', 'conta uma'], r: 'Porque é que o robô foi ao médico? Porque tinha um vírus! Bip bip bip.', w: 0.9 },
    { k: ['idade', 'anos tens', 'quando nasceste'], r: 'Nasci a 10 de novembro de 2026. Ainda sou novinho, mas já sei andar e voar!', w: 0.9 },
    { k: ['consciencia', 'sentimentos', 'sente', 'pensa', 'inteligente', 'viva', 'vivo'], r: 'As IAs de hoje são muito boas a prever texto, e os especialistas ainda discutem o que isso significa. Eu cá sou só um robozinho com respostas escritas à mão.', w: 0.9 }
  ];
  var SUGESTOES = ['Faz um truque!', 'O que é um token?', 'Como escrever um bom prompt?', 'O que é um agente de IA?', 'A IA pode enganar-se?', 'Por onde começo?', 'O que é o n8n?'];
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
    '#bit .f-foguete,#bit .f-carro,#bit .f-pc,#bit .f-bola,#bit .f-notas,#bit .f-zz,#bit .f-satelite,#bit .f-drone,#bit .f-golo,#bit .ac{display:none}' +
    '#bit.t-satelite .tudo,#bit.t-drone .tudo{display:none}' +
    '#bit.esq .vira{transform:scaleX(-1);transform-box:fill-box;transform-origin:50% 50%}' +
    '#bit.t-satelite .f-satelite,#bit.t-drone .f-drone,#bit.t-festa .f-golo{display:inline}' +
    '#bit.ac-fita .a-fita,#bit.ac-futsal .a-futsal,#bit.ac-chuva .a-chuva,#bit.ac-oculos .a-oculos,#bit.ac-frio .a-frio,#bit.ac-natal .a-natal,#bit.ac-carnaval .a-carnaval,#bit.ac-halloween .a-halloween,#bit.ac-pipocas .a-pipocas{display:inline}' +
    '#bit.ac-natal .antena,#bit.ac-natal .luz-r{display:none}' +
    '#bit.ac-carnaval .olho{display:none}' +
    '#bit.ac-chuva .b2{transform:rotate(-150deg)!important;animation:none!important}' +
    '#bit.ac-pipocas .b1{animation:bit-come .7s ease-in-out infinite alternate!important}' +
    '#bit .pingo{animation:bit-pingo .9s linear infinite}#bit .pingo.g2{animation-delay:.3s}#bit .pingo.g3{animation-delay:.6s}' +
    '#bit .painel{transform-box:fill-box;transform-origin:50% 50%}' +
    '#bit.t-satelite .f-satelite{transform-box:fill-box;transform-origin:50% 50%;animation:bit-rodar 6s linear infinite}' +
    '#bit .sinal{animation:bit-sinal 1.2s ease-out infinite;transform-box:fill-box;transform-origin:0 100%}' +
    '#bit .helice{transform-box:fill-box;transform-origin:50% 50%;animation:bit-helice .08s linear infinite alternate}' +
    '#bit.t-drone .f-drone{animation:bit-flutua 1.2s ease-in-out infinite}' +
    '#bit .flash{opacity:0;transform-box:fill-box;transform-origin:50% 50%}' +
    '#bit.clique .flash{animation:bit-flash .5s ease-out}' +
    '#bit.t-festa .b1{transform:rotate(155deg)!important;animation:none!important}#bit.t-festa .b2{transform:rotate(-155deg)!important;animation:none!important}' +
    '#bit.t-festa .tudo{animation:bit-salto .4s ease-out infinite!important}' +
    '#bit.t-festa .f-golo text{animation:bit-cod 1s ease-out infinite}' +
    '#bit.t-espreitar .tudo{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(14deg)}' +
    '@keyframes bit-come{from{transform:rotate(20deg)}to{transform:rotate(150deg)}}' +
    '@keyframes bit-pingo{0%{opacity:0;transform:translateY(-4px)}30%{opacity:1}100%{opacity:0;transform:translateY(12px)}}' +
    '@keyframes bit-rodar{to{transform:rotate(360deg)}}' +
    '@keyframes bit-sinal{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(1.3)}}' +
    '@keyframes bit-helice{from{transform:scaleX(1)}to{transform:scaleX(.25)}}' +
    '@keyframes bit-flash{0%{opacity:.95;transform:scale(.3)}100%{opacity:0;transform:scale(2.2)}}' +
    '#bit.t-bola .f-bola,#bit.t-danca .f-notas,#bit.t-dormir .f-zz{display:inline}' +
    '#bit.t-bola .p1{animation:bit-passo .22s linear infinite}#bit.t-bola .p2{animation:bit-passo .22s linear infinite reverse}' +
    '#bit.t-bola .b1{animation:bit-braco .22s linear infinite reverse}#bit.t-bola .b2{animation:bit-braco .22s linear infinite}' +
    '#bit .bola{transform-box:fill-box;transform-origin:50% 50%;animation:bit-roda .3s linear infinite}' +
    '#bit.t-danca .tudo{transform-box:fill-box;transform-origin:50% 100%;animation:bit-danca .5s ease-in-out infinite alternate}' +
    '#bit.t-danca .b1{animation:bit-acena .25s ease-in-out infinite alternate}#bit.t-danca .b2{animation:bit-acena2 .25s ease-in-out infinite alternate}' +
    '#bit .nota,#bit .zz{opacity:0;font:700 9px Manrope,system-ui,sans-serif}' +
    '#bit .nota{fill:#ffb547}#bit .zz{fill:#46e3ee}' +
    '#bit.t-danca .nota{animation:bit-cod 1.2s ease-out infinite}#bit.t-danca .nota.n2{animation-delay:.6s}' +
    '#bit.t-dormir .zz{animation:bit-zz 2.4s ease-out infinite}#bit.t-dormir .zz.z2{animation-delay:.8s}#bit.t-dormir .zz.z3{animation-delay:1.6s}' +
    '#bit.t-dormir .olho{animation:none;transform:scaleY(.12)}#bit.t-dormir .luz{animation:none;opacity:.25}' +
    '#bit.t-dormir .tudo{transform-box:fill-box;transform-origin:50% 100%;animation:bit-respira 2.4s ease-in-out infinite}' +
    '#bit.t-pino .tudo{transform-box:fill-box;transform-origin:50% 50%;animation:bit-pino 1.6s ease-in-out}' +
    '#bit.t-acenar .b2{animation:bit-acena2 .3s ease-in-out infinite alternate}' +
    '@keyframes bit-danca{from{transform:rotate(-12deg) translateY(0)}to{transform:rotate(12deg) translateY(-3px)}}' +
    '@keyframes bit-acena{from{transform:rotate(150deg)}to{transform:rotate(120deg)}}' +
    '@keyframes bit-acena2{from{transform:rotate(-150deg)}to{transform:rotate(-120deg)}}' +
    '@keyframes bit-zz{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(8px,-18px)}}' +
    '@keyframes bit-respira{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.95)}}' +
    '@keyframes bit-pino{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-26px) rotate(180deg)}60%{transform:translateY(-6px) rotate(360deg)}100%{transform:translateY(0) rotate(360deg)}}' +
    '#bit .f-foguete,#bit .f-carro,#bit .f-pc{display:none}' +
    '#bit.t-foguete .tudo,#bit.t-carro .tudo{display:none}' +
    '#bit.t-foguete .f-foguete,#bit.t-carro .f-carro,#bit.t-pc .f-pc{display:inline}' +
    '#bit .fogo{transform-box:fill-box;transform-origin:50% 0;animation:bit-chama .12s ease-in-out infinite alternate}' +
    '#bit .roda{transform-box:fill-box;transform-origin:50% 50%;animation:bit-roda .35s linear infinite}' +
    '#bit .vento{animation:bit-vento .3s linear infinite}' +
    '#bit.t-foguete .f-foguete{animation:bit-treme .08s linear infinite alternate}' +
    '#bit.t-carro .f-carro{animation:bit-balanco .25s ease-in-out infinite}' +
    '#bit.t-pc .b1{animation:bit-tecla1 .16s linear infinite alternate}' +
    '#bit.t-pc .b2{animation:bit-tecla2 .16s linear infinite alternate}' +
    '#bit .cod{opacity:0;font:700 6px "JetBrains Mono",monospace;fill:#46e3ee}' +
    '#bit.t-pc .cod{animation:bit-cod 1.5s ease-out infinite}' +
    '#bit.t-pc .cod.c2{animation-delay:.5s;fill:#ffb547}' +
    '#bit.t-pc .cod.c3{animation-delay:1s}' +
    '#bit .fumo circle{opacity:0;transform-box:fill-box;transform-origin:50% 50%}' +
    '#bit.puff .fumo circle{animation:bit-puff .5s ease-out}' +
    '@keyframes bit-roda{to{transform:rotate(360deg)}}' +
    '@keyframes bit-vento{0%{opacity:.7;transform:translateX(0)}100%{opacity:0;transform:translateX(-6px)}}' +
    '@keyframes bit-treme{from{transform:translateX(-.6px)}to{transform:translateX(.6px)}}' +
    '@keyframes bit-tecla1{from{transform:rotate(-38deg)}to{transform:rotate(-52deg)}}' +
    '@keyframes bit-tecla2{from{transform:rotate(38deg)}to{transform:rotate(52deg)}}' +
    '@keyframes bit-cod{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-16px)}}' +
    '@keyframes bit-puff{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.8)}}' +
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

  // ---------- hora e dia em Lisboa, e tempo em Tomar ----------
  function lisboa() {
    try {
      var p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { ano: +p.year, mes: +p.month, dia: +p.day, h: (+p.hour % 24) + (+p.minute) / 60, sem: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
    } catch (e) { var d = new Date(); return { ano: d.getFullYear(), mes: d.getMonth() + 1, dia: d.getDate(), h: d.getHours() + d.getMinutes() / 60, sem: d.getDay() }; }
  }
  function pascoa(a) { // algoritmo de Meeus: data do domingo de Páscoa
    var b = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), f = c % 4, g = Math.floor((c + 8) / 25), h = Math.floor((c - g + 1) / 3),
      i = (19 * b + c - e - h + 15) % 30, k = Math.floor(d / 4), l = d % 4, m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((b + 11 * m + 22 * i) / 451),
      mes = Math.floor((i + m - 7 * n + 114) / 31), dia = ((i + m - 7 * n + 114) % 31) + 1;
    return Date.UTC(a, mes - 1, dia);
  }
  function ocasiao(L) {
    var hoje = Date.UTC(L.ano, L.mes - 1, L.dia), DIA = 86400000;
    if ((L.mes === 12) || (L.mes === 1 && L.dia <= 6)) return 'natal';
    var carnaval = pascoa(L.ano) - 47 * DIA;
    if (hoje >= carnaval - 6 * DIA && hoje <= carnaval + DIA) return 'carnaval';
    if ((L.mes === 10 && L.dia >= 25) || (L.mes === 11 && L.dia <= 1)) return 'halloween';
    return '';
  }
  var tempo = null; // { temp, chuva, sol }
  function buscarTempo() {
    try { var c = JSON.parse(sessionStorage.getItem('bit-tempo') || 'null'); if (c && Date.now() - c.ts < 1800e3) { tempo = c.v; aplicarRoupa(); return; } } catch (e) {}
    if (!window.fetch) return;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=39.6054&longitude=-8.4043&current=temperature_2m,weather_code,is_day&timezone=Europe%2FLisbon')
      .then(function (r) { return r.json(); }).then(function (j) {
        var c = j && j.current; if (!c) return;
        var w = +c.weather_code;
        tempo = { temp: Math.round(c.temperature_2m), chuva: (w >= 51 && w <= 67) || (w >= 80 && w <= 82) || w >= 95, sol: w <= 1 && c.is_day === 1 };
        try { sessionStorage.setItem('bit-tempo', JSON.stringify({ ts: Date.now(), v: tempo })); } catch (e) {}
        aplicarRoupa();
        if (el && !el.classList.contains('fala') && !tq && !(guarda.get('bit-tempo-dito') === new Date().toDateString())) {
          var f = tempo.chuva ? 'Em Tomar estão ' + tempo.temp + ' °C e está a chover: trouxe o guarda-chuva ☔'
            : tempo.temp >= 26 && tempo.sol ? 'Estão ' + tempo.temp + ' °C em Tomar! Óculos de sol postos 😎'
            : tempo.temp <= 8 ? 'Brrr, só ' + tempo.temp + ' °C em Tomar. Pus o cachecol 🧣' : '';
          if (f) setTimeout(function () { if (el && !el.classList.contains('fala') && !tq) { dizer(f, 5500); guarda.set('bit-tempo-dito', new Date().toDateString()); } }, 9000);
        }
      }).catch(function () {});
  }
  var momento = {};
  function aplicarRoupa() {
    if (!el) return;
    var L = lisboa(), oc = ocasiao(L);
    momento = { corrida: L.h >= 6.5 && L.h < 9.5, futsal: L.sem === 3 && L.h >= 19, oc: oc };
    var t = tempo || {};
    var on = {
      'ac-natal': oc === 'natal', 'ac-carnaval': oc === 'carnaval', 'ac-halloween': oc === 'halloween',
      'ac-fita': momento.corrida && oc !== 'natal', 'ac-futsal': momento.futsal,
      'ac-chuva': !!t.chuva, 'ac-oculos': !t.chuva && t.sol && t.temp >= 26 && oc !== 'carnaval', 'ac-frio': !t.chuva && t.temp <= 8
    };
    for (var k in on) el.classList.toggle(k, !!on[k]);
  }

  var el, fala, txt, lig, inp, sug, x = 20, y = 0, ax = 0, ay = 0, dir = 1, estado = 'andar', tq = null, ate = 0, ultimo = 0, tFala = 0, iDica = -1, raf = 0;

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
        '<line class="antena" x1="23" y1="9" x2="23" y2="3.5" stroke="#46e3ee" stroke-width="1.6" stroke-linecap="round"/>' +
        '<circle class="luz luz-r" cx="23" cy="3" r="2.6" fill="#ffb547"/>' +
        // guarda-chuva (na mão direita, levantada)
        '<g class="ac a-chuva"><path d="M38 33 39 -5" stroke="#e4f3f7" stroke-width="1.3"/><path d="M24 -4q15-17 30 0q-3.7-2.6-7.5 0q-3.7-2.6-7.5 0q-3.7-2.6-7.5 0q-3.7-2.6-7.5 0z" fill="#46e3ee" stroke="#0d1a28" stroke-width=".8"/>' +
          '<path class="pingo" d="M22 4v3" stroke="#7fd3ff" stroke-width="1.2" stroke-linecap="round"/><path class="pingo g2" d="M50 2v3" stroke="#7fd3ff" stroke-width="1.2" stroke-linecap="round"/><path class="pingo g3" d="M58 8v3" stroke="#7fd3ff" stroke-width="1.2" stroke-linecap="round"/></g>' +
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
        // acessórios (aparecem conforme a hora, o dia e o tempo)
        '<g class="ac a-futsal"><rect x="11" y="27" width="24" height="17" rx="5" fill="#1f8f4e" stroke="#46e3ee" stroke-width="1.5"/><path d="M11 33h24" stroke="#ffffff" stroke-width="1.2"/><g class="vira"><text x="23" y="42" text-anchor="middle" font-family="Manrope,system-ui,sans-serif" font-weight="800" font-size="8" fill="#ffffff">7</text></g></g>' +
        '<g class="ac a-fita"><rect x="6" y="11" width="34" height="3.6" rx="1.2" fill="#ff5a5a"/><path d="M40 12.5l6-3M40 13.5l6 3" stroke="#ff5a5a" stroke-width="1.8" stroke-linecap="round"/></g>' +
        '<g class="ac a-oculos"><rect x="14.5" y="15.5" width="9" height="6.5" rx="2.2" fill="#000"/><rect x="25.5" y="15.5" width="9" height="6.5" rx="2.2" fill="#000"/><path d="M23.5 18h2" stroke="#000" stroke-width="1.3"/><path d="M16 17l3 0" stroke="#46e3ee" stroke-width=".7" opacity=".7"/></g>' +
        '<g class="ac a-frio"><rect x="10" y="25.5" width="26" height="4.5" rx="2.2" fill="#ff5a5a"/><rect x="27" y="28" width="4.5" height="10" rx="1.5" fill="#ff5a5a"/><path d="M27 34h4.5M27 36.5h4.5" stroke="#fff" stroke-width=".8"/></g>' +
        '<g class="ac a-natal"><path d="M8 11c3-9 12-13 21-10l9 5-2 5z" fill="#e53935"/><path d="M29 1l10 4" stroke="#e53935" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="6" r="3" fill="#fff"/><rect x="5" y="9" width="36" height="4" rx="2" fill="#fff"/></g>' +
        '<g class="ac a-carnaval"><path d="M12 15h22q2 6-4 8q-4 1-7-2q-3 3-7 2q-6-2-4-8z" fill="#b44cff" stroke="#ffb547" stroke-width=".8"/><ellipse cx="19" cy="18.5" rx="2.3" ry="1.6" fill="#06101a"/><ellipse cx="27.5" cy="18.5" rx="2.3" ry="1.6" fill="#06101a"/><path d="M33 15q4-9 9-9q-3 4-6 10z" fill="#ffb547"/></g>' +
        '<g class="ac a-halloween"><path d="M1 37.5v-2" stroke="#3ba55c" stroke-width="1.6"/><ellipse cx="2" cy="42.5" rx="6" ry="5" fill="#ff8a00"/><path d="M-1 41l1.5-1.5 1.5 1.5zM3 41l1.5-1.5 1.5 1.5zM-1 44.5q3 2 6 0" fill="#06101a" stroke="#06101a" stroke-width=".6"/></g>' +
        '<g class="ac a-pipocas"><path d="M-2 36h11l-1.6 11h-7.8z" fill="#ffffff"/><path d="M0.5 36l1 11M4 36v11M7 36l-1 11" stroke="#e53935" stroke-width="1.3"/><circle cx="0" cy="35" r="2.2" fill="#ffe08a"/><circle cx="3.5" cy="34" r="2.4" fill="#fff3c4"/><circle cx="7" cy="35" r="2.2" fill="#ffe08a"/></g>' +
      '</g>' +
      // festa do golo
      '<g class="f-golo"><g class="vira"><text x="23" y="-4" text-anchor="middle" font-family="Manrope,system-ui,sans-serif" font-weight="800" font-size="9" fill="#ffb547">GOLO!</text></g></g>' +
      // satélite
      '<g class="f-satelite"><rect class="painel" x="-6" y="21" width="16" height="12" fill="#1b4a7a" stroke="#46e3ee" stroke-width="1"/><path d="M-6 27h16M2 21v12" stroke="#46e3ee" stroke-width=".6"/>' +
        '<rect class="painel" x="36" y="21" width="16" height="12" fill="#1b4a7a" stroke="#46e3ee" stroke-width="1"/><path d="M36 27h16M44 21v12" stroke="#46e3ee" stroke-width=".6"/>' +
        '<path d="M10 27h4M32 27h4" stroke="#46e3ee" stroke-width="1.5"/><rect x="14" y="18" width="18" height="18" rx="4" fill="#0d1a28" stroke="#46e3ee" stroke-width="1.6"/>' +
        '<ellipse class="olho" cx="20" cy="26" rx="1.6" ry="2.1" fill="#46e3ee"/><ellipse class="olho" cx="26" cy="26" rx="1.6" ry="2.1" fill="#46e3ee"/>' +
        '<path d="M23 18v-6" stroke="#46e3ee" stroke-width="1.3"/><path d="M18 12q5-6 10 0" fill="none" stroke="#ffb547" stroke-width="1.6"/>' +
        '<path class="sinal" d="M30 8q4-4 8 0M32 4q6-6 12 0" fill="none" stroke="#ffb547" stroke-width="1.2" stroke-linecap="round"/></g>' +
      // drone
      '<g class="f-drone"><path d="M6 20h34" stroke="#46e3ee" stroke-width="2"/><path d="M6 17v4M40 17v4" stroke="#46e3ee" stroke-width="1.6"/>' +
        '<ellipse class="helice" cx="6" cy="16" rx="7" ry="1.4" fill="#7fa3b0"/><ellipse class="helice" cx="40" cy="16" rx="7" ry="1.4" fill="#7fa3b0"/>' +
        '<rect x="13" y="18" width="20" height="13" rx="5" fill="#0d1a28" stroke="#46e3ee" stroke-width="1.6"/>' +
        '<ellipse class="olho" cx="19.5" cy="24" rx="1.6" ry="2.1" fill="#46e3ee"/><ellipse class="olho" cx="26.5" cy="24" rx="1.6" ry="2.1" fill="#46e3ee"/>' +
        '<path d="M17 31l-3 5M29 31l3 5" stroke="#46e3ee" stroke-width="1.3"/><rect x="19" y="31" width="8" height="6" rx="1.5" fill="#12283a" stroke="#46e3ee" stroke-width="1"/><circle cx="23" cy="34" r="1.8" fill="#ffb547"/>' +
        '<circle class="flash" cx="23" cy="34" r="9" fill="#ffffff"/></g>' +
      // portátil (à frente do corpo) e código a sair
      '<g class="f-pc"><rect x="11" y="31" width="24" height="11" rx="1.5" fill="#12283a" stroke="#46e3ee" stroke-width="1.3"/>' +
        '<circle cx="23" cy="36.5" r="1.6" fill="#ffb547"/><rect x="7" y="42" width="32" height="3" rx="1.2" fill="#46e3ee"/>' +
        '<text class="cod" x="31" y="10">{ }</text><text class="cod c2" x="2" y="12">&lt;/&gt;</text><text class="cod c3" x="33" y="20">01</text></g>' +
      // foguetão
      '<g class="f-foguete"><path class="fogo" d="M18 40q5 18 10 0z" fill="#ffb547"/><path class="fogo" d="M20.5 40q2.5 10 5 0z" fill="#fff3d6"/>' +
        '<path d="M15 29 7 43l8-4zM31 29l8 14-8-4z" fill="#ffb547"/>' +
        '<path d="M23 1c8 8 9 21 8 39H15c-1-18 0-31 8-39z" fill="#0d1a28" stroke="#46e3ee" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<circle cx="23" cy="19" r="5.5" fill="#06101a" stroke="#46e3ee" stroke-width="1.3"/>' +
        '<ellipse class="olho" cx="21" cy="19" rx="1.2" ry="1.6" fill="#46e3ee"/><ellipse class="olho" cx="25.2" cy="19" rx="1.2" ry="1.6" fill="#46e3ee"/>' +
        '<path d="M17 33h12" stroke="#46e3ee" stroke-width="1.2"/></g>' +
      // carro
      '<g class="f-carro"><path class="vento" d="M-9 30h7M-12 35h9M-8 40h6" stroke="#46e3ee" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="22" y1="23" x2="22" y2="16" stroke="#46e3ee" stroke-width="1.4"/><circle class="luz" cx="22" cy="15.5" r="2.2" fill="#ffb547"/>' +
        '<path d="M2 42v-6l7-11c1-1.5 2.5-2 4-2h17c2.5 0 4 1 5.5 3l3.5 5 4 1.5c1.2.5 2 1.5 2 3V42z" fill="#0d1a28" stroke="#46e3ee" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M11 31l3.5-5h15l4 5z" fill="#06101a" stroke="#46e3ee" stroke-width="1"/>' +
        '<ellipse class="olho" cx="19" cy="28.5" rx="1.6" ry="2" fill="#46e3ee"/><ellipse class="olho" cx="26" cy="28.5" rx="1.6" ry="2" fill="#46e3ee"/>' +
        '<circle cx="44" cy="35" r="1.4" fill="#ffb547"/>' +
        '<g class="roda"><circle cx="12" cy="43" r="5" fill="#12283a" stroke="#46e3ee" stroke-width="1.4"/><path d="M12 39v8M8 43h8" stroke="#46e3ee" stroke-width="1"/></g>' +
        '<g class="roda"><circle cx="35" cy="43" r="5" fill="#12283a" stroke="#46e3ee" stroke-width="1.4"/><path d="M35 39v8M31 43h8" stroke="#46e3ee" stroke-width="1"/></g></g>' +
      // bola de futebol, notas de música e zzz
      '<g class="f-bola"><g class="bola"><circle cx="46" cy="48.5" r="5.5" fill="#ffffff" stroke="#06101a" stroke-width=".9"/><path d="M46 45.2l2.6 1.9-1 3.1h-3.2l-1-3.1z" fill="#06101a"/></g></g>' +
      '<g class="f-notas"><text class="nota" x="38" y="12">♪</text><text class="nota n2" x="0" y="16">♫</text></g>' +
      '<g class="f-zz"><g class="vira"><text class="zz" x="34" y="12">z</text><text class="zz z2" x="38" y="8">z</text><text class="zz z3" x="42" y="4">Z</text></g></g>' +
      // fumo da transformação
      '<g class="fumo"><circle cx="15" cy="30" r="8" fill="#e4f3f7"/><circle cx="31" cy="26" r="9" fill="#e4f3f7"/><circle cx="23" cy="40" r="8" fill="#e4f3f7"/></g>' +
      '</svg></button>';
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
    aplicarRoupa(); buscarTempo(); setInterval(aplicarRoupa, 60000);
    setTimeout(function () {
      if (!el) return;
      var ola = guarda.get('bit-visto') ? (OLA[pagina] || OLA.index) : OLA.index;
      if (momento.oc === 'natal') ola = 'Ho ho ho! 🎅 ' + ola;
      else if (momento.oc === 'carnaval') ola = 'É Carnaval, ninguém leva a mal! 🎭 ' + ola;
      else if (momento.oc === 'halloween') ola = 'Doçura ou travessura? 🎃 ' + ola;
      else if (momento.futsal) ola = 'Quarta à noite é dia de futsal! ⚽ ' + ola;
      else if (momento.corrida) ola = 'Bom dia! Estou na corrida da manhã, como o Ricardo às 7h em Tomar 🏃 ' + ola;
      dizer(ola, 6500); guarda.set('bit-visto', '1');
    }, 1400);
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

  function mostrar(t, l, manter) {
    if (tq && !manter) acabarTruque(true);
    txt.textContent = t;
    if (l) { lig.textContent = l[0] + ' →'; lig.href = l[1]; lig.classList.add('on'); } else lig.classList.remove('on');
    el.classList.add('fala'); if (!(tq && manter)) { estado = 'parado'; el.classList.remove('andar'); } por();
  }
  function calar() {
    clearTimeout(tFala); if (!el) return;
    el.classList.remove('fala', 'conversa'); if (inp) inp.blur();
    if (tq) return;
    if (!parado) { estado = 'andar'; el.classList.add('andar'); ate = performance.now() + 6000 + Math.random() * 9000; }
  }
  function espera(ms) { clearTimeout(tFala); tFala = setTimeout(function () { if (el && document.activeElement !== inp) calar(); }, ms); }
  // fala curta (cumprimento ou dica espontânea), sem caixa de perguntas
  function dizer(t, ms, manter) { if (el.classList.contains('conversa')) return; mostrar(t, null, manter); espera(ms); }
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
    var nq = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var pedido = /satelit|orbita/.test(nq) ? 'satelite' : /drone|fotograf|tira uma foto/.test(nq) ? 'drone' : /segue|vem ca|anda ca|persegue/.test(nq) ? 'seguir' : /espreita|esconde-te/.test(nq) ? 'espreitar' : /titulo|sobe|trepa/.test(nq) ? 'titulo' : /golo|marca/.test(nq) ? 'golo' : /pipoca|filme|cinema/.test(nq) ? 'pipocas' : /foguet|rocket|voa/.test(nq) ? 'foguete' : /carro|conduz|guia/.test(nq) ? 'carro' : /danca|dancar|musica/.test(nq) ? 'danca' : /bola|futebol|futsal|golo/.test(nq) ? 'bola' : /pino|cambalhota|salto mortal|mortal/.test(nq) ? 'pino' : /dorme|dormir|sono/.test(nq) ? 'dormir' : /portatil|computador|programa|escreve/.test(nq) && /faz|mostra|vira|transforma|poe|pega|usa/.test(nq) ? 'pc' : /truque|transforma|magia/.test(nq) ? '' : null;
    if (pedido !== null && !parado) {
      inp.value = '';
      var frases = { satelite: 'A entrar em órbita… 🛰️', drone: 'Sorriam para a fotografia! 📸', seguir: 'Vou atrás de ti! Mexe o rato (ou toca no ecrã) 🐾', espreitar: 'Onde é que eu estou? 👀', titulo: 'Vou ver a página lá de cima! 🧗', golo: 'Vai… vai… ⚽', pipocas: 'Cinema! 🍿', danca: 'Música, maestro! 🎶', bola: 'Bola para a frente, rumo à baliza! ⚽', pino: 'Atenção… hop! 🤸', dormir: 'Uaaah… só cinco minutinhos. 😴', foguete: 'Contagem decrescente… 3, 2, 1… 🚀', carro: 'Vrum vrum! Apertem os cintos! 🚗', pc: 'Vou programar um bocadinho… tac tac tac 💻', '': 'Vê só esta! ✨' };
      conversa(frases[pedido], null, false);
      setTimeout(function () { calar(); if ((pedido === 'carro' || pedido === 'golo') && y < chao() - 4) { y = chao(); por(); } truque(pedido || undefined); }, 1300);
      return;
    }
    var r = responder(q);
    inp.value = '';
    if (r) conversa(r.r, r.l || null, false);
    else conversa('Hmm, isso ainda não sei responder. Sei falar de IA: tokens, prompts, agentes, automações, segurança, ferramentas… Experimenta uma destas:', null, true);
    el.classList.remove('salto'); void el.offsetWidth; el.classList.add('salto');
  }

  function passo(t) {
    if (!el) return;
    var dt = ultimo ? Math.min(60, t - ultimo) : 16; ultimo = t;
    if (estado === 'truque' && !document.hidden) { truquePasso(t, dt); por(); }
    else if (estado === 'andar' && !document.hidden) {
      var dx = ax - x, dy = ay - y, d = Math.sqrt(dx * dx + dy * dy), v = dt * (voa ? 0.06 : (momento.corrida ? 0.06 : 0.038));
      if (d <= v + 1) { x = ax; y = ay; alvo(); }
      else { x += (dx / d) * v; y += (dy / d) * v; if (Math.abs(dx) > 2) dir = dx > 0 ? 1 : -1; }
      if (!ate) ate = t + 7000 + Math.random() * 8000;
      if (t > ate) { // pausa para olhar à volta; de vez em quando dá uma dica sozinho
        ate = 0;
        var sorte = Math.random();
        if (sorte < 0.25) { iDica = (iDica + 1) % DICAS.length; dizer(DICAS[iDica], 5500); }
        else if (sorte < 0.6) truque();
        else { estado = 'parado'; el.classList.remove('andar'); setTimeout(function () { if (el && !tq && !el.classList.contains('fala')) { alvo(); estado = 'andar'; el.classList.add('andar'); } }, 1200 + Math.random() * 1800); }
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

  /* ---------- truques: foguetão, carro e portátil ---------- */
  function fumo() { if (!el) return; el.classList.remove('puff'); void el.offsetWidth; el.classList.add('puff'); }
  function truque(nome) {
    if (!el || parado || tq) return;
    var c = chao(), noChao = y >= c - 4;
    if (!nome) {
      var op = ['foguete', 'pc', 'danca', 'pino', 'satelite', 'drone', 'titulo', 'titulo', 'espreitar'];
      if (noChao) op.push('carro', 'carro', 'bola', 'bola');
      if (momento.futsal) op.push('golo', 'golo', 'golo');
      nome = op[Math.floor(Math.random() * op.length)];
    }
    if ((nome === 'carro' || nome === 'bola' || nome === 'golo') && !noChao) { y = c; por(); }
    var semFumo = { danca: 1, pino: 1, dormir: 1, bola: 1, golo: 1, acenar: 1, titulo: 1, espreitar: 1, seguir: 1, pipocas: 1 };
    estado = 'truque'; el.classList.remove('andar', 'voar');
    var cls = nome === 'golo' ? 't-bola' : nome === 'pipocas' ? 'ac-pipocas' : 't-' + nome;
    tq = { nome: nome, cls: cls, fase: 0, ini: performance.now() };
    if (nome === 'titulo' || nome === 'espreitar' || nome === 'seguir' || nome === 'pipocas') el.classList.add('voar');
    if (!semFumo[nome]) fumo();
    setTimeout(function () { if (el && tq && tq.nome === nome) el.classList.add(cls); }, semFumo[nome] ? 0 : 180);
  }
  function acabarTruque(rapido) {
    if (!el || !tq) return;
    var nome = tq.nome, cls = tq.cls; tq = null;
    var transforma = { foguete: 1, carro: 1, pc: 1, satelite: 1, drone: 1 }[nome];
    if (!rapido && transforma) fumo();
    el.classList.remove('t-festa', 'clique', 'voar');
    setTimeout(function () { if (el) el.classList.remove(cls); }, rapido || !transforma ? 0 : 160);
    if (y < 76) y = 76;
    if (x < 8) x = 8;
    if (!rapido) { estado = 'andar'; el.classList.add('andar'); alvo(); ate = performance.now() + 7000 + Math.random() * 8000; }
  }
  function truquePasso(t, dt) {
    var q = tq, W = Math.max(60, window.innerWidth - 54);
    if (!q) { estado = 'andar'; return; }
    var dentro = t - q.ini;
    var c = chao();
    function irPara(tx, ty, vel) { var dx = tx - x, dy = ty - y, d = Math.sqrt(dx * dx + dy * dy), v = dt * vel; if (Math.abs(dx) > 2) dir = dx > 0 ? 1 : -1; if (d <= v + 1) { x = tx; y = ty; return true; } x += dx / d * v; y += dy / d * v; return false; }
    if (q.nome === 'satelite') {
      var cx = W / 2, cy = (76 + c) / 2, R = Math.max(40, Math.min(W / 2 - 20, (c - 76) / 2 - 10));
      if (q.fase === 0) { q.fase = 1; q.a0 = Math.atan2(y - cy, x - cx); q.d0 = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)); }
      if (dentro < 300) return;
      var k = Math.min(1, (dentro - 300) / 1200), rr = q.d0 + (R - q.d0) * k, a = q.a0 + (dentro - 300) / 7000 * Math.PI * 2;
      x = cx + rr * Math.cos(a); y = cy + rr * Math.sin(a) * 0.8;
      if (dentro > 7300) acabarTruque();
      return;
    }
    if (q.nome === 'drone') {
      if (dentro < 300) return;
      if (!q.alvo || q.fase === 0) { q.alvo = [8 + Math.random() * (W - 8), 80 + Math.random() * Math.max(1, c - 80)]; q.fase = 1; }
      if (q.fase === 1 && irPara(q.alvo[0], q.alvo[1], 0.12)) { q.fase = 2; q.foto = t; el.classList.remove('clique'); void el.offsetWidth; el.classList.add('clique'); q.n = (q.n || 0) + 1; }
      if (q.fase === 2 && t - q.foto > 900) { if (q.n >= 3) acabarTruque(); else q.fase = 0; }
      return;
    }
    if (q.nome === 'titulo') {
      if (q.fase === 0) {
        var alvos = Array.prototype.filter.call(document.querySelectorAll('h1, h2, h3'), function (h) { var r = h.getBoundingClientRect(); return r.width > 60 && r.top > 140 && r.top < c - 20; });
        if (!alvos.length) { acabarTruque(); return; }
        q.h = alvos[Math.floor(Math.random() * alvos.length)]; q.dx = Math.random(); q.fase = 1;
      }
      var r = q.h.getBoundingClientRect(), tx = r.left + q.dx * Math.max(0, Math.min(r.width, 260) - 46), ty = r.top - 52;
      if (r.bottom < 60 || r.top > c + 40) { acabarTruque(); return; }
      if (q.fase === 1) { if (irPara(tx, ty, 0.1)) { q.fase = 2; q.chegou = t; el.classList.remove('voar'); } }
      else { x = tx; y = ty; if (t - q.chegou > 3500) acabarTruque(); }
      return;
    }
    if (q.nome === 'espreitar') {
      if (q.fase === 0) { q.fase = 1; q.lado = x < W / 2 ? -1 : 1; q.ty = 120 + Math.random() * Math.max(1, c - 200); }
      var tx2 = q.lado < 0 ? -26 : window.innerWidth - 20;
      if (q.fase === 1) { if (irPara(tx2, q.ty, 0.09)) { q.fase = 2; q.chegou = t; dir = -q.lado; el.classList.remove('voar'); el.classList.add('t-espreitar'); q.cls = 't-espreitar'; } }
      else if (t - q.chegou > 2600) { x = q.lado < 0 ? 8 : W; acabarTruque(); }
      return;
    }
    if (q.nome === 'seguir') {
      var px = Math.max(8, Math.min(W, rato.x - 23 + 30)), py = Math.max(76, Math.min(c, rato.y - 27 + 20));
      irPara(px, py, 0.14);
      if (dentro > 9000) acabarTruque();
      return;
    }
    if (q.nome === 'pipocas') {
      if (q.fase === 0) { q.fase = 1; q.tx = Math.max(8, W - 10); }
      if (q.fase === 1) { if (irPara(q.tx, c, 0.12)) { q.fase = 2; q.chegou = t; el.classList.remove('voar'); dir = -1; } }
      else if (t - q.chegou > 9000) acabarTruque();
      return;
    }
    if (q.nome === 'pc') { if (dentro > 4500) acabarTruque(); return; }
    if (q.nome === 'danca') { if (dentro > 3500) acabarTruque(); return; }
    if (q.nome === 'pino') { if (dentro > 1650) acabarTruque(); return; }
    if (q.nome === 'acenar') { if (dentro > 1800) acabarTruque(); return; }
    if (q.nome === 'dormir') return;                   // acorda quando alguém mexe na página
    if (q.nome === 'bola' || q.nome === 'golo') {
      if (q.fase === 0) { q.fase = 1; q.alvo = x < W / 2 ? W : 8; dir = q.alvo > x ? 1 : -1; }
      if (q.fase === 1) {
        x += dir * dt * 0.15;
        if ((dir > 0 && x >= q.alvo) || (dir < 0 && x <= q.alvo)) {
          x = q.alvo;
          if (q.nome === 'golo') { q.fase = 2; q.festa = t; el.classList.remove('t-bola'); q.cls = 't-festa'; el.classList.add('t-festa'); }
          else acabarTruque();
        }
      } else if (t - q.festa > 2000) acabarTruque();
      return;
    }
    if (q.nome === 'foguete') {
      if (dentro < 700) return;                       // aquecer os motores
      if (q.fase === 0) { y -= dt * 0.38; if (y < -80) { q.fase = 1; x = 8 + Math.random() * (W - 8); y = -80; q.alvo = 90 + Math.random() * Math.max(1, chao() - 90); } }
      else { y += dt * 0.22; if (y >= q.alvo) { y = q.alvo; acabarTruque(); } }
      return;
    }
    if (q.nome === 'carro') {
      if (q.fase === 0) { q.fase = 1; q.alvo = x < W / 2 ? W : 8; dir = q.alvo > x ? 1 : -1; }
      if (dentro < 400) return;
      x += dir * dt * 0.24;
      if ((dir > 0 && x >= q.alvo) || (dir < 0 && x <= q.alvo)) { x = q.alvo; acabarTruque(); }
    }
  }

  function remover() { cancelAnimationFrame(raf); clearTimeout(tFala); if (el) el.remove(); el = null; }
  function botaoVoltar() {
    var b = document.createElement('button'); b.id = 'bit-volta'; b.type = 'button'; b.textContent = '🤖';
    b.setAttribute('aria-label', 'Mostrar o Bit, a mascote do site'); b.title = 'Mostrar o Bit';
    b.onclick = function () { guarda.set('bit-escondido', ''); b.remove(); criar(); };
    document.body.appendChild(b);
  }
  window.addEventListener('resize', function () { if (el) { x = Math.min(x, Math.max(8, window.innerWidth - 54)); y = parado ? chao() : Math.min(y, chao()); ax = Math.min(ax, Math.max(8, window.innerWidth - 54)); ay = Math.min(ay, chao()); por(); } });

  // adormece ao fim de 45 s sem ninguém mexer na página; acorda (e acena) com o primeiro movimento
  var ultimaAtividade = Date.now(), rato = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  function atividade(e) {
    if (e && e.clientX != null && (e.type === 'pointermove' || e.type === 'pointerdown')) { rato.x = e.clientX; rato.y = e.clientY; }
    ultimaAtividade = Date.now();
    if (el && tq && tq.nome === 'dormir') { acabarTruque(true); estado = 'parado'; tq = null; truque('acenar'); }
  }
  ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, atividade, { passive: true }); });
  setInterval(function () {
    if (!el || parado || tq || el.classList.contains('fala') || document.hidden) return;
    if (Date.now() - ultimaAtividade > 45000) { if (y < chao() - 4) { y = chao(); por(); } truque('dormir'); }
  }, 5000);

  // ao abrir um vídeo, o Bit vem ver também, com pipocas
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.screen[data-yt]');
    if (!a || !el || parado) return;
    if (tq) acabarTruque(true);
    if (el.classList.contains('conversa')) calar();
    estado = 'parado'; truque('pipocas');
    setTimeout(function () { if (el && tq && tq.nome === 'pipocas') dizer('Bom filme! Eu trouxe as pipocas 🍿', 3500, true); }, 1500);
  }, true);

  function arrancar() { if (guarda.get('bit-escondido') === '1') botaoVoltar(); else criar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
