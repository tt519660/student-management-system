// API 服务层 - 后端通信（含 JWT 认证）

const API_BASE = 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'asms-token'

// ========== Token 管理 ==========
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ========== 认证 API ==========
export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    username: string
    displayName: string
    role: string
    refId?: string
  }
}

export async function loginApi(
  username: string,
  password: string,
): Promise<{ success: boolean; data?: LoginResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, error: json.detail || '登录失败' }
    }
    return { success: true, data: json }
  } catch (err) {
    console.error('登录失败:', err)
    return { success: false, error: '网络错误，请稍后重试' }
  }
}

export async function getMeApi(): Promise<{
  success: boolean
  data?: LoginResponse['user']
}> {
  const token = getToken()
  if (!token) return { success: false }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return { success: false }
    const json = await res.json()
    return { success: true, data: json }
  } catch {
    return { success: false }
  }
}

// ========== 数据 API ==========
function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchAllData(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_BASE}/data`, {
      headers: authHeaders(),
    })
    if (res.status === 401) {
      // Token 过期或无效
      clearToken()
      return null
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || '请求失败')
    return json.data
  } catch (err) {
    console.error('后端数据获取失败:', err)
    return null
  }
}

export async function fetchEntity(entity: string): Promise<unknown[] | null> {
  try {
    const res = await fetch(`${API_BASE}/data/${entity}`, {
      headers: authHeaders(),
    })
    if (res.status === 401) {
      clearToken()
      return null
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || '请求失败')
    return json.data as unknown[]
  } catch (err) {
    console.error(`获取 ${entity} 失败:`, err)
    return null
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}
