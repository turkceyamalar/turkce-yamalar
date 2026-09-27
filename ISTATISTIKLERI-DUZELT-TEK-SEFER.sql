-- Supabase SQL Editor: tamamını tek seferde çalıştırın. Mevcut sayaç kayıtları korunur.
BEGIN;

create table if not exists public.download_stats (
  patch_key text primary key check (patch_key ~ '^[a-z0-9-]{1,80}$'),
  download_count bigint not null default 0 check (download_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_daily_stats (
  day date primary key,
  download_count bigint not null default 0 check (download_count >= 0)
);


-- Supabase > SQL Editor içinde bir kez çalıştırın. Bu sayaç yeni kurulumdan itibaren başlar.
create table if not exists public.page_views (
  page_key text primary key check (page_key ~ '^[a-z0-9-]{1,80}$'),
  view_count bigint not null default 0 check (view_count >= 0)
);
alter table public.page_views enable row level security;
drop policy if exists "page views public read" on public.page_views;
create policy "page views public read" on public.page_views for select to anon, authenticated using (true);
grant select on public.page_views to anon, authenticated;

create or replace function public.register_page_view(p_page_key text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_page_key is null or p_page_key <> all(array[
    'aniimo','gta-5','shadow-of-the-tomb-raider','red-dead-redemption-2',
    'resident-evil-4-remake','resident-evil-2-remake','resident-evil-village',
    'beast-of-reincarnation','gothic-1-remake','mortal-shell-2',
    'star-wars-outlaws','cuphead','ppsspp','rpcs3','aniimo-android','naruto-ultimate-ninja-impact','mindseye','silent-hill-townfall',
    'prince-of-persia-the-lost-crown'
  ]) then
    raise exception 'invalid page key';
  end if;
  insert into public.page_views(page_key,view_count) values(p_page_key,1)
  on conflict(page_key) do update set view_count=public.page_views.view_count+1;
end; $$;
revoke all on function public.register_page_view(text) from public;
grant execute on function public.register_page_view(text) to anon, authenticated;

create or replace function public.public_site_stats()
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'total_views', coalesce((select sum(view_count) from public.page_views),0),
    'total_downloads', 40+coalesce((select sum(download_count) from public.download_stats),0),
    'today_downloads', case timezone('Europe/Istanbul',now())::date when date '2026-09-25' then 3 when date '2026-09-26' then 37 else 0 end+coalesce((select download_count from public.download_daily_stats where day=timezone('Europe/Istanbul',now())::date),0),
    'yesterday_downloads', case timezone('Europe/Istanbul',now())::date-1 when date '2026-09-25' then 3 when date '2026-09-26' then 37 else 0 end+coalesce((select download_count from public.download_daily_stats where day=timezone('Europe/Istanbul',now())::date-1),0),
    'patches', coalesce((select jsonb_object_agg(patch_key,download_count+case when patch_key='aniimo' then 31 else 0 end) from public.download_stats),'{}'::jsonb) || case when exists(select 1 from public.download_stats where patch_key='aniimo') then '{}'::jsonb else '{"aniimo":31}'::jsonb end
  );
$$;
revoke all on function public.public_site_stats() from public;
grant execute on function public.public_site_stats() to anon, authenticated;

COMMIT;
