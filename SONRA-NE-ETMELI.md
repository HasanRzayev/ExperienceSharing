# ✅ SORASINDƏ NƏ ETMƏLİ?

## 🚀 Query işə saldıqdan sonra addım-addım

### 1️⃣ **Application Restart Et**

Monster Panel-da:
1. **Application** → **Stop** klik et
2. 10 saniyə gözlə
3. **Application** → **Restart** klik et

---

### 2️⃣ **Seed Data Yüklənməsini Gözlə**

Application restart olduqdan sonra **30-60 saniyə** gözlə. Seed data avtomatik yüklənəcək.

Terminal log-larında bunları görməlisen:
```
✅ Created 50 users
✅ Created 30-60 experiences
✅ Created 15-50 status stories  
✅ Created 100+ comments
```

---

### 3️⃣ **Test Et**

Seed data yükləndikdən sonra:

#### A. Admin Login
```
Email: admin@wanderly.com
Password: Admin123!
```

#### B. API Test Et
```
GET /api/users       → 50 user görmelisen
GET /api/experiences → 30-60 experience görmelisen
GET /api/status      → 15-50 status görmelisen
```

---

## 📊 Seed Data Nə Daxildir?

| Data | Sayı |
|------|------|
| Users | 50 (admin daxil) |
| Experiences | 30-60 |
| Experiences with videos | 15-18 (30% ehtimal) |
| Status/Stories | 15-50 |
| Comments | 100+ |
| Tags | 40 |
| Likes, Follows | Realistic |

---

## ✅ BAŞARILI OLSA

Əgər test edib bu nəticələri görürsənsə:

1. ✅ Admin login işləyir
2. ✅ 50 user var
3. ✅ Experience-lər yükləndi
4. ✅ Status/stories görünür
5. ✅ Comments işləyir

**O ZAMAN BAŞARILI!** 🎉

---

## ⚠️ Problem Varsa

Əgər seed data yüklənməyibsə:

1. Connection string yoxla
2. Application log-larına bax
3. Database-i yenidən işə sal

---

**Uğurlar!** 🚀

