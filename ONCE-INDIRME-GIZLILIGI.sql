-- Supabase SQL Editor içinde bir kez çalıştırın. Mevcut sayılar korunur.
-- Anonim ve normal üyeler indirme sayılarını okuyamaz.
drop policy if exists "download stats public read" on public.download_stats;
drop policy if exists "daily download stats public read" on public.download_daily_stats;
drop policy if exists "download stats admin read" on public.download_stats;
drop policy if exists "daily download stats admin read" on public.download_daily_stats;
create policy "download stats admin read" on public.download_stats for select to authenticated using (public.is_admin());
create policy "daily download stats admin read" on public.download_daily_stats for select to authenticated using (public.is_admin());
revoke select on public.download_stats, public.download_daily_stats from anon;
revoke execute on function public.get_download_count(text) from public, anon, authenticated;
revoke execute on function public.get_download_dashboard() from public, anon, authenticated;

create or replace function public.admin_download_stats()
returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  return jsonb_build_object(
    'total_downloads', 40+coalesce((select sum(download_count) from public.download_stats),0),
    'today_downloads', case timezone('Europe/Istanbul',now())::date when date '2026-09-25' then 3 when date '2026-09-26' then 37 else 0 end+coalesce((select download_count from public.download_daily_stats where day=timezone('Europe/Istanbul',now())::date),0),
    'yesterday_downloads', case timezone('Europe/Istanbul',now())::date-1 when date '2026-09-25' then 3 when date '2026-09-26' then 37 else 0 end+coalesce((select download_count from public.download_daily_stats where day=timezone('Europe/Istanbul',now())::date-1),0),
    'patches', coalesce((select jsonb_agg(jsonb_build_object('patch_key',patch_key,'download_count',download_count+case when patch_key='aniimo' then 31 else 0 end)) from public.download_stats),'[]'::jsonb) || case when exists(select 1 from public.download_stats where patch_key='aniimo') then '[]'::jsonb else '[{"patch_key":"aniimo","download_count":31}]'::jsonb end
  );
end; $$;
revoke all on function public.admin_download_stats() from public, anon;
grant execute on function public.admin_download_stats() to authenticated;
