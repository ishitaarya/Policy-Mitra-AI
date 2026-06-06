import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a recovery link to your email"
    >
      <Link
        to="/auth/sign-in"
        className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-violet-400"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Sign In
      </Link>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            className="flex flex-col items-center py-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <CheckCircle2 className="h-14 w-14 text-green-400" />
            </motion.div>
            <h3 className="mt-4 text-base font-semibold text-slate-200">Check your inbox</h3>
            <p className="mt-2 text-sm text-slate-400">
              We sent a password reset link to{' '}
              <span className="text-violet-400">{email}</span>
            </p>
            <Link to="/auth/sign-in" className="mt-6">
              <Button variant="secondary" size="sm">
                Return to Sign In
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FormField label="Email" htmlFor="email" index={0}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>

            {error && (
              <p className="text-center text-xs text-red-400">{error}</p>
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
