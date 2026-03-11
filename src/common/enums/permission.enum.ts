export enum Permission {
  // Products
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_READ = 'products:read',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',

  // Users
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Roles & Permissions management
  ROLES_MANAGE = 'roles:manage',
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: Object.values(Permission),
  admin: [
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_UPDATE,
    Permission.PRODUCTS_DELETE,
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
  ],
  moderator: [
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_UPDATE,
    Permission.USERS_READ,
  ],
  user: [Permission.PRODUCTS_READ],
};
