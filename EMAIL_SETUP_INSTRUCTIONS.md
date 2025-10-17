# 📧 Email Konfiqurasiyası (SMTP)

Bu təlimat Forgot Password funksiyası üçün email göndərmə qurğusunu izah edir.

## 🔧 Konfiqurasiya Addımları

### 1️⃣ Gmail SMTP İstifadə (Tövsiyə Edilir)

#### a) Gmail App Password Yaradın:
1. Gmail hesabınıza daxil olun
2. Google hesabınızın **Security** bölməsinə gedin
3. **2-Step Verification** aktiv edin (əgər aktiv deyilsə)
4. **App passwords** bölməsinə gedin
5. **Select app** → "Mail" seçin
6. **Select device** → "Other" seçin və "Experience Sharing" yazın
7. **Generate** düyməsini basın
8. **16 simvollu parolu** kopyalayın (məsələn: `abcd efgh ijkl mnop`)

#### b) Environment Variables Təyin Edin:

**Windows (PowerShell):**
```powershell
# Backend folder-ində
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject

# Environment variables təyin et
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="sizin-gmail@gmail.com"
$env:SMTP_PASSWORD="abcd efgh ijkl mnop"
$env:SMTP_FROM_EMAIL="sizin-gmail@gmail.com"
$env:FRONTEND_URL="http://localhost:3000"

# Backend-i işə sal
dotnet run --launch-profile http
```

**Və ya appsettings.json faylında** (GİZLİ məlumatlar üçün tövsiyə olunmur):
```json
{
  "SMTP": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "sizin-gmail@gmail.com",
    "Password": "abcd efgh ijkl mnop",
    "FromEmail": "sizin-gmail@gmail.com"
  }
}
```

### 2️⃣ Outlook/Hotmail SMTP İstifadə

```powershell
$env:SMTP_HOST="smtp-mail.outlook.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="sizin-email@outlook.com"
$env:SMTP_PASSWORD="sizin-parolu"
$env:SMTP_FROM_EMAIL="sizin-email@outlook.com"
```

### 3️⃣ Başqa SMTP Provider-lər

- **SendGrid:** smtp.sendgrid.net:587
- **Mailgun:** smtp.mailgun.org:587
- **Amazon SES:** email-smtp.us-east-1.amazonaws.com:587

## 🚀 Test

1. Backend-i environment variables ilə işə salın
2. Frontend-də **Forgot Password** səhifəsinə gedin
3. Email daxil edin və "Reset Linki Göndər" basın
4. Email qutunuzu yoxlayın - reset linki gəlməlidir

## 🔒 Production Deployment

### Vercel/Netlify (Frontend):
```
REACT_APP_API_BASE_URL=https://your-backend.com/api
```

### Azure/AWS (Backend):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=https://your-frontend.vercel.app
```

## ⚠️ Vacib Qeydlər

1. ✅ **Gmail App Password** istifadə edin (normal parol işləməz!)
2. ✅ **2-Step Verification** Gmail-də aktiv olmalıdır
3. ✅ **SMTP credentials-i .gitignore-a** əlavə edin (git-ə push etməyin!)
4. ✅ **Production-da environment variables** istifadə edin
5. ✅ Email göndərmə konfiqurasiya olunmasa, sistem yenə də işləyəcək - sadəcə linki göstərəcək

## 🧪 Development Mode

Əgər SMTP konfiqurasiya etmək istəmirsinizsə:
- Backend yenə də işləyəcək
- Reset linki response-da qaytarılacaq
- Frontend-də linki kopyalayıb və ya açıb istifadə edə bilərsiniz
- Email göndərilməyəcək, amma funksionallıq işləyəcək

## 📝 Email Template

Email-də belə mesaj göndəriləcək:
- ✅ Gözəl HTML template
- ✅ "Şifrəni Sıfırla" düyməsi
- ✅ Link 1 saat etibarlıdır məlumatı
- ✅ Təhlükəsizlik qeydi
- ✅ Branding (Experience Sharing)

