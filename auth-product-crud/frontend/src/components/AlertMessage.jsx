import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const AlertMessage = ({ type = 'info', message, errors = [] }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />;
      case 'danger':
      case 'error':
        return <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />;
      default:
        return <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />;
    }
  };

  const alertClass = type === 'error' ? 'alert-danger' : `alert-${type}`;

  return (
    <div className={`alert ${alertClass}`}>
      {getIcon()}
      <div style={{ flex: 1 }}>
        {message && <div style={{ fontWeight: 600 }}>{message}</div>}
        {errors && errors.length > 0 && (
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>
                {typeof err === 'string' ? err : `${err.field ? `${err.field}: ` : ''}${err.message}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;
