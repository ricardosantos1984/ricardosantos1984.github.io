-- =====================================================================
--  Registos de Trabalho — tabela no Supabase (mesmo projeto da "A Nossa Casa")
--  Colar tudo no SQL Editor do Supabase e carregar em "Run".
--  Pode correr-se mais de uma vez sem problema. Não mexe nas tabelas da casa.
--
--  Cada pessoa tem UMA linha com o seu cofre, já encriptado no computador
--  (AES-256 com a senha mestra). O Supabase só guarda texto ilegível.
--  Regras de segurança: cada conta só vê e altera o seu próprio cofre.
-- =====================================================================

create table if not exists public.registos_cofre (
  dono          text primary key default lower(coalesce(auth.jwt() ->> 'email', '')),
  dados         jsonb not null,
  versao        integer not null default 1,
  atualizado_em timestamptz not null default now()
);

create or replace function public.registos_tocar() returns trigger
language plpgsql as $$
begin
  new.atualizado_em := now();
  new.dono := lower(coalesce(auth.jwt() ->> 'email', new.dono));
  return new;
end $$;

drop trigger if exists registos_cofre_tocar on public.registos_cofre;
create trigger registos_cofre_tocar before insert or update on public.registos_cofre
  for each row execute function public.registos_tocar();

alter table public.registos_cofre enable row level security;

drop policy if exists "cada um gere o seu cofre" on public.registos_cofre;
create policy "cada um gere o seu cofre" on public.registos_cofre
  for all to authenticated
  using (dono = lower(auth.jwt() ->> 'email'))
  with check (dono = lower(auth.jwt() ->> 'email'));

revoke all on public.registos_cofre from anon;
grant select, insert, update, delete on public.registos_cofre to authenticated;
