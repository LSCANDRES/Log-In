import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <h2 style="margin-bottom: 24px;">👤 Mi Perfil</h2>

    <div *ngIf="isLoading" class="text-center mt-3">
      <mat-spinner diameter="48" style="margin: 0 auto;"></mat-spinner>
    </div>

    <mat-card *ngIf="!isLoading && profile" class="profile-card">
      <mat-card-content>
        <div class="profile-header">
          <div class="avatar">
            <mat-icon *ngIf="!profile.avatarUrl" class="avatar-icon">account_circle</mat-icon>
            <img *ngIf="profile.avatarUrl" [src]="profile.avatarUrl" alt="Avatar" class="avatar-img">
          </div>
          <div class="profile-info">
            <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
            <p class="email">{{ profile.email }}</p>
            <span class="role-badge" [class.admin]="profile.role === 'ADMIN'" [class.user]="profile.role === 'USER'">
              {{ profile.role }}
            </span>
          </div>
        </div>

        <div class="profile-details mt-3">
          <div class="detail-item">
            <mat-icon>email</mat-icon>
            <div>
              <label>Email</label>
              <p>{{ profile.email }}</p>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>verified</mat-icon>
            <div>
              <label>Email Verified</label>
              <p>
                <mat-icon *ngIf="profile.isEmailVerified" style="color: #4CAF50; font-size: 18px;">check_circle</mat-icon>
                <mat-icon *ngIf="!profile.isEmailVerified" style="color: #f44336; font-size: 18px;">cancel</mat-icon>
                {{ profile.isEmailVerified ? 'Verified' : 'Not verified' }}
              </p>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>login</mat-icon>
            <div>
              <label>Provider</label>
              <p>{{ profile.provider || 'LOCAL' }}</p>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>schedule</mat-icon>
            <div>
              <label>Last Login</label>
              <p>{{ profile.lastLoginAt ? (profile.lastLoginAt | date:'medium') : 'Never' }}</p>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>calendar_today</mat-icon>
            <div>
              <label>Member Since</label>
              <p>{{ profile.createdAt | date:'mediumDate' }}</p>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .profile-card {
      border-radius: 12px;
      padding: 24px;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #eee;
    }
    .avatar-icon {
      font-size: 80px;
      height: 80px;
      width: 80px;
      color: #bbb;
    }
    .avatar-img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }
    .profile-info h3 {
      font-size: 24px;
      margin-bottom: 4px;
    }
    .profile-info .email {
      color: #666;
      margin-bottom: 8px;
    }
    .profile-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .detail-item mat-icon {
      color: #667eea;
      margin-top: 2px;
    }
    .detail-item label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-item p {
      margin: 2px 0 0;
      color: #333;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `],
})
export class ProfileComponent implements OnInit {
  profile: User | null = null;
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profile = user;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
