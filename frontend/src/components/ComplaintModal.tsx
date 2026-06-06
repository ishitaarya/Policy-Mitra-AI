import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ComplaintData } from '@/types'

interface ComplaintModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ComplaintData
}

export function ComplaintModal({ open, onOpenChange, data }: ComplaintModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.complaint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-400" />
            Generated Complaint
          </DialogTitle>
          <DialogDescription>
            AI-generated formal complaint based on your policy query
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{data.category}</Badge>
            <Badge variant="danger">{data.priority} Priority</Badge>
            <Badge variant="cyan">{data.department}</Badge>
          </div>

          <div className="glass rounded-xl p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
              {data.complaint}
            </pre>
          </div>

          <Button onClick={handleCopy} className="w-full" variant="secondary">
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Check className="h-4 w-4 text-green-400" />
                  Copied to clipboard!
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
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
