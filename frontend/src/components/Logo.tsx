import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-sm' },
    md: { icon: 'h-8 w-8', text: 'text-base' },
    lg: { icon: 'h-10 w-10', text: 'text-xl' },
  }

  return (
    <motion.div
      className="flex items-center gap-2.5"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25',
          sizes[size].icon
        )}
      >
        <GraduationCap className="h-1/2 w-1/2 text-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-semibold tracking-tight text-slate-100', sizes[size].text)}>
            Policy<span className="gradient-text">Mitra</span>AI
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            AI Assistant
          </span>
        </div>
      )}
    </motion.div>
  )
}
