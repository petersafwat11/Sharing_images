import axios, { AxiosError, type AxiosInstance } from 'axios';
import { config } from '@/lib/config';

const AUTH_STORAGE_KEY = 'picflow:token';

/**
 * Token management — intentionally tiny. Reads from localStorage on the
 * client; returns null on the server. Auth routes (login/register) set
 * the token via `setAuthToken` after a successful response.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Shape of a NestJS error response (see apps/api HttpExceptionFilter).
 */
export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly messages: string[];

  constructor(payload: ApiErrorPayload) {
    const msgs = Array.isArray(payload.message)
      ? payload.message
      : [payload.message];
    super(msgs[0] ?? 'Request failed');
    this.status = payload.statusCode;
    this.code = payload.error ?? 'Error';
    this.messages = msgs;
    this.name = 'ApiError';
  }
}

function buildClient(): AxiosInstance {
  // In the browser, use a relative baseURL (/api) so requests go to the
  // Next.js origin and are proxied server-side — no CORS preflight ever.
  // On the server (SSR), use the full API URL for direct calls.
  const baseURL =
    typeof window === 'undefined'
      ? `${config.apiUrl}${config.apiPrefix}`
      : config.apiPrefix;

  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    withCredentials: false,
  });

  instance.interceptors.request.use((req) => {
    const token = getAuthToken();
    if (token) {
      req.headers.set('Authorization', `Bearer ${token}`);
    }
    return req;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err: AxiosError<ApiErrorPayload>) => {
      if (err.response?.data) {
        return Promise.reject(new ApiError(err.response.data));
      }
      return Promise.reject(
        new ApiError({
          statusCode: err.response?.status ?? 0,
          message: err.message || 'Network error',
          error: err.code ?? 'NetworkError',
        }),
      );
    },
  );

  return instance;
}

/**
 * Singleton axios instance. Every request goes through this — never
 * call `axios.get(...)` directly from a component or service.
 */
export const apiClient = buildClient();

/**
 * NestJS wraps every successful response in `{ data, meta? }`. This
 * helper unwraps that envelope so callers work with the payload directly.
 */
export function unwrap<T>(body: { data: T }): T {
  return body.data;
}
