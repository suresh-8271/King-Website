import {
  Member,
  PublicVerifiedMember,
  OrganizationSettings,
  HomepageSlide,
  HistorySection,
  Post,
  AdminUser,
  AdminStats,
  MemberRole,
  MemberStatus,
} from '../types';

const ADMIN_TOKEN_KEY = 'pem_admin_token';
const MEMBER_TOKEN_KEY = 'pem_member_token';

// Admin Token Helpers
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function logoutAdmin(): void {
  removeAdminToken();
}

// Member Token Helpers
export function getMemberToken(): string | null {
  return localStorage.getItem(MEMBER_TOKEN_KEY);
}

export function setMemberToken(token: string): void {
  localStorage.setItem(MEMBER_TOKEN_KEY, token);
}

export function removeMemberToken(): void {
  localStorage.removeItem(MEMBER_TOKEN_KEY);
}

export function logoutMember(): void {
  removeMemberToken();
}

// Public API
export async function getSettings(): Promise<OrganizationSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function getSlides(): Promise<HomepageSlide[]> {
  const res = await fetch('/api/slides');
  if (!res.ok) throw new Error('Failed to fetch slides');
  return res.json();
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }
  return data.url;
}

export interface RegistrationPayload {
  name: string;
  father_name: string;
  mobile: string;
  address: string;
  district: string;
  state: string;
  photo_url: string;
  role: MemberRole;
}

export async function registerMember(payload: RegistrationPayload): Promise<{
  membershipId: string;
  member: Member;
}> {
  const res = await fetch('/api/members/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export async function loginMember(mobile: string, membershipId: string): Promise<{
  token: string;
  member: Member;
}> {
  const res = await fetch('/api/members/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, membershipId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid mobile number or membership ID.');
  }
  setMemberToken(data.token);
  return data;
}

export async function getMemberMe(): Promise<{
  member: Member;
  settings: OrganizationSettings;
}> {
  const token = getMemberToken();
  if (!token) throw new Error('No member session found');

  const res = await fetch('/api/member/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    removeMemberToken();
    throw new Error('Session expired. Please log in again.');
  }
  return res.json();
}

export async function verifyMember(membershipId: string): Promise<{
  success: boolean;
  org_name: string;
  org_name_hindi: string;
  member: PublicVerifiedMember;
}> {
  const cleanId = membershipId.trim().toUpperCase();
  const res = await fetch(`/api/verify/${encodeURIComponent(cleanId)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid Membership ID. No verified member found.');
  }
  return data;
}

// Admin API
export async function getAdminStatus(): Promise<{ hasAdmin: boolean }> {
  const res = await fetch('/api/admin/status');
  if (!res.ok) throw new Error('Failed to get admin status');
  return res.json();
}

export async function setupFirstAdmin(payload: {
  username: string;
  password: string;
  name: string;
  email: string;
}): Promise<{ token: string; admin: AdminUser }> {
  const res = await fetch('/api/admin/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to setup admin account');
  }
  setAdminToken(data.token);
  return data;
}

export async function loginAdmin(username: string, password: string): Promise<{
  token: string;
  admin: AdminUser;
}> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid username or password');
  }
  setAdminToken(data.token);
  return data;
}

function getAdminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/dashboard-stats', {
    headers: getAdminAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error('Failed to fetch admin stats');
  }
  return res.json();
}

export async function getAdminMembers(params: {
  search?: string;
  status?: string;
  role?: string;
  district?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<{
  members: Member[];
  total: number;
  totalPages: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  districts?: string[];
}> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.role && params.role !== 'ALL') query.set('role', params.role);
  if (params.district && params.district !== 'ALL') query.set('district', params.district);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`/api/admin/members?${query.toString()}`, {
    headers: getAdminAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error('Failed to fetch members list');
  }
  const data = await res.json();
  return {
    members: data.members || [],
    total: data.pagination?.totalCount ?? data.total ?? 0,
    totalPages: data.pagination?.totalPages ?? data.totalPages ?? 1,
    pagination: data.pagination,
    districts: data.districts,
  };
}

export async function approveMember(id: string): Promise<Member> {
  const res = await fetch(`/api/admin/members/${id}/approve`, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to approve member');
  return data.member;
}

export async function rejectMember(id: string, reason?: string): Promise<Member> {
  const res = await fetch(`/api/admin/members/${id}/reject`, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify({ reason: reason || 'Details incomplete or unverified' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reject member');
  return data.member;
}

export async function updateMemberStatus(
  id: string,
  status: MemberStatus,
  reason?: string
): Promise<Member> {
  if (status === 'APPROVED') {
    return approveMember(id);
  } else if (status === 'REJECTED') {
    return rejectMember(id, reason);
  } else {
    return updateMember(id, { status: 'PENDING' });
  }
}

export async function updateMember(id: string, payload: Partial<Member>): Promise<Member> {
  const res = await fetch(`/api/admin/members/${id}`, {
    method: 'PUT',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update member');
  return data.member;
}

export async function updateMemberDetails(id: string, payload: Partial<Member>): Promise<Member> {
  return updateMember(id, payload);
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`/api/admin/members/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete member');
}

export async function getAdminSettings(): Promise<OrganizationSettings> {
  const res = await fetch('/api/admin/settings', {
    headers: getAdminAuthHeaders(),
  });
  if (!res.ok) {
    return getSettings();
  }
  const data = await res.json();
  return data.settings || data;
}

export async function updateAdminSettings(settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data.settings;
}

export async function getAdminSlides(): Promise<HomepageSlide[]> {
  const res = await fetch('/api/admin/slides', {
    headers: getAdminAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch slides');
  return res.json();
}

export async function createSlide(slide: Partial<HomepageSlide>): Promise<HomepageSlide> {
  const res = await fetch('/api/admin/slides', {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      image_url: slide.image_url || '',
      order_num: slide.display_order || 1,
      is_active: slide.is_active ?? true,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create slide');
  return data.slide;
}

export async function updateSlide(id: string, updates: Partial<HomepageSlide>): Promise<HomepageSlide> {
  const res = await fetch(`/api/admin/slides/${id}`, {
    method: 'PUT',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update slide');
  return data.slide;
}

export async function deleteSlide(id: string): Promise<void> {
  const res = await fetch(`/api/admin/slides/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete slide');
}

export async function resetToDefaultSlides(): Promise<HomepageSlide[]> {
  const res = await fetch('/api/admin/slides/reset-defaults', {
    method: 'POST',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset slides');
  return data.slides;
}

// History & Inspiration Sections API
export async function getHistorySections(): Promise<HistorySection[]> {
  const res = await fetch('/api/history');
  if (!res.ok) throw new Error('Failed to fetch history sections');
  return res.json();
}

export async function getHistorySectionBySlug(slug: string): Promise<HistorySection> {
  const res = await fetch(`/api/history/${slug}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch history section');
  return data;
}

export async function getAdminHistorySections(): Promise<HistorySection[]> {
  const res = await fetch('/api/admin/history', {
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch admin history sections');
  return data;
}

export async function updateAdminHistorySection(id: string, updates: Partial<HistorySection>): Promise<HistorySection> {
  const res = await fetch(`/api/admin/history/${id}`, {
    method: 'PUT',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update history section');
  return data.section;
}

export async function resetAdminHistorySections(): Promise<HistorySection[]> {
  const res = await fetch('/api/admin/history/reset', {
    method: 'POST',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset history sections');
  return data.sections;
}

// ==========================================
// POSTS & CONTENT MANAGEMENT API
// ==========================================

export async function getPublicPosts(params?: { category?: string; limit?: number }): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'सभी' && params.category !== 'All') {
    query.set('category', params.category);
  }
  if (params?.limit) {
    query.set('limit', params.limit.toString());
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`/api/posts${queryString}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getPublicPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch post');
  return data;
}

export async function getAdminPosts(params?: { category?: string; status?: string }): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'सभी' && params.category !== 'All') {
    query.set('category', params.category);
  }
  if (params?.status && params.status !== 'ALL') {
    query.set('status', params.status);
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`/api/admin/posts${queryString}`, {
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to fetch admin posts');
  }
  return data.posts || [];
}

export async function getAdminPost(id: string): Promise<Post> {
  const res = await fetch(`/api/admin/posts/${id}`, {
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to fetch admin post');
  }
  return data.post;
}

export async function createAdminPost(postData: Partial<Post>): Promise<Post> {
  const res = await fetch('/api/admin/posts', {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(postData),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to create post');
  }
  return data.post;
}

export async function updateAdminPost(id: string, updates: Partial<Post>): Promise<Post> {
  const res = await fetch(`/api/admin/posts/${id}`, {
    method: 'PUT',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to update post');
  }
  return data.post;
}

export async function toggleAdminPostStatus(id: string, status: 'published' | 'draft'): Promise<Post> {
  const res = await fetch(`/api/admin/posts/${id}/status`, {
    method: 'PATCH',
    headers: getAdminAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to update post status');
  }
  return data.post;
}

export async function deleteAdminPost(id: string): Promise<void> {
  const res = await fetch(`/api/admin/posts/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to delete post');
  }
}

export async function resetAdminPosts(): Promise<Post[]> {
  const res = await fetch('/api/admin/posts/reset', {
    method: 'POST',
    headers: getAdminAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) removeAdminToken();
    throw new Error(data.error || 'Failed to reset posts');
  }
  return data.posts || [];
}
