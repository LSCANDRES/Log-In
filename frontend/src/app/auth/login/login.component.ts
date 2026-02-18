import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="text-center mb-3">
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: #667eea;">lock</mat-icon>
        </div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your account</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="your@email.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" class="auth-button" type="submit"
                  [disabled]="loginForm.invalid || authService.isLoading()">
            <mat-spinner *ngIf="authService.isLoading()" diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            {{ authService.isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="divider-text">
          <span>or continue with</span>
        </div>

        <button mat-stroked-button class="google-btn" (click)="loginWithGoogle()">
          <mat-icon>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                 alt="Google" style="width: 18px; height: 18px;">
          </mat-icon>
          Sign in with Google
        </button>

        <div class="auth-link">
          <p>Don't have an account? <a routerLink="/auth/register">Sign Up</a></p>
        </div>

        <!-- Quick test buttons -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #ddd;">
          <p style="text-align: center; color: #999; font-size: 12px; margin-bottom: 12px;">
            🧪 Quick Test Login
          </p>
          <div style="display: flex; gap: 8px;">
            <button mat-stroked-button color="warn" style="flex: 1;" (click)="quickLogin('admin')">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </button>
            <button mat-stroked-button color="accent" style="flex: 1;" (click)="quickLogin('user')">
              <mat-icon>person</mat-icon>
              User
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.snackBar.open('Login successful! 🎉', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.authService.navigateByRole();
      },
      error: (err) => {
        const message = err.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  loginWithGoogle(): void {
    // In a real app, you'd use Google Sign-In SDK
    this.snackBar.open('Google Sign-In: Configure GOOGLE_CLIENT_ID in environment', 'Close', {
      duration: 5000,
    });
  }

  quickLogin(role: 'admin' | 'user'): void {
    const credentials = role === 'admin'
      ? { email: 'admin@authbase.com', password: 'Admin123!' }
      : { email: 'user@authbase.com', password: 'User123!' };

    this.loginForm.patchValue(credentials);
    this.onSubmit();
  }
}
