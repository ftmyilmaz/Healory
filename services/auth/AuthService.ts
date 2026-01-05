/**
 * Authentication Service
 * Centralized authentication management
 * Follows Single Responsibility Principle
 */

import { logger } from '../logging/Logger';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;

  // Mock credentials - Replace with real API in production
  private readonly ADMIN_CREDENTIALS = {
    email: 'admin@medico.com',
    password: 'admin123',
  };

  private constructor() {
    logger.info('AUTH', 'AuthService initialized');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Admin login with validation and logging
   */
  async loginAdmin(credentials: AuthCredentials): Promise<AuthResponse> {
    logger.info('AUTH', 'Admin login attempt', { email: credentials.email });

    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        logger.warn('AUTH', 'Login failed: Missing credentials');
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      // Validate email format
      if (!this.isValidEmail(credentials.email)) {
        logger.warn('AUTH', 'Login failed: Invalid email format', { email: credentials.email });
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Check credentials
      if (
        credentials.email === this.ADMIN_CREDENTIALS.email &&
        credentials.password === this.ADMIN_CREDENTIALS.password
      ) {
        const user: AuthUser = {
          id: 'admin-001',
          email: credentials.email,
          role: UserRole.ADMIN,
          name: 'Admin User',
        };

        this.currentUser = user;
        logger.success('AUTH', 'Admin login successful', { userId: user.id, email: user.email });

        return {
          success: true,
          user,
        };
      } else {
        logger.warn('AUTH', 'Login failed: Invalid credentials', { email: credentials.email });
        return {
          success: false,
          error: 'Invalid admin credentials',
        };
      }
    } catch (error) {
      logger.error('AUTH', 'Login error', error);
      return {
        success: false,
        error: 'An error occurred during login',
      };
    }
  }

  /**
   * User login
   */
  async loginUser(credentials: AuthCredentials): Promise<AuthResponse> {
    logger.info('AUTH', 'User login attempt', { email: credentials.email });

    try {
      // TODO: Implement real user authentication
      // This is a mock implementation
      
      if (!credentials.email || !credentials.password) {
        logger.warn('AUTH', 'Login failed: Missing credentials');
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      if (!this.isValidEmail(credentials.email)) {
        logger.warn('AUTH', 'Login failed: Invalid email format');
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Mock successful login
      const user: AuthUser = {
        id: 'user-001',
        email: credentials.email,
        role: UserRole.USER,
        name: 'Test User',
      };

      this.currentUser = user;
      logger.success('AUTH', 'User login successful', { userId: user.id });

      return {
        success: true,
        user,
      };
    } catch (error) {
      logger.error('AUTH', 'Login error', error);
      return {
        success: false,
        error: 'An error occurred during login',
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    logger.info('AUTH', 'Logout initiated', { userId: this.currentUser?.id });
    
    try {
      this.currentUser = null;
      logger.success('AUTH', 'Logout successful');
    } catch (error) {
      logger.error('AUTH', 'Logout error', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = AuthService.getInstance();
