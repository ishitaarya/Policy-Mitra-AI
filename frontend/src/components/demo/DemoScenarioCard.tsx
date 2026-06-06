import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import type { DemoScenario } from '@/data/demoScenarios'
import { cn } from '@/lib/utils'

const riskStyles = {
  LOW: 'bg-green-500/15 text-green-400 ring-green-500/25',
  MEDIUM: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/25',
  HIGH: 'bg-red-500/15 text-red-400 ring-red-500/25',
}

interface DemoScenarioCardProps {
  scenario: DemoScenario
  index: number
  onLaunch: (id: DemoScenario['id']) => void
  launching?: boolean
}

export function DemoScenarioCard({
  scenario,
  index,
  onLaunch,
  launching,
}: DemoScenarioCardProps) {
  const Icon = scenario.icon

  return (
    <motion.button
      type="button"
      onClick={() => onLaunch(scenario.id)}
      disabled={launching}
      className={cn(
        'demo-scenario-card group relative w-full overflow-hidden rounded-2xl border border-slate-700/50 p-5 text-left transition-all',
        'bg-gradient-to-br',
        scenario.accent,
        scenario.glow,
        'hover:border-violet-500/30 hover:shadow-xl disabled:opacity-60'
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/60 ring-1 ring-slate-700/60 transition-all group-hover:ring-violet-500/30">
            <Icon className="h-5 w-5 text-violet-400" />
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1',
              riskStyles[scenario.riskLevel]
            )}
          >
            {scenario.riskLevel}
          </span>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {scenario.tag}
        </span>
        <h3 className="mt-1 text-base font-semibold text-slate-100 group-hover:text-white">
          {scenario.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {scenario.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-lg bg-slate-900/50 px-2.5 py-1 text-[10px] italic text-slate-500">
            "{scenario.query.slice(0, 40)}..."
          </span>
          <motion.span
            className="flex items-center gap-1 text-xs font-medium text-violet-400 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Play className="h-3 w-3 fill-current" />
            Launch
            <ArrowRight className="h-3 w-3" />
          </motion.span>
        </div>
      </div>
    </motion.button>
  )
}
