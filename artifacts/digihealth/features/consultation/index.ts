/** Barrel export for the consultation feature module (Sprint 3). */
export type { SeverityKey, ConsultationStatus, ConsultationFormFields } from "./types";
export { SEVERITIES, BODY_SYSTEMS, DURATIONS, ONSET, YES_NO, STATUS_COLORS, SEVERITY_COLORS } from "./constants";
export { useConsultationForm } from "./useConsultationForm";
export { SeverityPicker } from "./components/SeverityPicker";
export { AttachmentPicker } from "./components/AttachmentPicker";
