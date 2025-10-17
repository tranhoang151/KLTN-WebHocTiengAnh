/**
 * Route-based lazy loading utilities
 */

import React, { Suspense } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Create a lazy-loaded route component
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  displayName: string
) {
  const LazyComponent = React.lazy(importFn);
  (LazyComponent as any).displayName = `Lazy(${displayName})`;

  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent {...(props as any)} ref={ref} />
    </Suspense>
  ));
}

// Commented out missing components - will be added when components are created
// export const ExerciseScreen = lazyRoute(
//   () => import('../components/learning/ExerciseScreen'),
//   'Exercise'
// );

// Student Dashboard Components
export const StudentDashboard = lazyRoute(
  () => import('../components/dashboards/StudentDashboard'),
  'StudentDashboard'
);

// Teacher Dashboard Components  
export const TeacherDashboard = lazyRoute(
  () => import('../components/dashboards/TeacherDashboard'),
  'TeacherDashboard'
);

// Admin Dashboard Components
export const AdminDashboard = lazyRoute(
  () => import('../components/dashboards/AdminDashboard'),
  'AdminDashboard'
);


// Profile Components
export const Profile = lazyRoute(
  () => import('../components/Profile'),
  'Profile'
);

/**
 * Preload routes based on user role
 */
export const preloadRoutesByRole = (userRole: string) => {
  const preloadPromises: Promise<any>[] = [];

  switch (userRole) {
    case 'student':
      preloadPromises.push(
        import('../components/dashboards/StudentDashboard')
      );
      break;
    case 'teacher':
      preloadPromises.push(
        import('../components/dashboards/TeacherDashboard')
      );
      break;
    case 'admin':
      preloadPromises.push(
        import('../components/dashboards/AdminDashboard')
      );
      break;
  }

  // Common routes
  preloadPromises.push(
    import('../components/Profile')
  );

  return Promise.allSettled(preloadPromises);
};

/**
 * Preload critical routes on app initialization
 */
export const preloadCriticalRoutes = () => {
  return Promise.allSettled([
    import('../components/dashboards/StudentDashboard'),
    import('../components/Profile')
  ]);
};

/**
 * Route preloader with intelligent caching
 */
export class RoutePreloader {
  private preloadedRoutes = new Set<string>();
  private userRole: string | null = null;

  setUserRole(role: string) {
    this.userRole = role;
    this.preloadUserRoutes();
  }

  private async preloadUserRoutes() {
    if (!this.userRole) return;

    const routeKey = `routes_${this.userRole}`;
    if (this.preloadedRoutes.has(routeKey)) return;

    try {
      await preloadRoutesByRole(this.userRole);
      this.preloadedRoutes.add(routeKey);
      console.log(`✅ Preloaded routes for ${this.userRole}`);
    } catch (error) {
      console.warn(`Failed to preload routes for ${this.userRole}:`, error);
    }
  }

  async preloadRoute(routeName: string, importFn: () => Promise<any>) {
    if (this.preloadedRoutes.has(routeName)) return;

    try {
      await importFn();
      this.preloadedRoutes.add(routeName);
      console.log(`✅ Preloaded route: ${routeName}`);
    } catch (error) {
      console.warn(`Failed to preload route ${routeName}:`, error);
    }
  }
}

export const routePreloader = new RoutePreloader();