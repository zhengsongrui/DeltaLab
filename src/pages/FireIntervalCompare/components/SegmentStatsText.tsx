import type { CSSProperties } from 'react'
import { Typography } from 'antd'
import type { FireTimingParams } from '@/types/fireInterval'
import { BURST_ROUNDS, getSegmentStats } from '@/utils/fireInterval'

/** 统计文案的统一排版：小字号，配合 type="secondary" 使用 */
const HINT_STYLE: CSSProperties = { fontSize: 12 }

/**
 * 线段统计文案（可复用）
 * 全部由 utils/fireInterval 推导，手动卡片与只读武器卡片共用同一套展示口径，
 * 避免统计口径与排版在两处各自维护。
 */
export default function SegmentStatsText({ timing }: { timing: FireTimingParams }) {
  const stats = getSegmentStats(timing)
  const isBurst = timing.burstSize >= 1

  /**
   * 无连发只有「射速 → 射击间隔」的换算，故只展示射击间隔；
   * 连发以官方射速反推周期，平均射速恒等于官方射速、无需重复展示，改为展示轮次间隔与连发周期。
   */
  const summary = isBurst
    ? `射击间隔 ${stats.shotIntervalMs} ms ・ 轮次间隔 ${stats.burstGapMs} ms ・ 连发周期 ${stats.cycleMs} ms ・ 一轮连发射速 ${stats.burstRpm} RPM ・`
    : `射击间隔 ${stats.shotIntervalMs} ms`

  /** 连发各轮等效射速：轮数越多越贴近官方射速，口径见 utils/fireInterval */
  const roundRpm = BURST_ROUNDS.map(
    (rounds, index) => `${rounds} 轮等效射速 ${stats.burstRpmByRounds[index]} RPM`,
  ).join(' ・ ')

  return (
    <>
      <Typography.Text type="secondary" style={HINT_STYLE}>
        {summary}
      </Typography.Text>

      {/* 参数冲突提示：轮内间隔之和超过周期时轮次间隔为负，轨道会重叠，需要修正输入 */}
      {isBurst && stats.burstGapMs < 0 && (
        <Typography.Text type="warning" style={HINT_STYLE}>
          轮内间隔之和已超过周期，轮次间隔为负，请调小连发内间隔或调大官方射速
        </Typography.Text>
      )}

      {isBurst && (
        <Typography.Text type="secondary" style={HINT_STYLE}>
          {roundRpm}
        </Typography.Text>
      )}
    </>
  )
}
