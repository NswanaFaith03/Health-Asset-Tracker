/**
 * @module Counseling Support Features
 * @file SessionService.ts
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { customFetch } from "@workspace/api-client-react";
import type { Message } from "./types";

/**
 * Service class for clinical support sessions (HIV and Mental Health).
 *
 * Satisfies SRP: owns all API calls for session management.
 * Satisfies DIP: screens/hooks depend on this class, not on customFetch directly.
 * Satisfies LSP: any future session type (e.g. NutritionService) can extend this pattern.
 */
export class SessionService {
  constructor(private readonly apiPrefix: string) {}

  async fetchMessages(sessionId: number): Promise<Message[]> {
    return customFetch<Message[]>(`${this.apiPrefix}/sessions/${sessionId}/messages`);
  }

  async sendMessage(sessionId: number, content: string): Promise<Message> {
    return customFetch<Message>(`${this.apiPrefix}/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  }

  async saveNotes(sessionId: number, notes: string, appointmentDate?: string): Promise<void> {
    await customFetch(`${this.apiPrefix}/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: notes.trim() || undefined,
        appointmentDate: appointmentDate?.trim() || undefined,
      }),
    });
  }

  async complete(sessionId: number): Promise<void> {
    await customFetch(`${this.apiPrefix}/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
  }
}
