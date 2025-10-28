# 🔄 Database Sıfırlama Qaydası (Türkçe)

## ⭐ Önerilen: Güvenli Scripts (DROP DATABASE yok)

### **reset-database-safe.sql** - EN GÜVENLİ ⭐

```sql
-- Güvenli veri temizleme, DROP komutu kullanmaz
-- Tüm IDE'lerde çalışır
```

**Avantajları:**
- ✅ DROP DATABASE kullanmaz
- ✅ Tüm IDE'lerde çalışır  
- ✅ Tüm verileri temizler
- ✅ Admin user korunur
- ✅ Güvenli ve hızlı

**Nasıl kullanılır:**
1. SQL Server Management Studio açın
2. `reset-database-safe.sql` faylını açın
3. Execute edin (F5)
4. Application-i restart edin
5. Seed data avtomatik yüklənəcək

---

### **reset-database-truncate.sql** - Hızlı temizleme

```sql
-- TRUNCATE ile tüm tabloları temizler
-- Daha hızlı
```

**Necə işlədək:**
1. SQL Server Management Studio açın
2. `reset-database-truncate.sql` faylını açın
3. Execute edin (F5)
4. Application-i restart edin
5. Seed data avtomatik yüklənəcək

---

### **reset-database-data-only.sql** - DELETE ile

```sql
-- DELETE komutlarıyla verileri siler
-- Esnek ve güvenli
```

**Nasıl kullanılır:**
1. SQL Server Management Studio açın
2. `reset-database-data-only.sql` faylını açın
3. Execute edin (F5)
4. Application-i restart edin
5. Seed data avtomatik yüklənəcək

---

## 🌱 Database + Sample Data (Eski metod - DROP kullanır)

### **reset-database.sql** - DROP kullanır

⚠️ **DİQQƏT:** Bu script DROP DATABASE kullanır, bazı IDE'lerde çalışmayabilir!

```sql
-- Bu script database-i tamamen siler
-- DROP DATABASE komutu var
```

### **reset-database-with-data.sql** - DROP + CREATE

⚠️ **DİQQƏT:** Bu script DROP DATABASE kullanır!

```sql
-- Database-i siler, yenidən yaradır
-- DROP komutu var
```

---

## 📝 Manual Sample Data

### **MANUAL_SEED_DATA.sql** - Manuel veri

```sql
-- Sample users ve tags ekler
-- (Migration-lar gerekli)
```

---

## 🚀 Server-də (Monster ASP.NET)

### **Method 1: Güvenli SQL Script** ⭐

1. SQL Server Management Studio açın
2. Server-ə connect edin
3. **`reset-database-safe.sql`** faylını açın ve Execute edin
4. File Manager-də Application-i restart edin
5. Seed data avtomatik yüklənəcək

### **Method 2: Application Restart**

1. Monster panel → Application → Stop
2. Gözləyin 10 saniyə
3. Application → Restart
4. Seed data avtomatik yüklənəcək (əgər database boşdursa)

---

## 📊 Hangi Script Ne Yapar?

| Script | Ne Yapar | DROP Kullanır? | Önerilen? |
|--------|----------|----------------|-----------|
| **reset-database-safe.sql** | Verileri temizler | ❌ | ⭐ Evet |
| **reset-database-truncate.sql** | TRUNCATE yapar | ❌ | ⭐ Evet |
| **reset-database-data-only.sql** | DELETE yapar | ❌ | ✅ Evet |
| reset-database.sql | Database siler | ✅ | ⚠️ Dikkat |
| reset-database-with-data.sql | Database + Admin | ✅ | ⚠️ Dikkat |

---

## 📊 Seed Data (Otomatik)

### Program.cs (avtomatik)
- ✅ 50 Users (admin dahil)
- ✅ 30-60 Experiences
- ✅ 15-18 Experiences with videos (30% chance)
- ✅ 15-50 Status stories (images/videos)
- ✅ 100+ Comments with replies
- ✅ 40 Tags
- ✅ Likes, Follows, Notifications
- ✅ Messages ve conversations

---

## 🔐 Login Məlumatları

```
Email: admin@wanderly.com
Password: Admin123!
```

---

## ⚠️ DİQQƏT

1. **Backup alın** (eğer lazımsa)
2. Connection string düzgün olmalı
3. Application user-in permission-u olmalı
4. Seed data yalnız **boş database** üçün işləyir

---

## ✅ Üstünlükləri

- ✅ DROP komutu kullanmayan güvenli scriptler
- ✅ Tüm IDE'lerde çalışır
- ✅ Avtomatik seed data
- ✅ Real data (Unsplash images)
- ✅ Videos and stories əlavə edildi
- ✅ 100+ comments

---

## 🎯 Step-by-Step (Güvenli Yol)

### Server-də:
1. **`reset-database-safe.sql`** faylını açın
2. SQL Management Studio'da Execute edin
3. Application-i restart edin
4. Seed data gözləyin (30 saniyə)
5. Test: `GET /api/users` - 50 user görməlisiniz
6. Test: `GET /api/experiences` - video'lu experience'ları yoxlayın
7. Test: `GET /api/status` - status/stories yoxlayın

### Local-da:
1. SQL Management Studio'da **`reset-database-safe.sql`** açın
2. Execute edin (F5)
3. `dotnet run` əmrini işə salın
4. Seed data avtomatik yüklənəcək

---

## 📝 Qeyd

**Sorun Yaşıyorsanız:**

1. **DROP komutu hatası:** → `reset-database-safe.sql` kullanın
2. Seed data yüklənmirsə:
   - Connection string yoxlayın
   - Database log faylını yoxlayın
   - Application error log-unu yoxlayın
3. Admin login olmuyor:
   - Password: `Admin123!` (dikkat: `!` var)
   - Email: `admin@wanderly.com`

---

## 🎯 Seçim

**Benim önerim:**
```
reset-database-safe.sql kullanın ⭐
```
- ✅ Güvenli
- ✅ DROP kullanmaz
- ✅ Hızlı
- ✅ Admin user korunur

---

**Uğurlar!** 🎉
