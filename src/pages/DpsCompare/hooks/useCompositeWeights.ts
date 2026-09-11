import { useState } from 'react'
import type { HitWeight } from '@/utils/dps'
import { DEFAULT_HIT_WEIGHT } from '../composite'

/** 命中权重在 localStorage 中的存储键 */
const STORAGE_KEY = 'delta-lab.composite-weights.v1'

/**
 * 读取已保存的命中权重
 * 解析失败或某一项不是数值时逐项回退默认值，避免脏数据使综合 DPS 变成 NaN
 */
function readWeights(): HitWeight {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { ...DEFAULT_HIT_WEIGHT }
    const parsed = JSON.parse(saved) as Partial<Record<keyof HitWeight, unknown>>
    return {
      head: typeof parsed.head === 'number' ? parsed.head : DEFAULT_HIT_WEIGHT.head,
      chest: typeof parsed.chest === 'number' ? parsed.chest : DEFAULT_HIT_WEIGHT.chest,
      abdomen: typeof parsed.abdomen === 'number' ? parsed.abdomen : DEFAULT_HIT_WEIGHT.abdomen,
      limbs: typeof parsed.limbs === 'number' ? parsed.limbs : DEFAULT_HIT_WEIGHT.limbs,
    }
  } catch {
    return { ...DEFAULT_HIT_WEIGHT }
  }
}

/** 保存命中权重；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeWeights(weights: HitWeight): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights))
  } catch {
    // 忽略写入失败
  }
}

/**
 * 综合 DPS 的命中权重 Hook
 * 权重只影响综合 DPS 列的计算口径，与行数据、列可见性无关，因此单独记忆；
 * 对外以「当前权重 + 保存函数」形式暴露，保存时同步更新内存与持久化。
 */
export function useCompositeWeights(): [HitWeight, (weights: HitWeight) => void] {
  /** 当前生效的命中权重，初始值读取一次持久化结果 */
  const [weights, setWeights] = useState<HitWeight>(() => readWeights())

  /** 保存权重：更新内存供表格立即重算，同时写入 localStorage 供下次启动复用 */
  function handleSave(next: HitWeight): void {
    setWeights(next)
    writeWeights(next)
  }

  return [weights, handleSave]
}
