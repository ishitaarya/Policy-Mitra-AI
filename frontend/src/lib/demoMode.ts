import type { ChatMessage } from '@/types'
import type { DemoScenarioId } from '@/data/demoScenarios'
import { getDemoScenario } from '@/data/demoScenarios'

const DEMO_SCENARIO_KEY = 'policymitra_demo_scenario'
const DEMO_MESSAGES_KEY = 'policymitra_demo_messages'

let demoCache: ChatMessage[] | null = null

export function launchDemoScenario(id: DemoScenarioId): void {
  const scenario = getDemoScenario(id)
  if (!scenario) return

  demoCache = scenario.messages
  sessionStorage.setItem(DEMO_SCENARIO_KEY, id)
  sessionStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(scenario.messages))
}

export function consumeDemoMessages(): ChatMessage[] | null {
  if (demoCache) {
    const messages = demoCache
    demoCache = null
    sessionStorage.removeItem(DEMO_MESSAGES_KEY)
    sessionStorage.removeItem(DEMO_SCENARIO_KEY)
    return messages
  }

  const raw = sessionStorage.getItem(DEMO_MESSAGES_KEY)
  if (!raw) return null

  sessionStorage.removeItem(DEMO_MESSAGES_KEY)
  sessionStorage.removeItem(DEMO_SCENARIO_KEY)

  try {
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return null
  }
}

export function hasPendingDemo(): boolean {
  return !!demoCache || !!sessionStorage.getItem(DEMO_MESSAGES_KEY)
}
