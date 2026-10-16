import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Field, Input } from '../components/ui'
import { DEMO_PASSWORD } from '../lib/seed'
import { useStore } from '../lib/store'

const demos = [
  { label: '教务', username: 'admin' },
  { label: '教师 张明远', username: 'T10001' },
  { label: '学生 林晓', username: '2024010101' },
]

export function LoginPage() {
  const { user, login, resetDemo } = useStore()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await login(username, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink text-[#efe8dc] lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute bottom-20 left-16 h-48 w-48 rounded-full bg-accent/40" />
        <p className="relative text-[12px] tracking-[0.32em] uppercase text-white/50">University Registry</p>
        <div className="relative max-w-md">
          <h1 className="font-display text-6xl leading-[0.95] text-white">把复杂的教务，做成安静的秩序。</h1>
          <p className="mt-6 text-sm leading-7 text-white/60">
            学籍、开课、选课与报表在同一条轴线上。V1 专注学期闭环，成绩与考勤留给下一版。
          </p>
        </div>
        <p className="relative text-xs text-white/40">学苑 · Academic Student Management</p>
      </section>

      <section className="grid place-items-center px-6 py-16">
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <p className="text-[11px] tracking-[0.24em] text-muted uppercase">Sign in</p>
          <h2 className="mt-2 font-display text-4xl">登录学苑</h2>
          <div className="mt-8 grid gap-4">
            <Field label="学号 / 工号">
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </Field>
            <Field label="密码">
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </Field>
            {error ? <p className="text-sm text-warn">{error}</p> : null}
            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? '登录中...' : '进入系统'}
            </Button>
          </div>
          <div className="mt-8">
            <p className="mb-3 text-xs text-muted">演示账号，密码均为 {DEMO_PASSWORD}</p>
            <div className="flex flex-wrap gap-2">
              {demos.map((item) => (
                <button
                  key={item.username}
                  className="rounded-full border border-line bg-card px-3 py-1.5 text-xs"
                  onClick={() => {
                    setUsername(item.username)
                    setPassword(DEMO_PASSWORD)
                    setError(null)
                  }}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button className="mt-6 text-xs text-muted underline" onClick={resetDemo} type="button">
              重置演示数据
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
