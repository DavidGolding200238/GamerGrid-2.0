import { API_BASE, imgSrc } from '../config/api';

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
    
    const response = await fetch(`${API_BASE}/auth/register`, {
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

    const normalizedUser: User = {
      ...result.user,
      profile_image: imgSrc(result.user.profile_image) ?? undefined,
    };
    
    // Store token and user info
    this.storeAuth(result.accessToken, normalizedUser);
    
    return { ...result, user: normalizedUser };
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('Attempting login for:', data.username);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
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

    const normalizedUser: User = {
      ...result.user,
      profile_image: imgSrc(result.user.profile_image) ?? undefined,
    };
    
    // Store token and user info
    this.storeAuth(result.accessToken, normalizedUser);
    
    return { ...result, user: normalizedUser };
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
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

    const response = await fetch(`${API_BASE}/auth/profile`, {
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
    return {
      ...result.user,
      profile_image: imgSrc(result.user.profile_image) ?? undefined,
    };
  }

  // Store authentication data
  private storeAuth(token: string, user: User): void {
    const normalizedUser: User = {
      ...user,
      profile_image: imgSrc(user.profile_image) ?? undefined,
    };
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    this.notifyAuthChange();
  }

  // Clear authentication data
  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.notifyAuthChange();
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

  private notifyAuthChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  }
}

export const authService = new AuthService();
