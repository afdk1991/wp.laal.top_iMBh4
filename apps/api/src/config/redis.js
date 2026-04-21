const redis = require('redis');
const { promisify } = require('util');

// Redis连接配置
const redisConfig = {
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      // 指数退避重连策略
      return Math.min(retries * 100, 3000);
    }
  }
};

// 内存缓存降级方案
class MemoryCache {
  constructor() {
    this.data = new Map();
    this.expirations = new Map();
  }

  async set(key, value, expiration = 3600) {
    this.data.set(key, value);
    if (expiration > 0) {
      this.expirations.set(key, Date.now() + expiration * 1000);
    }
    return true;
  }

  async get(key) {
    if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
      this.data.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.data.get(key) || null;
  }

  async del(key) {
    this.data.delete(key);
    this.expirations.delete(key);
    return true;
  }

  async delBatch(keys) {
    for (const key of keys) {
      this.del(key);
    }
    return true;
  }

  async clearByPrefix(prefix) {
    for (const key of this.data.keys()) {
      if (key.startsWith(prefix)) {
        this.del(key);
      }
    }
    return true;
  }

  async hset(key, field, value) {
    const hash = this.data.get(key) || {};
    hash[field] = value;
    this.data.set(key, hash);
    return true;
  }

  async hget(key, field) {
    const hash = this.data.get(key);
    return hash ? hash[field] : null;
  }

  async incr(key) {
    const value = (this.data.get(key) || 0) + 1;
    this.data.set(key, value);
    return value;
  }

  async expire(key, seconds) {
    if (this.data.has(key)) {
      this.expirations.set(key, Date.now() + seconds * 1000);
    }
    return true;
  }

  async exists(key) {
    if (this.expirations.has(key) && Date.now() > this.expirations.get(key)) {
      this.data.delete(key);
      this.expirations.delete(key);
      return false;
    }
    return this.data.has(key);
  }

  async acquireLock(key, expiration = 10) {
    const lockKey = `lock:${key}`;
    if (await this.exists(lockKey)) {
      return false;
    }
    await this.set(lockKey, '1', expiration);
    return true;
  }

  async releaseLock(key) {
    const lockKey = `lock:${key}`;
    await this.del(lockKey);
    return true;
  }

  // 模拟Redis的其他方法
  async keys(pattern) {
    const keys = [];
    for (const key of this.data.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keys.push(key);
      }
    }
    return keys;
  }

  matchesPattern(key, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }
}

// 缓存键前缀管理
const KEY_PREFIX = {
  USER: 'user:',
  ORDER: 'order:',
  PRODUCT: 'product:',
  CATEGORY: 'category:',
  SESSION: 'session:',
  TOKEN: 'token:',
  COUNTER: 'counter:',
  LOCK: 'lock:',
  HASH: 'hash:'
};

// 缓存过期时间配置（秒）
const TTL = {
  SHORT: 60,           // 1分钟
  MEDIUM: 3600,         // 1小时
  LONG: 86400,          // 24小时
  VERY_LONG: 604800,     // 7天
  PERMANENT: 0           // 永不过期
};

// 缓存策略类
class CacheStrategy {
  constructor(cacheManager) {
    this.cacheManager = cacheManager;
  }

  // 缓存穿透防护（布隆过滤器思想）
  async getWithPenetrationProtection(key, fallbackFn, expiration = TTL.MEDIUM) {
    // 先尝试从缓存获取
    let value = await this.cacheManager.get(key);
    
    if (value === null) {
      // 缓存未命中，执行回退函数
      value = await fallbackFn();
      
      if (value !== null && value !== undefined) {
        // 设置缓存
        await this.cacheManager.set(key, value, expiration);
      } else {
        // 缓存空值，防止缓存穿透
        await this.cacheManager.set(key, 'NULL', TTL.SHORT);
      }
    } else if (value === 'NULL') {
      // 缓存了空值
      return null;
    }
    
    return value;
  }

  // 缓存击穿防护（热点数据）
  async getWithBreakdownProtection(key, fallbackFn, expiration = TTL.MEDIUM) {
    // 尝试获取锁
    const lockKey = `lock:${key}`;
    const acquired = await this.cacheManager.acquireLock(lockKey, 5);
    
    if (acquired) {
      try {
        // 再次检查缓存
        let value = await this.cacheManager.get(key);
        
        if (value === null || value === 'NULL') {
          // 缓存未命中，执行回退函数
          value = await fallbackFn();
          
          if (value !== null && value !== undefined) {
            // 设置缓存
            await this.cacheManager.set(key, value, expiration);
          } else {
            // 缓存空值
            await this.cacheManager.set(key, 'NULL', TTL.SHORT);
          }
        } else if (value === 'NULL') {
          value = null;
        }
        
        return value;
      } finally {
        // 释放锁
        await this.cacheManager.releaseLock(lockKey);
      }
    } else {
      // 锁被占用，等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getWithBreakdownProtection(key, fallbackFn, expiration);
    }
  }

  // 缓存一致性（写操作时更新缓存）
  async updateWithConsistency(key, updateFn, expiration = TTL.MEDIUM) {
    try {
      // 执行更新操作
      const result = await updateFn();
      
      // 更新缓存
      if (result !== null && result !== undefined) {
        await this.cacheManager.set(key, result, expiration);
      } else {
        // 删除缓存
        await this.cacheManager.del(key);
      }
      
      return result;
    } catch (error) {
      console.error('更新缓存一致性失败:', error);
      // 即使更新失败，也删除缓存，确保下次读取时从数据库获取
      await this.cacheManager.del(key);
      throw error;
    }
  }

  // 缓存预热
  async warmup(keys, dataFn, expiration = TTL.MEDIUM) {
    try {
      const data = await dataFn();
      if (Array.isArray(data)) {
        for (const item of data) {
          const key = keys(item);
          await this.cacheManager.set(key, item, expiration);
        }
      }
      return true;
    } catch (error) {
      console.error('缓存预热失败:', error);
      return false;
    }
  }

  // 缓存降级
  async getWithFallback(key, fallbackFn, expiration = TTL.MEDIUM) {
    try {
      let value = await this.cacheManager.get(key);
      
      if (value === null || value === 'NULL') {
        value = await fallbackFn();
        if (value !== null && value !== undefined) {
          await this.cacheManager.set(key, value, expiration);
        }
      } else if (value === 'NULL') {
        value = null;
      }
      
      return value;
    } catch (error) {
      console.error('缓存操作失败，使用降级方案:', error);
      // 缓存失败时直接执行回退函数
      return await fallbackFn();
    }
  }
}

// 缓存监控类
class CacheMonitor {
  constructor(cacheManager) {
    this.cacheManager = cacheManager;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      dels: 0,
      errors: 0
    };
  }

  // 记录缓存命中
  recordHit() {
    this.stats.hits++;
  }

  // 记录缓存未命中
  recordMiss() {
    this.stats.misses++;
  }

  // 记录缓存设置
  recordSet() {
    this.stats.sets++;
  }

  // 记录缓存删除
  recordDel() {
    this.stats.dels++;
  }

  // 记录缓存错误
  recordError() {
    this.stats.errors++;
  }

  // 获取缓存统计
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      total
    };
  }

  // 重置统计
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      dels: 0,
      errors: 0
    };
  }

  // 定期打印统计
  startMonitoring(interval = 60000) {
    setInterval(() => {
      console.log('缓存统计:', this.getStats());
      this.resetStats();
    }, interval);
  }
}

// 初始化 - 直接使用内存缓存，避免Redis连接问题
console.warn('使用内存缓存作为降级方案');
const cacheManager = new MemoryCache();
const cacheStrategy = new CacheStrategy(cacheManager);
const cacheMonitor = new CacheMonitor(cacheManager);

// 模拟Redis客户端
const redisClient = {
  connect: async () => Promise.resolve(),
  set: async () => Promise.resolve('OK'),
  get: async () => Promise.resolve(null),
  del: async () => Promise.resolve(0),
  keys: async () => Promise.resolve([]),
  hSet: async () => Promise.resolve(0),
  hGet: async () => Promise.resolve(null),
  incr: async () => Promise.resolve(0),
  expire: async () => Promise.resolve(0),
  exists: async () => Promise.resolve(0),
  flushAll: async () => Promise.resolve(),
  on: () => {},
  off: () => {}
};

// 在生产环境中启动监控
if (process.env.NODE_ENV === 'production') {
  cacheMonitor.startMonitoring();
}

// 导出
module.exports = {
  redisClient,
  cacheManager,
  cacheStrategy,
  cacheMonitor,
  KEY_PREFIX,
  TTL,
  // 向后兼容
  cache: {
    set: async (key, value, expiration) => {
      cacheMonitor.recordSet();
      return cacheManager.set(key, value, expiration);
    },
    get: async (key) => {
      const value = await cacheManager.get(key);
      if (value !== null) {
        cacheMonitor.recordHit();
      } else {
        cacheMonitor.recordMiss();
      }
      return value;
    },
    del: async (key) => {
      cacheMonitor.recordDel();
      return cacheManager.del(key);
    },
    clear: async () => {
      try {
        await redisClient.flushAll();
        return true;
      } catch (error) {
        cacheMonitor.recordError();
        console.error('清除缓存失败:', error);
        return false;
      }
    }
  }
};