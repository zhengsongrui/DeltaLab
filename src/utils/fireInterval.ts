/**
 * 射击间隔的纯计算模块
 * 全部函数只做数值推导、不接触 React 与 DOM，便于单独核对计算口径。
 *
 * 入参统一为 FireTimingParams（burstSize / fireRate / burstInterval / officialRpm），
 * 因此手动线段与导入武器共用同一套口径：burstSize <= 0 视为全自动 / 单发，>= 1 视为连发。
 *
 * 连发时序的公式统一实现在 utils/burstTiming（只处理「发数、官方射速、轮内间隔」三个数字），
 * 本模块只负责把 FireTimingParams 拆成这三个数字后转调。
 */

import type { FireTimingParams } from '@/types/fireInterval'
import {
  BURST_ROUNDS,
  getBurstCycleMs,
  getBurstGapMs as computeBurstGapMs,
  getBurstRoundRpm as computeBurstRoundRpm,
  getShotIntervalMsByRpm,
  round2,
} from '@/utils/burstTiming'

/** 单条线段在给定时间窗口内允许生成的最大射击点数，防止极端参数下产生海量 DOM 节点 */
export const MAX_SHOTS = 300

// 保留两位小数与累计轮数属于共用口径，直接转出，保持既有引用路径可用
export { BURST_ROUNDS, round2 }

/** 判断是否为连发：发数不小于 1 即为连发，否则按全自动 / 单发处理 */
function isBurst(segment: FireTimingParams): boolean {
  return segment.burstSize >= 1
}

/** 单发射击间隔（毫秒）：无连发时由 RPM 推导，连发时直接取轮内间隔 */
export function getShotIntervalMs(segment: FireTimingParams): number {
  if (!isBurst(segment)) return getShotIntervalMsByRpm(segment.fireRate)
  return segment.burstInterval
}

/** 一轮连发的射速（RPM）：即 60000 除以射击间隔；无连发时等价于填写的射速 */
export function getBurstRpm(segment: FireTimingParams): number {
  const interval = getShotIntervalMs(segment)
  return interval > 0 ? 60000 / interval : 0
}

/**
 * 连发周期（毫秒）：由官方标称射速反推，即 一轮发数 × 60000 ÷ 官方射速
 * 官方口径为「官方射速 = 发数 × 60000 ÷ 周期」，所以周期必须由官方射速推导，
 * 而不能由轮次间隔相加得到（轮次间隔是派生物）。无连发时无周期概念，返回 0。
 */
export function getCycleMs(segment: FireTimingParams): number {
  return getBurstCycleMs(segment.burstSize, segment.officialRpm)
}

/**
 * 连发轮次间隔（毫秒）：由周期派生，指上一轮最后一发到下一轮第一发之间的空隙
 * 计算方式 = 周期 - (发数 - 1) × 轮内间隔
 * 结果为负说明轮内间隔之和已超过周期（参数冲突），由界面提示；无连发返回 0。
 */
export function getBurstGapMs(segment: FireTimingParams): number {
  return computeBurstGapMs(segment.burstSize, segment.officialRpm, segment.burstInterval)
}

/**
 * 稳态平均射速（RPM）：无连发即为填写的射速；连发为「一轮发数 × 60000 ÷ 周期」
 * 在官方优先口径下连发周期由官方射速反推，因此该值恒等于官方射速本身，
 * 它同时是 getBurstRoundRpm 在轮数趋于无穷时的极限，可作为口径自洽校验。
 */
export function getAverageRpm(segment: FireTimingParams): number {
  if (!isBurst(segment)) return segment.fireRate
  const cycle = getCycleMs(segment)
  if (cycle <= 0) return 0
  return (segment.burstSize * 60000) / cycle
}

/**
 * 连发枪械累计 N 轮的等效射速（RPM）
 *
 * 口径与游戏内一致：等效射速 = 60000 ÷ 相邻两发的平均间隔，
 * 即用「(总发数 - 1) × 60000 ÷ 耗时」计算，耗时取第 1 轮首发到第 N 轮末发。
 * 周期由官方射速反推，所以轮数越大越逼近官方射速。
 *
 * 校验点：rounds = 1 时结果恒等于 getBurstRpm；无连发无轮次概念，返回 0。
 */
export function getBurstRoundRpm(segment: FireTimingParams, rounds: number): number {
  return computeBurstRoundRpm(segment.burstSize, segment.officialRpm, segment.burstInterval, rounds)
}

/** 线段统计值，供卡片与对比区直接展示 */
export interface SegmentStats {
  /** 射击间隔（毫秒） */
  shotIntervalMs: number
  /** 一轮连发射速（RPM） */
  burstRpm: number
  /** 稳态平均射速（RPM），连发时恒等于官方射速 */
  averageRpm: number
  /** 连发周期（毫秒），由官方射速反推；无连发为 0 */
  cycleMs: number
  /** 连发轮次间隔（毫秒），由周期派生；无连发为 0 */
  burstGapMs: number
  /** 累计 2 / 3 / 4 轮的等效射速（RPM），下标与 BURST_ROUNDS 对应；无连发为 0 */
  burstRpmByRounds: number[]
}

/** 汇总一条线段的全部展示数值，统一保留两位小数 */
export function getSegmentStats(segment: FireTimingParams): SegmentStats {
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
 * - 无连发：0、t、2t … 直到超过窗口。
 * - 连发：第 k 轮起点为 k × cycle，轮内为 起点 + i × 间隔（i 从 0 到 n - 1）。
 * - 间隔或窗口非法（0、负数、NaN）时返回空结果，避免除零与死循环。
 * - 点数超过 MAX_SHOTS 时截断并置 truncated。
 */
export function buildShotTimes(segment: FireTimingParams, windowMs: number): ShotTimesResult {
  const interval = getShotIntervalMs(segment)
  if (!(interval > 0) || !(windowMs > 0)) {
    return { timesMs: [], truncated: false }
  }

  // 无连发：时刻按序号乘间隔算出，避免逐次累加的浮点误差
  if (!isBurst(segment)) {
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

  const size = Math.round(segment.burstSize)
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
