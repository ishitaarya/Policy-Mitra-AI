import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { FormField } from '@/components/auth/FormField'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle } = useAuth()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/app'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signIn({ email, password, rememberMe })
      navigate(from, { replace: true })
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your policy assistant"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="email" index={0}>
          <Input
            id="email"
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </FormField>

        <FormField label="Password" htmlFor="password" index={1}>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>

        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
            />
            <Label htmlFor="remember" className="text-xs font-normal text-slate-400">
              Remember Me
            </Label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-xs text-violet-400 transition-colors hover:text-cyan-400"
          >
            Forgot Password?
          </Link>
        </motion.div>

        {error && (
          <motion.p
            className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </motion.div>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      <AuthFooterLink
        text="Don't have an account?"
        linkText="Sign Up"
        to="/auth/sign-up"
      />
    </AuthLayout>
  )
}
