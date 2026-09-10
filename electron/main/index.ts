import { join } from 'node:path'
import { app, BrowserWindow, ipcMain, shell } from 'electron'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // 安全基线：隔离上下文、禁用 Node 集成
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 等首屏渲染完成再显示，避免白屏闪烁
  win.on('ready-to-show', () => {
    win.show()
  })

  // 外部链接交给系统浏览器，避免在应用窗口内导航
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  // 开发时由 electron-vite 注入 devServerUrl，生产时加载打包后的静态文件
  const devServerUrl = process.env.ELECTRON_RENDERER_URL
  if (devServerUrl) {
    void win.loadURL(devServerUrl)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 渲染层通过 preload 暴露的 getAppVersion 间接调用
ipcMain.handle('app:get-version', () => app.getVersion())

void app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
