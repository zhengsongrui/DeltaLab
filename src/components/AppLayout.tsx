import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Space, Switch, theme as antdTheme, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { appRoutes } from '@/router/routes'
import { useAppStore } from '@/store/useAppStore'

const { Content, Header, Sider } = Layout

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const themeMode = useAppStore((state) => state.themeMode)
  const toggleThemeMode = useAppStore((state) => state.toggleThemeMode)
  // 当前主题的设计 token，用于让 logo 文字色跟随主题（亮色深字 / 暗色浅字）
  const { token } = antdTheme.useToken()

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Sider 与 Menu 统一使用 light 主题：antd 下 lightSiderBg 与 Menu itemBg 均取 colorBgContainer，
          会自动随主题算法切换为亮色白底 / 暗色深灰底，无需覆盖 dark* 系列 token */}
      <Sider collapsed={collapsed} theme="light" trigger={null}>
        <div
          style={{
            height: 48,
            margin: 16,
            // 文字色跟随主题 token，避免亮色白底下白字不可见
            color: token.colorText,
            fontSize: 18,
            fontWeight: 600,
            lineHeight: '48px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? 'DL' : 'DeltaLab'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={appRoutes.map((route) => ({ key: route.path, label: route.label }))}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          {/* 左侧：侧边栏折叠按钮 */}
          <Button
            type="text"
            aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
          />
          {/* 右侧：主题切换，全局生效 */}
          <Space>
            <Switch checked={themeMode === 'dark'} onChange={toggleThemeMode} />
            <Typography.Text type="secondary">{themeMode === 'dark'?'暗色主题':'亮色主题'}</Typography.Text>
          </Space>
        </Header>
        {/* flex 纵向布局让页面卡片能撑满剩余高度，表格因此可在可视区域内滚动 */}
        <Content style={{ margin: 16, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
