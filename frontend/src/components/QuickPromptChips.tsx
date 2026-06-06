import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface QuickPromptChipsProps {
  prompts: string[]
  onSelect: (prompt: string) => void
}

export function QuickPromptChips({ prompts, onSelect }: QuickPromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt, i) => (
        <motion.button
          key={prompt}
          className="glass glass-hover flex items-center gap-2 rounded-full px-4 py-2 text-sm text-slate-300"
          onClick={() => onSelect(prompt)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          {prompt}
        </motion.button>
      ))}
    </div>
  )
}
