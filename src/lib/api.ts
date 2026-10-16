const API_BASE = 'http://127.0.0.1:8000/api'

export async function fetchAllData(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_BASE}/data`)
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
    const res = await fetch(`${API_BASE}/data/${entity}`)
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
