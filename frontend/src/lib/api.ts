export interface UploadPolicyResult {
  document_id: string
  pages: number
  chunks_created: number
  status: string
}

export interface AskResponse {
  answer: string
  risk_level: string
  confidence: number
  action_items: string[]
  action_plan?: Array<Record<string, unknown>>
  consequence?: string
  sources: Array<{ page: number; excerpt: string }>
  metadata?: {
    document_id: string
    chunks_used: number
    top_score: number
  }
}

// In development: Vite proxies `/api/*` → backend (no CORS issues).
// In production:  set VITE_API_BASE_URL to your deployed backend origin,
//                 e.g. https://api.policymitra.in
function baseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  // If env var is set and it's a full URL, use it directly (production).
  // Otherwise fall back to the Vite proxy prefix (development).
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '')
  }
  return '/api'
}

export async function uploadPolicy(file: File): Promise<UploadPolicyResult> {
  const url = `${baseUrl().replace(/\/$/, '')}/upload-policy`
  const fd = new FormData()
  fd.append('file', file)

  const resp = await fetch(url, {
    method: 'POST',
    body: fd,
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText)
    throw new Error(`Upload failed: ${resp.status} ${text}`)
  }

  const json = (await resp.json()) as UploadPolicyResult
  return json
}

export async function askPolicy(document_id: string, question: string): Promise<AskResponse> {
  const url = `${baseUrl().replace(/\/$/, '')}/ask`
  const body = { document_id, question }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText)
    throw new Error(`Ask failed: ${resp.status} ${text}`)
  }

  const json = (await resp.json()) as AskResponse
  return json
}

export function mapAskResponseToChatMessage(resp: AskResponse, relatedUserQuery?: string, documentName?: string, documentId?: string) {
  const now = new Date()
  const idBase = `${now.getTime()}`

  const actions = (resp.action_items || []).map((t, i) => ({ id: `${idBase}-a-${i}`, text: t, completed: false }))

  const sources = (resp.sources || []).map((s, i) => ({
    id: `${documentId ?? 'doc'}-p${s.page}-${i}`,
    documentName: documentName ?? 'Uploaded Document',
    page: s.page,
    section: undefined,
    confidenceScore: resp.confidence ?? 0,
    excerpt: s.excerpt,
    fullContext: s.excerpt,
  }))

  return {
    id: `${idBase}-assistant`,
    role: 'assistant' as const,
    content: resp.answer,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    riskLevel: resp.risk_level,
    riskScore: resp.confidence,
    actions,
    sources,
    relatedUserQuery,
  }
}
