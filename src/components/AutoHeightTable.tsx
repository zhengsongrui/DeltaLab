import { useEffect, useRef, useState } from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'

/**
 * 自适应高度的表格：外层容器撑满父级剩余空间，并给表格体设置 scroll.y，
 * 让表格在容器内部纵向滚动，从而底部横向滚动条始终固定可见，
 * 无需把整个页面滚动到最底部才能看到。
 */
export default function AutoHeightTable<T extends object>({ scroll, ...rest }: TableProps<T>) {
  /** 外层容器：既为表格限定可用高度，也用于测量该高度 */
  const wrapperRef = useRef<HTMLDivElement>(null)
  /** 表格体高度；测量完成前为 undefined，此时按内容自然高度渲染 */
  const [bodyHeight, setBodyHeight] = useState<number>()

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    /** 用容器可用高度减去表头高度，得到表格体应占的高度 */
    const sync = () => {
      const header = wrapper.querySelector<HTMLElement>('.ant-table-thead')
      setBodyHeight(wrapper.clientHeight - (header?.offsetHeight ?? 0))
    }

    sync()
    // 侧边栏折叠、窗口缩放都会改变可用高度，用 ResizeObserver 持续跟随
    const observer = new ResizeObserver(sync)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  return (
    // overflow: hidden 兜住 antd 表头与表体的像素取整误差，避免外层出现多余滚动条
    <div ref={wrapperRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Table<T> {...rest} scroll={{ x: 'max-content', ...scroll, y: bodyHeight }} />
    </div>
  )
}
