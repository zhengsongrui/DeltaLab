import { SettingOutlined } from '@ant-design/icons'
import { Button, Checkbox, Popover, Space, Typography } from 'antd'

/** 勾选面板中的一个分组：分组标题 + 组内可勾选列 */
export interface ColumnGroup {
  label: string
  options: ReadonlyArray<{ key: string; label: string }>
}

interface ColumnSelectorProps {
  /** 分组后的可选列清单，顺序即面板展示顺序 */
  groups: ReadonlyArray<ColumnGroup>
  /** 当前可见列的 key 集合 */
  value: string[]
  /** 勾选变化时回传新的可见列 key 集合 */
  onChange: (keys: string[]) => void
  /** 触发按钮文案：默认用于列显示，复用为其他勾选面板时传入对应文案 */
  title?: string
}

/**
 * 通用列选择器：点击按钮弹出勾选面板，控制表格展示哪些列。
 * 仅负责呈现与回传选择结果，不关心持久化，便于在其他表格复用。
 */
export default function ColumnSelector({
  groups,
  value,
  onChange,
  title = '列显示',
}: ColumnSelectorProps) {
  /** 面板内容：单个受控 Checkbox.Group 包住所有分组，勾选变化即整体回传 */
  const panel = (
    <Checkbox.Group
      value={value}
      // 限制面板最大高度并在面板内滚动，候选条目很多（如武器名）时不会把面板撑出屏幕
      style={{ display: 'block', maxHeight: '60vh', overflowY: 'auto' }}
      onChange={(keys) => onChange(keys as string[])}
    >
      <Space direction="vertical" size={8}>
        {groups.map((group) => (
          <div key={group.label}>
            {/* 分组小标题，弱化视觉层级；标题为空时不渲染，便于复用为单一勾选面板 */}
            {group.label !== '' && (
              <Typography.Text type="secondary">{group.label}</Typography.Text>
            )}
            <Space direction="vertical" size={0}>
              {group.options.map((option) => (
                <Checkbox key={option.key} value={option.key}>
                  {option.label}
                </Checkbox>
              ))}
            </Space>
          </div>
        ))}
      </Space>
    </Checkbox.Group>
  )

  return (
    <Popover trigger="click" placement="bottomRight" content={panel}>
      <Button icon={<SettingOutlined />}>{title}</Button>
    </Popover>
  )
}
