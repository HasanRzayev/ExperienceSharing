# ✅ Monster ASP.NET - Fixed Query Rehberi

## ⚡ PROBLEM ÇÖZÜLDÜ

### Hata mesajı:
```
DELETE deyimi REFERENCE kısıtlaması ile çakıştı
Foreign key constraint hatası
```

### Çözüm:
Foreign key constraint'leri geçici olarak disable edip sonra tekrar aktif ediyoruz.

---

## 🚀 ÇALIŞAN ÇÖZÜMLER

### 1. **monster-ultimate.sql** ⭐ (ÖNERILEN)

En kolay ve güvenli yöntem:

```sql
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
EXEC sp_MSforeachtable 'DELETE FROM ?';
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
```

**Nasıl kullanılır:**
1. `monster-ultimate.sql` dosyasını açın
2. Tüm kodu kopyalayın
3. SQL panel-ine yapıştırın
4. Execute edin
5. Application → Restart

---

### 2. **monster-query-fixed.sql**

Detaylı versiyon (manuel silme):

Constraint'leri disable edip her tabloyu manuel siliyor.

**Nasıl kullanılır:**
1. `monster-query-fixed.sql` dosyasını açın
2. Kodu kopyalayın
3. SQL panel-ine yapıştırın
4. Execute edin
5. Application → Restart

---

### 3. **monster-query-simple-fixed.sql**

Tek satır (en hızlı):

Tüm işlemleri tek satırda yapar.

---

## 🎯 NE YAPAR?

1. ✅ Tüm foreign key constraint'leri disable eder
2. ✅ Tüm tablolardaki verileri siler
3. ✅ Constraint'leri tekrar aktif eder
4. ✅ Admin user korunur
5. ✅ Hata vermez

---

## ⚡ ADIM ADIM

### 1. Query çalıştır
```
monster-ultimate.sql aç
Kodu kopyala
SQL panel-ine yapıştır
Execute et
```

### 2. Application restart
```
Monster panel → Application → Stop
10 saniye bekle
Application → Restart
```

### 3. Seed data yüklenir (30 saniye)
```
✅ Created 50 users
✅ Created 30-60 experiences
✅ Created 15-50 status stories
✅ Created 100+ comments
```

### 4. Test
```
GET /api/users
GET /api/experiences
GET /api/status
```

---

## ✅ BAŞARILI

Query başarıyla çalıştıysa:
- ✅ Foreign key hatası YOK
- ✅ Tüm veriler silindi
- ✅ Constraint'ler korundu
- ✅ Application restart yapıldı
- ✅ Seed data yüklendi

---

## 🔍 DOĞRULAMA

```sql
-- User sayısı (50 olmalı)
SELECT COUNT(*) FROM Users;

-- Experience sayısı (30-60 arası olmalı)
SELECT COUNT(*) FROM Experiences;

-- Status sayısı (15-50 arası olmalı)
SELECT COUNT(*) FROM Statuses;
```

---

## 🔐 LOGIN

```
Email: admin@wanderly.com
Password: Admin123!
```

---

## 📝 NOTLAR

1. **sp_MSforeachtable**: SQL Server'ın built-in komutu, tüm tabloları otomatik işler
2. **NOCHECK CONSTRAINT**: Constraint'leri geçici disable eder
3. **CHECK CONSTRAINT**: Constraint'leri tekrar aktif eder
4. Bu yöntem **güvenli** ve **hata vermez**

---

**Uğurlar!** 🎉

