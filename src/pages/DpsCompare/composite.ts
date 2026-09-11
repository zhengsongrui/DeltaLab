import type { HitboxPart } from '@/types/weapon'
import type { HitWeight } from '@/utils/dps'

/**
 * 各受击部位的中文名，顺序即表格列顺序与综合 DPS 设置弹窗的输入项顺序
 * 由表格列定义与弹窗共用，避免两处各维护一份
 */
export const HITBOX_PART_LABELS: ReadonlyArray<{ part: HitboxPart; label: string }> = [
  { part: 'head', label: '头部' },
  { part: 'chest', label: '胸部' },
  { part: 'abdomen', label: '腹部' },
  { part: 'limbs', label: '四肢' },
]

/** 综合 DPS 的默认命中权重：头部 20、胸部 20、腹部 40、四肢 20 */
export const DEFAULT_HIT_WEIGHT: HitWeight = { head: 20, chest: 20, abdomen: 40, limbs: 20 }
