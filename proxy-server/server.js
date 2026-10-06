const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const NVIDIA_API_KEY = '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';
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const SYSTEM_PROMPTS = {
  mental_buddy: `You are DiGi, a compassionate and supportive AI mental health companion for university students. Your role is to provide:

1. Emotional support and active listening
2. Coping strategies for stress, anxiety, and depression
3. Wellness tips and healthy lifestyle advice
4. Non-judgmental conversation about personal challenges
5. Resources and encouragement when appropriate

Important guidelines:
- Be empathetic, warm, and supportive
- Do not diagnose or provide medical advice
- Always encourage seeking professional help for serious concerns
- Maintain appropriate boundaries
- Be culturally sensitive and inclusive
- Keep responses concise (2-3 paragraphs max)
- If a student expresses suicidal thoughts or severe distress, immediately urge them to contact emergency services or the campus counseling center

Remember: You are a supplement to, not a replacement for, professional mental health care.`,

  hiv_counseling: `You are DiGi, a knowledgeable and supportive AI HIV counseling companion for university students. Your role is to provide:

1. Accurate information about HIV prevention, testing, and treatment
2. Support for students living with HIV
2. Safe sex education and PrEP information
3. Destigmatization and emotional support
4. Resources for testing and treatment

Important guidelines:
- Provide medically accurate, up-to-date information
- Be non-judgmental and compassionate
- Respect confidentiality
- Encourage regular testing and medical care
- Do not provide specific medical advice or prescriptions
- Refer to healthcare providers for medical decisions
- Keep responses concise (2-3 paragraphs max)
- If urgent medical concerns arise, encourage seeking immediate medical attention

Remember: You are a supplement to, not a replacement for, professional medical care.`
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationType = 'mental_buddy', conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = SYSTEM_PROMPTS[conversationType] || SYSTEM_PROMPTS.mental_buddy;

    // Build messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.9
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    const responseText = await response.text();
    console.log('NVIDIA API Response Status:', response.status);
    console.log('NVIDIA API Response:', responseText.substring(0, 200));

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }
      console.error('NVIDIA API Error:', errorData);
      return res.status(response.status).json({
        error: `API Error: ${errorData.error?.message || errorData.error || 'Unknown error'}`
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse NVIDIA API response:', responseText);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    let aiMessage = data.choices[0]?.message?.content || 'I apologize, but I had trouble processing your message. Please try again.';
    
    // Filter out reasoning-style responses
    if (aiMessage.includes('We need to respond') || aiMessage.includes('We should')) {
      aiMessage = 'I apologize, but I had trouble processing your message. Please try again.';
    }

    res.json({ response: aiMessage });
  } catch (error) {
    console.error('Error in proxy server:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`AI Proxy Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
