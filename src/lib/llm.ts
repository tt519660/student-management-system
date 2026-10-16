// LLM API 服务 - 智能问答与报表解读

const LLM_API_URL = 'https://api.openai.com/v1/chat/completions'
const LLM_MODEL = 'gpt-4o-mini'

// 从环境变量或配置读取，生产环境应由后端代理
let apiKey = ''
export function setApiKey(key: string) {
  apiKey = key
}
export function getApiKey() {
  return apiKey
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

async function chat(messages: ChatMessage[], options: LLMOptions = {}): Promise<string> {
  if (!apiKey) {
    return '请先配置 API Key（点击设置图标输入）'
  }

  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `API 错误: ${res.status}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? '无响应内容'
  } catch (err) {
    console.error('LLM 调用失败:', err)
    return `请求失败: ${err instanceof Error ? err.message : '未知错误'}`
  }
}

// ========== 智能问答 ==========

const QA_SYSTEM_PROMPT = `你是"学苑"高校学生管理系统的智能助手。请用简洁友好的中文回答用户问题。

系统功能包括：
- 角色登录：管理员(admin)、教师(T10001)、学生(2024010101)
- 组织架构：学院、专业、行政班管理
- 学生学籍：新增、编辑、状态变更（在读/休学/退学/毕业）
- 教师档案、课程库管理
- 学期管理：设置选课时间窗口
- 开课管理：创建教学班、查看名单
- 学生选课：容量校验、时间冲突检测
- 课表查看、统计报表、操作日志

回答要求：
1. 简洁明了，不超过3句话
2. 涉及操作时给出具体步骤
3. 不确定的问题建议联系教务`

export async function askAssistant(
  question: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: QA_SYSTEM_PROMPT },
    ...history.slice(-6), // 保留最近6轮对话
    { role: 'user', content: question },
  ]
  return chat(messages, { temperature: 0.7 })
}

// ========== 报表智能解读 ==========

interface ReportContext {
  colleges: { name: string; total: number; active: number }[]
  majors: { name: string; total: number }[]
  classes: { name: string; total: number }[]
  offerings: {
    course: string
    section: string
    capacity: number
    enrolled: number
    remaining: number
  }[]
  totalStudents: number
  totalTeachers: number
  totalOfferings: number
  enrollmentRate: number
}

const REPORT_SYSTEM_PROMPT = `你是高校教务数据分析专家。根据提供的报表数据，生成简明的分析解读。

要求：
1. 用中文回答，分点列出（3-5条）
2. 突出关键数据和异常情况
3. 给出可操作的建议
4. 语气专业但易懂
5. 不超过150字

格式示例：
📊 数据概览：...
⚠️ 关注点：...
💡 建议：...`

export async function interpretReport(context: ReportContext): Promise<string> {
  const prompt = `请分析以下教务报表数据：

【基本数据】
- 学生总数：${context.totalStudents}
- 教师总数：${context.totalTeachers}
- 开课总数：${context.totalOfferings}
- 平均选课率：${context.enrollmentRate}%

【学院分布】
${context.colleges.map((c) => `- ${c.name}：${c.total}人（在读${c.active}）`).join('\n')}

【专业人数】
${context.majors.map((m) => `- ${m.name}：${m.total}人`).join('\n')}

【开课容量】
${context.offerings
  .slice(0, 10)
  .map(
    (o) =>
      `- ${o.course} ${o.section}：${o.enrolled}/${o.capacity}${
        o.remaining <= 5 ? '（余量不足）' : ''
      }`,
  )
  .join('\n')}`

  return chat(
    [
      { role: 'system', content: REPORT_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.5, maxTokens: 512 },
  )
}
