import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { Send, Bot, User, AlertCircle, RotateCcw, Plus, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { chatWithAI, getInitialGreeting } from '../services/nvidiaAI'

export default function AICompanionChat({ conversationType = 'mental_buddy', onClose }) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const conversationTypes = {
    mental_buddy: { title: 'AI Mental Buddy', description: 'Talk to DiGi for emotional support' },
    hiv_counseling: { title: 'AI HIV Counselor', description: 'Get information and support about HIV' }
  }

  const config = conversationTypes[conversationType] || conversationTypes.mental_buddy

  // Load conversation list
  useEffect(() => {
    if (!currentUser?.uid) return

    const q = query(
      collection(db, 'aiConversations'),
      where('userId', '==', currentUser.uid),
      where('conversationType', '==', conversationType),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Group messages by conversationId
      const conversationsMap = new Map()
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const convId = data.conversationId || 'default'
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            id: convId,
            title: data.content?.substring(0, 50) + '...' || 'New conversation',
            createdAt: data.createdAt,
            messageCount: 0
          })
        }
        conversationsMap.get(convId).messageCount++
      })

      const convList = Array.from(conversationsMap.values())
      setConversations(convList)

      // Set current conversation if not set
      if (!currentConversationId && convList.length > 0) {
        setCurrentConversationId(convList[0].id)
      }
    }, (error) => {
      console.error('Error loading conversations:', error)
    })

    return () => unsubscribe()
  }, [currentUser, conversationType, currentConversationId])

  // Load messages for current conversation
  useEffect(() => {
    if (!currentUser?.uid || !currentConversationId) return

    const q = query(
      collection(db, 'aiConversations'),
      where('userId', '==', currentUser.uid),
      where('conversationType', '==', conversationType),
      where('conversationId', '==', currentConversationId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(conversationMessages)
    }, (error) => {
      console.error('Error loading conversation:', error)
    })

    // Send initial greeting if no messages exist
    const checkAndSendGreeting = async () => {
      const unsubscribe2 = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          sendInitialGreeting()
        }
        unsubscribe2()
      })
    }

    checkAndSendGreeting()

    return () => unsubscribe()
  }, [currentUser, conversationType, currentConversationId])

  const sendInitialGreeting = async () => {
    try {
      const greeting = await getInitialGreeting(conversationType)
      const convId = currentConversationId || 'conv_' + Date.now()
      if (!currentConversationId) {
        setCurrentConversationId(convId)
      }
      await addDoc(collection(db, 'aiConversations'), {
        userId: currentUser.uid,
        conversationType,
        conversationId: convId,
        role: 'assistant',
        content: greeting,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error sending greeting:', error)
    }
  }

  const createNewConversation = async () => {
    const newConvId = 'conv_' + Date.now()
    setCurrentConversationId(newConvId)
    setMessages([])
    setInputMessage('')
    setError('')
    // The greeting will be sent automatically by the useEffect
  }

  const selectConversation = (convId) => {
    setCurrentConversationId(convId)
    setMessages([])
    setInputMessage('')
    setError('')
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError('')

    try {
      const convId = currentConversationId || 'conv_' + Date.now()
      if (!currentConversationId) {
        setCurrentConversationId(convId)
      }

      // Add user message to Firestore
      await addDoc(collection(db, 'aiConversations'), {
        userId: currentUser.uid,
        conversationType,
        conversationId: convId,
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString()
      })

      setIsLoading(true)

      // Get conversation history for context (last 10 messages)
      const recentHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Get AI response via Cloud Function
      const aiResponse = await chatWithAI(userMessage, conversationType, recentHistory)

      // Add AI response to Firestore
      await addDoc(collection(db, 'aiConversations'), {
        userId: currentUser.uid,
        conversationType,
        conversationId: convId,
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to get a response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleResetConversation = async () => {
    if (!window.confirm('Are you sure you want to clear this conversation? This cannot be undone.')) {
      return
    }

    try {
      // Delete all messages in this conversation
      const q = query(
        collection(db, 'aiConversations'),
        where('userId', '==', currentUser.uid),
        where('conversationType', '==', conversationType),
        where('conversationId', '==', currentConversationId)
      )

      const snapshot = await getDocs(q)
      const batch = snapshot.docs.map(doc => doc.ref)

      await Promise.all(batch.map(ref => ref.delete()))

      // Send new greeting
      await sendInitialGreeting()
    } catch (error) {
      console.error('Error resetting conversation:', error)
      setError('Failed to reset conversation. Please try again.')
    }
  }

  const deleteConversation = async (convId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return
    }

    try {
      const q = query(
        collection(db, 'aiConversations'),
        where('userId', '==', currentUser.uid),
        where('conversationType', '==', conversationType),
        where('conversationId', '==', convId)
      )

      const snapshot = await getDocs(q)
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)))

      if (currentConversationId === convId) {
        setCurrentConversationId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      setError('Failed to delete conversation. Please try again.')
    }
  }

  return (
    <div className="flex h-screen bg-white relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Conversation History */}
      <div className={`${showSidebar ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'} md:translate-x-0 fixed md:relative z-50 md:z-auto h-full transition-all duration-300 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition font-medium text-sm touch-manipulation"
          >
            <Plus className="h-5 w-5" />
            New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`group p-4 rounded-xl cursor-pointer transition touch-manipulation ${
                  currentConversationId === conv.id
                    ? 'bg-teal-50 border border-teal-200'
                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500">{conv.messageCount} messages</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">{conv.title}</p>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition touch-manipulation"
                    title="Delete conversation"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 md:px-4 md:py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-emerald-50 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition touch-manipulation"
              title="Toggle sidebar"
            >
              {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600 shrink-0">
              <Bot className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm md:text-base truncate">{config.title}</h3>
              <p className="text-xs text-slate-600 hidden md:block">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={handleResetConversation}
              className="p-2 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition touch-manipulation"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4 md:h-4 md:w-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition touch-manipulation"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      {/* Disclaimer */}
      <div className="px-3 py-2 md:px-4 md:py-2 bg-amber-50 border-b border-amber-200 shrink-0">
        <div className="flex items-start gap-2 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="line-clamp-2 md:line-clamp-none">
            This AI companion provides general support and information only. It is not a substitute for professional medical or mental health care. For serious concerns, please contact a healthcare professional or emergency services.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p className="text-sm">Loading conversation...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                  message.role === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-2 md:gap-3 justify-start">
            <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-100 rounded-2xl px-3 py-2 md:px-4 md:py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t border-slate-200 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-400 focus:outline-none touch-manipulation"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
