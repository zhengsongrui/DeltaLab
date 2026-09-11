import { Card, Space } from 'antd'
import FireCompareChart from './components/FireCompareChart'
import FireIntervalToolbar from './components/FireIntervalToolbar'
import SegmentCard from './components/SegmentCard'
import { getSegmentColor } from './colors'
import { useFireSegments } from './hooks/useFireSegments'

/**
 * 射击间隔对比页
 * 只负责装配：工具栏（时间窗口 / 新增 / 清空）、单一对比区、线段编辑卡片列表；
 * 计算口径在 utils/fireInterval，状态与持久化在 useFireSegments，取色在 colors。
 */
export default function FireIntervalCompare() {
  /** 全部状态与操作入口集中来自持久化 Hook，改动实时生效 */
  const { segments, windowMs, addSegment, updateSegment, removeSegment, clearSegments, setWindowMs } =
    useFireSegments()

  return (
    // 内容可能超出视口，卡片自身纵向滚动，避免撑破布局
    <Card title="射击间隔对比" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <FireIntervalToolbar
        windowMs={windowMs}
        onWindowMsChange={setWindowMs}
        onAdd={addSegment}
        onClear={clearSegments}
        segmentCount={segments.length}
      />

      {/* 对比区：所有线段纵向叠放并共享同一时间轴 */}
      <FireCompareChart segments={segments} windowMs={windowMs} />

      {/* 卡片列表：顺序与对比区一一对应，取色下标相同因此颜色一致 */}
      <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 16 }}>
        {segments.map((segment, index) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            color={getSegmentColor(index)}
            onChange={(next) => updateSegment(segment.id, next)}
            onRemove={() => removeSegment(segment.id)}
          />
        ))}
      </Space>
    </Card>
  )
}
