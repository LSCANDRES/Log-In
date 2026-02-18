import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: #667eea;">person_add</mat-icon>
        </div>
        <h1>Create Account</h1>
        <p class="subtitle">Sign up for a new account</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div style="display: flex; gap: 12px;">
            <mat-form-field appearance="outline" style="flex: 1;">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="John">
              <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" style="flex: 1;">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Doe">
              <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="your@email.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Min 8 characters</mat-error>
            <mat-hint>Must contain uppercase, lowercase, and number/special char</mat-hint>
          </mat-form-field>

          <button mat-raised-button color="primary" class="auth-button" type="submit"
                  [disabled]="registerForm.invalid || authService.isLoading()">
            <mat-spinner *ngIf="authService.isLoading()" diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            {{ authService.isLoading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-link">
          <p>Already have an account? <a routerLink="/auth/login">Sign In</a></p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.snackBar.open(
          'Account created! Check your email to verify. 📧',
          'Close',
          { duration: 5000, panelClass: ['success-snackbar'] },
        );
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        const message = err.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
