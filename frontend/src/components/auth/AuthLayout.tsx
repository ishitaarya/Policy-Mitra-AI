import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GradientBackground } from '@/components/GradientBackground'
import { Logo } from '@/components/Logo'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-8">
      <GradientBackground />

      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <Logo size="lg" />
        </Link>
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="glass gradient-border rounded-2xl p-6 shadow-2xl shadow-violet-500/10 md:p-8">
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </motion.div>
          {children}
        </div>
      </motion.div>

      <motion.p
        className="relative z-10 mt-6 text-center text-xs text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        © 2026 PolicyMitra AI — Secure & encrypted
      </motion.p>
    </div>
  )
}
