TÜRKÇE YAMALAR v25 - GERÇEK ÜYELİK / ADMIN KURULUMU

1) https://supabase.com üzerinden ücretsiz bir proje oluştur.
2) Supabase paneli > SQL Editor > New query bölümüne "supabase-schema.sql" dosyasının TAMAMINI yapıştır ve RUN de.
3) Project Settings > API bölümüne gir.
   - Project URL değerini kopyala.
   - anon / public key değerini kopyala.
4) Sitedeki "supabase-config.js" dosyasını aç ve şu iki değeri değiştir:
   url: "PASTE_SUPABASE_PROJECT_URL_HERE"
   anonKey: "PASTE_SUPABASE_ANON_KEY_HERE"
5) Siteyi GitHub Pages / Cloudflare Pages'a yükle.
6) Siteden kendi hesabını normal şekilde Kayıt Ol ile oluştur.
7) Supabase > SQL Editor'da şu komutu kendi e-postanla çalıştır:
   update public.profiles set role='admin' where id=(select id from auth.users where email='SENIN_EPOSTAN@example.com');
8) Çıkış yapıp tekrar giriş yap. Üst menüde "Admin" butonu gözükecek.

İNDİRME SAYACI:
- Bu sürümde kişisel bilgi tutmayan toplam indirme sayacı eklendi.
- Supabase kurulumunu daha önce yaptıysan güncel "supabase-schema.sql" dosyasının
  tamamını SQL Editor'da tekrar RUN et. "if not exists" komutları mevcut üyeleri
  ve yorumları silmeden yalnızca eksik sayaç tablosu ile fonksiyonları ekler.

ADMIN PANELİNDE:
- Üyeleri ve e-postalarını görürsün.
- 24 saat susturabilirsin.
- Banlayabilir / banı kaldırabilirsin.
- Yorumları silebilirsin.

PROFİL:
- Kullanıcı adı ve profil fotoğrafı URL'si değiştirilebilir.
- Kullanıcının kendi yorum geçmişi görünür.

GÜVENLİK:
- Şifreler site dosyalarında tutulmaz; Supabase Auth yönetir.
- service_role anahtarını ASLA siteye koyma.
- Sitede sadece anon/public key kullanılır; yetkiler RLS ve güvenli RPC fonksiyonlarıyla sınırlandırılmıştır.
