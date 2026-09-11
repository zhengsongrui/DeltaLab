import { Button, Space, Tooltip } from 'antd'
import type { ImportMode } from '../hooks/useWeaponTransfer'

/** 覆盖导入的悬浮提示：提前告知会清空现有数据，避免用户误点高风险按钮 */
const OVERWRITE_HINT = '将清空现有全部武器数据，仅保留所选文件的内容'

interface WeaponManagerToolbarProps {
  /** 打开新增表单 */
  onCreate: () => void
  /** 导出当前全部武器 */
  onExportExcel: () => void
  onExportJson: () => void
  /** 按模式导入；两种覆盖模式由上层再弹确认框 */
  onImport: (mode: ImportMode) => void
}

/**
 * 武器管理工具栏：按钮全部平铺，并按风险等级配色
 * 只读导出用绿色、中等风险的追加用黄色、高风险的覆盖用红色并给出后果提示；
 * 覆盖的二次确认由 useWeaponTransfer 统一处理，这里只负责提示。
 */
export default function WeaponManagerToolbar({
  onCreate,
  onExportExcel,
  onExportJson,
  onImport,
}: WeaponManagerToolbarProps) {
  return (
    <Space wrap>
    
      {/* 新增/编辑：低风险，保持主题主色 */}
      <Button type="primary" onClick={onCreate}>
        导入枪械
      </Button>
     
      <Button color="green" variant="solid" onClick={onExportJson}>
        导出JSON
      </Button>
      {/* 覆盖导入：红色高风险，悬浮给出后果提示，点击后再二次确认 */}
      <Tooltip title={OVERWRITE_HINT}>
        <Button color="danger" variant="solid" onClick={() => onImport('json-replace')}>
          导入JSON覆盖
        </Button>
      </Tooltip>
       {/* 导出：只读不写，绿色表示无风险 */}
      <Button color="green" variant="solid" onClick={onExportExcel}>
        导出Excel
      </Button>
      <Tooltip title={OVERWRITE_HINT}>
        <Button color="danger" variant="solid" onClick={() => onImport('excel-replace')}>
          导入Excel覆盖
        </Button>
      </Tooltip>
      {/* 追加导入：黄色中等风险，同名覆盖、新名追加 */}
      <Button color="orange" variant="solid" onClick={() => onImport('excel-append')}>
        导入Excel追加
      </Button>
      
    </Space>
  )
}
