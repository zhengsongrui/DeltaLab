import { InputNumber, Segmented, Space, Switch, Typography } from 'antd'
import ColumnSelector from './ColumnSelector'
import { buildColumnGroups } from '../columns'
import { VIEW_OPTIONS } from '../rows'
import type { ViewMode } from '../rows'

interface DpsCompareToolbarProps {
  /** 当前视图：按武器或按射程 */
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  /** 当前射击距离（米） */
  distance: number
  onDistanceChange: (distance: number) => void
  /** 是否开启距离筛选，仅射程视图生效 */
  filterEnabled: boolean
  onFilterEnabledChange: (enabled: boolean) => void
  /** 当前视图已勾选展示的列 */
  visibleKeys: string[]
  onVisibleKeysChange: (keys: string[]) => void
}

/** DPS对比页工具栏：视图切换、射击距离、距离筛选与列显示，全部为受控组件 */
export default function DpsCompareToolbar({
  view,
  onViewChange,
  distance,
  onDistanceChange,
  filterEnabled,
  onFilterEnabledChange,
  visibleKeys,
  onVisibleKeysChange,
}: DpsCompareToolbarProps) {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Segmented<ViewMode> options={[...VIEW_OPTIONS]} value={view} onChange={onViewChange} />
      <Typography.Text>射击距离</Typography.Text>
      <InputNumber
        value={distance}
        min={0}
        step={1}
        addonAfter="米"
        onChange={(value: number | null) => onDistanceChange(value ?? 0)}
      />
      {/* 距离筛选只在按射程视图提供，按武器视图无此功能 */}
      {view === 'range' && (
        <Space size={4}>
          <Typography.Text>距离筛选</Typography.Text>
          <Switch checked={filterEnabled} onChange={onFilterEnabledChange} />
        </Space>
      )}
      <ColumnSelector
        groups={buildColumnGroups(view)}
        value={visibleKeys}
        onChange={onVisibleKeysChange}
      />
    </Space>
  )
}
