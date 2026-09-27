-- Supabase > SQL Editor içinde çalıştır. E-posta adresini kendi kayıtlı adresinle değiştir.
-- Bu sorgu yalnızca belirtilen hesaba admin rolü verir; sıfır satır dönüyorsa e-posta eşleşmemiştir.
with hesap as (
  select id, email, coalesce(nullif(raw_user_meta_data->>'display_name',''), split_part(email,'@',1), 'Kullanıcı') as ad
  from auth.users
  where lower(email)=lower('BURAYA_KAYITLI_EPOSTANI_YAZ')
)
insert into public.profiles(id,display_name,role)
select id,ad,'admin' from hesap
on conflict (id) do update set role='admin'
returning id,display_name,role;
