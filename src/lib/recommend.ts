/**
 * 选课智能推荐服务（高内聚模块）
 * 
 * 设计原则：
 * - 高内聚：所有推荐逻辑集中在此模块
 * - 低耦合：不依赖任何 UI 组件，只依赖类型定义和 LLM 服务
 * - 可替换：接口稳定，可独立升级算法或切换 LLM 提供商
 */

import type { Database, Student } from '../types'
import { enrolledCount, remainingSeats, studentOfferings, periodsOverlap } from './enrollment'

// ========== 类型定义 ==========

export type RecommendReason =
  | 'major-core'      // 专业核心课
  | 'prerequisite-ok' // 先修已满足
  | 'no-conflict'     // 时间无冲突
  | 'seats-available' // 有名额
  | 'low-seats'       // 余量紧张
  | 'not-selected'    // 未选修
  | 'conflict'        // 时间冲突
  | 'full'            // 已满
  | 'already'         // 已选修

export interface RecommendItem {
  offeringId: string
  score: number                // 推荐分数 0-100
  reasons: RecommendReason[]   // 推荐理由
  label: string                // 人类可读的推荐标签
}

export interface RecommendResult {
  recommended: RecommendItem[] // 推荐选课
  avoid: RecommendItem[]       // 建议跳过
  warnings: string[]           // 警告信息
}

// ========== 推荐引擎 ==========

class RecommendationEngine {
  /**
   * 生成推荐结果
   * 同步计算基础推荐，无需 LLM
   */
  generate(db: Database, student: Student): RecommendResult {
    const myEnrollments = studentOfferings(db, student.id)
    const myOfferingIds = new Set(myEnrollments.map((o) => o.id))

    const recommended: RecommendItem[] = []
    const avoid: RecommendItem[] = []
    const warnings: string[] = []

    for (const offering of db.offerings) {
      // 跳过已选
      if (myOfferingIds.has(offering.id)) {
        avoid.push({
          offeringId: offering.id,
          score: 0,
          reasons: ['already'],
          label: '已选修',
        })
        continue
      }

      const course = db.courses.find((c) => c.id === offering.courseId)
      const reasons: RecommendReason[] = []
      let score = 50 // 基础分

      // 检查时间冲突
      const conflict = myEnrollments.find((e) => periodsOverlap(e, offering))
      if (conflict) {
        const conflictCourse = db.courses.find((c) => c.id === conflict.courseId)
        avoid.push({
          offeringId: offering.id,
          score: 0,
          reasons: ['conflict'],
          label: `与 ${conflictCourse?.name ?? '已选课程'} 时间冲突`,
        })
        continue
      }
      reasons.push('no-conflict')
      score += 20

      // 检查名额
      const remaining = remainingSeats(db, offering)
      if (remaining <= 0) {
        avoid.push({
          offeringId: offering.id,
          score: 0,
          reasons: ['full'],
          label: '容量已满',
        })
        continue
      }

      if (remaining <= 5) {
        reasons.push('low-seats')
        score += 10 // 余量紧张但还有，适当加分提醒
        warnings.push(`${course?.name} ${offering.section} 仅剩 ${remaining} 个名额`)
      } else {
        reasons.push('seats-available')
        score += 5
      }

      // 专业匹配加分
      if (course && course.collegeId === student.collegeId) {
        reasons.push('major-core')
        score += 20
      }

      // 学分适中加分（3-4学分较优）
      if (course && course.credits >= 3 && course.credits <= 4) {
        score += 5
      }

      reasons.push('not-selected')

      recommended.push({
        offeringId: offering.id,
        score: Math.min(score, 100),
        reasons,
        label: this.buildLabel(score),
      })
    }

    // 按分数排序
    recommended.sort((a, b) => b.score - a.score)

    return { recommended, avoid, warnings }
  }

  private buildLabel(score: number): string {
    if (score >= 85) return '强烈推荐'
    if (score >= 70) return '推荐'
    if (score >= 55) return '可选'
    return '一般'
  }
}

// ========== 单例导出 ==========

const engine = new RecommendationEngine()

/**
 * 获取选课推荐
 * @param db 数据库状态
 * @param student 当前学生
 * @returns 推荐结果
 */
export function getRecommendations(db: Database, student: Student): RecommendResult {
  return engine.generate(db, student)
}

/**
 * 获取推荐课程详情（用于展示）
 */
export interface RecommendDetail extends RecommendItem {
  courseName: string
  courseCode: string
  section: string
  teacherName: string
  credits: number
  weekday: number
  startPeriod: number
  endPeriod: number
  location: string
  enrolled: number
  capacity: number
}

export function getRecommendDetails(
  db: Database,
  student: Student,
  limit = 3,
): RecommendDetail[] {
  const result = getRecommendations(db, student)

  return result.recommended.slice(0, limit).map((item) => {
    const offering = db.offerings.find((o) => o.id === item.offeringId)!
    const course = db.courses.find((c) => c.id === offering.courseId)!
    const teacher = db.teachers.find((t) => t.id === offering.teacherId)

    return {
      ...item,
      courseName: course.name,
      courseCode: course.code,
      section: offering.section,
      teacherName: teacher?.name ?? '—',
      credits: course.credits,
      weekday: offering.weekday,
      startPeriod: offering.startPeriod,
      endPeriod: offering.endPeriod,
      location: offering.location,
      enrolled: enrolledCount(db, offering.id),
      capacity: offering.capacity,
    }
  })
}
