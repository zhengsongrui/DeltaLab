import { useState } from 'react'
import { Card, Table } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import DpsCompareToolbar from './components/DpsCompareToolbar'
import { buildColumns, filterVisibleColumns, getToggleableKeys } from './columns'
import { buildRows, filterRows } from './rows'
import type { StatsRow, ViewMode } from './rows'
import { columnsStorageKey, useVisibleColumns } from './hooks/useVisibleColumns'

/** DPS对比页：只需要装配工具栏、行数据与表格，计算与列定义均在对应模块内 */
export default function DpsCompare() {
  /** 当前射击距离（米），默认 0 米即首段满额倍率 */
  const [distance, setDistance] = useState(0)
  /** 当前视图，默认按武器展示 */
  const [view, setView] = useState<ViewMode>('weapon')
  /** 是否开启距离筛选，仅在射程视图有效 */
  const [filterEnabled, setFilterEnabled] = useState(false)
  /** 列可见性按视图分别记忆并持久化 */
  const [visibleKeys, setVisibleKeys] = useVisibleColumns(
    columnsStorageKey(view),
    getToggleableKeys(view),
  )

  /** 武器列表来自 store，与武器管理页共用同一份数据 */
  const weapons = useAppStore((state) => state.weapons)

  /** 先按当前视图算出全部行数据；仅射程视图在开关开启时按距离裁剪 */
  const rows = filterRows(
    buildRows(weapons, distance, view),
    distance,
    view === 'range' && filterEnabled,
  )

  /** 列清单由当前视图与射击距离决定，再按勾选结果过滤 */
  const columns = filterVisibleColumns(buildColumns(distance, view), visibleKeys)

  return (
    <Card title="DPS对比">
      <DpsCompareToolbar
        view={view}
        onViewChange={setView}
        distance={distance}
        onDistanceChange={setDistance}
        filterEnabled={filterEnabled}
        onFilterEnabledChange={setFilterEnabled}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
      />
      <Table<StatsRow>
        // 按射程视图下同一把武器会有多行，用「名称 + 行号」保证 rowKey 唯一
        rowKey={(row, index) => `${row.name}-${index ?? 0}`}
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  )
}
