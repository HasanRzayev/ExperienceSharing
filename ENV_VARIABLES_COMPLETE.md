# 📋 Environment Variables - Tam Siyahı

Bu faylda proyektin işləməsi üçün lazım olan **BÜTÜN** environment variables var.

---

## 🎨 FRONTEND Environment Variables

### Development (`.env` və ya `.env.development`)

Fayl yaradın: `ExperienceSharing/.env`

```env
REACT_APP_API_BASE_URL=http://localhost:5029/api
REACT_APP_GEMINI_API_KEY=
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
```

**Açıqlama:**
| Variable | Required | Açıqlama | Default |
|----------|----------|---------|---------|
| `REACT_APP_API_BASE_URL` | ✅ Yes | Backend API base URL | `http://localhost:5029/api` |
| `REACT_APP_GEMINI_API_KEY` | ❌ No | Google Gemini AI API key (AI moderation üçün) | Empty = Mock mode |
| `REACT_APP_GOOGLE_CLIENT_ID` | ✅ Yes | Google OAuth Client ID | Provided |

---

### Production (`.env.production`)

Fayl yaradın: `ExperienceSharing/.env.production`

```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_GEMINI_API_KEY=
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
```

**⚠️ Production-da Dəyişdirin:**
- `REACT_APP_API_BASE_URL` → Sizin backend domain-iniz
- `REACT_APP_GOOGLE_CLIENT_ID` → Yeni credentials yaradın (production üçün)

---

## 🖥️ BACKEND Environment Variables

### Development (PowerShell)

```powershell
# Navigate to backend directory
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject

# SMTP Configuration (Email göndərmə)
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="wanderly.project@gmail.com"
$env:SMTP_PASSWORD="rxeejzckwmwipomd"
$env:SMTP_FROM_EMAIL="wanderly.project@gmail.com"

# Frontend URL (CORS və password reset email-ləri üçün)
$env:FRONTEND_URL="http://localhost:3000"

# Google OAuth
$env:GOOGLE_CLIENT_ID="680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com"

# Run
dotnet run --launch-profile http
```

**Açıqlama:**
| Variable | Required | Açıqlama | Example |
|----------|----------|---------|---------|
| `SMTP_HOST` | ✅ Yes | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | ✅ Yes | SMTP server port | `587` (TLS) |
| `SMTP_USERNAME` | ✅ Yes | Email account username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ✅ Yes | **Gmail App Password** (16 chars, no spaces) | `abcdefghijklmnop` |
| `SMTP_FROM_EMAIL` | ✅ Yes | Sender email address | `your-email@gmail.com` |
| `FRONTEND_URL` | ✅ Yes | Frontend base URL (CORS və reset links üçün) | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | ✅ Yes | Google OAuth Client ID | Provided |

---

### Development (Bash - Linux/Mac)

```bash
#!/bin/bash

# Navigate to backend directory
cd /path/to/ExperienceProject

# SMTP Configuration
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USERNAME="wanderly.project@gmail.com"
export SMTP_PASSWORD="rxeejzckwmwipomd"
export SMTP_FROM_EMAIL="wanderly.project@gmail.com"

# Frontend URL
export FRONTEND_URL="http://localhost:3000"

# Google OAuth
export GOOGLE_CLIENT_ID="680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com"

# Run
dotnet run --launch-profile http
```

---

### Production (.env və ya Platform Environment Variables)

**Railway, Render, Azure, Heroku və s. üçün:**

```env
# === SMTP Email Configuration === #
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=wanderly.project@gmail.com
SMTP_PASSWORD=rxeejzckwmwipomd
SMTP_FROM_EMAIL=wanderly.project@gmail.com

# === Frontend URL === #
FRONTEND_URL=https://your-frontend-domain.vercel.app

# === Google OAuth === #
GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com

# === Database === #
ConnectionStrings__DefaultConnection=Server=your-db-server.database.windows.net,1433;Database=ExperienceSharingDB;User Id=your-admin;Password=your-strong-password;Encrypt=True;TrustServerCertificate=True;

# === JWT Configuration === #
Jwt__Key=your-super-secret-jwt-key-minimum-32-characters-CHANGE-THIS-IN-PRODUCTION
Jwt__Issuer=https://your-backend-domain.up.railway.app
Jwt__Audience=https://your-frontend-domain.vercel.app

# === Cloudinary (Image Upload) === #
Cloudinary__CloudName=dcdwya8kj
Cloudinary__ApiKey=928331919936363
Cloudinary__ApiSecret=j5yLvU_DPqLSl0eDDfpJhPbr7o4

# === Port (if required by hosting platform) === #
PORT=8080
```

**⚠️ Production-da Dəyişdirin:**
- `FRONTEND_URL` → Sizin frontend domain-iniz
- `ConnectionStrings__DefaultConnection` → Sizin database connection string-iniz
- `Jwt__Key` → Təsadüfi 32+ karakter (güclü olsun!)
- `Jwt__Issuer` → Backend domain-iniz
- `Jwt__Audience` → Frontend domain-iniz
- `Cloudinary__*` → Yeni Cloudinary account yaradın (optional)

**⚠️ Gmail App Password Necə Yaradılır:**
1. [Google Account](https://myaccount.google.com/) → **Security**
2. **2-Step Verification** aktiv edin
3. **App passwords** → **Generate**
4. **Mail** seçin → **Other (Custom name)** → "ExperienceSharing"
5. 16-character password-u kopyalayın (məsələn: `abcd efgh ijkl mnop`)
6. Boşluqları silin: `abcdefghijklmnop`
7. `SMTP_PASSWORD`-də istifadə edin

---

## 🔐 appsettings.json (Backend)

`ExperienceProject/appsettings.json` faylında:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ExperienceSharingDB;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-min-32-characters",
    "Issuer": "https://localhost:7295",
    "Audience": "https://localhost:7295",
    "DurationInMinutes": "60"
  },
  "Cloudinary": {
    "CloudName": "dcdwya8kj",
    "ApiKey": "928331919936363",
    "ApiSecret": "j5yLvU_DPqLSl0eDDfpJhPbr7o4"
  },
  "SMTP": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "",
    "Password": "",
    "FromEmail": ""
  }
}
```

**⚠️ Qeyd:** Environment variables `appsettings.json`-dakı dəyərləri override edir!

---

## 🌐 Platform-Specific Konfiqurasiya

### Vercel (Frontend)

**Dashboard → Settings → Environment Variables:**

```
REACT_APP_API_BASE_URL = https://your-backend.up.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID = 680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
REACT_APP_GEMINI_API_KEY = (optional)
```

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

---

### Railway (Backend)

**Dashboard → Variables tab:**

Railway-də hər variable üçün **+ New Variable** basıb əlavə edin:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USERNAME = wanderly.project@gmail.com
SMTP_PASSWORD = rxeejzckwmwipomd
SMTP_FROM_EMAIL = wanderly.project@gmail.com
FRONTEND_URL = https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID = 680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
ConnectionStrings__DefaultConnection = [PostgreSQL connection string from Railway]
Jwt__Key = [Generate strong 32+ char key]
Jwt__Issuer = https://your-railway-app.up.railway.app
Jwt__Audience = https://your-vercel-app.vercel.app
Cloudinary__CloudName = dcdwya8kj
Cloudinary__ApiKey = 928331919936363
Cloudinary__ApiSecret = j5yLvU_DPqLSl0eDDfpJhPbr7o4
```

**⚠️ PostgreSQL Connection String (Railway):**
Railway PostgreSQL database yaratdıqda avtomatik connection string verir:
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

**Entity Framework Core PostgreSQL üçün:**
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

`Program.cs`-də:
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

---

### Render.com (Backend)

**Dashboard → Environment:**

Render-də **Environment** tab-ına keçin və əlavə edin (Railway ilə eyni):

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
(və s. - Railway kimi)
```

**Build Command:**
```bash
dotnet publish -c Release -o out
```

**Start Command:**
```bash
dotnet out/ExperienceProject.dll
```

---

### Azure App Service (Backend)

**Azure Portal → App Service → Configuration → Application Settings:**

Hər variable üçün **+ New application setting**:

```
Name: SMTP_HOST
Value: smtp.gmail.com

Name: SMTP_PORT
Value: 587

(və s. - Railway kimi)
```

**Connection String (SQL Server):**
Azure SQL Database yaratdıqda connection string alırsınız:
```
Server=tcp:your-server.database.windows.net,1433;Initial Catalog=ExperienceSharingDB;Persist Security Info=False;User ID=your-admin;Password=your-password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## 🔑 Güclü JWT Key Yaratmaq

### PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Bash (Linux/Mac):
```bash
openssl rand -base64 32
```

### Online:
https://www.random.org/strings/

**Settings:**
- Length: 32
- Characters: Letters & Numbers
- Generate

---

## ✅ Yoxlama Listi

### Environment Variables Təyin Edilib?

**Frontend:**
- [ ] `REACT_APP_API_BASE_URL`
- [ ] `REACT_APP_GOOGLE_CLIENT_ID`
- [ ] `REACT_APP_GEMINI_API_KEY` (optional)

**Backend:**
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USERNAME`
- [ ] `SMTP_PASSWORD` (Gmail App Password!)
- [ ] `SMTP_FROM_EMAIL`
- [ ] `FRONTEND_URL`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `ConnectionStrings__DefaultConnection`
- [ ] `Jwt__Key` (32+ characters)
- [ ] `Jwt__Issuer`
- [ ] `Jwt__Audience`
- [ ] `Cloudinary__CloudName`
- [ ] `Cloudinary__ApiKey`
- [ ] `Cloudinary__ApiSecret`

### Test Edildi?
- [ ] Backend build olur? (`dotnet build`)
- [ ] Backend işə düşür? (`dotnet run`)
- [ ] Frontend build olur? (`npm run build`)
- [ ] Frontend backend-ə request göndərir?
- [ ] Login/SignUp işləyir?
- [ ] Google OAuth işləyir?
- [ ] Email göndərilir? (Forgot Password)
- [ ] Image upload işləyir? (Cloudinary)

---

## 📞 Problemlər?

Hər hansı environment variable problem yaranarsa:

1. **Dəyərin düzgün yazıldığını yoxlayın** (boşluq, typo)
2. **Quote istifadə edin** PowerShell-də: `$env:VAR="value"`
3. **Backend restart edin** env variables dəyişdirdikdən sonra
4. **Platform logs yoxlayın** (Railway/Render/Azure)
5. **Browser console yoxlayın** (F12)

---

**Uğurlar deployment-da! 🚀**

