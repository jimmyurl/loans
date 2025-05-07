import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Alert = () => {
  const { alerts, removeAlert } = useAlerts();

  if (alerts.length === 0) return null;

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />;
    }
  };

  const getAlertColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-md border p-4 ${getAlertColors(alert.type)} shadow-md transition-all duration-300 ease-in-out`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${getTextColor(alert.type)}`}>
                {alert.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => removeAlert(alert.id)}
                  className={`inline-flex rounded-md p-1.5 ${getTextColor(alert.type)} opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alert;