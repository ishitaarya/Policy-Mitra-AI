export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Document {
  id: string
  name: string
  pages: number
  uploadedAt: string
  active?: boolean
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
}

export interface ComplaintData {
  category: string
  priority: string
  department: string
  complaint: string
}
