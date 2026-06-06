import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { demoScenarios, type DemoScenarioId } from '@/data/demoScenarios'
import { launchDemoScenario } from '@/lib/demoMode'
import { DemoScenarioCard } from '@/components/demo/DemoScenarioCard'

export function DemoModeSection() {
  const navigate = useNavigate()
  const { isAuthenticated, dismissWelcome } = useAuth()
  const [launching, setLaunching] = useState<DemoScenarioId | null>(null)

  const handleLaunch = (id: DemoScenarioId) => {
    setLaunching(id)
    launchDemoScenario(id)
    if (isAuthenticated) dismissWelcome()
    navigate('/app')
    setLaunching(null)
  }

  return (
    <motion.section
      className="relative z-10 mt-16 w-full max-w-5xl px-2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.6 }}
    >
      <div className="mb-8 text-center">
        <motion.div
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-300"
          animate={{ boxShadow: ['0 0 0px rgba(34,211,238,0)', '0 0 16px rgba(34,211,238,0.15)', '0 0 0px rgba(34,211,238,0)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Zap className="h-3 w-3" />
          Demo Mode
        </motion.div>
        <h2 className="text-xl font-semibold text-slate-200 md:text-2xl">
          Try a <span className="gradient-text">Preloaded Scenario</span>
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          One click launches a realistic AI conversation — complete with risk analysis,
          policy impact cards, and action checklists. No setup required.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {demoScenarios.map((scenario, i) => (
          <DemoScenarioCard
            key={scenario.id}
            scenario={scenario}
            index={i}
            onLaunch={handleLaunch}
            launching={launching === scenario.id}
          />
        ))}
      </div>

      <motion.p
        className="mt-6 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Sparkles className="h-3 w-3 text-violet-500/50" />
        Instant demo — no backend, no login required
      </motion.p>
    </motion.section>
  )
}
