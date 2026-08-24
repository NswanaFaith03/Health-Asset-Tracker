/**
 * @module Lab Features
 * @file types.ts
 * @developer Khadijah
 * @role Senior Diagnostics & Pharmacy Integration Specialist
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

export interface LabRequest {
  id: number;
  patientId: number;
  consultationId: number;
  testType: string;
  status?: string;
  result?: string;
  createdAt?: string;
}

export interface LabRequestFormFields {
  testType: string;
}
