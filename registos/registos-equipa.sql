-- =====================================================================
--  Registos de Trabalho — EQUIPA + CHAT
--  Colar tudo no SQL Editor do Supabase e carregar em "Run".
--  Pode correr-se mais de uma vez sem problema. Não mexe nas tabelas da casa.
--
--  • Membros da equipa (quem pode entrar e o nome que aparece no chat)
--  • Cofre partilhado pela equipa (dono = 'equipa')
--  • Mensagens do chat (encriptadas no computador com a senha mestra)
--
--  Para acrescentar alguém mais tarde: criar a conta em Authentication → Users
--  e juntar uma linha no insert abaixo (email, nome). Depois correr de novo.
-- =====================================================================

-- 1) Membros da equipa
create table if not exists public.registos_membros (
  email text primary key,
  nome  text not null
);

insert into public.registos_membros (email, nome) values
  ('ricardo@intranet.pt', 'Ricardo'),
  ('info@intranet.pt',    'Nuno')
on conflict (email) do update set nome = excluded.nome;

create or replace function public.registos_e_membro() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.registos_membros
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.registos_membros enable row level security;
drop policy if exists "membros veem a equipa" on public.registos_membros;
create policy "membros veem a equipa" on public.registos_membros
  for select to authenticated using (public.registos_e_membro());
revoke all on public.registos_membros from anon;
grant select on public.registos_membros to authenticated;

-- 2) Cofre partilhado pela equipa
create or replace function public.registos_tocar() returns trigger
language plpgsql as $$
begin
  new.atualizado_em := now();
  if coalesce(new.dono, '') = '' then
    new.dono := lower(coalesce(auth.jwt() ->> 'email', ''));
  end if;
  return new;
end $$;

drop policy if exists "cada um gere o seu cofre" on public.registos_cofre;
drop policy if exists "cofre da equipa" on public.registos_cofre;
create policy "cofre da equipa" on public.registos_cofre
  for all to authenticated
  using      (dono = lower(auth.jwt() ->> 'email') or (dono = 'equipa' and public.registos_e_membro()))
  with check (dono = lower(auth.jwt() ->> 'email') or (dono = 'equipa' and public.registos_e_membro()));

-- dados criados antes da equipa existir (conta info@intranet.pt) passam a ser da equipa
update public.registos_cofre set dono = 'equipa'
where dono = 'info@intranet.pt'
  and not exists (select 1 from public.registos_cofre where dono = 'equipa');

-- 3) Mensagens do chat
create table if not exists public.registos_mensagens (
  id        uuid primary key default gen_random_uuid(),
  autor     text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  dados     jsonb not null,
  criado_em timestamptz not null default now()
);
create index if not exists registos_mensagens_criado_idx on public.registos_mensagens (criado_em);

create or replace function public.registos_msg_autor() returns trigger
language plpgsql as $$
begin
  new.autor := lower(coalesce(auth.jwt() ->> 'email', new.autor));
  new.criado_em := now();
  return new;
end $$;

drop trigger if exists registos_mensagens_autor on public.registos_mensagens;
create trigger registos_mensagens_autor before insert on public.registos_mensagens
  for each row execute function public.registos_msg_autor();

alter table public.registos_mensagens enable row level security;
drop policy if exists "equipa le mensagens" on public.registos_mensagens;
drop policy if exists "equipa envia mensagens" on public.registos_mensagens;
drop policy if exists "autor apaga mensagens" on public.registos_mensagens;
create policy "equipa le mensagens" on public.registos_mensagens
  for select to authenticated using (public.registos_e_membro());
create policy "equipa envia mensagens" on public.registos_mensagens
  for insert to authenticated with check (public.registos_e_membro() and autor = lower(auth.jwt() ->> 'email'));
create policy "autor apaga mensagens" on public.registos_mensagens
  for delete to authenticated using (autor = lower(auth.jwt() ->> 'email'));
revoke all on public.registos_mensagens from anon;
grant select, insert, delete on public.registos_mensagens to authenticated;

-- mensagens em tempo real
do $$
begin
  alter publication supabase_realtime add table public.registos_mensagens;
exception when duplicate_object then null;
          when undefined_object then null;
end $$;

notify pgrst, 'reload schema';
