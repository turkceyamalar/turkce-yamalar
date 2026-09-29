-- Supabase SQL Editor'da bir kez çalıştırın. Mevcut toplamlar korunur.
-- Geçmiş günlere ait eksik kayıtlar geri üretilemez; yeni tıklamalar İstanbul gününe yazılır.
create table if not exists public.download_daily_stats (
  day date primary key,
  download_count bigint not null default 0 check (download_count >= 0)
);
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
  values((now() at time zone 'Europe/Istanbul')::date,1)
  on conflict(day) do update
    set download_count=public.download_daily_stats.download_count+1;
  return new_count;
end; $$;
revoke all on function public.register_download(text) from public;
grant execute on function public.register_download(text) to anon, authenticated;
