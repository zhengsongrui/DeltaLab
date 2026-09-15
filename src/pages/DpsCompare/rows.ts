import type { Weapon } from '@/types/weapon'
import { getRangeMultiplier } from '@/utils/dps'
import {
  canExpandBurst,
  getBurstRoundLabel,
  getBurstRoundRpmForWeapon,
  getFireModeLabel,
} from '@/utils/weaponFire'

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
  /** 开火模式的展示文案：全自动 / X连发 / 单发，供开火模式列渲染 */
  fireModeLabel: string
  /** 连发轮次标识：形如「2轮3连发」；非连发行或未展开时为空串，供名称列追加展示 */
  roundLabel: string
}

/** 轮次展开后的一条候选数据：武器数值 + 该条的轮次标识 */
interface RoundsEntry {
  /** 该条对应的武器数值；连发条目已把射速替换为该轮次的等效射速 */
  weapon: Weapon
  /** 连发轮次标识，非展开条目为空串 */
  roundLabel: string
}

/**
 * 把一把武器展开为若干轮次候选
 *
 * 可展开的连发武器按累计 1 轮至 burstRounds 轮各产出一条，并把射速替换为该轮次的等效射速，
 * 于是射速列与全部 DPS 列天然同口径（都读行字段 fireRate），无需改动任何 DPS 公式。
 * 其余武器（非连发，或发数与轮内间隔不足导致等效射速无法推导）只产出一条，保留官方射速。
 */
function toRoundsEntries(weapon: Weapon, burstRounds: number): RoundsEntry[] {
  if (!canExpandBurst(weapon)) return [{ weapon, roundLabel: '' }]

  // 兜底至少 1 轮，避免调用方传入 0 或负数时该武器在表格中整体消失
  const count = Math.max(1, Math.round(burstRounds))
  return Array.from({ length: count }, (_unused, index) => {
    const rounds = index + 1
    return {
      weapon: { ...weapon, fireRate: getBurstRoundRpmForWeapon(weapon, rounds) },
      roundLabel: getBurstRoundLabel(weapon.burstSize, rounds),
    }
  })
}

/** 按武器视图：一把武器一行，倍率取输入距离对应的倍率；roundLabel 为该行所属的连发轮次标识 */
export function toWeaponRow(weapon: Weapon, distance: number, roundLabel = ''): StatsRow {
  return {
    ...weapon,
    // 整枪跨度：该视图不做距离筛选，此处仅保持两视图行结构一致（end 为 null 表示无上限）
    segment: { start: 0, end: null },
    multiplier: getRangeMultiplier(weapon, distance),
    fireModeLabel: getFireModeLabel(weapon),
    roundLabel,
  }
}

/** 按射程视图：一把武器有几段射程就产出几行，每行倍率取该段自身倍率 */
export function toRangeRows(weapon: Weapon, roundLabel = ''): StatsRow[] {
  return weapon.range.map((item, index) => ({
    ...weapon,
    // 左闭右开区间：start 为本段起点，end 为下一段起点；末段无终点记为 null
    segment: { start: item.start, end: weapon.range[index + 1]?.start ?? null },
    multiplier: item.multiplier,
    fireModeLabel: getFireModeLabel(weapon),
    roundLabel,
  }))
}

/**
 * 构造当前视图的全部行数据
 *
 * 展开顺序为「轮次优先」：先把连发武器按累计轮数展开，再按视图展开射程段，
 * 因此射程视图下同一轮次的各段相邻，便于同一轮次内纵向对比；
 * 武器列表由页面从 store 注入，本模块不依赖任何数据源。
 *
 * @param burstRounds 连发武器展开的累计轮数 X，由「连发模式武器控制」设置给出
 */
export function buildRows(
  weaponList: readonly Weapon[],
  distance: number,
  view: ViewMode,
  burstRounds: number,
): StatsRow[] {
  return weaponList.flatMap((weapon) =>
    toRoundsEntries(weapon, burstRounds).flatMap((entry) =>
      view === 'range'
        ? toRangeRows(entry.weapon, entry.roundLabel)
        : [toWeaponRow(entry.weapon, distance, entry.roundLabel)],
    ),
  )
}

/**
 * 构造图表对比用的枪械清单
 *
 * 与表格共用同一套展开口径：固定按武器视图、不依赖距离，只把连发武器按累计轮数各产出一条，
 * 并把轮次标识并入名称（如「AK47 2轮3连发」），图表便可用名称区分同枪不同轮次的曲线。
 *
 * @param burstRounds 连发武器展开的累计轮数 X，与表格共用同一设置
 */
export function buildChartWeapons(weaponList: readonly Weapon[], burstRounds: number): Weapon[] {
  return weaponList.flatMap((weapon) =>
    toRoundsEntries(weapon, burstRounds).map((entry) => ({
      ...entry.weapon,
      // 非展开条目的标识为空串，此时保留原名
      name: entry.roundLabel === '' ? entry.weapon.name : `${entry.weapon.name} ${entry.roundLabel}`,
    })),
  )
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
