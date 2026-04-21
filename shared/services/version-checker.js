/**
 * 版本检查服务
 * 用于检查应用版本更新
 */

import { getVersionInfo } from '../utils/version.js';
import { logVersionCheck, logUpdateStart, logUpdateComplete, logUpdateError } from './version-logger.js';

/**
 * 检查版本更新
 * @param {string} currentVersion - 当前版本号
 * @returns {Promise<Object>} 版本检查结果
 */
export async function checkVersionUpdate(currentVersion) {
  try {
    // 从服务器获取最新版本信息
    const response = await fetch('/api/v1/version');
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }
    
    const data = await response.json();
    const latestVersion = data.data;
    
    // 比较版本号
    const isUpdateAvailable = compareVersions(currentVersion, latestVersion.version);
    
    const updateInfo = {
      hasUpdate: isUpdateAvailable,
      currentVersion: currentVersion,
      latestVersion: latestVersion.version,
      fullVersion: latestVersion.fullVersion,
      versionInfo: latestVersion
    };
    
    // 记录版本检查结果
    logVersionCheck(updateInfo);
    
    return updateInfo;
  } catch (error) {
    console.error('Error checking version update:', error);
    return {
      hasUpdate: false,
      error: error.message
    };
  }
}

/**
 * 比较版本号
 * @param {string} current - 当前版本号
 * @param {string} latest - 最新版本号
 * @returns {boolean} 是否需要更新
 */
export function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentVal = currentParts[i] || 0;
    const latestVal = latestParts[i] || 0;
    
    if (latestVal > currentVal) {
      return true;
    } else if (latestVal < currentVal) {
      return false;
    }
  }
  
  return false;
}

/**
 * 显示版本更新提示
 * @param {Object} updateInfo - 更新信息
 * @param {Function} onConfirm - 确认更新回调
 */
export function showUpdateNotification(updateInfo, onConfirm) {
  if (updateInfo.hasUpdate) {
    if (window.confirm(`发现新版本 ${updateInfo.fullVersion}\n是否立即更新？`)) {
      // 记录更新开始
      logUpdateStart(updateInfo);
      
      if (onConfirm) {
        try {
          onConfirm();
          // 记录更新完成
          logUpdateComplete(updateInfo);
        } catch (error) {
          // 记录更新错误
          logUpdateError(updateInfo, error);
        }
      } else {
        // 默认行为：刷新页面
        window.location.reload();
      }
    }
  }
}

/**
 * 自动检查版本更新
 * @param {string} currentVersion - 当前版本号
 * @param {number} interval - 检查间隔（毫秒）
 */
export function autoCheckVersion(currentVersion, interval = 300000) { // 默认5分钟检查一次
  // 立即检查一次
  checkVersionUpdate(currentVersion).then(updateInfo => {
    if (updateInfo.hasUpdate) {
      showUpdateNotification(updateInfo);
    }
  });
  
  // 设置定时检查
  setInterval(() => {
    checkVersionUpdate(currentVersion).then(updateInfo => {
      if (updateInfo.hasUpdate) {
        showUpdateNotification(updateInfo);
      }
    });
  }, interval);
}
