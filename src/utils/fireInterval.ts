/**
 * 射击间隔的纯计算模块
 * 全部函数只做数值推导、不接触 React 与 DOM，便于单独核对计算口径。
 */

import type { FireSegment, FireSegmentMode } from '@/types/fireInterval'

/** 单条线段在给定时间窗口内允许生成的最大射击点数，防止极端参数下产生海量 DOM 节点 */
export const MAX_SHOTS = 300

/** 保留两位小数，统一展示口径 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** 取一轮连发的发数：全自动没有「一轮连发」的概念，返回 0 */
export function getBurstSize(mode: FireSegmentMode): number {
  if (mode === 'burst3') return 3
  if (mode === 'burst4') return 4
  return 0
}

/** 单发射击间隔（毫秒）：全自动由 RPM 推导，连发直接取连发内间隔 */
export function getShotIntervalMs(segment: FireSegment): number {
  if (segment.mode === 'auto') {
    return segment.fireRate > 0 ? 60000 / segment.fireRate : 0
  }
  return segment.burstInterval
}

/** 一轮连发的射速（RPM）：即 60000 除以射击间隔；全自动时等价于填写的射速 */
export function getBurstRpm(segment: FireSegment): number {
  const interval = getShotIntervalMs(segment)
  return interval > 0 ? 60000 / interval : 0
}

/**
 * 连发周期（毫秒）：由官方标称射速反推，即 一轮发数 × 60000 ÷ 官方射速
 * 官方口径为「官方射速 = 发数 × 60000 ÷ 周期」，所以周期必须由官方射速推导，
 * 而不能由轮次间隔相加得到（轮次间隔是派生物）。全自动无周期概念，返回 0。
 */
export function getCycleMs(segment: FireSegment): number {
  const size = getBurstSize(segment.mode)
  if (size === 0 || !(segment.officialRpm > 0)) return 0
  return (size * 60000) / segment.officialRpm
}

/**
 * 连发轮次间隔（毫秒）：由周期派生，指上一轮最后一发到下一轮第一发之间的空隙
 * 计算方式 = 周期 - (发数 - 1) × 轮内间隔
 * 结果为负说明轮内间隔之和已超过周期（参数冲突），由界面提示；全自动返回 0。
 */
export function getBurstGapMs(segment: FireSegment): number {
  const size = getBurstSize(segment.mode)
  if (size === 0) return 0
  return getCycleMs(segment) - (size - 1) * segment.burstInterval
}

/**
 * 稳态平均射速（RPM）：全自动即为填写的射速；连发为「一轮发数 × 60000 ÷ 周期」
 * 在官方优先口径下连发周期由官方射速反推，因此该值恒等于官方射速本身，
 * 它同时是 getBurstRoundRpm 在轮数趋于无穷时的极限，可作为口径自洽校验。
 */
export function getAverageRpm(segment: FireSegment): number {
  if (segment.mode === 'auto') return segment.fireRate
  const cycle = getCycleMs(segment)
  if (cycle <= 0) return 0
  return (getBurstSize(segment.mode) * 60000) / cycle
}

/** 连发枪械需要额外展示的累计轮数 */
export const BURST_ROUNDS = [2, 3, 4] as const

/**
 * 连发枪械累计 N 轮的等效射速（RPM）
 *
 * 口径与游戏内一致：等效射速 = 60000 ÷ 相邻两发的平均间隔，
 * 即用「(总发数 - 1) × 60000 ÷ 耗时」计算，耗时取第 1 轮首发到第 N 轮末发。
 * 周期由官方射速反推，所以轮数越大越逼近官方射速。
 *
 * 以 MK4 三连发为例（官方射速 793、轮内间隔 52 ms，周期 226.99 ms）：
 * 2 轮 ≈ 906.38、3 轮 ≈ 860.26、4 轮 ≈ 840.81 RPM。
 *
 * 校验点：rounds = 1 时结果恒等于 getBurstRpm；全自动无轮次概念，返回 0。
 */
export function getBurstRoundRpm(segment: FireSegment, rounds: number): number {
  const size = getBurstSize(segment.mode)
  if (size === 0 || !(rounds >= 1)) return 0

  const interval = getShotIntervalMs(segment)
  const cycle = getCycleMs(segment)
  if (!(interval > 0) || !(cycle > 0)) return 0

  // 首轮首发时刻为 0，第 N 轮末发时刻 = (N - 1) × 周期 + (n - 1) × 轮内间隔
  const duration = (rounds - 1) * cycle + (size - 1) * interval
  if (!(duration > 0)) return 0

  // 发射次数按「发数 - 1」计，等价于 60000 除以平均相邻间隔
  return ((rounds * size - 1) * 60000) / duration
}

/** 线段统计值，供卡片与对比区直接展示 */
export interface SegmentStats {
  /** 射击间隔（毫秒） */
  shotIntervalMs: number
  /** 一轮连发射速（RPM） */
  burstRpm: number
  /** 稳态平均射速（RPM），连发时恒等于官方射速 */
  averageRpm: number
  /** 连发周期（毫秒），由官方射速反推；全自动为 0 */
  cycleMs: number
  /** 连发轮次间隔（毫秒），由周期派生；全自动为 0 */
  burstGapMs: number
  /** 累计 2 / 3 / 4 轮的等效射速（RPM），下标与 BURST_ROUNDS 对应；全自动为 0 */
  burstRpmByRounds: number[]
}

/** 汇总一条线段的全部展示数值，统一保留两位小数 */
export function getSegmentStats(segment: FireSegment): SegmentStats {
  return {
    shotIntervalMs: round2(getShotIntervalMs(segment)),
    burstRpm: round2(getBurstRpm(segment)),
    averageRpm: round2(getAverageRpm(segment)),
    cycleMs: round2(getCycleMs(segment)),
    burstGapMs: round2(getBurstGapMs(segment)),
    burstRpmByRounds: BURST_ROUNDS.map((rounds) => round2(getBurstRoundRpm(segment, rounds))),
  }
}

/** 射击时刻生成结果 */
export interface ShotTimesResult {
  /** 时间窗口内每一发的射击时刻（毫秒），升序 */
  timesMs: number[]
  /** 是否因超出 MAX_SHOTS 上限而被截断，供界面提示使用 */
  truncated: boolean
}

/**
 * 生成 `0 ~ windowMs` 区间内的全部射击时刻
 * - 全自动：0、t、2t … 直到超过窗口。
 * - 连发：第 k 轮起点为 k × cycle，轮内为 起点 + i × 间隔（i 从 0 到 n - 1）。
 * - 间隔或窗口非法（0、负数、NaN）时返回空结果，避免除零与死循环。
 * - 点数超过 MAX_SHOTS 时截断并置 truncated。
 */
export function buildShotTimes(segment: FireSegment, windowMs: number): ShotTimesResult {
  const interval = getShotIntervalMs(segment)
  if (!(interval > 0) || !(windowMs > 0)) {
    return { timesMs: [], truncated: false }
  }

  const size = getBurstSize(segment.mode)

  // 全自动：时刻按序号乘间隔算出，避免逐次累加的浮点误差
  if (size === 0) {
    const total = Math.floor(windowMs / interval) + 1
    const count = Math.min(total, MAX_SHOTS)
    const timesMs: number[] = []
    for (let i = 0; i < count; i += 1) {
      timesMs.push(i * interval)
    }
    return { timesMs, truncated: total > MAX_SHOTS }
  }

  // 连发：逐轮铺开，轮内同样按序号乘间隔计算
  const cycle = getCycleMs(segment)
  if (!(cycle > 0)) {
    return { timesMs: [], truncated: false }
  }

  const timesMs: number[] = []
  for (let round = 0; round * cycle <= windowMs; round += 1) {
    const start = round * cycle
    for (let i = 0; i < size; i += 1) {
      const time = start + i * interval
      if (time > windowMs) break
      if (timesMs.length >= MAX_SHOTS) {
        return { timesMs, truncated: true }
      }
      timesMs.push(time)
    }
  }
  return { timesMs, truncated: false }
}
