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
