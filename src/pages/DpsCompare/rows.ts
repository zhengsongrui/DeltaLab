import type { Weapon } from '@/types/weapon'
import { getRangeMultiplier } from '@/utils/dps'

/** 视图类型：按武器（一行一把武器）或按射程（一行一段射程） */
export type ViewMode = 'weapon' | 'range'

/** 视图切换选项，顺序即界面顺序 */
export const VIEW_OPTIONS: ReadonlyArray<{ label: string; value: ViewMode }> = [
  { label: '按枪械', value: 'weapon' },
  { label: '按射程', value: 'range' },
]

/**
 * 行所属射程区间，语义为左闭右开 [start, end)
 * 例：0-27 表示大于等于 0 且小于 27；27-35 表示大于等于 27 且小于 35
 */
export interface SegmentRange {
  /** 含的下界：首段为 0，其余为上一段起点 */
  start: number
  /** 不含的上界：本段终点（即下一段起点）；为 null 表示无上限 */
  end: number | null
}

/**
 * 表格行：原始武器字段原样展开 + 该行生效的射程信息
 * 按武器视图：一行一把武器，segment 为整枪跨度，multiplier 为输入距离对应的倍率
 * 按射程视图：一行一段射程，segment 为该段区间，multiplier 为该段自身倍率
 */
export interface StatsRow extends Weapon {
  /** 该行的射程区间：射程视图用于距离筛选与区间文案 */
  segment: SegmentRange
  /** 该行生效的伤害倍率，伤害与 DPS 列都按它计算 */
  multiplier: number
}

/** 按武器视图：一把武器一行，倍率取输入距离对应的倍率 */
export function toWeaponRow(weapon: Weapon, distance: number): StatsRow {
  return {
    ...weapon,
    // 整枪跨度：该视图不做距离筛选，此处仅保持两视图行结构一致（end 为 null 表示无上限）
    segment: { start: 0, end: null },
    multiplier: getRangeMultiplier(weapon, distance),
  }
}

/** 按射程视图：一把武器有几段射程就产出几行，每行倍率取该段自身倍率 */
export function toRangeRows(weapon: Weapon): StatsRow[] {
  return weapon.range.map((item, index) => ({
    ...weapon,
    // 左闭右开区间：start 为本段起点，end 为下一段起点；末段无终点记为 null
    segment: { start: item.start, end: weapon.range[index + 1]?.start ?? null },
    multiplier: item.multiplier,
  }))
}

/**
 * 构造当前视图的全部行数据：按射程视图会把一条武器数据展开成 N 条
 * 武器列表由页面从 store 注入，本模块不依赖任何数据源
 */
export function buildRows(
  weaponList: readonly Weapon[],
  distance: number,
  view: ViewMode,
): StatsRow[] {
  return view === 'range'
    ? weaponList.flatMap((weapon) => toRangeRows(weapon))
    : weaponList.map((weapon) => toWeaponRow(weapon, distance))
}

/**
 * 判断距离是否落在该行的射程区间内
 * 区间为左闭右开 [start, end)；end 为 null 表示无上限，超过起点后一直命中
 */
function isCovering(segment: SegmentRange, distance: number): boolean {
  return distance >= segment.start && (segment.end === null || distance < segment.end)
}

/** 距离筛选：仅在射程视图开启开关时生效，只保留射程区间覆盖输入距离的行 */
export function filterRows(rows: StatsRow[], distance: number, enabled: boolean): StatsRow[] {
  if (!enabled) return rows
  return rows.filter((row) => isCovering(row.segment, distance))
}

/**
 * 按武器名过滤行：只保留名称已被勾选的行
 * 勾选集合来自「按武器名过滤」面板，两个视图共用同一份集合；
 * 集合为空表示一把武器都未勾选，此时结果为空表（行全部隐藏）
 */
export function filterRowsByName(rows: StatsRow[], selectedNames: readonly string[]): StatsRow[] {
  return rows.filter((row) => selectedNames.includes(row.name))
}
