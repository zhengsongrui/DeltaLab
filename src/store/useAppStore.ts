import { create } from 'zustand'
import { weapons as seedWeapons } from '@/data/weapons'
import type { Weapon, WeaponRecord } from '@/types/weapon'
import { createWeaponId } from '@/utils/weaponId'

export type ThemeMode = 'light' | 'dark'

/** 武器列表在 localStorage 中的存储键；射程段结构由 max 改为 start 后升到 v2 */
const WEAPONS_STORAGE_KEY = 'delta-lab.weapons.v2'

/** 结构校验：只判断必要字段，避免 localStorage 脏数据导致页面崩溃 */
function isWeaponRecord(value: unknown): value is WeaponRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Partial<WeaponRecord>
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
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

/** 保存武器列表；隐私模式等写入失败场景静默忽略，不影响功能 */
function writeWeapons(list: WeaponRecord[]): void {
  try {
    localStorage.setItem(WEAPONS_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 忽略写入失败
  }
}

/**
 * 读取武器列表
 * key 不存在或数据非法：使用内置种子数据并立即落盘，实现首次加载写入内置武器
 * key 存在且为合法数组：直接使用；空数组同样合法，代表用户已把武器删光，不回填内置数据
 */
function readWeapons(): WeaponRecord[] {
  try {
    const saved = localStorage.getItem(WEAPONS_STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.every(isWeaponRecord)) return parsed
    }
  } catch {
    // 解析失败按无数据处理
  }
  const seeded = seedWeapons.map((weapon) => ({ ...weapon, id: createWeaponId() }))
  writeWeapons(seeded)
  return seeded
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
  /** 导入一把武器：生成 id 后追加并持久化 */
  addWeapon: (weapon: Weapon) => void
  /** 编辑已有武器：按 id 替换数值，id 保持不变并持久化 */
  updateWeapon: (id: string, weapon: Weapon) => void
  /** 整体替换武器列表：供覆盖导入使用，记录身份已在合并阶段确定，随后持久化 */
  setWeapons: (list: WeaponRecord[]) => void
  /** 删除指定武器：按 id 过滤并持久化 */
  removeWeapon: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  themeMode: 'light',
  sidebarCollapsed: false,
  weapons: readWeapons(),
  toggleThemeMode: () =>
    set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  addWeapon: (weapon) =>
    set((state) => {
      const next = [...state.weapons, { ...weapon, id: createWeaponId() }]
      writeWeapons(next)
      return { weapons: next }
    }),
  updateWeapon: (id, weapon) =>
    set((state) => {
      const next = state.weapons.map((item) => (item.id === id ? { ...weapon, id } : item))
      writeWeapons(next)
      return { weapons: next }
    }),
  setWeapons: (list) => {
    writeWeapons(list)
    set({ weapons: list })
  },
  removeWeapon: (id) =>
    set((state) => {
      const next = state.weapons.filter((item) => item.id !== id)
      writeWeapons(next)
      return { weapons: next }
    }),
}))
