import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card text-center">
        <ng-container *ngIf="isLoading">
          <mat-spinner diameter="48" style="margin: 0 auto;"></mat-spinner>
          <h2 class="mt-2">Verifying your email...</h2>
        </ng-container>

        <ng-container *ngIf="!isLoading && isSuccess">
          <mat-icon style="font-size: 64px; height: 64px; width: 64px; color: #4CAF50;">check_circle</mat-icon>
          <h2 class="mt-2">Email Verified! ✅</h2>
          <p class="subtitle">Your email has been successfully verified. You can now log in.</p>
          <button mat-raised-button color="primary" routerLink="/auth/login" class="mt-2">
            Go to Login
          </button>
        </ng-container>

        <ng-container *ngIf="!isLoading && !isSuccess">
          <mat-icon style="font-size: 64px; height: 64px; width: 64px; color: #f44336;">error</mat-icon>
          <h2 class="mt-2">Verification Failed ❌</h2>
          <p class="subtitle">{{ errorMessage }}</p>
          <button mat-raised-button color="primary" routerLink="/auth/login" class="mt-2">
            Back to Login
          </button>
        </ng-container>
      </div>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = 'Invalid or expired verification link.';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'No verification token provided.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = err.error?.message || 'Verification failed. The link may have expired.';
      },
    });
  }
}
