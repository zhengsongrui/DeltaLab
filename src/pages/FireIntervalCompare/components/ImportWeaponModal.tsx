import { useEffect, useMemo, useState } from 'react'
import { Checkbox, Empty, Modal, Space, Tag, Typography } from 'antd'
import type { WeaponRecord } from '@/types/weapon'

interface ImportWeaponModalProps {
  /** 弹窗是否可见，由页面控制 */
  open: boolean
  /** 武器库全部武器，来自 store，与枪械管理页共用同一份数据 */
  weapons: readonly WeaponRecord[]
  /** 已导入的武器 id，面板中置灰以避免重复导入 */
  importedWeaponIds: readonly string[]
  /** 确认导入：回传本次勾选的武器 id */
  onImport: (weaponIds: string[]) => void
  /** 取消导入 */
  onCancel: () => void
}

/**
 * 导入武器弹窗
 * 列出武器库全部武器并支持勾选多选；已导入项置灰不可重复选择。
 * 仅负责选择与回传 id，导入后的线段生成与持久化由页面与 Hook 处理。
 */
export default function ImportWeaponModal({
  open,
  weapons,
  importedWeaponIds,
  onImport,
  onCancel,
}: ImportWeaponModalProps) {
  /** 本次勾选的武器 id，默认不选 */
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  /** 每次打开重置选择，避免上一次的残留选择被误导入 */
  useEffect(() => {
    if (open) setSelectedIds([])
  }, [open])

  /** 已导入集合：用于置灰候选与快速成员判断 */
  const importedSet = useMemo(() => new Set(importedWeaponIds), [importedWeaponIds])

  return (
    <Modal
      title="导入武器"
      open={open}
      okText="导入"
      cancelText="取消"
      // 未勾选任何武器时禁用确认，避免空导入
      okButtonProps={{ disabled: selectedIds.length === 0 }}
      onOk={() => onImport(selectedIds)}
      onCancel={onCancel}
    >
      {weapons.length === 0 ? (
        <Empty description="武器库暂无武器" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>
          <Typography.Text type="secondary">
            导入后的武器数据只读，不可修改；已导入的武器不可重复选择。
          </Typography.Text>
          <Checkbox.Group
            value={selectedIds}
            onChange={(keys) => setSelectedIds(keys as string[])}
            // 限制面板最大高度并在面板内滚动，武器较多时不会把弹窗撑出屏幕
            style={{ display: 'block', marginTop: 12, maxHeight: '50vh', overflowY: 'auto' }}
          >
            <Space direction="vertical" size={4}>
              {weapons.map((weapon) => {
                const imported = importedSet.has(weapon.id)
                return (
                  <Checkbox key={weapon.id} value={weapon.id} disabled={imported}>
                    {weapon.name}
                    {imported && <Tag style={{ marginLeft: 8 }}>已导入</Tag>}
                  </Checkbox>
                )
              })}
            </Space>
          </Checkbox.Group>
        </>
      )}
    </Modal>
  )
}
