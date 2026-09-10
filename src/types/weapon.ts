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
 * 武器记录：在武器数值之上附加唯一标识
 * id 属于应用内的存储身份，由 store 在武器入库时生成，用于表格 rowKey 与删除定位；
 * 继承 Weapon 使其可直接传入计算与行构造函数。
 */
export interface WeaponRecord extends Weapon {
  /** 唯一标识，导入时生成，内置武器在首次加载时同样会补上 */
  id: string
}
