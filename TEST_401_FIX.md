# Test Guide - 401 Error Fix

## Tez Test (Quick Test)

### 1. Backend-i Restart Et
```bash
# Backend folder-ə keç
cd ..\Experience-master\ExperienceProject

# Backend-i başlat
dotnet run
```

### 2. Frontend-i Aç
```bash
# Frontend folder-də (başqa terminal)
npm start
```

### 3. Test SaveButton
1. Browser-də `http://localhost:3000` aç
2. Login ol
3. Hər hansı experience-ə keç (məsələn Home page-dən bir card-a klik et)
4. Experience detail page-də **Save** butonunu bas
5. ✅ "Saved! 📌" mesajı görməlisən (401 error OLMAMALI)

### 4. Test Rating
1. Eyni experience detail page-də aşağı scroll et
2. **Rate This Experience** section-da:
   - Overall rating ver (məsələn 4 star)
   - İstəsən başqa category-lərə də rating ver
   - "Submit Rating" düyməsinə bas
3. ✅ "Your rating has been submitted!" mesajı görməlisən (401 error OLMAMALI)

## Ətraflı Test (Detailed Test)

### Browser Console-da Yoxla

#### SaveButton Logs:
Əvvəl (BEFORE FIX):
```
🔒 SaveButton - Token invalid or expired
```

İndi (AFTER FIX):
```
🔍 SaveButton - Checking saved status with token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
📥 SaveButton - Response status: 200
✅ SaveButton - Check successful: {isSaved: false}
```

#### Rating Logs:
Əvvəl (BEFORE FIX):
```
🔒 Your session has expired. Please log in again.
```

İndi (AFTER FIX):
```
✅ Your rating has been submitted!
```

### API Test (Postman/Thunder Client)

#### 1. Login
```
POST http://localhost:5000/api/Auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

Response-dan `token`-ı copy et.

#### 2. Test Save
```
POST http://localhost:5000/api/SavedExperience/1
Authorization: Bearer {TOKEN_BURAYA_YAPIŞTIR}
```

Expected: `200 OK` (401 deyil!)

#### 3. Test Rating
```
POST http://localhost:5000/api/Rating/experience/1
Authorization: Bearer {TOKEN_BURAYA_YAPIŞTIR}
Content-Type: application/json

{
  "overallRating": 4,
  "review": "Great experience!"
}
```

Expected: `200 OK` (401 deyil!)

## Troubleshooting

### Problem: Hələ də 401 alıram
**Həll:**
1. Backend-i tam restart et (Ctrl+C və yenidən `dotnet run`)
2. Browser-də cache clear et (Ctrl+Shift+Delete)
3. Yenidən login ol (köhnə token-lar artıq valid olmaya bilər)

### Problem: Token expired error
**Həll:**
- Normal haldır, token 24 saat (1440 dəqiqə) keçərlidir
- Yenidən login ol və yeni token al

### Problem: Backend başlamır
**Həll:**
```bash
# Port məşğuldursa
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Və ya başqa port istifadə et
dotnet run --urls "http://localhost:5001"
```

## Success Criteria (Uğur Meyarları)

✅ SaveButton bas → "Saved! 📌" mesajı gəlir
✅ Rating submit et → "Your rating has been submitted!" mesajı gəlir
✅ Console-da 401 error yoxdur
✅ SweetAlert-lər düzgün görsənir
✅ Experience save/unsave düzgün işləyir
✅ Rating sistemdə yazılır

## Additional Tests

### Test Unsave
1. Saved experience-ə yenidən keç
2. Save butonunu yenidən bas (unsave etmək üçün)
3. ✅ "Unsaved!" mesajı görməlisən

### Test Multiple Ratings
1. Fərqli experience-lərə rating ver
2. Hamısı 200 OK olmalıdır
3. Ratings display-də görünməlidir

### Test Check Saved Status
1. Experience-ə gir
2. Page load olarkən SaveButton-un state-i yoxlanır
3. Console-da "✅ SaveButton - Check successful" görməlisən

---

**Important**: Backend dəyişikliyi olduğu üçün, backend-i mütləq restart etməlisən!

