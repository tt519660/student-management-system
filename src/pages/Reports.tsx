import { Button, Card, PageHeader, Table } from '../components/ui'
import { enrolledCount, remainingSeats } from '../lib/enrollment'
import { useStore } from '../lib/store'
import { downloadCsv } from '../lib/utils'

export function ReportsPage() {
  const { db } = useStore()

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

  return (
    <div>
      <PageHeader
        kicker="Reports"
        title="统计报表"
        subtitle="在籍人数与开课容量。导出为 CSV，可用 Excel 打开。"
        actions={
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
        }
      />
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
            return [
              course?.name ?? '',
              item.section,
              teacher?.name ?? '',
              String(item.capacity),
              String(enrolledCount(db, item.id)),
              String(remainingSeats(db, item)),
            ]
          })}
        />
      </Card>
    </div>
  )
}
