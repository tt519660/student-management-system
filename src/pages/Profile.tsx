import { Badge, Card, PageHeader } from '../components/ui'
import { useStore } from '../lib/store'

export function ProfilePage() {
  const { db, user } = useStore()
  const student = db.students.find((item) => item.id === user?.refId)
  if (!student) return <p>未找到学籍档案。</p>

  const rows = [
    ['学号', student.studentNo],
    ['姓名', student.name],
    ['性别', student.gender],
    ['入学年', String(student.enrollYear)],
    ['学院', db.colleges.find((item) => item.id === student.collegeId)?.name ?? '—'],
    ['专业', db.majors.find((item) => item.id === student.majorId)?.name ?? '—'],
    ['行政班', db.classes.find((item) => item.id === student.classId)?.name ?? '—'],
  ]

  return (
    <div>
      <PageHeader kicker="Profile" title="我的档案" subtitle="学籍信息只读，变更请联系教务。" />
      <Card className="max-w-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="font-display text-3xl">{student.name}</div>
            <div className="mt-1 text-sm text-muted">{student.studentNo}</div>
          </div>
          <Badge tone={student.status === '在读' ? 'green' : 'muted'}>{student.status}</Badge>
        </div>
        <dl className="grid gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-line py-2 text-sm last:border-0">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}
