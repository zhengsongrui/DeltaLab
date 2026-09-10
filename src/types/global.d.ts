/**
 * preload 暴露给渲染层的 API 类型。
 * 新增能力时需与 electron/preload/index.ts 保持严格一致。
 */
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    /** 仅在 Electron 环境存在；Web 环境为 undefined */
    electronAPI?: ElectronAPI
  }
}
