/**
 * @module Counseling Support Features
 * @file types.ts
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

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
