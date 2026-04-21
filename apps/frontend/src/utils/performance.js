/**
 * 性能优化工具
 * 提供布局渲染优化相关的工具函数
 */

/**
 * 批量DOM操作
 * @param {Function} callback - 要执行的DOM操作
 */
export function batchDOMOperations(callback) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 200) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 200) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 预加载图片
 * @param {string[]} images - 图片URL数组
 */
export function preloadImages(images) {
  images.forEach(image => {
    const img = new Image();
    img.src = image;
  });
}

/**
 * 优化滚动性能
 * @param {Function} callback - 滚动回调函数
 * @returns {Function} 优化后的滚动处理函数
 */
export function optimizeScroll(callback) {
  return throttle(callback, 16); // ~60fps
}

/**
 * 检测元素是否在视口中
 * @param {HTMLElement} element - 要检测的元素
 * @param {number} offset - 偏移量（像素）
 * @returns {boolean} 是否在视口中
 */
export function isElementInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
}

/**
 * 平滑滚动到元素
 * @param {HTMLElement} element - 目标元素
 * @param {number} duration - 动画持续时间（毫秒）
 */
export function smoothScrollTo(element, duration = 300) {
  const startPosition = window.pageYOffset;
  const targetPosition = element.getBoundingClientRect().top + startPosition;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  function animation(currentTime) {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startPosition + distance * easeProgress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/**
 * 优化图片加载
 * @param {HTMLElement} imgElement - 图片元素
 * @param {string} src - 图片URL
 * @param {string} placeholder - 占位符URL
 */
export function optimizeImageLoading(imgElement, src, placeholder) {
  if (placeholder) {
    imgElement.src = placeholder;
  }
  
  const image = new Image();
  image.onload = function() {
    imgElement.src = src;
    imgElement.classList.add('loaded');
  };
  image.src = src;
}

/**
 * 避免强制同步布局
 * @param {Function} readFn - 读取布局属性的函数
 * @param {Function} writeFn - 修改样式的函数
 */
export function avoidForcedLayout(readFn, writeFn) {
  const values = readFn();
  requestAnimationFrame(() => {
    writeFn(values);
  });
}

/**
 * 检测浏览器是否支持WebP
 * @returns {boolean} 是否支持WebP
 */
export function supportsWebP() {
  if (typeof window === 'undefined') return false;
  
  try {
    const elem = document.createElement('canvas');
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch (e) {
    return false;
  }
}

/**
 * 检测浏览器是否支持AVIF
 * @returns {boolean} 是否支持AVIF
 */
export function supportsAVIF() {
  if (typeof window === 'undefined') return false;
  
  try {
    const elem = document.createElement('canvas');
    return elem.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch (e) {
    return false;
  }
}

/**
 * 获取最佳图片格式
 * @returns {string} 最佳图片格式
 */
export function getBestImageFormat() {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpg';
}

/**
 * 优化CSS选择器性能
 * @param {string} selector - CSS选择器
 * @returns {string} 优化后的选择器
 */
export function optimizeCSSSelector(selector) {
  // 移除不必要的后代选择器
  return selector.replace(/\s+>/g, '>').trim();
}

/**
 * 监控布局性能
 * @param {Function} callback - 性能数据回调
 */
export function monitorLayoutPerformance(callback) {
  if (typeof performance === 'undefined' || !performance.mark) return;
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('layout') || entry.name.includes('paint')) {
        callback(entry);
      }
    });
  });
  
  observer.observe({ entryTypes: ['layout-shift', 'paint', 'navigation'] });
  
  return observer;
}