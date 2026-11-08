-- =====================================================================
-- Todas as vezes que pensei em você — esquema do banco (Supabase/Postgres)
-- Execute no SQL Editor do Supabase. É idempotente: pode ser executado de novo.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Administradores: apenas usuários listados aqui podem escrever.
-- Depois de criar seu usuário em Authentication > Users, rode:
--   insert into public.admins (user_id) values ('<seu-user-id>');
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Tabelas de conteúdo
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.letter (
  id smallint primary key default 1 check (id = 1),
  title text not null default '',
  greeting text not null default '',
  body text not null default '',
  closing text not null default '',
  signature text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  position int not null default 0
);

create table if not exists public.thoughts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_special boolean not null default false,
  photo_url text,
  photo_alt text,
  audio_url text,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  story text not null default '',
  feeling text not null default '',
  date date,
  date_label text,
  location text,
  media_kind text check (media_kind in ('image', 'video')),
  media_url text,
  poster_url text,
  media_alt text,
  audio_url text,
  layout text not null default 'wide' check (layout in ('wide', 'tall', 'square')),
  position int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_special boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.details (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  note text,
  position int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published'))
);

create table if not exists public.future_fragments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null default '',
  media_kind text check (media_kind in ('image', 'video')),
  media_url text,
  poster_url text,
  media_alt text,
  position int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published'))
);

create index if not exists thoughts_status_created_idx on public.thoughts (status, created_at desc);
create index if not exists memories_status_position_idx on public.memories (status, position);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Visitantes: apenas leitura do que está publicado.
-- Administradores: leitura e escrita completas.
-- ---------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.letter enable row level security;
alter table public.categories enable row level security;
alter table public.thoughts enable row level security;
alter table public.memories enable row level security;
alter table public.details enable row level security;
alter table public.future_fragments enable row level security;

drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated using (user_id = auth.uid());
-- Nenhuma política de escrita em admins: só pelo SQL Editor (service role).

-- Tabelas sempre públicas para leitura
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'letter', 'categories'] loop
    execute format('drop policy if exists "%1$s_public_read" on public.%1$I', t);
    execute format('create policy "%1$s_public_read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$I', t);
    execute format('create policy "%1$s_admin_write" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Tabelas com rascunhos: o público só lê o que está publicado
do $$
declare t text;
begin
  foreach t in array array['thoughts', 'memories', 'details', 'future_fragments'] loop
    execute format('drop policy if exists "%1$s_public_read" on public.%1$I', t);
    execute format('create policy "%1$s_public_read" on public.%1$I for select to anon, authenticated using (status = ''published'' or public.is_admin())', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$I', t);
    execute format('create policy "%1$s_admin_write" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Armazenamento: bucket público para leitura; escrita só para admins.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 524288000) -- 500 MB por arquivo (ajuste ao seu plano)
on conflict (id) do update set public = excluded.public;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------
-- Linhas únicas iniciais (o painel preenche o conteúdo)
-- ---------------------------------------------------------------------
insert into public.site_settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;
insert into public.letter (id) values (1) on conflict (id) do nothing;
