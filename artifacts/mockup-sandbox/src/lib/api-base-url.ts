/**
 * Get the API base URL based on platform and environment
 * Web-compatible version for mockup-sandbox
 * Following the Expo Android app's backend connection
 */
export function getApiBaseUrl(): string {
  // Use local backend for development
  return "http://localhost:5000";
}