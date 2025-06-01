// Global API Cache sistemi
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 dakika
  }

  // Cache'e veri ekle
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  // Cache'den veri al
  get(key) {
    const expiry = this.cacheExpiry.get(key);
    const now = Date.now();

    // Expire olmuşsa sil
    if (expiry && now > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.cache.get(key) || null;
  }

  // Cache'i temizle
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Belirli pattern'e uyan cache'leri sil
  invalidatePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // Cache boyutunu kontrol et (memory leak önlemi)
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }

    // Maksimum 100 entry tut
    if (this.cache.size > 100) {
      const oldestKeys = Array.from(this.cache.keys()).slice(0, 50);
      oldestKeys.forEach(key => {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      });
    }
  }
}

// Global cache instance
export const apiCache = new ApiCache();

// Her 10 dakikada bir cache cleanup yap
setInterval(() => {
  apiCache.cleanup();
}, 10 * 60 * 1000);

export default apiCache; 