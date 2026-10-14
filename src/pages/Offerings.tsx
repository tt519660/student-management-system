import { useState } from 'react'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Table } from '../components/ui'
import { currentTerm, enrolledCount, remainingSeats } from '../lib/enrollment'
import { useStore } from '../lib/store'
import type { Offering } from '../types'
import { periodLabel, weekdayLabel } from '../lib/utils'

export function OfferingsPage() {
  const { db, user, saveOffering, enroll, drop } = useStore()
  const term = currentTerm(db)
  const [editing, setEditing] = useState<Partial<Offering> | null>(null)
  const [rosterId, setRosterId] = useState<string | null>(null)
  const [forceStudent, setForceStudent] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const list =
    user?.role === 'teacher'
      ? db.offerings.filter((item) => item.teacherId === user.refId)
      : db.offerings

  const roster = rosterId ? db.offerings.find((item) => item.id === rosterId) : null

  return (
    <div>
      <PageHeader
        kicker="Offerings"
        title={user?.role === 'teacher' ? '我的授课' : '开课管理'}
        subtitle={term?.name}
        actions={
          user?.role === 'admin' ? (
            <Button
              onClick={() =>
                setEditing({
                  termId: term?.id,
                  weekday: 1,
                  startPeriod: 1,
                  endPeriod: 2,
                  capacity: 40,
                  section: 'A班',
                })
              }
            >
              新建教学班
            </Button>
          ) : null
        }
      />
      <Card>
        <Table
          columns={['课程', '教学班', '教师', '时间地点', '容量', '']}
          rows={list.map((item) => {
            const course = db.courses.find((row) => row.id === item.courseId)
            const teacher = db.teachers.find((row) => row.id === item.teacherId)
            const left = remainingSeats(db, item)
            return [
              <div>
                <div className="font-medium">{course?.name}</div>
                <div className="text-xs text-muted">{course?.code}</div>
              </div>,
              item.section,
              teacher?.name ?? '—',
              `${weekdayLabel(item.weekday)} ${periodLabel(item.startPeriod, item.endPeriod)} · ${item.location}`,
              <span>
                {enrolledCount(db, item.id)} / {item.capacity}
                {left <= 5 ? (
                  <Badge tone="warn">余 {left}</Badge>
                ) : null}
              </span>,
              <button className="text-xs text-accent" onClick={() => setRosterId(item.id)} type="button">
                名单
              </button>,
            ]
          })}
        />
      </Card>

      {editing && user?.role === 'admin' ? (
        <Modal title="新建 / 编辑教学班" onClose={() => setEditing(null)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              saveOffering({
                id: editing.id,
                courseId: String(data.get('courseId')),
                termId: String(data.get('termId')),
                teacherId: String(data.get('teacherId')),
                section: String(data.get('section')),
                capacity: Number(data.get('capacity')),
                weekday: Number(data.get('weekday')),
                startPeriod: Number(data.get('startPeriod')),
                endPeriod: Number(data.get('endPeriod')),
                location: String(data.get('location')),
              })
              setEditing(null)
            }}
          >
            <Field label="课程">
              <Select name="courseId" defaultValue={editing.courseId ?? db.courses[0]?.id}>
                {db.courses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <input type="hidden" name="termId" value={editing.termId ?? term?.id} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="教学班">
                <Input name="section" defaultValue={editing.section} required />
              </Field>
              <Field label="容量">
                <Input name="capacity" type="number" defaultValue={editing.capacity} required />
              </Field>
              <Field label="教师">
                <Select name="teacherId" defaultValue={editing.teacherId ?? db.teachers[0]?.id}>
                  {db.teachers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="地点">
                <Input name="location" defaultValue={editing.location} required />
              </Field>
              <Field label="星期">
                <Select name="weekday" defaultValue={editing.weekday}>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <option key={day} value={day}>
                      {weekdayLabel(day)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="节次">
                <div className="grid grid-cols-2 gap-2">
                  <Input name="startPeriod" type="number" min={1} max={10} defaultValue={editing.startPeriod} />
                  <Input name="endPeriod" type="number" min={1} max={10} defaultValue={editing.endPeriod} />
                </div>
              </Field>
            </div>
            <Button type="submit">保存</Button>
          </form>
        </Modal>
      ) : null}

      {roster ? (
        <Modal
          title={`${db.courses.find((item) => item.id === roster.courseId)?.name} ${roster.section}`}
          onClose={() => {
            setRosterId(null)
            setMessage(null)
          }}
        >
          <Table
            columns={['学号', '姓名', '来源', '']}
            empty="还没有学生"
            rows={db.enrollments
              .filter((item) => item.offeringId === roster.id)
              .map((item) => {
                const student = db.students.find((row) => row.id === item.studentId)
                return [
                  student?.studentNo ?? '',
                  student?.name ?? '',
                  item.source === 'admin' ? '教务加选' : '自选',
                  user?.role === 'admin' ? (
                    <button
                      className="text-xs text-warn"
                      onClick={() => drop(item.studentId, roster.id, true)}
                      type="button"
                    >
                      退选
                    </button>
                  ) : (
                    ''
                  ),
                ]
              })}
          />
          {user?.role === 'admin' ? (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                const student = db.students.find(
                  (item) => item.studentNo === forceStudent.trim() || item.name === forceStudent.trim(),
                )
                if (!student) {
                  setMessage('未找到学生')
                  return
                }
                setMessage(enroll(student.id, roster.id, 'admin') ?? '已加选')
                setForceStudent('')
              }}
            >
              <Input
                placeholder="学号或姓名，强制加选"
                value={forceStudent}
                onChange={(event) => setForceStudent(event.target.value)}
              />
              <Button type="submit">加选</Button>
            </form>
          ) : null}
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
        </Modal>
      ) : null}
    </div>
  )
}
