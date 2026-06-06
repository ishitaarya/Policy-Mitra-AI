import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Check,
  ClipboardList,
  Copy,
  Download,
  FileText,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react'
import { useComplaintDrawer } from '@/context/ComplaintDrawerContext'
import { getComplaintExportText } from '@/lib/complaintGenerator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { ComplaintPriority } from '@/types'
import { cn } from '@/lib/utils'

const priorityConfig: Record<
  ComplaintPriority,
  { badge: 'success' | 'warning' | 'danger'; icon: string; ring: string }
> = {
  Low: { badge: 'success', icon: 'text-green-400', ring: 'ring-green-500/30' },
  Medium: { badge: 'warning', icon: 'text-yellow-400', ring: 'ring-yellow-500/30' },
  High: { badge: 'danger', icon: 'text-red-400', ring: 'ring-red-500/30' },
}

interface MetaCardProps {
  label: string
  value: string
  icon: ReactNode
  delay?: number
}

function MetaCard({ label, value, icon, delay = 0 }: MetaCardProps) {
  return (
    <motion.div
      className="complaint-meta-card rounded-xl border border-slate-700/50 bg-slate-900/50 p-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold leading-snug text-slate-200">{value}</p>
    </motion.div>
  )
}

export function ComplaintGeneratorDrawer() {
  const { open, complaint, isRegenerating, closeDrawer, regenerate } = useComplaintDrawer()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeDrawer])

  const handleCopy = async () => {
    if (!complaint) return
    await navigator.clipboard.writeText(getComplaintExportText(complaint))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!complaint) return
    const blob = new Blob([getComplaintExportText(complaint)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${complaint.referenceId}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const priority = complaint?.priority ?? 'Medium'
  const pConfig = priorityConfig[priority]

  return (
    <AnimatePresence>
      {open && complaint && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
          />

          <motion.aside
            className="complaint-drawer fixed inset-y-0 right-0 z-[61] flex w-full max-w-full flex-col border-l border-violet-500/20 bg-[#0a0f1a]/98 shadow-2xl shadow-violet-500/10 sm:max-w-md lg:max-w-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Complaint Generator"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
                    <ClipboardList className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">Grievance Report Generator</p>
                    <p className="text-[10px] text-slate-500">Campus Administrative Workflow</p>
                  </div>
                </div>
                <p className="mt-2 font-mono text-[10px] text-cyan-400/80">{complaint.referenceId}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg"
                onClick={closeDrawer}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetaCard
                    label="Category"
                    value={complaint.category}
                    icon={<FileText className="h-3 w-3 text-violet-400" />}
                    delay={0.05}
                  />
                  <MetaCard
                    label="Priority"
                    value={priority}
                    icon={<ShieldAlert className={cn('h-3 w-3', pConfig.icon)} />}
                    delay={0.1}
                  />
                  <MetaCard
                    label="Department"
                    value={complaint.department}
                    icon={<Building2 className="h-3 w-3 text-cyan-400" />}
                    delay={0.15}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{complaint.category}</Badge>
                  <Badge variant={pConfig.badge}>{priority} Priority</Badge>
                  <Badge variant="cyan">{complaint.department}</Badge>
                </div>

                <Card className="border-cyan-500/15">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-cyan-300">
                      Complaint Summary
                    </CardTitle>
                    <CardDescription>AI-classified overview for administrative routing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-300">{complaint.summary}</p>
                  </CardContent>
                </Card>

                <Card className="complaint-document overflow-hidden border-slate-700/60">
                  <CardHeader className="border-b border-slate-700/50 bg-slate-900/60 pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-violet-400" />
                      Formal Complaint Draft
                    </CardTitle>
                    <CardDescription>
                      Ready for submission to the concerned department
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <motion.div
                      className="complaint-document-body max-h-[50vh] overflow-y-auto px-5 py-4"
                      key={complaint.referenceId + complaint.formalDraft.slice(0, 40)}
                      initial={{ opacity: isRegenerating ? 0.4 : 1 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      <pre className="whitespace-pre-wrap font-serif text-[13px] leading-[1.75] text-slate-300">
                        {complaint.formalDraft}
                      </pre>
                    </motion.div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <div className="border-t border-slate-800/80 bg-slate-900/50 p-4 sm:p-5">
              <Separator className="mb-4 bg-slate-800/80" />
              <div className="grid gap-2 sm:grid-cols-3">
                <Button variant="secondary" onClick={handleCopy} disabled={isRegenerating}>
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="copied"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Check className="h-4 w-4 text-green-400" />
                        Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy Complaint
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={isRegenerating}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button onClick={regenerate} disabled={isRegenerating}>
                  <RefreshCw className={cn('h-4 w-4', isRegenerating && 'animate-spin')} />
                  {isRegenerating ? 'Regenerating…' : 'Regenerate'}
                </Button>
              </div>
              <p className="mt-3 text-center text-[10px] text-slate-600">
                Review and personalize placeholders before official submission.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
