# 🌱 Seed Data Updates - Summary

## 📋 Dəyişikliklər (Changes)

### ✅ 1. Default Stories/Status əlavə olundu

**File**: `DataSeeder/SeedData.cs`

**Yeni Xüsusiyyətlər**:
- **CreateStatuses()** metodu əlavə olundu
- 30% of users will have stories (1-3 per user)
- Status types:
  - **60%** chance: Image status
  - **20%** chance: Video status
  - **20%** chance: Text-only status

**Status Metadatası**:
- Status-lər 24 saat aktiv olur (ExpiresAt)
- Real travel images Unsplash-dan gəlir
- Sample video URLs placeholder kimi istifadə olunur

**Status Texts**:
```csharp
- "Exploring the world 🌍"
- "Just landed in an amazing place!"
- "Feeling blessed ✨"
- "Morning vibes ☀️"
- "Sunset views 😍"
- ... və s.
```

---

### ✅ 2. Videos in Experiences əlavə olundu

**File**: `DataSeeder/SeedData.cs`

**Yeni Xüsusiyyətlər**:
- **CreateExperiences()** metodu update olundu
- 30% chance to add a video to each experience
- Video URLs və thumbnail-lər əlavə olunur

**Video Properties**:
- `VideoUrl`: Sample video URL
- `VideoThumbnail`: Experience-in ilk image-i və ya placeholder

**Sample Video URLs**:
```csharp
- "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
- "https://www.w3schools.com/html/mov_bbb.mp4"
- "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4"
```

---

### ✅ 3. Default Comments artıq var idi

**Existing Feature**:
- Hər experience üçün 2-10 default comment
- 30% chance of replies
- Realistic comment texts və replies

**Comment Examples**:
- "Wow! This looks absolutely amazing! 😍"
- "I've always wanted to visit here! Thanks for sharing."
- "Beautiful photos! How long did you stay?"
- "This is on my bucket list! Any tips?"
- ... və s.

---

## 🔄 Database Reset

### Local Database Reset

**Script**: `reset-database.ps1`

```powershell
.\reset-database.ps1
```

Bu script:
1. Database-i drop edir
2. Yeni migration yaradır (optional)
3. Database-i create edir və migrate edir
4. Seed data avtomatik yüklənir

---

### Monster ASP.NET Database Reset

**Guide**: `MONSTER_DATABASE_RESET.md`

Server-də database reset etmək üçün:

1. **File Manager-dən faylları sil** (əgər lazımsa)
2. **Application restart** et
3. Seed data avtomatik yüklənəcək

**Server URL**: `https://experiencesharingbackend.runasp.net`

---

## 📊 Expected Seeded Data

After reset, you will have:

| Data Type | Quantity | Details |
|-----------|----------|---------|
| Users | 50 | Including admin |
| Experiences | 30-60 | From 30 real destinations |
| Experiences with Videos | ~9-18 | 30% of experiences |
| Tags | 40 | Travel-related tags |
| Comments | 100+ | With replies |
| Likes | Realistic | Based on experiences |
| Follows | Realistic | User relationships |
| Messages | Realistic | Conversations |
| **Statuses** | ~15-50 | With images/videos |
| Follow Requests | 10-15 | Different statuses |
| Blocked Users | 3-5 | Optional |

---

## 🔐 Admin Login

```
Email: admin@wanderly.com
Password: Admin123!
```

---

## 🧪 Testing the New Features

### 1. Test Status/Stories

**Endpoint**: `GET /api/status`

**Expected Response**:
```json
[
  {
    "id": 1,
    "userId": 5,
    "text": "Exploring the world 🌍",
    "imageUrl": "https://...",
    "videoUrl": null,
    "thumbnailUrl": null,
    "createdAt": "2024-01-01T12:00:00Z",
    "expiresAt": "2024-01-02T12:00:00Z"
  },
  ...
]
```

### 2. Test Videos in Experiences

**Endpoint**: `GET /api/experiences`

**Expected Response**:
```json
[
  {
    "id": 1,
    "title": "Amazing Paris Adventure!",
    "description": "...",
    "videoUrl": "https://sample-videos.com/...",
    "videoThumbnail": "https://...",
    "imageUrls": [...],
    ...
  },
  ...
]
```

### 3. Test Default Comments

**Endpoint**: `GET /api/experiences/{id}/comments`

**Expected Response**:
```json
[
  {
    "id": 1,
    "content": "Wow! This looks absolutely amazing! 😍",
    "userId": 10,
    "experienceId": 1,
    "createdAt": "2024-01-01T12:00:00Z",
    "parentCommentId": null,
    "replies": [...]
  },
  ...
]
```

---

## 🎯 Next Steps for Server Deployment

1. **Build the project**:
   ```powershell
   dotnet build -c Release
   ```

2. **Publish the project**:
   ```powershell
   dotnet publish -c Release -o publish
   ```

3. **Upload to Monster ASP.NET**:
   - Compress `publish/` folder
   - Upload and extract on server
   - Restart application

4. **Database Reset**:
   - Follow `MONSTER_DATABASE_RESET.md` guide
   - Application restart olacaq və seed data avtomatik yüklənəcək

---

## 📝 Notes

1. **Video URLs**: Sample videos placeholder-dir. Production-da real video URLs istifadə olunmalıdır
2. **Status Expiration**: Status-lər 24 saatdan sonra avtomatik expire olacaq
3. **Seed Data**: Seed data yalnız boş database üçün işləyir
4. **Migrations**: Əgər yeni migration varsa, avtomatik apply olunur

---

## ✅ Summary

### What was added:
- ✅ Default Stories/Status with images and videos
- ✅ Videos in Experiences (30% chance)
- ✅ Enhanced seed data with realistic travel content
- ✅ Database reset guide for Monster ASP.NET

### What was already there:
- ✅ Default comments with replies
- ✅ Realistic user data from API
- ✅ Real travel images from Unsplash
- ✅ Tag system
- ✅ Follow/like/notification system

---

**Uğurlar!** 🎉

