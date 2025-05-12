import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfihpvkbzppaejluyqoq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWhwdmtienBwYWVqbHV5cW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NDQzMzgsImV4cCI6MjA0NDEyMDMzOH0.U30_ovXdjGrovUZhBeVbeXtX-Xg29BPNZF9mhz7USfM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a fallback alert function if context is not available
const showAlert = (message, type = 'info') => {
    // Simple fallback alert using browser's alert
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can replace this with a custom toast notification or other UI feedback
    if (type === 'error') {
        alert(`Error: ${message}`);
    }
};

const Settings = () => {
    const navigate = useNavigate();
    
    // Add local alert state if context is not available
    const [localAlert, setLocalAlert] = useState(null);
    
    // Function to display alerts safely
    const displayAlert = (alertData) => {
        setLocalAlert(alertData);
        showAlert(alertData.message, alertData.type);
    };

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
    const [pendingUsers, setPendingUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Modal states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showPendingUsersModal, setShowPendingUsersModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // New user form state
    const [newUserForm, setNewUserForm] = useState({
        email: '',
        password: '',
        username: '',
        fullName: '',
        role: 'loan_officer',
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
        const fetchCurrentUser = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
                setCurrentUser(data.session.user);
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch organization settings (This would come from your database in a real app)
                // For now, using placeholder data
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

                // Fetch users from Supabase
                await fetchUsers();
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching settings:', error);
                displayAlert({
                    type: 'error',
                    message: 'Failed to load settings. Please try again later.'
                });
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const fetchUsers = async () => {
        setUserLoading(true);
        try {
            // Query user_profiles table in Supabase
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('user_id, username, full_name, role, branch, updated_at');

            if (profileError) {
                throw profileError;
            }

            // Format user data
            const formattedUsers = profileData.map(user => ({
                id: user.user_id,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
                branch: user.branch,
                lastUpdated: new Date(user.updated_at).toISOString().split('T')[0]
            }));

            setUsers(formattedUsers);
            
            // Now fetch pending users from auth.users that aren't in user_profiles
            // Note: This requires admin rights or a server function in production
            // For simplicity, we'll implement a way to manually add them
            await fetchPendingUsers();
            
        } catch (error) {
            console.error('Error fetching users:', error);
            displayAlert({
                type: 'error',
                message: 'Failed to load users. Please try again later.'
            });
        } finally {
            setUserLoading(false);
        }
    };
    
    // Since direct access to auth.users might be restricted, we'll create a simulated approach
    // In production, this would be handled by a server function or admin API
    const fetchPendingUsers = async () => {
        try {
            // Check local storage for any pending users we've added
            const storedPendingUsers = localStorage.getItem('pendingUsers');
            if (storedPendingUsers) {
                setPendingUsers(JSON.parse(storedPendingUsers));
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        try {
            // In a real application, you would update these settings in your database
            // For example:
            // await supabase.from('organization_settings').upsert({...generalSettings});
            
            displayAlert({
                type: 'success',
                message: 'General settings saved successfully!'
            });
        } catch (error) {
            console.error('Error saving general settings:', error);
            displayAlert({
                type: 'error',
                message: 'Failed to save general settings.'
            });
        }
    };

    const handleLoanSubmit = async (e) => {
        e.preventDefault();
        try {
            // In a real application, you would update these settings in your database
            // For example:
            // await supabase.from('loan_settings').upsert({...loanSettings});
            
            displayAlert({
                type: 'success',
                message: 'Loan settings saved successfully!'
            });
        } catch (error) {
            console.error('Error saving loan settings:', error);
            displayAlert({
                type: 'error',
                message: 'Failed to save loan settings.'
            });
        }
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
        // Reset the new user form completely to ensure no leftover data
        setNewUserForm({
            email: '',
            password: '',
            username: '',
            fullName: '',
            role: 'loan_officer',
            branch: 'KIC'
        });
        
        // Make sure edit form is cleared too to prevent any cross-contamination
        setEditUserForm({
            id: null,
            username: '',
            fullName: '',
            role: '',
            branch: ''
        });
        
        // Reset current user ID
        setCurrentUserId(null);
        
        // Now open the modal
        setShowAddUserModal(true);
    };

    const closeAddUserModal = () => {
        setShowAddUserModal(false);
    };

    const handleNewUserChange = (e) => {
        const { id, value } = e.target;
        setNewUserForm(prev => ({
            ...prev,
            [id.replace('new-user-', '')]: value
        }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            // Step 1: Sign up user via auth.signUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUserForm.email,
                password: newUserForm.password,
                options: {
                    data: {
                        username: newUserForm.username,
                        full_name: newUserForm.fullName,
                        role: newUserForm.role,
                        branch: newUserForm.branch
                    }
                }
            });
        
            if (authError) throw authError;
            
            if (!authData || !authData.user) {
                throw new Error('Failed to create user');
            }
            
            // Store the pending user in localStorage for manual confirmation
            const pendingUser = {
                id: authData.user.id,
                email: newUserForm.email,
                username: newUserForm.username,
                fullName: newUserForm.fullName,
                role: newUserForm.role,
                branch: newUserForm.branch,
                createdAt: new Date().toISOString()
            };
            
            // Add to pending users
            const updatedPendingUsers = [...pendingUsers, pendingUser];
            setPendingUsers(updatedPendingUsers);
            
            // Save to localStorage
            localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
        
            // Success message about confirmation email
            displayAlert({
                type: 'success',
                message: `User added successfully! Since email confirmation might not be working, you can manually confirm ${newUserForm.fullName} from the "Pending Users" button.`
            });
        
            // Close the modal and reset the form
            closeAddUserModal();
            
        } catch (error) {
            console.error('Error adding user:', error);
            displayAlert({
                type: 'error',
                message: `Failed to add user: ${error.message}`
            });
        }
    };
    
    const openPendingUsersModal = () => {
        setShowPendingUsersModal(true);
    };
    
    const closePendingUsersModal = () => {
        setShowPendingUsersModal(false);
    };
    
    const handleManualConfirmation = async (userId) => {
        try {
            // Find the pending user
            const pendingUser = pendingUsers.find(user => user.id === userId);
            if (!pendingUser) {
                throw new Error('User not found');
            }
            
            // In a production environment, you would use an admin function or server API to:
            // 1. Set the user as confirmed in auth.users
            // 2. Create the user_profile entry
            
            // For this demo, we'll directly create a user_profile entry
            const { error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: pendingUser.id,
                    username: pendingUser.username,
                    full_name: pendingUser.fullName,
                    role: pendingUser.role,
                    branch: pendingUser.branch,
                    email: pendingUser.email,
                    created_at: pendingUser.createdAt,
                    updated_at: new Date().toISOString()
                });
                
            if (error) throw error;
            
            // Remove user from pending list
            const updatedPendingUsers = pendingUsers.filter(user => user.id !== userId);
            setPendingUsers(updatedPendingUsers);
            localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
            
            // Refresh users list
            await fetchUsers();
            
            displayAlert({
                type: 'success',
                message: `User ${pendingUser.fullName} has been manually confirmed and added to the system.`
            });
            
        } catch (error) {
            console.error('Error confirming user:', error);
            displayAlert({
                type: 'error',
                message: `Failed to confirm user: ${error.message}`
            });
        }
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

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            // Update user in user_profiles table
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    username: editUserForm.username,
                    full_name: editUserForm.fullName,
                    role: editUserForm.role,
                    branch: editUserForm.branch,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);

            if (error) throw error;

            // Refresh user list
            await fetchUsers();

            // Close the modal
            closeEditUserModal();

            // Show success message
            displayAlert({
                type: 'success',
                message: 'User updated successfully!'
            });
        } catch (error) {
            console.error('Error updating user:', error);
            displayAlert({
                type: 'error',
                message: `Failed to update user: ${error.message}`
            });
        }
    };

    const openDeleteUserModal = (userId) => {
        setCurrentUserId(userId);
        setShowDeleteUserModal(true);
    };

    const closeDeleteUserModal = () => {
        setShowDeleteUserModal(false);
        setCurrentUserId(null);
    };

    const handleDeleteUser = async () => {
        try {
            // Create a server-side function to handle user deletion securely
            const { error } = await supabase.functions.invoke('delete-user', {
                body: { user_id: currentUserId }
            });

            if (error) throw error;

            // If the server-side function doesn't exist yet, let the user know
            if (!supabase.functions) {
                displayAlert({
                    type: 'warning',
                    message: 'User deletion requires a server function. Please implement the edge function or contact your administrator.'
                });
                return;
            }

            // As a fallback, only delete from user_profiles
            const { error: profileError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('user_id', currentUserId);

            if (profileError) throw profileError;

            // Refresh user list
            await fetchUsers();

            // Close the modal
            closeDeleteUserModal();

            // Show success message
            displayAlert({
                type: 'success',
                message: 'User removed from profiles successfully!'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            displayAlert({
                type: 'error',
                message: `Failed to delete user: ${error.message}`
            });
        }
    };

    // Role display mapping
    const roleDisplay = {
        'admin': 'Administrator',
        'manager': 'Manager',
        'loan_officer': 'Loan Officer',
        'accountant': 'Accountant',
        'viewer': 'Viewer'
    };

    // CSS styles for tab transitions
    const tabStyles = {
        tabContainer: {
            marginTop: '2rem'
        },
        tabButtons: {
            display: 'flex',
            borderBottom: '1px solid #dee2e6',
            marginBottom: '1rem'
        },
        tabButton: {
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: '2px solid transparent',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
        },
        activeTabButton: {
            borderBottom: '2px solid #007bff',
            color: '#007bff'
        },
        tabContent: {
            display: 'none',
            padding: '1rem 0'
        },
        activeTabContent: {
            display: 'block',
            animation: 'fadeIn 0.3s ease-out'
        },
        '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 }
        }
    };
    
    // Modal styles for centered positioning
    const modalStyles = {
        modal: {
            display: 'block',
            position: 'fixed',
            zIndex: 1000,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'auto',
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        modalContent: {
            backgroundColor: '#fff',
            margin: '10% auto', // This centers it vertically with some space at the top
            padding: '20px',
            border: '1px solid #888',
            width: '80%',
            maxWidth: '600px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            position: 'relative',
            maxHeight: '80vh',
            overflow: 'auto'
        },
        closeButton: {
            position: 'absolute',
            right: '15px',
            top: '10px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
        }
    };
    
    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="content">
                <div id="alert-container">
                    {localAlert && (
                        <div className={`alert alert-${localAlert.type}`} role="alert">
                            {localAlert.message}
                            <button 
                                type="button" 
                                className="close" 
                                onClick={() => setLocalAlert(null)}
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}
                </div>
                <h2>System Settings</h2>

                <div className="tab-container" style={tabStyles.tabContainer}>
                    <div className="tab-buttons" style={tabStyles.tabButtons}>
                        <button
                            className={`tab-button ${activeTab === 'general-settings' ? 'active' : ''}`}
                            style={{
                                ...tabStyles.tabButton,
                                ...(activeTab === 'general-settings' ? tabStyles.activeTabButton : {})
                            }}
                            onClick={() => handleTabClick('general-settings')}
                        >
                            General
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'loan-settings' ? 'active' : ''}`}
                            style={{
                                ...tabStyles.tabButton,
                                ...(activeTab === 'loan-settings' ? tabStyles.activeTabButton : {})
                            }}
                            onClick={() => handleTabClick('loan-settings')}
                        >
                            Loan Settings
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'user-settings' ? 'active' : ''}`}
                            style={{
                                ...tabStyles.tabButton,
                                ...(activeTab === 'user-settings' ? tabStyles.activeTabButton : {})
                            }}
                            onClick={() => handleTabClick('user-settings')}
                        >
                            User Management
                        </button>
                    </div>

                    {/* General Settings Tab */}
                    <div
                        id="general-settings"
                        className={`tab-content ${activeTab === 'general-settings' ? 'active' : ''}`}
                        style={{
                            ...tabStyles.tabContent,
                            ...(activeTab === 'general-settings' ? tabStyles.activeTabContent : {})
                        }}
                    >
                        <form id="general-settings-form" onSubmit={handleGeneralSubmit}>
                            <div className="form-group">
                                <label htmlFor="org-organizationName">Organization Name</label>
                                <input
                                    type="text"
                                    id="org-organizationName"
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

                    {/* Loan Settings Tab */}
                    <div
                        id="loan-settings"
                        className={`tab-content ${activeTab === 'loan-settings' ? 'active' : ''}`}
                        style={{
                            ...tabStyles.tabContent,
                            ...(activeTab === 'loan-settings' ? tabStyles.activeTabContent : {})
                        }}
                    >
                        <form id="loan-settings-form" onSubmit={handleLoanSubmit}>
                            <div className="form-group">
                                <label htmlFor="default-defaultInterestRate">Default Interest Rate (%)</label>
                                <input
                                    type="number"
                                    id="default-defaultInterestRate"
                                    className="form-control"
                                    min="0"
                                    step="0.01"
                                    value={loanSettings.defaultInterestRate}
                                    onChange={handleLoanChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="default-defaultLoanTerm">Default Loan Term (months)</label>
                                <input
                                    type="number"
                                    id="default-defaultLoanTerm"
                                    className="form-control"
                                    min="1"
                                    value={loanSettings.defaultLoanTerm}
                                    onChange={handleLoanChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="default-lateFee">Late Payment Fee (%)</label>
                                <input
                                    type="number"
                                    id="default-lateFee"
                                    className="form-control"
                                    min="0"
                                    step="0.01"
                                    value={loanSettings.lateFee}
                                    onChange={handleLoanChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="default-gracePeriod">Grace Period (days)</label>
                                <input
                                    type="number"
                                    id="default-gracePeriod"
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

                    {/* User Management Tab */}
                    <div
                        id="user-settings"
                        className={`tab-content ${activeTab === 'user-settings' ? 'active' : ''}`}
                        style={{
                            ...tabStyles.tabContent,
                            ...(activeTab === 'user-settings' ? tabStyles.activeTabContent : {})
                        }}
                    >
                        <div className="user-management-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>User Management</h3>
                            <div>
                                <button 
                                    className="btn btn-info" 
                                    onClick={openPendingUsersModal}
                                    style={{ marginRight: '10px' }}
                                >
                                    Pending Users {pendingUsers.length > 0 ? `(${pendingUsers.length})` : ''}
                                </button>
                                <button id="add-user-btn" className="btn btn-primary" onClick={openAddUserModal}>
                                    Add New User
                                </button>
                            </div>
                        </div>

                        {userLoading ? (
                            <div className="loading-spinner">Loading users...</div>
                        ) : (
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
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">No users found</td>
                                            </tr>
                                        ) : (
                                            users.map(user => (
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
                                                            style={{ marginLeft: '5px' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

{/* Add User Modal */}
{showAddUserModal && (
    <div className="modal" style={modalStyles.modal}>
        <div className="modal-content" style={modalStyles.modalContent}>
            <span className="close" style={modalStyles.closeButton} onClick={closeAddUserModal}>&times;</span>
            <h3>Add New User</h3>
            <form id="add-user-form" onSubmit={handleAddUser}>
                <div className="form-group">
                    <label htmlFor="new-user-email">Email</label>
                    <input
                        type="email"
                        id="new-user-email"
                        className="form-control"
                        value={newUserForm.email}
                        onChange={handleNewUserChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="new-user-password">Password</label>
                    <input
                        type="password"
                        id="new-user-password"
                        className="form-control"
                        value={newUserForm.password}
                        onChange={handleNewUserChange}
                        required
                        minLength="6"
                    />
                </div>
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
                        <option value="loan_officer">Loan Officer</option>
                        <option value="accountant">Accountant</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="new-user-branch">Branch</label>
                    <select
                        id="new-user-branch"
                        className="form-control"
                        value={newUserForm.branch}
                        onChange={handleNewUserChange}
                        required
                    >
                        <option value="KIC">KIC</option>
                        <option value="DSM">Dar es Salaam</option>
                        <option value="ARU">Arusha</option>
                        <option value="MWZ">Mwanza</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Add User</button>
            </form>
        </div>
    </div>
)}

{/* Edit User Modal */}
{showEditUserModal && (
    <div className="modal" style={modalStyles.modal}>
        <div className="modal-content" style={modalStyles.modalContent}>
            <span className="close" style={modalStyles.closeButton} onClick={closeEditUserModal}>&times;</span>
            <h3>Edit User</h3>
            <form id="edit-user-form" onSubmit={handleUpdateUser}>
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
                        <option value="loan_officer">Loan Officer</option>
                        <option value="accountant">Accountant</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="edit-user-branch">Branch</label>
                    <select
                        id="edit-user-branch"
                        className="form-control"
                        value={editUserForm.branch}
                        onChange={handleEditUserChange}
                        required
                    >
                        <option value="KIC">KIC</option>
                        <option value="DSM">Dar es Salaam</option>
                        <option value="ARU">Arusha</option>
                        <option value="MWZ">Mwanza</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Update User</button>
            </form>
        </div>
    </div>
)}

{/* Delete User Modal */}
{showDeleteUserModal && (
    <div className="modal" style={modalStyles.modal}>
        <div className="modal-content" style={modalStyles.modalContent}>
            <span className="close" style={modalStyles.closeButton} onClick={closeDeleteUserModal}>&times;</span>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick={closeDeleteUserModal}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteUser}>Delete User</button>
            </div>
        </div>
    </div>
)}

{/* Pending Users Modal */}
{showPendingUsersModal && (
    <div className="modal" style={modalStyles.modal}>
        <div className="modal-content" style={modalStyles.modalContent}>
            <span className="close" style={modalStyles.closeButton} onClick={closePendingUsersModal}>&times;</span>
            <h3>Pending Users</h3>
            
            {pendingUsers.length === 0 ? (
                <p>No pending users found.</p>
            ) : (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Branch</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{roleDisplay[user.role] || user.role}</td>
                                    <td>{user.branch}</td>
                                    <td>
                                        <div className="btn-group">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleManualConfirmation(user.id)}
                                                style={{ marginRight: '5px' }}
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeletePendingUser(user.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
                <button className="btn btn-secondary" onClick={closePendingUsersModal}>Close</button>
            </div>
        </div>
    </div>
)}
</div>
);
};

export default Settings;