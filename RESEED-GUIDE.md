# 🔄 Seed Data Çalıştırma Rehberi

## ❌ Problem

Seed data çalışmıyor çünkü **Users tablosunda user var**.

SeedData.cs sadece **Users tablosu boşsa** çalışır:
```csharp
if (await context.Users.AnyAsync())
{
    return; // Çalışmayı durdur
}
```

---

## ✅ Çözümler

### **Çözüm 1: Users tablosunu temizle**

```sql
USE db28857;
DELETE FROM Users;
```

Sonra:
- Application restart et
- Seed data yüklenir

---

### **Çözüm 2: Butun database-i temizle**

1. `DROP-ULTIMATE.sql` çalıştır
2. Application restart et
3. Migration'lar tabloları oluşturur
4. Seed data otomatik yüklenir

---

### **Çözüm 3: SeedData.cs değiştirildi** ✅

Artık:
- 50'den fazla user varsa skip eder
- 50'den az user varsa seed data ekler

---

## 🚀 Quick Fix

### Adım 1: Users'i sil
```sql
USE db28857;
DELETE FROM Users;
```

### Adım 2: Application restart
```
Monster panel → Application → Restart
```

### Adım 3: Bekle
```
Seed data yükleniyor...
50 users oluşturuluyor...
```

---

## ✅ Başarılı

Eğer şunu görürsen:
```
✅ Created 50 users
✅ Created 30-60 experiences
```

**BAŞARILI!** 🎉

---

## 🔐 Login

```
Email: admin@wanderly.com
Password: Admin123!
```

