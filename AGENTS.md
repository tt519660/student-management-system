# AGENTS.md

## 项目概述

学苑 · 高校学生管理系统前端，覆盖学籍、组织、课程、选课、课表与报表。

## 技术栈

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4
- 数据持久化：localStorage（无后端）

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 类型检查 + 构建
npm run lint     # 代码检查
```

## 项目结构

```
src/
├── components/   # UI 组件（ui.tsx）与布局（Layout.tsx）
├── lib/          # 核心逻辑
│   ├── store.tsx      # 全局状态与 CRUD 操作
│   ├── enrollment.ts  # 选课校验规则
│   ├── seed.ts        # 演示数据
│   └── utils.ts       # 工具函数
├── pages/        # 页面组件（按路由命名）
├── App.tsx       # 路由配置
└── types.ts      # TypeScript 类型定义
```

## 代码规范

- 新增页面需同步更新：`App.tsx` 路由、`Layout.tsx` 导航
- 新增数据实体需同步更新：`types.ts`、`store.tsx`、`seed.ts`
- 删除操作必须级联清理关联数据，并写入审计日志
- 所有删除操作需有二次确认弹窗

## 开发规则

### 1. 提交规范

每完成一个独立功能、重要修复或开发阶段，先执行以下自查流程：

```bash
npm run lint     # 代码检查
npm run build    # 类型检查与构建
```

确认通过后执行 `git commit`，使用语义化提交信息（如 `feat:`、`fix:`、`docs:`），以便版本追踪和回滚。

### 2. Worktree 开发规范

在 worktree 中开发时，所有修改、测试和 commit 都在独立工作树中完成。开发完成后向用户汇报成果并交由用户体验和验收，**未经允许，不得合并到主版本**。
