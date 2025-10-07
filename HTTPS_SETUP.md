# HTTPS Kurulum Rehberi

Bu rehber, React uygulamanızı HTTPS ile çalıştırmanın farklı yöntemlerini açıklar.

## 🚀 Hızlı Başlangıç

### Yöntem 1: Basit HTTPS (Önerilen - Development)

```bash
npm run start:https
```

Bu komut uygulamanızı `https://localhost:3000` adresinde çalıştırır.

### Yöntem 2: Custom SSL Sertifikası ile HTTPS

1. **SSL sertifikası oluşturun:**
   ```bash
   # Windows için
   certs\generate-cert.bat
   
   # Linux/Mac için
   chmod +x certs/generate-cert.sh
   ./certs/generate-cert.sh
   ```

2. **HTTPS ile çalıştırın:**
   ```bash
   npm run start:https:custom
   ```

### Yöntem 3: Production Server

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **SSL sertifikası oluşturun:**
   ```bash
   certs\generate-cert.bat
   ```

3. **Production server'ı çalıştırın:**
   ```bash
   npm run server:prod
   ```

## 📋 Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm start` | Normal HTTP development server |
| `npm run start:https` | HTTPS development server (self-signed cert) |
| `npm run start:https:custom` | Custom SSL sertifikası ile HTTPS |
| `npm run server` | Express.js server (development) |
| `npm run server:prod` | Production build + Express.js server |

## 🔒 SSL Sertifikası Detayları

### Self-Signed Sertifika
- **Dosya konumu:** `certs/` klasörü
- **Dosyalar:** `server.key`, `server.crt`
- **Geçerlilik:** 365 gün
- **Domain:** localhost

### Tarayıcı Uyarısı
Self-signed sertifika kullandığınızda tarayıcı güvenlik uyarısı verecektir. Bu normaldir ve geliştirme ortamı için güvenlidir.

**Chrome/Edge:** "Gelişmiş" → "localhost'a git (güvenli değil)"
**Firefox:** "Gelişmiş" → "Riski Kabul Et ve Devam Et"

## 🌐 Production Deployment

### Nginx ile HTTPS
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        root /path/to/your/build;
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache ile HTTPS
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /path/to/your/build
    
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    <Directory /path/to/your/build>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## 🔧 Sorun Giderme

### Port Çakışması
Eğer 3000 portu kullanımda ise:
```bash
PORT=3001 npm run start:https
```

### SSL Sertifika Hatası
```bash
# Sertifikaları yeniden oluşturun
rm certs/server.*
certs\generate-cert.bat
```

### Express Server Hatası
```bash
# Bağımlılıkları yeniden yükleyin
npm install express
```

## 📝 Notlar

- Development ortamında self-signed sertifika kullanabilirsiniz
- Production ortamında güvenilir bir CA'dan sertifika alın
- Let's Encrypt ücretsiz SSL sertifikası sağlar
- Cloudflare gibi CDN servisleri de SSL sağlayabilir
