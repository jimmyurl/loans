import React, { useState, useContext, useEffect } from 'react';
import { AlertContext } from '../context/AlertContext';
import Layout from '../components/Layout';

const Settings = () => {
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: '',
    email: '',
    phone: '',
    address: '',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'UTC'
  });
  
  const [loanSettings, setLoanSettings] = useState({
    defaultInterestRate: 15,
    defaultLoanTerm: 12,
    gracePeriod: 3,
    latePaymentFee: 5,
    allowMultipleLoans: false,
    requireCollateral: true
  });
  
  const [userSettings, setUserSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // const data = await api.getSettings();
        // setGeneralSettings(data.general);
        // setLoanSettings(data.loan);
        // setUserSettings(data.user);
        
        // Simulating API delay
        setTimeout(() => {
          setGeneralSettings({
            organizationName: 'MicroFinance Pro',
            email: 'info@microfinancepro.com',
            phone: '+1 (555) 123-4567',
            address: '123 Finance St, San Francisco, CA 94107',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'America/Los_Angeles'
          });
          
          setLoanSettings({
            defaultInterestRate: 15,
            defaultLoanTerm: 12,
            gracePeriod: 3,
            latePaymentFee: 5,
            allowMultipleLoans: false,
            requireCollateral: true
          });
          
          setUserSettings({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'Administrator',
            notificationsEnabled: true,
            emailNotifications: true,
            smsNotifications: false
          });
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Failed to load settings. Please try again later.'
        });
        setLoading(false);
      }
    };

    fetchSettings();
  }, [setAlert]);

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setAlert({
      type: 'success',
      message: 'General settings saved successfully!'
    });
  };

  const handleLoanSubmit = (e) => {
    e.preventDefault();
    setAlert({
      type: 'success',
      message: 'Loan settings saved successfully!'
    });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setAlert({
      type: 'success',
      message: 'User settings saved successfully!'
    });
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLoanChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoanSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'loan', label: 'Loan Settings' },
    { id: 'user', label: 'User Settings' },
    { id: 'users', label: 'User Management' },
    { id: 'backup', label: 'Backup & Restore' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="px-6 py-4 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <form onSubmit={handleGeneralSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={generalSettings.organizationName}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={generalSettings.email}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={generalSettings.phone}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={generalSettings.address}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={generalSettings.currency}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select
                        name="dateFormat"
                        value={generalSettings.dateFormat}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={generalSettings.timezone}
                        onChange={handleGeneralChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Save General Settings
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'loan' && (
              <form onSubmit={handleLoanSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        name="defaultInterestRate"
                        value={loanSettings.defaultInterestRate}
                        onChange={handleLoanChange}
                        min="0"
                        step="0.1"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Loan Term (months)
                      </label>
                      <input
                        type="number"
                        name="defaultLoanTerm"
                        value={loanSettings.defaultLoanTerm}
                        onChange={handleLoanChange}
                        min="1"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grace Period (days)
                      </label>
                      <input
                        type="number"
                        name="gracePeriod"
                        value={loanSettings.gracePeriod}
                        onChange={handleLoanChange}
                        min="0"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Late Payment Fee (%)
                      </label>
                      <input
                        type="number"
                        name="latePaymentFee"
                        value={loanSettings.latePaymentFee}
                        onChange={handleLoanChange}
                        min="0"
                        step="0.1"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="allowMultipleLoans"
                        name="allowMultipleLoans"
                        type="checkbox"
                        checked={loanSettings.allowMultipleLoans}
                        onChange={handleLoanChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowMultipleLoans" className="ml-2 block text-sm text-gray-700">
                        Allow multiple active loans per client
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="requireCollateral"
                        name="requireCollateral"
                        type="checkbox"
                        checked={loanSettings.requireCollateral}
                        onChange={handleLoanChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requireCollateral" className="ml-2 block text-sm text-gray-700">
                        Require collateral for loans
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Save Loan Settings
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'user' && (
              <form onSubmit={handleUserSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={userSettings.firstName}
                        onChange={handleUserChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={userSettings.lastName}
                        onChange={handleUserChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userSettings.email}
                        onChange={handleUserChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={userSettings.role}
                        onChange={handleUserChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="notificationsEnabled"
                          name="notificationsEnabled"
                          type="checkbox"
                          checked={userSettings.notificationsEnabled}
                          onChange={handleUserChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700">
                          Enable all notifications
                        </label>
                      </div>
                      <div className="flex items-center ml-6">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          checked={userSettings.emailNotifications}
                          onChange={handleUserChange}
                          disabled={!userSettings.notificationsEnabled}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                          Email notifications
                        </label>
                      </div>
                      <div className="flex items-center ml-6">
                        <input
                          id="smsNotifications"
                          name="smsNotifications"
                          type="checkbox"
                          checked={userSettings.smsNotifications}
                          onChange={handleUserChange}
                          disabled={!userSettings.notificationsEnabled}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                          SMS notifications
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Security</h3>
                    <button
                      type="button"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded mr-4"
                      onClick={() => console.log('Change password')}
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
                      onClick={() => console.log('Enable 2FA')}
                    >
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Save User Settings
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-800">User Management</h2>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={() => console.log('Add new user')}
                  >
                    Add New User
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap">john.doe@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">Administrator</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-800">Deactivate</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap">jane.smith@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">Loan Officer</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-800">Deactivate</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Robert Johnson</td>
                        <td className="px-6 py-4 whitespace-nowrap">robert.johnson@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">Accountant</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                          <button className="text-green-600 hover:text-green-800">Activate</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Database Backup</h3>
                    <p className="text-gray-600 mb-4">Create a backup of all your data for safekeeping or migration.</p>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      onClick={() => {
                        console.log('Create backup');
                        setAlert({
                          type: 'success',
                          message: 'Backup created successfully! Downloading file...'
                        });
                      }}
                    >
                      Create Backup
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Restore Data</h3>
                    <p className="text-gray-600 mb-4">Restore your system from a previous backup file.</p>
                    <div className="flex items-center">
                      <input
                        type="file"
                        id="backupFile"
                        className="hidden"
                        accept=".sql, .zip, .json"
                        onChange={(e) => console.log('File selected:', e.target.files[0]?.name)}
                      />
                      <label 
                        htmlFor="backupFile"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-pointer mr-4"
                      >
                        Select Backup File
                      </label>
                      <button 
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                        onClick={() => {
                          console.log('Restore from backup');
                          setAlert({
                            type: 'warning',
                            message: 'Restoring from backup will replace all current data. This cannot be undone.'
                          });
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Data Export</h3>
                    <p className="text-gray-600 mb-4">Export specific data in various formats.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-center"
                        onClick={() => console.log('Export clients')}
                      >
                        Export Clients (CSV)
                      </button>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-center"
                        onClick={() => console.log('Export loans')}
                      >
                        Export Loans (CSV)
                      </button>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-center"
                        onClick={() => console.log('Export transactions')}
                      >
                        Export Transactions (CSV)
                      </button>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-center"
                        onClick={() => console.log('Export full report')}
                      >
                        Export Full Report (PDF)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;