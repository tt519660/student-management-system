import { useState } from 'react'
import { Button, Card, Field, Input, Modal, PageHeader, Select, Table } from '../components/ui'
import { useStore } from '../lib/store'
import type { Teacher } from '../types'

export function TeachersPage() {
  const { db, saveTeacher } = useStore()
  const [editing, setEditing] = useState<Partial<Teacher> | null>(null)

  return (
    <div>
      <PageHeader
        kicker="Faculty"
        title="教师档案"
        subtitle="工号即登录名，默认密码 123456。"
        actions={<Button onClick={() => setEditing({ title: '讲师' })}>新建教师</Button>}
      />
      <Card>
        <Table
          columns={['工号', '姓名', '学院', '职称', '授课班', '']}
          rows={db.teachers.map((item) => [
            item.staffNo,
            item.name,
            db.colleges.find((college) => college.id === item.collegeId)?.name ?? '—',
            item.title,
            String(db.offerings.filter((offering) => offering.teacherId === item.id).length),
            <button className="text-xs text-accent" onClick={() => setEditing(item)} type="button">
              编辑
            </button>,
          ])}
        />
      </Card>
      {editing ? (
        <Modal title={editing.id ? '编辑教师' : '新建教师'} onClose={() => setEditing(null)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              saveTeacher({
                id: editing.id,
                staffNo: String(data.get('staffNo')),
                name: String(data.get('name')),
                collegeId: String(data.get('collegeId')),
                title: String(data.get('title')),
              })
              setEditing(null)
            }}
          >
            <Field label="工号">
              <Input name="staffNo" defaultValue={editing.staffNo} required />
            </Field>
            <Field label="姓名">
              <Input name="name" defaultValue={editing.name} required />
            </Field>
            <Field label="学院">
              <Select name="collegeId" defaultValue={editing.collegeId ?? db.colleges[0]?.id}>
                {db.colleges.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="职称">
              <Input name="title" defaultValue={editing.title} />
            </Field>
            <Button type="submit">保存</Button>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
