import React from 'react';
import Icon from './Icons.jsx';

export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type || 'success'}`}>
          <span className="toast__icon">
            <Icon name={toast.type === 'error' ? 'info' : toast.type === 'undo' ? 'refresh' : 'check'} size={17} />
          </span>
          <p>{toast.message}</p>
          {toast.action ? (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.action.onClick();
                onDismiss(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
          <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="关闭提示">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
