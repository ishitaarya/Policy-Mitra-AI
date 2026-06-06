import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { GradientBackground } from '@/components/GradientBackground'
import { UserAvatarMenu } from '@/components/layout/UserAvatarMenu'
import { Button } from '@/components/ui/button'

interface PageLayoutProps {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  children: ReactNode
}

export function PageLayout({
  title,
  subtitle,
  backTo = '/app',
  backLabel = 'Back to App',
  children,
}: PageLayoutProps) {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <GradientBackground />

      <motion.header
        className="relative z-10 flex items-center justify-between border-b border-slate-800/60 px-4 py-3 glass md:px-8"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link to={backTo}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        <UserAvatarMenu />
      </motion.header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-semibold text-slate-100 md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
