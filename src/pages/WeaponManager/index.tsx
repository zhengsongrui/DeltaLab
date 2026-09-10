import { Card, Table } from 'antd'
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
  /** 填表弹窗：新增与编辑共用，状态与提交逻辑在 Hook 内 */
  const { open, editing, openCreate, openEdit, close, submit } = useWeaponForm()
  /** 导入导出：选文件、下载、提示与覆盖确认都在 Hook 内 */
  const { exportExcel, exportJson, importFile } = useWeaponTransfer(weapons)

  return (
    <Card
      title="武器管理"
      extra={
        <WeaponManagerToolbar
          onCreate={openCreate}
          onExportExcel={exportExcel}
          onExportJson={exportJson}
          onImport={(mode) => void importFile(mode)}
        />
      }
    >
      <Table<WeaponRecord>
        rowKey="id"
        columns={buildColumns(openEdit, removeWeapon)}
        dataSource={weapons}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <WeaponFormModal open={open} initialWeapon={editing} onCancel={close} onSubmit={submit} />
    </Card>
  )
}
