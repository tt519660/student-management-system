import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

export function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? (
          <p className="mb-2 text-[11px] font-medium tracking-[0.22em] text-muted uppercase">{kicker}</p>
        ) : null}
        <h1 className="font-display text-[34px] leading-none tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'line' | 'danger'
}) {
  const styles = {
    primary: 'bg-accent text-white hover:bg-[#16382c]',
    ghost: 'bg-transparent text-ink hover:bg-black/5',
    line: 'bg-card text-ink border border-line hover:border-ink/30',
    danger: 'bg-transparent text-warn border border-warn/30 hover:bg-orange-50',
  }[variant]
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition disabled:opacity-40 ${styles} ${className}`}
      {...props}
    />
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  )
}

const control =
  'h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none transition focus:border-accent'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={control} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={control} {...props} />
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-card ${className}`}>{children}</div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'green' | 'warn' | 'muted'
}) {
  const map = {
    neutral: 'bg-black/5 text-ink',
    green: 'bg-accent-soft text-accent',
    warn: 'bg-orange-50 text-warn',
    muted: 'bg-line/70 text-muted',
  }[tone]
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map}`}>
      {children}
    </span>
  )
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl border border-line bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button className="text-muted" onClick={onClose} type="button">
            关闭
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-display text-xl">{title}</h2>
        <p className="mt-3 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="line" onClick={onCancel}>
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            确认删除
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Table({
  columns,
  rows,
  empty = '暂无数据',
}: {
  columns: string[]
  rows: ReactNode[][]
  empty?: string
}) {
  if (rows.length === 0) {
    return <p className="px-2 py-10 text-center text-sm text-muted">{empty}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-line/70 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
