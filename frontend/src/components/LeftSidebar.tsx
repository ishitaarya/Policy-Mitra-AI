import { motion } from 'framer-motion'
import {
  ChevronDown,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'
import { uploadPolicy } from '@/lib/api'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { documents, conversations } from '@/data/mock'
import { cn } from '@/lib/utils'

export function LeftSidebar() {
  const activeDoc = documents.find((d) => d.active)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const resp = await uploadPolicy(file)
      // persist last uploaded document info locally
      const saved = {
        document_id: resp.document_id,
        name: file.name,
        pages: resp.pages,
        uploadedAt: 'just now',
      }
      localStorage.setItem('policymitra_last_document', JSON.stringify(saved))
      window.alert(`Upload successful: ${file.name}`)
    } catch (err: any) {
      console.error('upload error', err)
      window.alert(`Upload failed: ${err?.message ?? 'Unknown error'}`)
    } finally {
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <motion.aside
      className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800/60 glass"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-5">
        <Logo />
      </div>

      <Separator className="bg-slate-800/60" />

      <div className="p-4 space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Active Document
          </p>
          <motion.button
            className="glass glass-hover flex w-full items-center justify-between rounded-xl p-3 text-left"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                <FileText className="h-4 w-4 text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">
                  {activeDoc?.name}
                </p>
                <p className="text-[10px] text-slate-500">{activeDoc?.pages} pages</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </motion.button>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Uploaded Documents
          </p>
          <div className="space-y-1">
            {documents.map((doc, i) => (
              <motion.button
                key={doc.id}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors',
                  doc.active
                    ? 'bg-violet-500/10 text-violet-300'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ x: 2 }}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{doc.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="secondary" className="w-full" size="sm" onClick={handleUploadClick}>
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
        </>
      </div>

      <Separator className="bg-slate-800/60" />

      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Recent Conversations
          </p>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-2">
            {conversations.map((conv, i) => (
              <motion.button
                key={conv.id}
                className={cn(
                  'flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors',
                  i === 0
                    ? 'bg-slate-800/50 text-slate-200'
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-300'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 shrink-0 text-slate-500" />
                  <span className="truncate text-xs font-medium">{conv.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 pl-5">
                  <Clock className="h-2.5 w-2.5 text-slate-600" />
                  <span className="text-[10px] text-slate-600">{conv.timestamp}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </motion.aside>
  )
}
