import { Button, InputNumber, Popconfirm, Space, Typography } from 'antd'
import { SEGMENT_ADD_PRESETS } from '@/types/fireInterval'
import { MAX_WINDOW_MS, MIN_WINDOW_MS } from '../hooks/useFireSegments'

interface FireIntervalToolbarProps {
  /** 当前时间窗口（毫秒） */
  windowMs: number
  onWindowMsChange: (value: number) => void
  /** 新增一条手动线段，参数为连发发数（0 表示全自动） */
  onAdd: (burstSize: number) => void
  /** 打开导入武器弹窗 */
  onImport: () => void
  /** 清空全部线段 */
  onClear: () => void
  /** 当前可见线段数量，为 0 时禁用清空 */
  segmentCount: number
}

/**
 * 射击间隔对比页工具栏：时间窗口、新增手动线段、导入武器、清空，全部为受控组件。
 * 时间窗口决定所有轨道的横向比例，因此调整后各线段会同步缩放，便于比较不同射速的疏密差异。
 */
export default function FireIntervalToolbar({
  windowMs,
  onWindowMsChange,
  onAdd,
  onImport,
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
      {/* 手动新增：按预设直接指定类型，连发发数可在卡片内继续调整 */}
      {SEGMENT_ADD_PRESETS.map((preset) => (
        <Button key={preset.burstSize} onClick={() => onAdd(preset.burstSize)}>
          + {preset.label}
        </Button>
      ))}
      {/* 导入武器：从武器库勾选武器作为只读线段加入对比 */}
      <Button onClick={onImport}>导入武器</Button>
      <Popconfirm title="清空全部线段？" okText="清空" cancelText="取消" onConfirm={onClear}>
        <Button danger disabled={segmentCount === 0}>
          清空
        </Button>
      </Popconfirm>
    </Space>
  )
}
