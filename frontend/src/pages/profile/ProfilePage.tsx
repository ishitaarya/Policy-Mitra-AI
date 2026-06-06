import { motion } from 'framer-motion'
import {
  BarChart3,
  Building2,
  FileUp,
  GraduationCap,
  Mail,
  MessageSquare,
  Shield,
} from 'lucide-react'
import { getInitials, useAuth } from '@/context/AuthContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ProfilePage() {
  const { user, stats } = useAuth()

  if (!user) return null

  const statCards = [
    { icon: BarChart3, label: 'Policies Analyzed', value: stats.policiesAnalyzed, color: 'text-violet-400' },
    { icon: MessageSquare, label: 'Complaints Generated', value: stats.complaintsGenerated, color: 'text-cyan-400' },
    { icon: FileUp, label: 'Documents Uploaded', value: stats.documentsUploaded, color: 'text-green-400' },
  ]

  return (
    <PageLayout title="Profile" subtitle="Your account information and activity">
      <div className="space-y-6">
        <Card className="gradient-border">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
            <motion.div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-bold text-white shadow-xl shadow-violet-500/25"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {getInitials(user.fullName)}
            </motion.div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-slate-100">{user.fullName}</h2>
              <div className="mt-3 space-y-2">
                {[
                  { icon: Building2, value: user.collegeName },
                  { icon: Mail, value: user.email },
                  { icon: GraduationCap, value: user.accountType },
                ].map((item, i) => (
                  <motion.div
                    key={item.value}
                    className="flex items-center justify-center gap-2 text-sm text-slate-400 sm:justify-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <item.icon className="h-4 w-4 text-slate-500" />
                    {item.value}
                  </motion.div>
                ))}
              </div>
              <Badge variant="default" className="mt-3">
                <Shield className="mr-1 h-3 w-3" />
                {user.accountType} Account
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-300">Statistics</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
