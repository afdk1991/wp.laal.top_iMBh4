const { cache } = require('../config/redis');

// 缓存中间件
const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // 生成缓存键
    const key = `cache:${req.originalUrl}`;

    try {
      // 尝试从缓存获取数据
      const cachedData = await cache.get(key);
      if (cachedData) {
        return res.json(cachedData);
      }

      // 重写res.json方法，在返回响应时缓存数据
      const originalJson = res.json;
      res.json = function(data) {
        // 只缓存成功的响应
        if (data.code === 200) {
          cache.set(key, data, duration);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('缓存中间件错误:', error);
      next();
    }
  };
};

// 清除缓存的中间件
const clearCacheMiddleware = (pattern) => {
  return async (req, res, next) => {
    try {
      // 执行后续中间件
      next();

      // 清除匹配的缓存
      if (pattern) {
        // 这里简化处理，实际应该使用Redis的SCAN命令查找匹配的键
        console.log(`清除缓存: ${pattern}`);
      }
    } catch (error) {
      console.error('清除缓存错误:', error);
    }
  };
};

module.exports = {
  cacheMiddleware,
  clearCacheMiddleware
};