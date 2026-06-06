import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { scrollToSourceCard } from '@/lib/sourceEvidence'

interface CitationBadgesProps {
  messageId: string
  count: number
  className?: string
}

export function CitationBadges({ messageId, count, className }: CitationBadgesProps) {
  if (count === 0) return null

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {Array.from({ length: count }, (_, i) => (
        <motion.button
          key={i}
          type="button"
          onClick={() => scrollToSourceCard(messageId, i)}
          className="citation-badge inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-violet-500/25 bg-violet-500/10 px-1 text-[10px] font-bold text-violet-300 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/15 hover:text-cyan-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.04 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title={`Jump to source ${i + 1}`}
        >
          {i + 1}
        </motion.button>
      ))}
    </span>
  )
}
