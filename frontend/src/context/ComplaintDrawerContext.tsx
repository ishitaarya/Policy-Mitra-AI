import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { generateComplaint } from '@/lib/complaintGenerator'
import type { ComplaintGenerationContext, GeneratedComplaint } from '@/types'

interface OpenDrawerParams {
  userQuery: string
  context?: ComplaintGenerationContext
}

interface ComplaintDrawerContextValue {
  open: boolean
  complaint: GeneratedComplaint | null
  isRegenerating: boolean
  openDrawer: (params: OpenDrawerParams) => void
  closeDrawer: () => void
  regenerate: () => void
}

const ComplaintDrawerContext = createContext<ComplaintDrawerContextValue | null>(null)

export function ComplaintDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [complaint, setComplaint] = useState<GeneratedComplaint | null>(null)
  const [sourceQuery, setSourceQuery] = useState('')
  const [sourceContext, setSourceContext] = useState<ComplaintGenerationContext | undefined>()
  const [variant, setVariant] = useState(0)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const openDrawer = useCallback(({ userQuery, context }: OpenDrawerParams) => {
    setSourceQuery(userQuery)
    setSourceContext(context)
    setVariant(0)
    setComplaint(generateComplaint(userQuery, context, 0))
    setOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setOpen(false)
  }, [])

  const regenerate = useCallback(() => {
    if (!sourceQuery) return
    setIsRegenerating(true)
    window.setTimeout(() => {
      const nextVariant = variant + 1
      setVariant(nextVariant)
      setComplaint(generateComplaint(sourceQuery, sourceContext, nextVariant))
      setIsRegenerating(false)
    }, 700)
  }, [sourceQuery, sourceContext, variant])

  const value = useMemo(
    () => ({
      open,
      complaint,
      isRegenerating,
      openDrawer,
      closeDrawer,
      regenerate,
    }),
    [open, complaint, isRegenerating, openDrawer, closeDrawer, regenerate]
  )

  return (
    <ComplaintDrawerContext.Provider value={value}>{children}</ComplaintDrawerContext.Provider>
  )
}

export function useComplaintDrawer() {
  const context = useContext(ComplaintDrawerContext)
  if (!context) {
    throw new Error('useComplaintDrawer must be used within ComplaintDrawerProvider')
  }
  return context
}
