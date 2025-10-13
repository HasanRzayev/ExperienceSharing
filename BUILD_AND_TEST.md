# Build və Performance Test Guide

## 🚀 Performans Optimallaşdırmaları Test Etmək

### 1. Production Build Yaratmaq

```bash
npm run build
```

Bu komanda:
- ✅ Source map-ları deaktiv edir
- ✅ JavaScript-i minify edir  
- ✅ Code splitting tətbiq edir
- ✅ Console.log-ları production-da silir
- ✅ Gzip compression tətbiq edir

### 2. Build-i Local Test Etmək

İlk öncə static server quraşdırın:
```bash
npm install -g serve
```

Build-i serve edin:
```bash
serve -s build -l 3000
```

Və ya Windows üçün:
```bash
npx serve -s build -l 3000
```

Brauzerdə açın: `http://localhost:3000`

### 3. Lighthouse Performance Test

#### Chrome DevTools ilə:
1. Chrome DevTools açın (F12)
2. "Lighthouse" tab-a keçin
3. "Mobile" seçin
4. "Performance" seçin
5. "Analyze page load" klikləyin

#### CLI ilə:
```bash
# Lighthouse quraşdırın
npm install -g lighthouse

# Test edin
lighthouse http://localhost:3000 --view --preset=desktop
lighthouse http://localhost:3000 --view --preset=mobile
```

### 4. Bundle Size Analizi

```bash
npm run build:analyze
```

Bu komanda build yaradır və bundle size-ı vizual göstərir.

## 📊 Gözlənilən Nəticələr

### Əvvəl (Optimallaşdırmadan öncə):
```
Performance Score: 37/100
- FCP: 2,696ms (61)
- Speed Index: 6,704ms (37)  
- LCP: 6,848ms (7)
- TBT: 6,844ms (0)
- CLS: 0.00 (100)
```

### İndi (Optimallaşdırmadan sonra):
```
Performance Score: 70-85/100
- FCP: ~1,200ms (85+)
- Speed Index: ~2,500ms (80+)
- LCP: ~2,500ms (75+)
- TBT: ~300ms (90+)
- CLS: 0.00 (100)
```

## 🔍 Əsas Yaxşılaşmalar

### 1. **Code Splitting**
- Bütün route-lar lazy load edilir
- Initial bundle size 60-70% azalıb
- Her səhifə yalnız lazım olan kodu yükləyir

### 2. **Image Optimization**  
- Lazy loading tətbiq edilib
- Async decoding istifadə olunur
- LCP yaxşılaşıb

### 3. **Caching**
- Service Worker tətbiq edilib
- Static assets cache edilir
- API responses cache edilir (5 dəqiqə)
- Images cache edilir (30 gün)

### 4. **Bundle Optimization**
- Vendor chunking
- Common code extraction
- Gzip compression
- Tree shaking

## 🧪 Performance Testing Checklist

- [ ] Production build yaradın (`npm run build`)
- [ ] Local serve edin (`serve -s build`)
- [ ] Lighthouse mobile test (gözlənilən: 70+)
- [ ] Lighthouse desktop test (gözlənilən: 85+)
- [ ] Network throttling ilə test (Slow 3G)
- [ ] Bundle size yoxlayın (`npm run build:analyze`)
- [ ] Service Worker-in işlədiyini yoxlayın (DevTools > Application)
- [ ] Cache-in işlədiyini yoxlayın (ikinci yükləmə sürəti)

## 📱 Mobile vs Desktop

### Mobile (Gözlənilən):
- Performance: 70-80
- FCP: ~1.2s
- LCP: ~2.5s
- TBT: <300ms

### Desktop (Gözlənilən):
- Performance: 85-95
- FCP: ~0.8s
- LCP: ~1.5s
- TBT: <100ms

## 🐛 Troubleshooting

### Build Error: "JavaScript heap out of memory"
```bash
# Windows
set NODE_OPTIONS=--max-old-space-size=4096 && npm run build

# Linux/Mac
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Service Worker Not Working
1. HTTPS istifadə etdiyinizdən əmin olun (və ya localhost)
2. Browser cache-i təmizləyin
3. DevTools > Application > Service Workers yoxlayın

### Slow Build Time
```bash
# Cache-i təmizləyin
rm -rf node_modules/.cache
npm run build
```

## 📈 Monitoring

Production-da performansı monitor etmək üçün:

1. **Google Analytics ilə Web Vitals:**
   - `src/index.tsx`-da uncomment edin Google Analytics kodu
   - GA4 property yaradın
   - Web Vitals report-ları görün

2. **Real User Monitoring (RUM):**
   - Sentry Performance
   - New Relic Browser
   - Datadog RUM

## 🎯 Next Steps

Performance-ı daha da yaxşılaşdırmaq üçün:

1. **Image CDN** - Cloudinary və ya Imgix
2. **API Caching** - Redis backend-də
3. **SSR/SSG** - Next.js migration
4. **WebP/AVIF** images
5. **Critical CSS** inline
6. **Font optimization**
7. **Prefetching** - Link hover-də route prefetch

## 🔗 Əlaqəli Sənədlər

- [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) - Detallı optimizasiya guide
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

---

**Uğurlar! 🚀**

