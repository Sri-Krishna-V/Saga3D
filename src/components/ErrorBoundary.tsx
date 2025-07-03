import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
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
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'var(--saga-surface-primary)',
          color: 'var(--saga-text-primary)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '32px',
            backgroundColor: 'var(--saga-surface-secondary)',
            borderRadius: 'var(--saga-radius-lg)',
            border: '1px solid var(--saga-border)'
          }}>
            <h1 style={{ 
              color: 'var(--saga-error-500)', 
              marginBottom: '24px',
              fontSize: '24px'
            }}>
              🚨 Saga3D Error
            </h1>
            
            <p style={{ 
              marginBottom: '24px',
              color: 'var(--saga-text-secondary)',
              lineHeight: '1.6'
            }}>
              Something went wrong while rendering the application. 
              Your work is safe - try reloading the page.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--saga-accent-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--saga-radius-md)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--saga-surface-tertiary)',
                  color: 'var(--saga-text-primary)',
                  border: '1px solid var(--saga-border)',
                  borderRadius: 'var(--saga-radius-md)',
                  cursor: 'pointer'
                }}
              >
                🔄 Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: 'var(--saga-surface-primary)',
                padding: '16px',
                borderRadius: 'var(--saga-radius-sm)',
                border: '1px solid var(--saga-border)',
                marginTop: '24px'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  marginBottom: '16px',
                  fontWeight: '500',
                  color: 'var(--saga-warning-500)'
                }}>
                  🔧 Error Details (Development Mode)
                </summary>
                
                <div style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: 'var(--saga-text-secondary)',
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
