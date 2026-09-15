/**
 * 内置武器数据升级（三方合并）
 * 目标：程序升级后，内置数据的变化能自动同步给老用户，同时不覆盖用户自己的数据。
 *
 * 判定依据是「数值指纹」：
 * - 记录里的 seedHash 保存了「上次与内置同步时」内置数据的指纹
 * - 用当前记录实算指纹与 seedHash 比对，即可判断用户是否改动过该内置条目
 *
 * 合并规则：
 * - 内置条目未被改动：跟随新版内置数据更新数值，或在新版中被删除时一并移除
 * - 内置条目已被改动：保留用户数值，并脱离内置身份（降级为用户数据）
 * - 用户自建 / 导入的条目：原样保留
 * - 新版新增的内置条目：追加；若用户曾删除过（墓碑）或以同名条目存在，则跳过
 *
 * 本模块为纯函数，不依赖 store，便于单独验证。
 */
import type { Weapon, WeaponRecord, WeaponSeed } from '@/types/weapon'
import { createWeaponId } from '@/utils/weaponId'

/**
 * 新旧指纹口径共用的基础字段部分
 * 拼接顺序即指纹内容，一经发布不可调整，否则会与已存的 seedHash 全部失配。
 */
function fingerprintParts(weapon: Weapon): Array<string | number> {
  const range = weapon.range.map((segment) => `${segment.start}:${segment.multiplier}`).join(',')
  const { head, chest, abdomen, limbs } = weapon.hitMultiplier
  return [
    weapon.name,
    weapon.damage.base,
    weapon.damage.armor,
    weapon.fireRate,
    range,
    head,
    chest,
    abdomen,
    limbs,
  ]
}

/**
 * 新增开火参数之前的旧指纹口径
 * 老用户记录里的 seedHash 由旧口径生成，升级后必须仍能与其比对，
 * 否则全部内置条目会被误判为「用户已改动」而降级，永久失去内置数据同步能力。
 */
function legacyFingerprint(weapon: Weapon): string {
  return fingerprintParts(weapon).join('|')
}

/**
 * 计算武器数值指纹
 * 覆盖全部会影响展示与 DPS 的字段（含名称与开火参数），因此「改数值」与「改名」都算用户改动；
 * 只要记录指纹与 seedHash 不一致，即认为用户已改动过该内置条目。
 */
export function weaponFingerprint(weapon: Weapon): string {
  return [...fingerprintParts(weapon), weapon.fireMode, weapon.minShotInterval, weapon.burstSize].join(
    '|',
  )
}

/** 判断内置条目是否被用户改动过：新旧两套口径任一与基线一致，即视为「用户没动过」 */
function isModifiedByUser(record: WeaponRecord): boolean {
  if (record.seedHash === undefined) return true
  return (
    weaponFingerprint(record) !== record.seedHash && legacyFingerprint(record) !== record.seedHash
  )
}

/** 去掉内置种子上的 key，只取纯武器数值，避免 key 混入存储记录 */
function toWeapon(seed: WeaponSeed): Weapon {
  return {
    name: seed.name,
    damage: seed.damage,
    fireMode: seed.fireMode,
    fireRate: seed.fireRate,
    minShotInterval: seed.minShotInterval,
    burstSize: seed.burstSize,
    range: seed.range,
    hitMultiplier: seed.hitMultiplier,
  }
}

/** 由内置种子构造一条内置记录：沿用指定 id，并记录当前内置指纹作为基线 */
function toSeedRecord(seed: WeaponSeed, id: string): WeaponRecord {
  return {
    ...toWeapon(seed),
    id,
    source: 'builtin',
    seedKey: seed.key,
    seedHash: weaponFingerprint(seed),
  }
}

/** 判断记录是否为可追踪的内置条目（用户数据没有 seedKey，天然不会命中） */
function isTrackedSeed(record: WeaponRecord): boolean {
  return record.source === 'builtin' && typeof record.seedKey === 'string'
}

/** 将内置条目降级为用户数据：清空内置身份，此后不再参与升级覆盖 */
function withoutSeedMeta(record: WeaponRecord): WeaponRecord {
  return { ...record, source: 'user', seedKey: undefined, seedHash: undefined }
}

export interface SeedMergeResult {
  /** 合并后的完整武器列表，可直接写入 store */
  records: WeaponRecord[]
  /** 合并后的墓碑列表：用户主动删除过的内置 key，用于避免升级时复活 */
  removedKeys: string[]
}

/**
 * 将当前版本的内置种子数据合并进用户记录
 * @param records 本地已存记录
 * @param removedKeys 本地墓碑：用户删除过的内置 key
 * @param seeds 当前版本的内置种子数据
 */
export function mergeWithSeed(
  records: WeaponRecord[],
  removedKeys: string[],
  seeds: readonly WeaponSeed[],
): SeedMergeResult {
  const seedByKey = new Map(seeds.map((seed) => [seed.key, seed]))
  const removed = new Set(removedKeys)
  /** 已在第一轮处理过的内置 key，避免第二轮重复追加 */
  const consumedKeys = new Set<string>()
  const merged: WeaponRecord[] = []

  /* 第一轮：逐条处理本地记录，决定「更新 / 保留 / 删除」 */
  for (const record of records) {
    // 用户自建或导入的条目：完全不动
    if (!isTrackedSeed(record)) {
      merged.push(record)
      continue
    }

    const seedKey = record.seedKey as string
    const seed = seedByKey.get(seedKey)
    // 指纹与基线不一致即视为用户改动过（含旧指纹口径兼容）
    const modified = isModifiedByUser(record)

    if (!seed) {
      // 该条目已从新版内置数据中移除
      if (modified) {
        // 用户改过 → 保留并降级为用户数据，不再是内置条目
        merged.push(withoutSeedMeta(record))
      } else {
        // 用户没动过 → 跟随新版删除；顺带清理可能残留的墓碑
        removed.delete(seedKey)
      }
      continue
    }

    consumedKeys.add(seedKey)
    // 用户没动过 → 应用新版数值（保留原 id）；用户改过 → 保留用户数值
    merged.push(modified ? record : toSeedRecord(seed, record.id))
  }

  /* 第二轮：补齐新版新增的内置条目 */
  for (const seed of seeds) {
    // 已存在（含被保留用户值的）条目不再追加
    if (consumedKeys.has(seed.key)) continue
    // 用户删除过 → 不复活
    if (removed.has(seed.key)) continue
    // 用户已有同名条目 → 跳过，避免表格出现重名
    if (merged.some((item) => item.name === seed.name)) continue
    merged.push(toSeedRecord(seed, createWeaponId()))
  }

  return { records: merged, removedKeys: [...removed] }
}
