import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { FormField } from '@/components/auth/FormField'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()

  const [form, setForm] = useState({
    fullName: '',
    collegeName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!form.collegeName.trim()) next.collegeName = 'College name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await signUp(form)
      setSuccess(true)
      setTimeout(() => navigate('/app', { replace: true }), 1200)
    } catch {
      setErrors({ email: 'Could not create account. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/app', { replace: true })
    } finally {
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Account Created!" subtitle="Redirecting to your dashboard...">
        <motion.div
          className="flex flex-col items-center py-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-400" />
          </motion.div>
          <p className="mt-4 text-sm text-slate-400">Welcome to PolicyMitra AI!</p>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of students navigating college policies"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" htmlFor="fullName" error={errors.fullName} index={0}>
          <Input
            id="fullName"
            placeholder="Rahul Sharma"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
        </FormField>

        <FormField label="College Name" htmlFor="collegeName" error={errors.collegeName} index={1}>
          <Input
            id="collegeName"
            placeholder="Delhi Technological University"
            value={form.collegeName}
            onChange={(e) => update('collegeName', e.target.value)}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email} index={2}>
          <Input
            id="email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password} index={3}>
          <PasswordInput
            id="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword}
          index={4}
        >
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
          />
        </FormField>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </motion.div>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      <AuthFooterLink
        text="Already have an account?"
        linkText="Sign In"
        to="/auth/sign-in"
      />
    </AuthLayout>
  )
}
