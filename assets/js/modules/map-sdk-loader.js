/**
 * 地图SDK加载器
 * 版本: v1.0.0.0
 * 说明: 支持多地图服务商SDK动态加载和切换
 */

const MapSDKLoader = {
  loadedSDKs: {},
  currentProvider: 'gaode',

  // 地图SDK配置
  sdkConfigs: {
    gaode: {
      name: '高德地图',
      sdkUrl: 'https://webapi.amap.com/maps?v=2.0&key=',
      key: window.GAODE_KEY || 'test-key',
      checkLoaded: () => typeof window.AMap !== 'undefined',
      onLoad: callback => {
        if (window.AMap) {
          callback();
        } else {
          window.initAMap = callback;
        }
      },
    },
    baidu: {
      name: '百度地图',
      sdkUrl: 'https://api.map.baidu.com/api?v=3.0&ak=',
      key: window.BAIDU_MAP_AK || 'test-ak',
      checkLoaded: () => typeof window.BMap !== 'undefined',
      onLoad: callback => {
        if (window.BMap) {
          callback();
        } else {
          window.initBMap = callback;
        }
      },
    },
    tencent: {
      name: '腾讯地图',
      sdkUrl: 'https://map.qq.com/api/js?v=2.exp&key=',
      key: window.TENCENT_MAP_KEY || 'test-key',
      checkLoaded: () => typeof window.TMap !== 'undefined',
      onLoad: callback => {
        if (window.TMap) {
          callback();
        } else {
          window.initTMap = callback;
        }
      },
    },
    google: {
      name: 'Google Maps',
      sdkUrl: 'https://maps.googleapis.com/maps/api/js?key=',
      key: window.GOOGLE_MAPS_KEY || 'test-key',
      libraries: '&libraries=places',
      checkLoaded: () => typeof window.google !== 'undefined' && window.google.maps,
      onLoad: callback => {
        if (window.google && window.google.maps) {
          callback();
        }
      },
    },
  },

  /**
   * 加载地图SDK
   * @param {string} provider - 服务商名称
   * @param {string} key - API密钥
   * @returns {Promise}
   */
  loadSDK(provider, key) {
    return new Promise((resolve, reject) => {
      const config = this.sdkConfigs[provider];

      if (!config) {
        reject(new Error(`不支持的地图服务商: ${provider}`));
        return;
      }

      // 如果已加载，直接返回
      if (this.loadedSDKs[provider] || config.checkLoaded()) {
        this.loadedSDKs[provider] = true;
        this.currentProvider = provider;
        console.log(`${config.name} SDK已加载`);
        resolve();
        return;
      }

      // 动态加载SDK
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;

      const apiKey = key || config.key;
      let sdkUrl = config.sdkUrl + apiKey;

      // Google Maps需要额外的库
      if (provider === 'google' && config.libraries) {
        sdkUrl += config.libraries;
      }

      // 高德地图和百度地图需要callback参数
      if (provider === 'gaode') {
        sdkUrl += '&callback=initAMap';
      } else if (provider === 'baidu') {
        sdkUrl += '&callback=initBMap';
      } else if (provider === 'tencent') {
        sdkUrl += '&callback=initTMap';
      }

      console.log(`正在加载${config.name} SDK，URL: ${sdkUrl.substring(0, 100)}...`);

      script.src = sdkUrl;

      // 设置加载超时
      const timeoutId = setTimeout(() => {
        console.error(`${config.name} SDK加载超时`);
        script.onerror();
      }, 10000); // 10秒超时

      script.onload = () => {
        clearTimeout(timeoutId);
        this.loadedSDKs[provider] = true;
        this.currentProvider = provider;
        console.log(`${config.name} SDK加载成功`);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`${config.name} SDK加载失败`);
        // 尝试切换到备用服务商
        this.switchToBackupProvider().then(resolve).catch(reject);
      };

      document.head.appendChild(script);
    });
  },

  /**
   * 切换到备用地图服务商
   * @returns {Promise}
   */
  async switchToBackupProvider() {
    const providers = ['baidu', 'tencent', 'gaode'];

    for (const provider of providers) {
      if (provider !== this.currentProvider && this.sdkConfigs[provider]) {
        try {
          console.log(`尝试切换到备用地图服务商: ${this.sdkConfigs[provider].name}`);
          await this.loadSDK(provider);
          return;
        } catch (error) {
          console.error(`备用服务商 ${this.sdkConfigs[provider].name} 加载失败:`, error);
          continue;
        }
      }
    }

    throw new Error('所有地图服务商加载失败');
  },

  /**
   * 从服务器获取SDK配置
   * @returns {Promise<Array>}
   */
  async loadSDKConfigsFromServer() {
    try {
      const response = await fetch('/api/v1/map/sdk-config');
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        result.data.forEach(config => {
          if (this.sdkConfigs[config.provider]) {
            this.sdkConfigs[config.provider].key = config.key;
            this.sdkConfigs[config.provider].sdkUrl = config.sdkUrl.replace('?v=2.0&key=', '?v=2.0&key=');
            console.log(`已更新${config.name}的SDK配置，API Key: ${config.key.substring(0, 8)}...`);
          }
        });
      }

      return result.data || [];
    } catch (error) {
      console.error('获取SDK配置失败:', error);
      return [];
    }
  },

  /**
   * 初始化地图
   * @param {string} containerId - 容器ID
   * @param {Object} options - 地图选项
   * @returns {Object}
   */
  initMap(containerId, options = {}) {
    const provider = this.currentProvider;

    switch (provider) {
      case 'gaode':
        return this.initGaodeMap(containerId, options);
      case 'baidu':
        return this.initBaiduMap(containerId, options);
      case 'tencent':
        return this.initTencentMap(containerId, options);
      case 'google':
        return this.initGoogleMap(containerId, options);
      default:
        return this.initGaodeMap(containerId, options);
    }
  },

  /**
   * 初始化高德地图
   */
  initGaodeMap(containerId, options) {
    const map = new AMap.Map(containerId, {
      zoom: options.zoom || 15,
      center: options.center || [116.404, 39.915],
      resizeEnable: true,
    });

    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar());

    return {
      provider: 'gaode',
      map,
      setCenter: (lng, lat) => map.setCenter([lng, lat]),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng, lat: center.lat };
      },
      setZoom: zoom => map.setZoom(zoom),
      addMarker: (lng, lat, options = {}) => {
        return new AMap.Marker({
          position: [lng, lat],
          ...options,
        }).setMap(map);
      },
      removeMarker: marker => marker.setMap(null),
      clearMap: () => map.clearMap(),
    };
  },

  /**
   * 初始化百度地图
   */
  initBaiduMap(containerId, options) {
    const map = new BMap.Map(containerId);
    const point = new BMap.Point(
      options.center ? options.center[0] : 116.404,
      options.center ? options.center[1] : 39.915,
    );

    map.centerAndZoom(point, options.zoom || 15);
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.NavigationControl());

    return {
      provider: 'baidu',
      map,
      setCenter: (lng, lat) => map.setCenter(new BMap.Point(lng, lat)),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng, lat: center.lat };
      },
      setZoom: zoom => map.setZoom(zoom),
      addMarker: (lng, lat, options = {}) => {
        const point = new BMap.Point(lng, lat);
        const marker = new BMap.Marker(point);
        map.addOverlay(marker);
        return marker;
      },
      removeMarker: marker => map.removeOverlay(marker),
      clearMap: () => map.clearOverlays(),
    };
  },

  /**
   * 初始化腾讯地图
   */
  initTencentMap(containerId, options) {
    const center = options.center || new TMap.LatLng(39.915, 116.404);

    const map = new TMap.Map(containerId, {
      center: center,
      zoom: options.zoom || 15,
    });

    return {
      provider: 'tencent',
      map,
      setCenter: (lng, lat) => map.setCenter(new TMap.LatLng(lat, lng)),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng, lat: center.lat };
      },
      setZoom: zoom => map.setZoom(zoom),
      addMarker: (lng, lat, options = {}) => {
        return new TMap.Marker({
          position: new TMap.LatLng(lat, lng),
          map: map,
        });
      },
      removeMarker: marker => marker.setMap(null),
      clearMap: () => {
        // 腾讯地图需要手动清除所有覆盖物
      },
    };
  },

  /**
   * 初始化Google Maps
   */
  initGoogleMap(containerId, options) {
    const map = new google.maps.Map(document.getElementById(containerId), {
      center: options.center || { lat: 39.915, lng: 116.404 },
      zoom: options.zoom || 15,
    });

    return {
      provider: 'google',
      map,
      setCenter: (lng, lat) => map.setCenter({ lat, lng }),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng(), lat: center.lat() };
      },
      setZoom: zoom => map.setZoom(zoom),
      addMarker: (lng, lat, options = {}) => {
        return new google.maps.Marker({
          position: { lat, lng },
          map: map,
          ...options,
        });
      },
      removeMarker: marker => marker.setMap(null),
      clearMap: () => {
        // Google Maps需要手动清除所有标记
      },
    };
  },

  /**
   * 获取当前服务商
   */
  getCurrentProvider() {
    return this.currentProvider;
  },

  /**
   * 获取所有可用服务商
   */
  getAvailableProviders() {
    return Object.keys(this.sdkConfigs);
  },
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapSDKLoader;
} else {
  window.MapSDKLoader = MapSDKLoader;
}
