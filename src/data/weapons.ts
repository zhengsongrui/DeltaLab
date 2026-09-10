import type { Weapon } from '@/types/weapon'

/**
 * 枪械静态数据
 * 手工维护，后续可直接增删数组项或替换数值，页面无需改动。
 */
export const weapons: readonly Weapon[] = [
  {
    name: '海啸 AS VAL',
    damage: {
      base: 28,
      armor: 44,
    },
    fireRate: 972,
    range: [
      { start: 0, multiplier: 1 },
      { start: 27, multiplier: 0.9 },
      { start: 35, multiplier: 0.8 },
      { start: 54, multiplier: 0.7 },
    ],
    hitMultiplier: {
      head: 1.5,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.3,
    },
  },
]
