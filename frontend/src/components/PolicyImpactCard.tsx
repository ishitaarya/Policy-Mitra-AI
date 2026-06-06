import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardCheck,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PolicyImpact, RiskLevel } from '@/types'

interface PolicyImpactCardProps {
  impact: PolicyImpact
  index?: number
}

const riskConfig: Record<
  RiskLevel,
  { color: string; glow: string; border: string; bg: string; icon: LucideIcon }
> = {
  LOW: {
    color: 'text-green-400',
    glow: 'shadow-green-500/20',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    icon: ShieldAlert,
  },
  MEDIUM: {
    color: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    icon: AlertTriangle,
  },
  HIGH: {
    color: 'text-red-400',
    glow: 'shadow-red-500/20',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: AlertTriangle,
  },
}

interface ImpactRowProps {
  icon: LucideIcon
  label: string
  value: string
  valueClass?: string
  delay: number
}

function ImpactRow({ icon: Icon, label, value, valueClass, delay }: ImpactRowProps) {
  return (
    <motion.div
      className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-800/30"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
        <Icon className="h-3.5 w-3.5 text-violet-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className={cn('mt-0.5 text-xs font-semibold leading-snug text-slate-200', valueClass)}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}

export function PolicyImpactCard({ impact, index = 0 }: PolicyImpactCardProps) {
  const config = riskConfig[impact.riskLevel]
  const RiskIcon = config.icon

  return (
    <motion.div
      className={cn(
        'impact-card w-full shrink-0 overflow-hidden rounded-2xl border lg:w-[220px] xl:w-[240px]',
        config.border,
        config.glow
      )}
      initial={{ opacity: 0, x: 16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className={cn('border-b border-slate-700/40 px-4 py-3', config.bg)}>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg ring-1',
              config.bg,
              config.border
            )}
          >
            <RiskIcon className={cn('h-3.5 w-3.5', config.color)} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Policy Impact
            </p>
            <p className="text-xs font-medium text-slate-300">Analysis Summary</p>
          </div>
        </div>
      </div>

      {/* Risk Level — featured */}
      <div className="border-b border-slate-700/30 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Risk Level
        </p>
        <motion.div
          className="mt-1.5 flex items-center gap-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
        >
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1',
              config.bg,
              config.color,
              config.border
            )}
          >
            <motion.span
              className={cn('h-2 w-2 rounded-full', {
                'bg-green-400': impact.riskLevel === 'LOW',
                'bg-yellow-400': impact.riskLevel === 'MEDIUM',
                'bg-red-400': impact.riskLevel === 'HIGH',
              })}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {impact.riskLevel}
          </span>
        </motion.div>
      </div>

      {/* Detail rows */}
      <div className="space-y-0.5 p-2">
        <ImpactRow
          icon={ClipboardCheck}
          label="Action Needed"
          value={impact.requiredAction}
          valueClass="text-cyan-300"
          delay={0.3}
        />
        <ImpactRow
          icon={CalendarClock}
          label="Deadline"
          value={impact.deadline}
          valueClass="text-amber-300"
          delay={0.36}
        />
        <ImpactRow
          icon={AlertTriangle}
          label="Consequence"
          value={impact.consequence}
          valueClass={config.color}
          delay={0.42}
        />
        <ImpactRow
          icon={Building2}
          label="Department"
          value={impact.department}
          delay={0.48}
        />
      </div>
    </motion.div>
  )
}
