/**
 * 武器领域模型
 * 只描述数据结构，不含计算与展示逻辑，供数据层、计算层与页面共同引用。
 */

/** 受击部位，不同部位应用不同伤害倍率 */
export type HitboxPart = 'head' | 'chest' | 'abdomen' | 'limbs'

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
  /** 射速，单位 RPM（每分钟发数） */
  fireRate: number
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
