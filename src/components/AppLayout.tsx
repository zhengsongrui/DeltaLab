import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Space, Switch, Typography } from 'antd'
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

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider collapsed={collapsed} theme="dark" trigger={null}>
        <div
          style={{
            height: 48,
            margin: 16,
            color: '#fff',
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
          theme="dark"
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
            <Typography.Text type="secondary">{themeMode}</Typography.Text>
          </Space>
        </Header>
        <Content style={{ margin: 16, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
