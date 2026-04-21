require('dotenv').config();

// 地图服务配置
const mapConfig = {
  // 高德地图API配置
  amap: {
    key: process.env.AMAP_KEY || 'your-amap-key',
    baseUrl: 'https://restapi.amap.com/v3',
    // 地理编码接口
    geocode: '/geocode/geo',
    // 逆地理编码接口
    regeocode: '/geocode/regeo',
    // 路径规划接口
    direction: '/direction/driving',
    // 批量算路接口
    batchDirection: '/direction/driving/batch',
    // 距离计算接口
    distance: '/distance',
    // 实时路况接口
    traffic: '/traffic/status'
  },
  // 百度地图API配置（备选）
  baidu: {
    key: process.env.BAIDU_MAP_KEY || 'your-baidu-map-key',
    baseUrl: 'https://api.map.baidu.com',
    // 地理编码接口
    geocode: '/geocoding/v3',
    // 逆地理编码接口
    regeocode: '/reverse_geocoding/v3',
    // 路径规划接口
    direction: '/direction/v2/driving',
    // 距离计算接口
    distance: '/routematrix/v2/driving'
  },
  // 地图缓存配置
  cache: {
    geocodeExpiration: 86400, // 地理编码缓存1天
    distanceMatrixExpiration: 3600, // 距离矩阵缓存1小时
    trafficExpiration: 300 // 实时路况缓存5分钟
  }
};

module.exports = mapConfig;