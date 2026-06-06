import { motion } from 'framer-motion'
import { AlertTriangle, Shield, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskDashboardProps {
  score: number
  size?: 'sm' | 'lg'
}

function getRiskColor(score: number) {
  if (score <= 33) return { color: '#22c55e', label: 'Low Risk', variant: 'success' as const }
  if (score <= 66) return { color: '#eab308', label: 'Medium Risk', variant: 'warning' as const }
  return { color: '#ef4444', label: 'High Risk', variant: 'danger' as const }
}

export function RiskDashboard({ score, size = 'lg' }: RiskDashboardProps) {
  const { color, label } = getRiskColor(score)
  const radius = size === 'lg' ? 54 : 36
  const stroke = size === 'lg' ? 8 : 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const svgSize = (radius + stroke) * 2

  const Icon = score <= 33 ? Shield : score <= 66 ? AlertTriangle : ShieldAlert

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.1)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn('font-bold text-slate-100', size === 'lg' ? 'text-2xl' : 'text-lg')}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-slate-500">/ 100</span>
        </div>
      </div>
      <motion.div
        className="mt-3 flex items-center gap-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      </motion.div>
    </div>
  )
}
