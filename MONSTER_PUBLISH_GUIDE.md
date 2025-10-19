# 🚀 Monster ASP.NET Backend Publish Guide

## 📋 Yeni Backend Publish Edilməsi

### ✅ Publish Hazır:
**Folder**: `C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject\publish\`

---

## 🗑️ Server-dən ƏVVƏLCƏDƏN SİLMƏLİ OLANLAR:

Monster panel → **File Manager**-də bunları **SİL**:

### ✅ SİL:
- ❌ **Controllers/** (köhnə controller faylları)
- ❌ **Services/** (köhnə service faylları)
- ❌ **bin/** (köhnə compiled fayllar)
- ❌ **obj/** (əgər varsa)
- ❌ **wwwroot/** (statik fayllar - lazım deyil)
- ❌ **Data/** (köhnü DbContext)
- ❌ **Dto/** (köhnü DTO-lar)
- ❌ **Helpers/** (köhnü helper-lər)
- ❌ **Hubs/** (köhnü SignalR hubs)
- ❌ **Models/** (köhnü modellər)
- ❌ **Migrations/** (köhnü migration faylları)
- ❌ **Program.cs** (köhnü startup faylı)
- ❌ **ExperienceProject.deps.json**
- ❌ **ExperienceProject.dll**
- ❌ **ExperienceProject.pdb**
- ❌ **ExperienceProject.runtimeconfig.json**
- ❌ **web.config**

### ✅ SAXLA:
- ✅ **appsettings.json** (SAXLA!)
- ✅ **appsettings.Production.json** (SAXLA! SMTP konfiqurasiyası buradadır)
- ✅ **uploads/** (user-lərin yüklədikləri fayllar)

---

## 📤 Yeni Faylları Yüklə:

1. **publish/** folder-dəki BÜTÜN faylları seç
2. **ZIP et** (sağ klik → Compress to ZIP)
3. Monster panel-ə yüklə
4. **Extract** et server-də
5. **Application → Restart**

---

## 🔑 Əsas Dəyişiklik:

**Controllers/AuthConroller.cs** - Line 185:
```csharp
// YENİ KOD:
if (userDto.Email.ToLower() != "admin@wanderly.com")
{
    return Unauthorized("Only admin can log in.");
}
```

---

## 🧪 Test:

Publish-dən sonra:

```
Email: admin@wanderly.com
Password: Admin123
```

Bu ilə admin login işləməlidir! ✅

---

## 📊 Production Credentials:

```
Backend URL: https://experiencesharingbackend.runasp.net
Admin Email: admin@wanderly.com
Admin Password: Admin123
```

---

**Uğurlar!** 🎉

