import { motion } from 'framer-motion'
import { BookOpen, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { SourceEvidence } from '@/types'
import { confidenceTierStyles, getConfidenceTier } from '@/lib/sourceEvidence'
import { cn } from '@/lib/utils'

interface SourceContextModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: SourceEvidence | null
  citationIndex: number
}

export function SourceContextModal({
  open,
  onOpenChange,
  source,
  citationIndex,
}: SourceContextModalProps) {
  if (!source) return null

  const tier = getConfidenceTier(source.confidenceScore)
  const styles = confidenceTierStyles[tier]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-400" />
            Original Retrieved Context
          </DialogTitle>
          <DialogDescription>
            Full policy chunk used as evidence for citation [{citationIndex + 1}]
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="gap-1">
              <FileText className="h-3 w-3" />
              {source.documentName}
            </Badge>
            <Badge variant="cyan">Page {source.page}</Badge>
            {source.section && <Badge variant="secondary">{source.section}</Badge>}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
                styles.bg,
                styles.text,
                styles.border
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
              {source.confidenceScore}% {styles.label}
            </span>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-slate-900/50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Retrieved Chunk
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {source.fullContext}
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2">
            <p className="text-[10px] text-slate-500">
              This is the exact text segment retrieved from the uploaded policy document via
              semantic search. The AI answer is grounded only in this evidence.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
