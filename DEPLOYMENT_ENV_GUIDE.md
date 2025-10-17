# 🚀 Deployment Environment Variables Guide

Bu faylda proyektin deploy edilməsi üçün lazım olan **BÜTÜN environment variables** siyahısı var.

---

## 📋 TABLE OF CONTENTS

1. [Frontend Environment Variables](#frontend-environment-variables)
2. [Backend Environment Variables](#backend-environment-variables)
3. [Google OAuth Configuration](#google-oauth-configuration)
4. [Database Configuration](#database-configuration)
5. [Platform-Specific Instructions](#platform-specific-instructions)

---

## 🎨 FRONTEND ENVIRONMENT VARIABLES

### Development (.env.development)
```env
REACT_APP_API_BASE_URL=http://localhost:5029/api
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
```

### Production (.env.production)
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
```

### ⚙️ Frontend Variables Açıqlaması:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | ✅ Yes | Backend API base URL | `https://api.yourapp.com/api` |
| `REACT_APP_GEMINI_API_KEY` | ⚠️ Optional | Google Gemini AI moderation key | `AIzaSyD...` |
| `REACT_APP_GOOGLE_CLIENT_ID` | ✅ Yes (for OAuth) | Google OAuth Client ID | `680043772059-...` |

**Note:** `REACT_APP_GEMINI_API_KEY` optional-dır. Yoxdursa, AI moderation mock mode-da işləyəcək.

---

## 🖥️ BACKEND ENVIRONMENT VARIABLES

### Development (PowerShell)
```powershell
# SMTP Email Configuration
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="wanderly.project@gmail.com"
$env:SMTP_PASSWORD="rxeejzckwmwipomd"
$env:SMTP_FROM_EMAIL="wanderly.project@gmail.com"

# Frontend URL (for CORS and password reset emails)
$env:FRONTEND_URL="http://localhost:3000"

# Google OAuth
$env:GOOGLE_CLIENT_ID="680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com"

# Database (optional, default from appsettings.json)
$env:ConnectionStrings__DefaultConnection="Server=localhost;Database=ExperienceSharingDB;Trusted_Connection=True;"

# JWT Configuration (optional, default from appsettings.json)
$env:Jwt__Key="your-super-secret-jwt-key-min-32-characters"
$env:Jwt__Issuer="https://localhost:7295"
$env:Jwt__Audience="https://localhost:7295"

# Cloudinary (optional, default from appsettings.json)
$env:Cloudinary__CloudName="dcdwya8kj"
$env:Cloudinary__ApiKey="928331919936363"
$env:Cloudinary__ApiSecret="j5yLvU_DPqLSl0eDDfpJhPbr7o4"

# Port (optional, default from launchSettings.json)
# $env:PORT="5029"
```

### Production (.env or Platform Environment Variables)
```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=wanderly.project@gmail.com
SMTP_PASSWORD=rxeejzckwmwipomd
SMTP_FROM_EMAIL=wanderly.project@gmail.com

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com

# Database
ConnectionStrings__DefaultConnection=Server=your-db-server;Database=ExperienceSharingDB;User Id=your-user;Password=your-password;Encrypt=True;TrustServerCertificate=True;

# JWT Configuration
Jwt__Key=your-super-secret-jwt-key-min-32-characters-CHANGE-THIS-IN-PRODUCTION
Jwt__Issuer=https://your-backend-domain.com
Jwt__Audience=https://your-frontend-domain.com

# Cloudinary (Image Upload)
Cloudinary__CloudName=dcdwya8kj
Cloudinary__ApiKey=928331919936363
Cloudinary__ApiSecret=j5yLvU_DPqLSl0eDDfpJhPbr7o4

# Port (if required by hosting platform)
PORT=8080
```

### ⚙️ Backend Variables Açıqlaması:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMTP_HOST` | ✅ Yes | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | ✅ Yes | SMTP server port | `587` |
| `SMTP_USERNAME` | ✅ Yes | Email account username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ✅ Yes | Gmail App Password (16 chars) | `abcd efgh ijkl mnop` |
| `SMTP_FROM_EMAIL` | ✅ Yes | Sender email address | `your-email@gmail.com` |
| `FRONTEND_URL` | ✅ Yes | Frontend base URL | `https://yourapp.com` |
| `GOOGLE_CLIENT_ID` | ✅ Yes (for OAuth) | Google OAuth Client ID | `680043772059-...` |
| `ConnectionStrings__DefaultConnection` | ⚠️ Optional* | Database connection string | See above |
| `Jwt__Key` | ⚠️ Optional* | JWT secret key (32+ chars) | See above |
| `Jwt__Issuer` | ⚠️ Optional* | JWT issuer | `https://api.yourapp.com` |
| `Jwt__Audience` | ⚠️ Optional* | JWT audience | `https://yourapp.com` |
| `Cloudinary__CloudName` | ⚠️ Optional* | Cloudinary cloud name | `dcdwya8kj` |
| `Cloudinary__ApiKey` | ⚠️ Optional* | Cloudinary API key | `928331919936363` |
| `Cloudinary__ApiSecret` | ⚠️ Optional* | Cloudinary API secret | See above |
| `PORT` | ⚠️ Optional** | Server port | `8080` |

**\*Optional:** `appsettings.json`-da təyin edilibsə, environment variable lazım deyil.  
**\*\*Optional:** Əksər hosting platformları avtomatik təyin edir (Heroku, Railway, Render).

---

## 🔐 GOOGLE OAUTH CONFIGURATION

### 1. Google Cloud Console Settings

**Authorized JavaScript origins:**
```
Development:
  http://localhost:3000

Production:
  https://your-frontend-domain.com
```

**Authorized redirect URIs:**
```
Development:
  http://localhost:3000

Production:
  https://your-frontend-domain.com
```

### 2. Enable Google+ API (if not enabled)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **APIs & Services** → **Library**
- Search for **Google+ API** and enable it

### 3. OAuth Consent Screen
- **App name:** Experience Sharing
- **User support email:** wanderly.project@gmail.com
- **Developer contact:** wanderly.project@gmail.com
- **Authorized domains:** (Add your production domain)

---

## 💾 DATABASE CONFIGURATION

### Development (SQL Server Express)
```
Server=localhost;Database=ExperienceSharingDB;Trusted_Connection=True;
```

### Production Examples

#### Azure SQL Database
```
Server=tcp:your-server.database.windows.net,1433;Database=ExperienceSharingDB;User Id=your-user@your-server;Password=your-password;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

#### Railway PostgreSQL (if migrating)
```
Host=containers-us-west-123.railway.app;Port=5432;Database=railway;Username=postgres;Password=your-password;
```

#### Render.com PostgreSQL
```
postgresql://user:password@dpg-abc123-a.oregon-postgres.render.com/database_name
```

**⚠️ Important:** Entity Framework Core-u PostgreSQL ilə istifadə etmək üçün:
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

---

## 📦 PLATFORM-SPECIFIC INSTRUCTIONS

### 🎯 Vercel (Frontend)

**Environment Variables:**
```
REACT_APP_API_BASE_URL=https://your-backend.com/api
REACT_APP_GEMINI_API_KEY=your_key
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
```

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

---

### 🚂 Railway (Backend)

**Environment Variables:**
Railway dashboard-da bu variables əlavə edin:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=wanderly.project@gmail.com
SMTP_PASSWORD=rxeejzckwmwipomd
SMTP_FROM_EMAIL=wanderly.project@gmail.com
FRONTEND_URL=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
ConnectionStrings__DefaultConnection=Server=...;Database=...;
Jwt__Key=your-super-secret-jwt-key-CHANGE-THIS
Jwt__Issuer=https://your-railway-app.up.railway.app
Jwt__Audience=https://your-vercel-app.vercel.app
Cloudinary__CloudName=dcdwya8kj
Cloudinary__ApiKey=928331919936363
Cloudinary__ApiSecret=j5yLvU_DPqLSl0eDDfpJhPbr7o4
```

**Build Settings:**
- Build Command: `dotnet publish -c Release -o out`
- Start Command: `dotnet out/ExperienceProject.dll`

---

### 🎨 Render.com (Backend)

**Environment Variables:**
Render dashboard-da Environment section-da əlavə edin (Railway ilə eyni).

**Build Command:**
```bash
dotnet publish -c Release -o out
```

**Start Command:**
```bash
dotnet out/ExperienceProject.dll
```

---

### 🌊 Azure App Service (Backend)

**Configuration → Application Settings:**

Azure Portal-da Configuration bölməsinə keçin və **Application Settings** tab-ında:

```
Name: SMTP_HOST
Value: smtp.gmail.com

Name: SMTP_PORT
Value: 587

Name: SMTP_USERNAME
Value: wanderly.project@gmail.com

Name: SMTP_PASSWORD
Value: rxeejzckwmwipomd

Name: SMTP_FROM_EMAIL
Value: wanderly.project@gmail.com

Name: FRONTEND_URL
Value: https://your-frontend.azurewebsites.net

Name: GOOGLE_CLIENT_ID
Value: 680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com

Name: ConnectionStrings__DefaultConnection
Value: Server=...;Database=...;

(və s.)
```

---

## 🧪 LOCAL TESTING SCRIPT

### Windows (PowerShell)

**`start-local-dev.ps1`:**
```powershell
# Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\ExperienceSharing; npm start"

# Backend
Write-Host "Starting Backend with Environment Variables..." -ForegroundColor Green
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject

$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="wanderly.project@gmail.com"
$env:SMTP_PASSWORD="rxeejzckwmwipomd"
$env:SMTP_FROM_EMAIL="wanderly.project@gmail.com"
$env:FRONTEND_URL="http://localhost:3000"
$env:GOOGLE_CLIENT_ID="680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com"

dotnet run --launch-profile http

Write-Host "Development servers started!" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5029" -ForegroundColor Cyan
```

**İstifadə:**
```powershell
.\start-local-dev.ps1
```

---

### Linux/Mac (Bash)

**`start-local-dev.sh`:**
```bash
#!/bin/bash

# Frontend
echo "Starting Frontend..."
cd /path/to/ExperienceSharing
npm start &

# Backend
echo "Starting Backend..."
cd /path/to/ExperienceProject

export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USERNAME="wanderly.project@gmail.com"
export SMTP_PASSWORD="rxeejzckwmwipomd"
export SMTP_FROM_EMAIL="wanderly.project@gmail.com"
export FRONTEND_URL="http://localhost:3000"
export GOOGLE_CLIENT_ID="680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com"

dotnet run --launch-profile http

echo "Development servers started!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5029"
```

**İstifadə:**
```bash
chmod +x start-local-dev.sh
./start-local-dev.sh
```

---

## 🛡️ SECURITY BEST PRACTICES

### ⚠️ Production-da Dəyişdirin:

1. **JWT Key:**
   - Minimum 32 karakter
   - Random və güclü olmalıdır
   - Heç vaxt public repo-da paylaşmayın

   ```bash
   # Generate strong key (PowerShell):
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

2. **Database Password:**
   - Güclü və unikal olmalıdır
   - Default password istifadə etməyin

3. **Cloudinary API Secret:**
   - Yeni account yaradın və yeni credentials alın
   - Mövcud credentials-i rotate edin

4. **SMTP Password:**
   - Gmail App Password istifadə edin (normal password YOX)
   - Her environment üçün ayrı email hesabı yaradın

---

## 📝 DEPLOYMENT CHECKLIST

### ✅ Frontend Deployment

- [ ] `.env.production` faylı yaradılıb
- [ ] `REACT_APP_API_BASE_URL` production backend URL-ə yönləndirildi
- [ ] `REACT_APP_GOOGLE_CLIENT_ID` təyin edildi
- [ ] `npm run build` işləyir və xəta vermir
- [ ] Google Cloud Console-da production domain əlavə edildi (Authorized Origins)

### ✅ Backend Deployment

- [ ] Bütün environment variables platform-da təyin edildi
- [ ] Database connection string düzgündür
- [ ] SMTP settings test edildi (email göndərir)
- [ ] JWT Key production-da dəyişdirildi (minimum 32 char)
- [ ] `Jwt__Issuer` və `Jwt__Audience` production URL-lər ilə yeniləndi
- [ ] CORS policy-də production frontend URL əlavə edildi
- [ ] Database migration tətbiq edildi: `dotnet ef database update`

### ✅ Google OAuth

- [ ] Google Cloud Console-da production domain əlavə edildi
- [ ] Authorized JavaScript origins: `https://your-frontend.com`
- [ ] Authorized redirect URIs: `https://your-frontend.com`
- [ ] Google+ API aktiv edildi
- [ ] OAuth Consent Screen tamamlandı

### ✅ Testing

- [ ] Frontend-dən backend-ə request göndərə bilir
- [ ] Login/SignUp işləyir
- [ ] Google OAuth işləyir
- [ ] Forgot Password email göndərir
- [ ] Image upload işləyir (Cloudinary)
- [ ] CORS xətası yoxdur

---

## 🐛 TROUBLESHOOTING

### Google OAuth "origin not allowed" xətası:

**Həll:**
1. [Google Cloud Console](https://console.cloud.google.com/) → **Credentials**
2. OAuth 2.0 Client ID-ni seçin
3. **Authorized JavaScript origins** əlavə edin:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
4. **Save** basın
5. 5 dəqiqə gözləyin (Google cache)
6. Frontend-i refresh edin (`Ctrl + Shift + R`)

### Backend connection refused:

**Həll:**
1. Backend işlədiyini yoxlayın: `netstat -ano | findstr :5029`
2. Environment variables təyin edilib? `echo $env:SMTP_HOST`
3. Backend restart edin: `dotnet run --launch-profile http`

### CORS xətası:

**Həll:**
1. `Program.cs`-də CORS policy-yə production URL əlavə edin:
   ```csharp
   policy.WithOrigins(
       "http://localhost:3000",
       "https://your-production-domain.com"
   )
   ```
2. Backend restart edin

---

## 📞 SUPPORT

Deployment zamanı problemlər yaranarsa:

1. **Backend logs** yoxlayın (platform console)
2. **Browser console** yoxlayın (F12)
3. **Environment variables** düzgün təyin edilibmi yoxlayın
4. Bu dokumentdəki **Troubleshooting** bölməsinə baxın

---

**Uğurlar deployment-da! 🚀**

