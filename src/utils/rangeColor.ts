/**
 * 射程倍率取色：把倍率换算成表示伤害强弱的颜色
 * 色标为单一连续色阶：1.0 绿 → 0.8 黄 → 0.6 红 → 0.4 黑，越低的倍率越暗。
 * 纯函数，不含任何 DOM 依赖，供射程条组件与其它展示层复用。
 */

/** RGB 三元组 */
export type Rgb = readonly [number, number, number]

/** 色标锚点颜色：倍率越高越绿，越低越黑 */
const GREEN: Rgb = [34, 197, 94]
const YELLOW: Rgb = [234, 179, 8]
const RED: Rgb = [239, 68, 68]
const BLACK: Rgb = [155, 0, 0]

/** 色阶步长：倍率先量化到 0.05 的整数倍，倍率的细微差异不产生新颜色 */
const COLOR_STEP = 0.05
/** 色标下界（黑）与上界（绿），越界倍率取端点颜色 */
const LOWEST = 0.4
const HIGHEST = 1

/** 按比例在两个颜色之间线性插值，ratio 为 0 取 from，为 1 取 to */
function mix(from: Rgb, to: Rgb, ratio: number): Rgb {
  return [
    Math.round(from[0] + (to[0] - from[0]) * ratio),
    Math.round(from[1] + (to[1] - from[1]) * ratio),
    Math.round(from[2] + (to[2] - from[2]) * ratio),
  ]
}

/**
 * 取倍率对应的颜色
 * 先按 0.05 量化并夹到 0.4~1.0，再按 1.0-0.8、0.8-0.6、0.6-0.4 三段分别插值。
 */
export function getRangeRgb(multiplier: number): Rgb {
  const quantized = Math.round(multiplier / COLOR_STEP) * COLOR_STEP
  const value = Math.min(HIGHEST, Math.max(LOWEST, quantized))

  if (value >= 0.8) return mix(YELLOW, GREEN, (value - 0.8) / 0.2) // 0.8 黄 → 1.0 绿
  if (value >= 0.6) return mix(RED, YELLOW, (value - 0.6) / 0.2) // 0.6 红 → 0.8 黄
  return mix(BLACK, RED, (value - LOWEST) / 0.2) // 0.4 黑 → 0.6 红
}

/** 颜色转 CSS 表达式 */
export function toCssRgb([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`
}
