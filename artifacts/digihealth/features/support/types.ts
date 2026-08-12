export interface Message {
  id: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender?: { name: string };
}

export interface Session {
  id: number;
  studentId: number;
  topic: string;
  status: "open" | "completed";
  notes?: string;
  appointmentDate?: string;
  createdAt?: string;
  student?: { name: string };
}

export interface SessionDetailParams {
  sessionId: string;
  studentName: string;
  topic: string;
  status: string;
  /** The API path prefix, e.g. "/api/hiv-support" or "/api/mental-health" */
  apiPrefix: string;
}
