const axios = require('axios');
const mapConfig = require('../config/map');
const cache = require('../config/redis');

// 地图服务
class MapService {
  constructor() {
    this.amapKey = mapConfig.amap.key;
    this.baiduKey = mapConfig.baidu.key;
    this.cacheExpiration = mapConfig.cache;
  }

  // 地理编码（地址转经纬度）
  async geocode(address) {
    try {
      // 生成缓存键
      const cacheKey = `geocode:${address}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 调用高德地图API
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.geocode}`, {
        params: {
          key: this.amapKey,
          address: address,
          output: 'json'
        }
      });

      if (response.data.status === '1' && response.data.geocodes.length > 0) {
        const result = {
          latitude: parseFloat(response.data.geocodes[0].location.split(',')[1]),
          longitude: parseFloat(response.data.geocodes[0].location.split(',')[0]),
          formattedAddress: response.data.geocodes[0].formatted_address,
          province: response.data.geocodes[0].province,
          city: response.data.geocodes[0].city,
          district: response.data.geocodes[0].district
        };

        // 缓存结果
        await cache.set(cacheKey, result, this.cacheExpiration.geocodeExpiration);
        return result;
      }

      return null;
    } catch (error) {
      console.error('地理编码失败:', error);
      return null;
    }
  }

  // 逆地理编码（经纬度转地址）
  async regeocode(latitude, longitude) {
    try {
      // 生成缓存键
      const cacheKey = `regeocode:${latitude}:${longitude}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 调用高德地图API
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.regeocode}`, {
        params: {
          key: this.amapKey,
          location: `${longitude},${latitude}`,
          output: 'json'
        }
      });

      if (response.data.status === '1') {
        const result = {
          formattedAddress: response.data.regeocode.formatted_address,
          province: response.data.regeocode.addressComponent.province,
          city: response.data.regeocode.addressComponent.city,
          district: response.data.regeocode.addressComponent.district,
          town: response.data.regeocode.addressComponent.township,
          street: response.data.regeocode.addressComponent.streetNumber.street,
          number: response.data.regeocode.addressComponent.streetNumber.number
        };

        // 缓存结果
        await cache.set(cacheKey, result, this.cacheExpiration.geocodeExpiration);
        return result;
      }

      return null;
    } catch (error) {
      console.error('逆地理编码失败:', error);
      return null;
    }
  }

  // 路径规划
  async direction(origin, destination) {
    try {
      // 生成缓存键
      const cacheKey = `direction:${origin.latitude}:${origin.longitude}:${destination.latitude}:${destination.longitude}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 调用高德地图API
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.direction}`, {
        params: {
          key: this.amapKey,
          origin: `${origin.longitude},${origin.latitude}`,
          destination: `${destination.longitude},${destination.latitude}`,
          output: 'json'
        }
      });

      if (response.data.status === '1' && response.data.route.paths.length > 0) {
        const path = response.data.route.paths[0];
        const result = {
          distance: path.distance,
          duration: path.duration,
          steps: path.steps.map(step => ({
            instruction: step.instruction,
            orientation: step.orientation,
            road: step.road,
            distance: step.distance,
            duration: step.duration,
            polyline: step.polyline
          }))
        };

        // 缓存结果
        await cache.set(cacheKey, result, this.cacheExpiration.distanceMatrixExpiration);
        return result;
      }

      return null;
    } catch (error) {
      console.error('路径规划失败:', error);
      return null;
    }
  }

  // 批量算路
  async batchDirection(origin, destinations) {
    try {
      // 生成缓存键
      const cacheKey = `batchDirection:${origin.latitude}:${origin.longitude}:${destinations.map(d => `${d.latitude}:${d.longitude}`).join(',')}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 构建目的地参数
      const destinationParam = destinations.map(d => `${d.longitude},${d.latitude}`).join('|');

      // 调用高德地图API
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.batchDirection}`, {
        params: {
          key: this.amapKey,
          origins: `${origin.longitude},${origin.latitude}`,
          destinations: destinationParam,
          output: 'json'
        }
      });

      if (response.data.status === '1' && response.data.results.length > 0) {
        const results = response.data.results.map((result, index) => ({
          destination: destinations[index],
          distance: result.distance,
          duration: result.duration
        }));

        // 缓存结果
        await cache.set(cacheKey, results, this.cacheExpiration.distanceMatrixExpiration);
        return results;
      }

      return null;
    } catch (error) {
      console.error('批量算路失败:', error);
      return null;
    }
  }

  // 距离计算
  async distance(origins, destinations) {
    try {
      // 生成缓存键
      const cacheKey = `distance:${origins.map(o => `${o.latitude}:${o.longitude}`).join(',')}:${destinations.map(d => `${d.latitude}:${d.longitude}`).join(',')}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 构建参数
      const originParam = origins.map(o => `${o.longitude},${o.latitude}`).join('|');
      const destinationParam = destinations.map(d => `${d.longitude},${d.latitude}`).join('|');

      // 调用高德地图API
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.distance}`, {
        params: {
          key: this.amapKey,
          origins: originParam,
          destinations: destinationParam,
          type: 0, // 0: 直线距离, 1: 驾车距离
          output: 'json'
        }
      });

      if (response.data.status === '1' && response.data.results.length > 0) {
        const results = response.data.results.map((result, index) => ({
          origin: origins[index],
          destination: destinations[index],
          distance: result.distance,
          duration: result.duration
        }));

        // 缓存结果
        await cache.set(cacheKey, results, this.cacheExpiration.distanceMatrixExpiration);
        return results;
      }

      return null;
    } catch (error) {
      console.error('距离计算失败:', error);
      return null;
    }
  }

  // 实时路况
  async traffic(location) {
    try {
      // 生成缓存键
      const cacheKey = `traffic:${location.latitude}:${location.longitude}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 调用高德地图API
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.traffic}`, {
        params: {
          key: this.amapKey,
          location: `${location.longitude},${location.latitude}`,
          extensions: 'all',
          output: 'json'
        }
      });

      if (response.data.status === '1' && response.data.trafficinfo.roads.length > 0) {
        const roads = response.data.trafficinfo.roads.map(road => ({
          name: road.name,
          status: road.status,
          direction: road.direction,
          speed: road.speed
        }));

        const result = {
          location: location,
          roads: roads
        };

        // 缓存结果
        await cache.set(cacheKey, result, this.cacheExpiration.trafficExpiration);
        return result;
      }

      return null;
    } catch (error) {
      console.error('实时路况获取失败:', error);
      return null;
    }
  }
}

module.exports = new MapService();