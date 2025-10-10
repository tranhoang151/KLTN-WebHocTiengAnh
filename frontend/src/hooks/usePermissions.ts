import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { roleService } from '../services/roleService';
import { UserRole, Permission } from '../types';

/**
 * Hook for checking user permissions and role-based access
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const permissions = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        role: null,
        hasRouteAccess: () => false,
        hasPermission: () => false,
        getAllowedRoutes: () => [],
        getAllPermissions: () => [],
        getDashboardPath: () => '/',
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
        isParent: false,
        canManageClasses: false,
        canViewStudentProgress: false,
        getRoleDisplayName: () => '',
        getRoleColor: () => 'gray',
      };
    }

    const userRole = user.role as UserRole;

    return {
      role: userRole,

      /**
       * Check if user has access to a specific route
       */
      hasRouteAccess: (route: string): boolean => {
        return roleService.hasRouteAccess(userRole, route);
      },

      /**
       * Check if user has permission to perform an action on a resource
       */
      hasPermission: (resource: string, action: string): boolean => {
        return roleService.hasPermission(userRole, resource, action);
      },

      /**
       * Get all allowed routes for the user
       */
      getAllowedRoutes: (): string[] => {
        return roleService.getAllowedRoutes(userRole);
      },

      /**
       * Get all permissions for the user
       */
      getAllPermissions: (): Permission[] => {
        return roleService.getAllPermissions(userRole);
      },

      /**
       * Get the dashboard path for the user's role
       */
      getDashboardPath: (): string => {
        return roleService.getDashboardPath(userRole);
      },

      /**
       * Check if user is admin
       */
      isAdmin: roleService.isAdmin(userRole),

      /**
       * Check if user is teacher
       */
      isTeacher: roleService.isTeacher(userRole),

      /**
       * Check if user is student
       */
      isStudent: roleService.isStudent(userRole),

      /**
       * Check if user is parent
       */
      isParent: roleService.isParent(userRole),

      /**
       * Check if user can manage classes
       */
      canManageClasses: roleService.canManageClasses(userRole),

      /**
       * Check if user can manage courses
       */
      canManageCourses: roleService.canManageCourses(userRole),

      /**
       * Check if user can manage content (questions, exercises, etc.)
       */
      canManageContent: roleService.canManageContent(userRole),

      /**
       * Check if user can view student progress
       */
      canViewStudentProgress: roleService.canViewStudentProgress(userRole),

      /**
       * Get role display name
       */
      getRoleDisplayName: (): string => {
        return roleService.getRoleDisplayName(userRole);
      },

      /**
       * Get role color for UI
       */
      getRoleColor: (): string => {
        return roleService.getRoleColor(userRole);
      },
    };
  }, [user, isAuthenticated]);

  return permissions;
};

/**
 * Hook for checking specific permission
 */
export const useHasPermission = (resource: string, action: string): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission(resource, action);
};

/**
 * Hook for checking route access
 */
export const useHasRouteAccess = (route: string): boolean => {
  const { hasRouteAccess } = usePermissions();
  return hasRouteAccess(route);
};

/**
 * Hook for getting user role information
 */
export const useUserRole = () => {
  const { user } = useAuth();
  const {
    role,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    getRoleDisplayName,
    getRoleColor,
  } = usePermissions();

  return {
    role,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    displayName: getRoleDisplayName(),
    color: getRoleColor(),
    user,
  };
};
