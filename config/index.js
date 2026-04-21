module.exports = {
  app: {
    name: 'MIXMLAAL',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mixmlaal',
    connectionLimit: 10,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  api: {
    prefix: '/api/v1',
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },
  map: {
    providers: ['amap', 'baidu', 'tencent'],
    default: 'amap',
    keys: {
      amap: process.env.AMAP_KEY || '',
      baidu: process.env.BAIDU_MAP_KEY || '',
      tencent: process.env.TENCENT_MAP_KEY || '',
    },
  },
  payment: {
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_API_KEY || '',
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    },
  },
  sms: {
    provider: 'aliyun',
    accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '',
  },
  upload: {
    provider: 'local',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    local: {
      uploadDir: 'uploads',
    },
    oss: {
      region: process.env.OSS_REGION || '',
      bucket: process.env.OSS_BUCKET || '',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    },
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: true,
      path: 'logs',
      maxFiles: 30,
      maxSize: 10 * 1024 * 1024,
    },
  },
};
