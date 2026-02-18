import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <div class="user-layout">
      <!-- USER NAVBAR - Simple: only Profile -->
      <mat-toolbar color="primary" class="user-navbar">
        <div class="navbar-brand">
          <mat-icon>person</mat-icon>
          <span>Auth Base</span>
          <span class="role-chip">USER</span>
        </div>

        <nav class="navbar-links">
          <a mat-button routerLink="/user/profile" routerLinkActive="active-link">
            <mat-icon>account_circle</mat-icon>
            Mi Perfil
          </a>
        </nav>

        <span class="spacer"></span>

        <div class="user-menu">
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div style="padding: 8px 16px; border-bottom: 1px solid #eee;">
              <strong>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</strong>
              <br>
              <small style="color: #666;">{{ authService.currentUser()?.email }}</small>
            </div>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Content -->
      <main class="user-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .user-layout {
      min-height: 100vh;
      background: #f0f2f5;
    }
    .user-navbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 18px;
    }
    .role-chip {
      background: rgba(255,255,255,0.2);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .navbar-links {
      display: flex;
      gap: 4px;
      margin-left: 24px;
    }
    .navbar-links a {
      color: rgba(255,255,255,0.85);
      font-size: 14px;
    }
    .navbar-links a.active-link {
      color: white;
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
    }
    .spacer { flex: 1; }
    .user-content {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
  `],
})
export class UserLayoutComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
