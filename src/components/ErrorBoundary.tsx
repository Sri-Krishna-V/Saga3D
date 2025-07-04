import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

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
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1 className="error-boundary-title">
              🚨 Saga3D Error
            </h1>
            
            <p className="error-boundary-message">
              Something went wrong while rendering the application. 
              Your work is safe - try reloading the page.
            </p>

            <div className="error-boundary-actions">
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="btn btn-secondary"
              >
                🔄 Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary className="error-boundary-summary">
                  🔧 Error Details (Development Mode)
                </summary>
                
                <div className="error-boundary-stack">
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
