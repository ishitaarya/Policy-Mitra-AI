import { motion } from 'framer-motion'
import { Globe, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { LanguagePreference } from '@/types/auth'

const languages: { value: LanguagePreference; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'hinglish', label: 'Hinglish' },
]

export function SettingsPage() {
  const { preferences, updatePreferences } = useAuth()

  return (
    <PageLayout title="Settings" subtitle="Customize your PolicyMitra experience">
      <div className="space-y-6">
        <Card className="glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {preferences.theme === 'dark' ? (
                <Moon className="h-4 w-4 text-violet-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
              Theme
            </CardTitle>
            <CardDescription>Choose your preferred appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {(['dark', 'light'] as const).map((theme) => (
                <motion.button
                  key={theme}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                    preferences.theme === theme
                      ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                      : 'border-slate-700/60 text-slate-400 hover:border-slate-600'
                  )}
                  onClick={() => updatePreferences({ theme })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              Language Preference
            </CardTitle>
            <CardDescription>Preferred language for AI responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <motion.button
                  key={lang.value}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all',
                    preferences.language === lang.value
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
                      : 'glass text-slate-400 hover:text-slate-200'
                  )}
                  onClick={() => updatePreferences({ language: lang.value })}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {lang.label}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                id: 'email',
                label: 'Email Notifications',
                description: 'Receive policy updates and reminders via email',
                checked: preferences.emailNotifications,
                key: 'emailNotifications' as const,
              },
              {
                id: 'alerts',
                label: 'Policy Alerts',
                description: 'Get notified about deadline and compliance risks',
                checked: preferences.policyAlerts,
                key: 'policyAlerts' as const,
              },
            ].map((item, i) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between gap-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <div>
                  <Label htmlFor={item.id} className="text-sm text-slate-200">
                    {item.label}
                  </Label>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(v) => updatePreferences({ [item.key]: v })}
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
