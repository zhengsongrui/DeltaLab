/**
 * 文件搬运能力
 * 只使用 Blob 与 input[type=file]，Web 与 Electron 渲染进程表现一致。
 */

/** 触发下载：临时 a 标签指向 Blob URL，点击后再回收 URL */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // 延迟回收：立即 revoke 可能中断尚未开始的下载
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * 唤起系统文件选择框并读取用户选中的文件
 * 用户取消选择时返回 null，由调用方静默跳过；不依赖 antd Upload 以免受其内部列表管理牵制
 */
export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => resolve(input.files?.[0] ?? null)
    // 取消选择不触发 change，用 cancel 事件兜底，避免 Promise 永不结束
    input.oncancel = () => resolve(null)
    input.click()
  })
}
