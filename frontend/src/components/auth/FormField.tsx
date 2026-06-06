import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  index?: number
  children: ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, index = 0, children, className }: FormFieldProps) {
  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.06 }}
    >
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <motion.p
          className="text-xs text-red-400"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}
