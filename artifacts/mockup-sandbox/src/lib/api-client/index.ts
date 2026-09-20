/**
 * API client that matches the Expo app's implementation
 * Uses the same API client format for form submission compatibility
 */
export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";

import { setBaseUrl } from "./custom-fetch";
import { getApiBaseUrl } from "../api-base-url";

// Configure with production API URL to match Expo app
setBaseUrl(getApiBaseUrl());
