import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Globe,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react'
import { GradientBackground } from '@/components/GradientBackground'
import { Logo } from '@/components/Logo'
import { DemoModeSection } from '@/components/demo/DemoModeSection'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Globe,
    title: 'Multilingual',
    description: 'Ask in Hindi, Hinglish, or English — get answers in your language.',
  },
  {
    icon: Shield,
    title: 'Risk Analysis',
    description: 'Instant risk scoring with actionable steps before it\'s too late.',
  },
  {
    icon: BookOpen,
    title: 'Source Citations',
    description: 'Every answer linked to exact page & section in your policy PDF.',
  },
  {
    icon: Zap,
    title: 'Instant Actions',
    description: 'Auto-generated complaints, checklists, and ELI5 explanations.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <GradientBackground />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link to="/auth/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/auth/sign-up">
            <Button size="sm">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center px-6 pt-16 pb-24 text-center md:pt-24">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Policy Assistant for College Students
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-100 md:text-6xl md:leading-[1.1]"
        >
          Understand College Policies{' '}
          <span className="gradient-text">Like A Senior</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg"
        >
          Ask questions in Hindi, Hinglish, or English and get instant actionable answers
          with risk scores, source citations, and step-by-step checklists.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/auth/sign-in">
            <Button size="lg" className="min-w-[160px]">
              Try Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="secondary" className="min-w-[160px]">
            <Upload className="h-4 w-4" />
            Upload Policy
          </Button>
        </motion.div>

        <DemoModeSection />

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-20 w-full max-w-5xl"
        >
          <div className="glass gradient-border overflow-hidden rounded-2xl shadow-2xl shadow-violet-500/10">
            <div className="flex items-center gap-2 border-b border-slate-800/60 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="ml-2 text-xs text-slate-500">PolicyMitra AI — Demo</span>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="space-y-3 text-left">
                <div className="h-8 w-32 shimmer rounded-lg" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 shimmer rounded-md" style={{ width: `${70 + i * 10}%` }} />
                  ))}
                </div>
              </div>
              <div className="space-y-3 text-left md:col-span-1">
                <div className="rounded-xl bg-violet-500/10 p-3 text-xs text-violet-300">
                  Attendance short ka scene?
                </div>
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Risk Level:</span>
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      HIGH
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Bhai, tumhari attendance 68% hai jo ki minimum 75% se kam hai...
                  </p>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 shimmer rounded-md" />
                    <div className="h-6 w-24 shimmer rounded-md" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex justify-center">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="32" fill="none" stroke="#ef4444" strokeWidth="6"
                        strokeDasharray="201" strokeDashoffset="36" strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-200">
                      82
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border border-slate-600" />
                      <div className="h-4 flex-1 shimmer rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-12 text-center text-2xl font-semibold text-slate-200 md:text-3xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Built for students who{' '}
            <span className="gradient-text">don't read 50-page PDFs</span>
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass glass-hover rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20">
                  <feature.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-slate-200">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800/40 px-6 py-8 text-center">
        <p className="text-xs text-slate-600">
          © 2026 PolicyMitra AI — Built for national AI hackathons
        </p>
      </footer>
    </div>
  )
}
