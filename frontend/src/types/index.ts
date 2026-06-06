export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Document {
  id: string
  name: string
  pages: number
  uploadedAt: string
  active?: boolean
}

export interface UploadedDocument {
  document_id: string
  name: string
  pages: number
  chunks_created: number
  status: string
  uploadedAt: string
}

export interface Conversation {
  id: string
  title: string
  timestamp: string
}

export interface ActionItem {
  id: string
  text: string
  completed: boolean
}

export interface SourceCitation {
  page: number
  section: string
  excerpt: string
}

export interface SourceEvidence {
  id: string
  documentName: string
  page: number
  section?: string
  confidenceScore: number
  excerpt: string
  fullContext: string
}

export interface PolicyImpact {
  riskLevel: RiskLevel
  requiredAction: string
  deadline: string
  consequence: string
  department: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  riskLevel?: RiskLevel
  riskScore?: number
  impact?: PolicyImpact
  actions?: ActionItem[]
  source?: SourceCitation
  sources?: SourceEvidence[]
  policyCategory?: string
  requirement?: string
  relatedUserQuery?: string
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High'

export interface ComplaintData {
  category: string
  priority: string
  department: string
  complaint: string
}

export interface GeneratedComplaint {
  referenceId: string
  category: string
  priority: ComplaintPriority
  department: string
  summary: string
  formalDraft: string
  generatedAt: string
}

export interface ComplaintGenerationContext {
  policyCategory?: string
  assistantSummary?: string
  riskLevel?: RiskLevel
  department?: string
}
