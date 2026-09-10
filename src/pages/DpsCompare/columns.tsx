import type { TableColumnsType } from 'antd'
import type { ColumnGroup } from './components/ColumnSelector'
import { formatRange } from './rows'
import type { StatsRow, ViewMode } from './rows'
import type { HitboxPart } from '@/types/weapon'
import { calculateArmorDps, calculateDps, calculatePartDamage } from '@/utils/dps'

/** 各受击部位的中文名，顺序即表格列顺序 */
const partLabels: ReadonlyArray<{ part: HitboxPart; label: string }> = [
  { part: 'head', label: '头部' },
  { part: 'chest', label: '胸部' },
  { part: 'abdomen', label: '腹部' },
  { part: 'limbs', label: '四肢' },
]

/** 固定列：始终展示，不参与勾选 */
const FIXED_COLUMN_KEYS: readonly string[] = ['name']

/** 两个视图共用的可勾选列分组，由 partLabels 派生，新增部位时自动扩展 */
const commonColumnGroups: ReadonlyArray<ColumnGroup> = [
  {
    label: '部位倍率',
    options: partLabels.map(({ part, label }) => ({
      key: `multiplier-${part}`,
      label: `${label}倍率`,
    })),
  },
  {
    label: '部位伤害',
    options: partLabels.map(({ part, label }) => ({
      key: `part-damage-${part}`,
      label: `${label}伤害`,
    })),
  },
  {
    label: '部位 DPS',
    options: partLabels.map(({ part, label }) => ({
      key: `dps-${part}`,
      label: `${label} DPS`,
    })),
  },
  { label: '护甲', options: [{ key: 'armor-dps', label: '护甲 DPS' }] },
]

/**
 * 可勾选列的分组清单，顺序即面板与表格的展示顺序
 * 基础信息组按视图分叉：武器视图展示整枪射程与当前距离倍率，射程视图只展示该行自身的射程倍率
 */
export function buildColumnGroups(view: ViewMode): ReadonlyArray<ColumnGroup> {
  /** 基础信息组：两视图的列集合不同，因此分别定义 */
  const baseInfo: ColumnGroup =
    view === 'weapon'
      ? {
          label: '基础信息',
          options: [
            { key: 'damage-base', label: '基础伤害' },
            { key: 'damage-armor', label: '护甲伤害' },
            { key: 'fireRate', label: '射速 RPM' },
            { key: 'range', label: '各段射程伤害倍率' },
            { key: 'distance-multiplier', label: '当前距离伤害倍率' },
          ],
        }
      : {
          label: '基础信息',
          options: [
            { key: 'damage-base', label: '基础伤害' },
            { key: 'damage-armor', label: '护甲伤害' },
            { key: 'fireRate', label: '射速 RPM' },
            { key: 'range-multiplier', label: '当前射程伤害倍率' },
          ],
        }

  return [baseInfo, ...commonColumnGroups]
}

/** 由分组清单派生全部可勾选列的 key，顺序与分组清单一致 */
export function getToggleableKeys(view: ViewMode): string[] {
  return buildColumnGroups(view).flatMap((group) => group.options.map((option) => option.key))
}

/**
 * 依据当前视图与射击距离生成表格列
 * 数值列的倍率一律取行字段 multiplier，因此两种视图共用同一套列定义，
 * 只有「基础信息」中依赖距离或射程段的列按视图分叉。
 */
export function buildColumns(distance: number, view: ViewMode): TableColumnsType<StatsRow> {
  /** 各部位倍率列：原始字段，不随距离或射程段变化 */
  const multiplierColumns: TableColumnsType<StatsRow> = partLabels.map(({ part, label }) => ({
    title: `${label}倍率`,
    dataIndex: ['hitMultiplier', part],
    key: `multiplier-${part}`,
    align: 'right',
  }))

  /** 各部位单发伤害列：按该行倍率换算 */
  const damageColumns: TableColumnsType<StatsRow> = partLabels.map(({ part, label }) => ({
    title: `${label}伤害`,
    key: `part-damage-${part}`,
    align: 'right',
    render: (_value, row) => calculatePartDamage(row, part, row.multiplier),
  }))

  /** 各部位 DPS 列：按该行倍率计算且可排序，默认按胸部 DPS 降序 */
  const dpsColumns: TableColumnsType<StatsRow> = partLabels.map(({ part, label }) => ({
    title: `${label} DPS`,
    key: `dps-${part}`,
    align: 'right',
    sorter: (a, b) => calculateDps(a, part, a.multiplier) - calculateDps(b, part, b.multiplier),
    defaultSortOrder: part === 'chest' ? 'descend' : undefined,
    render: (_value, row) => calculateDps(row, part, row.multiplier),
  }))

  /** 基础信息中随视图变化的列：武器视图给整枪链路与当前距离倍率，射程视图给该行自身的倍率 */
  const infoColumns: TableColumnsType<StatsRow> =
    view === 'weapon'
      ? [
          {
            title: '各段射程伤害倍率',
            key: 'range',
            render: (_value, row) => formatRange(row.range),
          },
          {
            title: '当前距离伤害倍率',
            key: 'distance-multiplier',
            align: 'right',
            render: (_value, row) => `${row.multiplier}倍(${distance}米)`,
          },
        ]
      : [
          {
            title: '当前射程伤害倍率',
            key: 'range-multiplier',
            align: 'right',
            render: (_value, row) =>
              row.segment.end === null
                ? `${row.multiplier}（${row.segment.start}米以上）`
                : `${row.multiplier}（${row.segment.start}-${row.segment.end}米）`,
          },
        ]

  return [
    { title: '枪械名称', dataIndex: 'name', key: 'name' },
    { title: '基础伤害', dataIndex: ['damage', 'base'], key: 'damage-base', align: 'right' },
    { title: '护甲伤害', dataIndex: ['damage', 'armor'], key: 'damage-armor', align: 'right' },
    { title: '射速 RPM', dataIndex: 'fireRate', key: 'fireRate', align: 'right' },
    ...infoColumns,
    ...multiplierColumns,
    ...damageColumns,
    ...dpsColumns,
    {
      title: '护甲 DPS',
      key: 'armor-dps',
      align: 'right',
      sorter: (a, b) => calculateArmorDps(a, a.multiplier) - calculateArmorDps(b, b.multiplier),
      render: (_value, row) => calculateArmorDps(row, row.multiplier),
    },
  ]
}

/** 过滤列：固定列始终保留，其余列按当前视图的勾选结果过滤 */
export function filterVisibleColumns(
  columns: TableColumnsType<StatsRow>,
  visibleKeys: readonly string[],
): TableColumnsType<StatsRow> {
  return columns.filter(
    (column) =>
      FIXED_COLUMN_KEYS.includes(String(column.key)) || visibleKeys.includes(String(column.key)),
  )
}
