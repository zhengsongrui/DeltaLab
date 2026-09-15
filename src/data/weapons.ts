import type { WeaponSeed } from "@/types/weapon";

/**
 * 枪械静态数据（内置种子）
 * 手工维护，后续可直接增删数组项或替换数值，页面无需改动。
 *
 * key 是跨版本对齐同一条目的稳定标识，维护约定：
 * - 新增条目：补一个全新的 key
 * - 修改数值或名称：沿用原 key
 * - 不要复用或改动已有 key，否则升级时会被当作「删除 + 新增」处理
 */
export const weapons: readonly WeaponSeed[] = [
  {
    name: "ASVAL - 海啸",
    key: "asval-tsunami",
    damage: {
      base: 28,
      armor: 44,
    },
    fireRate: 972,
    fireMode: "auto",
    minShotInterval: 61.7,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 27,
        multiplier: 0.9,
      },
      {
        start: 54,
        multiplier: 0.8,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "MK47 - 鏖战",
    key: "mk47-attrition",
    damage: {
      base: 46,
      armor: 47,
    },
    fireRate: 625,
    fireMode: "auto",
    minShotInterval: 96,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 25,
        multiplier: 0.85,
      },
      {
        start: 40,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "MK47 - 余烬",
    key: "mk47-yujin",
    damage: {
      base: 45,
      armor: 46,
    },
    fireRate: 625,
    fireMode: "auto",
    minShotInterval: 96,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 35,
        multiplier: 0.9,
      },
      {
        start: 50,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "ASH - 歼灭",
    key: "ash-annihilation",
    damage: {
      base: 56,
      armor: 55,
    },
    fireRate: 500,
    fireMode: "auto",
    minShotInterval: 120,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 72,
        multiplier: 0.9,
      },
    ],
    hitMultiplier: {
      head: 1.6,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.45,
    },
  },

  {
    name: "SCARH - 长管",
    key: "scarh-long",
    damage: {
      base: 40,
      armor: 41,
    },
    fireRate: 585,
    fireMode: "auto",
    minShotInterval: 102.6,
    burstSize: 0,
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.5,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 52,
        multiplier: 0.9,
      },
      {
        start: 91,
        multiplier: 0.75,
      },
    ],
  },
  {
    name: "K437 - 长管",
    key: "k437-long",
    damage: {
      base: 36,
      armor: 35,
    },
    fireRate: 780,
    fireMode: "auto",
    minShotInterval: 76.9,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 53,
        multiplier: 0.9,
      },
      {
        start: 90,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "M7 - 堤风",
    key: "m7-dike-wind",
    damage: {
      base: 39,
      armor: 42,
    },
    fireRate: 649,
    fireMode: "auto",
    minShotInterval: 92.4,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 65,
        multiplier: 0.9,
      },
      {
        start: 91,
        multiplier: 0.8,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 1,
      limbs: 0.35,
    },
  },
  {
    name: "AUG - 集成3倍",
    key: "aug-integrated-3x",
    damage: {
      base: 32,
      armor: 35,
    },
    fireRate: 679,
    fireMode: "auto",
    minShotInterval: 88.4,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 58,
        multiplier: 0.9,
      },
      {
        start: 96,
        multiplier: 0.8,
      },
    ],
    hitMultiplier: {
      head: 1.8875,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "93R - 鼬鼠",
    key: "r93-weasel",
    damage: {
      base: 34,
      armor: 32,
    },
    fireRate: 671,
    fireMode: "auto",
    minShotInterval: 89.4,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 32,
        multiplier: 0.8,
      },
      {
        start: 64,
        multiplier: 0.65,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "ASH - 战斧",
    key: "ash-battle-axe",
    damage: {
      base: 75,
      armor: 40,
    },
    fireRate: 400,
    fireMode: "auto",
    minShotInterval: 150,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 55,
        multiplier: 0.9,
      },
      {
        start: 90,
        multiplier: 0.8,
      },
    ],
    hitMultiplier: {
      head: 1.75,
      chest: 1,
      abdomen: 0.7,
      limbs: 0.25,
    },
  },
  {
    name: "K416 - 长管 - 轻语消音",
    key: "k416-long-whisper",
    damage: {
      base: 31,
      armor: 35,
    },
    fireRate: 880,
    fireMode: "auto",
    minShotInterval: 68.2,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 40,
        multiplier: 0.85,
      },
      {
        start: 80,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "MDR - 长管",
    key: "mdr-long",
    damage: {
      base: 41,
      armor: 43,
    },
    fireRate: 650,
    fireMode: "auto",
    minShotInterval: 92.3,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 46,
        multiplier: 0.85,
      },
      {
        start: 65,
        multiplier: 0.75,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "腾龙 - 长管 - 高导",
    key: "tenglong-long-high-guide",
    damage: {
      base: 35,
      armor: 38,
    },
    fireRate: 759,
    fireMode: "auto",
    minShotInterval: 79.1,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 46,
        multiplier: 0.9,
      },
      {
        start: 81,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 2.1,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "KC17 - 短管",
    key: "kc17-short",
    damage: {
      base: 31,
      armor: 48,
    },
    fireRate: 740,
    fireMode: "auto",
    minShotInterval: 81.1,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 55,
        multiplier: 0.85,
      },
      {
        start: 90,
        multiplier: 0.8,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "M4A1 - 长管",
    key: "m4a1-long",
    damage: {
      base: 31,
      armor: 33,
    },
    fireRate: 800,
    fireMode: "auto",
    minShotInterval: 75,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 52,
        multiplier: 0.85,
      },
      {
        start: 92,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "G3 - 短管",
    key: "g3-short",
    damage: {
      base: 39,
      armor: 42,
    },
    fireRate: 533,
    fireMode: "auto",
    minShotInterval: 112.6,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 55,
        multiplier: 0.9,
      },
      {
        start: 90,
        multiplier: 0.8,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "AK47 - 腰射",
    key: "ak47-hip-fire",
    damage: {
      base: 40,
      armor: 42,
    },
    fireRate: 600,
    fireMode: "auto",
    minShotInterval: 100,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 42,
        multiplier: 0.85,
      },
      {
        start: 74,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 2.5,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },

  {
    name: "QJB201 - 短管 - 高导 - 轻语消音",
    key: "qjb201-short-high-whisper",
    damage: {
      base: 32,
      armor: 38,
    },
    fireRate: 873,
    fireMode: "auto",
    minShotInterval: 68.7,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 47,
        multiplier: 0.85,
      },
      {
        start: 83,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 2.1,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "QJB201 - 短管 - 轻语消音",
    key: "qjb201-short-whisper",
    damage: {
      base: 32,
      armor: 38,
    },
    fireRate: 785,
    fireMode: "auto",
    minShotInterval: 76.4,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 47,
        multiplier: 0.85,
      },
      {
        start: 83,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 2.1,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "M249 - 多口消音",
    key: "m249-multi-suppressor",
    damage: {
      base: 30,
      armor: 38,
    },
    fireRate: 858,
    fireMode: "auto",
    minShotInterval: 69.9,
    burstSize: 0,
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 59,
        multiplier: 0.85,
      },
    ],
  },
  {
    name: "PKM - 长管",
    key: "pkm-long",
    damage: {
      base: 45,
      armor: 42,
    },
    fireRate: 669,
    fireMode: "auto",
    minShotInterval: 89.7,
    burstSize: 0,
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 52,
        multiplier: 0.85,
      },
      {
        start: 91,
        multiplier: 0.7,
      },
    ],
  },

  {
    name: "SVCH - 前三发",
    key: "svch-first-three",
    damage: {
      base: 47,
      armor: 46,
    },
    fireRate: 700,
    fireMode: "auto",
    minShotInterval: 85.7,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 85,
        multiplier: 0.9,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "SVCH - 无爆发枪机",
    key: "svch-no-burst",
    damage: {
      base: 47,
      armor: 46,
    },
    fireRate: 600,
    fireMode: "auto",
    minShotInterval: 100,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 85,
        multiplier: 0.9,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "M14 - 长管",
    key: "m14-long",
    damage: {
      base: 39,
      armor: 41,
    },
    fireRate: 727,
    fireMode: "auto",
    minShotInterval: 82.5,
    burstSize: 0,
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 52,
        multiplier: 0.8,
      },
      {
        start: 91,
        multiplier: 0.7,
      },
    ],
  },
  {
    name: "Vector - 长管 - 回声消音",
    key: "vector-long-echo",
    damage: {
      base: 32,
      armor: 28,
    },
    fireRate: 1091,
    fireMode: "auto",
    minShotInterval: 55,
    burstSize: 0,
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 32,
        multiplier: 0.75,
      },
      {
        start: 43,
        multiplier: 0.65,
      },
      {
        start: 64,
        multiplier: 0.55,
      },
      {
        start: 88,
        multiplier: 0.45,
      },
    ],
  },

  {
    name: "P90 - 长管 - 回声消音",
    key: "p90-long-echo",
    damage: {
      base: 32,
      armor: 35,
    },
    fireRate: 785,
    fireMode: "auto",
    minShotInterval: 76.4,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 46,
        multiplier: 0.85,
      },
      {
        start: 78,
        multiplier: 0.7,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "MP7 - 长管 - 回声消音",
    key: "mp7-long-echo",
    damage: {
      base: 32,
      armor: 28,
    },
    fireRate: 950,
    fireMode: "auto",
    minShotInterval: 63.2,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 32,
        multiplier: 0.75,
      },
      {
        start: 43,
        multiplier: 0.65,
      },
      {
        start: 64,
        multiplier: 0.55,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "QCQ171 - 长管 - 回声消音",
    key: "qcq171-long-echo",
    damage: {
      base: 36,
      armor: 33,
    },
    fireRate: 848,
    fireMode: "auto",
    minShotInterval: 70.8,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 32,
        multiplier: 0.75,
      },
      {
        start: 43,
        multiplier: 0.65,
      },
      {
        start: 64,
        multiplier: 0.55,
      },
      {
        start: 88,
        multiplier: 0.45,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 0.9,
      limbs: 0.4,
    },
  },
  {
    name: "汤姆逊 - 满改 - 4弹",
    key: "thompson-full-4",
    damage: {
      base: 37,
      armor: 37,
    },
    fireRate: 900,
    fireMode: "auto",
    minShotInterval: 66.7,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 29,
        multiplier: 0.85,
      },
      {
        start: 52,
        multiplier: 0.75,
      },
      {
        start: 72,
        multiplier: 0.65,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 1,
      limbs: 0.35,
    },
  },
  {
    name: "汤姆逊 - 满改 - 5弹",
    key: "thompson-full-5",
    damage: {
      base: 31.5,
      armor: 37,
    },
    fireRate: 900,
    fireMode: "auto",
    minShotInterval: 66.7,
    burstSize: 0,
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 29,
        multiplier: 0.85,
      },
      {
        start: 52,
        multiplier: 0.75,
      },
      {
        start: 72,
        multiplier: 0.65,
      },
    ],
    hitMultiplier: {
      head: 1.9,
      chest: 1,
      abdomen: 1,
      limbs: 0.35,
    },
  },
  {
    name: "MK4 - 击剑手 - 赛季弹",
    key: "MK4-jijianshou-saijidan",
    fireMode: "burst",
    damage: {
      base: 34,
      armor: 35,
    },
    fireRate: 793,
    hitMultiplier: {
      head: 2.5,
      chest: 1.25,
      abdomen: 0.9,
      limbs: 0.45,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 26,
        multiplier: 0.9,
      },
      {
        start: 39,
        multiplier: 0.8,
      },
      {
        start: 52,
        multiplier: 0.7,
      },
    ],
    burstSize: 3,
    minShotInterval: 50,
  },
  {
    name: "MK4 - 击剑手",
    key: "MK4-jijianshou",
    fireMode: "burst",
    damage: {
      base: 34,
      armor: 35,
    },
    fireRate: 793,
    hitMultiplier: {
      head: 2,
      chest: 1,
      abdomen: 1,
      limbs: 0.5,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 26,
        multiplier: 0.9,
      },
      {
        start: 39,
        multiplier: 0.8,
      },
      {
        start: 52,
        multiplier: 0.7,
      },
    ],
    burstSize: 3,
    minShotInterval: 50,
  },
  {
    name: "MK4 - 击剑手 - 回声 - 赛季弹",
    key: "MK4-jijianshou-huisheng-saijidan",
    fireMode: "burst",
    damage: {
      base: 34,
      armor: 35,
    },
    fireRate: 793,
    hitMultiplier: {
      head: 2.5,
      chest: 1.25,
      abdomen: 0.9,
      limbs: 0.45,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 32,
        multiplier: 0.9,
      },
      {
        start: 48,
        multiplier: 0.8,
      },
      {
        start: 64,
        multiplier: 0.7,
      },
    ],
    burstSize: 3,
    minShotInterval: 50,
  },
  {
    name: "MK4 - 击剑手 - 回声",
    key: "MK4-jijianshou-huisheng",
    fireMode: "burst",
    damage: {
      base: 34,
      armor: 35,
    },
    fireRate: 793,
    hitMultiplier: {
      head: 2,
      chest: 1,
      abdomen: 1,
      limbs: 0.5,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 32,
        multiplier: 0.9,
      },
      {
        start: 48,
        multiplier: 0.8,
      },
      {
        start: 64,
        multiplier: 0.7,
      },
    ],
    burstSize: 3,
    minShotInterval: 50,
  },
  {
    name: "ASVAl - 刺客",
    key: "ASVAl-cike",
    fireMode: "burst",
    damage: {
      base: 37,
      armor: 48,
    },
    fireRate: 680,
    hitMultiplier: {
      head: 1.7,
      chest: 1,
      abdomen: 1,
      limbs: 0.6,
    },
    range: [
      {
        start: 0,
        multiplier: 1,
      },
      {
        start: 40,
        multiplier: 0.85,
      },
      {
        start: 60,
        multiplier: 0.75,
      },
    ],
    burstSize: 4,
    minShotInterval: 70,
  },
];
