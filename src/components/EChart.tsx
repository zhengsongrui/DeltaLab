import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface EChartProps {
  /** ECharts 配置项，变化时自动重绘 */
  option: EChartsOption
  /** 图表容器高度，可为像素数字或任意 CSS 长度（如 '100%'、'80vh'），宽度撑满父容器 */
  height: number | string
}

/**
 * 通用 ECharts 封装组件
 * 只负责实例的创建与销毁、配置更新与尺寸自适应，不含任何业务逻辑，便于任意图表复用。
 * 调用方只需传入 option 与高度，其余交由组件内部维护。
 */
export default function EChart({ option, height }: EChartProps) {
  /** 图表容器 DOM */
  const containerRef = useRef<HTMLDivElement>(null)
  /** ECharts 实例，挂在 ref 上避免重渲染时重复初始化 */
  const chartRef = useRef<echarts.ECharts>()

  /** 挂载时初始化实例并监听容器尺寸变化；卸载时停止监听并销毁实例 */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = echarts.init(container)
    chartRef.current = chart

    // 容器尺寸变化（如弹窗展开、窗口缩放）时重算画布，避免图表被拉伸变形
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(container)

    return () => {
      observer.disconnect()
      chart.dispose()
      chartRef.current = undefined
    }
  }, [])

  /** 配置变化时重绘；notMerge 为 true 避免残留上一次的系列数据 */
  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  return <div ref={containerRef} style={{ width: '100%', height }} />
}
