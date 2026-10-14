export type Role = 'admin' | 'teacher' | 'student'
export type Gender = '男' | '女'
export type StudentStatus = '在读' | '休学' | '退学' | '毕业'
export type EnrollmentSource = 'self' | 'admin'

export interface User {
  id: string
  username: string
  password: string
  role: Role
  displayName: string
  refId?: string
}

export interface College {
  id: string
  code: string
  name: string
}

export interface Major {
  id: string
  collegeId: string
  code: string
  name: string
}

export interface AdminClass {
  id: string
  majorId: string
  name: string
  year: number
}

export interface Student {
  id: string
  studentNo: string
  name: string
  gender: Gender
  enrollYear: number
  collegeId: string
  majorId: string
  classId: string
  status: StudentStatus
}

export interface Teacher {
  id: string
  staffNo: string
  name: string
  collegeId: string
  title: string
}

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  hours: number
  collegeId: string
}

export interface Term {
  id: string
  name: string
  enrollStart: string
  enrollEnd: string
  isCurrent: boolean
}

export interface Offering {
  id: string
  courseId: string
  termId: string
  teacherId: string
  section: string
  capacity: number
  weekday: number
  startPeriod: number
  endPeriod: number
  location: string
}

export interface Enrollment {
  id: string
  studentId: string
  offeringId: string
  createdAt: string
  source: EnrollmentSource
}

export interface AuditLog {
  id: string
  at: string
  actor: string
  action: string
  detail: string
}

export interface Database {
  users: User[]
  colleges: College[]
  majors: Major[]
  classes: AdminClass[]
  students: Student[]
  teachers: Teacher[]
  courses: Course[]
  terms: Term[]
  offerings: Offering[]
  enrollments: Enrollment[]
  logs: AuditLog[]
}
