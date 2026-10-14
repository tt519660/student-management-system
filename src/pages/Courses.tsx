import { useState } from 'react'
import { Button, Card, ConfirmModal, Field, Input, Modal, PageHeader, Select, Table } from '../components/ui'
import { useStore } from '../lib/store'
import type { Course } from '../types'

export function CoursesPage() {
  const { db, saveCourse, removeCourse } = useStore()
  const [editing, setEditing] = useState<Partial<Course> | null>(null)
  const [deleting, setDeleting] = useState<Course | null>(null)

  return (
    <div>
      <PageHeader
        kicker="Catalog"
        title="课程库"
        subtitle="课程代码、学分与学时是开课的基础。"
        actions={<Button onClick={() => setEditing({ credits: 3, hours: 48 })}>新建课程</Button>}
      />
      <Card>
        <Table
          columns={['代码', '课程', '学分', '学时', '开课学院', '']}
          rows={db.courses.map((item) => [
            item.code,
            item.name,
            String(item.credits),
            String(item.hours),
            db.colleges.find((college) => college.id === item.collegeId)?.name ?? '—',
            <div className="flex gap-2">
              <button className="text-xs text-accent" onClick={() => setEditing(item)} type="button">
                编辑
              </button>
              <button className="text-xs text-warn" onClick={() => setDeleting(item)} type="button">
                删除
              </button>
            </div>,
          ])}
        />
      </Card>
      {editing ? (
        <Modal title={editing.id ? '编辑课程' : '新建课程'} onClose={() => setEditing(null)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              saveCourse({
                id: editing.id,
                code: String(data.get('code')),
                name: String(data.get('name')),
                credits: Number(data.get('credits')),
                hours: Number(data.get('hours')),
                collegeId: String(data.get('collegeId')),
              })
              setEditing(null)
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="课程代码">
                <Input name="code" defaultValue={editing.code} required />
              </Field>
              <Field label="课程名称">
                <Input name="name" defaultValue={editing.name} required />
              </Field>
              <Field label="学分">
                <Input name="credits" type="number" step="0.5" defaultValue={editing.credits} required />
              </Field>
              <Field label="学时">
                <Input name="hours" type="number" defaultValue={editing.hours} required />
              </Field>
            </div>
            <Field label="开课学院">
              <Select name="collegeId" defaultValue={editing.collegeId ?? db.colleges[0]?.id}>
                {db.colleges.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit">保存</Button>
          </form>
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmModal
          title="确认删除"
          message={`确定要删除课程「${deleting.name}」吗？相关开课记录也将被删除。`}
          onConfirm={() => {
            removeCourse(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </div>
  )
}
