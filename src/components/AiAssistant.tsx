import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Settings, X } from 'lucide-react'
import { askAssistant, getApiKey, setApiKey } from '../lib/llm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  '怎么给学生改状态？',
  '选课规则是什么？',
  '如何创建教学班？',
  '怎么导出报表？',
]

export function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是学苑智能助手，可以帮你解答系统使用问题。请问有什么可以帮你？',
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初始化 API Key
  useEffect(() => {
    const saved = localStorage.getItem('llm-api-key')
    if (saved) setApiKey(saved)
    setApiKeyInput(saved || '')
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 打开时聚焦输入框
  useEffect(() => {
    if (open && !showSettings) {
      inputRef.current?.focus()
    }
  }, [open, showSettings])

  const handleSaveKey = () => {
    const key = apiKeyInput.trim()
    if (key) {
      setApiKey(key)
      localStorage.setItem('llm-api-key', key)
    }
    setShowSettings(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // 构建历史（只传 role/content，不含最新的 userMsg）
    const history = messages
      .filter((m) => m !== messages[0]) // 去掉初始欢迎语
      .map((m) => ({ role: m.role, content: m.content }))

    const reply = await askAssistant(text.trim(), history)
    setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-lg transition hover:scale-105 hover:bg-[#16382c]"
        onClick={() => setOpen(!open)}
        title="智能助手"
        type="button"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* 聊天面板 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3 text-white">
            <div>
              <div className="text-sm font-medium">智能助手</div>
              <div className="text-xs text-white/50">基于 LLM 的系统问答</div>
            </div>
            <button
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setShowSettings(!showSettings)}
              title="设置 API Key"
              type="button"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <div className="border-b border-line bg-orange-50 p-3">
              <label className="mb-1.5 block text-xs text-muted">OpenAI API Key</label>
              <div className="flex gap-2">
                <input
                  className="h-8 flex-1 rounded-lg border border-line bg-card px-2 text-sm"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <button
                  className="rounded-lg bg-accent px-3 text-xs text-white hover:bg-[#16382c]"
                  onClick={handleSaveKey}
                  type="button"
                >
                  保存
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted">Key 仅保存在浏览器本地</p>
            </div>
          )}

          {/* 消息区 */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-black/5 text-ink'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-black/5 px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 快捷问题 */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="rounded-full border border-line bg-card px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
                  onClick={() => sendMessage(q)}
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 输入区 */}
          <div className="border-t border-line p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="h-10 flex-1 rounded-xl border border-line bg-card px-3 text-sm outline-none transition focus:border-accent"
                placeholder={getApiKey() ? '输入问题...' : '请先配置 API Key'}
                disabled={loading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white transition hover:bg-[#16382c] disabled:opacity-40"
                disabled={loading || !input.trim()}
                onClick={() => sendMessage(input)}
                type="button"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
