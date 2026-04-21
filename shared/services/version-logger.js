/**
 * 版本更新日志服务
 * 用于记录版本更新的过程和状态
 */

import fs from 'fs';
import path from 'path';

/**
 * 版本更新日志文件路径
 */
const LOG_FILE = path.join(__dirname, '../../version_update.log');

/**
 * 记录版本更新日志
 * @param {string} action - 操作类型
 * @param {string} message - 日志消息
 * @param {Object} data - 附加数据
 */
export function logVersionUpdate(action, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    message,
    data
  };
  
  const logString = JSON.stringify(logEntry) + '\n';
  
  try {
    // 确保目录存在
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // 追加日志
    fs.appendFileSync(LOG_FILE, logString);
    console.log(`[Version Log] ${action}: ${message}`);
  } catch (error) {
    console.error('Error writing version log:', error);
  }
}

/**
 * 记录版本检查结果
 * @param {Object} updateInfo - 更新信息
 */
export function logVersionCheck(updateInfo) {
  logVersionUpdate('VERSION_CHECK', 'Checked for version updates', {
    hasUpdate: updateInfo.hasUpdate,
    currentVersion: updateInfo.currentVersion,
    latestVersion: updateInfo.latestVersion,
    fullVersion: updateInfo.fullVersion
  });
}

/**
 * 记录版本更新开始
 * @param {Object} updateInfo - 更新信息
 */
export function logUpdateStart(updateInfo) {
  logVersionUpdate('UPDATE_START', 'Starting version update', {
    currentVersion: updateInfo.currentVersion,
    targetVersion: updateInfo.latestVersion,
    fullVersion: updateInfo.fullVersion
  });
}

/**
 * 记录版本更新完成
 * @param {Object} updateInfo - 更新信息
 */
export function logUpdateComplete(updateInfo) {
  logVersionUpdate('UPDATE_COMPLETE', 'Version update completed', {
    previousVersion: updateInfo.currentVersion,
    newVersion: updateInfo.latestVersion,
    fullVersion: updateInfo.fullVersion
  });
}

/**
 * 记录版本更新失败
 * @param {Object} updateInfo - 更新信息
 * @param {Error} error - 错误信息
 */
export function logUpdateError(updateInfo, error) {
  logVersionUpdate('UPDATE_ERROR', 'Version update failed', {
    currentVersion: updateInfo.currentVersion,
    targetVersion: updateInfo.latestVersion,
    error: error.message
  });
}

/**
 * 获取版本更新日志
 * @param {number} limit - 日志条数限制
 * @returns {Array} 日志数组
 */
export function getVersionLogs(limit = 50) {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
      const logs = logContent.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .reverse()
        .slice(0, limit);
      return logs;
    }
    return [];
  } catch (error) {
    console.error('Error reading version logs:', error);
    return [];
  }
}
