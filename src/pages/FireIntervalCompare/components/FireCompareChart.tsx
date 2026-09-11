import { Fragment, type CSSProperties } from 'react'
import { Empty } from 'antd'
import type { FireSegment } from '@/types/fireInterval'
import { buildShotTimes } from '@/utils/fireInterval'
import { getSegmentColor } from '../colors'
import FireTrack from './FireTrack'

/** 左侧线段名列宽（像素）：与右侧轨道同处一个网格，保证各行纵向严格对齐 */
const NAME_COLUMN_WIDTH = 140
/** 刻度尺行高（像素） */
const AXIS_HEIGHT = 16
/** 时间刻度档位（百分比），五档足以读出位置 */
const TICK_PERCENTS = [0, 25, 50, 75, 100]

/** 名称列：色点与名称横向排列 */
const NAME_CELL_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
}
/** 色点：与轨道同色，宽高固定不影响列宽 */
const DOT_STYLE: CSSProperties = { flex: '0 0 auto', width: 8, height: 8, borderRadius: '50%' }
/** 名称文本：过长时省略号截断，保持列宽稳定 */
const NAME_STYLE: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
/** 刻度标签：绝对定位在百分比处，不换行 */
const TICK_STYLE: CSSProperties = { position: 'absolute', fontSize: 11, whiteSpace: 'nowrap' }

interface FireCompareChartProps {
  /** 需要对比的全部线段，顺序即纵向叠放顺序 */
  segments: FireSegment[]
  /** 时间窗口（毫秒），所有线段共用 */
  windowMs: number
}

/**
 * 刻度标签的水平对齐偏移
 * 首档左对齐、末档右对齐，避免标签超出轨道两端被裁切
 */
function tickOffset(percent: number): number {
  if (percent === 0) return 0
  if (percent === 100) return -100
  return -50
}

/**
 * 单一对比区
 * 所有线段纵向叠放并共享同一时间轴：左列是线段名与色点，右列是轨道；
 * 顶部一行是时间刻度尺，与轨道同处一列，因此刻度与子弹位置天然对齐。
 * 不做额外的轮次分隔标记，连发内间隔与轮次间隔的差异由间距自然体现。
 */
export default function FireCompareChart({ segments, windowMs }: FireCompareChartProps) {
  /** 空态：无线段时给出引导，避免只剩一条光秃秃的刻度尺 */
  if (segments.length === 0) {
    return <Empty description="请新增一条线段开始对比" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${NAME_COLUMN_WIDTH}px 1fr`,
        columnGap: 8,
      }}
    >
      {/* 刻度尺行：左列占位，右列绘制与轨道等宽的时间刻度 */}
      <div />
      <div style={{ position: 'relative', height: AXIS_HEIGHT }}>
        {TICK_PERCENTS.map((percent) => (
          <span
            key={percent}
            style={{ ...TICK_STYLE, left: `${percent}%`, transform: `translateX(${tickOffset(percent)}%)` }}
          >
            {Math.round((windowMs * percent) / 100)}
          </span>
        ))}
      </div>

      {/* 每个线段占一行：左列名称、右列轨道，两列同属一个网格因此横向基准一致 */}
      {segments.map((segment, index) => {
        const color = getSegmentColor(index)
        const { timesMs, truncated } = buildShotTimes(segment, windowMs)
        return (
          <Fragment key={segment.id}>
            <div style={NAME_CELL_STYLE}>
              <span style={{ ...DOT_STYLE, background: color }} />
              <span title={segment.name} style={NAME_STYLE}>
                {segment.name}
              </span>
            </div>
            <FireTrack color={color} timesMs={timesMs} windowMs={windowMs} truncated={truncated} />
          </Fragment>
        )
      })}
    </div>
  )
}
