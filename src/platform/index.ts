/**
 * 平台能力隔离层
 *
 * 业务代码只从这里获取平台相关能力，不直接访问 window.electronAPI。
 * Web 环境下 electronAPI 为 undefined，此层自动降级，避免运行时抛错。
 */

/** 当前是否运行在 Electron 容器中 */
export const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI)

/** 应用版本号：桌面端取真实版本，Web 端返回固定标识 */
export function getAppVersion(): Promise<string> {
  return window.electronAPI?.getAppVersion() ?? Promise.resolve('web')
}
