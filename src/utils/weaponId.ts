/**
 * 武器唯一标识生成
 * 独立成模块，供 store 与数据导入合并逻辑共用，避免工具层反向依赖 store。
 */

/** 生成武器唯一标识：不依赖 crypto.randomUUID 在非安全上下文下的可用性 */
export function createWeaponId(): string {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
