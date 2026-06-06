export type LanguagePreference = 'english' | 'hindi' | 'hinglish'
export type ThemePreference = 'dark' | 'light'
export type AccountType = 'Student' | 'Premium'

export interface User {
  id: string
  fullName: string
  collegeName: string
  email: string
  accountType: AccountType
}

export interface UserStats {
  policiesViewed: number
  policiesAnalyzed: number
  complaintsGenerated: number
  documentsUploaded: number
}

export interface UserPreferences {
  theme: ThemePreference
  language: LanguagePreference
  emailNotifications: boolean
  policyAlerts: boolean
}

export interface RecentActivity {
  id: string
  action: string
  timestamp: string
}

export interface SignInCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpData {
  fullName: string
  collegeName: string
  email: string
  password: string
  confirmPassword: string
}
