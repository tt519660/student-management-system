import type { Database, Offering } from '../types'
import { inWindow } from './utils'

export function enrolledCount(db: Database, offeringId: string) {
  return db.enrollments.filter((item) => item.offeringId === offeringId).length
}

export function remainingSeats(db: Database, offering: Offering) {
  return offering.capacity - enrolledCount(db, offering.id)
}

export function periodsOverlap(a: Offering, b: Offering) {
  if (a.weekday !== b.weekday) return false
  return a.startPeriod <= b.endPeriod && b.startPeriod <= a.endPeriod
}

export function studentOfferings(db: Database, studentId: string) {
  const ids = new Set(
    db.enrollments.filter((item) => item.studentId === studentId).map((item) => item.offeringId),
  )
  return db.offerings.filter((item) => ids.has(item.id))
}

export function currentTerm(db: Database) {
  return db.terms.find((item) => item.isCurrent) ?? db.terms[0]
}

export function enrollmentOpen(db: Database) {
  const term = currentTerm(db)
  return term ? inWindow(term.enrollStart, term.enrollEnd) : false
}

export function canEnroll(
  db: Database,
  studentId: string,
  offeringId: string,
  asAdmin: boolean,
): string | null {
  const student = db.students.find((item) => item.id === studentId)
  const offering = db.offerings.find((item) => item.id === offeringId)
  if (!student || !offering) return '记录不存在'
  if (student.status !== '在读') return '仅在读学生可以选课'
  if (db.enrollments.some((item) => item.studentId === studentId && item.offeringId === offeringId)) {
    return '已选修该教学班'
  }
  if (remainingSeats(db, offering) <= 0) return '容量已满'
  const conflict = studentOfferings(db, studentId).find((item) => periodsOverlap(item, offering))
  if (conflict) return '与已选课程时间冲突'
  if (!asAdmin && !enrollmentOpen(db)) return '不在选课窗口内'
  return null
}

export function canDrop(db: Database, studentId: string, offeringId: string, asAdmin: boolean) {
  const exists = db.enrollments.find(
    (item) => item.studentId === studentId && item.offeringId === offeringId,
  )
  if (!exists) return '未选修该课程'
  if (!asAdmin && !enrollmentOpen(db)) return '不在选课窗口内，无法退选'
  return null
}
