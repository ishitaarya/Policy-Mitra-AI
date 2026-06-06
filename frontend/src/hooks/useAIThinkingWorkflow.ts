import { useCallback, useEffect, useRef, useState } from 'react'

export interface ThinkingStep {
  id: string
  label: string
}

export const THINKING_STEPS: ThinkingStep[] = [
  { id: 'understand', label: 'Understanding Query' },
  { id: 'language', label: 'Detecting Language' },
  { id: 'retrieve', label: 'Retrieving Policies' },
  { id: 'analyze', label: 'Analyzing Rules' },
  { id: 'risk', label: 'Assessing Risk' },
  { id: 'action', label: 'Generating Action Plan' },
  { id: 'prepare', label: 'Preparing Response' },
]

const STEP_DURATIONS = [340, 300, 380, 400, 360, 340, 380]

export type StepStatus = 'pending' | 'active' | 'complete'

export interface StepState {
  status: StepStatus
  progress: number
}

export function getWorkflowDuration() {
  return STEP_DURATIONS.reduce((a, b) => a + b, 0) + (THINKING_STEPS.length - 1) * 60
}

interface UseAIThinkingWorkflowOptions {
  active: boolean
  onComplete?: () => void
}

export function useAIThinkingWorkflow({ active, onComplete }: UseAIThinkingWorkflowOptions) {
  const [steps, setSteps] = useState<StepState[]>(
    THINKING_STEPS.map(() => ({ status: 'pending', progress: 0 }))
  )
  const [overallProgress, setOverallProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([])
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimers = useCallback(() => {
    intervalRefs.current.forEach(clearInterval)
    timeoutRefs.current.forEach(clearTimeout)
    intervalRefs.current = []
    timeoutRefs.current = []
  }, [])

  const reset = useCallback(() => {
    setSteps(THINKING_STEPS.map(() => ({ status: 'pending', progress: 0 })))
    setOverallProgress(0)
    setActiveIndex(-1)
  }, [])

  const run = useCallback(() => {
    clearTimers()
    reset()

    let cumulativeDelay = 0

    THINKING_STEPS.forEach((_, index) => {
      const duration = STEP_DURATIONS[index]
      const startTimeout = setTimeout(() => {
        setActiveIndex(index)
        setSteps((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: 'active' } : s))
        )

        const tick = 30
        const totalTicks = duration / tick
        let current = 0

        const interval = setInterval(() => {
          current++
          const progress = Math.min(100, Math.round((current / totalTicks) * 100))

          setSteps((prev) =>
            prev.map((s, i) => (i === index ? { ...s, progress } : s))
          )
          setOverallProgress(
            Math.round(((index + progress / 100) / THINKING_STEPS.length) * 100)
          )

          if (current >= totalTicks) {
            clearInterval(interval)
            setSteps((prev) =>
              prev.map((s, i) =>
                i === index ? { status: 'complete', progress: 100 } : s
              )
            )
            setOverallProgress(
              Math.round(((index + 1) / THINKING_STEPS.length) * 100)
            )

            if (index === THINKING_STEPS.length - 1) {
              const doneTimeout = setTimeout(() => {
                onCompleteRef.current?.()
              }, 200)
              timeoutRefs.current.push(doneTimeout)
            }
          }
        }, tick)

        intervalRefs.current.push(interval)
      }, cumulativeDelay)

      timeoutRefs.current.push(startTimeout)
      cumulativeDelay += duration + 60
    })
  }, [clearTimers, reset])

  useEffect(() => {
    if (active) run()
    return clearTimers
  }, [active, run, clearTimers])

  useEffect(() => () => clearTimers(), [clearTimers])

  const completedCount = steps.filter((s) => s.status === 'complete').length
  const allComplete = completedCount === THINKING_STEPS.length

  return { steps, overallProgress, activeIndex, completedCount, allComplete }
}
