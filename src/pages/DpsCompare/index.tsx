import { useState } from 'react'
import { Card } from 'antd'
import AutoHeightTable from '@/components/AutoHeightTable'
import { useAppStore } from '@/store/useAppStore'
import type { HitWeight } from '@/utils/dps'
import BurstControlModal from './components/BurstControlModal'
import CompositeDpsModal from './components/CompositeDpsModal'
import DpsChartModal from './components/DpsChartModal'
import DpsCompareToolbar from './components/DpsCompareToolbar'
import { buildColumns, filterVisibleColumns, getToggleableKeys } from './columns'
import { buildChartWeapons, buildRows, filterRows, filterRowsByName } from './rows'
import type { StatsRow, ViewMode } from './rows'
import { useBurstRounds } from './hooks/useBurstRounds'
import { useCompositeWeights } from './hooks/useCompositeWeights'
import { columnsStorageKey, useVisibleColumns } from './hooks/useVisibleColumns'
import { useVisibleWeapons } from './hooks/useVisibleWeapons'

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
  /** 综合 DPS 计算设置弹窗开关 */
  const [compositeSettingOpen, setCompositeSettingOpen] = useState(false)
  /** 图表对比弹窗开关 */
  const [chartOpen, setChartOpen] = useState(false)
  /** 综合 DPS 的命中权重：持久化在 hook 内，表格按它换算综合 DPS 列 */
  const [compositeWeights, saveCompositeWeights] = useCompositeWeights()
  /** 连发模式武器控制弹窗开关 */
  const [burstControlOpen, setBurstControlOpen] = useState(false)
  /** 连发武器展开的累计轮数 X：持久化在 hook 内，表格按它把连发武器展开成多行 */
  const [burstRounds, saveBurstRounds] = useBurstRounds()

  /** 武器列表来自 store，与武器管理页共用同一份数据 */
  const weapons = useAppStore((state) => state.weapons)

  /** 行过滤候选：全部武器名，顺序与武器列表一致 */
  const weaponNames = weapons.map((weapon) => weapon.name)
  /** 已勾选的武器名：勾选结果持久化，两个视图共用同一份过滤条件 */
  const [selectedWeaponNames, setSelectedWeaponNames] = useVisibleWeapons(weaponNames)

  /** 先按当前视图算全部行（连发武器按 X 轮展开），再按武器名过滤；仅射程视图在开关开启时按距离裁剪 */
  const allRows = buildRows(weapons, distance, view, burstRounds)
  const namedRows = filterRowsByName(allRows, selectedWeaponNames)
  const rows = filterRows(namedRows, distance, view === 'range' && filterEnabled)

  /** 被武器名过滤隐藏的行数，供工具栏提示「已过滤X条」 */
  const filteredRowCount = allRows.length - namedRows.length

  /** 图表候选枪械：与表格同口径地把连发武器按轮数展开，名称带上轮次标识，且不受距离影响 */
  const chartWeapons = buildChartWeapons(weapons, burstRounds)

  /** 列清单由当前视图与射击距离决定，再按勾选结果过滤 */
  const columns = filterVisibleColumns(buildColumns(distance, view, compositeWeights), visibleKeys)

  /** 保存命中权重并收起弹窗，表格随即按新权重重算综合 DPS */
  function handleSaveCompositeWeights(next: HitWeight): void {
    saveCompositeWeights(next)
    setCompositeSettingOpen(false)
  }

  /** 保存连发轮数并收起弹窗，表格随即按新的轮数重算连发武器的行数据 */
  function handleSaveBurstRounds(next: number): void {
    saveBurstRounds(next)
    setBurstControlOpen(false)
  }

  return (
    // 卡片撑满内容区并与工具栏一起纵向排列，表格才能拿到确定的可用高度
    <Card
      title="DPS对比"
      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
    >
      <DpsCompareToolbar
        view={view}
        onViewChange={setView}
        distance={distance}
        onDistanceChange={setDistance}
        filterEnabled={filterEnabled}
        onFilterEnabledChange={setFilterEnabled}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        weaponNames={weaponNames}
        selectedWeaponNames={selectedWeaponNames}
        onSelectedWeaponNamesChange={setSelectedWeaponNames}
        filteredRowCount={filteredRowCount}
        onOpenCompositeSetting={() => setCompositeSettingOpen(true)}
        onOpenBurstControl={() => setBurstControlOpen(true)}
        onOpenChart={() => setChartOpen(true)}
      />
      <AutoHeightTable<StatsRow>
        // 按射程视图下同一把武器会有多行，用「名称 + 行号」保证 rowKey 唯一
        rowKey={(row, index) => `${row.name}-${index ?? 0}`}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />
      {/* 综合 DPS 计算设置：保存后综合 DPS 列自动显示计算结果 */}
      <CompositeDpsModal
        open={compositeSettingOpen}
        weights={compositeWeights}
        onCancel={() => setCompositeSettingOpen(false)}
        onSave={handleSaveCompositeWeights}
      />
      {/* 连发模式武器控制：保存后连发武器按新的累计轮数重新展开展示 */}
      <BurstControlModal
        open={burstControlOpen}
        rounds={burstRounds}
        onCancel={() => setBurstControlOpen(false)}
        onSave={handleSaveBurstRounds}
      />
      {/* 图表对比：以折线图对比多把枪械的 DPS 随距离变化，候选枪械与连发轮数、命中权重均与表格同口径 */}
      <DpsChartModal
        open={chartOpen}
        weapons={chartWeapons}
        weights={compositeWeights}
        onCancel={() => setChartOpen(false)}
      />
    </Card>
  )
}
