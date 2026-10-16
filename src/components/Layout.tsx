import {
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PieChart,
  ScrollText,
  Users,
  UserSquare2,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { roleLabel, useStore } from '../lib/store'
import { currentTerm, enrollmentOpen } from '../lib/enrollment'
import { AiAssistant } from './AiAssistant'

const nav = [
  { to: '/', label: '总览', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
  { to: '/organization', label: '组织架构', icon: Building2, roles: ['admin'] },
  { to: '/students', label: '学生学籍', icon: GraduationCap, roles: ['admin'] },
  { to: '/teachers', label: '教师档案', icon: UserSquare2, roles: ['admin'] },
  { to: '/courses', label: '课程库', icon: BookOpen, roles: ['admin'] },
  { to: '/terms', label: '学期管理', icon: CalendarRange, roles: ['admin'] },
  { to: '/offerings', label: '开课管理', icon: Users, roles: ['admin', 'teacher'] },
  { to: '/select', label: '选课', icon: BookOpen, roles: ['student'] },
  { to: '/schedule', label: '课表', icon: CalendarDays, roles: ['admin', 'teacher', 'student'] },
  { to: '/reports', label: '统计报表', icon: PieChart, roles: ['admin'] },
  { to: '/logs', label: '操作日志', icon: ScrollText, roles: ['admin'] },
  { to: '/profile', label: '我的档案', icon: GraduationCap, roles: ['student'] },
]

export function Layout() {
  const { user, logout, db } = useStore()
  const navigate = useNavigate()
  const term = currentTerm(db)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink text-[#efe8dc]">
        <div className="px-6 py-8">
          <p className="text-[11px] tracking-[0.28em] text-white/50 uppercase">Academy</p>
          <h1 className="mt-2 font-display text-3xl text-white">学苑</h1>
          <p className="mt-1 text-xs text-white/50">高校学生管理系统</p>
        </div>
        <nav className="grid gap-1 px-3 pb-8">
          {nav
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              )
            })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 lg:px-10">
          <div className="text-sm text-muted">
            {term?.name}
            <span className="mx-2 text-line">/</span>
            选课窗口{enrollmentOpen(db) ? '开放中' : '已关闭'}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.displayName}</div>
              <div className="text-xs text-muted">{user ? roleLabel(user.role) : ''}</div>
            </div>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              title="退出"
              type="button"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>

      <AiAssistant />
    </div>
  )
}
