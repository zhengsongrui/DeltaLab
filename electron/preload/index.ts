import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染层的最小 API 集合。
// 新增能力时在此追加，并在 src/types/global.d.ts 同步类型声明。
const electronAPI = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
