export const ROLE_DEFINITIONS = Object.freeze({
    student: {
        key: 'student',
        label: 'Student',
        route: '/student',
        description: 'Access consultations, prescriptions, lab results, and health support services.'
    },
    doctor: {
        key: 'doctor',
        label: 'Doctor',
        route: '/doctor',
        description: 'Review consultations, diagnose patients, issue prescriptions, and manage queues.'
    },
    pharmacist: {
        key: 'pharmacist',
        label: 'Pharmacist',
        route: '/pharmacist',
        description: 'Dispense prescriptions and track fulfillment status.'
    },
    labTechnician: {
        key: 'labTechnician',
        label: 'Lab Technician',
        route: '/lab-technician',
        description: 'Process lab workflow and publish diagnostic results.'
    },
    nurse: {
        key: 'nurse',
        label: 'Nurse',
        route: '/nurse',
        description: 'Support intake, queue coordination, and patient consultation creation.'
    },
    mentalHealthCounselor: {
        key: 'mentalHealthCounselor',
        label: 'Mental Health Counselor',
        route: '/mental-health-counselor',
        description: 'Manage counseling sessions and patient communication.'
    },
    hivProfessional: {
        key: 'hivProfessional',
        label: 'HIV Professional',
        route: '/hiv-professional',
        description: 'Coordinate HIV support sessions and educational resources.'
    },
    receptionist: {
        key: 'receptionist',
        label: 'Receptionist',
        route: '/receptionist',
        description: 'Manage front-desk intake, appointments, billing, and queue support.'
    },
    admin: {
        key: 'admin',
        label: 'Admin',
        route: '/admin',
        description: 'Monitor all system activity, analytics, and account administration.'
    }
})

export const ROLE_ORDER = Object.keys(ROLE_DEFINITIONS)

export function getRoleMeta(role) {
    return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.student
}

export function getRoleRoute(role) {
    return getRoleMeta(role).route
}
