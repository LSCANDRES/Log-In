import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { User, PaginatedResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 style="margin-bottom: 24px;">👥 User Management</h2>

    <mat-card>
      <div *ngIf="isLoading" class="text-center mt-3">
        <mat-spinner diameter="48" style="margin: 0 auto;"></mat-spinner>
      </div>

      <table *ngIf="!isLoading" mat-table [dataSource]="users" style="width: 100%;">
        <ng-container matColumnDef="avatar">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let user">
            <mat-icon *ngIf="!user.avatarUrl" style="color: #999;">account_circle</mat-icon>
            <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" alt="Avatar"
                 style="width: 32px; height: 32px; border-radius: 50%;">
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let user">{{ user.email }}</td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let user">
            <span class="role-badge" [class.admin]="user.role === 'ADMIN'" [class.user]="user.role === 'USER'">
              {{ user.role }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="provider">
          <th mat-header-cell *matHeaderCellDef>Provider</th>
          <td mat-cell *matCellDef="let user">
            <mat-icon *ngIf="user.provider === 'GOOGLE'" style="color: #4285f4; font-size: 18px;">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                   alt="Google" style="width: 16px;">
            </mat-icon>
            <mat-icon *ngIf="user.provider === 'LOCAL'" style="color: #666; font-size: 18px;">email</mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let user">
            <mat-icon *ngIf="user.isActive" style="color: #4CAF50;">check_circle</mat-icon>
            <mat-icon *ngIf="!user.isActive" style="color: #f44336;">cancel</mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="lastLogin">
          <th mat-header-cell *matHeaderCellDef>Last Login</th>
          <td mat-cell *matCellDef="let user">
            {{ user.lastLoginAt ? (user.lastLoginAt | date:'short') : 'Never' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <button mat-icon-button (click)="toggleRole(user)" matTooltip="Toggle Role">
              <mat-icon>swap_horiz</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleActive(user)" matTooltip="Toggle Active">
              <mat-icon>{{ user.isActive ? 'block' : 'check' }}</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card>
  `,
  styles: [`
    table { width: 100%; }
    .mat-mdc-row:hover { background: #f5f5f5; }
    td, th { padding: 8px 16px !important; }
  `],
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  displayedColumns = ['avatar', 'name', 'email', 'role', 'provider', 'status', 'lastLogin', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<PaginatedResponse<User>>(`${environment.apiUrl}/users`).subscribe({
      next: (response) => {
        this.users = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.http.patch(`${environment.apiUrl}/users/${user.id}/role?role=${newRole}`, {}).subscribe({
      next: () => {
        this.snackBar.open(`Role changed to ${newRole}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: () => {
        this.snackBar.open('Failed to change role', 'Close', { duration: 3000 });
      },
    });
  }

  toggleActive(user: User): void {
    this.http.patch(`${environment.apiUrl}/users/${user.id}/toggle-active`, {}).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.isActive ? 'deactivated' : 'activated'}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: () => {
        this.snackBar.open('Failed to toggle status', 'Close', { duration: 3000 });
      },
    });
  }
}
