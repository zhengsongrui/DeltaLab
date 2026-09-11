import { useEffect, useState } from 'react'
import { InputNumber, Modal, Typography } from 'antd'
import type { HitWeight } from '@/utils/dps'
import { toHitRatios } from '@/utils/dps'
import { HITBOX_PART_LABELS } from '../composite'

interface CompositeDpsModalProps {
  /** 弹窗是否可见，由页面控制 */
  open: boolean
  /** 当前已保存的命中权重，打开时作为草稿初值 */
  weights: HitWeight
  /** 取消或关闭弹窗 */
  onCancel: () => void
  /** 保存草稿权重 */
  onSave: (weights: HitWeight) => void
}

/**
 * 综合 DPS 计算设置弹窗
 * 只负责收集四项命中权重并实时展示归一化后的命中占比，不接触持久化；
 * 编辑过程只改本地草稿，点保存才回传页面，取消即丢弃。
 */
export default function CompositeDpsModal({
  open,
  weights,
  onCancel,
  onSave,
}: CompositeDpsModalProps) {
  /** 草稿权重：弹窗内编辑的临时值 */
  const [draft, setDraft] = useState<HitWeight>(weights)

  /** 每次打开以外层已保存权重为初值，避免上次取消时留下的残留 */
  useEffect(() => {
    if (open) setDraft(weights)
  }, [open, weights])

  /** 草稿对应的命中占比，权重一改即重算 */
  const ratios = toHitRatios(draft)

  /** 修改单个部位的权重；输入被清空时按 0 处理，避免出现 NaN */
  function handleChange(part: keyof HitWeight, value: number | null): void {
    setDraft((prev) => ({ ...prev, [part]: value ?? 0 }))
  }

  return (
    <Modal
      title="综合 DPS 计算设置"
      open={open}
      okText="保存"
      cancelText="取消"
      forceRender
      onOk={() => onSave(draft)}
      onCancel={onCancel}
    >
      {/* 每个部位一行：标签 + 权重输入 + 实时推算的命中占比 */}
      {HITBOX_PART_LABELS.map(({ part, label }) => (
        <div
          key={part}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}
        >
          <Typography.Text style={{ width: 96 }}>{label}命中权重</Typography.Text>
          <InputNumber
            min={0}
            step={1}
            value={draft[part]}
            onChange={(value) => handleChange(part, value)}
            style={{ width: 120 }}
          />
          <Typography.Text type="secondary">
            预计命中占比：{(ratios[part] * 100).toFixed(1)}%
          </Typography.Text>
        </div>
      ))}
      {/* 口径说明：固定文案，帮助理解综合 DPS 的来源 */}
      <Typography.Text type="secondary">综合 DPS = 各部位 DPS × 对应命中占比之和</Typography.Text>
    </Modal>
  )
}
