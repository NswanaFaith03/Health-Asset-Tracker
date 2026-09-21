/**
 * Get the API base URL based on platform and environment
 * Web-compatible version for mockup-sandbox
 * Following the Expo Android app's backend connection
 */
export function getApiBaseUrl(): string {
  // Use production backend
  return "https://api-server-five-beryl.vercel.app";
}