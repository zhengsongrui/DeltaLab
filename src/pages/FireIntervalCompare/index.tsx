import { useMemo, useState } from 'react'
import { Card, Space } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import { resolveSegments } from '@/utils/weaponSegment'
import FireCompareChart from './components/FireCompareChart'
import FireIntervalToolbar from './components/FireIntervalToolbar'
import ImportWeaponModal from './components/ImportWeaponModal'
import SegmentCard from './components/SegmentCard'
import WeaponSegmentCard from './components/WeaponSegmentCard'
import { getSegmentColor } from './colors'
import { useFireSegments } from './hooks/useFireSegments'

/**
 * 射击间隔对比页
 * 只负责装配：工具栏（时间窗口 / 新增 / 导入 / 清空）、单一对比区、线段卡片列表；
 * 存储态线段由 useFireSegments 持久化，导入线段在渲染时按 weaponId 从武器库实时解析，
 * 因此武器被修改或删除会即时反映到对比结果。
 */
export default function FireIntervalCompare() {
  /** 全部存储态操作入口集中来自持久化 Hook，改动实时生效 */
  const {
    segments,
    windowMs,
    addSegment,
    importWeapons,
    updateSegment,
    removeSegment,
    clearSegments,
    setWindowMs,
  } = useFireSegments()

  /** 武器列表来自 store，与枪械管理页共用同一份数据，作为导入线段的实时数据源 */
  const weapons = useAppStore((state) => state.weapons)

  /** 导入武器弹窗开关 */
  const [importOpen, setImportOpen] = useState(false)

  /**
   * 存储态线段 → 展示态线段
   * 手动线段原样转出；导入线段按 weaponId 实时换算，所引用武器已删除则被过滤掉。
   */
  const resolvedSegments = useMemo(
    () => resolveSegments(segments, weapons),
    [segments, weapons],
  )

  /** 已导入的武器 id，供导入弹窗置灰已选项 */
  const importedWeaponIds = useMemo(
    () => segments.flatMap((segment) => (segment.source === 'weapon' ? [segment.weaponId] : [])),
    [segments],
  )

  /** 确认导入：按 id 生成只读线段并收起弹窗 */
  function handleImport(weaponIds: string[]): void {
    importWeapons(weaponIds)
    setImportOpen(false)
  }

  return (
    // 内容可能超出视口，卡片自身纵向滚动，避免撑破布局
    <Card title="射击间隔对比" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <FireIntervalToolbar
        windowMs={windowMs}
        onWindowMsChange={setWindowMs}
        onAdd={addSegment}
        onImport={() => setImportOpen(true)}
        onClear={clearSegments}
        segmentCount={resolvedSegments.length}
      />

      {/* 对比区：所有线段纵向叠放并共享同一时间轴 */}
      <FireCompareChart segments={resolvedSegments} windowMs={windowMs} />

      {/* 卡片列表：顺序与对比区一一对应，取色下标相同因此颜色一致 */}
      <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 16 }}>
        {resolvedSegments.map((segment, index) =>
          // 导入线段只读（仅可删除），手动线段可编辑
          segment.source === 'weapon' ? (
            <WeaponSegmentCard
              key={segment.id}
              segment={segment}
              color={getSegmentColor(index)}
              onRemove={() => removeSegment(segment.id)}
            />
          ) : (
            <SegmentCard
              key={segment.id}
              segment={segment}
              color={getSegmentColor(index)}
              onChange={(patch) => updateSegment(segment.id, patch)}
              onRemove={() => removeSegment(segment.id)}
            />
          ),
        )}
      </Space>

      {/* 导入武器：勾选武器库中的武器，导入后作为只读线段参与对比 */}
      <ImportWeaponModal
        open={importOpen}
        weapons={weapons}
        importedWeaponIds={importedWeaponIds}
        onImport={handleImport}
        onCancel={() => setImportOpen(false)}
      />
    </Card>
  )
}
