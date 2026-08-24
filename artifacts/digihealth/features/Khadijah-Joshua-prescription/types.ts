/**
 * @module Prescription Features
 * @file types.ts
 * @developer Khadijah & Joshua
 * @role Senior Diagnostics & Pharmacy Integration / Senior Security & Core Lead Specialist
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

export interface Prescription {
  id: number;
  patientId: number;
  consultationId: number;
  medication: string;
  dosage: string;
  instructions: string;
  dispensed?: boolean;
  createdAt?: string;
}

export interface PrescriptionFormFields {
  medication: string;
  dosage: string;
  instructions: string;
}
