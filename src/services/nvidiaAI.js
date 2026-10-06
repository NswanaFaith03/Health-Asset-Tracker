// NVIDIA AI Service for Mental Buddy Feature
// Now uses local proxy server to avoid CORS issues

const PROXY_SERVER_URL = import.meta.env.VITE_PROXY_SERVER_URL || 'http://localhost:3001'

export async function chatWithAI(message, conversationType = 'mental_buddy', conversationHistory = []) {
  try {
    const response = await fetch(`${PROXY_SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        conversationType,
        conversationHistory
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Proxy Server Error:', errorData)
      throw new Error(errorData.error || 'Failed to get AI response')
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('Error calling NVIDIA AI via proxy:', error)
    throw error
  }
}

export async function getInitialGreeting(conversationType = 'mental_buddy') {
  const greetings = {
    mental_buddy: "Hello! I'm DiGi, your mental health companion. I'm here to listen, support you, and help you navigate any challenges you might be facing. How are you feeling today?",
    hiv_counseling: "Hello! I'm DiGi, your HIV counseling companion. I'm here to provide information, support, and a safe space to discuss HIV-related topics. What would you like to know or talk about today?"
  }

  return greetings[conversationType] || greetings.mental_buddy
}

