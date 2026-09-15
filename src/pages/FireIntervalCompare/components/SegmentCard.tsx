import { Button, Card, Input, InputNumber, Segmented, Space, Typography } from 'antd'
import type { ManualFireSegment, ManualSegmentKind, ManualSegmentPatch } from '@/types/fireInterval'
import { DEFAULT_BURST_SIZE, MANUAL_KIND_OPTIONS, MIN_BURST_SIZE } from '@/types/fireInterval'
import SegmentStatsText from './SegmentStatsText'

/** 输入框统一收敛为正整数：清空或非法输入时保留原值，避免出现 0 或 NaN */
function toPositiveInt(value: number | null, fallback: number, min = 1): number {
  if (value === null || !Number.isFinite(value)) return fallback
  return Math.max(min, Math.round(value))
}

interface NumberFieldProps {
  /** 字段名 */
  label: string
  /** 当前值，同时作为非法输入的回退值 */
  value: number
  /** 单位后缀，如 RPM、ms */
  suffix: string
  /** 步进 */
  step: number
  /** 允许的上限 */
  max: number
  /** 允许的下限 */
  min?: number
  /** 回传已收敛的正整数 */
  onChange: (value: number) => void
}

/** 带标签与单位的整数输入：卡片的几个输入框共用同一套收敛与排版规则 */
function NumberField({ label, value, suffix, step, max, min = 1, onChange }: NumberFieldProps) {
  return (
    <>
      <Typography.Text>{label}</Typography.Text>
      <InputNumber
        value={value}
        min={min}
        max={max}
        step={step}
        addonAfter={suffix}
        onChange={(next) => onChange(toPositiveInt(next, value, min))}
      />
    </>
  )
}

interface SegmentCardProps {
  /** 当前手动线段 */
  segment: ManualFireSegment
  /** 与对比区一致的取色 */
  color: string
  /** 字段变化时回传补丁，仅包含被改动的可编辑字段 */
  onChange: (patch: ManualSegmentPatch) => void
  /** 删除该线段 */
  onRemove: () => void
}

/**
 * 手动线段编辑卡片
 * 左侧色条与对比区同色，用于把卡片与轨道对应起来；
 * 类型在全自动与连发之间切换：全自动只填射速；连发填写发数、轮内间隔与官方射速，
 * 周期由官方射速派生。统计值实时展示在卡片底部。
 */
export default function SegmentCard({ segment, color, onChange, onRemove }: SegmentCardProps) {
  const isBurst = segment.burstSize >= MIN_BURST_SIZE

  /** 补丁式更新：调用处只需指明变化的字段，直接转交父级合并 */
  function patch(part: ManualSegmentPatch): void {
    onChange(part)
  }

  /**
   * 切换类型
   * 切到全自动把发数归 0；切到连发沿用已填发数，此前为全自动时补默认发数。
   */
  function handleKindChange(kind: ManualSegmentKind): void {
    patch({
      burstSize:
        kind === 'auto'
          ? 0
          : segment.burstSize >= MIN_BURST_SIZE
            ? segment.burstSize
            : DEFAULT_BURST_SIZE,
    })
  }

  return (
    <Card
      size="small"
      style={{ borderLeft: `4px solid ${color}` }}
      styles={{ body: { padding: 12 } }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space wrap>
          <Typography.Text>名称</Typography.Text>
          <Input
            value={segment.name}
            placeholder="线段名称"
            onChange={(event) => patch({ name: event.target.value })}
            style={{ width: 160 }}
          />
          <Segmented<ManualSegmentKind>
            options={[...MANUAL_KIND_OPTIONS]}
            value={isBurst ? 'burst' : 'auto'}
            onChange={handleKindChange}
          />
          <Button danger type="text" onClick={onRemove}>
            删除
          </Button>
        </Space>

        <Space wrap>
          {isBurst ? (
            // 连发：发数决定一轮连发长度，轮内间隔决定一轮连发射速，周期由官方射速反推
            <>
              <NumberField
                label="连发发数"
                value={segment.burstSize}
                suffix="发"
                step={1}
                min={MIN_BURST_SIZE}
                max={100}
                onChange={(burstSize) => patch({ burstSize })}
              />
              <NumberField
                label="连发内间隔"
                value={segment.burstInterval}
                suffix="ms"
                step={1}
                max={2000}
                onChange={(burstInterval) => patch({ burstInterval })}
              />
              <NumberField
                label="官方射速"
                value={segment.officialRpm}
                suffix="RPM"
                step={10}
                max={3000}
                onChange={(officialRpm) => patch({ officialRpm })}
              />
            </>
          ) : (
            // 全自动 / 单发：射速直接决定射击间隔，无需其它参数
            <NumberField
              label="射速"
              value={segment.fireRate}
              suffix="RPM"
              step={10}
              max={2000}
              onChange={(fireRate) => patch({ fireRate })}
            />
          )}
        </Space>

        <SegmentStatsText timing={segment} />
      </Space>
    </Card>
  )
}
