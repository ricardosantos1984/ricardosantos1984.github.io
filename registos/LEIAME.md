# Registos de Trabalho

App para organizar o trabalho: ocorrências, calendário com avisos, clientes e contactos,
senhas de clientes, links de acesso e pastas de trabalho. Sincroniza entre computadores.

- **Endereço:** https://ricardosantos1984.github.io/registos/
- **Dados:** Supabase (mesmo projeto da "A Nossa Casa"), tabela `registos_cofre`.
- **Segurança:** tudo é encriptado no computador (AES-256, chave derivada da senha mestra
  com PBKDF2) antes de ir para a cloud. Sem a senha mestra, os dados não se recuperam.

## Configurar (uma vez)
1. Supabase → SQL Editor → colar `registos.sql` → Run.
2. Abrir o endereço no Microsoft Edge, entrar com a conta da casa e criar a senha mestra.

## Instalar em cada computador
Edge → abrir o endereço → menu `…` → **Aplicações** → **Instalar este site como uma aplicação**.
Fica com ícone no Menu Iniciar e abre em janela própria.

## Sincronização
Cada alteração é enviada logo; o outro PC verifica a cada 30 s (e quando a janela volta a ter foco).
Se os dois PCs alterarem ao mesmo tempo, as alterações são juntas registo a registo.
Sem internet, a app continua a funcionar e envia tudo quando a ligação voltar.
