import type {
  AuthResponse,
  LoginRequest,
  PublicUser,
  RegisterRequest,
} from '@picflow/shared';
import { apiClient, setAuthToken, unwrap } from './client';

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<{ data: AuthResponse }>(
    '/auth/register',
    payload,
  );
  const out = unwrap(res.data);
  setAuthToken(out.accessToken);
  return out;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<{ data: AuthResponse }>(
    '/auth/login',
    payload,
  );
  const out = unwrap(res.data);
  setAuthToken(out.accessToken);
  return out;
}

export function logout(): void {
  setAuthToken(null);
}

export async function getCurrentUser(): Promise<PublicUser> {
  const res = await apiClient.get<{ data: PublicUser }>('/users/me');
  return unwrap(res.data);
}
