# 🔄 Monster ASP.NET - SQL Query Rehberi

## ⚡ HIZLI YÖNTEM

### 1. **Tek Satır** (Önerilen)

`monster-simple.sql` dosyasını açın, tüm satırı kopyalayın ve SQL panel-ine yapıştırın.

### 2. **Detaylı Versiyon**

`monster-query.sql` dosyasını açın, tüm scripti kopyalayın ve çalıştırın.

---

## 🚀 NASIL ÇALIŞTIRILIR?

### Yöntem 1: SQL Panel

1. **Monster panel** → **SQL** veya **Database** bölümüne gidin
2. **"Query"** veya **"SQL Command"** sekmesine tıklayın
3. `monster-query.sql` dosyasındaki kodu kopyalayın
4. Yapıştırın ve **"Execute"** veya **"Run"** butonuna tıklayın
5. **Application → Restart** yapın

### Yöntem 2: SQL Server Management Studio

1. SSMS açın
2. Monster server-ine connect edin
3. `monster-query.sql` dosyasını açın
4. Execute (F5) edin
5. **Application → Restart** yapın

---

## 📋 NE YAPAR?

- ✅ Tüm verileri siler
- ✅ Admin user korunur
- ✅ Tablolar korunur
- ✅ DROP komutu kullanmaz
- ✅ Güvenli

---

## ⚠️ DİKKAT!

Bu query çalıştıktan sonra:

1. **Application → Restart** YAPMALISINIZ
2. Seed data otomatik yüklenecek (30 saniye)
3. Database boş ise seed data gelir
4. Database dolu ise seed data gelmez

---

## 🔍 DOĞRULAMA

Query çalıştırdıktan ve restart ettikten sonra:

```sql
-- User sayısını kontrol edin
SELECT COUNT(*) FROM Users;  -- 50 olmalı

-- Experience sayısını kontrol edin  
SELECT COUNT(*) FROM Experiences;  -- 30-60 arası olmalı

-- Status sayısını kontrol edin
SELECT COUNT(*) FROM Statuses;  -- 15-50 arası olmalı
```

---

## 🎯 STEP-BY-STEP

### 1. SQL Query Çalıştır
```
monster-query.sql dosyasını aç
Kodu kopyala
SQL panel-ine yapıştır
Execute et
```

### 2. Application Restart
```
Monster panel → Application → Stop
10 saniye bekle
Application → Restart
```

### 3. Bekle (30 saniye)
```
Seed data yükleniyor...
Terminal log-larında göreceksiniz:
- ✅ Created 50 users
- ✅ Created 30-60 experiences
- ✅ Created 15-50 status stories
- ✅ Created 100+ comments
```

### 4. Test Et
```
GET /api/users
GET /api/experiences
GET /api/status
```

---

## 🔐 LOGIN

```
Email: admin@wanderly.com
Password: Admin123!
```

---

## 📊 SEED DATA

Query çalıştıktan ve restart ettikten sonra:

| Data | Adet |
|------|------|
| Users | 50 (admin dahil) |
| Experiences | 30-60 |
| Experiences with videos | ~15-18 |
| Status/Stories | 15-50 |
| Comments | 100+ |
| Tags | 40 |

---

## ❓ SORUN YAŞIYORSANIZ

### Seed data yüklenmedi:
1. Database boş değilse → Query tekrar çalıştırın
2. Connection string kontrol edin
3. Application log-larını kontrol edin

### SQL query hatası:
- Foreign key hatası → Foreign key'leri geçici disable edin
- Syntax error → Query'yi doğru kopyaladığınızdan emin olun

---

## ✅ BAŞARILI

Query başarıyla çalıştıysa:
- ✅ Tüm veriler silindi
- ✅ Admin user korundu
- ✅ Application restart yapıldı
- ✅ Seed data yüklendi

**Seed data yüklenmesi:**
- 50 users
- 30-60 experiences (bazılarında video)
- 15-50 status stories
- 100+ comments
- Realistic likes, follows, notifications

---

**Uğurlar!** 🎉

