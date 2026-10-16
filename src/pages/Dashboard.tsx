import { Link } from 'react-router-dom'
import { Badge, Card, PageHeader } from '../components/ui'
import { currentTerm, enrolledCount, enrollmentOpen, remainingSeats, studentOfferings } from '../lib/enrollment'
import { useStore } from '../lib/store'
import { periodLabel, weekdayLabel } from '../lib/utils'

export function DashboardPage() {
  const { db, user, remoteLoaded } = useStore()
  const term = currentTerm(db)
  const activeStudents = db.students.filter((item) => item.status === '在读').length

  const dataBadge = (
    <Badge tone={remoteLoaded ? 'green' : 'warn'}>
      {remoteLoaded ? '后端数据' : '本地数据'}
    </Badge>
  )

  if (user?.role === 'student') {
    const mine = studentOfferings(db, user.refId ?? '')
    const credits = mine.reduce((sum, offering) => {
      const course = db.courses.find((item) => item.id === offering.courseId)
      return sum + (course?.credits ?? 0)
    }, 0)
    return (
      <div>
        <PageHeader
          kicker="Overview"
          title={`你好，${user.displayName}`}
          subtitle={term?.name}
          actions={dataBadge}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="已选课程" value={String(mine.length)} />
          <Stat label="已选学分" value={String(credits)} />
          <Stat label="选课窗口" value={enrollmentOpen(db) ? '开放' : '关闭'} />
        </div>
        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">本学期课表摘要</h2>
            <Link className="text-sm text-accent" to="/select">
              去选课
            </Link>
          </div>
          <div className="grid gap-3">
            {mine.length === 0 ? <p className="text-sm text-muted">还没有选课。</p> : null}
            {mine.map((offering) => {
              const course = db.courses.find((item) => item.id === offering.courseId)
              return (
                <div key={offering.id} className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
                  <div>
                    <div className="font-medium">{course?.name}</div>
                    <div className="text-xs text-muted">
                      {weekdayLabel(offering.weekday)} {periodLabel(offering.startPeriod, offering.endPeriod)} · {offering.location}
                    </div>
                  </div>
                  <div className="text-sm text-muted">{course?.credits} 学分</div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    )
  }

  if (user?.role === 'teacher') {
    const mine = db.offerings.filter((item) => item.teacherId === user.refId)
    return (
      <div>
        <PageHeader
          kicker="Overview"
          title={`你好，${user.displayName}老师`}
          subtitle="本学期授课一览"
          actions={dataBadge}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="授课班" value={String(mine.length)} />
          <Stat label="学生人次" value={String(mine.reduce((sum, item) => sum + enrolledCount(db, item.id), 0))} />
          <Stat label="当前学期" value={term?.name.split(' ')[0] ?? '—'} />
        </div>
        <div className="mt-6 grid gap-3">
          {mine.map((offering) => {
            const course = db.courses.find((item) => item.id === offering.courseId)
            return (
              <Card key={offering.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="font-medium">{course?.name} · {offering.section}</div>
                  <div className="text-sm text-muted">
                    {weekdayLabel(offering.weekday)} {periodLabel(offering.startPeriod, offering.endPeriod)} · {offering.location}
                  </div>
                </div>
                <div className="text-sm">
                  {enrolledCount(db, offering.id)} / {offering.capacity}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const tight = db.offerings.filter((item) => remainingSeats(db, item) <= 5)

  return (
    <div>
      <PageHeader
        kicker="Overview"
        title="学期秩序"
        subtitle="学籍、开课与选课的当前截面。"
        actions={dataBadge}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="在读学生" value={String(activeStudents)} />
        <Stat label="教师" value={String(db.teachers.length)} />
        <Stat label="本学期开课" value={String(db.offerings.length)} />
        <Stat label="选课记录" value={String(db.enrollments.length)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-2xl">容量告急</h2>
          <p className="mt-1 mb-4 text-sm text-muted">剩余座位不超过 5 的教学班</p>
          {tight.length === 0 ? <p className="text-sm text-muted">暂无。</p> : null}
          <div className="grid gap-2">
            {tight.map((offering) => {
              const course = db.courses.find((item) => item.id === offering.courseId)
              return (
                <div key={offering.id} className="flex justify-between text-sm">
                  <span>{course?.name} {offering.section}</span>
                  <span className="text-warn">余 {remainingSeats(db, offering)}</span>
                </div>
              )
            })}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-2xl">最近审计</h2>
          <div className="mt-4 grid gap-3">
            {db.logs.slice(0, 6).map((item) => (
              <div key={item.id} className="text-sm">
                <div className="font-medium">{item.action}</div>
                <div className="text-muted">{item.detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs tracking-wide text-muted">{label}</div>
      <div className="mt-3 font-display text-4xl">{value}</div>
    </Card>
  )
}
