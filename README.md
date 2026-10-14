# 学苑 · 高校学生管理系统

基于 Vite、React 和 TypeScript 构建的高校学生管理系统前端项目，覆盖学籍管理、组织管理、课程管理、选课、课表与数据报表等场景。

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

## 前置依赖

- Node.js 20 或更高版本
- npm 10 或更高版本

## 快速启动

```bash
git clone https://github.com/tt519660/student-management-system.git
cd student-management-system
npm install
npm run dev
```

启动后，打开终端中显示的本地地址，通常为 `http://localhost:5173`。

生产构建与预览：

```bash
npm run build
npm run preview
```

代码检查：

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
├── docs/                 # 项目文档
├── public/               # 静态资源
├── src/
│   ├── components/       # 通用组件与布局
│   ├── lib/              # 状态管理、种子数据与业务逻辑
│   ├── pages/            # 页面组件
│   │   ├── Dashboard.tsx # 总览
│   │   ├── Login.tsx     # 登录
│   │   ├── Organization.tsx # 组织架构
│   │   ├── Students.tsx  # 学生学籍
│   │   ├── Teachers.tsx  # 教师档案
│   │   ├── Courses.tsx   # 课程库
│   │   ├── Terms.tsx     # 学期管理
│   │   ├── Offerings.tsx # 开课管理
│   │   ├── SelectCourses.tsx # 选课
│   │   ├── Schedule.tsx  # 课表
│   │   ├── Reports.tsx   # 统计报表
│   │   └── Profile.tsx   # 我的档案
│   ├── App.tsx           # 应用路由与页面入口
│   ├── App.css           # 应用样式
│   ├── index.css         # 全局样式
│   ├── types.ts          # TypeScript 类型定义
│   └── main.tsx          # 应用启动入口
├── index.html
├── package.json
├── package-lock.json
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
