/**
 * 射击间隔对比页的固定调色板
 * 对比区与线段卡片按下标取同色，因此两侧颜色始终一一对应；属页面展示细节，不下沉到通用 utils。
 */

/** 固定色板：选深浅主题下均可辨识的颜色 */
const SEGMENT_COLORS = [
  '#1677ff',
  '#fa541c',
  '#13c2c2',
  '#52c41a',
  '#722ed1',
  '#eb2f96',
  '#faad14',
  '#2f54eb',
]

/** 按线段下标取色：超出色板长度时循环取用 */
export function getSegmentColor(index: number): string {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length]
}
