/**
 * Hospital and Healthcare Related Images - Hotlinked from high-quality sources
 * These images enhance the visual appeal and professionalism of the app
 */

export const HOSPITAL_IMAGES = {
  // Doctor & Consultation
  doctor_consultation: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
  doctor_meeting: "https://images.unsplash.com/photo-1631217314830-4ad988afac10?w=800&h=600&fit=crop",
  doctor_patient: "https://images.unsplash.com/photo-1587280591945-e086146b6339?w=800&h=600&fit=crop",
  
  // Lab & Testing
  lab_technician: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
  lab_samples: "https://images.unsplash.com/photo-1576091160394-112261f63a46?w=800&h=600&fit=crop",
  lab_microscope: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop",
  
  // Pharmacy & Medications
  pharmacy_pills: "https://images.unsplash.com/photo-1587854692152-cbe660dbde36?w=800&h=600&fit=crop",
  pharmacy_bottles: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
  medications: "https://images.unsplash.com/photo-1587854692152-cbe660dbde36?w=800&h=600&fit=crop",
  
  // Hospital & Nursing
  hospital_corridor: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
  nurse_station: "https://images.unsplash.com/photo-1576091160650-112c4dba209f?w=800&h=600&fit=crop",
  patient_care: "https://images.unsplash.com/photo-1576091160749-112c4dba209f?w=800&h=600&fit=crop",
  
  // Mental Health & Counseling
  counseling_session: "https://images.unsplash.com/photo-1597318911753-aaab30eb24cd?w=800&h=600&fit=crop",
  therapy_support: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a5?w=800&h=600&fit=crop",
  mental_health: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
  
  // Emergency & Urgent Care
  emergency_room: "https://images.unsplash.com/photo-1576091160595-112c4dba209f?w=800&h=600&fit=crop",
  first_aid: "https://images.unsplash.com/photo-1576091160399-1c5fa8059d4d?w=800&h=600&fit=crop",
  
  // General Healthcare
  healthcare_team: "https://images.unsplash.com/photo-1576091160642-112c4dba209f?w=800&h=600&fit=crop",
  medical_equipment: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
  wellness: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
};

// Organized by use case for easy reference
export const SCREEN_IMAGES = {
  // Doctor screens
  doctor: {
    consultations: HOSPITAL_IMAGES.doctor_consultation,
    queue: HOSPITAL_IMAGES.doctor_patient,
    labRequests: HOSPITAL_IMAGES.lab_samples,
    prescriptions: HOSPITAL_IMAGES.pharmacy_pills,
  },
  
  // Lab screens
  lab: {
    requests: HOSPITAL_IMAGES.lab_technician,
    results: HOSPITAL_IMAGES.lab_microscope,
  },
  
  // Pharmacy screens
  pharmacist: {
    prescriptions: HOSPITAL_IMAGES.pharmacy_pills,
    history: HOSPITAL_IMAGES.medications,
  },
  
  // Nurse screens
  nurse: {
    queue: HOSPITAL_IMAGES.nurse_station,
    labRequests: HOSPITAL_IMAGES.patient_care,
  },
  
  // Student screens
  student: {
    consultation: HOSPITAL_IMAGES.doctor_meeting,
    lab: HOSPITAL_IMAGES.lab_technician,
    mental: HOSPITAL_IMAGES.counseling_session,
    emergency: HOSPITAL_IMAGES.emergency_room,
  },
  
  // Support & Admin
  support: {
    hivAids: HOSPITAL_IMAGES.healthcare_team,
    mentalHealth: HOSPITAL_IMAGES.therapy_support,
    counseling: HOSPITAL_IMAGES.counseling_session,
  },
  
  // Admin
  admin: {
    analytics: HOSPITAL_IMAGES.hospital_corridor,
  },
};
