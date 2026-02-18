import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users-list/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./admin/logs/logs.component').then((m) => m.LogsComponent),
      },
    ],
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./user/user-layout/user-layout.component').then((m) => m.UserLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./user/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
