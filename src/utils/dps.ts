import type { HitboxPart, Weapon } from '@/types/weapon'

/** 统一保留两位小数，避免浮点误差影响展示与排序 */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * 查询指定射击距离生效的射程倍率
 * 射程段按起点升序排列，取起点不超过 distance 的最后一段；最后一段无上限，一直生效。
 * 若无任何段覆盖（distance 小于首段起点，正常首段起点为 0），返回 0。
 */
export function getRangeMultiplier(weapon: Weapon, distance: number): number {
  let multiplier = 0
  for (const segment of weapon.range) {
    if (distance < segment.start) break
    multiplier = segment.multiplier
  }
  return multiplier
}

/**
 * 计算单发部位伤害
 * 公式：基础伤害 × 部位倍率 × 射程倍率
 * 射程倍率由调用方给出：按武器视图取输入距离对应的倍率，按射程视图取该段自身倍率。
 */
export function calculatePartDamage(weapon: Weapon, part: HitboxPart, multiplier: number): number {
  return round2(weapon.damage.base * weapon.hitMultiplier[part] * multiplier)
}

/**
 * 计算指定部位 DPS
 * 公式：基础伤害 × (射速 / 60) × 部位倍率 × 射程倍率
 */
export function calculateDps(weapon: Weapon, part: HitboxPart, multiplier: number): number {
  return round2(weapon.damage.base * (weapon.fireRate / 60) * weapon.hitMultiplier[part] * multiplier)
}

/**
 * 计算护甲 DPS
 * 护甲伤害与受击部位无关，不乘部位倍率。
 * 公式：护甲伤害 × (射速 / 60) × 射程倍率
 */
export function calculateArmorDps(weapon: Weapon, multiplier: number): number {
  return round2(weapon.damage.armor * (weapon.fireRate / 60) * multiplier)
}

/** 命中权重：各受击部位的相对权重，只有彼此比例影响结果，单位任意 */
export type HitWeight = Record<HitboxPart, number>

/** 受击部位的固定遍历顺序，与表格列顺序保持一致 */
const HITBOX_PARTS: ReadonlyArray<HitboxPart> = ['head', 'chest', 'abdomen', 'limbs']

/**
 * 把四项命中权重归一化为命中占比（各部位 0~1，四项之和为 1）
 * 权重全为 0 时不构成任何命中，各部位统一返回 0，使下游综合 DPS 为 0
 */
export function toHitRatios(weights: HitWeight): HitWeight {
  const total = HITBOX_PARTS.reduce((sum, part) => sum + weights[part], 0)
  if (total <= 0) return { head: 0, chest: 0, abdomen: 0, limbs: 0 }
  return {
    head: weights.head / total,
    chest: weights.chest / total,
    abdomen: weights.abdomen / total,
    limbs: weights.limbs / total,
  }
}

/**
 * 计算综合 DPS
 * 公式：Σ（各部位 DPS × 对应命中占比），占比由四项权重归一化得到。
 * 此处对未取整的单发伤害链路加权求和后再统一取整，避免各部位先取整带来的累计误差。
 */
export function calculateCompositeDps(
  weapon: Weapon,
  multiplier: number,
  weights: HitWeight,
): number {
  const ratios = toHitRatios(weights)
  return round2(
    HITBOX_PARTS.reduce(
      (sum, part) =>
        sum +
        weapon.damage.base *
          (weapon.fireRate / 60) *
          weapon.hitMultiplier[part] *
          multiplier *
          ratios[part],
      0,
    ),
  )
}
