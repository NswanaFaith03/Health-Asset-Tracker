/**
 * API client wrapper that uses the shared @workspace/api-client-react package
 * and configures it with the production API URL
 */
export * from '@workspace/api-client-react';

import { setBaseUrl } from '@workspace/api-client-react';
import { getApiBaseUrl } from '../api-base-url';

// Configure the shared API client with production URL
setBaseUrl(getApiBaseUrl());
