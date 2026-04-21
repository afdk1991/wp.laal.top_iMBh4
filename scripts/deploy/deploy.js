/**
 * 项目部署脚本
 * 版本: v1.0.0.0
 * 说明: 用于部署项目到本地环境
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始部署 MIXMLAAL 项目...');

try {
  // 检查构建目录是否存在
  const buildDir = path.join(__dirname, '../../dist');
  if (!fs.existsSync(buildDir)) {
    console.log('📦 构建目录不存在，开始构建...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // 本地部署配置
  const deployConfig = {
    deployPath: process.env.DEPLOY_PATH || path.join(__dirname, '../../deploy'),
  };

  console.log('⚙️  部署配置:', deployConfig);

  // 确保部署目录存在
  console.log('📁 创建部署目录...');
  if (!fs.existsSync(deployConfig.deployPath)) {
    fs.mkdirSync(deployConfig.deployPath, { recursive: true });
  }

  // 清理目标目录
  console.log('🧹 清理目标目录...');
  const files = fs.readdirSync(deployConfig.deployPath);
  files.forEach(file => {
    const filePath = path.join(deployConfig.deployPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  });

  // 复制构建产物
  console.log('📤 复制构建产物...');
  const buildFiles = fs.readdirSync(buildDir);
  buildFiles.forEach(file => {
    const sourcePath = path.join(buildDir, file);
    const targetPath = path.join(deployConfig.deployPath, file);
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });

  // 安装依赖
  console.log('📦 安装依赖...');
  execSync(`cd ${deployConfig.deployPath} && npm install --production`, { stdio: 'inherit' });

  console.log('🎉 部署完成！');
  console.log(`📁 部署目录: ${deployConfig.deployPath}`);
  console.log('\n💡 提示: 可以使用以下命令启动应用:');
  console.log(`cd ${deployConfig.deployPath} && npm start`);
} catch (error) {
  console.error('❌ 部署失败:', error);
  process.exit(1);
}
