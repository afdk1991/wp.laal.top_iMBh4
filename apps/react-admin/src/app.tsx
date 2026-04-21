import { Hyperlit } from '@umijs/max';
import { getVersionInfo } from '../../shared/utils/version.js';
import { autoCheckVersion } from '../../shared/services/version-checker.js';

// 加载版本信息
const versionInfo = getVersionInfo();
console.log('MIXMLAAL React Admin Version:', versionInfo.fullVersion);

// 自动检查版本更新
autoCheckVersion(versionInfo.version);

export const request: Hyperlit.RequestConfig = {
  timeout: 10000,
  errorHandler: (error: any) => {
    console.error('Request error:', error);
  },
};

// 导出版本信息供其他组件使用
export const version = versionInfo;
