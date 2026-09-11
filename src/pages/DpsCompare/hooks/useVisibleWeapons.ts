import { useState } from 'react'

/**
 * 行过滤勾选状态在 localStorage 中的存储键
 * 行过滤只针对武器名称，与视图形状无关，因此不分视图记忆（区别于列显示按视图分别记忆）
 */
const STORAGE_KEY = 'delta-lab.visible-weapons.v1'

/**
 * 读取被取消勾选的武器名集合
 * 解析失败或非数组时回退为空集合，即「全部勾选」；空数组同样合法，表示用户取消了全部勾选
 */
function readExcludedNames(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

/** 保存被取消勾选的武器名集合；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeExcludedNames(names: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
  } catch {
    // 忽略写入失败
  }
}

/**
 * 行过滤（按武器名）勾选状态 Hook
 * 内部只记录「被取消勾选的武器名」，因此各场景都天然正确：
 * - 首帧无记录：排除集合为空，即全部勾选
 * - 全部取消勾选：全部名称都进入排除集合，表格显示为空
 * - 武器列表新增名称：不在排除集合中，自动默认勾选；已删除的名称因不再出现在候选列表中而自动失效
 * 对外仍以「已勾选的名称集合」形式暴露，便于直接交给勾选面板与过滤函数使用。
 */
export function useVisibleWeapons(
  availableNames: readonly string[],
): [string[], (selectedNames: string[]) => void] {
  /** 被取消勾选的武器名，初始值读取一次持久化结果 */
  const [excludedNames, setExcludedNames] = useState<string[]>(() => readExcludedNames())

  /** 由排除集合反算已勾选集合，顺序与武器列表保持一致 */
  const selectedNames = availableNames.filter((name) => !excludedNames.includes(name))

  /** 勾选变化：把「已勾选」换算成「被排除」，同时更新内存与持久化 */
  function handleChange(names: string[]): void {
    const nextExcluded = availableNames.filter((name) => !names.includes(name))
    setExcludedNames(nextExcluded)
    writeExcludedNames(nextExcluded)
  }

  return [selectedNames, handleChange]
}
