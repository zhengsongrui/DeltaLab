import { useState } from 'react'
import type { FireSegment, ManualFireSegment, ManualSegmentPatch } from '@/types/fireInterval'
import { MIN_BURST_SIZE } from '@/types/fireInterval'

/**
 * 线段与时间窗口在 localStorage 中的存储键
 * v3 起线段改为判别联合（手动存数值、导入只存 weaponId），并支持任意连发发数，
 * 键名同步升级以直接丢弃旧结构数据，避免兼容分支。
 */
const STORAGE_KEY = 'delta-lab.fire-intervals.v3'

/** 时间窗口默认值（毫秒） */
export const DEFAULT_WINDOW_MS = 1000
/** 时间窗口下限（毫秒） */
export const MIN_WINDOW_MS = 100
/** 时间窗口上限（毫秒） */
export const MAX_WINDOW_MS = 5000

/**
 * 新增线段的默认数值
 * 全自动只用射速决定射击间隔，其余字段为保持结构完整仍填默认值（计算时被忽略）；
 * 连发默认取 MK4 三连发的官方组合：官方射速 793 RPM、轮内间隔 52 ms。
 */
const AUTO_DEFAULTS: Omit<ManualFireSegment, 'id' | 'source' | 'name' | 'burstSize'> = {
  fireRate: 600,
  burstInterval: 60,
  officialRpm: 600,
}
const BURST_DEFAULTS: Omit<ManualFireSegment, 'id' | 'source' | 'name' | 'burstSize'> = {
  fireRate: 600,
  burstInterval: 52,
  officialRpm: 793,
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

/** 判断连发发数是否合法：非负整数，0 表示全自动 / 单发 */
function isBurstSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

/** 校验手动线段：全部数值字段都合法才保留，避免脏数据导致除零或空轨道 */
function isManualSegment(item: Record<string, unknown>): boolean {
  return (
    typeof item.id === 'string' &&
    item.source === 'manual' &&
    typeof item.name === 'string' &&
    isBurstSize(item.burstSize) &&
    isPositiveNumber(item.fireRate) &&
    isPositiveNumber(item.burstInterval) &&
    isPositiveNumber(item.officialRpm)
  )
}

/** 校验导入线段：只要求 id 与所引用的武器 id 合法 */
function isWeaponSegment(item: Record<string, unknown>): boolean {
  return (
    typeof item.id === 'string' && item.source === 'weapon' && typeof item.weaponId === 'string'
  )
}

/** 校验单条线段：按 source 判别两种形态 */
function isFireSegment(value: unknown): value is FireSegment {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return isManualSegment(item) || isWeaponSegment(item)
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
  /** 当前全部线段（存储态），顺序即展示顺序，同时决定取色下标 */
  segments: FireSegment[]
  /** 当前时间窗口（毫秒） */
  windowMs: number
  /** 新增一条线段；burstSize 为 0 表示全自动，>= 2 表示连发发数 */
  addSegment: (burstSize: number) => void
  /** 按武器 id 导入线段：已导入的武器自动跳过，不产生重复 */
  importWeapons: (weaponIds: string[]) => void
  /** 更新一条手动线段；导入线段不受影响（只读） */
  updateSegment: (id: string, patch: ManualSegmentPatch) => void
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
 * 注意：导入线段只保存 weaponId，其数值在页面渲染时由武器库实时解析。
 */
export function useFireSegments(): FireSegmentsController {
  /** 当前状态，初始值读取一次持久化结果 */
  const [state, setState] = useState<StoredState>(() => readState())

  /** 统一的提交入口：更新内存并落盘，避免持久化调用散落到各个操作中 */
  function commit(next: StoredState): void {
    setState(next)
    writeState(next)
  }

  /** 新增手动线段：按同类现有数量递增命名，例如「全自动 1」「连发 2」 */
  function addSegment(burstSize: number): void {
    const isBurst = burstSize >= MIN_BURST_SIZE
    // 同类计数只统计手动线段，且连发与全自动分别计数，命名互不干扰
    const sameKindCount = state.segments.filter(
      (segment) =>
        segment.source === 'manual' && (segment.burstSize >= MIN_BURST_SIZE) === isBurst,
    ).length
    const segment: ManualFireSegment = {
      id: createSegmentId(),
      source: 'manual',
      name: `${isBurst ? '连发' : '全自动'} ${sameKindCount + 1}`,
      burstSize: isBurst ? Math.round(burstSize) : 0,
      ...(isBurst ? BURST_DEFAULTS : AUTO_DEFAULTS),
    }
    commit({ ...state, segments: [...state.segments, segment] })
  }

  /** 导入武器：仅记录 weaponId，已导入的武器跳过，避免重复线段 */
  function importWeapons(weaponIds: string[]): void {
    const existing = new Set(
      state.segments.flatMap((segment) => (segment.source === 'weapon' ? [segment.weaponId] : [])),
    )
    const additions: FireSegment[] = weaponIds
      .filter((weaponId) => !existing.has(weaponId))
      .map((weaponId) => ({ id: createSegmentId(), source: 'weapon', weaponId }))
    if (additions.length === 0) return
    commit({ ...state, segments: [...state.segments, ...additions] })
  }

  /** 更新手动线段：按 id 合并补丁字段；导入线段只读，不在更新范围内 */
  function updateSegment(id: string, patch: ManualSegmentPatch): void {
    commit({
      ...state,
      segments: state.segments.map((segment) =>
        segment.id === id && segment.source === 'manual' ? { ...segment, ...patch } : segment,
      ),
    })
  }

  /** 删除线段：手动与导入线段都允许移出对比 */
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
    importWeapons,
    updateSegment,
    removeSegment,
    clearSegments,
    /** 设置时间窗口：先收敛到允许范围再落盘 */
    setWindowMs: (value: number): void => commit({ ...state, windowMs: clampWindowMs(value) }),
  }
}
