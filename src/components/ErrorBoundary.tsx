import React, { Component, ErrorInfo, ReactNode } from 'react';
import { theme } from '../styles/theme';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Saga3D Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        extra: errorInfo
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      return (
        <div style={{
          padding: theme.spacing.xl,
          textAlign: 'center',
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`
          }}>
            <h1 style={{ 
              color: theme.colors.danger, 
              marginBottom: theme.spacing.md,
              fontSize: theme.fontSizes.xl
            }}>
              🚨 Saga3D Error
            </h1>
            
            <p style={{ 
              marginBottom: theme.spacing.md,
              color: theme.colors.textSecondary,
              lineHeight: '1.6'
            }}>
              Something went wrong while rendering the application. 
              Your work is safe - try reloading the page.
            </p>

            <div style={{
              display: 'flex',
              gap: theme.spacing.md,
              justifyContent: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer'
                }}
              >
                🔄 Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: theme.colors.background,
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`,
                marginTop: theme.spacing.md
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  marginBottom: theme.spacing.md,
                  fontWeight: '500',
                  color: theme.colors.warning
                }}>
                  🔧 Error Details (Development Mode)
                </summary>
                
                <div style={{
                  fontSize: theme.fontSizes.sm,
                  fontFamily: 'monospace',
                  color: theme.colors.textSecondary,
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      <br /><br />
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
