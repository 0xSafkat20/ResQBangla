export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'LOCKED';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
export type OrganizationType = 'NGO' | 'FIRE_SERVICE' | 'RED_CRESCENT' | 'GOVERNMENT' | 'MILITARY' | 'VOLUNTEER' | 'OTHER';
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'WARNING';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  verification_status: VerificationStatus;
  last_login_at: string | null;
  locked_until: string | null;
  failed_login_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface Division {
  id: string;
  code: string;
  name_en: string;
  name_bn: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface District {
  id: string;
  code: string;
  name_en: string;
  name_bn: string | null;
  division_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  division?: Division | null;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  reference_number: string | null;
  district_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  district?: District | null;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system_role: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  district_id: string | null;
  organization_id: string | null;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  role?: Role | null;
  district?: District | null;
  organization?: Organization | null;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_type: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  district_id: string | null;
  organization_id: string | null;
  result: AuditResult;
  reason: string | null;
  correlation_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  district?: District | null;
  organization?: Organization | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: UserStatus;
  roles: UserRole[];
  permissions: string[];
  createdAt: string;
}
