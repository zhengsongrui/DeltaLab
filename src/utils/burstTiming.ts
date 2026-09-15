/**
 * 连发时序的纯数值计算模块
 *
 * 只处理「发数、官方射速、轮内间隔」这几个数字之间的换算，不感知任何业务结构，
 * 因此武器表单与射击间隔对比页可以共用同一套口径，避免公式在两处各自漂移；
 * 函数均为纯函数，不接触 React 与 DOM，便于单独核对。
 *
 * 官方口径：官方射速 = 一轮发数 × 60000 ÷ 连发周期，
 * 所以连发周期必须由官方射速反推，轮次间隔才是派生物。
 */

/** 保留一位小数，用于最短射击间隔等展示口径 */
export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

/** 保留两位小数，用于时序派生值的展示口径 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** 连发枪械需要额外展示的累计轮数 */
export const BURST_ROUNDS = [2, 3, 4] as const

/**
 * 由射速换算单发射击间隔（毫秒）：60000 ÷ 射速
 * 全自动与单发共用此口径；射速非法（0、负数、NaN）时返回 0，避免除零
 */
export function getShotIntervalMsByRpm(fireRate: number): number {
  return fireRate > 0 ? 60000 / fireRate : 0
}

/**
 * 连发周期（毫秒）：一轮发数 × 60000 ÷ 官方射速
 * 发数或官方射速非法时返回 0，避免除零
 */
export function getBurstCycleMs(burstSize: number, officialRpm: number): number {
  if (!(burstSize > 0) || !(officialRpm > 0)) return 0
  return (burstSize * 60000) / officialRpm
}

/**
 * 轮次间隔（毫秒）：指上一轮最后一发到下一轮第一发之间的空隙
 * 计算方式 = 周期 - (发数 - 1) × 轮内间隔
 * 结果为负说明轮内间隔之和已超过周期（参数冲突），由调用方决定如何提示；非连发返回 0
 */
export function getBurstGapMs(
  burstSize: number,
  officialRpm: number,
  burstIntervalMs: number,
): number {
  if (burstSize <= 0) return 0
  return getBurstCycleMs(burstSize, officialRpm) - (burstSize - 1) * burstIntervalMs
}

/**
 * 累计 N 轮的等效射速（RPM）
 *
 * 口径与游戏内一致：等效射速 = 60000 ÷ 相邻两发的平均间隔，
 * 即用「(总发数 - 1) × 60000 ÷ 耗时」计算，耗时取第 1 轮首发到第 N 轮末发：
 * 耗时 = (N - 1) × 周期 + (发数 - 1) × 轮内间隔。
 * 周期由官方射速反推，所以轮数越大越逼近官方射速。
 *
 * 校验点：rounds = 1 时结果恒等于「一轮连发射速」= 60000 ÷ 轮内间隔。
 *
 * @param rounds 累计轮数，从 1 开始
 */
export function getBurstRoundRpm(
  burstSize: number,
  officialRpm: number,
  burstIntervalMs: number,
  rounds: number,
): number {
  if (!(burstSize > 0) || !(rounds >= 1)) return 0

  const cycle = getBurstCycleMs(burstSize, officialRpm)
  if (!(burstIntervalMs > 0) || !(cycle > 0)) return 0

  // 首轮首发时刻为 0，第 N 轮末发时刻 = (N - 1) × 周期 + (发数 - 1) × 轮内间隔
  const duration = (rounds - 1) * cycle + (burstSize - 1) * burstIntervalMs
  if (!(duration > 0)) return 0

  // 发射次数按「总发数 - 1」计，等价于 60000 除以平均相邻间隔
  return ((rounds * burstSize - 1) * 60000) / duration
}
