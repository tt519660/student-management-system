# 学苑 · 高校学生管理系统

基于 Vite、React 和 TypeScript 构建的高校学生管理系统，采用前后端分离架构，覆盖学籍管理、组织管理、课程管理、选课、课表与数据报表等场景。

## 系统架构

```
                        ┌─────────────────────────────────────┐
                        │           客户端 (React SPA)         │
                        └─────────────────┬───────────────────┘
                                          │ HTTPS
                        ┌─────────────────▼───────────────────┐
                        │      负载均衡 (Nginx / SLB)          │
                        │      限流 + 灰度 + 静态资源加速        │
                        └─────────────────┬───────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
  ┌─────────▼──────────┐      ┌──────────▼─────────┐      ┌───────────▼─────────┐
  │   FastAPI 服务      │      │   FastAPI 服务      │      │   FastAPI 服务       │
  │   Auth + User       │      │   Core + 选课       │      │   Report + 日志      │
  └─────────┬──────────┘      └──────────┬─────────┘      └───────────┬─────────┘
            │                             │                             │
            └─────────────────────────────┼─────────────────────────────┘
                                          │
                        ┌─────────────────▼───────────────────┐
                        │         Celery + Redis (任务队列)     │
                        │         选课异步处理 + 削峰填谷         │
                        └─────────────────┬───────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
  ┌─────────▼──────────┐      ┌──────────▼─────────┐      ┌───────────▼─────────┐
  │   PostgreSQL        │      │   Redis Cluster     │      │   Elasticsearch     │
  │   主从读写分离        │      │   缓存+锁+队列       │      │   日志+全文检索       │
  └────────────────────┘      └────────────────────┘      └─────────────────────┘
```

### 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 19 + TypeScript + Vite | SPA 单页应用 |
| 后端 | Python 3.12 + FastAPI | 异步高性能框架 |
| 数据库 | PostgreSQL 16 | 主从读写分离 |
| 缓存 | Redis 7 | 分布式锁 + 名额缓存 |
| 任务队列 | Celery + Redis | 选课削峰填谷 |
| 部署 | Docker + K8s | 弹性伸缩 |

### 高可用设计（选课高峰）

- **分布式锁**：Redis SET NX 防止同一课程超卖
- **三重校验**：Redis DECR → MySQL 唯一索引 → 乐观锁
- **限流熔断**：单用户 1次/秒，全局 10000 QPS
- **读写分离**：查询走从库，写入走主库
- **弹性伸缩**：HPA 根据 CPU 自动扩容（4→32 pods）

### 选课核心流程

```
学生点击选课
     │
     ▼
┌─────────────────────────────┐
│ 1. JWT 认证 + 限流           │  网关校验身份，单用户 1次/秒
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 2. 获取分布式锁              │  Redis SET NX 锁 offering_id
│    (SET NX EX 3)            │  同一教学班串行处理
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 3. Redis 缓存校验            │
│    - 已选？→ 拒绝            │  SISMEMBER 学生已选集合
│    - 时间冲突？→ 拒绝         │  内存计算冲突检测
│    - 名额不足？→ 拒绝         │  DECR 原子扣减名额
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 4. 写入 PostgreSQL           │  INSERT ... ON CONFLICT
│    唯一索引兜底防重复          │  DO NOTHING
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ 5. 更新缓存 + 释放锁 + 返回   │
└─────────────────────────────┘
```

**防超卖三重保障：**

| 顺序 | 机制 | 作用 |
|------|------|------|
| 第一道 | Redis `DECR` 原子操作 | 高并发下快速拦截 |
| 第二道 | MySQL 唯一索引 `uk_student_offering` | 防止重复选课 |
| 第三道 | 乐观锁 `WHERE enrolled_count < capacity` | 最终一致性兜底 |

## 功能列表

- 角色登录：教务管理员、教师、学生
- 学生信息与学籍管理
- 院系、专业与组织架构管理（支持新增、编辑、删除）
- 学期管理：设置选课时间窗口与当前学期
- 课程与开课管理（支持新增、编辑、删除）
- 学生选课与课程安排
- 教师可查看授课学生名单
- 教师课表、学生课表与个人资料
- 数据看板与报表展示
- 本地演示数据初始化与重置

## 项目介绍动画

![项目介绍动画](promo-video/preview.gif)

`promo-video/` 是基于 [Remotion](https://remotion.dev)（React 编程式视频）制作的项目介绍展示动画，规格为 1920×1080、30fps、约 19 秒，包含开场、技术栈、核心功能、角色介绍与结尾 5 个场景。[高清 MP4 版本](https://github.com/tt519660/student-management-system/releases/tag/demo-assets)托管在 Release 中，不占用仓库体积。

```bash
cd promo-video
npm install
npm run dev    # 启动 Remotion Studio 预览
```

启动后在浏览器打开 `http://localhost:3000/StudentIntro` 即可交互式预览；每个场景也在 Studio 的 Scenes 文件夹中单独注册，可独立编辑。导出 MP4：

```bash
npx remotion render
```

## 前置依赖

- Node.js 20 或更高版本
- npm 10 或更高版本

## 快速启动

### 前端

```bash
git clone https://github.com/tt519660/student-management-system.git
cd student-management-system
npm install
npm run dev
```

启动后，打开终端中显示的本地地址，通常为 `http://localhost:5173`。

### 后端（可选）

```bash
cd backend
pip install -r requirements.txt
python main.py
```

后端运行在 `http://127.0.0.1:8000`，API 文档见 `http://127.0.0.1:8000/docs`。

> 后端未启动时，前端自动使用本地 localStorage 数据，不影响使用。

### 生产构建

```bash
npm run build
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 演示账号

所有演示账号的密码均为 `123456`。

| 角色 | 账号 | 可访问页面 |
| --- | --- | --- |
| 教务管理员 | `admin` | 全部功能 |
| 教师 | `T10001` | 总览、开课管理、课表 |
| 学生 | `2024010101` | 总览、选课、课表、个人档案 |

## 代码示例

启动开发服务器：

```bash
npm run dev
```

在 React 组件中读取当前用户：

```tsx
import { useStore } from './lib/store';

export function UserGreeting() {
  const { user } = useStore();

  return <p>你好，{user?.displayName ?? '访客'}</p>;
}
```

## 项目目录

```text
student-management-system/
├── backend/                # Python 后端（FastAPI）
│   ├── main.py             # 后端入口
│   ├── test_data.js        # 测试数据
│   └── requirements.txt    # Python 依赖
├── docs/                   # 项目文档
├── public/                 # 静态资源
├── promo-video/            # 项目介绍动画（Remotion）
├── src/
│   ├── components/         # 通用组件与布局
│   ├── lib/                # 状态管理、API 服务与业务逻辑
│   │   ├── api.ts          # 后端 API 调用
│   │   ├── store.tsx       # 全局状态
│   │   ├── enrollment.ts   # 选课规则
│   │   ├── seed.ts         # 本地种子数据
│   │   └── utils.ts        # 工具函数
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 总览
│   │   ├── Login.tsx       # 登录
│   │   ├── Organization.tsx # 组织架构
│   │   ├── Students.tsx    # 学生学籍
│   │   ├── Teachers.tsx    # 教师档案
│   │   ├── Courses.tsx     # 课程库
│   │   ├── Terms.tsx       # 学期管理
│   │   ├── Offerings.tsx   # 开课管理
│   │   ├── SelectCourses.tsx # 选课
│   │   ├── Schedule.tsx    # 课表
│   │   ├── Reports.tsx     # 统计报表
│   │   ├── Logs.tsx        # 操作日志
│   │   └── Profile.tsx     # 我的档案
│   ├── App.tsx             # 应用路由与页面入口
│   ├── types.ts            # TypeScript 类型定义
│   └── main.tsx            # 应用启动入口
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 配置说明

项目使用 Vite 默认配置，开发环境无需额外配置文件或数据库即可运行。演示数据保存在浏览器本地存储中，首次启动会自动初始化。

如需修改本地开发端口，可在 `vite.config.ts` 中配置：

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
  },
});
```

更多产品说明见 [docs/PRD-学生管理系统.md](docs/PRD-学生管理系统.md)。

## License

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。
