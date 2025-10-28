# 🔄 Monster ASP.NET Database Reset Guide

## 📋 Database-i Sıfırlamaq Üçün

### ✅ Server-də Database Reset Etmək

Monster ASP.NET-da database-i sıfırlamaq üçün aşağıdakı addımları izləyin:

---

## 1️⃣ File Manager-dən Database fayllarını sil

Monster panel → **File Manager** → Aşağıdakı faylları SİL:

```
appsettings.Development.json (əgər varsa)
UpdateUserPasswords.sql
*.mdf (database data faylı)
*.ldf (database log faylı)
```

---

## 2️⃣ Database Connection String

`appsettings.Production.json` faylını yoxlayın və connection string-in düzgün olduğundan əmin olun:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=your-database;User Id=your-user;Password=your-password;TrustServerCertificate=True;"
  }
}
```

---

## 3️⃣ Application Restart

Monster panel-də:
1. **Application → Stop** klik edin
2. 10 saniyə gözləyin
3. **Application → Restart** klik edin

---

## 4️⃣ Seed Data Avtomatik Yüklənəcək

Application başladıqdan sonra, əgər database boşdursa, avtomatik olaraq seed data yüklənəcək:

### 📊 Expected Seeded Data:

- ✅ **50 Users** (including admin)
- ✅ **30-60 Experiences** from 30 real destinations
- ✅ **40 Travel Tags**
- ✅ **100+ Comments** with replies
- ✅ **Realistic Likes, Follows, Notifications**
- ✅ **Message conversations**
- ✅ **Default Stories/Statuses** with images and videos
- ✅ **Some experiences with videos** (30% chance)
- ✅ **Follow requests and blocked users**

---

## 5️⃣ Admin Login

Database reset olunduqdan sonra bu ilə login ola bilərsiniz:

```
Email: admin@wanderly.com
Password: Admin123!
```

---

## 6️⃣ Yeni Xüsusiyyətlər

### 📹 Videos in Experiences
- Bəzi experience-lər artıq video ilə birlikdə yüklənir
- 30% chance to have a video

### 📸 Status/Stories
- 30% of users will have stories
- 1-3 stories per user
- Mix of image, video, and text-only stories

### 💬 Default Comments
- Hər experience üçün 2-10 default comment
- Reply-lər də var

---

## 🔍 Verify Database Reset

Application-i restart etdikdən sonra:

1. Frontend-də `/api/users` endpoint-inə request göndərin
2. 50 user görməlisiniz
3. `/api/experiences` endpoint-inə request göndərin
4. Experience-lərin bəzilərində `videoUrl` property-si olmalıdır
5. `/api/status` endpoint-inə request göndərin
6. Bəzi status/stories görməlisiniz

---

## ⚠️ Important Notes

1. **Connection String**: Server-də connection string düzgün olmalıdır
2. **Database Permissions**: Application user-inin database yaratma permission-u olmalıdır
3. **Migrations**: Migration-lar avtomatik olaraq apply olunacaq
4. **Seed Data**: Seed data yalnız boş database üçün işləyir

---

## 🎯 Database Reset edilməsi lazım ola bilər

Əgər aşağıdakı vəziyyətlərdə database reset etmək lazımdırsa:

1. Yeni migration-lar əlavə olunub və database update olmalıdır
2. Seed data update olunub (yeni default data əlavə olunub)
3. Database corruption və ya data problemləri var

Bu halda:
1. `MONSTER_ASP_NET_DATABASE_RESET.md` faylındakı addımları izləyin
2. Ya da SQL Server-də database-i drop edib restart edin

---

**Uğurlar!** 🎉

