import { useState } from 'react'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Table } from '../components/ui'
import { useStore } from '../lib/store'

type Tab = 'colleges' | 'majors' | 'classes'

export function OrganizationPage() {
  const { db, saveCollege, saveMajor, saveClass, removeCollege, removeMajor, removeClass } = useStore()
  const [tab, setTab] = useState<Tab>('colleges')
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        kicker="Structure"
        title="组织架构"
        subtitle="学院、专业与行政班是学籍的骨架。"
        actions={<Button onClick={() => setOpen(true)}>新建</Button>}
      />
      <div className="mb-5 flex gap-2">
        {(
          [
            ['colleges', '学院'],
            ['majors', '专业'],
            ['classes', '行政班'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={`rounded-full px-4 py-2 text-sm ${tab === key ? 'bg-ink text-white' : 'bg-card border border-line'}`}
            onClick={() => setTab(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <Card>
        {tab === 'colleges' ? (
          <Table
            columns={['代码', '学院', '专业数', '']}
            rows={db.colleges.map((item) => [
              item.code,
              item.name,
              String(db.majors.filter((major) => major.collegeId === item.id).length),
              <button className="text-xs text-muted" onClick={() => removeCollege(item.id)} type="button">
                删除
              </button>,
            ])}
          />
        ) : null}
        {tab === 'majors' ? (
          <Table
            columns={['代码', '专业', '所属学院', '']}
            rows={db.majors.map((item) => [
              item.code,
              item.name,
              db.colleges.find((college) => college.id === item.collegeId)?.name ?? '—',
              <button className="text-xs text-muted" onClick={() => removeMajor(item.id)} type="button">
                删除
              </button>,
            ])}
          />
        ) : null}
        {tab === 'classes' ? (
          <Table
            columns={['班级', '年级', '专业', '人数', '']}
            rows={db.classes.map((item) => [
              item.name,
              String(item.year),
              db.majors.find((major) => major.id === item.majorId)?.name ?? '—',
              String(db.students.filter((student) => student.classId === item.id).length),
              <button className="text-xs text-muted" onClick={() => removeClass(item.id)} type="button">
                删除
              </button>,
            ])}
          />
        ) : null}
      </Card>

      {open ? (
        <Modal
          title={tab === 'colleges' ? '新建学院' : tab === 'majors' ? '新建专业' : '新建行政班'}
          onClose={() => setOpen(false)}
        >
          {tab === 'colleges' ? (
            <OrgForm
              onSubmit={(form) => {
                saveCollege({ code: form.code, name: form.name })
                setOpen(false)
              }}
            />
          ) : null}
          {tab === 'majors' ? (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
                saveMajor({
                  code: String(data.get('code')),
                  name: String(data.get('name')),
                  collegeId: String(data.get('collegeId')),
                })
                setOpen(false)
              }}
            >
              <Field label="专业代码">
                <Input name="code" required />
              </Field>
              <Field label="专业名称">
                <Input name="name" required />
              </Field>
              <Field label="所属学院">
                <Select name="collegeId" required>
                  {db.colleges.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit">保存</Button>
            </form>
          ) : null}
          {tab === 'classes' ? (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
                saveClass({
                  name: String(data.get('name')),
                  year: Number(data.get('year')),
                  majorId: String(data.get('majorId')),
                })
                setOpen(false)
              }}
            >
              <Field label="班级名称">
                <Input name="name" placeholder="软工2501" required />
              </Field>
              <Field label="年级">
                <Input name="year" type="number" defaultValue={2026} required />
              </Field>
              <Field label="专业">
                <Select name="majorId" required>
                  {db.majors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit">保存</Button>
            </form>
          ) : null}
        </Modal>
      ) : null}
      <p className="mt-4 text-xs text-muted">
        <Badge>提示</Badge>
        <span className="ml-2">删除组织节点不会级联清理学生，请先调整学籍归属。</span>
      </p>
    </div>
  )
}

function OrgForm({ onSubmit }: { onSubmit: (item: { code: string; name: string }) => void }) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onSubmit({ code: String(data.get('code')), name: String(data.get('name')) })
      }}
    >
      <Field label="代码">
        <Input name="code" required />
      </Field>
      <Field label="名称">
        <Input name="name" required />
      </Field>
      <Button type="submit">保存</Button>
    </form>
  )
}
