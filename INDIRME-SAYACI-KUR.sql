create table if not exists public.download_stats (
  patch_key text primary key check (patch_key ~ '^[a-z0-9-]{1,80}$'),
  download_count bigint not null default 0 check (download_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_daily_stats (
  day date primary key,
  download_count bigint not null default 0 check (download_count >= 0)
);

alter table public.download_stats enable row level security;
alter table public.download_daily_stats enable row level security;

drop policy if exists "download stats public read" on public.download_stats;
create policy "download stats public read" on public.download_stats for select using (true);

drop policy if exists "daily download stats public read" on public.download_daily_stats;
create policy "daily download stats public read" on public.download_daily_stats for select using (true);

create or replace function public.register_download(p_patch_key text)
returns bigint language plpgsql security definer set search_path=public as $$
declare new_count bigint;
begin
  if p_patch_key is null or p_patch_key !~ '^[a-z0-9-]{1,80}$' then
    raise exception 'invalid patch key';
  end if;
  insert into public.download_stats(patch_key,download_count,updated_at)
  values(p_patch_key,1,now())
  on conflict(patch_key) do update
    set download_count=public.download_stats.download_count+1, updated_at=now()
  returning download_count into new_count;
  insert into public.download_daily_stats(day,download_count)
  values(timezone('Europe/Istanbul',now())::date,1)
  on conflict(day) do update
    set download_count=public.download_daily_stats.download_count+1;
  return new_count;
end; $$;
grant execute on function public.register_download(text) to anon, authenticated;

create or replace function public.get_download_count(p_patch_key text)
returns bigint language sql stable security definer set search_path=public as $$
  select coalesce((select download_count from public.download_stats where patch_key=p_patch_key),0);
$$;
grant execute on function public.get_download_count(text) to anon, authenticated;

create or replace function public.get_download_dashboard()
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'total_downloads', coalesce((select sum(download_count) from public.download_stats),0),
    'today_downloads', coalesce((select download_count from public.download_daily_stats where day=timezone('Europe/Istanbul',now())::date),0),
    'yesterday_downloads', coalesce((select download_count from public.download_daily_stats where day=timezone('Europe/Istanbul',now())::date-1),0)
  );
$$;
grant execute on function public.get_download_dashboard() to anon, authenticated;


grant select on public.download_stats, public.download_daily_stats to anon, authenticated;
