/** Typed app route constants. Use these instead of inline string literals. */
export const Routes = {
  auth: {
    login: "/(Joshua-auth)/login" as const,
    register: "/(Joshua-auth)/register" as const,
    resetPassword: "/(Joshua-auth)/reset-password" as const,
  },
  student: {
    home: "/(Faith-student)/home" as const,
    notifications: "/(Faith-student)/notifications" as const,
    newConsultation: "/(Faith-student)/new-consultation" as const,
    consultations: "/(Faith-student)/consultations" as const,
    consultationDetail: "/(Faith-student)/consultation-detail" as const,
    prescriptions: "/(Faith-student)/prescriptions" as const,
    lab: "/(Faith-student)/lab" as const,
    labResult: "/(Faith-student)/lab-result" as const,
    queue: "/(Faith-student)/queue" as const,
    mentalBuddy: "/(Faith-student)/mental-buddy" as const,
    mentalBuddyChat: "/(Faith-student)/mental-buddy-chat" as const,
    hivAids: "/(Faith-student)/hiv-aids" as const,
    profile: "/(Faith-student)/profile" as const,
  },
  doctor: {
    consultations: "/(AAron-doctor)/consultations" as const,
    consultationDetail: "/(AAron-doctor)/consultation-detail" as const,
    prescriptions: "/(AAron-doctor)/prescriptions" as const,
    labRequests: "/(AAron-doctor)/lab-requests" as const,
    queue: "/(AAron-doctor)/queue" as const,
  },
  hivSupport: {
    sessions: "/(moses-hiv-support)/sessions" as const,
    sessionDetail: "/(moses-hiv-support)/session-detail" as const,
    resources: "/(moses-hiv-support)/resources" as const,
  },
  mentalHealth: {
    sessions: "/(Faith-moses-mental-health)/sessions" as const,
    sessionDetail: "/(Faith-moses-mental-health)/session-detail" as const,
  },
  admin: {
    users: "/(Joshua-admin)/users" as const,
    analytics: "/(Joshua-admin)/analytics" as const,
    audit: "/(Joshua-admin)/audit" as const,
    emergency: "/(Joshua-admin)/emergency" as const,
  },
  nurse: {
    queue: "/(AAron-nurse)/queue-management" as const,
    labRequests: "/(AAron-nurse)/lab-requests" as const,
  },
  pharmacist: {
    prescriptions: "/(Khadijah-Joshua-pharmacist)/prescriptions" as const,
    history: "/(Khadijah-Joshua-pharmacist)/history" as const,
  },
} as const;
