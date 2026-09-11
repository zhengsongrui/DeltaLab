import type { TableColumnsType } from 'antd'
import type { ColumnGroup } from './components/ColumnSelector'
import type { StatsRow, ViewMode } from './rows'
import RangeBar, { RANGE_COLUMN_WIDTH } from '@/components/RangeBar'
import type { HitWeight } from '@/utils/dps'
import {
  calculateArmorDps,
  calculateCompositeDps,
  calculateDps,
  calculatePartDamage,
} from '@/utils/dps'
import { getRangeRgb, toCssRgb } from '@/utils/rangeColor'
import { HITBOX_PART_LABELS } from './composite'

/** 固定列：始终展示，不参与勾选 */
const FIXED_COLUMN_KEYS: readonly string[] = ['name']

/** 两个视图共用的可勾选列分组，由 HITBOX_PART_LABELS 派生，新增部位时自动扩展 */
const commonColumnGroups: ReadonlyArray<ColumnGroup> = [
  // {
  //   label: '部位倍率',
  //   options: HITBOX_PART_LABELS.map(({ part, label }) => ({
  //     key: `multiplier-${part}`,
  //     label: `${label}倍率`,
  //   })),
  // },
  {
    label: '部位伤害',
    options: HITBOX_PART_LABELS.map(({ part, label }) => ({
      key: `part-damage-${part}`,
      label: `${label}伤害`,
    })),
  },
  {
    label: '部位 DPS',
    options: HITBOX_PART_LABELS.map(({ part, label }) => ({
      key: `dps-${part}`,
      label: `${label} DPS`,
    })),
  },
  { label: '护甲', options: [{ key: 'armor-dps', label: '护甲 DPS' }] },
  { label: '综合', options: [{ key: 'dps-composite', label: '综合 DPS' }] },
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
 * 除枪械名称保持左对齐外，其余列的表头与单元格内容一律居中。
 */
export function buildColumns(
  distance: number,
  view: ViewMode,
  weights: HitWeight,
): TableColumnsType<StatsRow> {
  /** 各部位倍率列：原始字段，不随距离或射程段变化 */
  // const multiplierColumns: TableColumnsType<StatsRow> = HITBOX_PART_LABELS.map(({ part, label }) => ({
  //   title: `${label}倍率`,
  //   dataIndex: ['hitMultiplier', part],
  //   key: `multiplier-${part}`,
  //   align: 'right',
  // }))

  /** 各部位单发伤害列：按该行倍率换算 */
  const damageColumns: TableColumnsType<StatsRow> = HITBOX_PART_LABELS.map(({ part, label }) => ({
    title: `${label}伤害`,
    key: `part-damage-${part}`,
    align: 'center',
    render: (_value, row) => calculatePartDamage(row, part, row.multiplier),
  }))

  /** 各部位 DPS 列：按该行倍率计算且可排序，默认按胸部 DPS 降序 */
  const dpsColumns: TableColumnsType<StatsRow> = HITBOX_PART_LABELS.map(({ part, label }) => ({
    title: `${label} DPS`,
    key: `dps-${part}`,
    align: 'center',
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
            width: RANGE_COLUMN_WIDTH,
            align: 'center',
            // 方块图：固定表示 0-100 米，颜色与方块内数字表示各段倍率
            render: (_value, row) => <RangeBar ranges={row.range} />,
          },
          {
            title: '当前距离伤害倍率',
            key: 'distance-multiplier',
            align: 'center',
            // 字色由倍率换算：倍率越高越绿，越低越暗，与射程条保持同一色标
            render: (_value, row) => (
              <span style={{ color: toCssRgb(getRangeRgb(row.multiplier)) }}>
                {`${row.multiplier}倍(${distance}米)`}
              </span>
            ),
          },
        ]
      : [
          {
            title: '当前射程伤害倍率',
            key: 'range-multiplier',
            align: 'center',
            // 字色由倍率换算：倍率越高越绿，越低越暗，与射程条保持同一色标
            render: (_value, row) => (
              <span style={{ color: toCssRgb(getRangeRgb(row.multiplier)) }}>
                {row.segment.end === null
                  ? `${row.multiplier}（${row.segment.start}米以上）`
                  : `${row.multiplier}（${row.segment.start}-${row.segment.end}米）`}
              </span>
            ),
          },
        ]

  return [
    // 枪械名称保持左对齐以便扫读名称，其余列一律居中
    { title: '枪械名称', dataIndex: 'name', key: 'name' },
    ...infoColumns,
    { title: '射速 RPM', dataIndex: 'fireRate', key: 'fireRate', align: 'center' },
    ...dpsColumns,
    {
      title: '护甲 DPS',
      key: 'armor-dps',
      align: 'center',
      sorter: (a, b) => calculateArmorDps(a, a.multiplier) - calculateArmorDps(b, b.multiplier),
      render: (_value, row) => calculateArmorDps(row, row.multiplier),
    },
    {
      title: '综合 DPS',
      key: 'dps-composite',
      align: 'center',
      // 展示与排序都走同一套加权计算，权重变化后两处结果始终一致；
      // 不设默认排序，避免与胸部 DPS 的默认降序冲突
      sorter: (a, b) =>
        calculateCompositeDps(a, a.multiplier, weights) -
        calculateCompositeDps(b, b.multiplier, weights),
      render: (_value, row) => calculateCompositeDps(row, row.multiplier, weights),
    },
    { title: '基础伤害', dataIndex: ['damage', 'base'], key: 'damage-base', align: 'center' },
    { title: '护甲伤害', dataIndex: ['damage', 'armor'], key: 'damage-armor', align: 'center' },
    // ...multiplierColumns,
    ...damageColumns,
    
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
