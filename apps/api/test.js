// 测试脚本
console.log('Node.js 版本:', process.version);
console.log('当前目录:', __dirname);

// 测试加载模块
try {
  console.log('正在加载 express 模块...');
  console.log('express 模块加载成功');

  console.log('正在加载 dotenv 模块...');
  require('dotenv').config();
  console.log('dotenv 模块加载成功');

  console.log('环境变量:', process.env.NODE_ENV);
  console.log('JWT_SECRET 长度:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : '未设置');
  console.log('JWT_REFRESH_SECRET 长度:', process.env.JWT_REFRESH_SECRET ? process.env.JWT_REFRESH_SECRET.length : '未设置');
  console.log('ENCRYPTION_KEY 长度:', process.env.ENCRYPTION_KEY ? process.env.ENCRYPTION_KEY.length : '未设置');

  console.log('测试成功！');
} catch (error) {
  console.error('测试失败:', error);
  console.error('错误堆栈:', error.stack);
}
