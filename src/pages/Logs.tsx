import { useMemo, useState } from 'react'
import { Badge, Card, Input, PageHeader, Select, Table } from '../components/ui'
import { useStore } from '../lib/store'

export function LogsPage() {
  const { db } = useStore()
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')

  const actions = useMemo(() => {
    const set = new Set(db.logs.map((item) => item.action))
    return Array.from(set)
  }, [db.logs])

  const filtered = useMemo(() => {
    return db.logs.filter((item) => {
      if (actor && !item.actor.includes(actor)) return false
      if (action && item.action !== action) return false
      return true
    })
  }, [db.logs, actor, action])

  return (
    <div>
      <PageHeader
        kicker="Logs"
        title="操作日志"
        subtitle="记录学籍变更、强制加退选等关键操作。"
      />
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="w-48">
          <Input
            placeholder="按操作人筛选"
            value={actor}
            onChange={(event) => setActor(event.target.value)}
          />
        </div>
        <div className="w-48">
          <Select value={action} onChange={(event) => setAction(event.target.value)}>
            <option value="">全部操作类型</option>
            {actions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center text-sm text-muted">
          共 {filtered.length} 条记录
        </div>
      </div>
      <Card>
        <Table
          columns={['时间', '操作人', '操作类型', '详情']}
          empty="暂无日志"
          rows={filtered.map((item) => [
            new Date(item.at).toLocaleString('zh-CN'),
            item.actor,
            <Badge
              tone={
                item.action.includes('变更')
                  ? 'warn'
                  : item.action.includes('加选') || item.action.includes('新建')
                    ? 'green'
                    : 'neutral'
              }
            >
              {item.action}
            </Badge>,
            item.detail,
          ])}
        />
      </Card>
    </div>
  )
}
