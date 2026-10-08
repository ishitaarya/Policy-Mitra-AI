import { motion } from 'framer-motion'
import { FileText, Upload } from 'lucide-react'
import { useRef } from 'react'
import { uploadPolicy } from '@/lib/api'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { UploadedDocument } from '@/types'

interface LeftSidebarProps {
  activeDocument: UploadedDocument | null
  onDocumentUploaded: (document: UploadedDocument) => void
}

export function LeftSidebar({ activeDocument, onDocumentUploaded }: LeftSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const resp = await uploadPolicy(file)
      const saved: UploadedDocument = {
        document_id: resp.document_id,
        name: file.name,
        pages: resp.pages,
        chunks_created: resp.chunks_created,
        status: resp.status,
        uploadedAt: 'just now',
      }
      localStorage.setItem('policymitra_last_document', JSON.stringify(saved))
      onDocumentUploaded(saved)
      window.alert(`Policy indexed successfully: ${file.name}`)
    } catch (err: any) {
      console.error('upload error', err)
      window.alert(`Upload failed: ${err?.message ?? 'Unknown error'}`)
    } finally {
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
      <div className="p-5"><Logo /></div>
      <Separator className="bg-slate-800/60" />

      <div className="space-y-4 p-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Active Document
          </p>
          {activeDocument ? (
            <div className="glass flex items-center gap-2.5 rounded-xl p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                <FileText className="h-4 w-4 text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">{activeDocument.name}</p>
                <p className="text-[10px] text-slate-500">
                  {activeDocument.pages} pages · {activeDocument.chunks_created} chunks
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-500">
              No policy uploaded yet.
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="secondary" className="w-full" size="sm" onClick={handleUploadClick}>
          <Upload className="h-4 w-4" />
          {activeDocument ? 'Upload Another PDF' : 'Upload Policy PDF'}
        </Button>
      </div>

      <Separator className="bg-slate-800/60" />

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Grounding
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Questions are answered from the active document only. If the evidence is insufficient,
          PolicyMitra returns an unknown result instead of guessing.
        </p>
      </div>
    </motion.aside>
  )
}
