import { useEffect, useMemo, useState } from 'react'
import { Modal, Segmented, Space, Typography } from 'antd'
import type { EChartsOption } from 'echarts'
import EChart from '@/components/EChart'
import type { Weapon } from '@/types/weapon'
import { getRangeMultiplier } from '@/utils/dps'
import type { HitWeight } from '@/utils/dps'
import { buildDpsPoints, CHART_MAX_DISTANCE, CURVE_OPTIONS } from '../chart'
import type { CurveMetric } from '../chart'
import ColumnSelector from './ColumnSelector'
import type { ColumnGroup } from './ColumnSelector'

interface DpsChartModalProps {
  /** 弹窗是否可见，由页面控制 */
  open: boolean
  /**
   * 可选枪械清单，已由页面按连发轮数展开且不依赖距离
   * 连发枪械的 name 已带上轮次标识（如「AK47 2轮3连发」），图表以名称区分同枪不同轮次的曲线
   */
  weapons: readonly Weapon[]
  /** 综合 DPS 的命中权重，与表格共用，保证口径一致 */
  weights: HitWeight
  /** 关闭弹窗 */
  onCancel: () => void
}

/**
 * 图表对比弹窗：对比多把枪械的 DPS 随距离变化曲线
 * 候选枪械由页面按当前连发轮数展开（名称含轮次标识），因此同一把连发枪械的不同轮次可各画一条曲线；
 * 单选曲线类型（默认综合 DPS），勾选任意枪械（默认不选）即为其叠加一条同类型折线；
 * 折线采用阶梯模式，DPS 在射程段边界垂直跳变，直观呈现断崖式衰减。
 */
export default function DpsChartModal({ open, weapons, weights, onCancel }: DpsChartModalProps) {
  /** 当前曲线类型，默认综合 DPS */
  const [metric, setMetric] = useState<CurveMetric>('composite')
  /** 已勾选的枪械名，默认不选任何枪械 */
  const [selectedNames, setSelectedNames] = useState<string[]>([])

  /** 每次打开重置为默认状态：综合 DPS 且不选枪械 */
  useEffect(() => {
    if (!open) return
    setMetric('composite')
    setSelectedNames([])
  }, [open])

  /** 枪械勾选面板只含一个无标题分组，直接复用列选择器实现 */
  const weaponGroups: ReadonlyArray<ColumnGroup> = [
    { label: '', options: weapons.map((weapon) => ({ key: weapon.name, label: weapon.name })) },
  ]

  /** 图表配置：按曲线类型与已选枪械重算，未选枪械时无系列数据 */
  const option = useMemo<EChartsOption>(() => {
    const selected = weapons.filter((weapon) => selectedNames.includes(weapon.name))
    return {
      tooltip: {
        trigger: 'axis',
        // 自定义提示：显示带单位的距离，以及各枪械在该距离下的 DPS 与射程衰减倍率
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params]
          const distance = list[0]?.value?.[0] ?? 0
          const lines = [`距离：${distance} 米后`]
          list.forEach((item: any) => {
            const weapon = weapons.find((entry) => entry.name === item.seriesName)
            const multiplier = weapon ? getRangeMultiplier(weapon, distance) : 0
            lines.push(`${item.marker}${item.seriesName}：DPS ${item.value[1]}，衰减倍率 ${multiplier}`)
          })
          return lines.join('<br/>')
        },
      },
      // 图例置于底部并与 X 轴留出间距，避免与坐标刻度重叠
      legend: { bottom: 0, data: selected.map((weapon) => weapon.name) },
      grid: { left: 64, right: 24, top: 48, bottom: 64 },
      // X 轴固定 0-100 米，与射程条同口径；Y 轴为 DPS；两轴均隐藏分割线（对齐线），保持画面简洁
      xAxis: {
        type: 'value',
        name: '距离(米)',
        min: 0,
        max: CHART_MAX_DISTANCE,
        interval: 10,
        splitLine: { show: false },
        // 坐标轴指示器标签补上单位
        axisPointer: { label: { formatter: '{value} 米' } },
      },
      yAxis: { type: 'value', name: 'DPS', splitLine: { show: false } },
      series: selected.map((weapon) => {
        const points = buildDpsPoints(weapon, metric, weights)
        return {
          name: weapon.name,
          type: 'line' as const,
          // 阶梯模式：水平保持当前段倍率，到段边界垂直跳变，形成断崖折线
          step: 'end' as const,
          // 默认不逐点显示标签，仅在起点单独开启，避免折线被文字淹没
          label: { show: false },
          data: points.map((point, index) =>
            // 最左端（X=0，紧邻 Y 轴）标注该折线对应的枪械名称，方便直接识别曲线归属
            index === 0
              ? { value: point, label: { show: true, formatter: weapon.name, position: 'right' } }
              : point,
          ),
        }
      }),
    }
  }, [weapons, selectedNames, metric, weights])

  return (
    <Modal
      title="图表对比"
      open={open}
      width="80vw"
      footer={null}
      onCancel={onCancel}
    >
      <Space style={{ marginBottom: 16 }}>
        <Typography.Text>曲线类型</Typography.Text>
        <Segmented<CurveMetric>
          options={[...CURVE_OPTIONS]}
          value={metric}
          onChange={setMetric}
        />
        <ColumnSelector
          title="选择枪械"
          groups={weaponGroups}
          value={selectedNames}
          onChange={setSelectedNames}
        />
      </Space>
      {/* 图表高度取视窗高 80% 再扣除弹窗头部与工具栏占位，使弹窗整体接近视窗 80% 高 */}
      <EChart option={option} height="calc(80vh - 150px)" />
    </Modal>
  )
}
