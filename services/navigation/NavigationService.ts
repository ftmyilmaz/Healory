/**
 * Navigation Service
 * Centralized navigation management with logging
 * Follows Single Responsibility and Interface Segregation Principles
 */

import { Router } from 'expo-router';
import { ROUTES } from '../../utils/constants/routes';
import { logger } from '../logging/Logger';

interface NavigationParams {
  [key: string]: any;
}

interface NavigationOptions {
  replace?: boolean;
  params?: NavigationParams;
}

class NavigationService {
  private static instance: NavigationService;
  private router: Router | null = null;
  private navigationHistory: string[] = [];
  private maxHistorySize = 50;

  private constructor() {
    logger.info('NAVIGATION', 'NavigationService initialized');
  }

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Initialize router instance
   * Must be called from a component that has access to router
   */
  setRouter(router: Router) {
    this.router = router;
    logger.success('NAVIGATION', 'Router instance set');
  }

  /**
   * Navigate to a route with logging
   */
  navigate(route: string, options?: NavigationOptions) {
    logger.info('NAVIGATION', '=== NAVIGATE CALLED ===');
    logger.info('NAVIGATION', `Target route: ${route}`);
    logger.info('NAVIGATION', `Options:`, options);
    logger.info('NAVIGATION', `Router exists: ${!!this.router}`);
    logger.info('NAVIGATION', `Router canGoBack: ${this.router?.canGoBack()}`);

    if (!this.router) {
      logger.error('NAVIGATION', 'Router not initialized', { route });
      throw new Error('Router not initialized. Call setRouter first.');
    }

    try {
      logger.info('NAVIGATION', `About to navigate to: ${route}`, options);
      logger.debug('NAVIGATION', 'Current navigation history:', this.navigationHistory);
      
      // Add to history
      this.addToHistory(route);
      logger.debug('NAVIGATION', 'Added to history');

      if (options?.replace) {
        logger.info('NAVIGATION', `CALLING router.replace(${route})`);
        this.router.replace(route as any);
        logger.debug('NAVIGATION', `router.replace called for: ${route}`);
      } else {
        logger.info('NAVIGATION', `CALLING router.push(${route})`);
        this.router.push(route as any);
        logger.debug('NAVIGATION', `router.push called for: ${route}`);
      }

      logger.success('NAVIGATION', `✓ Navigation command sent to: ${route}`);
      
      // Add a small delay to check if navigation actually happened
      setTimeout(() => {
        logger.info('NAVIGATION', `Post-navigation check for: ${route}`);
      }, 100);

    } catch (error) {
      logger.error('NAVIGATION', `❌ FAILED to navigate to: ${route}`, error);
      logger.error('NAVIGATION', 'Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        route,
        options
      });
      throw error;
    }
  }

  /**
   * Go back to previous screen
   */
  goBack() {
    if (!this.router) {
      logger.error('NAVIGATION', 'Router not initialized');
      throw new Error('Router not initialized');
    }

    try {
      logger.info('NAVIGATION', 'Going back');
      this.router.back();
      logger.success('NAVIGATION', 'Successfully went back');
    } catch (error) {
      logger.error('NAVIGATION', 'Failed to go back', error);
      throw error;
    }
  }

  /**
   * Navigate and reset stack
   */
  reset(route: string) {
    if (!this.router) {
      logger.error('NAVIGATION', 'Router not initialized');
      throw new Error('Router not initialized');
    }

    try {
      logger.info('NAVIGATION', `Resetting navigation to: ${route}`);
      this.router.replace(route as any);
      this.navigationHistory = [route];
      logger.success('NAVIGATION', `Successfully reset to: ${route}`);
    } catch (error) {
      logger.error('NAVIGATION', `Failed to reset to: ${route}`, error);
      throw error;
    }
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.router?.canGoBack() ?? false;
  }

  /**
   * Get navigation history
   */
  getHistory(): string[] {
    return [...this.navigationHistory];
  }

  /**
   * Clear navigation history
   */
  clearHistory() {
    this.navigationHistory = [];
    logger.info('NAVIGATION', 'Navigation history cleared');
  }

  private addToHistory(route: string) {
    this.navigationHistory.push(route);
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory = this.navigationHistory.slice(-this.maxHistorySize);
    }
  }
}

export const navigationService = NavigationService.getInstance();
export { ROUTES };
