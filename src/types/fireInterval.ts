/**
 * 射击间隔对比的领域模型
 * 只描述一条线段所需的原始输入参数，派生数值（射击间隔、连发射速、周期、轮次间隔、
 * 各轮等效射速）一律由 utils/fireInterval 计算得出，保证「输入」与「推导」职责分离。
 */

/**
 * 线段时序参数：全部计算所需的原始输入
 * burstSize 为 0 表示全自动 / 单发（无连发），>= 1 表示一轮连发的发数；
 * 用它取代原先的固定类型枚举，使手动线段与导入武器都能表达任意连发发数。
 */
export interface FireTimingParams {
  /** 连发发数：0 表示无连发（全自动 / 单发），>= 1 表示一轮连发的发数 */
  burstSize: number
  /** 射速（RPM）：无连发时由它换算射击间隔；连发时为官方标称射速 */
  fireRate: number
  /** 连发轮内相邻两发的间隔（毫秒）；无连发时忽略 */
  burstInterval: number
  /** 连发官方标称射速（RPM），周期反推依据；无连发时忽略 */
  officialRpm: number
}

/** 手动新增的线段：数值由用户输入并持久化 */
export interface ManualFireSegment extends FireTimingParams {
  /** 唯一标识，用于列表 key 与增删改定位 */
  id: string
  /** 数据来源 */
  source: 'manual'
  /** 展示名称，例如「全自动 1」 */
  name: string
}

/**
 * 由武器库导入的线段
 * 不保存任何数值快照，只记录武器记录（WeaponRecord）的 id；
 * 进入页面时按 id 从武器库实时换算，因此武器被修改或删除后会自动跟随。
 */
export interface WeaponFireSegment {
  /** 唯一标识，用于列表 key 与增删定位 */
  id: string
  /** 数据来源 */
  source: 'weapon'
  /** 指向武器库记录的 id */
  weaponId: string
}

/** 一条对比线段（存储态）：手动与导入两种形态的判别联合 */
export type FireSegment = ManualFireSegment | WeaponFireSegment

/** 手动线段的可编辑字段：id 与 source 由 Hook 维护，不参与补丁更新 */
export type ManualSegmentPatch = Partial<Omit<ManualFireSegment, 'id' | 'source'>>

/** 解析后线段的公共字段：时序参数 + 展示信息 */
interface ResolvedSegmentBase extends FireTimingParams {
  id: string
  /** 展示名称：手动取用户填写值，导入取武器名 */
  name: string
  /** 类型展示文案，如「全自动」「单发」「三连发」「5 连发」 */
  modeLabel: string
}

/** 解析后的手动线段（展示态） */
export interface ResolvedManualSegment extends ResolvedSegmentBase {
  source: 'manual'
}

/** 解析后的导入线段（展示态） */
export interface ResolvedWeaponSegment extends ResolvedSegmentBase {
  source: 'weapon'
}

/**
 * 解析后的线段（展示态）：字段齐全，供对比区与两类卡片直接消费
 * 保持与存储态一致的判别联合，便于按 source 收窄后直接传给对应的卡片组件。
 */
export type ResolvedFireSegment = ResolvedManualSegment | ResolvedWeaponSegment

/** 连发发数的最小值：至少 2 发才构成一轮连发 */
export const MIN_BURST_SIZE = 2

/** 切换到连发时的默认发数 */
export const DEFAULT_BURST_SIZE = 3

/** 工具栏「新增线段」的预设：直接指定连发发数与按钮文案，集中定义避免散落 */
export const SEGMENT_ADD_PRESETS: ReadonlyArray<{ burstSize: number; label: string }> = [
  { burstSize: 0, label: '全自动' },
  { burstSize: DEFAULT_BURST_SIZE, label: '连发' },
]

/** 手动画段的类型切换项：全自动 / 连发，供 Segmented 与判断逻辑共用 */
export type ManualSegmentKind = 'auto' | 'burst'

/** 类型切换选项，按固定顺序排列 */
export const MANUAL_KIND_OPTIONS: ReadonlyArray<{ label: string; value: ManualSegmentKind }> = [
  { label: '全自动', value: 'auto' },
  { label: '连发', value: 'burst' },
]

/**
 * 连发发数的展示文案
 * 0 视为全自动；3 / 4 沿用习惯说法三连发、四连发；其余统一为「N 连发」。
 */
export function getBurstSizeLabel(burstSize: number): string {
  if (burstSize <= 0) return '全自动'
  const size = Math.round(burstSize)
  if (size === 3) return '三连发'
  if (size === 4) return '四连发'
  return `${size} 连发`
}
