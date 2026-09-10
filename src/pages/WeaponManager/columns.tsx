import type { TableColumnsType } from 'antd'
import { Button, Popconfirm, Space } from 'antd'
import type { HitboxPart, WeaponRange, WeaponRecord } from '@/types/weapon'

/** 各受击部位的中文名，顺序即表格列顺序 */
const PART_LABELS: ReadonlyArray<{ part: HitboxPart; label: string }> = [
  { part: 'head', label: '头部' },
  { part: 'chest', label: '胸部' },
  { part: 'abdomen', label: '腹部' },
  { part: 'limbs', label: '四肢' },
]

/**
 * 把射程分段拼成可读文本
 * 每段用自身 start 与下一段 start 组成 [start, end)；末段无终点，显示「N米以上」
 * 例如 1倍(0-27米)｜0.9倍(27-35米)｜0.7倍(54米以上)
 */
function formatRange(ranges: WeaponRange[]): string {
  return ranges
    .map((item, index) => {
      const end = ranges[index + 1]?.start
      const span = end === undefined ? `${item.start}米以上` : `${item.start}-${end}米`
      return `${item.multiplier}倍(${span})`
    })
    .join('｜')
}

/**
 * 武器管理表格列：字段与 src/data/weapons.ts 一一对应
 * 操作列提供编辑与删除：编辑回调交出整行记录用于回填表单，删除带二次确认并交出该行 id
 */
export function buildColumns(
  onEdit: (record: WeaponRecord) => void,
  onDelete: (id: string) => void,
): TableColumnsType<WeaponRecord> {
  /** 各部位倍率列：原始字段，逐部位展示 */
  const multiplierColumns: TableColumnsType<WeaponRecord> = PART_LABELS.map(({ part, label }) => ({
    title: `${label}倍率`,
    dataIndex: ['hitMultiplier', part],
    key: `multiplier-${part}`,
    align: 'right',
  }))

  return [
    { title: '枪械名称', dataIndex: 'name', key: 'name' },
    { title: '基础伤害', dataIndex: ['damage', 'base'], key: 'damage-base', align: 'right' },
    { title: '护甲伤害', dataIndex: ['damage', 'armor'], key: 'damage-armor', align: 'right' },
    { title: '射速 RPM', dataIndex: 'fireRate', key: 'fireRate', align: 'right' },
    {
      title: '射程',
      key: 'range',
      render: (_value, row) => formatRange(row.range),
    },
    ...multiplierColumns,
    {
      title: '操作',
      key: 'action',
      render: (_value, row) => (
        <Space size="small">
          <Button size="small" onClick={() => onEdit(row)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该武器？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDelete(row.id)}
          >
            <Button danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]
}
