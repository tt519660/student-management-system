import { useState } from 'react'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Table } from '../components/ui'
import { useStore } from '../lib/store'
import type { Term } from '../types'

export function TermsPage() {
  const { db, saveTerm, removeTerm } = useStore()
  const [editing, setEditing] = useState<Partial<Term> | null>(null)

  const toLocalInput = (iso: string) => {
    if (!iso) return ''
    const date = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  return (
    <div>
      <PageHeader
        kicker="Terms"
        title="学期管理"
        subtitle="设置学年学期与选课时间窗口。"
        actions={
          <Button onClick={() => setEditing({ isCurrent: false })}>新建学期</Button>
        }
      />
      <Card>
        <Table
          columns={['学期', '选课开始', '选课结束', '当前学期', '开课数', '']}
          rows={db.terms.map((item) => [
            item.name,
            item.enrollStart ? new Date(item.enrollStart).toLocaleString('zh-CN') : '—',
            item.enrollEnd ? new Date(item.enrollEnd).toLocaleString('zh-CN') : '—',
            item.isCurrent ? <Badge tone="green">是</Badge> : <Badge tone="muted">否</Badge>,
            String(db.offerings.filter((offering) => offering.termId === item.id).length),
            <div className="flex gap-2">
              <button className="text-xs text-accent" onClick={() => setEditing(item)} type="button">
                编辑
              </button>
              <button className="text-xs text-warn" onClick={() => removeTerm(item.id)} type="button">
                删除
              </button>
            </div>,
          ])}
        />
      </Card>

      {editing ? (
        <Modal title={editing.id ? '编辑学期' : '新建学期'} onClose={() => setEditing(null)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              saveTerm({
                id: editing.id,
                name: String(data.get('name')),
                enrollStart: new Date(String(data.get('enrollStart'))).toISOString(),
                enrollEnd: new Date(String(data.get('enrollEnd'))).toISOString(),
                isCurrent: data.get('isCurrent') === 'on',
              })
              setEditing(null)
            }}
          >
            <Field label="学期名称">
              <Input
                name="name"
                placeholder="2026-2027 学年第一学期"
                defaultValue={editing.name}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="选课开始">
                <Input
                  name="enrollStart"
                  type="datetime-local"
                  defaultValue={editing.enrollStart ? toLocalInput(editing.enrollStart) : undefined}
                  required
                />
              </Field>
              <Field label="选课结束">
                <Input
                  name="enrollEnd"
                  type="datetime-local"
                  defaultValue={editing.enrollEnd ? toLocalInput(editing.enrollEnd) : undefined}
                  required
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="isCurrent"
                type="checkbox"
                defaultChecked={editing.isCurrent}
                className="h-4 w-4 rounded accent-accent"
              />
              设为当前学期
            </label>
            <Button type="submit">保存</Button>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
