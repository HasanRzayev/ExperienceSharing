# 🔑 API Key Troubleshooting Guide

## Current Error

```
404: models/gemini-1.5-flash is not found for API version v1beta
```

This means your API key either:
1. ❌ Doesn't have access to Gemini 1.5 models
2. ❌ Isn't enabled for Generative AI API
3. ❌ Is restricted by region or quota
4. ❌ Is invalid or expired

---

## ✅ Solution: Get a New API Key

### Step 1: Go to Google AI Studio

Visit: **https://aistudio.google.com/app/apikey**

(NOT Google Cloud Console - use AI Studio directly!)

### Step 2: Create New API Key

1. Click **"Get API Key"** or **"Create API Key"**
2. Choose **"Create API key in new project"** (recommended)
3. Copy the generated key
4. It should look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 3: Update Your .env File

Open or create `.env` file in project root:

```env
REACT_APP_API_BASE_URL=http://localhost:5029/api
REACT_APP_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_GOOGLE_CLIENT_ID=680043772059-av648urt1kjqrqucf47q43tm908egorb.apps.googleusercontent.com
```

**Replace** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your actual key!

### Step 4: Restart Frontend

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

---

## 🔍 Important Notes

### 1. Use Google AI Studio (NOT Google Cloud Console)

❌ **WRONG**: https://console.cloud.google.com  
✅ **CORRECT**: https://aistudio.google.com/app/apikey

Google AI Studio provides direct access to Gemini API without complex Cloud setup.

### 2. No Credit Card Required

- ✅ Free tier available
- ✅ Generous quota (60 requests/minute)
- ✅ No billing setup needed
- ✅ Instant activation

### 3. Supported Models

Your key should work with:
- ✅ `gemini-1.5-flash-latest` (what we're using - fastest)
- ✅ `gemini-1.5-pro-latest` (more powerful)
- ✅ `gemini-pro` (legacy)

---

## 🧪 Test Your API Key

After getting a new key, test it immediately:

### Method 1: In Browser (Easiest)

1. Restart frontend (`npm start`)
2. Go to http://localhost:3000/travel-guide
3. Enter "Paris" or any location
4. Click "Explore"
5. Should work! 🎉

### Method 2: Direct API Test (Advanced)

Open browser console on http://localhost:3000:

```javascript
const { GoogleGenerativeAI } = await import("@google/generative-ai");
const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
const result = await model.generateContent("Say hello");
const response = await result.response;
console.log(response.text());
```

If this works, you'll see "Hello!" or similar response.

---

## ❓ Still Not Working?

### Error: "API key not valid"
**Solution**: Get a fresh key from AI Studio

### Error: "Quota exceeded"
**Solution**: Wait a few minutes or use different Google account

### Error: "Region not supported"
**Solution**: 
1. Use VPN (if in restricted region)
2. Or use different Google account registered in supported region

### Error: "Module not found"
**Solution**: 
```bash
npm install @google/generative-ai
npm start
```

---

## 📊 Current Setup

| Component | Model | Status |
|-----------|-------|--------|
| SDK | @google/generative-ai | ✅ Installed |
| Model | gemini-1.5-flash-latest | ⚠️ Needs valid key |
| Endpoint | Auto-managed by SDK | ✅ Automatic |

---

## 🎯 Quick Checklist

- [ ] Got new API key from https://aistudio.google.com/app/apikey
- [ ] Added key to `.env` file as `REACT_APP_GEMINI_API_KEY=...`
- [ ] Restarted frontend server (`npm start`)
- [ ] Tested in browser at http://localhost:3000/travel-guide
- [ ] Received AI recommendations successfully! 🎉

---

## 💡 Pro Tips

1. **Keep your API key secret** - Never commit `.env` to git
2. **Free tier limits**: 60 requests/minute, 1500 requests/day
3. **For production**: Consider upgrading to paid tier
4. **Multiple keys**: You can create multiple keys for different environments

---

## 📞 Need More Help?

### Official Resources:
- Google AI Studio: https://aistudio.google.com
- Gemini API Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing

### Common Questions:

**Q: Do I need a Google Cloud account?**  
A: No! Just a regular Google account (Gmail) is enough.

**Q: Will I be charged?**  
A: No, free tier is very generous for development.

**Q: Can I use it in production?**  
A: Yes, but monitor your usage and consider rate limiting.

---

**Last Updated**: October 17, 2025  
**Status**: Waiting for valid API key  
**Next Step**: Get key from https://aistudio.google.com/app/apikey


