/**
 * Get the API base URL based on platform and environment
 * Web-compatible version for mockup-sandbox
 */
export function getApiBaseUrl(): string {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // For now, always use the production backend
  // TODO: Add environment-based configuration for local development
  return "https://health-asset-tracker.vercel.app";
}