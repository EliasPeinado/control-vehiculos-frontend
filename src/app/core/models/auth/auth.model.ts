export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  codigoRol?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserRole {
  codigo: string;
  nombre: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  roles: UserRole[];
}
