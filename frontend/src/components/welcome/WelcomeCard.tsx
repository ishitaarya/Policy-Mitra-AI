import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, FileText, MessageSquare, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'

export function WelcomeCard() {
  const { user, stats, recentActivity, showWelcome, dismissWelcome } = useAuth()

  if (!user) return null

  const firstName = user.fullName.split(' ')[0]

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          className="absolute left-1/2 top-4 z-30 w-full max-w-lg -translate-x-1/2 px-4"
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <Card className="gradient-border shadow-2xl shadow-violet-500/15">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">
                      Welcome back,{' '}
                      <span className="gradient-text">{firstName}</span>
                    </h3>
                    <p className="text-xs text-slate-400">{user.collegeName}</p>
                  </div>
                </div>
                <button
                  onClick={dismissWelcome}
                  className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: BookOpen, label: 'Policies Viewed', value: stats.policiesViewed },
                  { icon: MessageSquare, label: 'Complaints Generated', value: stats.complaintsGenerated },
                  { icon: FileText, label: 'Docs Uploaded', value: stats.documentsUploaded },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="rounded-xl bg-slate-800/40 p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <stat.icon className="mx-auto mb-1 h-4 w-4 text-violet-400" />
                    <p className="text-lg font-bold text-slate-100">{stat.value}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Recent Activity
                </p>
                <div className="space-y-1.5">
                  {recentActivity.slice(0, 2).map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                    >
                      <span className="text-slate-400">{activity.action}</span>
                      <span className="text-slate-600">{activity.timestamp}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
