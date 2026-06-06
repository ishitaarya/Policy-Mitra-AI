import { motion } from 'framer-motion'
import { Brain, Check, Sparkles } from 'lucide-react'
import {
  THINKING_STEPS,
  useAIThinkingWorkflow,
} from '@/hooks/useAIThinkingWorkflow'
import { cn } from '@/lib/utils'

interface AIThinkingWorkflowProps {
  active: boolean
  onComplete?: () => void
}

export function AIThinkingWorkflow({ active, onComplete }: AIThinkingWorkflowProps) {
  const { steps, overallProgress, activeIndex, completedCount } =
    useAIThinkingWorkflow({ active, onComplete })

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Avatar with glow ring */}
      <div className="relative shrink-0">
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 opacity-40 blur-md"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/30">
          <Brain className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Workflow card */}
      <div className="thinking-workflow min-w-0 flex-1 overflow-hidden rounded-2xl rounded-tl-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-violet-500/10 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            </motion.div>
            <span className="text-xs font-medium text-slate-300">
              PolicyMitra is thinking
              <motion.span
                className="inline-block w-4 text-violet-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                ...
              </motion.span>
            </span>
          </div>
          <motion.span
            className="font-mono text-[10px] font-semibold tabular-nums text-cyan-400"
            key={overallProgress}
            initial={{ opacity: 0.5, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {overallProgress}%
          </motion.span>
        </div>

        {/* Overall progress */}
        <div className="px-4 pt-3">
          <div className="thinking-progress-track h-1 overflow-hidden rounded-full">
            <motion.div
              className="thinking-progress-fill h-full rounded-full"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="relative px-4 py-3">
          <div className="thinking-connector absolute bottom-4 left-[1.65rem] top-4 w-px" />

          <div className="space-y-1">
            {THINKING_STEPS.map((step, index) => {
              const state = steps[index]
              const isActive = state.status === 'active'
              const isComplete = state.status === 'complete'
              const isPending = state.status === 'pending'

              return (
                <motion.div
                  key={step.id}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors',
                    isActive && 'thinking-step-active',
                    isComplete && 'thinking-step-complete'
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: isPending && index > activeIndex + 1 ? 0.35 : 1,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  {/* Status indicator */}
                  <div className="relative z-10 shrink-0">
                    {isComplete ? (
                      <motion.div
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-green-500/40"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <Check className="h-3 w-3 text-green-400" strokeWidth={3} />
                      </motion.div>
                    ) : isActive ? (
                      <div className="relative">
                        <motion.div
                          className="absolute -inset-1 rounded-full bg-cyan-400/30 blur-sm"
                          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        <motion.div
                          className="relative h-5 w-5 rounded-full border-2 border-cyan-400 bg-cyan-500/20"
                          animate={{ boxShadow: ['0 0 6px rgba(34,211,238,0.4)', '0 0 14px rgba(34,211,238,0.7)', '0 0 6px rgba(34,211,238,0.4)'] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          <motion.div
                            className="absolute inset-1 rounded-full bg-cyan-400"
                            animate={{ scale: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </motion.div>
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-slate-700/80 bg-slate-800/60" />
                    )}
                  </div>

                  {/* Label + micro progress */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate text-[11px] font-medium transition-colors',
                          isComplete && 'text-green-400/90',
                          isActive && 'text-cyan-300',
                          isPending && 'text-slate-500'
                        )}
                      >
                        {isComplete && '✓ '}
                        {step.label}
                      </span>
                      {isActive && (
                        <motion.span
                          className="shrink-0 font-mono text-[9px] tabular-nums text-cyan-500/80"
                          key={state.progress}
                        >
                          {state.progress}%
                        </motion.span>
                      )}
                    </div>

                    {isActive && (
                      <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-slate-800/80">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                          animate={{ width: `${state.progress}%` }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Active sweep */}
                  {isActive && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-violet-500/10 px-4 py-2">
          <span className="font-mono text-[9px] text-slate-600">
            {completedCount}/{THINKING_STEPS.length} stages complete
          </span>
          <motion.span
            className="font-mono text-[9px] text-violet-400/70"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            neural pipeline active
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
