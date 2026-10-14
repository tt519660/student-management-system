import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AdminClass,
  College,
  Course,
  Database,
  EnrollmentSource,
  Major,
  Offering,
  Role,
  Student,
  StudentStatus,
  Teacher,
  Term,
  User,
} from '../types'
import { canDrop, canEnroll } from './enrollment'
import { createSeed } from './seed'
import { nowIso, uid } from './utils'

const STORAGE_KEY = 'asms-db-v1'
const SESSION_KEY = 'asms-user'

function loadDb(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Database
  } catch {
    /* ignore */
  }
  return createSeed()
}

function loadSession(users: User[]): User | null {
  const id = sessionStorage.getItem(SESSION_KEY)
  return users.find((item) => item.id === id) ?? null
}

interface StoreValue {
  db: Database
  user: User | null
  login: (username: string, password: string) => string | null
  logout: () => void
  resetDemo: () => void
  saveCollege: (item: Omit<College, 'id'> & { id?: string }) => void
  removeCollege: (id: string) => void
  saveMajor: (item: Omit<Major, 'id'> & { id?: string }) => void
  removeMajor: (id: string) => void
  saveClass: (item: Omit<AdminClass, 'id'> & { id?: string }) => void
  removeClass: (id: string) => void
  saveStudent: (item: Omit<Student, 'id'> & { id?: string }) => void
  setStudentStatus: (id: string, status: StudentStatus) => void
  saveTeacher: (item: Omit<Teacher, 'id'> & { id?: string }) => void
  saveCourse: (item: Omit<Course, 'id'> & { id?: string }) => void
  removeCourse: (id: string) => void
  saveOffering: (item: Omit<Offering, 'id'> & { id?: string }) => void
  removeOffering: (id: string) => void
  saveTerm: (item: Omit<Term, 'id'> & { id?: string }) => void
  removeTerm: (id: string) => void
  enroll: (studentId: string, offeringId: string, source: EnrollmentSource) => string | null
  drop: (studentId: string, offeringId: string, asAdmin: boolean) => string | null
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => {
    const data = loadDb()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  })
  const [user, setUser] = useState<User | null>(() => loadSession(db.users))

  const persist = (next: Database) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setDb(next)
  }

  const log = (next: Database, action: string, detail: string) => {
    next.logs = [
      {
        id: uid(),
        at: nowIso(),
        actor: user?.displayName ?? '系统',
        action,
        detail,
      },
      ...next.logs,
    ].slice(0, 80)
  }

  const value = useMemo<StoreValue>(() => ({
    db,
    user,
    login: (username, password) => {
      const found = db.users.find(
        (item) => item.username === username.trim() && item.password === password,
      )
      if (!found) return '账号或密码不正确'
      sessionStorage.setItem(SESSION_KEY, found.id)
      setUser(found)
      return null
    },
    logout: () => {
      sessionStorage.removeItem(SESSION_KEY)
      setUser(null)
    },
    resetDemo: () => {
      const seed = createSeed()
      persist(seed)
      sessionStorage.removeItem(SESSION_KEY)
      setUser(null)
    },
    saveCollege: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        next.colleges = next.colleges.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        next.colleges.push({ ...item, id: uid() })
      }
      persist(next)
    },
    removeCollege: (id) => {
      const next = structuredClone(db)
      const college = next.colleges.find((row) => row.id === id)
      if (!college) return
      // 级联删除关联的专业
      const majorIds = next.majors.filter((row) => row.collegeId === id).map((row) => row.id)
      // 级联删除关联的班级
      const classIds = next.classes.filter((row) => majorIds.includes(row.majorId)).map((row) => row.id)
      // 级联删除关联的课程
      const courseIds = next.courses.filter((row) => row.collegeId === id).map((row) => row.id)
      // 级联删除关联的开课
      const offeringIds = next.offerings.filter((row) => courseIds.includes(row.courseId)).map((row) => row.id)

      next.colleges = next.colleges.filter((row) => row.id !== id)
      next.majors = next.majors.filter((row) => row.collegeId !== id)
      next.classes = next.classes.filter((row) => !majorIds.includes(row.majorId))
      next.students = next.students.filter(
        (row) => row.collegeId !== id && !classIds.includes(row.classId),
      )
      next.teachers = next.teachers.filter((row) => row.collegeId !== id)
      next.courses = next.courses.filter((row) => row.collegeId !== id)
      next.offerings = next.offerings.filter((row) => !courseIds.includes(row.courseId))
      next.enrollments = next.enrollments.filter((row) => !offeringIds.includes(row.offeringId))

      log(next, '删除学院', `${college.name}（含关联数据）`)
      persist(next)
    },
    saveMajor: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        next.majors = next.majors.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        next.majors.push({ ...item, id: uid() })
      }
      persist(next)
    },
    removeMajor: (id) => {
      const next = structuredClone(db)
      const major = next.majors.find((row) => row.id === id)
      if (!major) return
      // 级联删除关联的班级
      const classIds = next.classes.filter((row) => row.majorId === id).map((row) => row.id)

      next.majors = next.majors.filter((row) => row.id !== id)
      next.classes = next.classes.filter((row) => row.majorId !== id)
      next.students = next.students.filter((row) => row.majorId !== id && !classIds.includes(row.classId))

      log(next, '删除专业', `${major.name}（含关联班级和学生）`)
      persist(next)
    },
    saveClass: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        next.classes = next.classes.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        next.classes.push({ ...item, id: uid() })
      }
      persist(next)
    },
    removeClass: (id) => {
      const next = structuredClone(db)
      const cls = next.classes.find((row) => row.id === id)
      if (!cls) return

      next.classes = next.classes.filter((row) => row.id !== id)
      // 级联删除关联的学生学籍
      next.students = next.students.filter((row) => row.classId !== id)

      log(next, '删除行政班', `${cls.name}（含关联学生学籍）`)
      persist(next)
    },
    saveStudent: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        const prev = next.students.find((row) => row.id === item.id)
        next.students = next.students.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
        if (prev && prev.status !== item.status) {
          log(next, '学籍变更', `${item.name}：${prev.status} → ${item.status}`)
        }
      } else {
        const created = { ...item, id: uid() }
        next.students.push(created)
        next.users.push({
          id: uid(),
          username: created.studentNo,
          password: '123456',
          role: 'student',
          displayName: created.name,
          refId: created.id,
        })
        log(next, '新建学籍', `${created.name}（${created.studentNo}）`)
      }
      persist(next)
    },
    setStudentStatus: (id, status) => {
      const next = structuredClone(db)
      const student = next.students.find((row) => row.id === id)
      if (!student || student.status === status) return
      log(next, '学籍变更', `${student.name}：${student.status} → ${status}`)
      student.status = status
      persist(next)
    },
    saveTeacher: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        next.teachers = next.teachers.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        const created = { ...item, id: uid() }
        next.teachers.push(created)
        next.users.push({
          id: uid(),
          username: created.staffNo,
          password: '123456',
          role: 'teacher',
          displayName: created.name,
          refId: created.id,
        })
      }
      persist(next)
    },
    saveCourse: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        next.courses = next.courses.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        next.courses.push({ ...item, id: uid() })
      }
      persist(next)
    },
    removeCourse: (id) => {
      const next = structuredClone(db)
      const course = next.courses.find((row) => row.id === id)
      if (!course) return
      // 级联删除关联的开课
      const offeringIds = next.offerings.filter((row) => row.courseId === id).map((row) => row.id)

      next.courses = next.courses.filter((row) => row.id !== id)
      next.offerings = next.offerings.filter((row) => row.courseId !== id)
      next.enrollments = next.enrollments.filter((row) => !offeringIds.includes(row.offeringId))

      log(next, '删除课程', `${course.name}（含关联开课）`)
      persist(next)
    },
    saveOffering: (item) => {
      const next = structuredClone(db)
      if (item.id) {
        next.offerings = next.offerings.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        next.offerings.push({ ...item, id: uid() })
      }
      persist(next)
    },
    removeOffering: (id) => {
      const next = structuredClone(db)
      const offering = next.offerings.find((row) => row.id === id)
      if (!offering) return
      const course = next.courses.find((row) => row.id === offering.courseId)

      next.offerings = next.offerings.filter((row) => row.id !== id)
      next.enrollments = next.enrollments.filter((row) => row.offeringId !== id)

      log(next, '删除开课', `${course?.name ?? ''} ${offering.section}（含选课记录）`)
      persist(next)
    },
    saveTerm: (item) => {
      const next = structuredClone(db)
      // 如果设为当前学期，将其他学期设为非当前
      if (item.isCurrent) {
        next.terms = next.terms.map((row) => (row.id !== item.id ? { ...row, isCurrent: false } : row))
      }
      if (item.id) {
        next.terms = next.terms.map((row) => (row.id === item.id ? { ...row, ...item, id: row.id } : row))
      } else {
        next.terms.push({ ...item, id: uid() })
      }
      persist(next)
    },
    removeTerm: (id) => {
      const next = structuredClone(db)
      const term = next.terms.find((row) => row.id === id)
      if (!term) return
      // 级联删除关联的开课
      const offeringIds = next.offerings.filter((row) => row.termId === id).map((row) => row.id)

      next.terms = next.terms.filter((row) => row.id !== id)
      next.offerings = next.offerings.filter((row) => row.termId !== id)
      next.enrollments = next.enrollments.filter((row) => !offeringIds.includes(row.offeringId))

      log(next, '删除学期', `${term.name}（含关联开课）`)
      persist(next)
    },
    enroll: (studentId, offeringId, source) => {
      const error = canEnroll(db, studentId, offeringId, source === 'admin')
      if (error) return error
      const next = structuredClone(db)
      next.enrollments.push({
        id: uid(),
        studentId,
        offeringId,
        createdAt: nowIso(),
        source,
      })
      const student = next.students.find((row) => row.id === studentId)
      const offering = next.offerings.find((row) => row.id === offeringId)
      const course = next.courses.find((row) => row.id === offering?.courseId)
      if (source === 'admin') {
        log(next, '强制加选', `${student?.name} → ${course?.name} ${offering?.section}`)
      }
      persist(next)
      return null
    },
    drop: (studentId, offeringId, asAdmin) => {
      const error = canDrop(db, studentId, offeringId, asAdmin)
      if (error) return error
      const next = structuredClone(db)
      const exists = next.enrollments.find(
        (row) => row.studentId === studentId && row.offeringId === offeringId,
      )
      if (!exists) return '未选修该课程'
      next.enrollments = next.enrollments.filter((row) => row.id !== exists.id)
      if (asAdmin) {
        const student = next.students.find((row) => row.id === studentId)
        const offering = next.offerings.find((row) => row.id === offeringId)
        const course = next.courses.find((row) => row.id === offering?.courseId)
        log(next, '强制退选', `${student?.name} ← ${course?.name} ${offering?.section}`)
      }
      persist(next)
      return null
    },
  }), [db, user])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}

export function roleLabel(role: Role) {
  if (role === 'admin') return '教务管理员'
  if (role === 'teacher') return '教师'
  return '学生'
}
