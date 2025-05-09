import React, { useState, useContext, useEffect } from 'react';
import { AlertContext } from '../context/AlertContext';
import Layout from '../components/Layout';

const Settings = () => {
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general-settings');
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: '',
    address: '',
    phone: '',
    currency: 'TZS'
  });
  
  // Loan settings state
  const [loanSettings, setLoanSettings] = useState({
    defaultInterestRate: 15,
    defaultLoanTerm: 12,
    lateFee: 5,
    gracePeriod: 3
  });
  
  // Users state for user management
  const [users, setUsers] = useState([]);
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    fullName: '',
    role: 'loan-officer',
    branch: 'KIC'
  });
  
  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    id: null,
    username: '',
    fullName: '',
    role: '',
    branch: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // Simulating API delay
        setTimeout(() => {
          setGeneralSettings({
            organizationName: 'Pamoja Microfinance',
            address: '123 Finance Street, Dar es Salaam',
            phone: '+255 123 456 789',
            currency: 'TZS'
          });
          
          setLoanSettings({
            defaultInterestRate: 15,
            defaultLoanTerm: 12,
            lateFee: 5,
            gracePeriod: 3
          });
          
          setUsers([
            {
              id: '1',
              username: 'admin',
              fullName: 'Administrator',
              role: 'admin',
              branch: 'HQ',
              lastUpdated: '2025-04-15'
            },
            {
              id: '2',
              username: 'jdoe',
              fullName: 'John Doe',
              role: 'loan-officer',
              branch: 'KIC',
              lastUpdated: '2025-04-10'
            },
            {
              id: '3',
              username: 'jsmith',
              fullName: 'Jane Smith',
              role: 'accountant',
              branch: 'KIC',
              lastUpdated: '2025-04-05'
            }
          ]);
          
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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    // Save logic would go here
    setAlert({
      type: 'success',
      message: 'General settings saved successfully!'
    });
  };

  const handleLoanSubmit = (e) => {
    e.preventDefault();
    // Save logic would go here
    setAlert({
      type: 'success',
      message: 'Loan settings saved successfully!'
    });
  };

  const handleGeneralChange = (e) => {
    const { id, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [id.replace('org-', '')]: value }));
  };

  const handleLoanChange = (e) => {
    const { id, value } = e.target;
    setLoanSettings(prev => ({ ...prev, [id.replace('default-', '')]: value }));
  };

  // User management functions
  const openAddUserModal = () => {
    setShowAddUserModal(true);
  };

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUserForm({
      username: '',
      fullName: '',
      role: 'loan-officer',
      branch: 'KIC'
    });
  };

  const handleNewUserChange = (e) => {
    const { id, value } = e.target;
    setNewUserForm(prev => ({ 
      ...prev, 
      [id.replace('new-user-', '')]: value 
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    // Generate an ID for the new user
    const newId = (Math.max(...users.map(user => parseInt(user.id))) + 1).toString();
    
    // Create a new user object
    const newUser = {
      id: newId,
      username: newUserForm.username,
      fullName: newUserForm.fullName,
      role: newUserForm.role,
      branch: newUserForm.branch,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Add the new user to the users array
    setUsers(prev => [...prev, newUser]);
    
    // Close the modal and reset the form
    closeAddUserModal();
    
    // Show success message
    setAlert({
      type: 'success',
      message: 'User added successfully!'
    });
  };

  const openEditUserModal = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditUserForm({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        branch: user.branch
      });
      setCurrentUserId(userId);
      setShowEditUserModal(true);
    }
  };

  const closeEditUserModal = () => {
    setShowEditUserModal(false);
    setCurrentUserId(null);
  };

  const handleEditUserChange = (e) => {
    const { id, value } = e.target;
    setEditUserForm(prev => ({ 
      ...prev, 
      [id.replace('edit-user-', '')]: value 
    }));
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    
    // Update the user in the users array
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        return {
          ...user,
          username: editUserForm.username,
          fullName: editUserForm.fullName,
          role: editUserForm.role,
          branch: editUserForm.branch,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return user;
    }));
    
    // Close the modal
    closeEditUserModal();
    
    // Show success message
    setAlert({
      type: 'success',
      message: 'User updated successfully!'
    });
  };

  const openDeleteUserModal = (userId) => {
    setCurrentUserId(userId);
    setShowDeleteUserModal(true);
  };

  const closeDeleteUserModal = () => {
    setShowDeleteUserModal(false);
    setCurrentUserId(null);
  };

  const handleDeleteUser = () => {
    // Remove the user from the users array
    setUsers(prev => prev.filter(user => user.id !== currentUserId));
    
    // Close the modal
    closeDeleteUserModal();
    
    // Show success message
    setAlert({
      type: 'success',
      message: 'User deleted successfully!'
    });
  };

  // Role display mapping
  const roleDisplay = {
    'admin': 'Administrator',
    'manager': 'Manager',
    'loan-officer': 'Loan Officer',
    'accountant': 'Accountant',
    'viewer': 'Viewer'
  };

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="main-content">
          <div className="content">
            <div id="alert-container"></div>
            <h2>System Settings</h2>
            
            <div className="tab-container">
              <div className="tab-buttons">
                <button 
                  className={`tab-button ${activeTab === 'general-settings' ? 'active' : ''}`}
                  onClick={() => handleTabClick('general-settings')}
                  data-tab="general-settings"
                >
                  General
                </button>
                <button 
                  className={`tab-button ${activeTab === 'loan-settings' ? 'active' : ''}`}
                  onClick={() => handleTabClick('loan-settings')}
                  data-tab="loan-settings"
                >
                  Loan Settings
                </button>
                <button 
                  className={`tab-button ${activeTab === 'user-settings' ? 'active' : ''}`}
                  onClick={() => handleTabClick('user-settings')}
                  data-tab="user-settings"
                >
                  User Management
                </button>
              </div>
              
              <div id="general-settings" className={`tab-content ${activeTab === 'general-settings' ? 'active' : ''}`}>
                <form id="general-settings-form" onSubmit={handleGeneralSubmit}>
                  <div className="form-group">
                    <label htmlFor="org-name">Organization Name</label>
                    <input 
                      type="text" 
                      id="org-name" 
                      className="form-control"
                      value={generalSettings.organizationName}
                      onChange={handleGeneralChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="org-address">Address</label>
                    <textarea 
                      id="org-address" 
                      className="form-control" 
                      rows="3"
                      value={generalSettings.address}
                      onChange={handleGeneralChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="org-phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="org-phone" 
                      className="form-control"
                      value={generalSettings.phone}
                      onChange={handleGeneralChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="org-currency">Currency</label>
                    <select 
                      id="org-currency" 
                      className="form-control"
                      value={generalSettings.currency}
                      onChange={handleGeneralChange}
                      required
                    >
                      <option value="TZS">Tanzanian Shilling (TZS)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="KES">Kenyan Shilling (KES)</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="btn btn-primary">Save Settings</button>
                </form>
              </div>
              
              <div id="loan-settings" className={`tab-content ${activeTab === 'loan-settings' ? 'active' : ''}`}>
                <form id="loan-settings-form" onSubmit={handleLoanSubmit}>
                  <div className="form-group">
                    <label htmlFor="default-interest">Default Interest Rate (%)</label>
                    <input 
                      type="number" 
                      id="default-interest" 
                      className="form-control" 
                      min="0" 
                      step="0.01"
                      value={loanSettings.defaultInterestRate}
                      onChange={handleLoanChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="default-term">Default Loan Term (months)</label>
                    <input 
                      type="number" 
                      id="default-term" 
                      className="form-control" 
                      min="1"
                      value={loanSettings.defaultLoanTerm}
                      onChange={handleLoanChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="late-fee">Late Payment Fee (%)</label>
                    <input 
                      type="number" 
                      id="late-fee" 
                      className="form-control" 
                      min="0" 
                      step="0.01"
                      value={loanSettings.lateFee}
                      onChange={handleLoanChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="grace-period">Grace Period (days)</label>
                    <input 
                      type="number" 
                      id="grace-period" 
                      className="form-control" 
                      min="0"
                      value={loanSettings.gracePeriod}
                      onChange={handleLoanChange}
                      required 
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary">Save Settings</button>
                </form>
              </div>
              
              <div id="user-settings" className={`tab-content ${activeTab === 'user-settings' ? 'active' : ''}`}>
                <div className="user-management-header">
                  <h3>User Management</h3>
                  <button id="add-user-btn" className="btn btn-primary" onClick={openAddUserModal}>Add New User</button>
                </div>
                
                <div className="table-responsive">
                  <table id="users-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="users-list">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.fullName}</td>
                          <td>{user.username}</td>
                          <td>{roleDisplay[user.role] || user.role}</td>
                          <td>{user.branch}</td>
                          <td>{user.lastUpdated}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-secondary" 
                              onClick={() => openEditUserModal(user.id)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => openDeleteUserModal(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeAddUserModal}>&times;</span>
            <h3>Add New User</h3>
            <form id="add-user-form" onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="new-user-username">Username</label>
                <input 
                  type="text" 
                  id="new-user-username" 
                  className="form-control"
                  value={newUserForm.username}
                  onChange={handleNewUserChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new-user-fullName">Full Name</label>
                <input 
                  type="text" 
                  id="new-user-fullName" 
                  className="form-control"
                  value={newUserForm.fullName}
                  onChange={handleNewUserChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new-user-role">Role</label>
                <select 
                  id="new-user-role" 
                  className="form-control"
                  value={newUserForm.role}
                  onChange={handleNewUserChange}
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="loan-officer">Loan Officer</option>
                  <option value="accountant">Accountant</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="new-user-branch">Branch</label>
                <input 
                  type="text" 
                  id="new-user-branch" 
                  className="form-control" 
                  value={newUserForm.branch}
                  onChange={handleNewUserChange}
                  required 
                />
              </div>
              
              <button type="submit" className="btn btn-primary">Create User</button>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeEditUserModal}>&times;</span>
            <h3>Edit User</h3>
            <form id="edit-user-form" onSubmit={handleUpdateUser}>
              <input type="hidden" id="edit-user-id" value={editUserForm.id} />
              <div className="form-group">
                <label htmlFor="edit-user-username">Username</label>
                <input 
                  type="text" 
                  id="edit-user-username" 
                  className="form-control"
                  value={editUserForm.username}
                  onChange={handleEditUserChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-user-fullName">Full Name</label>
                <input 
                  type="text" 
                  id="edit-user-fullName" 
                  className="form-control"
                  value={editUserForm.fullName}
                  onChange={handleEditUserChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-user-role">Role</label>
                <select 
                  id="edit-user-role" 
                  className="form-control"
                  value={editUserForm.role}
                  onChange={handleEditUserChange}
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="loan-officer">Loan Officer</option>
                  <option value="accountant">Accountant</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-user-branch">Branch</label>
                <input 
                  type="text" 
                  id="edit-user-branch" 
                  className="form-control"
                  value={editUserForm.branch}
                  onChange={handleEditUserChange}
                  required 
                />
              </div>
              
              <button type="submit" className="btn btn-primary">Update User</button>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeDeleteUserModal}>&times;</span>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <input type="hidden" id="delete-user-id" value={currentUserId} />
            <div className="modal-actions">
              <button id="confirm-delete" className="btn btn-danger" onClick={handleDeleteUser}>Delete User</button>
              <button id="cancel-delete" className="btn btn-secondary" onClick={closeDeleteUserModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Settings;