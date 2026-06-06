import type { ChatMessage, SourceEvidence } from '@/types'

export type ConfidenceTier = 'high' | 'medium' | 'low'

export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 85) return 'high'
  if (score >= 70) return 'medium'
  return 'low'
}

export const confidenceTierStyles: Record<
  ConfidenceTier,
  { text: string; bg: string; border: string; dot: string; label: string }
> = {
  high: {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    dot: 'bg-green-400',
    label: 'High Match',
  },
  medium: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-400',
    label: 'Moderate Match',
  },
  low: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
    label: 'Low Match',
  },
}

export function getMessageSources(message: ChatMessage): SourceEvidence[] {
  if (message.sources?.length) return message.sources
  if (!message.source) return []

  return [
    {
      id: 'legacy-1',
      documentName: 'Academic Regulations 2024.pdf',
      page: message.source.page,
      section: message.source.section,
      confidenceScore: 88,
      excerpt: message.source.excerpt,
      fullContext: message.source.excerpt,
    },
  ]
}

export function sourceCardId(messageId: string, index: number) {
  return `source-${messageId}-${index}`
}

export function scrollToSourceCard(messageId: string, citationIndex: number) {
  const el = document.getElementById(sourceCardId(messageId, citationIndex))
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  el.classList.add('source-card-highlight')
  window.setTimeout(() => el.classList.remove('source-card-highlight'), 1600)
}
