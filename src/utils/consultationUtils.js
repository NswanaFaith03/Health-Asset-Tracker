import { addDoc, collection, getDocs, orderBy, query, where, doc, updateDoc, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config'

export const ANONYMOUS_STUDENT_LABEL = 'Anonymous student'

/** Shared mental buddy + HIV counselling configuration (keep flows identical). */
export const COUNSELLING_APPOINTMENT_TYPES = {
    mental_buddy: {
        staffRole: 'mentalHealthCounselor',
        requestTitle: 'Mental buddy',
        requestLabel: 'mental buddy',
        sessionStartNote: 'Mental buddy chat session started by student.'
    },
    hiv_counselling: {
        staffRole: 'hivProfessional',
        requestTitle: 'HIV counselling',
        requestLabel: 'HIV counselling',
        sessionStartNote: 'HIV counselling chat session started by student.'
    }
}

export function isCounsellingAppointmentType(appointmentType) {
    return appointmentType === 'mental_buddy' || appointmentType === 'hiv_counselling'
}

export function getCounsellingFlowConfig(appointmentType) {
    return COUNSELLING_APPOINTMENT_TYPES[appointmentType] || null
}

export function resolveCounsellingStudentDisplayName({ anonymousChat, name }) {
    return anonymousChat ? ANONYMOUS_STUDENT_LABEL : (name || 'Student')
}

export function resolveCounsellingMessageSenderName({ anonymousChat, senderType, senderName, senderId, studentUid }) {
    const isStudentMessage = senderType === 'student' || (studentUid && senderId === studentUid)
    if (anonymousChat && isStudentMessage) {
        return ANONYMOUS_STUDENT_LABEL
    }
    return senderName || 'User'
}

export async function notifyRecipients({ userIds, title, message, type = 'general', relatedId = '' }) {
    const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))]

    await Promise.all(uniqueUserIds.map((userId) => addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        relatedId,
        createdAt: new Date().toISOString(),
        read: false,
        readAt: null
    })))
}

export async function createStudentConsultation(payload) {
    // Validate that we have a valid user ID
    if (!payload.createdBy) {
        throw new Error('User ID is required to create a consultation')
    }

    const isAnonymous = !!payload.anonymousChat
    const studentDisplayName = resolveCounsellingStudentDisplayName({
        anonymousChat: isAnonymous,
        name: payload.patientName
    })

    const appointmentData = {
        patientName: studentDisplayName,
        patientPhone: payload.patientPhone || '',
        patientEmail: isAnonymous ? '' : (payload.patientEmail || ''),
        studentNumber: payload.studentNumber || '',
        appointmentDate: payload.appointmentDate || new Date().toISOString().split('T')[0],
        appointmentTime: payload.appointmentTime || '09:00',
        appointmentType: payload.appointmentType || 'consultation',
        doctorName: payload.doctorName || 'Awaiting assignment',
        doctorId: payload.doctorId || '',
        symptoms: payload.symptoms || '',
        severity: payload.severity || 'moderate',
        notes: payload.notes || '',
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
        status: payload.status || 'submitted',
        createdBy: payload.createdBy,
        source: 'student-portal',
        anonymousChat: !!payload.anonymousChat,
        visibility: payload.anonymousChat ? 'anonymous' : 'identified',
        acceptedBy: payload.acceptedBy || '',
        acceptedByName: payload.acceptedByName || '',
        assignedCounselorRole: payload.assignedCounselorRole || '',
        meta: payload.meta || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    const appointmentRef = doc(collection(db, 'appointments'))
    let sessionRef = null
    let sessionId = null

    if (isCounsellingAppointmentType(appointmentData.appointmentType)) {
        sessionRef = doc(collection(db, 'counsellingSessions'))
        sessionId = sessionRef.id
        appointmentData.counsellingSessionId = sessionId
    }

    const batch = writeBatch(db)
    batch.set(appointmentRef, appointmentData)

    let nextQueueNumber = null
    let queueEntryRef = null

    if ((appointmentData.appointmentType || 'consultation') === 'consultation') {
        const queueStudentId = (payload.studentNumber || payload.studentId || payload.createdBy).trim()
        if (queueStudentId) {
            // Scope queries to the signed-in student so Firestore list rules allow them.
            const queueQuery = query(
                collection(db, 'studentQueue'),
                where('studentUid', '==', payload.createdBy)
            )
            const existingQueueSnap = await getDocs(queueQuery)
            const existingQueueDocs = existingQueueSnap.docs.map(d => d.data() || {})
            const hasActive = existingQueueDocs.some(d => (d.status || '') !== 'served')

            if (!hasActive) {
                // Students cannot list the whole queue; staff assign final numbers in the nurse portal.
                nextQueueNumber = 0

                queueEntryRef = doc(collection(db, 'studentQueue'))
                batch.set(queueEntryRef, {
                    studentId: queueStudentId,
                    studentUid: payload.createdBy,
                    studentName: appointmentData.patientName || payload.patientName || 'Student',
                    email: appointmentData.patientEmail || payload.patientEmail || '',
                    sessionType: 'consultation',
                    status: 'waiting',
                    queueNumber: nextQueueNumber,
                    addedBy: appointmentData.createdBy,
                    addedByName: 'Student portal',
                    source: 'consultation-form',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
        }
    }

    if (sessionRef && isCounsellingAppointmentType(appointmentData.appointmentType)) {
        const flowConfig = getCounsellingFlowConfig(appointmentData.appointmentType)
        batch.set(sessionRef, {
            appointmentId: appointmentRef.id,
            appointmentType: appointmentData.appointmentType,
            role: flowConfig?.staffRole || '',
            studentUid: payload.createdBy,
            studentName: studentDisplayName,
            anonymousChat: isAnonymous,
            counselorUid: '',
            counselorName: '',
            status: 'submitted',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            closedAt: null,
            closedBy: ''
        })
    }

    await batch.commit()

    if (isCounsellingAppointmentType(appointmentData.appointmentType)) {
        const flowConfig = getCounsellingFlowConfig(appointmentData.appointmentType)
        const initialMessage = (payload.symptoms || payload.meta?.mentalSummary || '').trim()

        if (initialMessage && sessionId) {
            await sendCounsellingMessage({
                sessionId,
                senderType: 'student',
                senderId: payload.createdBy,
                senderName: studentDisplayName,
                message: initialMessage
            })
        }

        const staffQuery = query(collection(db, 'staffData'), where('role', '==', flowConfig?.staffRole || ''))
        const staffSnapshot = await getDocs(staffQuery)
        const counselorIds = staffSnapshot.docs.map((entry) => entry.id).filter(Boolean)

        if (counselorIds.length > 0 && flowConfig) {
            await notifyRecipients({
                userIds: counselorIds,
                title: `${flowConfig.requestTitle} request received`,
                message: `${isAnonymous ? 'An anonymous student' : (appointmentData.patientName || 'A student')} has submitted a ${flowConfig.requestLabel} message and is waiting for a response.`,
                type: 'counselling_request',
                relatedId: sessionId || appointmentRef.id
            })
        }
    }

    return {
        id: appointmentRef.id,
        ...appointmentData,
        counsellingSessionId: sessionId || appointmentData.counsellingSessionId || null
    }
}

export async function getDoctorsForAssignment() {
    const staffRef = collection(db, 'staffData')
    const q = query(staffRef, where('role', '==', 'doctor'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
    }))
}

export async function getStudentAppointmentsByUser(userId) {
    if (!userId) return []

    const appointmentsRef = collection(db, 'appointments')
    const q = query(
        appointmentsRef,
        where('createdBy', '==', userId)
    )

    const snapshot = await getDocs(q)

    const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
    }))

    // sort client-side by createdAt desc to avoid requiring a composite index
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    return items
}

export async function createCounsellingChatSession({ appointmentId, studentUid, studentName, counselorUid = '', counselorName = '', appointmentType = 'mental_buddy', role = '' }) {
    if (!appointmentId || !studentUid) return null

    const flowConfig = getCounsellingFlowConfig(appointmentType)
    const existing = await getCounsellingChatSessionForAppointment(appointmentId, {
        studentUid,
        counsellingSessionId: null
    })
    if (existing?.id) {
        return existing.id
    }

    const sessionDoc = await addDoc(collection(db, 'counsellingSessions'), {
        appointmentId,
        appointmentType,
        role: role || flowConfig?.staffRole || 'mentalHealthCounselor',
        studentUid,
        studentName: studentName || 'Student',
        counselorUid: counselorUid || '',
        counselorName: counselorName || '',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        closedAt: null,
        closedBy: ''
    })

    return sessionDoc.id
}

export async function getCounsellingChatSessionForAppointment(appointmentId, options = {}) {
    const { studentUid, counsellingSessionId } = options

    if (counsellingSessionId) {
        const sessionSnap = await getDoc(doc(db, 'counsellingSessions', counsellingSessionId))
        if (sessionSnap.exists()) {
            return { id: sessionSnap.id, ...sessionSnap.data() }
        }
    }

    if (!appointmentId) return null

    if (studentUid) {
        const studentScopedQuery = query(
            collection(db, 'counsellingSessions'),
            where('appointmentId', '==', appointmentId),
            where('studentUid', '==', studentUid)
        )
        const studentSnapshot = await getDocs(studentScopedQuery)
        if (!studentSnapshot.empty) {
            const sessionDoc = studentSnapshot.docs[0]
            return { id: sessionDoc.id, ...sessionDoc.data() }
        }
        return null
    }

    const staffQuery = query(
        collection(db, 'counsellingSessions'),
        where('appointmentId', '==', appointmentId),
        orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(staffQuery)
    if (snapshot.empty) return null

    return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
    }
}

export async function sendCounsellingMessage({ sessionId, senderType, senderId, senderName, message }) {
    const trimmedMessage = (message || '').trim()
    if (!sessionId || !trimmedMessage) return null

    const sessionSnap = await getDoc(doc(db, 'counsellingSessions', sessionId))
    const sessionData = sessionSnap.exists() ? sessionSnap.data() : {}
    const sessionStudentUid = sessionData.studentUid || ''
    const storedSenderName = resolveCounsellingMessageSenderName({
        anonymousChat: !!sessionData.anonymousChat,
        senderType,
        senderName,
        senderId,
        studentUid: sessionStudentUid
    })

    const payload = {
        sessionId,
        senderType,
        senderId: senderId || '',
        senderName: storedSenderName,
        studentUid: sessionStudentUid,
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
        read: false,
        readAt: null
    }

    const msgRef = await addDoc(collection(db, 'counsellingMessages'), payload)

    await updateDoc(doc(db, 'counsellingSessions', sessionId), {
        status: 'active',
        updatedAt: new Date().toISOString()
    })

    return { id: msgRef.id, ...payload }
}

export async function getCounsellingMessages(sessionId) {
    if (!sessionId) return []

    const q = query(
        collection(db, 'counsellingMessages'),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

export async function acceptCounsellingSession({
    appointmentId,
    sessionId,
    counselorUid,
    counselorName,
    counselorRole,
    studentUid,
    appointmentType = 'mental_buddy'
}) {
    if (!appointmentId || !sessionId || !counselorUid) return null

    await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'accepted',
        acceptedBy: counselorUid,
        acceptedByName: counselorName || 'Counselor',
        assignedCounselorRole: counselorRole || '',
        updatedAt: new Date().toISOString()
    })

    await updateDoc(doc(db, 'counsellingSessions', sessionId), {
        status: 'active',
        counselorUid,
        counselorName: counselorName || 'Counselor',
        updatedAt: new Date().toISOString()
    })

    if (studentUid) {
        const sessionLabel = appointmentType === 'hiv_counselling' ? 'HIV counselling' : 'mental buddy'
        await notifyRecipients({
            userIds: [studentUid],
            title: 'Counsellor accepted your session',
            message: `${counselorName || 'A counsellor'} has accepted your ${sessionLabel} request and is ready to talk.`,
            type: 'counselling_accepted',
            relatedId: sessionId
        })
    }

    return true
}

export async function declineCounsellingRequest({
    appointmentId,
    sessionId,
    studentUid,
    counselorName,
    appointmentType = 'mental_buddy'
}) {
    if (!appointmentId) return null

    await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
    })

    if (sessionId) {
        await updateDoc(doc(db, 'counsellingSessions', sessionId), {
            status: 'closed',
            closedAt: new Date().toISOString(),
            closedBy: counselorName || 'Counselor',
            updatedAt: new Date().toISOString()
        })
    }

    if (studentUid) {
        const sessionLabel = appointmentType === 'hiv_counselling' ? 'HIV counselling' : 'mental buddy'
        await notifyRecipients({
            userIds: [studentUid],
            title: 'Counselling request declined',
            message: `Your ${sessionLabel} request could not be taken at this time. Please try again or visit the clinic in person if you need urgent support.`,
            type: 'counselling_closed',
            relatedId: sessionId || appointmentId
        })
    }

    return true
}

export async function closeCounsellingSession(sessionId, userId) {
    if (!sessionId) return null

    const sessionDoc = await getDoc(doc(db, 'counsellingSessions', sessionId))
    if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data()
        const otherUserId = sessionData.studentUid === userId ? (sessionData.counselorUid || '') : (sessionData.studentUid || '')

        if (otherUserId) {
            await notifyRecipients({
                userIds: [otherUserId],
                title: 'Counselling conversation ended',
                message: 'The other party has closed this conversation. You can still view the history, but the session is now complete.',
                type: 'counselling_closed',
                relatedId: sessionId
            })
        }
    }

    await updateDoc(doc(db, 'counsellingSessions', sessionId), {
        status: 'closed',
        closedAt: new Date().toISOString(),
        closedBy: userId || '',
        updatedAt: new Date().toISOString()
    })

    return true
}
