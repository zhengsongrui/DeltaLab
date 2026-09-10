import { useState } from 'react'
import { App } from 'antd'
import { useAppStore } from '@/store/useAppStore'
import type { Weapon, WeaponRecord } from '@/types/weapon'

/**
 * 武器填表弹窗 Hook
 * 新增与编辑共用同一个弹窗，因此把「弹窗开关 + 编辑目标 + 提交落库」收在一处，
 * 页面只需把返回值接到按钮与弹窗上；持久化由 store 负责，本 Hook 不做数据换算。
 */
export function useWeaponForm() {
  const addWeapon = useAppStore((state) => state.addWeapon)
  const updateWeapon = useAppStore((state) => state.updateWeapon)
  /** 由 App.tsx 的 antd App 提供，保证提示能拿到当前主题上下文 */
  const { message } = App.useApp()

  /** 填表弹窗开关 */
  const [open, setOpen] = useState(false)
  /** 编辑目标：null 表示新增 */
  const [editing, setEditing] = useState<WeaponRecord | null>(null)

  /** 新增：清空编辑目标后打开弹窗 */
  function openCreate(): void {
    setEditing(null)
    setOpen(true)
  }

  /** 编辑：记录当前行，与新增共用同一个弹窗 */
  function openEdit(record: WeaponRecord): void {
    setEditing(record)
    setOpen(true)
  }

  /** 关闭弹窗并清空编辑目标，避免下次打开残留 */
  function close(): void {
    setOpen(false)
    setEditing(null)
  }

  /** 提交：编辑走更新，新增走追加 */
  function submit(weapon: Weapon): void {
    if (editing) {
      updateWeapon(editing.id, weapon)
      message.success('武器已更新')
    } else {
      addWeapon(weapon)
      message.success('武器已导入')
    }
    close()
  }

  return { open, editing, openCreate, openEdit, close, submit }
}
