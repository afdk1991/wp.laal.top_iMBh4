/**
 * Electron 主进程
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { getVersionInfo } = require('../../shared/utils/version.js');

// 加载版本信息
const versionInfo = getVersionInfo();

// 保持对主窗口的全局引用
let mainWindow;

// 创建主窗口
const createWindow = () => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'MIXMLAAL',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });

  // 加载应用的 index.html
  mainWindow.loadFile('index.html');

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    // 取消引用窗口对象，如果你的应用支持多窗口，
    // 通常会把多个窗口对象存放在一个数组里，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null;
  });

  // 监听窗口大小变化
  mainWindow.on('resize', () => {
    const { width: _width, height: _height } = mainWindow.getBounds();
    // Window resized
  });
};

// 创建菜单
const createMenu = () => {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click() {
            dialog.showMessageBox({
              title: '关于 MIXMLAAL',
              message: 'MIXMLAAL 桌面应用',
              detail: `版本: ${versionInfo.fullVersion}\n© 2026 MIXMLAAL`,
              buttons: ['确定'],
            });
          },
        },
        {
          label: '检查更新',
          click() {
            checkForUpdates();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// 检查更新
const checkForUpdates = () => {
  autoUpdater.checkForUpdatesAndNotify();
};

// 当 Electron 完成初始化并准备创建浏览器窗口时调用这个方法
app.on('ready', () => {
  console.log('MIXMLAAL Electron App Version:', versionInfo.fullVersion);
  createWindow();
  createMenu();
  checkForUpdates();
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 Dock 图标并且没有其他窗口打开时，
  // 通常会重新创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 自动更新事件
autoUpdater.on('checking-for-update', () => {
  // Checking for update
});

autoUpdater.on('update-available', _info => {
  // Update available
  dialog.showMessageBox({
    title: '更新可用',
    message: '发现新版本，是否立即更新？',
    buttons: ['是', '否'],
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
  // Update not available
  dialog.showMessageBox({
    title: '检查更新',
    message: '当前版本已是最新',
    buttons: ['确定'],
  });
});

autoUpdater.on('error', error => {
  // Update error
  dialog.showMessageBox({
    title: '更新错误',
    message: '检查更新时发生错误',
    detail: error.message,
    buttons: ['确定'],
  });
});

autoUpdater.on('download-progress', _progressObj => {
  // Download progress
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: '更新下载完成',
    message: '更新已下载完成，是否立即重启应用？',
    buttons: ['是', '否'],
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// 处理来自渲染进程的消息
ipcMain.on('message', (event, _arg) => {
  // Message received from renderer
  event.reply('reply', '消息已收到');
});

// 处理文件选择
ipcMain.on('open-file-dialog', event => {
  dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  }).then(result => {
    event.reply('selected-files', result.filePaths);
  });
});

// 处理保存文件
ipcMain.on('save-file-dialog', event => {
  dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('documents'), 'mixmlaal.txt'),
  }).then(result => {
    event.reply('save-file', result.filePath);
  });
});
