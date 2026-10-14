import { Card, PageHeader } from '../components/ui'
import { studentOfferings } from '../lib/enrollment'
import { useStore } from '../lib/store'
import type { Offering } from '../types'
import { weekdayLabel } from '../lib/utils'

const days = [1, 2, 3, 4, 5]
const periods = [1, 2, 3, 4, 5, 6, 7, 8]

export function SchedulePage() {
  const { db, user } = useStore()
  let offerings: Offering[] = []
  if (user?.role === 'student') offerings = studentOfferings(db, user.refId ?? '')
  else if (user?.role === 'teacher') offerings = db.offerings.filter((item) => item.teacherId === user.refId)
  else offerings = db.offerings

  return (
    <div>
      <PageHeader kicker="Timetable" title="课表" subtitle="周一至周五，第 1–8 节。" />
      <Card className="overflow-x-auto p-4">
        <div className="grid min-w-[720px] grid-cols-[64px_repeat(5,1fr)] gap-2">
          <div />
          {days.map((day) => (
            <div key={day} className="py-2 text-center text-xs tracking-wide text-muted">
              {weekdayLabel(day)}
            </div>
          ))}
          {periods.map((period) => (
            <PeriodRow key={period} period={period} offerings={offerings} courses={db.courses} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function PeriodRow({
  period,
  offerings,
  courses,
}: {
  period: number
  offerings: Offering[]
  courses: { id: string; name: string }[]
}) {
  return (
    <>
      <div className="grid place-items-center text-xs text-muted">{period}</div>
      {days.map((day) => {
        const hit = offerings.find(
          (item) => item.weekday === day && item.startPeriod <= period && item.endPeriod >= period,
        )
        if (!hit) return <div key={day} className="h-16 rounded-xl bg-black/[0.03]" />
        const course = courses.find((item) => item.id === hit.courseId)
        const isStart = hit.startPeriod === period
        return (
          <div
            key={day}
            className={`h-16 px-3 ${isStart ? 'rounded-t-xl pt-3' : ''} ${
              hit.endPeriod === period ? 'rounded-b-xl' : ''
            } bg-accent-soft text-accent`}
          >
            {isStart ? (
              <>
                <div className="text-sm font-medium">{course?.name}</div>
                <div className="text-[11px] opacity-70">{hit.location}</div>
              </>
            ) : null}
          </div>
        )
      })}
    </>
  )
}
