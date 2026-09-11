import { Button, InputNumber, Popconfirm, Space, Typography } from 'antd'
import type { FireSegmentMode } from '@/types/fireInterval'
import { FIRE_SEGMENT_MODE_LABELS, FIRE_SEGMENT_MODES } from '@/types/fireInterval'
import { MAX_WINDOW_MS, MIN_WINDOW_MS } from '../hooks/useFireSegments'

interface FireIntervalToolbarProps {
  /** 当前时间窗口（毫秒） */
  windowMs: number
  onWindowMsChange: (value: number) => void
  /** 新增一条指定类型的线段 */
  onAdd: (mode: FireSegmentMode) => void
  /** 清空全部线段 */
  onClear: () => void
  /** 当前线段数量，为 0 时禁用清空 */
  segmentCount: number
}

/**
 * 射击间隔对比页工具栏：时间窗口、按类型新增线段、清空，全部为受控组件。
 * 时间窗口决定所有轨道的横向比例，因此调整后各线段会同步缩放，便于比较不同射速的疏密差异。
 */
export default function FireIntervalToolbar({
  windowMs,
  onWindowMsChange,
  onAdd,
  onClear,
  segmentCount,
}: FireIntervalToolbarProps) {
  return (
    <Space style={{ marginBottom: 16 }} wrap>
      <Typography.Text>时间窗口</Typography.Text>
      <InputNumber
        value={windowMs}
        min={MIN_WINDOW_MS}
        max={MAX_WINDOW_MS}
        step={100}
        addonAfter="ms"
        style={{ width: 140 }}
        onChange={(value) => onWindowMsChange(value ?? MIN_WINDOW_MS)}
      />
      {/* 三种类型各一个新增按钮，直接指定类型，省去二次选择 */}
      {FIRE_SEGMENT_MODES.map((mode) => (
        <Button key={mode} onClick={() => onAdd(mode)}>
          + {FIRE_SEGMENT_MODE_LABELS[mode]}
        </Button>
      ))}
      <Popconfirm title="清空全部线段？" okText="清空" cancelText="取消" onConfirm={onClear}>
        <Button danger disabled={segmentCount === 0}>
          清空
        </Button>
      </Popconfirm>
    </Space>
  )
}
