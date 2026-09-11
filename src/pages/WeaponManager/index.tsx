import { useMemo, useState } from 'react'
import { Card, Input } from 'antd'
import AutoHeightTable from '@/components/AutoHeightTable'
import { useAppStore } from '@/store/useAppStore'
import type { WeaponRecord } from '@/types/weapon'
import WeaponFormModal from './components/WeaponFormModal'
import WeaponManagerToolbar from './components/WeaponManagerToolbar'
import { buildColumns } from './columns'
import { useWeaponForm } from './hooks/useWeaponForm'
import { useWeaponTransfer } from './hooks/useWeaponTransfer'

/** 武器管理页：只做装配，表格列、填表弹窗与导入导出逻辑都在各自模块内 */
export default function WeaponManager() {
  /** 武器列表与删除操作来自 store，写入成功后由 store 负责持久化 */
  const weapons = useAppStore((state) => state.weapons)
  const removeWeapon = useAppStore((state) => state.removeWeapon)
  /** 名称搜索关键词：仅影响展示，不修改 store 中的原始数据 */
  const [keyword, setKeyword] = useState('')
  /** 按关键词模糊过滤（忽略大小写与首尾空格），关键词为空时返回完整列表 */
  const filteredWeapons = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    if (!query) return weapons
    return weapons.filter((weapon) => weapon.name.toLowerCase().includes(query))
  }, [weapons, keyword])
  /** 填表弹窗：新增与编辑共用，状态与提交逻辑在 Hook 内 */
  const { open, editing, openCreate, openEdit, close, submit } = useWeaponForm()
  /** 导入导出：选文件、下载、提示与覆盖确认都在 Hook 内 */
  const { exportExcel, exportJson, importFile } = useWeaponTransfer(weapons)

  return (
    // 卡片撑满内容区，表格可在可视区域内滚动，底部横向滚动条始终可见
    <Card
      title="枪械管理"
      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
      extra={
        <WeaponManagerToolbar
          onCreate={openCreate}
          onExportExcel={exportExcel}
          onExportJson={exportJson}
          onImport={(mode) => void importFile(mode)}
        />
      }
    >
        {/* 名称模糊搜索：输入即时过滤，清空按钮一键还原完整列表 */}
      <Input
        allowClear
        placeholder="搜索枪械名称"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        style={{ width: 180 ,marginBottom:10}}
      />
      <AutoHeightTable<WeaponRecord>
        rowKey="id"
        columns={buildColumns(openEdit, removeWeapon)}
        dataSource={filteredWeapons}
        pagination={false}
      />
      <WeaponFormModal open={open} initialWeapon={editing} onCancel={close} onSubmit={submit} />
    </Card>
  )
}
