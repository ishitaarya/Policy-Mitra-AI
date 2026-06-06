import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  ScanSearch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SourceContextModal } from '@/components/SourceContextModal'
import type { SourceEvidence } from '@/types'
import {
  confidenceTierStyles,
  getConfidenceTier,
  sourceCardId,
} from '@/lib/sourceEvidence'
import { cn } from '@/lib/utils'

interface SourceEvidencePanelProps {
  messageId: string
  sources: SourceEvidence[]
}

interface SourceCardProps {
  messageId: string
  source: SourceEvidence
  index: number
  onViewContext: (source: SourceEvidence, index: number) => void
}

function SourceCard({ messageId, source, index, onViewContext }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const tier = getConfidenceTier(source.confidenceScore)
  const styles = confidenceTierStyles[tier]
  const citationNum = index + 1

  return (
    <motion.article
      id={sourceCardId(messageId, index)}
      className={cn(
        'source-card group rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 transition-all duration-300',
        'hover:border-violet-500/30 hover:bg-slate-900/60 hover:shadow-md hover:shadow-violet-500/5'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-500/25">
            <span className="text-[11px] font-bold text-violet-300">[{citationNum}]</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">{source.documentName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3 text-violet-400" />
                Page {source.page}
              </span>
              {source.section && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="truncate">{source.section}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums',
            styles.bg,
            styles.text,
            styles.border
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
          {source.confidenceScore}%
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2.5">
        <p
          className={cn(
            'text-xs italic leading-relaxed text-slate-400',
            !expanded && 'line-clamp-2'
          )}
        >
          &ldquo;{expanded ? source.excerpt : truncateExcerpt(source.excerpt)}&rdquo;
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Collapse Source
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Expand Source
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => onViewContext(source, index)}
        >
          <ScanSearch className="h-3 w-3" />
          View Original Context
        </Button>
      </div>
    </motion.article>
  )
}

function truncateExcerpt(text: string, maxLength = 140) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function SourceEvidencePanel({ messageId, sources }: SourceEvidencePanelProps) {
  const [contextSource, setContextSource] = useState<SourceEvidence | null>(null)
  const [contextIndex, setContextIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  if (sources.length === 0) return null

  const handleViewContext = (source: SourceEvidence, index: number) => {
    setContextSource(source)
    setContextIndex(index)
    setModalOpen(true)
  }

  return (
    <>
      <motion.section
        className="mt-3 overflow-hidden rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-slate-900/80 to-slate-900/40"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-cyan-500/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/25">
              <BookMarked className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Source Evidence</p>
              <p className="text-[10px] text-slate-500">
                {sources.length} policy {sources.length === 1 ? 'reference' : 'references'} retrieved
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1 sm:flex">
            <Layers className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-medium text-slate-400">RAG Verified</span>
          </div>
        </div>

        <div className="space-y-2.5 p-3 sm:p-4">
          <AnimatePresence>
            {sources.map((source, index) => (
              <SourceCard
                key={source.id}
                messageId={messageId}
                source={source}
                index={index}
                onViewContext={handleViewContext}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      <SourceContextModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        source={contextSource}
        citationIndex={contextIndex}
      />
    </>
  )
}
