import type { HitboxPart, Weapon } from '@/types/weapon'
import type { HitWeight } from '@/utils/dps'
import {
  calculateArmorDps,
  calculateCompositeDps,
  calculateDps,
  getRangeMultiplier,
} from '@/utils/dps'

/** 图表 X 轴的距离范围：固定 0-100 米，与射程条保持一致，便于横向比对 */
export const CHART_MAX_DISTANCE = 100

/**
 * 曲线类型：综合 DPS、各受击部位 DPS 与护甲 DPS
 * 'composite' 与 'armor' 是特殊项，其余取值即受击部位，直接复用 HitboxPart 类型
 */
export type CurveMetric = 'composite' | 'armor' | HitboxPart

/** 曲线类型选项，顺序即界面顺序，首项综合 DPS 为默认选中项 */
export const CURVE_OPTIONS: ReadonlyArray<{ label: string; value: CurveMetric }> = [
  { label: '综合 DPS', value: 'composite' },
  { label: '头部 DPS', value: 'head' },
  { label: '胸部 DPS', value: 'chest' },
  { label: '腹部 DPS', value: 'abdomen' },
  { label: '四肢 DPS', value: 'limbs' },
  { label: '护甲 DPS', value: 'armor' },
]

/** 计算某武器在指定距离、指定曲线类型下的 DPS，复用现有 DPS 计算函数 */
function calculateByMetric(
  weapon: Weapon,
  metric: CurveMetric,
  distance: number,
  weights: HitWeight,
): number {
  // 射程倍率由距离查表得到，下方三种计算均基于同一倍率
  const multiplier = getRangeMultiplier(weapon, distance)
  if (metric === 'composite') return calculateCompositeDps(weapon, multiplier, weights)
  if (metric === 'armor') return calculateArmorDps(weapon, multiplier)
  return calculateDps(weapon, metric, multiplier)
}

/**
 * 生成某武器在 0-100 米上的 DPS 采样点
 * 采样点取首段起点 0、各段起点与最大距离：射程倍率只在段边界跳变，因此这些点已足以描述整条曲线。
 * 返回的元组为 [距离, DPS]，交由折线的阶梯模式渲染，DPS 在段边界垂直跃迁，即呈现断崖式折线。
 */
export function buildDpsPoints(
  weapon: Weapon,
  metric: CurveMetric,
  weights: HitWeight,
): Array<[number, number]> {
  // 各段起点即倍率跳变处，去重并升序后连同首尾端点构成完整采样点
  const boundaries = Array.from(
    new Set([0, ...weapon.range.map((item) => item.start), CHART_MAX_DISTANCE]),
  ).sort((a, b) => a - b)
  return boundaries.map((distance) => [distance, calculateByMetric(weapon, metric, distance, weights)])
}
