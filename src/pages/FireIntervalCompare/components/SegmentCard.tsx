import type { CSSProperties } from 'react'
import { Button, Card, Input, InputNumber, Segmented, Space, Typography } from 'antd'
import type { FireSegment, FireSegmentMode } from '@/types/fireInterval'
import { FIRE_SEGMENT_MODE_LABELS, FIRE_SEGMENT_MODES } from '@/types/fireInterval'
import { BURST_ROUNDS, getSegmentStats } from '@/utils/fireInterval'

/** 类型切换项：文案与取值都来自领域模型，避免文案散落 */
const MODE_OPTIONS = FIRE_SEGMENT_MODES.map((mode) => ({
  label: FIRE_SEGMENT_MODE_LABELS[mode],
  value: mode,
}))

/** 卡片底部统计文案的统一排版：小字号，配合 type="secondary" 使用 */
const HINT_STYLE: CSSProperties = { fontSize: 12 }

/** 输入框统一收敛为正整数：清空或非法输入时保留原值，避免出现 0 或 NaN */
function toPositiveInt(value: number | null, fallback: number): number {
  if (value === null || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.round(value))
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
  /** 回传已收敛的正整数 */
  onChange: (value: number) => void
}

/** 带标签与单位的整数输入：卡片的三个输入框共用同一套收敛与排版规则 */
function NumberField({ label, value, suffix, step, max, onChange }: NumberFieldProps) {
  return (
    <>
      <Typography.Text>{label}</Typography.Text>
      <InputNumber
        value={value}
        min={1}
        max={max}
        step={step}
        addonAfter={suffix}
        onChange={(next) => onChange(toPositiveInt(next, value))}
      />
    </>
  )
}

interface SegmentCardProps {
  /** 当前线段 */
  segment: FireSegment
  /** 与对比区一致的取色 */
  color: string
  /** 任意字段变化时回传整条线段 */
  onChange: (next: FireSegment) => void
  /** 删除该线段 */
  onRemove: () => void
}

/**
 * 线段编辑卡片
 * 左侧色条与对比区同色，用于把卡片与轨道对应起来；
 * 全自动只填射速；连发类型填连发内间隔与官方射速，周期与轮次间隔由官方射速派生，
 * 统计值实时展示在卡片底部。
 */
export default function SegmentCard({ segment, color, onChange, onRemove }: SegmentCardProps) {
  const isAuto = segment.mode === 'auto'
  const stats = getSegmentStats(segment)

  /** 补丁式更新：调用处只需指明变化的字段 */
  function patch(part: Partial<FireSegment>): void {
    onChange({ ...segment, ...part })
  }

  /**
   * 统计文案：全部由 utils/fireInterval 推导，实时反映输入变化。
   * 全自动只有「射速 → 射击间隔」的换算，故只展示射击间隔；
   * 连发以官方射速反推周期，平均射速恒等于官方射速、无需重复展示，改为展示轮次间隔与连发周期。
   */
  const summary = isAuto
    ? `射击间隔 ${stats.shotIntervalMs} ms`
    : `射击间隔 ${stats.shotIntervalMs} ms ・ 轮次间隔 ${stats.burstGapMs} ms ・ 一轮连发射速 ${stats.burstRpm} RPM ・ 连发周期 ${stats.cycleMs} ms`

  /** 连发各轮等效射速：轮数越多越贴近官方射速，口径见 utils/fireInterval */
  const roundRpm = BURST_ROUNDS.map(
    (rounds, index) => `${rounds} 轮等效射速 ${stats.burstRpmByRounds[index]} RPM`,
  ).join(' ・ ')

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
          <Segmented<FireSegmentMode>
            options={MODE_OPTIONS}
            value={segment.mode}
            onChange={(mode) => patch({ mode })}
          />
          <Button danger type="text" onClick={onRemove}>
            删除
          </Button>
        </Space>

        <Space wrap>
          {isAuto ? (
            // 全自动：射速直接决定射击间隔，无需其它参数
            <NumberField
              label="射速"
              value={segment.fireRate}
              suffix="RPM"
              step={10}
              max={2000}
              onChange={(fireRate) => patch({ fireRate })}
            />
          ) : (
            // 连发：轮内间隔决定一轮连发射速，周期由官方射速反推（周期 = 发数 × 60000 ÷ 官方射速）
            <>
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
          )}
        </Space>

        <Typography.Text type="secondary" style={HINT_STYLE}>
          {summary}
        </Typography.Text>

        {/* 参数冲突提示：轮内间隔之和超过周期时轮次间隔为负，轨道会重叠，需要用户修正输入 */}
        {!isAuto && stats.burstGapMs < 0 && (
          <Typography.Text type="warning" style={HINT_STYLE}>
            轮内间隔之和已超过周期，轮次间隔为负，请调小连发内间隔或调大官方射速
          </Typography.Text>
        )}

        {!isAuto && (
          <Typography.Text type="secondary" style={HINT_STYLE}>
            {roundRpm}
          </Typography.Text>
        )}
      </Space>
    </Card>
  )
}
