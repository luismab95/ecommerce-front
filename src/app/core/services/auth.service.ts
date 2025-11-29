import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserRole,
  GeneralResponse,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Signals
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Computed signals
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMINISTRADOR);

  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.loadFromStorage();
  }

  // Login
  login(request: LoginRequest): Observable<GeneralResponse<AuthResponse>> {
    return this.http
      .post<GeneralResponse<AuthResponse>>(`${this.apiUrl}/auth/sign-in`, request)
      .pipe(
        tap((response) => {
          this.currentUserSignal.set(response.data.user);
          this.tokenSignal.set(response.data.accessToken);
          this.saveToStorage(response.data.user, response.data.accessToken);
        })
      );
  }

  // Register
  register(request: RegisterRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/sign-up`, request);
  }

  // Logout
  logout(): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/sign-out`, {}).pipe(
      tap(() => {
        this.currentUserSignal.set(null);
        this.tokenSignal.set(null);
        this.removeLocalStorage();
        this.router.navigate(['/']);
      })
    );
  }

  // Remove Local Storage
  removeLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Forgot Password
  forgotPassword(request: ForgotPasswordRequest): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/forgot-password`, request);
  }

  // Reset Password
  resetPassword(token: string, request: ResetPasswordRequest): Observable<GeneralResponse<string>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/reset-password`, request, {
      headers,
    });
  }

  // Refresh Token
  refreshToken(): Observable<GeneralResponse<string>> {
    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/auth/refresh-token`, {}).pipe(
      tap((response) => {
        this.tokenSignal.set(response.data);
        this.saveToStorage(this.currentUserSignal()!, response.data);
      })
    );
  }

  private saveToStorage(user: User, token: string): void {
    this.removeLocalStorage();
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  private loadFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        this.tokenSignal.set(token);
      } catch (e) {
        console.error('Error loading user from storage', e);
      }
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
