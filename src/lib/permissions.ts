export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PROFILE_VIEW: 'profile.view',
  PROFILE_EDIT: 'profile.edit',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_ACTIVATE: 'users.activate',
  USERS_LOCK: 'users.lock',
  USERS_UNLOCK: 'users.unlock',
  USERS_ASSIGN_ROLE: 'users.assign_role',
  USERS_REMOVE_ROLE: 'users.remove_role',
  DISTRICTS_VIEW: 'districts.view',
  DISTRICTS_CREATE: 'districts.create',
  DISTRICTS_EDIT: 'districts.edit',
  DISTRICTS_DEACTIVATE: 'districts.deactivate',
  DISTRICTS_RESTORE: 'districts.restore',
  ORGANIZATIONS_VIEW: 'organizations.view',
  ORGANIZATIONS_CREATE: 'organizations.create',
  ORGANIZATIONS_EDIT: 'organizations.edit',
  ORGANIZATIONS_DEACTIVATE: 'organizations.deactivate',
  ORGANIZATIONS_RESTORE: 'organizations.restore',
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DEACTIVATE: 'roles.deactivate',
  ROLES_RESTORE: 'roles.restore',
  AUDIT_VIEW: 'audit.view',
  AUDIT_VIEW_DETAILS: 'audit.view_details',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS: Record<string, string[]> = {
  Dashboard: [PERMISSIONS.DASHBOARD_VIEW],
  Profile: [PERMISSIONS.PROFILE_VIEW, PERMISSIONS.PROFILE_EDIT],
  'User Management': [
    PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_SUSPEND, PERMISSIONS.USERS_ACTIVATE,
    PERMISSIONS.USERS_LOCK, PERMISSIONS.USERS_UNLOCK,
    PERMISSIONS.USERS_ASSIGN_ROLE, PERMISSIONS.USERS_REMOVE_ROLE,
  ],
  'District Management': [
    PERMISSIONS.DISTRICTS_VIEW, PERMISSIONS.DISTRICTS_CREATE,
    PERMISSIONS.DISTRICTS_EDIT, PERMISSIONS.DISTRICTS_DEACTIVATE, PERMISSIONS.DISTRICTS_RESTORE,
  ],
  'Organization Management': [
    PERMISSIONS.ORGANIZATIONS_VIEW, PERMISSIONS.ORGANIZATIONS_CREATE,
    PERMISSIONS.ORGANIZATIONS_EDIT, PERMISSIONS.ORGANIZATIONS_DEACTIVATE, PERMISSIONS.ORGANIZATIONS_RESTORE,
  ],
  'Role Management': [
    PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_EDIT, PERMISSIONS.ROLES_DEACTIVATE, PERMISSIONS.ROLES_RESTORE,
  ],
  'Audit Logs': [PERMISSIONS.AUDIT_VIEW, PERMISSIONS.AUDIT_VIEW_DETAILS],
};

export function hasPermission(userPermissions: string[], perm: string): boolean {
  return userPermissions.includes(perm);
}

export function hasAnyPermission(userPermissions: string[], perms: string[]): boolean {
  return perms.some((p) => userPermissions.includes(p));
}
