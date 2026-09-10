import type { ReactNode } from 'react'
import DpsCompare from '@/pages/DpsCompare'
import WeaponManager from '@/pages/WeaponManager'

export interface AppRoute {
  path: string
  label: string
  element: ReactNode
}

/**
 * 路由与侧边栏菜单共用同一份配置，新增页面只需在此追加一项。
 */
export const appRoutes: AppRoute[] = [
  { path: '/dps-compare', label: 'DPS对比', element: <DpsCompare /> },
  { path: '/weapon-manager', label: '武器管理', element: <WeaponManager /> },
]
