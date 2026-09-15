import type { CSSProperties } from 'react'
import { Button, Card, Space, Tag, Typography } from 'antd'
import type { ResolvedFireSegment } from '@/types/fireInterval'
import SegmentStatsText from './SegmentStatsText'

/** 数值只读展示的排版：小字号，与统计文案保持一致的视觉层级 */
const VALUE_STYLE: CSSProperties = { fontSize: 13 }

interface WeaponSegmentCardProps {
  /** 由武器库实时解析出的线段 */
  segment: ResolvedFireSegment
  /** 与对比区一致的取色 */
  color: string
  /** 删除该线段（移出对比） */
  onRemove: () => void
}

/**
 * 导入武器线段卡片（只读）
 * 名称、类型与全部数值都来自武器库的实时解析结果，因此界面不提供任何输入控件，
 * 所有数据均不可修改；仅保留「删除」按钮，用于把该武器移出对比。
 */
export default function WeaponSegmentCard({ segment, color, onRemove }: WeaponSegmentCardProps) {
  const isBurst = segment.burstSize >= 1

  return (
    <Card
      size="small"
      style={{ borderLeft: `4px solid ${color}` }}
      styles={{ body: { padding: 12 } }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space wrap>
          <Typography.Text strong>{segment.name}</Typography.Text>
          <Tag color="blue">{segment.modeLabel}</Tag>
          <Typography.Text type="secondary" style={VALUE_STYLE}>
            来自武器库 · 只读
          </Typography.Text>
          <Button danger type="text" onClick={onRemove}>
            删除
          </Button>
        </Space>

        {/* 数值仅作展示，不提供任何输入控件，确保导入数据不可修改 */}
        <Space wrap>
          {isBurst ? (
            <>
              <Typography.Text style={VALUE_STYLE}>连发发数 {segment.burstSize} 发</Typography.Text>
              <Typography.Text style={VALUE_STYLE}>
                连发内间隔 {segment.burstInterval} ms
              </Typography.Text>
              <Typography.Text style={VALUE_STYLE}>
                官方射速 {segment.officialRpm} RPM
              </Typography.Text>
            </>
          ) : (
            <Typography.Text style={VALUE_STYLE}>射速 {segment.fireRate} RPM</Typography.Text>
          )}
        </Space>

        <SegmentStatsText timing={segment} />
      </Space>
    </Card>
  )
}
