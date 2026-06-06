import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GradientBackground } from '@/components/GradientBackground'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RightSidebar } from '@/components/RightSidebar'
import { ChatInterface } from '@/components/ChatInterface'
import { AICommandCenter } from '@/components/AICommandCenter'
import { UserAvatarMenu } from '@/components/layout/UserAvatarMenu'
import { WelcomeCard } from '@/components/welcome/WelcomeCard'
import { Button } from '@/components/ui/button'
import { ComplaintGeneratorDrawer } from '@/components/ComplaintGeneratorDrawer'
import { ComplaintDrawerProvider } from '@/context/ComplaintDrawerContext'
import { useAuth } from '@/context/AuthContext'
import { hasPendingDemo } from '@/lib/demoMode'
import type { UploadedDocument } from '@/types'

function loadLastDocument(): UploadedDocument | null {
  try {
    const saved = localStorage.getItem('policymitra_last_document')
    return saved ? JSON.parse(saved) as UploadedDocument : null
  } catch {
    localStorage.removeItem('policymitra_last_document')
    return null
  }
}

export function AppPage() {
  const [workflowActive, setWorkflowActive] = useState(false)
  const [activeDocument, setActiveDocument] = useState<UploadedDocument | null>(loadLastDocument)
  const { isAuthenticated, quickDemoLogin } = useAuth()

  useEffect(() => {
    if (hasPendingDemo() && !isAuthenticated) {
      quickDemoLogin()
    }
  }, [isAuthenticated, quickDemoLogin])

  return (
    <ComplaintDrawerProvider>
    <div className="relative flex h-svh flex-col overflow-hidden">
      <GradientBackground />

      <motion.header
        className="relative z-10 flex items-center justify-between border-b border-slate-800/60 px-4 py-2 glass"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-medium text-green-400 sm:inline">
            ● Live Demo
          </span>
          <UserAvatarMenu />
        </div>
      </motion.header>

      <WelcomeCard />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <LeftSidebar
          activeDocument={activeDocument}
          onDocumentUploaded={setActiveDocument}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          <ChatInterface
            activeDocument={activeDocument}
            onWorkflowChange={setWorkflowActive}
          />
        </main>
        <RightSidebar />
      </div>

      <AICommandCenter active={workflowActive} />
      <ComplaintGeneratorDrawer />
    </div>
    </ComplaintDrawerProvider>
  )
}
