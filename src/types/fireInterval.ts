/**
 * 射击间隔对比的领域模型
 * 只描述一条线段所需的原始输入参数，派生数值（射击间隔、连发射速、周期、轮次间隔、
 * 各轮等效射速）一律由 utils/fireInterval 计算得出，保证「输入」与「推导」职责分离。
 */

/** 线段类型：全自动 / 三连发 / 四连发 */
export type FireSegmentMode = 'auto' | 'burst3' | 'burst4'

/** 一条对比线段，代表一把枪在时间轴上的射击节奏 */
export interface FireSegment {
  /** 唯一标识，用于列表 key 与增删改定位 */
  id: string
  /** 展示名称，例如「M4A1」 */
  name: string
  /** 线段类型 */
  mode: FireSegmentMode
  /** 全自动：每分钟射速（RPM） */
  fireRate: number
  /** 连发：连发内部相邻两发之间的间隔（毫秒） */
  burstInterval: number
  /**
   * 连发：游戏内官方标称射速（RPM）
   * 官方口径为「一轮发数 × 60000 ÷ 连发周期」，因此周期由该值反推：
   * 周期 = 发数 × 60000 ÷ 官方射速；轮次间隔随之派生，不再单独填写。
   */
  officialRpm: number
}

/** 三种线段类型的展示文案，供类型切换与新增按钮共用，避免文案散落多处 */
export const FIRE_SEGMENT_MODE_LABELS: Record<FireSegmentMode, string> = {
  auto: '全自动',
  burst3: '三连发',
  burst4: '四连发',
}

/** 全部线段类型，按固定顺序排列，供 Segmented 与新增按钮遍历 */
export const FIRE_SEGMENT_MODES: FireSegmentMode[] = ['auto', 'burst3', 'burst4']
