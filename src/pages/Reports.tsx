import { useState } from 'react'
import { Button, Card, PageHeader, Table } from '../components/ui'
import { enrolledCount, remainingSeats } from '../lib/enrollment'
import { useStore } from '../lib/store'
import { downloadCsv } from '../lib/utils'
import { interpretReport } from '../lib/llm'

export function ReportsPage() {
  const { db } = useStore()
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const byCollege = db.colleges.map((college) => ({
    name: college.name,
    total: db.students.filter((item) => item.collegeId === college.id).length,
    active: db.students.filter((item) => item.collegeId === college.id && item.status === '在读').length,
  }))

  const byMajor = db.majors.map((major) => ({
    name: major.name,
    total: db.students.filter((item) => item.majorId === major.id).length,
  }))

  const byClass = db.classes.map((item) => ({
    name: item.name,
    total: db.students.filter((student) => student.classId === item.id).length,
  }))

  const totalActive = db.students.filter((s) => s.status === '在读').length
  const totalEnrollments = db.enrollments.length
  const totalCapacity = db.offerings.reduce((sum, o) => sum + o.capacity, 0)
  const enrollmentRate = totalCapacity > 0 ? Math.round((totalEnrollments / totalCapacity) * 100) : 0

  const handleAiAnalysis = async () => {
    setAiLoading(true)
    setAiAnalysis(null)

    const result = await interpretReport({
      colleges: byCollege,
      majors: byMajor,
      classes: byClass,
      offerings: db.offerings.map((item) => {
        const course = db.courses.find((row) => row.id === item.courseId)
        return {
          course: course?.name ?? '',
          section: item.section,
          capacity: item.capacity,
          enrolled: enrolledCount(db, item.id),
          remaining: remainingSeats(db, item),
        }
      }),
      totalStudents: db.students.length,
      totalTeachers: db.teachers.length,
      totalOfferings: db.offerings.length,
      enrollmentRate,
    })

    setAiAnalysis(result)
    setAiLoading(false)
  }

  return (
    <div>
      <PageHeader
        kicker="Reports"
        title="统计报表"
        subtitle="在籍人数与开课容量。导出为 CSV，可用 Excel 打开。"
        actions={
          <>
            <Button
              variant="line"
              onClick={handleAiAnalysis}
              disabled={aiLoading}
            >
              {aiLoading ? '分析中...' : 'AI 智能解读'}
            </Button>
            <Button
              variant="line"
              onClick={() => {
                downloadCsv('offerings.csv', [
                  ['课程', '教学班', '容量', '已选', '剩余'],
                  ...db.offerings.map((item) => {
                    const course = db.courses.find((row) => row.id === item.courseId)
                    return [
                      course?.name ?? '',
                      item.section,
                      String(item.capacity),
                      String(enrolledCount(db, item.id)),
                      String(remainingSeats(db, item)),
                    ]
                  }),
                ])
              }}
            >
              导出开课报表
            </Button>
          </>
        }
      />

      {/* AI 智能解读区域 */}
      {aiAnalysis && (
        <Card className="mb-6 border-accent/30 bg-accent-soft/50 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl text-accent">AI 数据解读</h2>
            <button
              className="text-xs text-muted hover:text-ink"
              onClick={() => setAiAnalysis(null)}
              type="button"
            >
              关闭
            </button>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {aiAnalysis}
          </div>
        </Card>
      )}

      {aiLoading && (
        <Card className="mb-6 p-5">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
            </span>
            正在分析报表数据...
          </div>
        </Card>
      )}

      {/* 关键指标 */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="text-xs tracking-wide text-muted">学生总数</div>
          <div className="mt-2 font-display text-3xl">{db.students.length}</div>
          <div className="mt-1 text-xs text-muted">在读 {totalActive} 人</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs tracking-wide text-muted">教师总数</div>
          <div className="mt-2 font-display text-3xl">{db.teachers.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs tracking-wide text-muted">开课总数</div>
          <div className="mt-2 font-display text-3xl">{db.offerings.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs tracking-wide text-muted">平均选课率</div>
          <div className="mt-2 font-display text-3xl">{enrollmentRate}%</div>
          <div className="mt-1 text-xs text-muted">
            {totalEnrollments} / {totalCapacity}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-2xl">学院在籍</h2>
          <Table
            columns={['学院', '总人数', '在读']}
            rows={byCollege.map((item) => [item.name, String(item.total), String(item.active)])}
          />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display text-2xl">专业人数</h2>
          <Table
            columns={['专业', '人数']}
            rows={byMajor.map((item) => [item.name, String(item.total)])}
          />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display text-2xl">行政班</h2>
          <Table
            columns={['班级', '人数']}
            rows={byClass.map((item) => [item.name, String(item.total)])}
          />
        </Card>
      </div>

      <Card className="mt-4">
        <div className="px-5 pt-5 font-display text-2xl">开课容量</div>
        <Table
          columns={['课程', '教学班', '教师', '容量', '已选', '剩余']}
          rows={db.offerings.map((item) => {
            const course = db.courses.find((row) => row.id === item.courseId)
            const teacher = db.teachers.find((row) => row.id === item.teacherId)
            const remaining = remainingSeats(db, item)
            return [
              course?.name ?? '',
              item.section,
              teacher?.name ?? '',
              String(item.capacity),
              String(enrolledCount(db, item.id)),
              remaining <= 5 ? (
                <span className="text-warn">余 {remaining}</span>
              ) : (
                String(remaining)
              ),
            ]
          })}
        />
      </Card>
    </div>
  )
}
