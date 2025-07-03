import React, { useState, useEffect, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = {
      padding: '16px 20px', // Use consistent spacing: var(--saga-space-md) var(--saga-space-lg)
      borderRadius: '8px', // Use: var(--saga-radius-md)
      marginBottom: '12px', // Use: var(--saga-space-sm)
      borderLeft: '4px solid',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Could use: var(--saga-shadow)
      animation: 'slideInRight 0.3s ease-out',
      position: 'relative' as const,
      cursor: 'pointer'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          background: '#f0fdf4',
          borderColor: '#22c55e',
          color: '#166534'
        };
      case 'error':
        return {
          ...baseStyles,
          background: '#fef2f2',
          borderColor: '#ef4444',
          color: '#dc2626'
        };
      case 'warning':
        return {
          ...baseStyles,
          background: '#fffbeb',
          borderColor: '#f59e0b',
          color: '#d97706'
        };
      case 'info':
        return {
          ...baseStyles,
          background: '#eff6ff',
          borderColor: '#3b82f6',
          color: '#2563eb'
        };
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  return (
    <div 
      style={getNotificationStyles(notification.type)}
      onClick={() => onRemove(notification.id)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '18px' }}>{getIcon(notification.type)}</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
            {notification.title}
          </h4>
          {notification.message && (
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {notification.message}
            </p>
          )}
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            opacity: 0.6
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove
}) => {
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px', // Use: var(--saga-space-lg)
      right: '20px', // Use: var(--saga-space-lg)
      zIndex: 2000,
      minWidth: '320px',
      maxWidth: '480px'
    }}>
      <style>
        {`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};
