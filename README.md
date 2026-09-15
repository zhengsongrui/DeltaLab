# DeltaLab

三角洲行动武器数据工具。React 18 + TypeScript + Electron，一套源码双端产物：Web 静态页面与 Windows 桌面安装包。

## 技术栈

React 18 / TypeScript / Vite 7、Ant Design 5、ECharts 6、Zustand 4、React Router 6（HashRouter）、SheetJS（xlsx）、Electron + electron-vite + electron-builder。

## 功能

### DPS对比

- **两种视图**：「按枪械」（一行一把武器）与「按射程」（一行一段射程，区间为左闭右开）
- **射击距离**：可设置距离，伤害与 DPS 按该距离生效的射程倍率换算
- **距离筛选**：仅在「按射程」视图下按输入距离裁剪行
- **武器名过滤**：勾选参与对比的武器，未勾选的行隐藏，工具栏提示已过滤条数
- **自定义显示列**：列按分组勾选，两个视图的列显示分别记忆
- **综合 DPS**：可设置头 / 胸 / 腹 / 四肢四项命中权重，归一化为命中占比后加权求和
- **连发模式武器控制**：设置连发武器展开的累计轮数（1~8 轮），展开行的射速即该轮次等效射速
- **图表对比**：以折线图对比多把枪械在 0~100 米上的 DPS 变化，可切换综合 / 各部位 / 护甲口径，倍率跳变处呈阶梯断崖

### 射击间隔对比

- **时间窗口**：100~5000 ms，决定所有轨道的横向比例，各线段共享同一时间基准
- **线段管理**：按预设新增「全自动」「连发」线段，可改名、切换类型、调整射速 / 轮内间隔 / 官方射速 / 发数，并支持删除与一键清空
- **导入武器**：从武器库勾选武器作为只读线段参与对比；只记录武器 id，武器被修改或删除后即时反映，已导入的武器不会重复添加
- **可视化**：每条线段一条时间轴轨道，子弹图标按「时刻 ÷ 时间窗口」的真实比例定位，可直观比较不同射速的疏密差异；极端参数下超出上限会提示已截断

### 枪械管理

- **增删改**：新增 / 编辑 / 删除武器（扇区倍率、射速、开火模式、连发发数、射程分段与部位倍率）
- **名称搜索**：输入即时模糊过滤（忽略大小写与首尾空格）
- **导入导出**：
  - 导出 Excel / JSON，导出会剥离升级用的内部元数据
  - 导入 Excel / JSON 支持「追加」（同名原位覆盖、新名追加）与「覆盖」（清空现有数据，需二次确认）两种模式
  - Excel 为扁平列布局，射程按「射程N距离 / 射程N倍率」展平，开火模式列写中文标签且允许缺省，旧版文件仍可导入
- **内置数据升级**：内置武器带稳定 key 与数值指纹，程序升级时自动同步新版数值；用户改过的条目保留用户数值并降级为用户数据，用户删除过的条目不会复活
- **数据持久化**：保存在 localStorage；清除浏览器缓存会丢失新增数据，建议先用「导出」备份

### 通用

侧边栏折叠、亮色 / 暗色主题切换、404 页面。

## 计算口径

| 项目 | 公式 |
| --- | --- |
| 部位伤害 | 基础伤害 × 部位倍率 × 射程倍率 |
| 部位 DPS | 基础伤害 × (射速 ÷ 60) × 部位倍率 × 射程倍率 |
| 护甲 DPS | 护甲伤害 × (射速 ÷ 60) × 射程倍率（不乘部位倍率） |
| 综合 DPS | Σ(部位 DPS × 命中占比)，占比由四项权重归一化 |
| 最短射击间隔 | 60000 ÷ 射速（全自动 / 单发） |
| 连发周期 | 一轮发数 × 60000 ÷ 官方射速 |
| 轮次间隔 | 连发周期 − (发数 − 1) × 轮内间隔 |
| 累计 N 轮等效射速 | (N × 发数 − 1) × 60000 ÷ ((N − 1) × 连发周期 + (发数 − 1) × 轮内间隔) |

连发以「官方射速」为基准：周期由官方射速反推，轮次间隔是派生物，因此累计轮数越大越逼近官方射速。

## 命令

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动 Electron 桌面端开发环境 |
| `npm run dev:web` | 启动 Web 开发服务器（http://localhost:5173） |
| `npm run build:web` | 构建 Web 静态产物到 `dist-web/` |
| `npm run preview:web` | 本地预览 Web 构建产物 |
| `npm run build:desktop` | 构建桌面端产物到 `out/` |
| `npm run build:win` | 打包 Windows 安装包到 `release/`（先构建桌面端再执行 electron-builder） |
| `npm run typecheck` | 类型检查（渲染层与 Node 侧各查一遍） |

## 目录结构

```
DeltaLab/
├── electron/
│   ├── main/index.ts              # 窗口创建与 IPC（app:get-version）
│   └── preload/index.ts           # contextBridge 暴露 electronAPI
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx          # 侧边栏 / 顶栏 / 主题切换
│   │   ├── AutoHeightTable.tsx    # 自适应可用高度的表格
│   │   ├── EChart.tsx             # ECharts 通用封装
│   │   └── RangeBar.tsx           # 0-100 米射程倍率方块图
│   ├── data/weapons.ts            # 内置武器种子数据（带稳定 key）
│   ├── pages/
│   │   ├── DpsCompare/
│   │   │   ├── index.tsx          # 页面装配
│   │   │   ├── rows.ts            # 行构造、连发轮次展开、距离与名称过滤
│   │   │   ├── columns.tsx        # 表格列定义与可见列过滤
│   │   │   ├── chart.ts           # 0-100 米 DPS 曲线采样
│   │   │   ├── composite.ts       # 部位文案与默认命中权重
│   │   │   ├── components/        # 工具栏、列选择器、综合 DPS / 连发轮数 / 图表弹窗
│   │   │   └── hooks/             # 可见列、可见武器、命中权重、连发轮数
│   │   ├── FireIntervalCompare/
│   │   │   ├── index.tsx          # 页面装配
│   │   │   ├── colors.ts          # 线段配色
│   │   │   ├── components/        # 工具栏、时间轴轨道、线段卡片、导入武器弹窗、对比区
│   │   │   └── hooks/useFireSegments.ts   # 线段与时间窗口的持久化
│   │   ├── WeaponManager/
│   │   │   ├── index.tsx          # 页面装配与名称搜索
│   │   │   ├── columns.tsx        # 表格列定义
│   │   │   ├── components/        # 工具栏、新增 / 编辑表单弹窗
│   │   │   └── hooks/             # useWeaponForm、useWeaponTransfer
│   │   └── NotFound.tsx
│   ├── router/
│   │   ├── index.tsx              # HashRouter 与路由装配
│   │   └── routes.tsx             # 路由与侧边栏菜单共用配置
│   ├── store/useAppStore.ts       # 武器列表、主题、侧边栏状态
│   ├── styles/global.css
│   ├── types/                     # weapon.ts、fireInterval.ts、global.d.ts
│   ├── utils/
│   │   ├── dps.ts                 # 部位伤害 / DPS / 综合 DPS 公式
│   │   ├── burstTiming.ts         # 连发时序纯计算（表单与对比页共用口径）
│   │   ├── fireInterval.ts        # 射击间隔、连发派生值与射击时刻生成
│   │   ├── weaponFire.ts          # 开火模式文案、连发展开判断
│   │   ├── weaponSegment.ts       # 线段解析（导入线段按 weaponId 实时换算）
│   │   ├── weaponSeed.ts          # 内置数据三方合并（升级同步与指纹判定）
│   │   ├── weaponIO.ts            # Excel / JSON 解析与导出、按名合并
│   │   ├── weaponId.ts            # 武器唯一标识生成
│   │   ├── fileTransfer.ts        # 下载与文件选择
│   │   └── rangeColor.ts          # 射程倍率配色
│   ├── platform/index.ts          # 平台能力隔离层（Web 端自动降级）
│   ├── App.tsx                    # antd 主题与中文语言配置
│   └── main.tsx                   # 渲染层入口
├── vite.config.ts                 # Web 构建配置（产物 dist-web/）
├── electron.vite.config.ts        # 桌面构建配置（产物 out/）
└── electron-builder.yml           # Windows NSIS 打包配置
```

## 数据存储

数据全部保存在 localStorage，键名带版本号，结构升级时直接换键即可丢弃旧结构。

| 键名 | 内容 |
| --- | --- |
| `delta-lab.weapons.v3` | 武器列表与「用户删除过的内置 key」墓碑 |
| `delta-lab.theme` | 主题模式 |
| `delta-lab.composite-weights.v1` | 综合 DPS 命中权重 |
| `delta-lab.burst-rounds.v1` | 连发武器展开的累计轮数 |
| `delta-lab.visible-weapons.v1` | 按武器名过滤的勾选状态 |
| `delta-lab.visible-columns.v5.weapon` / `.range` | 两个视图各自的可见列 |
| `delta-lab.fire-intervals.v3` | 射击间隔对比的线段与时间窗口 |

## 双端差异

- 路由统一使用 HashRouter，兼容 Electron 以 `file://` 加载的场景，无需服务端配置
- 业务代码只通过平台隔离层获取平台能力，Web 端 `electronAPI` 不存在时自动降级
- 文件导入导出仅依赖 Blob 与 `input[type=file]`，双端表现一致
