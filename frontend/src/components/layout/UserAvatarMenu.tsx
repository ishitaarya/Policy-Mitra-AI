import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Settings, User } from 'lucide-react'
import { getInitials, useAuth } from '@/context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserAvatarMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const initials = getInitials(user.fullName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-violet-500/20 ring-2 ring-transparent transition-all hover:ring-violet-500/40 focus:outline-none focus:ring-violet-500/40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {initials}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-slate-200">{user.fullName}</p>
          <p className="text-xs font-normal text-slate-500">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut()
            navigate('/auth/sign-in')
          }}
          className="text-red-400 focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
