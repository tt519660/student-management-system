import { useMemo, useState } from 'react'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Table } from '../components/ui'
import { useStore } from '../lib/store'
import type { Student, StudentStatus } from '../types'
import { downloadCsv } from '../lib/utils'

const statuses: StudentStatus[] = ['在读', '休学', '退学', '毕业']

export function StudentsPage() {
  const { db, saveStudent, setStudentStatus } = useStore()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Partial<Student> | null>(null)

  const rows = useMemo(() => {
    return db.students.filter((item) => {
      const hay = `${item.studentNo}${item.name}`.toLowerCase()
      return hay.includes(q.trim().toLowerCase())
    })
  }, [db.students, q])

  return (
    <div>
      <PageHeader
        kicker="Registry"
        title="学生学籍"
        subtitle="学号即登录名。状态变更会写入审计日志。"
        actions={
          <>
            <Button
              variant="line"
              onClick={() => {
                downloadCsv('students.csv', [
                  ['学号', '姓名', '性别', '入学年', '学院', '专业', '班级', '状态'],
                  ...rows.map((item) => [
                    item.studentNo,
                    item.name,
                    item.gender,
                    String(item.enrollYear),
                    db.colleges.find((college) => college.id === item.collegeId)?.name ?? '',
                    db.majors.find((major) => major.id === item.majorId)?.name ?? '',
                    db.classes.find((cls) => cls.id === item.classId)?.name ?? '',
                    item.status,
                  ]),
                ])
              }}
            >
              导出 CSV
            </Button>
            <Button onClick={() => setEditing({ gender: '男', status: '在读', enrollYear: 2026 })}>新建学籍</Button>
          </>
        }
      />
      <div className="mb-4 max-w-sm">
        <Input placeholder="搜索学号或姓名" value={q} onChange={(event) => setQ(event.target.value)} />
      </div>
      <Card>
        <Table
          columns={['学号', '姓名', '学院 / 专业', '班级', '状态', '']}
          rows={rows.map((item) => [
            item.studentNo,
            item.name,
            `${db.colleges.find((college) => college.id === item.collegeId)?.name ?? ''} / ${
              db.majors.find((major) => major.id === item.majorId)?.name ?? ''
            }`,
            db.classes.find((cls) => cls.id === item.classId)?.name ?? '—',
            <Badge tone={item.status === '在读' ? 'green' : item.status === '休学' ? 'warn' : 'muted'}>
              {item.status}
            </Badge>,
            <div className="flex gap-2">
              <button className="text-xs text-accent" onClick={() => setEditing(item)} type="button">
                编辑
              </button>
              <select
                className="rounded-lg border border-line bg-transparent px-2 py-1 text-xs"
                value={item.status}
                onChange={(event) => setStudentStatus(item.id, event.target.value as StudentStatus)}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>,
          ])}
        />
      </Card>

      {editing ? (
        <Modal title={editing.id ? '编辑学籍' : '新建学籍'} onClose={() => setEditing(null)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const collegeId = String(data.get('collegeId'))
              const majorId = String(data.get('majorId'))
              saveStudent({
                id: editing.id,
                studentNo: String(data.get('studentNo')),
                name: String(data.get('name')),
                gender: String(data.get('gender')) as Student['gender'],
                enrollYear: Number(data.get('enrollYear')),
                collegeId,
                majorId,
                classId: String(data.get('classId')),
                status: String(data.get('status')) as StudentStatus,
              })
              setEditing(null)
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="学号">
                <Input name="studentNo" defaultValue={editing.studentNo} required />
              </Field>
              <Field label="姓名">
                <Input name="name" defaultValue={editing.name} required />
              </Field>
              <Field label="性别">
                <Select name="gender" defaultValue={editing.gender}>
                  <option>男</option>
                  <option>女</option>
                </Select>
              </Field>
              <Field label="入学年">
                <Input name="enrollYear" type="number" defaultValue={editing.enrollYear ?? 2026} required />
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
              <Field label="专业">
                <Select name="majorId" defaultValue={editing.majorId ?? db.majors[0]?.id}>
                  {db.majors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="行政班">
                <Select name="classId" defaultValue={editing.classId ?? db.classes[0]?.id}>
                  {db.classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="学籍状态">
                <Select name="status" defaultValue={editing.status ?? '在读'}>
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit">保存</Button>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
