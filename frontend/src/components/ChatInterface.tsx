import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Sparkles } from 'lucide-react'
import { MessageCard } from '@/components/MessageCard'
import { QuickPromptChips } from '@/components/QuickPromptChips'
import { AIThinkingWorkflow } from '@/components/AIThinkingWorkflow'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useComplaintDrawer } from '@/context/ComplaintDrawerContext'
import { initialMessages, suggestedPrompts } from '@/data/mock'
import { askPolicy, mapAskResponseToChatMessage } from '@/lib/api'
import { isComplaintIssue } from '@/lib/complaintGenerator'
import { consumeDemoMessages } from '@/lib/demoMode'
import type { ChatMessage } from '@/types'

function resolveInitialState(): { messages: ChatMessage[]; hasInteracted: boolean } {
  const demo = consumeDemoMessages()
  if (demo) return { messages: demo, hasInteracted: true }
  return { messages: initialMessages, hasInteracted: false }
}

interface ChatInterfaceProps {
  onWorkflowChange?: (active: boolean) => void
}

export function ChatInterface({ onWorkflowChange }: ChatInterfaceProps) {
  const { openDrawer } = useComplaintDrawer()
  const [{ messages: initial, hasInteracted: initialInteracted }] = useState(resolveInitialState)
  const [messages, setMessages] = useState<ChatMessage[]>(initial)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(initialInteracted)
  const pendingResponseRef = useRef<ChatMessage | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const deliverResponse = useCallback(() => {
    const response = pendingResponseRef.current
    if (response) {
      setMessages((prev) => [...prev, response])

      const userQuery = response.relatedUserQuery
      if (userQuery && isComplaintIssue(userQuery)) {
        window.setTimeout(() => {
          openDrawer({
            userQuery,
            context: {
              policyCategory: response.policyCategory,
              assistantSummary: response.content,
              riskLevel: response.riskLevel,
              department: response.impact?.department,
            },
          })
        }, 500)
      }

      pendingResponseRef.current = null
    }
    setIsThinking(false)
    onWorkflowChange?.(false)
  }, [onWorkflowChange, openDrawer])

  const sendMessage = (text: string) => {
    if (!text.trim() || isThinking) return

    const trimmed = text.trim()

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setHasInteracted(true)

    // get document id from last upload
    const saved = localStorage.getItem('policymitra_last_document')
    const last = saved ? JSON.parse(saved) : null
    if (!last?.document_id) {
      window.alert('Please upload a policy document before asking a question.')
      return
    }

    setIsThinking(true)
    onWorkflowChange?.(true)

    // call backend
    ;(async () => {
      try {
        const resp = await askPolicy(last.document_id, trimmed)
        const mapped = mapAskResponseToChatMessage(resp, trimmed, last.name, last.document_id)
        // store pending response for AIThinkingWorkflow to deliver
        pendingResponseRef.current = mapped as ChatMessage
      } catch (err: any) {
        console.error('ask error', err)
        const now = new Date()
        pendingResponseRef.current = {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content: `Error fetching answer: ${err?.message ?? 'Service unavailable'}`,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedUserQuery: trimmed,
        } as ChatMessage
      }
    })()
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <ScrollArea className="flex-1 px-6">
        <div className="mx-auto max-w-3xl space-y-6 py-8">
          {!hasInteracted && messages.length <= 2 && (
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-xl shadow-violet-500/25"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-slate-100">
                Kya poochna hai aaj?
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Apne college policies ke baare mein Hindi, Hinglish, ya English mein poocho.
                Instant answers with risk analysis & action steps.
              </p>
              <div className="mt-6">
                <QuickPromptChips prompts={suggestedPrompts} onSelect={sendMessage} />
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <MessageCard
              key={msg.id}
              message={msg}
              index={i}
              userQuery={
                msg.role === 'assistant'
                  ? msg.relatedUserQuery ?? messages[i - 1]?.content
                  : undefined
              }
            />
          ))}

          <AnimatePresence>
            {isThinking && (
              <AIThinkingWorkflow active={isThinking} onComplete={deliverResponse} />
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-slate-800/60 p-4">
        <div className="mx-auto max-w-3xl">
          {messages.length <= 2 && hasInteracted && (
            <div className="mb-3">
              <QuickPromptChips prompts={suggestedPrompts} onSelect={sendMessage} />
            </div>
          )}
          <motion.div
            className="glass gradient-border flex items-end gap-2 rounded-2xl p-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Apna sawaal likho... Hindi, Hinglish, ya English mein"
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
            <Button
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isThinking}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
          <p className="mt-2 text-center text-[10px] text-slate-600">
            PolicyMitra AI can make mistakes. Verify with official policy documents.
          </p>
        </div>
      </div>
    </div>
  )
}
