import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // Public computed signals
  currentUser = this.currentUserSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  isAuthenticated = computed(() => !!this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  isUser = computed(() => this.currentUserSignal()?.role === 'USER');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage();
  }

  // ==================== REGISTER ====================
  register(data: RegisterRequest): Observable<any> {
    this.isLoadingSignal.set(true);
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap(() => this.isLoadingSignal.set(false)),
      catchError((err) => {
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      }),
    );
  }

  // ==================== LOGIN ====================
  login(data: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoadingSignal.set(false);
      }),
      catchError((err) => {
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      }),
    );
  }

  // ==================== GOOGLE AUTH ====================
  googleAuth(token: string): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { token }).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoadingSignal.set(false);
      }),
      catchError((err) => {
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      }),
    );
  }

  // ==================== VERIFY EMAIL ====================
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email`, { params: { token } });
  }

  // ==================== RESEND VERIFICATION ====================
  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  // ==================== REFRESH TOKEN ====================
  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      )
      .pipe(
        tap((tokens) => {
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }),
      );
  }

  // ==================== LOGOUT ====================
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => {
        this.clearSession();
      },
      error: () => {
        this.clearSession();
      },
    });
  }

  // ==================== GET PROFILE ====================
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => this.currentUserSignal.set(user)),
    );
  }

  // ==================== HELPERS ====================
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSignal.set(user);
      } catch {
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  // Navigate after login based on role
  navigateByRole(): void {
    const user = this.currentUserSignal();
    if (user?.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/user/profile']);
    }
  }

  // ==================== SIMULATE LOGIN (DEV/TESTING) ====================
  simulateLogin(role: 'ADMIN' | 'USER'): void {
    this.isLoadingSignal.set(true);

    const mockUsers: Record<string, User> = {
      ADMIN: {
        id: 'mock-admin-001',
        email: 'admin@authbase.com',
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
        provider: 'LOCAL',
        isEmailVerified: true,
        isActive: true,
        avatarUrl: undefined,
      },
      USER: {
        id: 'mock-user-001',
        email: 'user@authbase.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        provider: 'LOCAL',
        isEmailVerified: true,
        isActive: true,
        avatarUrl: undefined,
      },
    };

    const user = mockUsers[role];
    const mockResponse: AuthResponse = {
      user,
      accessToken: 'mock-access-token-' + role.toLowerCase(),
      refreshToken: 'mock-refresh-token-' + role.toLowerCase(),
    };

    // Simulate a small delay for UX
    setTimeout(() => {
      this.handleAuthSuccess(mockResponse);
      this.isLoadingSignal.set(false);
      this.navigateByRole();
    }, 500);
  }
}
