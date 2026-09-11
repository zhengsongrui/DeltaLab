import type { TableColumnsType } from 'antd'
import { Button, Popconfirm, Space } from 'antd'
import RangeBar, { RANGE_COLUMN_WIDTH } from '@/components/RangeBar'
import type { HitboxPart, WeaponRecord } from '@/types/weapon'

/** 各受击部位的中文名，顺序即表格列顺序 */
const PART_LABELS: ReadonlyArray<{ part: HitboxPart; label: string }> = [
  { part: 'head', label: '头部' },
  { part: 'chest', label: '胸部' },
  { part: 'abdomen', label: '腹部' },
  { part: 'limbs', label: '四肢' },
]

/**
 * 武器管理表格列：字段与 src/data/weapons.ts 一一对应
 * 除枪械名称保持左对齐外，其余列的表头与单元格内容一律居中。
 * 操作列提供编辑与删除：编辑回调交出整行记录用于回填表单，删除带二次确认并交出该行 id
 */
export function buildColumns(
  onEdit: (record: WeaponRecord) => void,
  onDelete: (id: string) => void,
): TableColumnsType<WeaponRecord> {
  /** 各部位倍率列：原始字段，逐部位展示，可按该部位倍率排序 */
  const multiplierColumns: TableColumnsType<WeaponRecord> = PART_LABELS.map(({ part, label }) => ({
    title: `${label}倍率`,
    dataIndex: ['hitMultiplier', part],
    key: `multiplier-${part}`,
    align: 'center',
    sorter: (a, b) => a.hitMultiplier[part] - b.hitMultiplier[part],
  }))

  return [
    // 枪械名称保持左对齐以便扫读名称，其余列一律居中
    // 除射程（方块图无法比较）与操作（无数据）外，其余列均可点击表头排序
    {
      title: '枪械名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'zh'),
    },
    {
      title: '基础伤害',
      dataIndex: ['damage', 'base'],
      key: 'damage-base',
      align: 'center',
      sorter: (a, b) => a.damage.base - b.damage.base,
    },
    {
      title: '护甲伤害',
      dataIndex: ['damage', 'armor'],
      key: 'damage-armor',
      align: 'center',
      sorter: (a, b) => a.damage.armor - b.damage.armor,
    },
    {
      title: '射速 RPM',
      dataIndex: 'fireRate',
      key: 'fireRate',
      align: 'center',
      sorter: (a, b) => a.fireRate - b.fireRate,
    },
    {
      title: '射程',
      key: 'range',
      width: RANGE_COLUMN_WIDTH,
      align: 'center',
      // 方块图：固定表示 0-100 米，颜色与方块内数字表示各段倍率
      render: (_value, row) => <RangeBar ranges={row.range} />,
    },
    ...multiplierColumns,
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_value, row) => (
        <Space size="small">
          <Button size="small" onClick={() => onEdit(row)}>
            编辑
          </Button>
          <Popconfirm
            title={`确定删除${row.name}？`}
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
