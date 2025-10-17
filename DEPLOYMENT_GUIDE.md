# 🚀 Deployment Guide - Experience Sharing

Bu təlimat proyekti production-a deploy etmək üçün addımları izah edir.

## 📋 Environment Variables

### Backend Environment Variables

Deploy zamanı bu environment variables təyin edilməlidir:

```bash
# Frontend URL
FRONTEND_URL=https://your-frontend-domain.vercel.app

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# Database Connection (production)
ConnectionStrings__DefaultConnection=your-production-database-connection-string
```

### Frontend Environment Variables

```bash
# Backend API URL
REACT_APP_API_BASE_URL=https://your-backend-api.com/api

# Gemini API Key (optional - for AI moderation)
REACT_APP_GEMINI_API_KEY=your-gemini-api-key
```

---

## 🔧 Backend Deployment (Azure/AWS/Railway)

### Azure App Service:
1. Azure Portal-da App Service yaradın
2. **Configuration → Application Settings**-ə gedin
3. Yuxarıdakı environment variables-ı əlavə edin
4. GitHub Actions və ya Azure DevOps ilə CI/CD quraşdırın

### Railway:
1. Railway dashboard-da yeni project yaradın
2. **Variables** tab-ına keçin
3. Yuxarıdakı environment variables-ı əlavə edin
4. GitHub repo-nu connect edin

### AWS Elastic Beanstalk:
1. EB environment yaradın
2. **Configuration → Software → Environment properties**-ə variables əlavə edin

---

## 🌐 Frontend Deployment (Vercel/Netlify)

### Vercel (Tövsiyə):
1. Vercel dashboard-da yeni project yaradın
2. GitHub repo-nu connect edin
3. **Build Settings:**
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Environment Variables:**
   - `REACT_APP_API_BASE_URL` = backend URL-nizi daxil edin
5. Deploy edin!

### Netlify:
1. Netlify dashboard-da yeni site yaradın
2. GitHub repo-nu connect edin
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
4. **Environment variables** əlavə edin
5. Deploy edin!

---

## 📧 SMTP Email Konfiqurasiyası

### Gmail App Password Yaratmaq:

1. **Google Account**-a daxil olun
2. **Security** → **2-Step Verification** aktivləşdirin
3. **App passwords** bölməsinə gedin
4. **Select app** → "Mail"
5. **Select device** → "Other" → "Experience Sharing"
6. **Generate** → 16 simvollu parolu kopyalayın
7. Bu parolu `SMTP_PASSWORD` environment variable-ına yazın

### Gmail SMTP Settings:
- Host: `smtp.gmail.com`
- Port: `587`
- SSL/TLS: Enabled
- Username: Gmail adresiniz
- Password: App password (yuxarıda yaratdığınız)

### Outlook/Hotmail SMTP:
- Host: `smtp-mail.outlook.com`
- Port: `587`
- Username: Outlook email-iniz
- Password: Hesab parolu

---

## ✅ Deploy Checklist

### Backend:
- [ ] Database connection string production-a uyğun dəyişdirilib
- [ ] SMTP credentials təyin edilib
- [ ] FRONTEND_URL təyin edilib
- [ ] JWT secret key təhlükəsiz saxlanılır
- [ ] CORS settings production URL-lərini dəstəkləyir
- [ ] HTTPS aktivdir

### Frontend:
- [ ] REACT_APP_API_BASE_URL backend URL-nə işarə edir
- [ ] Build error-ları yoxdur
- [ ] Environment variables düzgün təyin edilib
- [ ] Production build test edilib

---

## 🧪 Test After Deployment

1. ✅ Login/SignUp işləyir
2. ✅ Forgot Password email göndərir
3. ✅ Reset Password link işləyir
4. ✅ Post CRUD əməliyyatları işləyir
5. ✅ Comments CRUD əməliyyatları işləyir
6. ✅ Like/Follow funksiyaları işləyir

---

## 🔒 Security Best Practices

1. ✅ **Heç vaxt** SMTP credentials-i git-ə push etməyin
2. ✅ `.env` faylını `.gitignore`-a əlavə edin
3. ✅ Production-da HTTPS istifadə edin
4. ✅ JWT secret key-i mürəkkəb və uzun olmalıdır
5. ✅ Database credentials təhlükəsiz saxlanılmalıdır

---

## 📝 Notes

- **Development:** SMTP konfiqurasiya olmasa, link response-da göstəriləcək
- **Production:** SMTP konfiqurasiya olmalıdır, əks halda email göndərilməyəcək
- **Token validity:** Reset token 1 saat etibarlıdır
- **Frontend URL:** Deploy zamanı environment variable ilə təyin edilir

---

## 🆘 Troubleshooting

### Email göndərilmir:
- SMTP credentials düzgündürmü?
- Gmail-də "Less secure app access" aktiv deyil - App Password istifadə edin
- Firewall SMTP portunu (587) bloklayırmı?

### Backend frontend-ə connect olmur:
- CORS settings-də frontend URL varmı?
- Backend URL düzgündürmü?
- HTTPS/HTTP düzgün konfiqurasiya olunubmu?

### Reset link işləmir:
- Token vaxtı keçməyib? (1 saat)
- Frontend URL environment variable-ı düzgündürmü?
- Backend və frontend eyni domain-dadırsa, cookie problemi yoxdurmu?

