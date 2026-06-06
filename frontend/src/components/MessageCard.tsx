import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Lightbulb,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CitationBadges } from '@/components/CitationBadges'
import { PolicyImpactCard } from '@/components/PolicyImpactCard'
import { SourceEvidencePanel } from '@/components/SourceEvidencePanel'
import { useComplaintDrawer } from '@/context/ComplaintDrawerContext'
import { getMessageSources } from '@/lib/sourceEvidence'
import type { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'

interface MessageCardProps {
  message: ChatMessage
  index: number
  userQuery?: string
}

export function MessageCard({ message, index, userQuery }: MessageCardProps) {
  const { openDrawer } = useComplaintDrawer()
  const [showELI5, setShowELI5] = useState(false)
  const [actions, setActions] = useState(message.actions ?? [])
  const sources = getMessageSources(message)

  const scrollToEvidencePanel = () => {
    const panel = document.getElementById(`evidence-panel-${message.id}`)
    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const handleGenerateComplaint = () => {
    const query = userQuery ?? message.relatedUserQuery ?? message.content
    openDrawer({
      userQuery: query,
      context: {
        policyCategory: message.policyCategory,
        assistantSummary: message.content,
        riskLevel: message.riskLevel,
        department: message.impact?.department,
      },
    })
  }

  if (message.role === 'user') {
    return (
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="max-w-[75%] rounded-2xl rounded-tr-md border border-violet-500/20 bg-gradient-to-r from-violet-600/20 to-cyan-500/10 px-4 py-3 text-sm text-slate-200">
          {message.content}
          <p className="mt-1 text-[10px] text-slate-500">{message.timestamp}</p>
        </div>
      </motion.div>
    )
  }

  const eli5Text =
    'Simple words mein: Tumhari class attendance kam hai. College rule ke hisaab se 75% hona chahiye. Abhi tum 68% pe ho, matlab exam dene se pehle fix karna padega — medical proof ya HOD se baat karo.'

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20">
        <span className="text-xs font-bold text-white">AI</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="glass space-y-3 rounded-2xl rounded-tl-md p-4">
            {message.requirement && (
              <motion.div
                className="flex items-center gap-2 text-xs font-medium text-cyan-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FileText className="h-3.5 w-3.5" />
                {message.requirement}
              </motion.div>
            )}

            <p className="text-sm leading-relaxed text-slate-300">
              {showELI5 ? eli5Text : message.content}
              {sources.length > 0 && (
                <CitationBadges
                  messageId={message.id}
                  count={sources.length}
                  className="ml-1.5 inline"
                />
              )}
            </p>

            {actions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Action Checklist:</p>
                {actions.map((action) => (
                  <button
                    key={action.id}
                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-slate-300 transition-colors hover:bg-slate-800/40"
                    onClick={() =>
                      setActions((prev) =>
                        prev.map((a) =>
                          a.id === action.id ? { ...a, completed: !a.completed } : a
                        )
                      )
                    }
                  >
                    {action.completed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                    ) : (
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    )}
                    <span className={cn(action.completed && 'text-slate-500 line-through')}>
                      {action.text}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] text-slate-600">{message.timestamp}</p>
          </div>

          {sources.length > 0 && (
            <div id={`evidence-panel-${message.id}`}>
              <SourceEvidencePanel messageId={message.id} sources={sources} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowELI5(!showELI5)}>
              <Lightbulb className="h-3.5 w-3.5" />
              Explain Like I'm 5
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateComplaint}>
              <MessageSquare className="h-3.5 w-3.5" />
              Generate Complaint
            </Button>
            {sources.length > 0 && (
              <Button variant="outline" size="sm" onClick={scrollToEvidencePanel}>
                <BookOpen className="h-3.5 w-3.5" />
                Show Sources
              </Button>
            )}
          </div>
        </div>

        {message.impact && (
          <PolicyImpactCard impact={message.impact} index={index} />
        )}
      </div>
    </motion.div>
  )
}
