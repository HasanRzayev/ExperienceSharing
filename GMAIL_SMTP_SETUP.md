# 📧 Gmail SMTP Quraşdırma Təlimatı

## Addım 1: Gmail App Password Yaradın

1. **Google Account-a daxil olun**
   - [https://myaccount.google.com](https://myaccount.google.com) ünvanına daxil olun
   
2. **Security bölməsinə keçin**
   - Sol menyudan "Security" seçin
   
3. **2-Step Verification aktivləşdirin** (əgər aktiv deyilsə)
   - "How you sign in to Google" bölməsindən "2-Step Verification" seçin
   - Telefon nömrənizi əlavə edib aktivləşdirin
   
4. **App Password yaradın**
   - 2-Step Verification aktivləşdirdikdən sonra yenidən "Security" səhifəsinə qayıdın
   - "How you sign in to Google" bölməsindən **"App passwords"** seçin
   - **Select app:** "Mail" seçin
   - **Select device:** "Other (Custom name)" seçin və "Experience Sharing" yazın
   - **Generate** düyməsini basın
   - 16 simvollu parol göstəriləcək (məsələn: `abcd efgh ijkl mnop`)
   - ⚠️ **Bu parolu kopyalayın və yadda saxlayın - bir daha görməyəcəksiniz!**

---

## Addım 2: Backend-də SMTP Konfiqurasiyası

### Windows PowerShell:

```powershell
cd C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject

# Environment variables təyin edin:
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="sizin-gmail@gmail.com"          # ÖZ EMAİLİNİZ
$env:SMTP_PASSWORD="abcd efgh ijkl mnop"            # APP PASSWORD (16 simvol)
$env:SMTP_FROM_EMAIL="sizin-gmail@gmail.com"        # ÖZ EMAİLİNİZ
$env:FRONTEND_URL="http://localhost:3000"

# Backend-i işə salın
dotnet run --launch-profile http
```

### Linux/Mac Terminal:

```bash
cd /path/to/ExperienceProject

export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USERNAME="sizin-gmail@gmail.com"
export SMTP_PASSWORD="abcd efgh ijkl mnop"
export SMTP_FROM_EMAIL="sizin-gmail@gmail.com"
export FRONTEND_URL="http://localhost:3000"

dotnet run --launch-profile http
```

---

## Addım 3: Test Edin

1. **Frontend-i açın:** http://localhost:3000
2. **Login səhifəsinə** gedin və **"Forgot password?"** basın
3. **Öz Gmail adresinizi** daxil edin
4. **"Send Reset Link"** düyməsini basın
5. **Gmail qutunuzu** yoxlayın - bir neçə saniyə içində email gələcək
6. **Emaildəki linki** klikləyin
7. **Yeni parol təyin edin** və qeyd edin ✅

---

## ⚠️ Vacib Qeydlər

### 1. **Normal Gmail Parolu DEYİL, App Password istifadə edin!**
   - ❌ Səhv: `sizin-normal-parolunuz`
   - ✅ Düzgün: `abcd efgh ijkl mnop` (16 simvol, boşluqlu və ya boşluqsuz)

### 2. **Email Spam qovluğuna düşə bilər**
   - Əgər email gəlmirsə, Spam/Junk qovluğunu yoxlayın
   - İlk dəfə göndərəndə spam ola bilər

### 3. **Port 587 bloklandısa**
   - Bəzi şəbəkələr 587 portunu bloklayır
   - Alternativ: Port 465 (SSL)
   ```powershell
   $env:SMTP_PORT="465"
   ```

### 4. **Google Security Xəbərdarlığı**
   - Əgər "Suspicious sign-in blocked" mesajı alırsınızsa:
   - Gmail-ə daxil olun və yoxlayın
   - "Yes, it was me" basın

---

## 🎯 Production Üçün (Deploy)

### Render.com / Vercel / Azure:
Environment Variables bölməsinə əlavə edin:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=sizin-gmail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=sizin-gmail@gmail.com
FRONTEND_URL=https://sizin-domain.com
```

---

## 🔍 Troubleshooting

### Email göndərilmir?

1. **Environment variables düzgündürmü?**
   ```powershell
   echo $env:SMTP_USERNAME  # Gmail adresinizi göstərməlidir
   echo $env:SMTP_PASSWORD  # App password göstərməlidir
   ```

2. **Backend console-da nə yazır?**
   - "✅ Email göndərildi!" - Uğurlu
   - "⚠️ Email göndərmə xətası: ..." - Xəta təfsilatı

3. **App Password düzgündürmü?**
   - 16 simvol olmalıdır
   - Boşluqlar vacib deyil (sistem özü təmizləyir)
   - Yenisini yaradıb yenidən cəhd edin

4. **2-Step Verification aktiv deyilsə:**
   - Google Account → Security → 2-Step Verification
   - Aktivləşdirin və yenidən App Password yaradın

---

## 📧 Başqa Email Servislər

### Outlook / Hotmail:
```powershell
$env:SMTP_HOST="smtp-mail.outlook.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="sizin-email@outlook.com"
$env:SMTP_PASSWORD="sizin-outlook-parolu"
```

### Yahoo Mail:
```powershell
$env:SMTP_HOST="smtp.mail.yahoo.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="sizin-email@yahoo.com"
$env:SMTP_PASSWORD="app-specific-password"
```

### ProtonMail:
❌ **Tövsiyə olunmur** - ProtonMail Bridge (ödənişli) lazımdır və mürəkkəbdir.

---

## ✅ Tamamlandı!

İndi istifadəçilər şifrələrini unuduqda:
1. "Forgot password?" basır
2. Email daxil edir
3. Gmail qutusuna link gedir
4. Linki açır və yeni parol təyin edir

**Uğurlar! 🚀**

