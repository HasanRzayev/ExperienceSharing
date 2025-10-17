# 🚀 Deployment Final Checklist

## ✅ Hazırlıq Tamamlandı!

### Build Status:
```
✅ Backend: 0 Warning, 0 Error
✅ Frontend: Linter errors yoxdur
✅ All endpoints: Ready
✅ Google OAuth: Implemented
✅ SMTP: Configured
```

---

## 📝 DEPLOYMENT ADDIM-ADDIM

### **BACKEND DEPLOYMENT (Railway / Render / Azure)**

#### Addım 1: Backend Files Update

Deploy etməzdən əvvəl son dəyişikliklər:
- ✅ `/api/Followers/messaging-contacts` endpoint əlavə edildi
- ✅ `/api/Messages/conversation/{receiverId}` endpoint əlavə edildi
- ✅ `/api/Users/me` endpoint düzəldildi (tam user object qaytarır)

```bash
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject
git status
git add .
git commit -m "Fix: Add missing messaging endpoints for ChatPage"
git push
```

---

#### Addım 2: Backend Environment Variables (Railway)

**Railway Dashboard → Variables tab → + New Variable:**

```env
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USERNAME = wanderly.project@gmail.com
SMTP_PASSWORD = rxeejzckwmwipomd
SMTP_FROM_EMAIL = wanderly.project@gmail.com
FRONTEND_URL = https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID = 680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
ConnectionStrings__DefaultConnection = (Railway PostgreSQL connection string)
Jwt__Key = (Generate güclü 32+ char key)
Jwt__Issuer = https://your-railway-app.up.railway.app
Jwt__Audience = https://your-vercel-app.vercel.app
Cloudinary__CloudName = dcdwya8kj
Cloudinary__ApiKey = 928331919936363
Cloudinary__ApiSecret = j5yLvU_DPqLSl0eDDfpJhPbr7o4
```

**⚠️ PostgreSQL Connection String (Railway):**

Railway PostgreSQL database yaratdıqda avtomatik verir. Copy edin:
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

**⚠️ Entity Framework PostgreSQL üçün:**

`ExperienceProject.csproj`-ə əlavə edin:
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="6.0.0" />
```

`Program.cs`-də dəyişin:
```csharp
// Əvvəl:
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))

// İndi:
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (connectionString.Contains("postgres"))
    options.UseNpgsql(connectionString);
else
    options.UseSqlServer(connectionString);
```

---

#### Addım 3: Backend Database Migration

Railway console-da və ya local:

```bash
cd ExperienceProject
dotnet ef database update
```

**Əgər PostgreSQL istifadə edirsinizsə:**
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

#### Addım 4: Backend Deploy Verify

**Railway/Render logs yoxlayın:**
```
✅ Build succeeded
✅ Database migrations applied successfully
✅ Now listening on: http://0.0.0.0:8080
✅ Application started
```

**Backend URL test edin:**
```
https://your-backend-domain.up.railway.app/api/Users
```

---

### **FRONTEND DEPLOYMENT (Vercel)**

#### Addım 1: Frontend `.env.production`

**Fayl yaradın:** `ExperienceSharing/.env.production`

```env
REACT_APP_API_BASE_URL=https://your-backend-domain.up.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
REACT_APP_GEMINI_API_KEY=
```

**⚠️ Dəyişdirin:**
- `REACT_APP_API_BASE_URL` → Sizin Railway backend URL-iniz

---

#### Addım 2: Frontend Build Test

```bash
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\ExperienceSharing
npm run build
```

**Gözləyilən:**
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
  ...
The build folder is ready to be deployed.
```

---

#### Addım 3: Frontend Deploy

```bash
git add .
git commit -m "Fix: Update API endpoints and environment variables"
git push
```

Vercel avtomatik deploy edəcək.

---

#### Addım 4: Vercel Environment Variables

**Vercel Dashboard → Settings → Environment Variables:**

```
REACT_APP_API_BASE_URL = https://your-backend-domain.up.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID = 680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
REACT_APP_GEMINI_API_KEY = (optional)
```

**⚠️ Qeyd:** `.env.production` faylında olsa belə, Vercel dashboard-da da təyin etməlisiniz!

---

### **GOOGLE OAUTH PRODUCTION CONFIG**

#### Addım 1: Google Cloud Console

**https://console.cloud.google.com/apis/credentials**

#### Addım 2: OAuth Client ID Edit

**Credentials → OAuth 2.0 Client IDs → Edit**

#### Addım 3: Authorized JavaScript Origins

**+ ADD URI:**
```
https://your-frontend-domain.vercel.app
http://localhost:3000 (development üçün qalsın)
```

#### Addım 4: Authorized Redirect URIs

**+ ADD URI:**
```
https://your-frontend-domain.vercel.app
http://localhost:3000 (development üçün qalsın)
```

#### Addım 5: SAVE

**SAVE** basın və **5-10 dəqiqə gözləyin** (Google cache).

---

## 🧪 PRODUCTION TEST

### Backend Test:

1. **Health Check:**
   ```
   https://your-backend-domain.up.railway.app/api/Users
   ```
   Cavab gəlməlidir (401 Unauthorized normal-dır, endpoint işləyir deməkdir)

2. **Google OAuth Test:**
   ```
   POST https://your-backend-domain.up.railway.app/api/Auth/google-login
   Body: { "googleToken": "test" }
   ```
   Cavab gəlməlidir (xəta olsa belə, endpoint işləyir)

3. **Messaging Endpoints:**
   ```
   GET https://your-backend-domain.up.railway.app/api/Followers/messaging-contacts
   GET https://your-backend-domain.up.railway.app/api/Messages/conversation/1
   ```
   401 Unauthorized normal-dır (auth lazımdır)

---

### Frontend Test:

1. **Production URL-ə Gedin:**
   ```
   https://your-frontend-domain.vercel.app
   ```

2. **Login Test:**
   - Email/Password login işləyirmi? ✅
   - Google OAuth button görünürmü? ✅
   - Google login işləyirmi? ✅

3. **ChatPage Test:**
   - ChatPage açılırmi? ✅
   - User list yüklənirmi? ✅
   - Mesajlar görsənirmi? ✅
   - Yeni mesaj göndərmə işləyirmi? ✅

4. **Browser Console:**
   - F12 basın → Console tab
   - ❌ Heç bir 404 və ya 405 error olmamalıdır
   - ✅ "Invalid user data" error-u olmamalıdır

---

## 🔍 COMMON DEPLOYMENT ERRORS

### Error 1: "CORS policy" Error

**Səbəb:** Backend CORS-da frontend URL yoxdur

**Həll:** `Program.cs`-də:
```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://your-frontend-domain.vercel.app"  // ← Əlavə edin
)
```

---

### Error 2: "Connection string not found"

**Səbəb:** Database connection string environment variable-da yoxdur

**Həll:** Railway/Render-də:
```
ConnectionStrings__DefaultConnection = Server=...;Database=...;
```

---

### Error 3: "Google origin not allowed"

**Səbəb:** Google Console-da production domain əlavə edilməyib

**Həll:** 
- Google Cloud Console → Credentials
- OAuth Client ID edit
- Authorized JavaScript origins: `https://your-domain.vercel.app`

---

### Error 4: "Email sending failed"

**Səbəb:** SMTP environment variables yoxdur və ya yanlışdır

**Həll:**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USERNAME = wanderly.project@gmail.com
SMTP_PASSWORD = rxeejzckwmwipomd (Gmail App Password)
```

---

## 📊 DEPLOYMENT SUMMARY

### Backend Endpoint-lər (Yeni/Updated):
- ✅ `GET /api/Followers/messaging-contacts` (YENİ)
- ✅ `GET /api/Messages/conversation/{receiverId}` (YENİ)
- ✅ `GET /api/Users/me` (UPDATED - tam user object qaytarır)

### Environment Variables:
- ✅ **Frontend:** 2 required (`REACT_APP_API_BASE_URL`, `REACT_APP_GOOGLE_CLIENT_ID`)
- ✅ **Backend:** 14 required (SMTP, JWT, Database, Cloudinary, Google)

### Google OAuth:
- ✅ Development: `http://localhost:3000`
- ⚠️ Production: `https://your-domain.vercel.app` (əlavə etməlisiniz)

### Build:
- ✅ Backend: **0 Warning, 0 Error**
- ✅ Frontend: Clean

---

## 🎉 DEPLOYMENT READY!

**Bütün problemlər həll olundu:**
- ❌ 405 Error → ✅ `/messaging-contacts` endpoint əlavə edildi
- ❌ 404 Error → ✅ `/conversation/{receiverId}` endpoint əlavə edildi
- ❌ Invalid user data → ✅ `/me` endpoint tam object qaytarır

**İndi deploy edə bilərsiniz! 🚀**

---

## 📞 POST-DEPLOYMENT VERIFY

Deploy edəndən sonra:

1. **✅ Frontend açılır** - https://your-domain.vercel.app
2. **✅ Login işləyir** - Email/Password və Google OAuth
3. **✅ ChatPage işləyir** - User list, messages
4. **✅ Profil görünür** - Sağ yuxarıda username və şəkil
5. **✅ Console errors yoxdur** - Browser F12 → Console təmiz

---

**Uğurlar! 🎯**

