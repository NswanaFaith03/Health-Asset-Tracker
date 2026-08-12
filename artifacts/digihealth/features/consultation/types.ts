export type SeverityKey = "low" | "medium" | "high" | "critical";
export type ConsultationStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "responded"
  | "closed";

export interface ConsultationFormFields {
  severity: SeverityKey;
  chiefComplaint: string;
  selectedSystems: string[];
  onset: string;
  duration: string;
  worsening: string;
  associatedSymptoms: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  attachments: string[];
}

export interface ConsultationSubmitPayload {
  symptoms: string;
  severity: SeverityKey;
  attachments: string[];
}
