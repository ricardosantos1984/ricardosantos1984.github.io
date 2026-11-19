# Registos de Trabalho

App para organizar o trabalho: ocorrências, calendário com avisos, clientes e contactos,
senhas de clientes, links de acesso e pastas de trabalho. Sincroniza entre computadores.

- **Endereço:** https://ricardosantos1984.github.io/registos/
- **Dados:** Supabase (mesmo projeto da "A Nossa Casa"), tabela `registos_cofre`.
- **Segurança:** tudo é encriptado no computador (AES-256, chave derivada da senha mestra
  com PBKDF2) antes de ir para a cloud. Sem a senha mestra, os dados não se recuperam.

## Configurar (uma vez)
1. Supabase → SQL Editor → correr `registos.sql` e depois `registos-equipa.sql`.
2. Supabase → Authentication → Users → criar as contas da equipa (Auto Confirm):
   `ricardo@intranet.pt` (Ricardo) e `nuno@intranet.pt` (Nuno).
3. O primeiro a entrar cria a senha mestra; o outro usa a mesma senha mestra.

## Equipa e chat
- Cada pessoa entra com a sua conta; os registos são partilhados pela equipa.
- Chat da equipa com mensagens encriptadas, em tempo real, com notificação do Windows.
- Novas ocorrências ficam com o técnico preenchido automaticamente.
- Acrescentar alguém: criar a conta no Supabase e juntar (email, nome) ao insert de `registos-equipa.sql`.

## Instalar em cada computador
Edge → abrir o endereço → menu `…` → **Aplicações** → **Instalar este site como uma aplicação**.
Fica com ícone no Menu Iniciar e abre em janela própria.

## Sincronização
Cada alteração é enviada logo; o outro PC verifica a cada 30 s (e quando a janela volta a ter foco).
Se os dois PCs alterarem ao mesmo tempo, as alterações são juntas registo a registo.
Sem internet, a app continua a funcionar e envia tudo quando a ligação voltar.
