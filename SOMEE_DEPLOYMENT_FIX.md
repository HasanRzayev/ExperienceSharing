# 🔧 Somee.com Deployment - SMTP Error Fix

## Problem

```
POST https://experiencesharingbackend.runasp.net/api/Auth/forgot-password
500 Internal Server Error
```

**Səbəb**: Backend production-da SMTP konfiqurasiya yoxdur.

---

## ✅ HƏLL: Somee.com-da Environment Variables

### Variant 1: Web.config İstifadə Et (Ən Asan)

Backend proyektində `Web.config` və ya `Web.Release.config` faylı yaradın:

#### Fayl: `Web.Release.config` (backend proyektində)

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <add key="SMTP_HOST" value="smtp.gmail.com" />
    <add key="SMTP_PORT" value="587" />
    <add key="SMTP_USERNAME" value="wanderly.project@gmail.com" />
    <add key="SMTP_PASSWORD" value="rxeejzckwmwipomd" />
    <add key="SMTP_FROM_EMAIL" value="wanderly.project@gmail.com" />
    <add key="FRONTEND_URL" value="https://experience-sharing.vercel.app" />
    <add key="GOOGLE_CLIENT_ID" value="680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com" />
  </appSettings>
</configuration>
```

---

### Variant 2: appsettings.Production.json (Daha Təhlükəsiz)

Backend proyektində `appsettings.Production.json` yaradın:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "wanderly.project@gmail.com",
    "Password": "rxeejzckwmwipomd",
    "FromEmail": "wanderly.project@gmail.com"
  },
  "AppSettings": {
    "FrontendUrl": "https://experience-sharing.vercel.app"
  },
  "GoogleOAuth": {
    "ClientId": "680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com"
  }
}
```

**Sonra backend-də bunları oxumaq lazımdır** (əgər oxunmursa).

---

### Variant 3: Somee.com Control Panel

#### Addımlar:

1. **Somee.com**-a daxil olun: https://somee.com
2. **Control Panel**-ə keçin
3. **Your Application** seçin
4. **"Configuration"** və ya **"App Settings"** tapın
5. **Environment Variables** əlavə edin:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=wanderly.project@gmail.com
SMTP_PASSWORD=rxeejzckwmwipomd
SMTP_FROM_EMAIL=wanderly.project@gmail.com
FRONTEND_URL=https://experience-sharing.vercel.app
```

6. **Save** və **Restart** edin

---

## 🎯 Backend Kodunu Yoxlayın

Backend-də environment variables **necə oxunur**?

### Yoxlayın:

Backend proyektində bu kod olmalıdır (Program.cs və ya Startup.cs):

```csharp
// Environment variables-dan oxu
var smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") 
    ?? Configuration["EmailSettings:SmtpHost"];
var smtpPort = Environment.GetEnvironmentVariable("SMTP_PORT") 
    ?? Configuration["EmailSettings:SmtpPort"];
// və s.
```

---

## 🔍 Problem Tapma

### Backend loglarına baxın:

Somee.com control panel-də:
1. **Logs** və ya **Error Logs** bölməsinə keçin
2. 500 errorun **dəqiq səbəbini** tapın
3. SMTP ilə əlaqəli error mesajı axtarın

---

## 📊 Deployment Checklist

| Təyin Edilməli | Local | Production |
|----------------|-------|------------|
| SMTP_HOST | ✅ | ⚠️ |
| SMTP_PORT | ✅ | ⚠️ |
| SMTP_USERNAME | ✅ | ⚠️ |
| SMTP_PASSWORD | ✅ | ⚠️ |
| SMTP_FROM_EMAIL | ✅ | ⚠️ |
| FRONTEND_URL | ✅ | ⚠️ |

---

## 🚀 Ən Asan Həll

### 1️⃣ Backend Proyektində `appsettings.Production.json` Yarat

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "wanderly.project@gmail.com",
    "Password": "rxeejzckwmwipomd",
    "FromEmail": "wanderly.project@gmail.com"
  },
  "AppSettings": {
    "FrontendUrl": "https://experience-sharing.vercel.app"
  }
}
```

### 2️⃣ Git Push Et

```bash
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject

git add appsettings.Production.json
git commit -m "Add production SMTP configuration"
git push origin main
```

### 3️⃣ Somee.com-da Redeploy Et

Somee.com control panel-də "Redeploy" və ya "Restart" edin.

---

## ⚠️ Təhlükəsizlik

**ÖNƏMLİ**: `appsettings.Production.json`-da password var. 

**Daha təhlükəsiz variant**:
- Somee.com-da **Environment Variables** istifadə edin (əgər mövcuddursa)
- Və ya backend kodunda **Azure Key Vault** və ya **Secret Manager** istifadə edin

---

## 💡 Tez Həll

Əgər Somee.com-da environment variables panel yoxdursa:

1. `appsettings.Production.json` yaradın (yuxarıdakı kimi)
2. Backend repo-ya push edin
3. Somee.com-da redeploy edin
4. Test edin - işləməlidir! ✅

---

**Hansı variantı sınayaq?** 

1. appsettings.Production.json yaradaq?
2. Yoxsa Somee.com control panel screenshot göstərin, mən dəqiq deyim harada config etmək olar?

Deyin necə davam edək! 🚀


