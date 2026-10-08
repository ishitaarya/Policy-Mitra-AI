import { motion } from 'framer-motion'
import { AlertTriangle, BookOpen, CheckCircle2, Circle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskDashboard } from '@/components/RiskDashboard'
import type { ChatMessage } from '@/types'

interface RightSidebarProps {
  latestAI: ChatMessage | null
}

export function RightSidebar({ latestAI }: RightSidebarProps) {
  const actions = latestAI?.actions ?? []
  const source = latestAI?.sources?.[0]

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
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 pb-5">
          <RiskDashboard score={latestAI?.riskScore ?? 0} riskLevel={latestAI?.riskLevel} />
          <p className="text-[10px] text-slate-500">
            Confidence: {latestAI ? `${latestAI.confidence ?? 0}%` : '—'}
          </p>
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
          {actions.length ? actions.map((action, i) => (
            <motion.div key={action.id} className="flex items-start gap-2.5 rounded-lg p-2 text-xs text-slate-300" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
              {action.completed ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" /> : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />}
              <span>{action.text}</span>
            </motion.div>
          )) : <p className="text-xs text-slate-500">No policy-backed action items.</p>}
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-400" />
            Source Evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {source ? (
            <>
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-300">
                  {source.documentName} · Page {source.page}
                </span>
              </div>
              <p className="rounded-lg bg-slate-800/40 p-3 text-xs italic leading-relaxed text-slate-400">
                "{source.excerpt}"
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">Sources will appear after a grounded answer.</p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <CardTitle>Policy Result</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="cyan" className="text-xs">
            {latestAI?.riskLevel ?? 'NO RESULT'}
          </Badge>
          <p className="mt-3 text-xs text-slate-400">
            {latestAI?.consequence ?? 'Ask a question about the uploaded policy.'}
          </p>
        </CardContent>
      </Card>
    </motion.aside>
  )
}
