//API Error Response
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
}

// Main Response Type
export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

// Auth Data
export interface AuthData {
  admin: AdminUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Admin User
export interface AdminUser {
  id: string; // UUID
  email: string; // Email format
  fullName: string; // String
  role: "SUPER_ADMIN"; // Literal/Enum
}
