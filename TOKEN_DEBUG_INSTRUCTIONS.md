# 🔍 TOKEN DEBUG INSTRUCTIONS

## Problem
Token mövcuddur amma backend 401 qaytarır.

## Console-da Yoxla

```javascript
// 1. Token-u al
const token = Cookies.get('token');
console.log('Token:', token);

// 2. Token-u decode et (jwt.io saytında)
// https://jwt.io
// Token-u yapışdır və bax:
// - exp (expiration time) - bu timestamp
// - iat (issued at time) 
// - nameid (user ID)

// 3. Token expired-mi?
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token payload:', payload);
console.log('Token expiration:', new Date(payload.exp * 1000));
console.log('Current time:', new Date());
console.log('Is expired?', new Date(payload.exp * 1000) < new Date());

// 4. Manual API test
fetch('https://experiencesharingbackend.runasp.net/api/SavedExperience/check/29', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Həll

### Əgər Token Expired-dirsə:
1. Logout ol
2. Yenidən login ol
3. Yeni token alacaqsan

### Əgər Token Valid-dirsə amma Backend 401 qaytarırsa:
Backend problemi var - JWT secret uyğun gəlmir və ya validation problem var

