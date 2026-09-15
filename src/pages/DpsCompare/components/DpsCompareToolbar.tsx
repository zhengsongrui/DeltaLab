import { Button, InputNumber, Segmented, Space, Switch, Typography } from 'antd'
import ColumnSelector from './ColumnSelector'
import type { ColumnGroup } from './ColumnSelector'
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
  /** 全部武器名，作为「按武器名过滤」面板的勾选候选 */
  weaponNames: readonly string[]
  /** 当前已勾选展示的武器名 */
  selectedWeaponNames: string[]
  onSelectedWeaponNamesChange: (names: string[]) => void
  /** 被武器名过滤隐藏的行数，为 0 时不展示提示 */
  filteredRowCount: number
  /** 打开综合 DPS 计算设置弹窗 */
  onOpenCompositeSetting: () => void
  /** 打开连发模式武器控制弹窗 */
  onOpenBurstControl: () => void
  /** 打开图表对比弹窗 */
  onOpenChart: () => void
}

/** DPS对比页工具栏：视图切换、射击距离、距离筛选、按武器名过滤与列显示，全部为受控组件 */
export default function DpsCompareToolbar({
  view,
  onViewChange,
  distance,
  onDistanceChange,
  filterEnabled,
  onFilterEnabledChange,
  visibleKeys,
  onVisibleKeysChange,
  weaponNames,
  selectedWeaponNames,
  onSelectedWeaponNamesChange,
  filteredRowCount,
  onOpenCompositeSetting,
  onOpenBurstControl,
  onOpenChart,
}: DpsCompareToolbarProps) {
  /** 武器名勾选面板只含一个无标题分组，直接复用列选择器的勾选面板实现 */
  const weaponGroups: ReadonlyArray<ColumnGroup> = [
    { label: '', options: weaponNames.map((name) => ({ key: name, label: name })) },
  ]
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
        style={{width:100}}
      />
      {/* 距离筛选只在按射程视图提供，按武器视图无此功能 */}
      {view === 'range' && (
        <Space size={4}>
          <Typography.Text>过滤非射击距离数据</Typography.Text>
          <Switch checked={filterEnabled} onChange={onFilterEnabledChange} />
        </Space>
      )}
      {/* 行过滤：按武器名勾选决定展示哪些行，其后紧跟被隐藏的行数提示 */}
      <ColumnSelector
        title={filteredRowCount > 0 ? `按武器名过滤-已过滤${filteredRowCount}条` : `按武器名过滤`}
        groups={weaponGroups}
        value={selectedWeaponNames}
        onChange={onSelectedWeaponNamesChange}
      />
      <ColumnSelector
        groups={buildColumnGroups(view)}
        value={visibleKeys}
        onChange={onVisibleKeysChange}
      />
      {/* 综合 DPS 设置：打开弹窗编辑四项命中权重，保存后综合 DPS 列自动重算 */}
      <Button onClick={onOpenCompositeSetting}>综合 DPS 设置</Button>
      {/* 连发模式武器控制：设置连发武器在表格中展开的累计轮数 X，保存后行数据立即重算 */}
      <Button onClick={onOpenBurstControl}>连发模式武器控制</Button>
      {/* 图表对比：打开弹窗以折线图对比多把枪械的 DPS 随距离变化 */}
      <Button onClick={onOpenChart}>图表对比</Button>
    </Space>
  )
}
