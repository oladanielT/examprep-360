// Auth Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  examType?: string;
  examCategory?: string;
  selectedSubjects?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetVerifyPayload {
  email: string;
  otp: string;
}

export interface PasswordResetPayload {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface PhoneOtpRequest {
  phone: string;
}

export interface PhoneVerifyRequest {
  phone: string;
  otp: string;
}

// Auth Response Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  country?: string;
  dateOfBirth?: string;
  academicLevel?: string;
  examType?: string;
  examCategory?: string;
  selectedSubjects?: string[];
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: Pick<User, "id" | "email" | "fullName">;
}

export interface VerifyEmailResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PasswordResetVerifyResponse {
  resetToken: string;
}

export interface Session {
  id: string;
  tokenId: string;
  deviceInfo?: string;
  ipAddress?: string;
  lastUsed: string;
  createdAt: string;
}
