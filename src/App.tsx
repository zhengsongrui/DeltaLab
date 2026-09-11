import { useMemo } from 'react'
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { AppRouter } from '@/router'
import { useAppStore } from '@/store/useAppStore'

dayjs.locale('zh-cn')

export default function App() {
  const themeMode = useAppStore((state) => state.themeMode)

  // 按当前主题算法计算设计 token，用于取容器背景色（亮色 #ffffff / 暗色 #141414）
  const colorBgContainer = useMemo(
    () =>
      antdTheme.getDesignToken({
        algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }).colorBgContainer,
    [themeMode],
  )

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        components: {
          // antd 的 Layout.headerBg 固定为 #001529 且不随算法变化，必须显式覆盖才能跟随主题；
          // 取值与 Sider、内容区一致，保证切换主题时 Header 同步变色
          Layout: { headerBg: colorBgContainer },
        },
      }}
    >
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  )
}
