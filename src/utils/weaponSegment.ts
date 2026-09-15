/**
 * 武器与射击间隔线段的桥接模块
 *
 * 职责只有两件事：
 * 1. 把一把武器换算成射击间隔对比所需的时序参数；
 * 2. 把存储态线段解析成字段齐全的展示态线段。
 *
 * 导入线段不保存数值快照，解析时按 weaponId 从武器库实时换算，
 * 因此武器在枪械管理页被修改后，对比页下次渲染即自动跟随；被删除则该线段被过滤掉。
 */
import type { Weapon, WeaponRecord } from '@/types/weapon'
import type { FireSegment, FireTimingParams, ResolvedFireSegment } from '@/types/fireInterval'
import { getBurstSizeLabel } from '@/types/fireInterval'
import { getFireModeLabel } from '@/utils/weaponFire'

/**
 * 武器 → 线段时序参数
 * - 连发：发数取武器的 burstSize，轮内间隔取 minShotInterval，官方射速取 fireRate；
 * - 全自动 / 单发：发数归 0，射击间隔由射速换算。
 */
export function weaponToTiming(weapon: Weapon): FireTimingParams {
  if (weapon.fireMode === 'burst' && weapon.burstSize >= 1) {
    return {
      burstSize: Math.round(weapon.burstSize),
      fireRate: weapon.fireRate,
      burstInterval: weapon.minShotInterval,
      officialRpm: weapon.fireRate,
    }
  }
  return {
    burstSize: 0,
    fireRate: weapon.fireRate,
    burstInterval: 0,
    officialRpm: weapon.fireRate,
  }
}

/**
 * 解析单条线段
 * - 手动线段：原样转出，名称与发数文案取自存储值；
 * - 导入线段：按 weaponId 从武器库实时换算；武器已删除时返回 null，交由调用方过滤。
 */
export function resolveSegment(
  segment: FireSegment,
  weapons: readonly WeaponRecord[],
): ResolvedFireSegment | null {
  if (segment.source === 'manual') {
    return {
      id: segment.id,
      source: 'manual',
      name: segment.name,
      modeLabel: getBurstSizeLabel(segment.burstSize),
      burstSize: segment.burstSize,
      fireRate: segment.fireRate,
      burstInterval: segment.burstInterval,
      officialRpm: segment.officialRpm,
    }
  }

  const weapon = weapons.find((item) => item.id === segment.weaponId)
  if (!weapon) return null
  return {
    id: segment.id,
    source: 'weapon',
    // 名称实时取自武器，武器改名后对比区与卡片同步更新
    name: weapon.name,
    modeLabel: getFireModeLabel(weapon),
    ...weaponToTiming(weapon),
  }
}

/** 批量解析：保持原顺序，并过滤掉所引用武器已被删除的导入线段 */
export function resolveSegments(
  segments: readonly FireSegment[],
  weapons: readonly WeaponRecord[],
): ResolvedFireSegment[] {
  return segments
    .map((segment) => resolveSegment(segment, weapons))
    .filter((segment): segment is ResolvedFireSegment => segment !== null)
}
