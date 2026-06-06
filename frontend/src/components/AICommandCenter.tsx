import { useEffect, useState, useRef, type ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileSearch,
  Languages,
  Layers,
  ListChecks,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowStage {
  id: string
  label: string
  icon: ElementType
  duration: number
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 'language', label: 'Language Detected', icon: Languages, duration: 320 },
  { id: 'policy', label: 'Policy Retrieved', icon: FileSearch, duration: 360 },
  { id: 'chunks', label: 'Relevant Chunks Found', icon: Layers, duration: 380 },
  { id: 'risk', label: 'Risk Analysis Completed', icon: ShieldAlert, duration: 360 },
  { id: 'action', label: 'Action Plan Generated', icon: ListChecks, duration: 320 },
]

type StageStatus = 'pending' | 'active' | 'complete'

interface StageState {
  status: StageStatus
  progress: number
}

interface AICommandCenterProps {
  active: boolean
}

export function AICommandCenter({ active }: AICommandCenterProps) {
  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [stages, setStages] = useState<StageState[]>(
    WORKFLOW_STAGES.map(() => ({ status: 'pending', progress: 0 }))
  )
  const [overallProgress, setOverallProgress] = useState(0)
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([])
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    intervalRefs.current.forEach(clearInterval)
    timeoutRefs.current.forEach(clearTimeout)
    intervalRefs.current = []
    timeoutRefs.current = []
  }

  const resetStages = () => {
    setStages(WORKFLOW_STAGES.map(() => ({ status: 'pending', progress: 0 })))
    setOverallProgress(0)
  }

  const runWorkflow = () => {
    clearTimers()
    resetStages()
    setVisible(true)
    setMinimized(false)

    let cumulativeDelay = 0

    WORKFLOW_STAGES.forEach((stage, index) => {
      const startTimeout = setTimeout(() => {
        setStages((prev) =>
          prev.map((s, i) =>
            i === index ? { ...s, status: 'active' } : s
          )
        )

        const tickInterval = 40
        const steps = stage.duration / tickInterval
        let step = 0

        const progressInterval = setInterval(() => {
          step++
          const progress = Math.min(100, Math.round((step / steps) * 100))

          setStages((prev) =>
            prev.map((s, i) => (i === index ? { ...s, progress } : s))
          )

          setOverallProgress(
            Math.round(
              ((index + progress / 100) / WORKFLOW_STAGES.length) * 100
            )
          )

          if (step >= steps) {
            clearInterval(progressInterval)
            setStages((prev) =>
              prev.map((s, i) =>
                i === index ? { status: 'complete', progress: 100 } : s
              )
            )
            setOverallProgress(
              Math.round(((index + 1) / WORKFLOW_STAGES.length) * 100)
            )
          }
        }, tickInterval)

        intervalRefs.current.push(progressInterval)
      }, cumulativeDelay)

      timeoutRefs.current.push(startTimeout)
      cumulativeDelay += stage.duration + 80
    })
  }

  useEffect(() => {
    if (active) {
      runWorkflow()
    } else if (visible) {
      const hideTimeout = setTimeout(() => {
        setVisible(false)
        resetStages()
      }, 1200)
      timeoutRefs.current.push(hideTimeout)
    }

    return clearTimers
  }, [active])

  useEffect(() => () => clearTimers(), [])

  const completedCount = stages.filter((s) => s.status === 'complete').length
  const allComplete = completedCount === WORKFLOW_STAGES.length
  const activeStage = stages.findIndex((s) => s.status === 'active')

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-auto fixed bottom-6 right-6 z-50 w-[340px]"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="cyber-panel overflow-hidden rounded-xl">
            <div className="cyber-scanline pointer-events-none absolute inset-0 z-10" />

            <div className="relative z-20">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/20 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30"
                    animate={{
                      boxShadow: active
                        ? [
                            '0 0 8px rgba(34,211,238,0.2)',
                            '0 0 16px rgba(34,211,238,0.4)',
                            '0 0 8px rgba(34,211,238,0.2)',
                          ]
                        : '0 0 12px rgba(34,211,238,0.3)',
                    }}
                    transition={{ duration: 2, repeat: active ? Infinity : 0 }}
                  >
                    <Cpu className="h-4 w-4 text-cyan-400" />
                  </motion.div>
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider text-cyan-300">
                      AI COMMAND CENTER
                    </p>
                    <p className="font-mono text-[9px] tracking-widest text-slate-500">
                      NEURAL PIPELINE v2.4
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-medium',
                      active
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : allComplete
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-slate-800/60 text-slate-500'
                    )}
                    animate={active ? { opacity: [1, 0.5, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Activity className="h-2.5 w-2.5" />
                    {active ? 'PROCESSING' : allComplete ? 'COMPLETE' : 'STANDBY'}
                  </motion.div>
                  <button
                    onClick={() => setMinimized(!minimized)}
                    className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-cyan-400"
                  >
                    {minimized ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Overall progress */}
              <div className="border-b border-cyan-500/10 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500">
                    OVERALL PROGRESS
                  </span>
                  <motion.span
                    className="font-mono text-sm font-bold text-cyan-300"
                    key={overallProgress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {overallProgress}%
                  </motion.span>
                </div>
                <div className="cyber-progress-track h-1.5 overflow-hidden rounded-full">
                  <motion.div
                    className="cyber-progress-fill h-full rounded-full"
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-600">
                  <span>
                    STAGE {Math.min(activeStage + 1, WORKFLOW_STAGES.length)}/{WORKFLOW_STAGES.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-violet-400" />
                    {completedCount} OPS DONE
                  </span>
                </div>
              </div>

              {/* Stages */}
              <AnimatePresence>
                {!minimized && (
                  <motion.div
                    className="space-y-1 p-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {WORKFLOW_STAGES.map((stage, index) => {
                      const state = stages[index]
                      const Icon = stage.icon

                      return (
                        <motion.div
                          key={stage.id}
                          className={cn(
                            'relative overflow-hidden rounded-lg px-3 py-2.5 transition-colors',
                            state.status === 'active' && 'cyber-stage-active',
                            state.status === 'complete' && 'cyber-stage-complete',
                            state.status === 'pending' && 'opacity-40'
                          )}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{
                            opacity: state.status === 'pending' ? 0.4 : 1,
                            x: 0,
                          }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all',
                                state.status === 'complete'
                                  ? 'bg-green-500/15 ring-1 ring-green-500/30'
                                  : state.status === 'active'
                                    ? 'bg-cyan-500/15 ring-1 ring-cyan-500/40'
                                    : 'bg-slate-800/60 ring-1 ring-slate-700/40'
                              )}
                            >
                              {state.status === 'complete' ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 500 }}
                                >
                                  <Check className="h-3.5 w-3.5 text-green-400" />
                                </motion.div>
                              ) : state.status === 'active' ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                  <Icon className="h-3.5 w-3.5 text-cyan-400" />
                                </motion.div>
                              ) : (
                                <Icon className="h-3.5 w-3.5 text-slate-600" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    'truncate font-mono text-[11px] font-medium',
                                    state.status === 'complete'
                                      ? 'text-green-400'
                                      : state.status === 'active'
                                        ? 'text-cyan-300'
                                        : 'text-slate-500'
                                  )}
                                >
                                  {state.status === 'complete' && '✓ '}
                                  {stage.label}
                                </span>
                                <span
                                  className={cn(
                                    'shrink-0 font-mono text-[10px] font-bold tabular-nums',
                                    state.status === 'complete'
                                      ? 'text-green-400/80'
                                      : state.status === 'active'
                                        ? 'text-cyan-400'
                                        : 'text-slate-600'
                                  )}
                                >
                                  {state.progress}%
                                </span>
                              </div>

                              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800/80">
                                <motion.div
                                  className={cn(
                                    'h-full rounded-full',
                                    state.status === 'complete'
                                      ? 'bg-green-500/70'
                                      : 'bg-gradient-to-r from-violet-500 to-cyan-400'
                                  )}
                                  animate={{ width: `${state.progress}%` }}
                                  transition={{ duration: 0.15 }}
                                />
                              </div>
                            </div>
                          </div>

                          {state.status === 'active' && (
                            <motion.div
                              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer telemetry */}
              <div className="flex items-center justify-between border-t border-cyan-500/10 px-4 py-2 font-mono text-[9px] text-slate-600">
                <span>LATENCY: {active ? '42ms' : '—'}</span>
                <span>TOKENS: {active ? '1.2k' : '—'}</span>
                <span>CONF: {allComplete ? '98.4%' : active ? '—' : '—'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
