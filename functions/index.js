const functions = require('firebase-functions')
const admin = require('firebase-admin')

try {
    admin.initializeApp()
} catch (e) {
    // already initialized in emulator or multiple imports
}

/**
 * Cloud Function: when a staffData document is updated and `approved` becomes true,
 * write an audit entry to the `auditLogs` collection.
 */
exports.onStaffApproved = functions.firestore
    .document('staffData/{uid}')
    .onUpdate(async (change, context) => {
        const before = change.before.data()
        const after = change.after.data()
        if (!before || !after) return null

        // Only act when approved flips from falsy to true
        const wasApproved = !!before.approved
        const isApproved = !!after.approved
        if (wasApproved || !isApproved) return null

        const uid = context.params.uid
        const audit = {
            type: 'approve_student',
            targetUid: uid,
            targetEmail: after.email || null,
            approvedBy: after.approvedBy || null,
            approvedAt: after.approvedAt ? admin.firestore.Timestamp.fromDate(new Date(after.approvedAt)) : admin.firestore.Timestamp.now(),
            emergencyContact: after.emergencyContact || null,
            createdAt: admin.firestore.Timestamp.now()
        }

        try {
            await admin.firestore().collection('auditLogs').add(audit)
            console.log('Audit log created for approved student', uid)
        } catch (err) {
            console.error('Failed to write audit log for approved student', uid, err)
        }

        return null
    })

/**
 * Cloud Function: Proxy for NVIDIA AI API to avoid CORS issues
 * This function runs on the server side and can call the NVIDIA API without CORS restrictions
 */
exports.chatWithAI = functions.https.onCall(async (data, context) => {
    // Verify the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { message, conversationType = 'mental_buddy', conversationHistory = [] } = data

    if (!message) {
        throw new functions.https.HttpsError('invalid-argument', 'Message is required')
    }

    const NVIDIA_API_KEY = functions.config().nvidia.api_key || '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'
    const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

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
    }

    try {
        const systemPrompt = SYSTEM_PROMPTS[conversationType] || SYSTEM_PROMPTS.mental_buddy

        // Build messages array with system prompt and conversation history
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
        ]

        const response = await fetch(NVIDIA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
                top_p: 0.9
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('NVIDIA API Error:', errorData)
            throw new functions.https.HttpsError('internal', `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I had trouble processing your message. Please try again.'

        return { response: aiMessage }
    } catch (error) {
        console.error('Error calling NVIDIA AI:', error)
        throw new functions.https.HttpsError('internal', 'Failed to get AI response')
    }
})
