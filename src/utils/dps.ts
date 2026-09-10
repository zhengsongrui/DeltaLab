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
