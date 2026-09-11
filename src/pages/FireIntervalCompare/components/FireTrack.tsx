import type { CSSProperties } from 'react'
import { round2 } from '@/utils/fireInterval'

/** 子弹图标：竖线的可视化替代，底端贴在横线上 */
const BULLET_ICON = '🔸'
/** 横线距行顶部的距离（像素），也是子弹底端所在高度 */
const LINE_TOP = 22
/** 行高（像素）：横线上方留给子弹图标，下方留白 */
const ROW_HEIGHT = 34

/** 横线样式：贯穿整个时间窗口 */
const LINE_STYLE: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: LINE_TOP,
  height: 1,
}

/** 子弹样式：水平中心对齐射击时刻，底端贴在横线上；水平位置在渲染处按比例补上 */
const BULLET_STYLE: CSSProperties = {
  position: 'absolute',
  top: LINE_TOP,
  transform: 'translate(-50%, -100%)',
  fontSize: 12,
  lineHeight: 1,
  userSelect: 'none',
}

interface FireTrackProps {
  /** 该线段的颜色 */
  color: string
  /** 窗口内的全部射击时刻（毫秒） */
  timesMs: number[]
  /** 时间窗口（毫秒），用于把时刻换算成百分比位置 */
  windowMs: number
  /** 是否因超出点数上限被截断 */
  truncated: boolean
}

/**
 * 单条时间轴轨道（纯展示、可复用）
 * 横线表示时间段，子弹图标表示一次射击，位置按「时刻 ÷ 时间窗口」的真实比例定位；
 * 因此调整时间窗口时同一组时刻的像素间距会等比变化，多条轨道得以共享同一时间基准用于对齐比较。
 * 极密参数下子弹图标会互相重叠，属预期表现，用于直观反映高射速。
 */
export default function FireTrack({ color, timesMs, windowMs, truncated }: FireTrackProps) {
  return (
    <div style={{ position: 'relative', height: ROW_HEIGHT }}>
      {/* 横线：即 |---| 记法里的「-」，表示时间段 */}
      <div style={{ ...LINE_STYLE, background: color }} />

      {/* 子弹：即「|」，水平中心对齐射击时刻，底端贴在横线上 */}
      {timesMs.map((time, index) => (
        <span
          key={time}
          // 原生 title 悬停读数，避免为单纯的数值提示引入自研 tooltip
          title={`第 ${index + 1} 发 · ${round2(time)} ms`}
          style={{ ...BULLET_STYLE, left: `${(time / windowMs) * 100}%`, color }}
        >
          {BULLET_ICON}
        </span>
      ))}

      {/* 截断提示：只在极端参数触发上限时出现，避免界面无声地少画子弹 */}
      {truncated && (
        <span style={{ position: 'absolute', right: 0, top: 0, fontSize: 10, opacity: 0.65 }}>
          已截断，仅显示前 {timesMs.length} 发
        </span>
      )}
    </div>
  )
}
