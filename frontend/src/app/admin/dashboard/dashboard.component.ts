import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { UserStats } from '../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 style="margin-bottom: 24px;">📊 Dashboard</h2>

    <div *ngIf="isLoading" class="text-center mt-3">
      <mat-spinner diameter="48" style="margin: 0 auto;"></mat-spinner>
    </div>

    <div *ngIf="!isLoading && stats" class="stats-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon" style="color: #2196F3;">people</mat-icon>
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon" style="color: #4CAF50;">check_circle</mat-icon>
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">Active Users</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon" style="color: #FF5722;">admin_panel_settings</mat-icon>
          <div class="stat-value">{{ stats.adminUsers }}</div>
          <div class="stat-label">Admins</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon" style="color: #9C27B0;">login</mat-icon>
          <div class="stat-value">{{ stats.todayLogins }}</div>
          <div class="stat-label">Today's Logins</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon" style="color: #00BCD4;">verified</mat-icon>
          <div class="stat-value">{{ stats.verifiedUsers }}</div>
          <div class="stat-label">Verified Users</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon class="stat-icon" style="color: #FF9800;">person</mat-icon>
          <div class="stat-value">{{ stats.regularUsers }}</div>
          <div class="stat-label">Regular Users</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .stat-card {
      text-align: center;
      padding: 20px;
      border-radius: 12px;
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .stat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      margin-bottom: 12px;
    }
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #333;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats: UserStats | null = null;
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<UserStats>(`${environment.apiUrl}/users/stats`).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: () => {
        // Fallback mock stats for simulated login
        this.stats = {
          totalUsers: 2,
          activeUsers: 2,
          adminUsers: 1,
          regularUsers: 1,
          verifiedUsers: 2,
          todayLogins: 1,
        };
        this.isLoading = false;
      },
    });
  }
}
