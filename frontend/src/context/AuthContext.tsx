import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  RecentActivity,
  SignInCredentials,
  SignUpData,
  User,
  UserPreferences,
  UserStats,
} from '@/types/auth'

const STORAGE_KEY = 'policymitra_auth'

interface StoredAuth {
  user: User
  stats: UserStats
  preferences: UserPreferences
  recentActivity: RecentActivity[]
}

interface AuthContextValue {
  user: User | null
  stats: UserStats
  preferences: UserPreferences
  recentActivity: RecentActivity[]
  isAuthenticated: boolean
  isLoading: boolean
  showWelcome: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signInWithGoogle: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  signOut: () => void
  dismissWelcome: () => void
  quickDemoLogin: () => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
}

const defaultStats: UserStats = {
  policiesViewed: 24,
  policiesAnalyzed: 18,
  complaintsGenerated: 5,
  documentsUploaded: 3,
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  language: 'hinglish',
  emailNotifications: true,
  policyAlerts: true,
}

const defaultActivity: RecentActivity[] = [
  { id: '1', action: 'Analyzed Attendance Policy', timestamp: '2 hours ago' },
  { id: '2', action: 'Generated hostel complaint', timestamp: 'Yesterday' },
  { id: '3', action: 'Uploaded Scholarship Policy.pdf', timestamp: '3 days ago' },
]

const demoUser: User = {
  id: 'demo-1',
  fullName: 'Rahul Sharma',
  collegeName: 'Delhi Technological University',
  email: 'rahul.sharma@dtu.ac.in',
  accountType: 'Student',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

function saveAuth(data: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats>(defaultStats)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(defaultActivity)
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const stored = loadStoredAuth()
    if (stored) {
      setUser(stored.user)
      setStats(stored.stats)
      setPreferences(stored.preferences)
      setRecentActivity(stored.recentActivity)
    }
    setIsLoading(false)
  }, [])

  const persist = useCallback(
    (nextUser: User, nextStats = stats, nextPrefs = preferences, nextActivity = recentActivity) => {
      saveAuth({ user: nextUser, stats: nextStats, preferences: nextPrefs, recentActivity: nextActivity })
    },
    [stats, preferences, recentActivity]
  )

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      await new Promise((r) => setTimeout(r, 800))
      const stored = loadStoredAuth()
      const nextUser = stored?.user ?? {
        ...demoUser,
        email: credentials.email,
        fullName: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }
      setUser(nextUser)
      setShowWelcome(true)
      persist(nextUser)
    },
    [persist]
  )

  const signUp = useCallback(
    async (data: SignUpData) => {
      await new Promise((r) => setTimeout(r, 1000))
      const nextUser: User = {
        id: `user-${Date.now()}`,
        fullName: data.fullName,
        collegeName: data.collegeName,
        email: data.email,
        accountType: 'Student',
      }
      setUser(nextUser)
      setShowWelcome(true)
      persist(nextUser, { ...defaultStats, policiesViewed: 0, complaintsGenerated: 0 })
    },
    [persist]
  )

  const signInWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 900))
    setUser(demoUser)
    setShowWelcome(true)
    persist(demoUser)
  }, [persist])

  const forgotPassword = useCallback(async (_email: string) => {
    await new Promise((r) => setTimeout(r, 700))
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setShowWelcome(false)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const dismissWelcome = useCallback(() => setShowWelcome(false), [])

  const quickDemoLogin = useCallback(() => {
    setUser(demoUser)
    setShowWelcome(false)
    saveAuth({
      user: demoUser,
      stats: defaultStats,
      preferences: defaultPreferences,
      recentActivity: defaultActivity,
    })
  }, [])

  const updatePreferences = useCallback(
    (prefs: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...prefs }
        if (user) persist(user, stats, next)
        return next
      })
    },
    [user, stats, persist]
  )

  const value = useMemo(
    () => ({
      user,
      stats,
      preferences,
      recentActivity,
      isAuthenticated: !!user,
      isLoading,
      showWelcome,
      signIn,
      signUp,
      signInWithGoogle,
      forgotPassword,
      signOut,
      dismissWelcome,
      quickDemoLogin,
      updatePreferences,
    }),
    [
      user,
      stats,
      preferences,
      recentActivity,
      isLoading,
      showWelcome,
      signIn,
      signUp,
      signInWithGoogle,
      forgotPassword,
      signOut,
      dismissWelcome,
      quickDemoLogin,
      updatePreferences,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { getInitials }
