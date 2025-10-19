# 🌱 Wanderly - Realistic Seed Data

## 📖 Xülasə

Tam **real və məntiqi** seed data sistemi yaradıldı. Bu data Wanderly travel experience sharing platforması üçün dünyadan 30 məşhur turistik yeri, real istifadəçiləri, və onların təcrübələrini əhatə edir.

---

## ✨ Əsas Xüsusiyyətlər

### 🎯 Tamamilə Real Data:
- ✅ **50 Real İstifadəçi** (RandomUser.me API-dən)
- ✅ **30-60 Experience** (30 məşhur turistik yerdən)
- ✅ **Real Şəkillər** (Unsplash API - hər yer öz şəkilləri ilə)
- ✅ **40 Travel Tag** (Adventure, Beach, Culture və s.)
- ✅ **100+ Comment** (real söhbətlər və cavablar)
- ✅ **Məntiqi Əlaqələr** (Follow, Like, Notification)
- ✅ **20 Mesaj Danışığı** (travel tipləri haqqında)

### 🗺️ Real Destinasiyalar:

**Europe:** Paris 🇫🇷, Rome 🇮🇹, Venice 🇮🇹, London 🇬🇧, Barcelona 🇪🇸, Santorini 🇬🇷, Istanbul 🇹🇷, Cappadocia 🇹🇷, Iceland 🇮🇸, Norway 🇳🇴, Swiss Alps 🇨🇭

**Asia:** Tokyo 🇯🇵, Kyoto 🇯🇵, Bangkok 🇹🇭, Phuket 🇹🇭, Bali 🇮🇩, Taj Mahal 🇮🇳, Great Wall 🇨🇳

**Americas:** New York 🇺🇸, Grand Canyon 🇺🇸, Rio 🇧🇷, Cancun 🇲🇽, Machu Picchu 🇵🇪, Banff 🇨🇦

**Africa & Middle East:** Cairo 🇪🇬, Marrakech 🇲🇦, Cape Town 🇿🇦, Dubai 🇦🇪

**Oceania:** Sydney 🇦🇺, Queenstown 🇳🇿

---

## 🚀 Necə İstifadə Etmək?

### Windows (PowerShell):
```powershell
.\reset-database.ps1
```

### Linux/Mac (Bash):
```bash
chmod +x reset-database.sh
./reset-database.sh
```

### Manual:
```bash
# Database-i sil
dotnet ef database drop --force

# Migration-ları yenilə
dotnet ef database update

# Tətbiqi başlat (seed avtomatik yüklənəcək)
dotnet run
```

---

## 🔐 Giriş Məlumatları

### Admin:
```
Email: admin@wanderly.com
Password: Admin123!
```

### Digər İstifadəçilər:
```
Hər hansı istifadəçi üçün: Password123!
```

---

## 📊 Data Strukturu

| Model | Sayı | Açıqlama |
|-------|------|----------|
| Users | 50 | Admin + 49 real user |
| Experiences | 30-60 | Hər yerdən 1-2 experience |
| Tags | 40 | Travel-related tags |
| Comments | 100+ | Replies daxil |
| Likes | Dəyişən | 3-20 per experience |
| Follows | Çox | 5-15 per user |
| Comment Reactions | Çox | 0-10 per comment |
| Notifications | 250+ | Follow, Like, Comment |
| Messages | 20 söhbət | 4-6 mesaj hər biri |
| Follow Requests | 10-15 | Pending/Accepted/Rejected |
| Blocked Users | 3-5 | Minimal amma realistik |

---

## 🎨 Xüsusi Xüsusiyyətlər

### ✅ Location-Aware Data:
- **Çimərlik yerləri** → Beach, Island, Diving tagları
- **Dağlar** → Hiking, Trekking, Mountains tagları  
- **Şəhərlər** → Culture, Architecture, Museums tagları
- **Ekzotik yerlər** → Adventure, Wildlife tagları

### ✅ Real Şəkillər:
```
Paris experience → Eiffel Tower şəkilləri
Bali experience → Temple şəkilləri
Grand Canyon → Canyon mənzərələri
```

### ✅ Məntiqi Comment-lər:
```
"Wow! This looks amazing! 😍"
"I've always wanted to visit here!"
"How long did you stay?"
→ Reply: "About a week. Highly recommend!"
```

### ✅ Real Söhbətlər:
```
User1: "Planning to visit Japan. Any tips?"
User2: "Visit Fushimi Inari shrine in Kyoto!"
User1: "Added to my list! Thanks! 🙏"
```

---

## 🌐 Production Deployment

### Monster ASP.NET / Azure:

#### Metod 1: SQL Script (Tövsiyə)
```sql
-- Control Panel → SQL Management → Query Editor

USE [YourDatabaseName];
GO

-- Bütün cədvəlləri sil
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
GO
EXEC sp_MSforeachtable 'DROP TABLE ?'
GO
```

Sonra tətbiqi restart edin → Seed data avtomatik yüklənəcək!

#### Metod 2: Migration Script
```bash
# Local-da script yarat
dotnet ef migrations script --idempotent --output reset-database.sql

# Bu SQL faylını hosting panelində icra et
```

#### Metod 3: Custom Endpoint (Advanced)
`DATABASE_RESET_GUIDE.md` faylına baxın.

---

## 📁 Fayllar

```
📁 Project Root
├── 📄 SeedData.cs (Əsas seed logic)
├── 📄 data.txt (Tam dokumentasiya)
├── 📄 DATABASE_RESET_GUIDE.md (Detallı təlimat)
├── 📄 SEED_DATA_README.md (Bu fayl)
├── 📄 reset-database.ps1 (Windows script)
└── 📄 reset-database.sh (Linux/Mac script)
```

---

## 🧪 Test Etmək

### Database-in düzgün seed edildiyini yoxlayın:

```sql
-- User sayı
SELECT COUNT(*) FROM Users;  -- 50

-- Experience sayı
SELECT COUNT(*) FROM Experiences;  -- 30-60

-- Comment sayı (cavablar daxil)
SELECT COUNT(*) FROM Comments;  -- 100+

-- Tag istifadəsi
SELECT t.TagName, COUNT(et.ExperienceId) as Count
FROM Tags t
LEFT JOIN ExperienceTags et ON t.TagId = et.TagId
GROUP BY t.TagName
ORDER BY Count DESC;

-- Ən çox like alan experience-lər
SELECT e.Title, e.Location, COUNT(l.Id) as Likes
FROM Experiences e
LEFT JOIN Likes l ON e.Id = l.ExperienceId
GROUP BY e.Id, e.Title, e.Location
ORDER BY Likes DESC
LIMIT 10;
```

---

## ⚙️ Konfiqurasiya

### appsettings.json (Local):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=DESKTOP-HNLV3V9;Database=Experiences;Integrated Security=True;Encrypt=False;"
  }
}
```

### appsettings.json (Production):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=sql.monster-host.com;Database=YourDB;User Id=username;Password=password;TrustServerCertificate=True;"
  }
}
```

---

## 🔍 Əlavə Məlumat

### Seed Data Nə Vaxt Yüklənir?
Program.cs-də bu şərt yoxlanır:
```csharp
if (await context.Users.AnyAsync())
{
    // Database artıq data var, seed edilmir
    return;
}
```

**Deməli:** Database boşdursa seed edilir, əks halda skip olunur.

### Yenidən Seed Etmək Üçün:
1. Bütün datanı silin
2. Tətbiqi restart edin
3. Seed avtomatik yüklənəcək

---

## 📞 Kömək

### Suallar üçün:
1. `data.txt` - Tam dokumentasiya
2. `DATABASE_RESET_GUIDE.md` - Reset təlimatları
3. `SeedData.cs` - Source code

### Production Problems:
1. Connection string yoxlayın
2. Database permissions yoxlayın
3. Hosting panelində logs yoxlayın
4. Monster ASP.NET support-a müraciət edin

---

## ⚠️ Vacib Qeydlər

1. **Production-da database sıfırlamaq bütün real datanı silir!**
2. **Həmişə backup alın!**
3. **Seed data internetə ehtiyac duyur** (Unsplash API)
4. **API limit:** Unsplash günlük 50 sorğu (kifayətdir)

---

## 🎯 Nəticə

✅ **Tam real və məntiqi seed data**  
✅ **30 məşhur turistik yer**  
✅ **Real şəkillər və istifadəçilər**  
✅ **Asanlıqla reset və reseed**  
✅ **Production-ready**  

---

## 📅 Son Yeniləmə

**Tarix:** October 2024  
**Versiya:** 2.0 (Realistic Seed Data)  
**Status:** ✅ Production Ready

---

**Uğurlar! 🚀**

