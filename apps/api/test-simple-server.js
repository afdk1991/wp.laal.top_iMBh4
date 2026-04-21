// 简单的测试服务器
console.log('开始启动简单测试服务器...');

const express = require('express');
const app = express();
const PORT = 3005;

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 测试服务器运行在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/v1/health`);
});
