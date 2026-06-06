import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface AuthFooterLinkProps {
  text: string
  linkText: string
  to: string
}

export function AuthFooterLink({ text, linkText, to }: AuthFooterLinkProps) {
  return (
    <motion.p
      className="mt-6 text-center text-sm text-slate-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {text}{' '}
      <Link
        to={to}
        className="font-medium text-violet-400 transition-colors hover:text-cyan-400"
      >
        {linkText}
      </Link>
    </motion.p>
  )
}
