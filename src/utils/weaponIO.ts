/**
 * 武器数据导入导出
 * 负责「武器 ⇄ Excel / JSON」的纯数据转换与校验，不触碰 UI 与 store。
 * Excel 采用扁平列布局：射程按顺序展平为「射程N距离 / 射程N倍率」，空列忽略；
 * 射程列组固定在最后一组（紧跟四个部位倍率），距离即领域模型中的 start（段起点），
 * 末段没有下一段，天然表达「无终点」。
 */
import * as XLSX from 'xlsx'
import type { Weapon, WeaponRange, WeaponRecord } from '@/types/weapon'
import { createWeaponId } from '@/utils/weaponId'

/** Excel 最多承载的射程段数，超出部分导出时忽略 */
export const RANGE_COLUMN_COUNT = 4

/** Excel 列名常量：导出与解析共用，避免两处字符串各自漂移 */
const COLUMNS = {
  name: '枪械名称',
  base: '基础伤害',
  armor: '护甲伤害',
  fireRate: '射速RPM',
  head: '头部倍率',
  chest: '胸部倍率',
  abdomen: '腹部倍率',
  limbs: '四肢倍率',
} as const

/** 第 order 段（从 1 开始）的距离 / 倍率列名，如「射程1距离」 */
function rangeKey(order: number, unit: '距离' | '倍率'): string {
  return `射程${order}${unit}`
}

/**
 * 固定列顺序，json_to_sheet 依赖它保证每行表头一致
 * 射程列组必须排在最后，方便人工核对基础伤害与部位倍率后再看分段
 */
const SHEET_HEADER: string[] = [
  COLUMNS.name,
  COLUMNS.base,
  COLUMNS.armor,
  COLUMNS.fireRate,
  COLUMNS.head,
  COLUMNS.chest,
  COLUMNS.abdomen,
  COLUMNS.limbs,
  ...Array.from({ length: RANGE_COLUMN_COUNT }, (_, index) => [
    rangeKey(index + 1, '距离'),
    rangeKey(index + 1, '倍率'),
  ]).flat(),
]

/** 从表格读到的一行原始数据，键为列名 */
type SheetRow = Record<string, unknown>

/* ------------------------------- 导出：领域模型 → 外部格式 ------------------------------- */

/** 武器 → Excel 行；射程段按序展平，段数不足的列留空 */
export function weaponsToSheetRows(weapons: Weapon[]): SheetRow[] {
  return weapons.map((weapon) => {
    const row: SheetRow = {
      [COLUMNS.name]: weapon.name,
      [COLUMNS.base]: weapon.damage.base,
      [COLUMNS.armor]: weapon.damage.armor,
      [COLUMNS.fireRate]: weapon.fireRate,
      [COLUMNS.head]: weapon.hitMultiplier.head,
      [COLUMNS.chest]: weapon.hitMultiplier.chest,
      [COLUMNS.abdomen]: weapon.hitMultiplier.abdomen,
      [COLUMNS.limbs]: weapon.hitMultiplier.limbs,
    }
    weapon.range.slice(0, RANGE_COLUMN_COUNT).forEach((segment, index) => {
      row[rangeKey(index + 1, '距离')] = segment.start
      row[rangeKey(index + 1, '倍率')] = segment.multiplier
    })
    return row
  })
}

/** 武器列表 → .xlsx 二进制，工作表名固定为「武器」 */
export function weaponsToXlsxBlob(weapons: Weapon[]): Blob {
  const sheet = XLSX.utils.json_to_sheet(weaponsToSheetRows(weapons), { header: SHEET_HEADER })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, '武器')
  const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/** 武器列表 → JSON 文本，保留 id 便于人工核对，剥离升级用的内部元数据 */
export function weaponsToJsonText(weapons: WeaponRecord[]): string {
  return JSON.stringify(
    weapons.map((weapon) => ({
      ...weapon,
      source: undefined,
      seedKey: undefined,
      seedHash: undefined,
    })),
    null,
    2,
  )
}

/* ------------------------------- 导入：外部格式 → 领域模型 ------------------------------- */

/** 读取必填数字：空值或非数字抛出带定位信息的错误 */
function requireNumber(value: unknown, label: string): number {
  const parsed = typeof value === 'string' ? Number(value.trim()) : value
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
    throw new Error(`${label} 不是有效数字`)
  }
  return parsed
}

/** 读取可选数字：空单元格返回 undefined，写了但不是数字则报错 */
function optionalNumber(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return requireNumber(value, label)
}

/** 判断整行是否为空行（表格尾部常见），空行直接跳过而不是报错 */
function isBlankRow(row: SheetRow): boolean {
  return Object.values(row).every((value) => value === undefined || value === null || value === '')
}

/**
 * 整理射程段：按距离升序，去重校验，并保证首段起点为 0
 * 若文件里最小距离不为 0，则在最前补一段「0 米起、沿用首段倍率」，满足领域模型约束
 */
function normalizeRange(segments: WeaponRange[], label: string): WeaponRange[] {
  if (segments.length === 0) throw new Error(`${label} 缺少射程分段`)
  const sorted = [...segments].sort((left, right) => left.start - right.start)
  const duplicated = sorted.find((segment, index) => index > 0 && segment.start === sorted[index - 1].start)
  if (duplicated) throw new Error(`${label} 存在重复的射程距离 ${duplicated.start}`)
  if (sorted[0].start !== 0) sorted.unshift({ start: 0, multiplier: sorted[0].multiplier })
  return sorted
}

/** 解析一行的射程段：距离与倍率必须成对，遇到成对空列即视为后续无段 */
function parseRangeRow(row: SheetRow, label: string): WeaponRange[] {
  const segments: WeaponRange[] = []
  for (let index = 0; index < RANGE_COLUMN_COUNT; index += 1) {
    const start = optionalNumber(row[rangeKey(index + 1, '距离')], `${label}「${rangeKey(index + 1, '距离')}」`)
    const multiplier = optionalNumber(row[rangeKey(index + 1, '倍率')], `${label}「${rangeKey(index + 1, '倍率')}」`)
    if (start === undefined && multiplier === undefined) break
    if (start === undefined || multiplier === undefined) {
      throw new Error(`${label} 第 ${index + 1} 段射程必须同时填写距离与倍率`)
    }
    segments.push({ start, multiplier })
  }
  return normalizeRange(segments, label)
}

/** 解析一行武器数据，label 用于错误提示定位（Excel 行号或数据序号） */
function parseRow(row: SheetRow, label: string): Weapon {
  const rawName = row[COLUMNS.name]
  const name = typeof rawName === 'string' ? rawName.trim() : ''
  if (!name) throw new Error(`${label} 缺少「${COLUMNS.name}」`)
  return {
    name,
    damage: {
      base: requireNumber(row[COLUMNS.base], `${label}「${COLUMNS.base}」`),
      armor: requireNumber(row[COLUMNS.armor], `${label}「${COLUMNS.armor}」`),
    },
    fireRate: requireNumber(row[COLUMNS.fireRate], `${label}「${COLUMNS.fireRate}」`),
    range: parseRangeRow(row, label),
    hitMultiplier: {
      head: requireNumber(row[COLUMNS.head], `${label}「${COLUMNS.head}」`),
      chest: requireNumber(row[COLUMNS.chest], `${label}「${COLUMNS.chest}」`),
      abdomen: requireNumber(row[COLUMNS.abdomen], `${label}「${COLUMNS.abdomen}」`),
      limbs: requireNumber(row[COLUMNS.limbs], `${label}「${COLUMNS.limbs}」`),
    },
  }
}

/** 解析 xlsx 二进制为首个工作表的数据行 */
export function readSheetRows(data: ArrayBuffer): unknown[] {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('Excel 文件中没有工作表')
  return XLSX.utils.sheet_to_json<unknown>(workbook.Sheets[sheetName])
}

/** 表格行 → 武器列表；任意一行失败即抛出，调用方据此放弃整次导入 */
export function sheetRowsToWeapons(rows: unknown[]): Weapon[] {
  const weapons: Weapon[] = []
  rows.forEach((raw, index) => {
    const row = raw as SheetRow
    if (isBlankRow(row)) return
    // Excel 行号 = 数据下标 + 2（第 1 行是表头）
    weapons.push(parseRow(row, `第 ${index + 2} 行`))
  })
  if (weapons.length === 0) throw new Error('表格中没有可导入的数据行')
  return weapons
}

/** 判断未知值是否为普通对象，便于安全取字段 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 解析 JSON 中的射程数组：结构与 WeaponRange 一致，同样做升序与首段补 0 整理 */
function parseJsonRange(value: unknown, label: string): WeaponRange[] {
  if (!Array.isArray(value)) throw new Error(`${label} range 必须是数组`)
  const segments = value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`${label} range 第 ${index + 1} 段不是对象`)
    return {
      start: requireNumber(item.start, `${label} range 第 ${index + 1} 段 start`),
      multiplier: requireNumber(item.multiplier, `${label} range 第 ${index + 1} 段 multiplier`),
    }
  })
  return normalizeRange(segments, label)
}

/** 解析单条 JSON 数据；字段缺失或类型错误即抛出，文件中的 id 一律忽略 */
function parseJsonWeapon(value: unknown, label: string): Weapon {
  if (!isRecord(value)) throw new Error(`${label} 不是对象`)
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  if (!name) throw new Error(`${label} 缺少 name`)
  const damage = value.damage
  const hitMultiplier = value.hitMultiplier
  if (!isRecord(damage)) throw new Error(`${label} 缺少 damage`)
  if (!isRecord(hitMultiplier)) throw new Error(`${label} 缺少 hitMultiplier`)
  return {
    name,
    damage: {
      base: requireNumber(damage.base, `${label} damage.base`),
      armor: requireNumber(damage.armor, `${label} damage.armor`),
    },
    fireRate: requireNumber(value.fireRate, `${label} fireRate`),
    range: parseJsonRange(value.range, label),
    hitMultiplier: {
      head: requireNumber(hitMultiplier.head, `${label} hitMultiplier.head`),
      chest: requireNumber(hitMultiplier.chest, `${label} hitMultiplier.chest`),
      abdomen: requireNumber(hitMultiplier.abdomen, `${label} hitMultiplier.abdomen`),
      limbs: requireNumber(hitMultiplier.limbs, `${label} hitMultiplier.limbs`),
    },
  }
}

/** JSON 文本 → 武器列表；只接受数组结构，逐条校验 */
export function parseWeaponsJsonText(text: string): Weapon[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('JSON 解析失败，请确认文件内容合法')
  }
  if (!Array.isArray(parsed)) throw new Error('JSON 顶层必须是数组')
  if (parsed.length === 0) throw new Error('JSON 中没有可导入的数据')
  return parsed.map((item, index) => parseJsonWeapon(item, `第 ${index + 1} 条数据`))
}

/* --------------------------------------- 合并 --------------------------------------- */

export interface MergeResult {
  /** 覆盖模式结果：顺序与导入数据一致，可直接整体写入 store */
  replaced: WeaponRecord[]
  /** 追加模式结果：保留现有顺序，同名原位替换，新记录追加到末尾 */
  appended: WeaponRecord[]
  /** 新增条数 */
  added: number
  /** 覆盖同名旧记录的条数 */
  updated: number
  /** 覆盖模式下会被移除的旧记录条数 */
  removed: number
}

/**
 * 按名称合并导入数据与现有数据
 * 名称命中 → 沿用旧 id 与来源元数据；新名称 → 生成新 id 并标记为用户数据。
 * 导入数据内部同名时以最后一条为准，避免出现重复记录。
 */
export function mergeWeaponsByName(current: WeaponRecord[], incoming: Weapon[]): MergeResult {
  const currentByName = new Map(current.map((item) => [item.name, item]))
  const incomingByName = new Map<string, Weapon>()
  for (const weapon of incoming) incomingByName.set(weapon.name, weapon)

  const added = [...incomingByName.keys()].filter((name) => !currentByName.has(name)).length
  const updated = incomingByName.size - added

  /**
   * 导入数据 → 记录
   * 命中旧名称：沿用旧 id 与来源元数据，使「用户改过的内置条目」被导入覆盖后仍标记为已改动；
   * 新名称：生成新 id 并标记为用户数据，此后不再参与内置升级覆盖
   */
  const toRecord = (weapon: Weapon): WeaponRecord => {
    const existing = currentByName.get(weapon.name)
    return existing
      ? {
          ...weapon,
          id: existing.id,
          source: existing.source,
          seedKey: existing.seedKey,
          seedHash: existing.seedHash,
        }
      : { ...weapon, id: createWeaponId(), source: 'user' }
  }

  const replaced = [...incomingByName.values()].map(toRecord)
  const appended = [
    // 现有记录：同名用导入数据替换数值、保留原 id 与来源元数据，其余原样保留
    ...current.map((item) => {
      const replacement = incomingByName.get(item.name)
      return replacement
        ? {
            ...replacement,
            id: item.id,
            source: item.source,
            seedKey: item.seedKey,
            seedHash: item.seedHash,
          }
        : item
    }),
    ...replaced.filter((item) => !currentByName.has(item.name)),
  ]

  return { replaced, appended, added, updated, removed: current.length - updated }
}
