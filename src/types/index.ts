export type MemberRole = 'Social Worker' | 'Sahayak' | 'Adhyaksh';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Member {
  id: string;
  membership_id: string;
  name: string;
  father_name: string;
  mobile: string;
  address: string;
  district: string;
  state: string;
  photo_url: string;
  role: MemberRole;
  status: MemberStatus;
  rejection_reason?: string | null;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export interface PublicVerifiedMember {
  membership_id: string;
  name: string;
  role: MemberRole;
  district: string;
  state: string;
  photo_url: string;
  status: MemberStatus;
  created_at: string;
  approved_at?: string | null;
  validity?: string;
}

export interface OrganizationSettings {
  org_name: string;
  org_name_hindi: string;
  tagline: string;
  logo_url: string;
  contact_number: string;
  email: string;
  address: string;
  whatsapp_group_link: string;
  authorized_person_name: string;
  authorized_person_designation: string;
  signature_url: string;
  org_qr_url: string;
  registration_year: number;
  id_card_validity_years: number;
  updated_at: string;
}

export interface HomepageSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  order_num: number;
  display_order?: number;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN';
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active_slides?: number;
  total_posts?: number;
  published_posts?: number;
  draft_posts?: number;
  roleStats: {
    socialWorker: number;
    sahayak: number;
    adhyaksh: number;
  };
  recent: Member[];
}

export interface Post {
  id: string;
  title: string;
  title_color: string;
  content: string;
  image_url: string;
  category: string;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export interface HistorySection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  short_intro: string;
  full_content: string;
  image_url: string;
  order_num: number;
  is_published: boolean;
  updated_at: string;
}
