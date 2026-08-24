/**
 * @module Consultation Features
 * @file types.ts
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

export type SeverityKey = "low" | "medium" | "high" | "critical";
export type ConsultationStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "responded"
  | "closed"
  | "dismissed"
  | "resolved";

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
