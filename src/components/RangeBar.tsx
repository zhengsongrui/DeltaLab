import type { CSSProperties } from 'react'

import { useAppStore } from '@/store/useAppStore'
import type { WeaponRange } from '@/types/weapon'
import { getRangeRgb, toCssRgb } from '@/utils/rangeColor'

/** 方块宽度（像素）：固定值，使各行的 100 米轴等长、可跨行横向比对 */
export const RANGE_BAR_WIDTH = 240
/** 射程列的列宽：方块宽度加上左右单元格内边距（antd 默认各 16px） */
export const RANGE_COLUMN_WIDTH = RANGE_BAR_WIDTH + 32

/** 方块高度（像素） */
const BAR_HEIGHT = 20
/** 标注行高度（像素）：既是米数文字的行高，也是它悬在方块上 / 下方时的偏移距离 */
const LABEL_HEIGHT = 12
/** 字号（像素）：米数标注与方块内倍率共用 */
const FONT_SIZE = 12
/** 轴长（米）：整条方块固定表示 0-100 米 */
const AXIS_LENGTH = 100

interface RangeBarProps {
  /** 该武器的射程分段，按 start 升序，首段起点为 0 */
  ranges: WeaponRange[]
}

/**
 * 射程条：把射程分段画成一根固定代表 0-100 米的方块
 * 段宽按里程占比分配，段与段首尾相连（相接处不画分隔线，靠颜色变化区分切分位置）；
 * 末段没有下一段，终点取轴长 100 米，自然铺到条尾。
 * 段落底色代表该段倍率，方块内显示倍率数字；
 * 方块上方标注各相接处的米数，方块下方标注起止端点（0 与 100m），便于读出分段位置。
 * 两处米数均绝对定位悬在方块之外，不占布局高度，因此不会撑高表格行。
 * 上下两侧米数与方块内倍率的字色跟随主题：暗色主题白字，亮色主题黑字。
 */
export default function RangeBar({ ranges }: RangeBarProps) {
  const themeMode = useAppStore((state) => state.themeMode)
  /** 文字颜色：按主题取反色，保证米数标注在表格底色上、倍率数字在色块上均可读 */
  const textColor = themeMode === 'dark' ? '#ffffff' : '#000000'

  /** 相接处米数：除首段起点（恒为 0）外的各段起点，即方块被切分的位置 */
  const boundaries = ranges.slice(1).map((segment) => segment.start)

  /** 标注行公共样式：绝对定位，字色跟随主题；悬在方块上方还是下方由调用处补充 top / bottom */
  const labelStyle: CSSProperties = {
    position: 'absolute',
    fontSize: FONT_SIZE,
    lineHeight: `${LABEL_HEIGHT}px`,
    color: textColor,
    whiteSpace: 'nowrap',
  }

  return (
    // 容器只包住方块本身，高度即方块高度；米数标注用负偏移悬在容器外，不参与布局
    <div style={{ position: 'relative', width: RANGE_BAR_WIDTH }}>
      {/* 方块上方：各相接处的米数，以切分点为中心显示 */}
      {boundaries.map((start) => (
        <span
          key={start}
          style={{
            ...labelStyle,
            top: -LABEL_HEIGHT,
            left: `${(start / AXIS_LENGTH) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {start}
        </span>
      ))}

      {/* 方块：各段横向排布且宽度之和恒为整条，因此首尾自然相接 */}
      <div style={{ display: 'flex', height: BAR_HEIGHT }}>
        {ranges.map((segment, index) => {
          // 本段终点取下一段起点；末段无下一段，取轴长以铺满剩余里程
          const end = ranges[index + 1]?.start ?? AXIS_LENGTH
          const rgb = getRangeRgb(segment.multiplier)
          return (
            <div
              key={segment.start}
              style={{
                // 段宽 = 本段里程 ÷ 轴长
                width: `${((end - segment.start) / AXIS_LENGTH) * 100}%`,
                background: toCssRgb(rgb),
                color: textColor,
                fontSize: FONT_SIZE,
                lineHeight: `${BAR_HEIGHT}px`,
                textAlign: 'center',
                // 段过窄时裁掉溢出的数字，避免文字把方块撑宽
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {segment.multiplier}
            </div>
          )
        })}
      </div>

      {/* 方块下方：起止端点米数，贴左右边缘对齐，避免与相接处米数挤在同一行而重合 */}
      <span style={{ ...labelStyle, bottom: -LABEL_HEIGHT, left: 0 }}>0m</span>
      <span style={{ ...labelStyle, bottom: -LABEL_HEIGHT, right: 0 }}>{AXIS_LENGTH}</span>
    </div>
  )
}
