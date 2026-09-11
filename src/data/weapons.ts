import type { Weapon } from '@/types/weapon'

/**
 * 枪械静态数据
 * 手工维护，后续可直接增删数组项或替换数值，页面无需改动。
 */
export const weapons: readonly Weapon[] = [
  {
    "name": "ASVAL - 海啸",
    "damage": {
      "base": 28,
      "armor": 44
    },
    "fireRate": 972,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 27,
        "multiplier": 0.9
      },
      {
        "start": 54,
        "multiplier": 0.8
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "MK4 - 1轮3连发 - 赛季弹",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 1172,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.5,
      "chest": 1.25,
      "abdomen": 0.9,
      "limbs": 0.45
    }
  },
  {
    "name": "MK4 - 1轮3连发",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 1172,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.5
    }
  },
  {
    "name": "汤姆逊 - 满改 - 4弹",
    "damage": {
      "base": 37,
      "armor": 37
    },
    "fireRate": 900,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 29,
        "multiplier": 0.85
      },
      {
        "start": 52,
        "multiplier": 0.75
      },
      {
        "start": 72,
        "multiplier": 0.65
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.35
    }
  },
  {
    "name": "汤姆逊 - 满改 - 5弹",
    "damage": {
      "base": 31.5,
      "armor": 37
    },
    "fireRate": 900,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 29,
        "multiplier": 0.85
      },
      {
        "start": 52,
        "multiplier": 0.75
      },
      {
        "start": 72,
        "multiplier": 0.65
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.35
    }
  },
  {
    "name": "SVCH - 前三发",
    "damage": {
      "base": 47,
      "armor": 46
    },
    "fireRate": 700,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 85,
        "multiplier": 0.9
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "MK4 - 2轮3连发 - 赛季弹",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 880,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.5,
      "chest": 1.25,
      "abdomen": 0.9,
      "limbs": 0.45
    }
  },
  {
    "name": "MK4 - 2轮3连发",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 880,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.5
    }
  },
  {
    "name": "MK4 - 3轮3连发 - 赛季弹",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 840,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.5,
      "chest": 1.25,
      "abdomen": 0.9,
      "limbs": 0.45
    }
  },
  {
    "name": "MK4 - 3轮3连发",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 840,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.5
    }
  },
  {
    "name": "MK47 - 鏖战",
    "damage": {
      "base": 46,
      "armor": 47
    },
    "fireRate": 625,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 25,
        "multiplier": 0.85
      },
      {
        "start": 40,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "MK4 - 4轮3连发 - 赛季弹",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 820,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.5,
      "chest": 1.25,
      "abdomen": 0.9,
      "limbs": 0.45
    }
  },
  {
    "name": "MK4 - 4轮3连发",
    "damage": {
      "base": 34,
      "armor": 35
    },
    "fireRate": 820,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 26,
        "multiplier": 0.9
      },
      {
        "start": 39,
        "multiplier": 0.8
      },
      {
        "start": 52,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.5
    }
  },
  {
    "name": "SVCH - 无爆发枪机",
    "damage": {
      "base": 47,
      "armor": 46
    },
    "fireRate": 600,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 85,
        "multiplier": 0.9
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "ASH - 歼灭",
    "damage": {
      "base": 56,
      "armor": 55
    },
    "fireRate": 500,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 72,
        "multiplier": 0.9
      }
    ],
    "hitMultiplier": {
      "head": 1.6,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.45
    }
  },
  {
    "name": "K437 - 长管",
    "damage": {
      "base": 36,
      "armor": 35
    },
    "fireRate": 780,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 53,
        "multiplier": 0.9
      },
      {
        "start": 90,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "M7 - 堤风",
    "damage": {
      "base": 39,
      "armor": 42
    },
    "fireRate": 649,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 65,
        "multiplier": 0.9
      },
      {
        "start": 91,
        "multiplier": 0.8
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 1,
      "limbs": 0.35
    }
  },
  {
    "name": "AUG - 集成3倍",
    "damage": {
      "base": 32,
      "armor": 35
    },
    "fireRate": 679,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 58,
        "multiplier": 0.9
      },
      {
        "start": 96,
        "multiplier": 0.8
      }
    ],
    "hitMultiplier": {
      "head": 1.8875,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "93R - 鼬鼠",
    "damage": {
      "base": 34,
      "armor": 32
    },
    "fireRate": 671,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 32,
        "multiplier": 0.8
      },
      {
        "start": 64,
        "multiplier": 0.65
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "ASH - 战斧",
    "damage": {
      "base": 75,
      "armor": 40
    },
    "fireRate": 400,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 55,
        "multiplier": 0.9
      },
      {
        "start": 90,
        "multiplier": 0.8
      }
    ],
    "hitMultiplier": {
      "head": 1.75,
      "chest": 1,
      "abdomen": 0.7,
      "limbs": 0.25
    }
  },
  {
    "name": "K416 - 长管 - 轻语消音",
    "damage": {
      "base": 31,
      "armor": 35
    },
    "fireRate": 880,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 40,
        "multiplier": 0.85
      },
      {
        "start": 80,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "MDR - 长管",
    "damage": {
      "base": 41,
      "armor": 43
    },
    "fireRate": 650,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 46,
        "multiplier": 0.85
      },
      {
        "start": 65,
        "multiplier": 0.75
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "腾龙 - 长管 - 高导",
    "damage": {
      "base": 35,
      "armor": 38
    },
    "fireRate": 759,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 46,
        "multiplier": 0.9
      },
      {
        "start": 81,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.1,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "KC17 - 短管",
    "damage": {
      "base": 31,
      "armor": 48
    },
    "fireRate": 740,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 55,
        "multiplier": 0.85
      },
      {
        "start": 90,
        "multiplier": 0.8
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "M4A1 - 长管",
    "damage": {
      "base": 31,
      "armor": 33
    },
    "fireRate": 800,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 52,
        "multiplier": 0.85
      },
      {
        "start": 92,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "G3 - 短管",
    "damage": {
      "base": 39,
      "armor": 42
    },
    "fireRate": 533,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 55,
        "multiplier": 0.9
      },
      {
        "start": 90,
        "multiplier": 0.8
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "AK47 - 腰射",
    "damage": {
      "base": 40,
      "armor": 42
    },
    "fireRate": 600,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 42,
        "multiplier": 0.85
      },
      {
        "start": 74,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.5,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "P90 - 长管 - 回声消音",
    "damage": {
      "base": 32,
      "armor": 35
    },
    "fireRate": 785,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 46,
        "multiplier": 0.85
      },
      {
        "start": 78,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "MP7 - 长管 - 回声消音",
    "damage": {
      "base": 32,
      "armor": 28
    },
    "fireRate": 950,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 32,
        "multiplier": 0.75
      },
      {
        "start": 43,
        "multiplier": 0.65
      },
      {
        "start": 64,
        "multiplier": 0.55
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "QCQ171 - 长管 - 回声消音",
    "damage": {
      "base": 36,
      "armor": 33
    },
    "fireRate": 848,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 32,
        "multiplier": 0.75
      },
      {
        "start": 43,
        "multiplier": 0.65
      },
      {
        "start": 64,
        "multiplier": 0.55
      },
      {
        "start": 88,
        "multiplier": 0.45
      }
    ],
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "QJB201 - 短管 - 高导 - 轻语消音",
    "damage": {
      "base": 32,
      "armor": 38
    },
    "fireRate": 873,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 47,
        "multiplier": 0.85
      },
      {
        "start": 83,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.1,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "QJB201 - 短管 - 轻语消音",
    "damage": {
      "base": 32,
      "armor": 38
    },
    "fireRate": 785,
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 47,
        "multiplier": 0.85
      },
      {
        "start": 83,
        "multiplier": 0.7
      }
    ],
    "hitMultiplier": {
      "head": 2.1,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    }
  },
  {
    "name": "M249 - 多口消音",
    "damage": {
      "base": 30,
      "armor": 38
    },
    "fireRate": 858,
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    },
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 59,
        "multiplier": 0.85
      }
    ]
  },
  {
    "name": "PKM - 长管",
    "damage": {
      "base": 45,
      "armor": 42
    },
    "fireRate": 669,
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    },
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 52,
        "multiplier": 0.85
      },
      {
        "start": 91,
        "multiplier": 0.7
      }
    ]
  },
  {
    "name": "M14 - 长管",
    "damage": {
      "base": 39,
      "armor": 41
    },
    "fireRate": 727,
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    },
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 52,
        "multiplier": 0.8
      },
      {
        "start": 91,
        "multiplier": 0.7
      }
    ]
  },
  {
    "name": "SCARH - 长管",
    "damage": {
      "base": 40,
      "armor": 41
    },
    "fireRate": 585,
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.5
    },
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 52,
        "multiplier": 0.9
      },
      {
        "start": 91,
        "multiplier": 0.75
      }
    ]
  },
  {
    "name": "Vector - 长管 - 回声消音",
    "damage": {
      "base": 32,
      "armor": 28
    },
    "fireRate": 1091,
    "hitMultiplier": {
      "head": 1.9,
      "chest": 1,
      "abdomen": 0.9,
      "limbs": 0.4
    },
    "range": [
      {
        "start": 0,
        "multiplier": 1
      },
      {
        "start": 32,
        "multiplier": 0.75
      },
      {
        "start": 43,
        "multiplier": 0.65
      },
      {
        "start": 64,
        "multiplier": 0.55
      },
      {
        "start": 88,
        "multiplier": 0.45
      }
    ]
  }
]

