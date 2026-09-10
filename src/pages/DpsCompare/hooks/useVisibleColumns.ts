import { useState } from 'react'

/**
 * 列可见性在 localStorage 中的存储键前缀
 * 列清单发生变化时应递增版本号，避免旧记忆静默隐藏新增列
 */
const STORAGE_PREFIX = 'delta-lab.visible-columns.v3'

/** 按页面或视图标识拼出存储键，例如 delta-lab.visible-columns.v3.weapon */
export function columnsStorageKey(key: string): string {
  return `${STORAGE_PREFIX}.${key}`
}

/**
 * 读取指定存储键下保存的可见列
 * 解析失败或结果为空时回退为「全部显示」；并按 availableKeys 重排、剔除已不存在的旧 key
 */
function readVisibleKeys(storageKey: string, availableKeys: readonly string[]): string[] {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return [...availableKeys]
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return [...availableKeys]
    const visible = availableKeys.filter((key) => (parsed as string[]).includes(key))
    return visible.length > 0 ? visible : [...availableKeys]
  } catch {
    return [...availableKeys]
  }
}

/** 保存可见列；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeVisibleKeys(storageKey: string, keys: string[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(keys))
  } catch {
    // 忽略写入失败
  }
}

/**
 * 列可见性 Hook
 * 勾选结果按 storageKey 分别记忆并写入 localStorage：
 * 切换视图时直接命中内存中该视图上次的结果，只有从未操作过的 storageKey 才读一次 localStorage。
 */
export function useVisibleColumns(
  storageKey: string,
  availableKeys: readonly string[],
): [string[], (keys: string[]) => void] {
  /** key 为 storageKey，值为该键下当前已勾选的列 */
  const [visibleKeysMap, setVisibleKeysMap] = useState<Record<string, string[]>>({})

  /** 未在内存中记录过该 storageKey 时，读取一次持久化结果 */
  const visibleKeys = visibleKeysMap[storageKey] ?? readVisibleKeys(storageKey, availableKeys)

  /** 勾选变化：只更新当前 storageKey 并持久化 */
  function handleChange(keys: string[]): void {
    setVisibleKeysMap((prev) => ({ ...prev, [storageKey]: keys }))
    writeVisibleKeys(storageKey, keys)
  }

  return [visibleKeys, handleChange]
}
