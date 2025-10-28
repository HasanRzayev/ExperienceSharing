# 🔄 SEED DATA ÇALIŞTIRMA GUIDE

## ❌ Problem

Seed data çalışmıyor, statuses yok.

---

## ✅ Çözüm

### Adım 1: Database temizle

```sql
USE db28857;
DELETE FROM StatusViews;
DELETE FROM Statuses;
DELETE FROM CommentReactions;
DELETE FROM Comments;
DELETE FROM Likes;
DELETE FROM ExperienceTags;
DELETE FROM ExperienceImages;
DELETE FROM Experiences;
DELETE FROM Notifications;
DELETE FROM Follows;
DELETE FROM FollowRequests;
DELETE FROM Messages;
DELETE FROM BlockedUsers;
DELETE FROM Users;
DELETE FROM Tags;
```

VEYA `RESET-DB-COMPLETE.sql` dosyasını kullan.

---

### Adım 2: Code Güncelle

SeedData.cs güncellendi:
- ✅ Status'lar artık zorla oluşturulacak
- ✅ Status yoksa tüm seed data yeniden oluşturulur

---

### Adım 3: Build ve Deploy

```bash
dotnet build -c Release
dotnet publish -c Release -o publish
```

Dosyaları Monster ASP.NET'a yükle.

---

### Adım 4: Application Restart

Monster panel:
1. Application → Stop
2. 10 saniye bekle
3. Application → Start

---

### Adım 5: Log-ları kontrol et

Terminal/Log-larda görmelisen:
```
🔍 Database status:
   Users: 0
   Experiences: 0
   Comments: 0
   Statuses: 0
🔄 No statuses found. Re-seeding all data...
✅ Created 50 users
✅ Created 30-60 experiences
✅ Created 100+ comments
✅ Created 15-50 status stories
```

---

## ✅ Test

Application restart ettikten sonra:

1. **Status'ları kontrol et:**
   ```bash
   GET /api/status
   ```
   15-50 status görmelisen.

2. **User'ları kontrol et:**
   ```bash
   GET /api/users
   ```
   50 user görmelisen.

3. **Experiences kontrol et:**
   ```bash
   GET /api/experiences
   ```
   30-60 experience görmelisen.

---

## 🔐 Login

```
Email: admin@wanderly.com
Password: Admin123!
```

---

## ⚠️ Eğer Hala Çalışmazsa

1. **Connection string kontrol et:**
   - `appsettings.Production.json` dosyasını kontrol et
   
2. **Migration kontrol et:**
   - Status tablosu var mı?
   
3. **Application logs:**
   - Hata var mı kontrol et

---

**Uğurlar!** 🎉

