import { useState } from 'react'
import type { FireSegment, FireSegmentMode } from '@/types/fireInterval'
import { FIRE_SEGMENT_MODE_LABELS, FIRE_SEGMENT_MODES } from '@/types/fireInterval'

/**
 * 线段与时间窗口在 localStorage 中的存储键
 * v2 起连发字段由 burstGap 改为 officialRpm（周期改由官方射速反推），
 * 键名同步升级以直接丢弃旧结构数据，避免兼容分支。
 */
const STORAGE_KEY = 'delta-lab.fire-intervals.v2'

/** 时间窗口默认值（毫秒） */
export const DEFAULT_WINDOW_MS = 1000
/** 时间窗口下限（毫秒） */
export const MIN_WINDOW_MS = 100
/** 时间窗口上限（毫秒） */
export const MAX_WINDOW_MS = 5000

/**
 * 各类型线段的默认参数
 * 全自动不使用连发字段，但为保持 FireSegment 结构一致仍填入默认值（计算时会被忽略）；
 * 连发默认取 MK4 三连发的官方组合：官方射速 793 RPM、轮内间隔 52 ms。
 */
const DEFAULT_PARAMS: Record<
  FireSegmentMode,
  Pick<FireSegment, 'fireRate' | 'burstInterval' | 'officialRpm'>
> = {
  auto: { fireRate: 600, burstInterval: 60, officialRpm: 600 },
  burst3: { fireRate: 600, burstInterval: 52, officialRpm: 793 },
  burst4: { fireRate: 600, burstInterval: 52, officialRpm: 793 },
}

/** 落盘结构 */
interface StoredState {
  segments: FireSegment[]
  windowMs: number
}

/** 生成线段唯一标识：不依赖 crypto.randomUUID 在非安全上下文下的可用性 */
function createSegmentId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** 判断是否为正的有限数：NaN、Infinity、0 与负数一律视为非法 */
function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

/** 校验单条线段：类型与全部数值字段都合法才保留，避免脏数据导致除零或空轨道 */
function isFireSegment(value: unknown): value is FireSegment {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    FIRE_SEGMENT_MODES.includes(item.mode as FireSegmentMode) &&
    isPositiveNumber(item.fireRate) &&
    isPositiveNumber(item.burstInterval) &&
    isPositiveNumber(item.officialRpm)
  )
}

/** 把时间窗口限制在允许范围内，非法值回退默认 */
function clampWindowMs(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_WINDOW_MS
  return Math.min(MAX_WINDOW_MS, Math.max(MIN_WINDOW_MS, Math.round(value)))
}

/** 读取持久化状态：解析失败或字段非法时回退默认值 */
function readState(): StoredState {
  /** 空态与读取失败共用同一个默认值 */
  const fallback: StoredState = { segments: [], windowMs: DEFAULT_WINDOW_MS }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return fallback
    const parsed = JSON.parse(saved) as Partial<Record<keyof StoredState, unknown>>
    return {
      segments: Array.isArray(parsed.segments) ? parsed.segments.filter(isFireSegment) : [],
      windowMs:
        typeof parsed.windowMs === 'number' ? clampWindowMs(parsed.windowMs) : DEFAULT_WINDOW_MS,
    }
  } catch {
    return fallback
  }
}

/** 保存状态；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 忽略写入失败
  }
}

/** Hook 对外暴露的接口 */
export interface FireSegmentsController {
  /** 当前全部线段，顺序即展示顺序，同时决定取色下标 */
  segments: FireSegment[]
  /** 当前时间窗口（毫秒） */
  windowMs: number
  /** 新增一条指定类型的线段，名称按同类型现有数量递增 */
  addSegment: (mode: FireSegmentMode) => void
  /** 更新一条线段 */
  updateSegment: (id: string, patch: Partial<FireSegment>) => void
  /** 删除一条线段 */
  removeSegment: (id: string) => void
  /** 清空全部线段 */
  clearSegments: () => void
  /** 设置时间窗口，会自动限制在允许范围内 */
  setWindowMs: (value: number) => void
}

/**
 * 射击间隔对比的线段与时间窗口 Hook
 * 线段、窗口与持久化是一组不可分割的状态，因此合并为单个 Hook 统一读写；
 * 所有改动都实时同步内存与 localStorage，页面无需「应用」按钮。
 */
export function useFireSegments(): FireSegmentsController {
  /** 当前状态，初始值读取一次持久化结果 */
  const [state, setState] = useState<StoredState>(() => readState())

  /** 统一的提交入口：更新内存并落盘，避免持久化调用散落到各个操作中 */
  function commit(next: StoredState): void {
    setState(next)
    writeState(next)
  }

  /** 新增线段：按同类型现有数量递增命名，例如「三连发 1」「三连发 2」 */
  function addSegment(mode: FireSegmentMode): void {
    const sameModeCount = state.segments.filter((segment) => segment.mode === mode).length
    const segment: FireSegment = {
      id: createSegmentId(),
      name: `${FIRE_SEGMENT_MODE_LABELS[mode]} ${sameModeCount + 1}`,
      mode,
      ...DEFAULT_PARAMS[mode],
    }
    commit({ ...state, segments: [...state.segments, segment] })
  }

  /** 更新线段：按 id 合并补丁字段 */
  function updateSegment(id: string, patch: Partial<FireSegment>): void {
    commit({
      ...state,
      segments: state.segments.map((segment) =>
        segment.id === id ? { ...segment, ...patch } : segment,
      ),
    })
  }

  /** 删除线段 */
  function removeSegment(id: string): void {
    commit({ ...state, segments: state.segments.filter((segment) => segment.id !== id) })
  }

  /** 清空线段，时间窗口设置保留 */
  function clearSegments(): void {
    commit({ ...state, segments: [] })
  }

  return {
    segments: state.segments,
    windowMs: state.windowMs,
    addSegment,
    updateSegment,
    removeSegment,
    clearSegments,
    /** 设置时间窗口：先收敛到允许范围再落盘 */
    setWindowMs: (value: number): void => commit({ ...state, windowMs: clampWindowMs(value) }),
  }
}
