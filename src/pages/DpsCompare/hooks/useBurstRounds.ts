import { useState } from 'react'

/** 连发武器默认展开的累计轮数 */
export const DEFAULT_BURST_ROUNDS = 2
/** 取值下限：至少展示 1 轮 */
export const MIN_BURST_ROUNDS = 1
/** 取值上限：最多展示 8 轮 */
export const MAX_BURST_ROUNDS = 8

/** 轮数设置在 localStorage 中的存储键 */
const STORAGE_KEY = 'delta-lab.burst-rounds.v1'

/**
 * 把任意输入夹取为合法区间内的整数
 * 非数值一律回退默认轮数，避免脏数据把展开行数放大到不可控
 */
function clampRounds(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_BURST_ROUNDS
  const rounded = Math.round(value)
  if (rounded < MIN_BURST_ROUNDS) return MIN_BURST_ROUNDS
  if (rounded > MAX_BURST_ROUNDS) return MAX_BURST_ROUNDS
  return rounded
}

/** 读取已保存的轮数；解析失败或越界时回退默认值 */
function readRounds(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_BURST_ROUNDS
    return clampRounds(JSON.parse(saved))
  } catch {
    return DEFAULT_BURST_ROUNDS
  }
}

/** 保存轮数；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeRounds(rounds: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds))
  } catch {
    // 忽略写入失败
  }
}

/**
 * 「显示连发武器前X轮DPS」设置 Hook
 * 该设置只决定连发武器在 DPS 表格中展开的行数，与列可见性、行过滤等展示状态无关，因此单独记忆；
 * 对外以「当前轮数 + 保存函数」形式暴露，保存时同步更新内存与持久化，表格随即重算行数据。
 */
export function useBurstRounds(): [number, (rounds: number) => void] {
  /** 当前生效的轮数，初始值读取一次持久化结果 */
  const [rounds, setRounds] = useState<number>(() => readRounds())

  /** 保存轮数：先夹取到合法区间，再更新内存供表格立即重算，同时写入 localStorage 供下次启动复用 */
  function handleSave(next: number): void {
    const clamped = clampRounds(next)
    setRounds(clamped)
    writeRounds(clamped)
  }

  return [rounds, handleSave]
}
