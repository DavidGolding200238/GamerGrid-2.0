// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  profile_image?: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Attempting registration for:', data.username);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Registration response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('Registration error:', error);
      throw new Error(error.error || 'Registration failed');
    }

    const result = await response.json();
    console.log('Registration successful:', result);
    
    // Store token and user info
    this.storeAuth(result.accessToken, result.user);
    
    return result;
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('Attempting login for:', data.username);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('Login error:', error);
      throw new Error(error.error || 'Login failed');
    }

    const result = await response.json();
    console.log('Login successful:', result);
    
    // Store token and user info
    this.storeAuth(result.accessToken, result.user);
    
    return result;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless
      this.clearAuth();
    }
  }

  // Get user profile
  async getProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Session expired');
      }
      throw new Error('Failed to fetch profile');
    }

    const result = await response.json();
    return result.user;
  }

  // Store authentication data
  private storeAuth(token: string, user: User): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear authentication data
  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Get stored user
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
}

export const authService = new AuthService();
