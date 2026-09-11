import { create } from 'zustand'
import { weapons as seedWeapons } from '@/data/weapons'
import type { Weapon, WeaponRecord } from '@/types/weapon'
import { createWeaponId } from '@/utils/weaponId'
import { mergeWithSeed } from '@/utils/weaponSeed'

export type ThemeMode = 'light' | 'dark'

/**
 * 武器列表在 localStorage 中的存储键
 * v3 起改为结构化存储：{ records 武器列表, removedKeys 用户删除过的内置 key 墓碑 }
 */
const WEAPONS_STORAGE_KEY = 'delta-lab.weapons.v3'

/** 主题模式在 localStorage 中的存储键 */
const THEME_STORAGE_KEY = 'delta-lab.theme'

/** 保存主题模式；隐私模式等写入失败场景静默忽略，仅当次会话生效 */
function writeThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // 忽略写入失败
  }
}

/** 读取主题模式；key 不存在、值非法或读取失败时回退为暗色 */
function readThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // 读取失败按默认值处理
  }
  return 'dark'
}

/** 武器列表的落盘结构 */
interface StoredWeapons {
  /** 合并后的武器列表 */
  records: WeaponRecord[]
  /** 用户主动删除过的内置 key，用于避免升级时被重新加回 */
  removedKeys: string[]
}

/**
 * 用户删除过的内置 key（内存副本）
 * 每次写库都随记录一起落盘，删除动作只需追加，不再重复读写 localStorage
 */
let removedSeedKeys: string[] = []

/** 判断是否普通对象，便于安全取字段 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 结构校验：只判断必要字段，避免 localStorage 脏数据导致页面崩溃 */
function isWeaponRecord(value: unknown): value is WeaponRecord {
  if (!isPlainObject(value)) return false
  const record = value as Partial<WeaponRecord>
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    (record.source === undefined || record.source === 'builtin' || record.source === 'user') &&
    (record.seedKey === undefined || typeof record.seedKey === 'string') &&
    (record.seedHash === undefined || typeof record.seedHash === 'string') &&
    typeof record.fireRate === 'number' &&
    typeof record.damage?.base === 'number' &&
    typeof record.damage?.armor === 'number' &&
    Array.isArray(record.range) &&
    record.range.length > 0 &&
    record.range.every(
      (item) => typeof item.start === 'number' && typeof item.multiplier === 'number',
    ) &&
    typeof record.hitMultiplier?.head === 'number' &&
    typeof record.hitMultiplier?.chest === 'number' &&
    typeof record.hitMultiplier?.abdomen === 'number' &&
    typeof record.hitMultiplier?.limbs === 'number'
  )
}

/** 保存武器列表与墓碑；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeWeapons(records: WeaponRecord[]): void {
  try {
    const payload: StoredWeapons = { records, removedKeys: removedSeedKeys }
    localStorage.setItem(WEAPONS_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // 忽略写入失败
  }
}

/**
 * 读取武器列表，并与当前版本内置数据做三方合并
 * - 无存储或结构非法：records 视为空数组，由合并逻辑全量播种内置武器
 * - 有存储：先合并再落盘，实现「内置数据随版本升级」与「用户数据完整保留」两者兼顾
 */
function readWeapons(): WeaponRecord[] {
  let stored: StoredWeapons = { records: [], removedKeys: [] }
  try {
    const saved = localStorage.getItem(WEAPONS_STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (isPlainObject(parsed)) {
        const records = parsed.records
        const removedKeys = parsed.removedKeys
        if (
          Array.isArray(records) &&
          records.every(isWeaponRecord) &&
          Array.isArray(removedKeys) &&
          removedKeys.every((key) => typeof key === 'string')
        ) {
          stored = { records, removedKeys }
        }
      }
    }
  } catch {
    // 解析失败按无数据处理
  }

  const merged = mergeWithSeed(stored.records, stored.removedKeys, seedWeapons)
  removedSeedKeys = merged.removedKeys
  writeWeapons(merged.records)
  return merged.records
}

interface AppState {
  /** 主题模式，由 App.tsx 的 ConfigProvider 消费 */
  themeMode: ThemeMode
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean
  /** 武器列表：唯一数据源，DPS对比页与武器管理页共同读取 */
  weapons: WeaponRecord[]
  toggleThemeMode: () => void
  toggleSidebar: () => void
  /** 导入一把武器：标记为用户数据后追加并持久化 */
  addWeapon: (weapon: Weapon) => void
  /** 编辑已有武器：按 id 替换数值，保留 id 与来源元数据并持久化 */
  updateWeapon: (id: string, weapon: Weapon) => void
  /** 整体替换武器列表：供覆盖导入使用，记录身份已在合并阶段确定，随后持久化 */
  setWeapons: (list: WeaponRecord[]) => void
  /** 删除指定武器：内置条目登记墓碑后按 id 过滤并持久化 */
  removeWeapon: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  // 初始值直接读取 localStorage 并与内置数据合并，保证首帧即渲染最新数据、刷新后不回退
  themeMode: readThemeMode(),
  sidebarCollapsed: false,
  weapons: readWeapons(),
  toggleThemeMode: () =>
    set((state) => {
      const next: ThemeMode = state.themeMode === 'light' ? 'dark' : 'light'
      writeThemeMode(next)
      return { themeMode: next }
    }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  addWeapon: (weapon) =>
    set((state) => {
      // 用户新增：标记为 user，此后不再参与内置数据升级覆盖
      const next: WeaponRecord[] = [
        ...state.weapons,
        { ...weapon, id: createWeaponId(), source: 'user' },
      ]
      writeWeapons(next)
      return { weapons: next }
    }),
  updateWeapon: (id, weapon) =>
    set((state) => {
      // 先展开旧记录再覆盖数值，从而保留 source / seedKey / seedHash
      // 用户改过的内置条目会因指纹与基线不一致被识别为「已改动」，升级时不再被覆盖
      const next = state.weapons.map((item) => (item.id === id ? { ...item, ...weapon, id } : item))
      writeWeapons(next)
      return { weapons: next }
    }),
  setWeapons: (list) => {
    writeWeapons(list)
    set({ weapons: list })
  },
  removeWeapon: (id) =>
    set((state) => {
      const target = state.weapons.find((item) => item.id === id)
      // 删除内置条目时登记墓碑，升级时不会复活；用户条目无需登记
      if (target?.source === 'builtin' && target.seedKey && !removedSeedKeys.includes(target.seedKey)) {
        removedSeedKeys = [...removedSeedKeys, target.seedKey]
      }
      const next = state.weapons.filter((item) => item.id !== id)
      writeWeapons(next)
      return { weapons: next }
    }),
}))
