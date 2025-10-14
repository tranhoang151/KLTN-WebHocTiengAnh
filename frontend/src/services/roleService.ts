import { UserRole, RolePermissions, Permission } from '../types';

/**
 * Role-based access control service
 * Manages user permissions and route access based on roles
 */
export class RoleService {
  private static rolePermissions: RolePermissions[] = [
    {
      role: 'student',
      dashboardPath: '/student',
      allowedRoutes: [
        '/student',
        '/student/flashcards',
        '/student/exercises',
        '/student/tests',
        '/student/videos',
        '/student/progress',
        '/student/badges',
        '/student/profile',
        '/profile',
        '/logout',
      ],
      permissions: [
        { resource: 'flashcards', actions: ['read', 'learn'] },
        { resource: 'exercises', actions: ['read', 'submit'] },
        { resource: 'tests', actions: ['read', 'submit'] },
        { resource: 'videos', actions: ['read', 'watch'] },
        { resource: 'progress', actions: ['read'] },
        { resource: 'badges', actions: ['read'] },
        { resource: 'profile', actions: ['read', 'update'] },
      ],
    },
    {
      role: 'teacher',
      dashboardPath: '/teacher',
      allowedRoutes: [
        '/teacher',
        '/teacher/classes',
        '/teacher/students',
        '/teacher/assignments',
        '/teacher/progress',
        '/teacher/reports',
        '/teacher/content',
        '/teacher/profile',
        '/profile',
        '/logout',
      ],
      permissions: [
        { resource: 'classes', actions: ['read', 'update'] },
        { resource: 'students', actions: ['read'] },
        {
          resource: 'assignments',
          actions: ['read', 'create', 'update', 'delete'],
        },
        { resource: 'progress', actions: ['read'] },
        { resource: 'reports', actions: ['read', 'export'] },
        { resource: 'content', actions: ['read', 'assign'] },
        { resource: 'flashcards', actions: ['read', 'assign'] },
        { resource: 'exercises', actions: ['read', 'create', 'update', 'delete', 'assign'] },
        { resource: 'tests', actions: ['read', 'assign'] },
        { resource: 'videos', actions: ['read', 'assign'] },
        { resource: 'profile', actions: ['read', 'update'] },
      ],
    },
    {
      role: 'admin',
      dashboardPath: '/admin',
      allowedRoutes: [
        '/admin',
        '/admin/users',
        '/admin/courses',
        '/admin/classes',
        '/admin/content',
        '/admin/flashcards',
        '/admin/exercises',
        '/admin/tests',
        '/admin/videos',
        '/admin/questions',
        '/admin/reports',
        '/admin/system',
        '/admin/profile',
        '/profile',
        '/logout',
      ],
      permissions: [
        { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
        {
          resource: 'courses',
          actions: ['read', 'create', 'update', 'delete'],
        },
        {
          resource: 'classes',
          actions: ['read', 'create', 'update', 'delete'],
        },
        {
          resource: 'content',
          actions: ['read', 'create', 'update', 'delete'],
        },
        {
          resource: 'flashcards',
          actions: ['read', 'create', 'update', 'delete'],
        },
        {
          resource: 'exercises',
          actions: ['read', 'create', 'update', 'delete'],
        },
        { resource: 'tests', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'videos', actions: ['read', 'create', 'update', 'delete'] },
        {
          resource: 'questions',
          actions: ['read', 'create', 'update', 'delete'],
        },
        { resource: 'reports', actions: ['read', 'export'] },
        { resource: 'system', actions: ['read', 'update'] },
        { resource: 'profile', actions: ['read', 'update'] },
      ],
    },
    {
      role: 'parent',
      dashboardPath: '/parent',
      allowedRoutes: [
        '/parent',
        '/parent/children',
        '/parent/progress',
        '/parent/reports',
        '/parent/profile',
        '/profile',
        '/logout',
      ],
      permissions: [
        { resource: 'children', actions: ['read'] },
        { resource: 'progress', actions: ['read'] },
        { resource: 'reports', actions: ['read'] },
        { resource: 'profile', actions: ['read', 'update'] },
      ],
    },
  ];

  /**
   * Get role permissions for a specific role
   */
  static getRolePermissions(role: UserRole): RolePermissions | null {
    return this.rolePermissions.find((rp) => rp.role === role) || null;
  }

  /**
   * Get dashboard path for a specific role
   */
  static getDashboardPath(role: UserRole): string {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions?.dashboardPath || '/';
  }

  /**
   * Check if a role has access to a specific route
   */
  static hasRouteAccess(role: UserRole, route: string): boolean {
    const rolePermissions = this.getRolePermissions(role);
    if (!rolePermissions) return false;

    // Check exact match first
    if (rolePermissions.allowedRoutes.includes(route)) {
      return true;
    }

    // Check if route starts with any allowed route (for nested routes)
    return rolePermissions.allowedRoutes.some(
      (allowedRoute) =>
        route.startsWith(allowedRoute) &&
        (route === allowedRoute || route.charAt(allowedRoute.length) === '/')
    );
  }

  /**
   * Check if a role has permission to perform an action on a resource
   */
  static hasPermission(
    role: UserRole,
    resource: string,
    action: string
  ): boolean {
    const rolePermissions = this.getRolePermissions(role);
    if (!rolePermissions) return false;

    const permission = rolePermissions.permissions.find(
      (p) => p.resource === resource
    );
    return permission ? permission.actions.includes(action) : false;
  }

  /**
   * Get all allowed routes for a role
   */
  static getAllowedRoutes(role: UserRole): string[] {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions?.allowedRoutes || [];
  }

  /**
   * Get all permissions for a role
   */
  static getAllPermissions(role: UserRole): Permission[] {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions?.permissions || [];
  }

  /**
   * Check if a role can access admin features
   */
  static isAdmin(role: UserRole): boolean {
    return role === 'admin';
  }

  /**
   * Check if a role can manage classes (teacher or admin)
   */
  static canManageClasses(role: UserRole): boolean {
    return role === 'teacher' || role === 'admin';
  }

  /**
   * Check if a role can manage courses (admin only)
   */
  static canManageCourses(role: UserRole): boolean {
    return role === 'admin';
  }

  /**
   * Check if a role can manage content (admin and teacher)
   */
  static canManageContent(role: UserRole): boolean {
    return role === 'admin' || role === 'teacher';
  }

  /**
   * Check if a role can view student progress (teacher, admin, or parent)
   */
  static canViewStudentProgress(role: UserRole): boolean {
    return role === 'teacher' || role === 'admin' || role === 'parent';
  }

  /**
   * Check if a role is a student
   */
  static isStudent(role: UserRole): boolean {
    return role === 'student';
  }

  /**
   * Check if a role is a teacher
   */
  static isTeacher(role: UserRole): boolean {
    return role === 'teacher';
  }

  /**
   * Check if a role is a parent
   */
  static isParent(role: UserRole): boolean {
    return role === 'parent';
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      student: 'Student',
      teacher: 'Teacher',
      admin: 'Administrator',
      parent: 'Parent',
    };
    return roleNames[role] || role;
  }

  /**
   * Get role color for UI display
   */
  static getRoleColor(role: UserRole): string {
    const roleColors = {
      student: 'blue',
      teacher: 'green',
      admin: 'red',
      parent: 'purple',
    };
    return roleColors[role] || 'gray';
  }
}

export const roleService = RoleService;
