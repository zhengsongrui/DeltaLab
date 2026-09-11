import { App } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import type { Weapon, WeaponRecord } from '@/types/weapon'
import { downloadBlob, pickFile } from '@/utils/fileTransfer'
import {
  mergeWeaponsByName,
  parseWeaponsJsonText,
  readSheetRows,
  sheetRowsToWeapons,
  weaponsToJsonText,
  weaponsToXlsxBlob,
} from '@/utils/weaponIO'

/** 导入模式：JSON 覆盖全部 / Excel 追加 / Excel 覆盖全部 */
export type ImportMode = 'json-replace' | 'excel-append' | 'excel-replace'

/** 文件名用的时间戳，形如 20260910-1639 */
function dateStamp(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  return `${date}-${pad(now.getHours())}${pad(now.getMinutes())}`
}

/**
 * 武器数据导入导出 Hook
 * 收拢三个动作的全部副作用：选文件、下载、提示与覆盖确认。
 * 纯数据换算仍在 utils/weaponIO.ts，本 Hook 只负责串联与反馈。
 */
export function useWeaponTransfer(weapons: WeaponRecord[]) {
  const setWeapons = useAppStore((state) => state.setWeapons)
  /** 由 App.tsx 的 antd App 提供，message 与 modal 才不会脱离主题上下文 */
  const { message, modal } = App.useApp()

  /** 导出前统一拦截空列表，避免下载出无意义的空表 */
  function hasWeapons(): boolean {
    if (weapons.length > 0) return true
    message.warning('当前没有可导出的枪械')
    return false
  }

  /** 导出当前全部武器为 Excel 表 */
  function exportExcel(): void {
    if (!hasWeapons()) return
    downloadBlob(weaponsToXlsxBlob(weapons), `枪械数据-${dateStamp()}.xlsx`)
  }

  /** 导出当前全部武器为 JSON */
  function exportJson(): void {
    if (!hasWeapons()) return
    const blob = new Blob([weaponsToJsonText(weapons)], { type: 'application/json' })
    downloadBlob(blob, `枪械数据-${dateStamp()}.json`)
  }

  /**
   * 导入流程：选文件 → 解析校验 → 合并 → 按模式写入
   * 追加模式直接写入；覆盖模式先二次确认，避免误操作丢失数据
   */
  async function importFile(mode: ImportMode): Promise<void> {
    const isJson = mode === 'json-replace'
    const file = await pickFile(isJson ? '.json,application/json' : '.xlsx,.xls')
    // 用户取消选择
    if (!file) return

    let incoming: Weapon[]
    try {
      incoming = isJson
        ? parseWeaponsJsonText(await file.text())
        : sheetRowsToWeapons(readSheetRows(await file.arrayBuffer()))
    } catch (error) {
      // 解析或校验失败：原数据保持不变，只提示原因
      message.error(error instanceof Error ? error.message : '文件解析失败')
      return
    }

    const merged = mergeWeaponsByName(weapons, incoming)
    const summary = `新增 ${merged.added} 条，更新 ${merged.updated} 条`

    if (mode === 'excel-append') {
      setWeapons(merged.appended)
      message.success(`追加完成：${summary}`)
      return
    }

    // 两个覆盖入口共用同一段确认逻辑，保证提示与按钮样式一致
    modal.confirm({
      title: '确认覆盖全枪械数据？',
      content: `当前 ${weapons.length} 条，导入后 ${merged.replaced.length} 条，将移除 ${merged.removed} 条现有数据。`,
      okText: '覆盖',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setWeapons(merged.replaced)
        message.success(`覆盖完成：${summary}，移除 ${merged.removed} 条`)
      },
    })
  }

  return { exportExcel, exportJson, importFile }
}
