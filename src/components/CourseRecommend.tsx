/**
 * 选课推荐组件（低耦合）
 * 
 * 设计原则：
 * - 低耦合：只依赖 recommend 服务和 ui 组件，不依赖任何页面
 * - 可复用：可放入选课页、Dashboard、课表页等任何位置
 * - Props 驱动：通过回调与外部通信，不直接操作外部状态
 */

import { useState } from 'react'
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge, Card } from './ui'
import { getRecommendDetails, type RecommendDetail } from '../lib/recommend'
import { useStore } from '../lib/store'
import { weekdayLabel, periodLabel } from '../lib/utils'

interface CourseRecommendProps {
  /** 限制显示数量，默认3 */
  limit?: number
  /** 点击选课按钮的回调（由外部处理选课逻辑） */
  onEnroll?: (offeringId: string) => void
  /** 自定义类名 */
  className?: string
}

export function CourseRecommend({ limit = 3, onEnroll, className = '' }: CourseRecommendProps) {
  const { db, user } = useStore()
  const [expanded, setExpanded] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const student = db.students.find((s) => s.id === user?.refId)
  if (!student) return null

  const recommendations = getRecommendDetails(db, student, limit)
  const warnings = getRecommendDetails(db, student, 100)
    .filter((r) => r.reasons.includes('low-seats'))
    .map((r) => `${r.courseName} ${r.section} 余量不足`)

  if (recommendations.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Sparkles size={16} />
          暂无推荐课程（可能已选满或全部冲突）
        </div>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* 头部 */}
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-black/[0.02]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <div>
            <div className="text-sm font-medium">智能推荐</div>
            <div className="text-xs text-muted">基于专业匹配、时间冲突与容量分析</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-ink"
            onClick={(e) => {
              e.stopPropagation()
              setRefreshKey((k) => k + 1)
            }}
            title="刷新推荐"
            type="button"
          >
            <RefreshCw size={14} />
          </button>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* 警告 */}
      {expanded && warnings.length > 0 && (
        <div className="mx-5 mb-3 rounded-xl bg-orange-50 px-4 py-2.5">
          <div className="text-xs font-medium text-warn">⚠️ 余量预警</div>
          <div className="mt-1 text-xs text-muted">{warnings.join('；')}</div>
        </div>
      )}

      {/* 推荐列表 */}
      {expanded && (
        <div key={refreshKey} className="space-y-3 px-5 pb-5">
          {recommendations.map((item) => (
            <RecommendCard
              key={item.offeringId}
              item={item}
              onEnroll={onEnroll}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

function RecommendCard({
  item,
  onEnroll,
}: {
  item: RecommendDetail
  onEnroll?: (offeringId: string) => void
}) {
  const scoreColor =
    item.score >= 85 ? 'text-accent' : item.score >= 70 ? 'text-ink' : 'text-muted'

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-paper px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{item.courseName}</span>
          <span className="text-xs text-muted">{item.courseCode}</span>
          <Badge tone={item.score >= 85 ? 'green' : 'neutral'}>{item.label}</Badge>
        </div>
        <div className="mt-1 text-xs text-muted">
          {item.teacherName} · {item.section} · {item.credits} 学分
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {weekdayLabel(item.weekday)} {periodLabel(item.startPeriod, item.endPeriod)} ·{' '}
          {item.location}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {item.reasons
            .filter((r) => r !== 'not-selected')
            .map((reason) => (
              <span
                key={reason}
                className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent"
              >
                {getReasonLabel(reason)}
              </span>
            ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <div className={`text-lg font-semibold ${scoreColor}`}>{item.score}</div>
          <div className="text-[10px] text-muted">匹配分</div>
        </div>
        <div className="text-xs text-muted">
          {item.enrolled}/{item.capacity}
        </div>
        {onEnroll && (
          <button
            className="rounded-full bg-accent px-3 py-1.5 text-xs text-white transition hover:bg-[#16382c]"
            onClick={() => onEnroll(item.offeringId)}
            type="button"
          >
            选课
          </button>
        )}
      </div>
    </div>
  )
}

function getReasonLabel(reason: string): string {
  const map: Record<string, string> = {
    'major-core': '专业相关',
    'prerequisite-ok': '先修满足',
    'no-conflict': '时间不冲突',
    'seats-available': '有名额',
    'low-seats': '余量紧张',
  }
  return map[reason] ?? reason
}
