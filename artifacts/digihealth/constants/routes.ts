/** Typed app route constants. Use these instead of inline string literals. */
export const Routes = {
  auth: {
    login: "/(auth)/login" as const,
    register: "/(auth)/register" as const,
    resetPassword: "/(auth)/reset-password" as const,
  },
  student: {
    home: "/(student)/home" as const,
    notifications: "/(student)/notifications" as const,
    newConsultation: "/(student)/new-consultation" as const,
    consultations: "/(student)/consultations" as const,
    consultationDetail: "/(student)/consultation-detail" as const,
    prescriptions: "/(student)/prescriptions" as const,
    lab: "/(student)/lab" as const,
    labResult: "/(student)/lab-result" as const,
    queue: "/(student)/queue" as const,
    mentalBuddy: "/(student)/mental-buddy" as const,
    mentalBuddyChat: "/(student)/mental-buddy-chat" as const,
    hivAids: "/(student)/hiv-aids" as const,
    profile: "/(student)/profile" as const,
  },
  doctor: {
    consultations: "/(doctor)/consultations" as const,
    consultationDetail: "/(doctor)/consultation-detail" as const,
    prescriptions: "/(doctor)/prescriptions" as const,
    labRequests: "/(doctor)/lab-requests" as const,
    queue: "/(doctor)/queue" as const,
  },
  hivSupport: {
    sessions: "/(hiv-support)/sessions" as const,
    sessionDetail: "/(hiv-support)/session-detail" as const,
    resources: "/(hiv-support)/resources" as const,
  },
  mentalHealth: {
    sessions: "/(mental-health)/sessions" as const,
    sessionDetail: "/(mental-health)/session-detail" as const,
  },
  admin: {
    users: "/(admin)/users" as const,
    analytics: "/(admin)/analytics" as const,
    audit: "/(admin)/audit" as const,
    emergency: "/(admin)/emergency" as const,
  },
  nurse: {
    queue: "/(nurse)/queue-management" as const,
    labRequests: "/(nurse)/lab-requests" as const,
  },
  pharmacist: {
    prescriptions: "/(pharmacist)/prescriptions" as const,
    history: "/(pharmacist)/history" as const,
  },
} as const;
