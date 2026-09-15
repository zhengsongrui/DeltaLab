/**
 * 武器领域模型
 * 只描述数据结构，不含计算与展示逻辑，供数据层、计算层与页面共同引用。
 */

/** 受击部位，不同部位应用不同伤害倍率 */
export type HitboxPart = 'head' | 'chest' | 'abdomen' | 'limbs'

/**
 * 开火模式
 * auto   全自动：最短射击间隔由射速换算
 * burst  连发：最短射击间隔即一轮连发内部间隔，另需一轮发数推导轮次间隔
 * single 单发：最短射击间隔由射速换算
 */
export type WeaponFireMode = 'auto' | 'burst' | 'single'

/** 开火模式的中文文案，供表单切换与表格列共用，避免文案散落多处 */
export const WEAPON_FIRE_MODE_LABELS: Record<WeaponFireMode, string> = {
  auto: '全自动',
  burst: '连发',
  single: '单发',
}

/** 全部开火模式，按固定顺序排列，供表单模式切换与读取校验遍历 */
export const WEAPON_FIRE_MODES: WeaponFireMode[] = ['auto', 'burst', 'single']

/** 判断任意值是否为合法开火模式：供读取校验与导入解析复用 */
export function isWeaponFireMode(value: unknown): value is WeaponFireMode {
  return WEAPON_FIRE_MODES.includes(value as WeaponFireMode)
}

/**
 * 射程分段：从 start 米起应用对应倍率
 * 区间语义为 [start, 下一段 start)，最后一段无终点、一直生效
 */
export interface WeaponRange {
  /** 该段起点（米），含该点；首段为 0，各段按 start 升序排列 */
  start: number
  /** 该段射程内的伤害倍率 */
  multiplier: number
}

/** 单把枪械数据 */
export interface Weapon {
  /** 枪械名称 */
  name: string
  /** 伤害：base 为基础伤害，armor 为护甲伤害 */
  damage: {
    base: number
    armor: number
  }
  /** 开火模式：全自动 / 连发 / 单发 */
  fireMode: WeaponFireMode
  /** 射速，单位 RPM（每分钟发数）；连发模式下即官方标称射速 */
  fireRate: number
  /**
   * 最短射击间隔（毫秒，保留一位小数）
   * 全自动 / 单发由射速换算得到（60000 ÷ 射速）；连发即「一轮连发内部间隔」，
   * 需配合 burstSize 才能推导连发周期与轮次间隔。
   */
  minShotInterval: number
  /** 一轮连发的发数；非连发模式为 0 */
  burstSize: number
  /** 射程倍率表，按距离分段衰减 */
  range: WeaponRange[]
  /** 各受击部位对应的伤害倍率 */
  hitMultiplier: Record<HitboxPart, number>
}

/**
 * 内置种子武器：在武器数值之上附加稳定标识
 * key 是跨版本对齐同一条目的依据，与展示用 name 解耦，因此改名不会影响数据升级；
 * 维护约定：只增不改，新增内置武器时补一个新 key，修改数值或名称时沿用原 key。
 */
export interface WeaponSeed extends Weapon {
  /** 内置武器的稳定标识，一经确定不再变更 */
  key: string
}

/** 数据来源：builtin 表示内置种子，user 表示用户新增或导入 */
export type WeaponSource = 'builtin' | 'user'

/**
 * 武器记录：在武器数值之上附加唯一标识与来源元数据
 * id 属于应用内的存储身份，由 store 在武器入库时生成，用于表格 rowKey 与删除定位；
 * source / seedKey / seedHash 用于程序升级时判断「内置条目是否被用户改动过」，
 * 继承 Weapon 使其可直接传入计算与行构造函数。
 */
export interface WeaponRecord extends Weapon {
  /** 唯一标识，导入时生成，内置武器在首次加载时同样会补上 */
  id: string
  /** 数据来源；缺失时按 user 处理，保证旧数据不被误当作内置条目覆盖 */
  source?: WeaponSource
  /** 内置条目对应的稳定标识，仅 source 为 builtin 时存在 */
  seedKey?: string
  /** 上次与内置数据同步时的数值指纹，用于判断用户是否改动过 */
  seedHash?: string
}
