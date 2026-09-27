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
    'star-wars-outlaws','cuphead','rpcs3','aniimo-android','naruto-ultimate-ninja-impact','mindseye','silent-hill-townfall',
    'prince-of-persia-the-lost-crown'
  ]) then
    raise exception 'invalid page key';
  end if;
  insert into public.page_views(page_key,view_count) values(p_page_key,1)
  on conflict(page_key) do update set view_count=public.page_views.view_count+1;
end; $$;
revoke all on function public.register_page_view(text) from public;
grant execute on function public.register_page_view(text) to anon, authenticated;
