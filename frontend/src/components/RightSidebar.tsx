import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Tag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskDashboard } from '@/components/RiskDashboard'
import { initialMessages } from '@/data/mock'

export function RightSidebar() {
  const latestAI = initialMessages.find((m) => m.role === 'assistant')
  const actions = latestAI?.actions ?? []

  return (
    <motion.aside
      className="flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-800/60 p-4"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="gradient-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pb-5">
          <RiskDashboard score={latestAI?.riskScore ?? 0} />
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Action Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action, i) => (
            <motion.div
              key={action.id}
              className="flex items-start gap-2.5 rounded-lg p-2 text-xs text-slate-300"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              {action.completed ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
              ) : (
                <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              )}
              <span>{action.text}</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-400" />
            Source Citation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-300">
              Page {latestAI?.source?.page}
            </span>
          </div>
          <p className="text-[10px] font-medium text-violet-300">
            {latestAI?.source?.section}
          </p>
          <p className="rounded-lg bg-slate-800/40 p-3 text-xs italic leading-relaxed text-slate-400">
            "{latestAI?.source?.excerpt}"
          </p>
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-cyan-400" />
            Policy Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="cyan" className="text-xs">
            {latestAI?.policyCategory}
          </Badge>
          <p className="mt-3 text-xs text-slate-400">
            {latestAI?.requirement}
          </p>
        </CardContent>
      </Card>
    </motion.aside>
  )
}
