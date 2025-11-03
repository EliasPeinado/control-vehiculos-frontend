import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, RefreshTokenRequest } from '@core/models/auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);
  private readonly baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}/auth`;

  private readonly accessTokenSignal = signal<string | null>(this.getStoredAccessToken());
  private readonly refreshTokenSignal = signal<string | null>(this.getStoredRefreshToken());

  public readonly isAuthenticated = computed(() => !!this.accessTokenSignal());
  public readonly accessToken = computed(() => this.accessTokenSignal());

  private getStoredAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        this.setTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  public refresh(refreshToken: string): Observable<LoginResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, request).pipe(
      tap((response: LoginResponse) => {
        this.setTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  public logout(): void {
    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }

  public getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
  }
}
