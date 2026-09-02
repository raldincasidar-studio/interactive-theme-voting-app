import type { Student, ThemeOption } from "../data/mockData";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
const TOKEN_KEY = "theme-voting-token";
const ADMIN_TOKEN_KEY = "theme-voting-admin-token";

async function request<T>(path: string, options: RequestInit = {}, admin = false): Promise<T> {
  const token = localStorage.getItem(admin ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed.");
  return body as T;
}

export interface LoginResult { success: boolean; student?: Student; message?: string; token?: string; }
export async function apiLogin(studentId: string, password: string): Promise<LoginResult> {
  try {
    const result = await request<{ token: string; student: Student }>("/api/auth/student/login", { method: "POST", body: JSON.stringify({ studentId, password }) });
    localStorage.setItem(TOKEN_KEY, result.token);
    return { success: true, ...result };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Unable to sign in." }; }
}
export async function apiFetchThemes(): Promise<ThemeOption[]> { return (await request<{ themes: ThemeOption[] }>("/api/themes")).themes; }
export interface VoteResult { success: boolean; themeId: string; message?: string; }
export async function apiSubmitVote(themeId: string): Promise<VoteResult> { return request<VoteResult>("/api/votes", { method: "POST", body: JSON.stringify({ themeId }) }); }
export function clearStudentToken() { localStorage.removeItem(TOKEN_KEY); }

export interface AdminThemePayload extends Omit<ThemeOption, "votes"> { votes?: number; }
export async function apiAdminLogin(username: string, password: string) { const result = await request<{token:string;admin:{username:string}}>("/api/auth/admin/login", {method:"POST",body:JSON.stringify({username,password})}, true); localStorage.setItem(ADMIN_TOKEN_KEY,result.token); return result; }
export async function apiAdminThemes() { return (await request<{themes:ThemeOption[]}>("/api/admin/themes",{},true)).themes; }
export async function apiCreateTheme(theme: AdminThemePayload) { return request<{theme:ThemeOption}>("/api/admin/themes",{method:"POST",body:JSON.stringify(theme)},true); }
export async function apiUpdateTheme(id:string,theme:Partial<AdminThemePayload>) { return request<{theme:ThemeOption}>(`/api/admin/themes/${id}`,{method:"PUT",body:JSON.stringify(theme)},true); }
export async function apiDeleteTheme(id:string) { return request<{success:boolean}>(`/api/admin/themes/${id}`,{method:"DELETE"},true); }
export async function apiAdminUsers(page = 1, limit = 10, search = '', program = '', yearLevel = '') {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (program) params.set('program', program);
  if (yearLevel) params.set('yearLevel', yearLevel);
  return request<{ users: Array<Student & { _id: string; votedThemeId?: string | null }>; total: number; page: number; limit: number; pages: number }>(`/api/admin/users?${params}`, {}, true);
}
export async function apiDeleteUser(id:string) { return request<{success:boolean}>(`/api/admin/users/${id}`,{method:"DELETE"},true); }
export async function apiChangeAdminPassword(currentPassword:string,newPassword:string) { return request<{success:boolean}>("/api/admin/settings/password",{method:"PUT",body:JSON.stringify({currentPassword,newPassword})},true); }
export async function apiResetVotes() { return request<{success:boolean}>("/api/admin/settings/reset-votes",{method:"POST"},true); }
export function adminTokenExists() { return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY)); }
export function clearAdminToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); }
