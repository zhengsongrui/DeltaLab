/**
 * 武器开火参数的派生与默认值补齐
 *
 * 与 utils/burstTiming 分工明确：burstTiming 只做数字公式，本模块面向 Weapon 结构，
 * 把「开火模式决定用哪套口径」这条规则收在一处，供填表弹窗、导入解析与本地存储归一化共用，
 * 避免「最短射击间隔怎么算」在多个入口各写一遍。
 */
import type { Weapon } from '@/types/weapon'
import { WEAPON_FIRE_MODE_LABELS, isWeaponFireMode } from '@/types/weapon'
import { getBurstRoundRpm, getShotIntervalMsByRpm, round1, round2 } from '@/utils/burstTiming'

/** 判断是否为正的有限数：NaN、Infinity、0 与负数一律视为非法 */
function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

/**
 * 最短射击间隔的派生口径（仅用于全自动与单发）
 * 由射速换算并保留一位小数：60000 ÷ 射速
 */
export function deriveMinShotInterval(fireRate: number): number {
  return round1(getShotIntervalMsByRpm(fireRate))
}

/** 补齐后必定存在的开火参数字段 */
type FireDefaults = Pick<Weapon, 'fireMode' | 'minShotInterval' | 'burstSize'>

/**
 * 补齐可能缺失的开火参数，用于兼容不含新字段的旧数据
 * - fireMode 缺失或非法 → 全自动（历史数据按约定全部视为全自动）
 * - minShotInterval：连发取已填值（非法回退 0，交由界面提示补填）；全自动 / 单发由射速换算
 * - burstSize：仅连发有意义，其余模式一律归 0
 *
 * 返回新对象，不修改入参，便于在解析与归一化流程中直接替换原记录。
 */
export function withFireDefaults<T extends { fireRate: number } & Partial<Weapon>>(
  weapon: T,
): T & FireDefaults {
  const fireMode = isWeaponFireMode(weapon.fireMode) ? weapon.fireMode : 'auto'
  const isBurst = fireMode === 'burst'
  return {
    ...weapon,
    fireMode,
    minShotInterval: isBurst
      ? isPositiveNumber(weapon.minShotInterval)
        ? round1(weapon.minShotInterval)
        : 0
      : deriveMinShotInterval(weapon.fireRate),
    burstSize: isBurst && isPositiveNumber(weapon.burstSize) ? Math.round(weapon.burstSize) : 0,
  }
}

/**
 * 开火模式的展示文案
 * 全自动 / 单发直接取通用文案；连发需要带上发数，展示为「Y连发」，
 * 发数缺失或非法时退回通用文案「连发」，避免出现「0连发」这类无意义文案。
 */
export function getFireModeLabel(weapon: Pick<Weapon, 'fireMode' | 'burstSize'>): string {
  if (weapon.fireMode === 'burst' && isPositiveNumber(weapon.burstSize)) {
    return `${Math.round(weapon.burstSize)}连发`
  }
  return WEAPON_FIRE_MODE_LABELS[weapon.fireMode]
}

/** 连发轮次行的标识文案：N轮Y连发，例如「2轮3连发」 */
export function getBurstRoundLabel(burstSize: number, rounds: number): string {
  return `${rounds}轮${Math.round(burstSize)}连发`
}

/** 参与连发时序换算的字段：射速为官方标称射速，间隔为轮内间隔 */
type BurstTimingFields = Pick<Weapon, 'fireRate' | 'minShotInterval' | 'burstSize'>

/**
 * 判断连发武器能否按轮次展开出多条数据
 * 必须同时满足：开火模式为连发、一轮发数不少于 2、轮内间隔与射速均为正数；
 * 任一条件不满足时无法推导等效射速，调用方应退回「一行官方射速」的展示方式。
 */
export function canExpandBurst(weapon: Pick<Weapon, 'fireMode'> & BurstTimingFields): boolean {
  return (
    weapon.fireMode === 'burst' &&
    isPositiveNumber(weapon.burstSize) &&
    Math.round(weapon.burstSize) >= 2 &&
    isPositiveNumber(weapon.minShotInterval) &&
    isPositiveNumber(weapon.fireRate)
  )
}

/**
 * 连发武器累计 N 轮的等效射速（RPM），保留两位小数
 * 公式口径由 burstTiming 统一提供，此处只做武器结构到数值入参的适配与取整，
 * 因此它可以直接作为行的射速字段，使射速列与全部 DPS 列天然同口径。
 */
export function getBurstRoundRpmForWeapon(weapon: BurstTimingFields, rounds: number): number {
  return round2(
    getBurstRoundRpm(
      Math.round(weapon.burstSize),
      weapon.fireRate,
      weapon.minShotInterval,
      rounds,
    ),
  )
}
