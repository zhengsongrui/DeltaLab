# DeltaLab

三角洲行动武器数据工具。React 18 + TypeScript + Electron，一套源码双端产物：Web 静态页面与 Windows 桌面安装包。

## 功能

- **DPS对比**：支持「按武器」与「按射程」两种视图，可设置射击距离、按距离筛选、自定义显示列
- **武器管理**：新增 / 编辑 / 删除武器，支持 Excel、JSON 导入导出；数据保存在 localStorage

## 命令

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动 Electron 桌面端开发环境 |
| `npm run dev:web` | 启动 Web 开发服务器（http://localhost:5173） |
| `npm run build:web` | 构建 Web 静态产物到 `dist-web/` |
| `npm run build:win` | 打包 Windows 安装包到 `release/` |
| `npm run typecheck` | 类型检查 |

## 目录结构

```
DeltaLab/
├── electron/
│   ├── main/index.ts         # 窗口创建与 IPC
│   └── preload/index.ts      # contextBridge 暴露 API
├── src/
│   ├── pages/DpsCompare/     # DPS对比页
│   ├── pages/WeaponManager/  # 武器管理页
│   ├── data/weapons.ts       # 内置武器数据
│   ├── types/weapon.ts       # 武器领域模型
│   ├── utils/dps.ts          # DPS 计算公式
│   ├── utils/weaponIO.ts     # Excel / JSON 解析与导出
│   ├── store/useAppStore.ts  # 武器列表、主题、侧边栏状态
│   ├── router/routes.tsx     # 路由与侧边栏菜单配置
│   └── platform/index.ts     # 平台能力隔离层
├── vite.config.ts            # Web 构建配置
└── electron.vite.config.ts   # 桌面构建配置
```
