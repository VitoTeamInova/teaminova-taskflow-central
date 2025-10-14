import { supabase } from "@/integrations/supabase/client";

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'auth' | 'database' | 'api' | 'ui' | 'network' | 'validation' | 'unknown';

export interface ErrorLog {
  id?: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  user_id?: string;
  context?: Record<string, any>;
  resolved?: boolean;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private isProcessing = false;

  private constructor() {
    // Set up global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          severity: 'high',
          category: 'unknown',
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          severity: 'high',
          category: 'unknown',
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
        });
      });
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  async logError(error: Omit<ErrorLog, 'timestamp' | 'user_id'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const errorLog: ErrorLog = {
      ...error,
      timestamp: new Date().toISOString(),
      user_id: user?.id,
      resolved: false,
    };

    // Add to queue
    this.errorQueue.push(errorLog);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Logger]', errorLog);
    }

    // Process queue
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;

    while (this.errorQueue.length > 0) {
      const errorLog = this.errorQueue.shift();
      if (!errorLog) continue;

      try {
        // In a real implementation, you would save to a database table
        // For now, we'll just log to console
        console.error('[Error Log Processed]', errorLog);
        
        // You could uncomment this when you have an error_logs table:
        // await supabase.from('error_logs').insert({
        //   severity: errorLog.severity,
        //   category: errorLog.category,
        //   message: errorLog.message,
        //   stack: errorLog.stack,
        //   user_id: errorLog.user_id,
        //   context: errorLog.context,
        //   resolved: false,
        // });
      } catch (error) {
        console.error('Failed to process error log:', error);
        // Re-queue if failed (with a limit to prevent infinite loops)
        if (this.errorQueue.length < 50) {
          this.errorQueue.push(errorLog);
        }
      }
    }

    this.isProcessing = false;
  }

  // Helper methods for different error types
  logAuthError(message: string, context?: Record<string, any>): void {
    this.logError({
      severity: 'medium',
      category: 'auth',
      message,
      context,
    });
  }

  logDatabaseError(message: string, error?: Error, context?: Record<string, any>): void {
    this.logError({
      severity: 'high',
      category: 'database',
      message,
      stack: error?.stack,
      context,
    });
  }

  logApiError(message: string, error?: Error, context?: Record<string, any>): void {
    this.logError({
      severity: 'medium',
      category: 'api',
      message,
      stack: error?.stack,
      context,
    });
  }

  logValidationError(message: string, context?: Record<string, any>): void {
    this.logError({
      severity: 'low',
      category: 'validation',
      message,
      context,
    });
  }

  logUIError(message: string, error?: Error, context?: Record<string, any>): void {
    this.logError({
      severity: 'medium',
      category: 'ui',
      message,
      stack: error?.stack,
      context,
    });
  }

  logNetworkError(message: string, context?: Record<string, any>): void {
    this.logError({
      severity: 'medium',
      category: 'network',
      message,
      context,
    });
  }
}

export const errorLogger = ErrorLogger.getInstance();
