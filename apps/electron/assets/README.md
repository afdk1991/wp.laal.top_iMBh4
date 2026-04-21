# Electron 资源文件

## 应用图标

请在此目录中添加以下图标文件：

1. `icon.png` - 应用主图标（512x512px）
2. `icon.icns` - macOS 图标
3. `icon.ico` - Windows 图标

## 如何生成图标

### 使用在线工具
1. 访问 [IconGenerator](https://icon-generator.net/)
2. 上传你的图标图片
3. 选择生成 Electron 所需的图标格式
4. 下载生成的图标并放置到本目录

### 使用命令行工具
```bash
# 安装 electron-icon-builder
npm install -g electron-icon-builder

# 生成图标
electron-icon-builder --input=path/to/your/icon.png --output=./assets
```

## 其他资源

你可以在此目录中添加其他资源文件，如：

- 应用启动画面
- 应用内使用的图片
- 字体文件
- 其他静态资源

## 注意事项

- 图标文件大小建议控制在 1MB 以内
- 确保图标在不同尺寸下都能清晰显示
- 遵循各平台的图标设计规范
- Windows: ICO 格式，至少 256x256px
- macOS: ICNS 格式，包含多种尺寸
- Linux: PNG 格式，至少 512x512px