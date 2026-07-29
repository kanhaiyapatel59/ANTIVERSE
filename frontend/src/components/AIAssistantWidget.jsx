import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  X, 
  Send, 
  Sparkles
} from 'lucide-react'
import axios from 'axios'

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi! I am your AI Command Center Assistant. Ask me anything about our 6 specialized AI agents, the Day 2 LangGraph Commander, or system architecture!"
    }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const chatEndRef = useRef(null)

  const quickPrompts = [
    "How does the Commander Agent work?",
    "Explain all 6 AI Agents simply",
    "How to demo this system?",
    "What does the Weather Agent do?"
  ]

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend = inputMsg) => {
    const query = textToSend.trim()
    if (!query || loading) return

    const userMessage = { sender: 'user', text: query }
    setMessages(prev => [...prev, userMessage])
    setInputMsg('')
    setLoading(true)

    try {
      const response = await axios.post('/api/v1/assistant/chat', {
        message: query
      })
      if (response.data.reply) {
        setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }])
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "I am having trouble connecting to the AI brain. However, our platform features 6 specialized agents coordinated by a Day 2 LangGraph Commander!" 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3.5 rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white shadow-xl border border-blue-200/40 flex items-center justify-center cursor-pointer group"
        >
          <Bot className="w-6 h-6 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-mono font-bold bg-rose-600 text-white rounded-full border border-white shadow-md">
            AI COPILOT
          </span>
        </motion.button>
      </div>

      {/* SLIDE-OVER AI CHAT DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
            />

            {/* Right Side Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between pointer-events-auto text-[var(--text-main)] font-sans"
            >
              {/* DRAWER HEADER */}
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600">
                    <Sparkles className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-[var(--text-main)] uppercase tracking-wide">
                      Command Center AI Assistant
                    </h3>
                    <p className="text-[10px] text-blue-600 font-mono font-medium">Multi-Agent Copilot</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QUICK PROMPTS */}
              <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5 font-mono">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">Suggested Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-blue-700 dark:text-blue-400 text-[10px] hover:border-blue-400 transition-all text-left truncate max-w-full font-medium"
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 mt-1 flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-tl-none font-sans whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center space-x-2 text-blue-600 text-xs font-mono py-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>AI Assistant is analyzing query...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMsg.trim()}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
