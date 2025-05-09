// src/components/StatsCard.jsx
import React from 'react';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const StatsCard = ({ title, value, type, icon }) => {
  // Determine card color based on type
  const getCardClass = () => {
    switch (type) {
      case 'primary':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'danger':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Determine icon color based on type
  const getIconClass = () => {
    switch (type) {
      case 'primary':
        return 'text-blue-500 bg-blue-100';
      case 'success':
        return 'text-green-500 bg-green-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'danger':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  // Determine value color based on type
  const getValueClass = () => {
    switch (type) {
      case 'primary':
        return 'text-blue-700';
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'danger':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  // Select icon component based on icon prop
  const getIconComponent = () => {
    switch (icon) {
      case 'cash':
        return <BanknotesIcon className="h-6 w-6" />;
      case 'chart':
        return <ChartBarIcon className="h-6 w-6" />;
      case 'users':
        return <UsersIcon className="h-6 w-6" />;
      case 'clock':
        return <ClockIcon className="h-6 w-6" />;
      default:
        return <ChartBarIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border shadow-sm ${getCardClass()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-semibold ${getValueClass()}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${getIconClass()}`}>
          {getIconComponent()}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;