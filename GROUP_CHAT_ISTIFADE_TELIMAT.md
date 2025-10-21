# Group Chat İstifadə Təlimatı

## 🚀 Necə Group Yaratmalı?

### Addım 1: Group Chat Page-ə Get

**2 yol var:**

#### Yol 1: Navbar-dan
```
1. Üst menyudan "Groups" düyməsinə bas
   (Messages-in yanında)
```

#### Yol 2: Direct URL
```
Browser-də yaz:
http://localhost:3000/group-chat
```

---

### Addım 2: Group Yaratma Modalını Aç

1. **Group Chat page açıldı?** ✅
2. **Sağ üst küncdə "+" (plus) düyməsi görürsən?** 
   - Mor rəngli, dairəvi düymə
   - Purple/Blue gradient fonda
3. **Bu düyməyə BAS!** 👆

---

### Addım 3: Group Məlumatlarını Daxil Et

Modal açılacaq, burda:

#### 1️⃣ Group Name (Vacib)
```
Məsələn:
- "Travel Buddies 🌍"
- "Adventure Squad"
- "Dostlar Qrupu"
```

#### 2️⃣ Description (İstəyə görə)
```
Məsələn:
- "Let's explore the world together!"
- "Səyahət planları paylaşmaq üçün"
```

#### 3️⃣ Members Seç

**Necə seçmək olar:**

1. **Search box-a yaz**
   ```
   İstifadəçi adı və ya username yaz
   Məsələn: "John", "user123"
   ```

2. **Listdən seç**
   ```
   - Hər istifadəçinin üzərinə klikləyəndə seçilir ✅
   - Yenidən klikləyəndə seçim silinir
   - Çoxlu istifadəçi seçə bilərsən
   ```

3. **Seçilmiş sayı görünür**
   ```
   Aşağıda yazacaq: "3 member(s) selected"
   ```

---

### Addım 4: Group Yarat!

1. **"Create Group"** düyməsinə bas (aşağıda, yeşil/blue)
2. **Success alert gələcək!** ✅
3. **Modal bağlanacaq**
4. **Sol sidebar-də yeni group görünəcək!** 🎉

---

## 💬 Necə Mesaj Göndərmək?

### Addım 1: Group Seç
```
Sol sidebar-dən yaratdığın group-u seç
Seçilən group mor rəngli border ilə highlight olacaq
```

### Addım 2: Mesaj Yaz
```
Aşağıdakı input field-də:
"Type a message..." yazılıb

Burda mesajını yaz
```

### Addım 3: Send Bas!
```
"Send" düyməsinə bas və ya Enter bas
Mesaj dərhal görsənəcək! 📨
```

---

## 🎨 UI Elements (Nə Görəcəksən)

### Sol Sidebar (Groups List):
```
┌─────────────────────────┐
│  Groups     [+]         │ ← Header
├─────────────────────────┤
│  📷 Travel Squad        │ ← Group 1
│     5 members           │
├─────────────────────────┤
│  📷 Dostlar             │ ← Group 2
│     3 members           │
└─────────────────────────┘
```

### Sağ Tərəf (Chat Area):
```
┌─────────────────────────────────┐
│  📷 Travel Squad       ⚙️       │ ← Header
│     5 members                   │
├─────────────────────────────────┤
│                                 │
│  👤 John: Hey everyone! 👋      │ ← Message
│     10:30 AM                    │
│                                 │
│  👤 Sara: Hello! 😊             │
│     10:35 AM                    │
│                                 │
├─────────────────────────────────┤
│  [Type a message...] [Send]    │ ← Input
└─────────────────────────────────┘
```

### Create Modal:
```
┌──────────────────────────────┐
│  Create New Group        [X] │ ← Header
├──────────────────────────────┤
│                              │
│  Group Name *                │
│  ┌────────────────────────┐  │
│  │ Enter group name...    │  │
│  └────────────────────────┘  │
│                              │
│  Description (optional)      │
│  ┌────────────────────────┐  │
│  │ What's this about?     │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  Add Members                 │
│  ┌────────────────────────┐  │
│  │ 🔍 Search users...     │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ ✓ John Doe             │  │ ← Selected
│  │   Mary Smith           │  │ ← Not selected
│  │ ✓ Bob Johnson          │  │ ← Selected
│  └────────────────────────┘  │
│                              │
│  2 member(s) selected        │
│                              │
│  [Cancel]  [Create Group]   │ ← Buttons
└──────────────────────────────┘
```

---

## ❓ Problem Solving

### Problem 1: "+" Düyməsi Görsənmir
**Həll:**
- Page tam yüklənməyib, bir az gözlə
- Browser refresh et (F5)
- Login olduğundan əmin ol

### Problem 2: Members Görsənmir
**Həll:**
- Search box-da yazmağa başla
- Backend işləyir?
- Heç bir contact/follower yoxdursa, boş olacaq
  - Əvvəlcə başqa istifadəçiləri follow et

### Problem 3: Group Yaradılmır
**Console Error yoxla:**
```
1. F12 bas
2. Console tab-a get
3. Qırmızı error varsa, screenshot gətir
```

**Ümumi səbəblər:**
- Group name daxil etməmisən
- Backend işləmir
- Token expired (logout/login et)

### Problem 4: Mesajlar Görsənmir
**Həll:**
- Group seçilməyib? Sidebar-dən seç
- Page refresh et
- Backend yoxla (API running?)

---

## 🎯 Quick Test

### Test 1: Create Group
```
1. Groups page → "+" bas
2. Name: "Test Group"
3. Description: "Testing"
4. Members: Seç 1-2 nəfər
5. Create → Success! ✅
```

### Test 2: Send Message
```
1. "Test Group" seç (sidebar)
2. Input-da yaz: "Hello! 👋"
3. Send bas
4. Mesaj görünür? ✅
```

### Test 3: Multiple Messages
```
1. Bir neçə mesaj göndər
2. Hamısı görünür?
3. Sender name düzgündür?
4. Timestamp var? ✅
```

---

## 📱 Mobile View

**Mobil telefonda:**
- Hamburger menu (☰) → Groups
- Eyni funksionallıq
- Responsive design

---

## 🔐 Permissions

### Kim Nə Edə Bilər?

#### Group Creator (Yaradan):
- ✅ Messages göndərə bilər
- ✅ Members əlavə edə bilər (future)
- ✅ Group edit edə bilər (future)
- ✅ Group silə bilər (future)

#### Group Member:
- ✅ Messages göndərə bilər
- ✅ Messages oxuya bilər
- ✅ Group-dan çıxa bilər (future)

#### Non-Member:
- ❌ Group görsənməz
- ❌ Messages görsənməz

---

## 💡 Tips & Tricks

### Tip 1: Search İstifadə Et
```
Member seçərkən çox istifadəçi varsa:
Search box-da adını yaz və tap!
```

### Tip 2: Multiple Selection
```
Ctrl basıb tut və klikləyə bilərsən
və ya tək-tək seç
```

### Tip 3: Group Name
```
Emoji istifadə et! 😎
"Travel Squad 🌍"
"Dostlar ❤️"
"Adventure 🏔️"
```

### Tip 4: Description Yaz
```
Description yazsaň, group-un məqsədi aydın olar:
"Weekend hiking trips"
"Coffee meetups"
```

---

## 🎬 Video Təlimat (Yazılı)

```
[0:00] 1. Navbar → "Groups" klik
[0:02] 2. Page açıldı
[0:03] 3. Sağ üstdə "+" düyməsinə klik
[0:05] 4. Modal açıldı
[0:06] 5. Group Name: "My Group"
[0:08] 6. Description: "Test group"
[0:10] 7. Search box: "john" yaz
[0:12] 8. John Doe-nu seç ✅
[0:14] 9. "Create Group" bas
[0:16] 10. Success! Group yarandı!
[0:18] 11. Sidebar-də group görünür
[0:20] 12. Group-u seç
[0:22] 13. "Hello!" yaz
[0:24] 14. "Send" bas
[0:25] 15. Mesaj göründü! ✅
```

---

## ✅ Checklist

İndi yoxla:

- [ ] `npm start` işləyir?
- [ ] Backend işləyir?
- [ ] Login oldun?
- [ ] Navbar-da "Groups" görürsən?
- [ ] Groups page açılır?
- [ ] "+" düyməsi var?
- [ ] Modal açılır?
- [ ] Members listində istifadəçilər var?
- [ ] Group yarada bildin?
- [ ] Mesaj göndərə bildin?

**Hamısı ✅-dırsa, PERFECT!** 🎉

---

## 📞 Support

Problem olursa:
1. Browser console-da error yoxla (F12)
2. Backend console-da log yoxla
3. Screenshot çək
4. Mənə göstər!

---

**Uğurlar! Enjoy group chat! 🎊**

