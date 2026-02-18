import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { LoginHistoryItem, PaginatedResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 style="margin-bottom: 24px;">📋 Login History / Logs</h2>

    <mat-card>
      <div *ngIf="isLoading" class="text-center mt-3">
        <mat-spinner diameter="48" style="margin: 0 auto;"></mat-spinner>
      </div>

      <table *ngIf="!isLoading" mat-table [dataSource]="logs" style="width: 100%;">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let log">{{ log.createdAt | date:'medium' }}</td>
        </ng-container>

        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef>User</th>
          <td mat-cell *matCellDef="let log">
            {{ log.user?.email || 'Unknown' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let log">
            <span class="action-chip" [ngClass]="getActionClass(log.action)">
              <mat-icon style="font-size: 14px; height: 14px; width: 14px; vertical-align: middle;">
                {{ getActionIcon(log.action) }}
              </mat-icon>
              {{ log.action }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="provider">
          <th mat-header-cell *matHeaderCellDef>Provider</th>
          <td mat-cell *matCellDef="let log">{{ log.provider || '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="ip">
          <th mat-header-cell *matHeaderCellDef>IP</th>
          <td mat-cell *matCellDef="let log">{{ log.ip || '-' }}</td>
        </ng-container>

        <ng-container matColumnDef="details">
          <th mat-header-cell *matHeaderCellDef>Details</th>
          <td mat-cell *matCellDef="let log">{{ log.details || '-' }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <div *ngIf="!isLoading && logs.length === 0" class="text-center mt-3" style="padding: 40px; color: #999;">
        <mat-icon style="font-size: 48px; height: 48px; width: 48px;">history</mat-icon>
        <p>No login history yet</p>
      </div>
    </mat-card>
  `,
  styles: [`
    table { width: 100%; }
    .mat-mdc-row:hover { background: #f5f5f5; }
    .action-chip {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .action-success { background: #e8f5e9; color: #2e7d32; }
    .action-failed { background: #ffebee; color: #c62828; }
    .action-logout { background: #fff3e0; color: #e65100; }
    .action-register { background: #e3f2fd; color: #1565c0; }
    .action-other { background: #f5f5f5; color: #666; }
  `],
})
export class LogsComponent implements OnInit {
  logs: LoginHistoryItem[] = [];
  isLoading = true;
  displayedColumns = ['date', 'user', 'action', 'provider', 'ip', 'details'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<PaginatedResponse<LoginHistoryItem>>(`${environment.apiUrl}/users/login-history`).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getActionClass(action: string): string {
    if (action.includes('SUCCESS')) return 'action-success';
    if (action.includes('FAILED')) return 'action-failed';
    if (action.includes('LOGOUT')) return 'action-logout';
    if (action.includes('REGISTER')) return 'action-register';
    return 'action-other';
  }

  getActionIcon(action: string): string {
    if (action.includes('SUCCESS')) return 'check_circle';
    if (action.includes('FAILED')) return 'cancel';
    if (action.includes('LOGOUT')) return 'logout';
    if (action.includes('REGISTER')) return 'person_add';
    return 'info';
  }
}
