import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import NotFound from '@/pages/NotFound'
import { appRoutes } from '@/router/routes'

/**
 * 统一使用 HashRouter：
 * Electron 生产环境以 file:// 协议加载，BrowserRouter 依赖的 pathname 会变成磁盘绝对路径，
 * 导致路由匹配失败白屏。Hash 部分不参与文件定位，双端均可用且无需服务端配置。
 */
export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={appRoutes[0].path} replace />} />
          {appRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
