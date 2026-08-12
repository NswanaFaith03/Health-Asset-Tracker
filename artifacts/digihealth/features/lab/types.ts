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
