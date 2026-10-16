import { useState } from 'react'
import { Badge, Button, Card, PageHeader } from '../components/ui'
import { CourseRecommend } from '../components/CourseRecommend'
import { currentTerm, enrolledCount, enrollmentOpen, remainingSeats, studentOfferings } from '../lib/enrollment'
import { useStore } from '../lib/store'
import { periodLabel, weekdayLabel } from '../lib/utils'

export function SelectCoursesPage() {
  const { db, user, enroll, drop } = useStore()
  const [hint, setHint] = useState<string | null>(null)
  const studentId = user?.refId ?? ''
  const mine = new Set(studentOfferings(db, studentId).map((item) => item.id))
  const term = currentTerm(db)
  const open = enrollmentOpen(db)

  const handleQuickEnroll = (offeringId: string) => {
    setHint(enroll(studentId, offeringId, 'self'))
  }

  return (
    <div>
      <PageHeader
        kicker="Enrollment"
        title="选课"
        subtitle={`${term?.name} · 容量不足或时间冲突会被拒绝。`}
        actions={<Badge tone={open ? 'green' : 'warn'}>{open ? '窗口开放' : '窗口关闭'}</Badge>}
      />
      {hint ? <p className="mb-4 text-sm text-warn">{hint}</p> : null}

      {/* 智能推荐模块（低耦合，独立组件） */}
      <CourseRecommend
        className="mb-6"
        limit={3}
        onEnroll={handleQuickEnroll}
      />

      <div className="grid gap-3">
        {db.offerings.map((offering) => {
          const course = db.courses.find((item) => item.id === offering.courseId)
          const teacher = db.teachers.find((item) => item.id === offering.teacherId)
          const selected = mine.has(offering.id)
          const left = remainingSeats(db, offering)
          return (
            <Card key={offering.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium">{course?.name}</h3>
                  <span className="text-xs text-muted">{course?.code} · {offering.section}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {teacher?.name} · {weekdayLabel(offering.weekday)} {periodLabel(offering.startPeriod, offering.endPeriod)} · {offering.location}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <div>{course?.credits} 学分</div>
                  <div className={left <= 5 ? 'text-warn' : 'text-muted'}>
                    {enrolledCount(db, offering.id)} / {offering.capacity}
                  </div>
                </div>
                {selected ? (
                  <Button variant="danger" onClick={() => setHint(drop(studentId, offering.id, false))}>
                    退选
                  </Button>
                ) : (
                  <Button
                    variant="line"
                    onClick={() => setHint(enroll(studentId, offering.id, 'self'))}
                    disabled={!open || left <= 0}
                  >
                    选课
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
