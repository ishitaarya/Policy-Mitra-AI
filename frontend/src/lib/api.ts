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

function baseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (envUrl && envUrl.startsWith('http')) return envUrl.replace(/\/$/, '')
  return '/api'
}

export async function uploadPolicy(file: File): Promise<UploadPolicyResult> {
  const url = `${baseUrl()}/upload-policy`
  const fd = new FormData()
  fd.append('file', file)

  const resp = await fetch(url, { method: 'POST', body: fd })
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText)
    throw new Error(`Upload failed: ${resp.status} ${text}`)
  }
  return (await resp.json()) as UploadPolicyResult
}

export async function askPolicy(document_id: string, question: string): Promise<AskResponse> {
  const url = `${baseUrl()}/ask`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id, question }),
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText)
    throw new Error(`Ask failed: ${resp.status} ${text}`)
  }
  return (await resp.json()) as AskResponse
}

export function mapAskResponseToChatMessage(
  resp: AskResponse,
  relatedUserQuery?: string,
  documentName?: string,
  documentId?: string,
) {
  const now = new Date()
  const idBase = `${now.getTime()}`
  const riskLevel = ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'].includes(resp.risk_level)
    ? resp.risk_level as 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
    : 'UNKNOWN'

  const riskScore = riskLevel === 'HIGH' ? 100 : riskLevel === 'MEDIUM' ? 60 : riskLevel === 'LOW' ? 25 : 0

  const actions = (resp.action_items || []).map((text, i) => ({
    id: `${idBase}-a-${i}`,
    text,
    completed: false,
  }))

  const sources = (resp.sources || []).map((s, i) => ({
    id: `${documentId ?? 'doc'}-p${s.page}-${i}`,
    documentName: documentName ?? 'Uploaded Document',
    page: s.page,
    confidenceScore: resp.confidence ?? 0,
    excerpt: s.excerpt,
    fullContext: s.excerpt,
  }))

  return {
    id: `${idBase}-assistant`,
    role: 'assistant' as const,
    content: resp.answer,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    riskLevel,
    riskScore,
    confidence: resp.confidence,
    consequence: resp.consequence,
    actions,
    sources,
    relatedUserQuery,
  }
}
