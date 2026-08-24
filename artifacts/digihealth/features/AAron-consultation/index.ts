/**
 * @module Consultation Features
 * @file index.ts
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/** Barrel export for the consultation feature module (Sprint 3). */
export type { SeverityKey, ConsultationStatus, ConsultationFormFields } from "./types";
export { SEVERITIES, BODY_SYSTEMS, DURATIONS, ONSET, YES_NO, STATUS_COLORS, SEVERITY_COLORS } from "./constants";
export { useConsultationForm } from "./useConsultationForm";
export { SeverityPicker } from "./components/SeverityPicker";
export { AttachmentPicker } from "./components/AttachmentPicker";
