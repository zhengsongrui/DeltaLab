import { useEffect, useState } from 'react'
import { InputNumber, Modal, Typography } from 'antd'
import { MAX_BURST_ROUNDS, MIN_BURST_ROUNDS } from '../hooks/useBurstRounds'

interface BurstControlModalProps {
  /** 弹窗是否可见，由页面控制 */
  open: boolean
  /** 当前已保存的轮数，打开时作为草稿初值 */
  rounds: number
  /** 取消或关闭弹窗 */
  onCancel: () => void
  /** 保存草稿轮数 */
  onSave: (rounds: number) => void
}

/**
 * 连发模式武器控制弹窗
 * 只有一个设置项：连发武器在表格中展开展示的累计轮数 X。
 * 只负责收集该数值，不接触持久化；编辑过程只改本地草稿，点保存才回传页面，取消即丢弃。
 */
export default function BurstControlModal({
  open,
  rounds,
  onCancel,
  onSave,
}: BurstControlModalProps) {
  /** 草稿轮数：弹窗内编辑的临时值 */
  const [draft, setDraft] = useState<number>(rounds)

  /** 每次打开以外层已保存值为初值，避免上次取消时留下的残留 */
  useEffect(() => {
    if (open) setDraft(rounds)
  }, [open, rounds])

  return (
    <Modal
      title="连发模式武器控制"
      open={open}
      okText="保存"
      cancelText="取消"
      forceRender
      onOk={() => onSave(draft)}
      onCancel={onCancel}
    >
      {/* 唯一的设置项：输入被清空时按下限处理，避免出现空值 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Typography.Text style={{ width: 200 }}>显示连发武器前X轮DPS</Typography.Text>
        <InputNumber
          min={MIN_BURST_ROUNDS}
          max={MAX_BURST_ROUNDS}
          step={1}
          precision={0}
          value={draft}
          onChange={(value) => setDraft(value ?? MIN_BURST_ROUNDS)}
          style={{ width: 120 }}
        />
      </div>
      {/* 口径说明：讲清 X 的作用范围，非连发武器不受影响 */}
      <Typography.Text type="secondary">
        仅对开火模式为连发的武器生效：每把连发武器会展开为 X 条数据，分别展示累计 1 轮至 X
        轮的等效射速与 DPS
      </Typography.Text>
    </Modal>
  )
}
