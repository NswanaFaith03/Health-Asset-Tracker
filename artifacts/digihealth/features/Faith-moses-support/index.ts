/**
 * @module Counseling Support Features
 * @file index.ts
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/** Barrel export for the support session feature module (Sprint 5). */
export type { Message, Session, SessionDetailParams } from "./types";
export { SessionService } from "./SessionService";
export { useSessionDetail } from "./useSessionDetail";
export { ChatView } from "./components/ChatView";
export { NotesView } from "./components/NotesView";
export { CompleteModal } from "./components/CompleteModal";
