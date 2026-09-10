import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { appRoutes } from '@/router/routes'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在"
      extra={
        <Button type="primary" onClick={() => navigate(appRoutes[0].path)}>
          返回 DPS对比
        </Button>
      }
    />
  )
}
