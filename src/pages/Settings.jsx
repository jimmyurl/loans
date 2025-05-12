import React, { useState, useEffect } from 'react';
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
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

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

    // Roles and branches states - now dynamic
    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [newRole, setNewRole] = useState('');
    const [newBranch, setNewBranch] = useState('');

    // Modal states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showPendingUsersModal, setShowPendingUsersModal] = useState(false);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // New user form state
    const [newUserForm, setNewUserForm] = useState({
        email: '',
        password: '',
        username: '',
        fullName: '',
        role: '',
        branch: ''
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
        const checkUserAuth = async () => {
            const { data } = await supabase.auth.getSession();
            
            if (!data?.session?.user) {
                // No user logged in, redirect to login
                navigate('/login');
                return;
            }
            
            setCurrentUser(data.session.user);
            
            // Check if user has admin role
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('user_id', data.session.user.id)
                .single();
                
            if (profileError) {
                console.error('Error fetching user role:', profileError);
                navigate('/dashboard'); // Redirect if can't confirm role
                return;
            }
            
            if (profileData.role !== 'admin') {
                // Not an admin, redirect to dashboard
                displayAlert({
                    type: 'error',
                    message: 'Access denied. Only administrators can access settings.'
                });
                navigate('/dashboard');
                return;
            }
            
            setIsAdmin(true);
            
            // Continue loading the settings page for admin users
            fetchSettings();
        };

        checkUserAuth();
    }, [navigate]);

    const fetchSettings = async () => {
        try {
            // Fetch organization settings
            const { data: orgData, error: orgError } = await supabase
                .from('organization_settings')
                .select('*')
                .single();
                
            if (!orgError && orgData) {
                setGeneralSettings({
                    organizationName: orgData.organization_name || 'Pamoja Microfinance',
                    address: orgData.address || '123 Finance Street, Dar es Salaam',
                    phone: orgData.phone || '+255 123 456 789',
                    currency: orgData.currency || 'TZS'
                });
            } else {
                // Use defaults if no settings found
                setGeneralSettings({
                    organizationName: 'Pamoja Microfinance',
                    address: '123 Finance Street, Dar es Salaam',
                    phone: '+255 123 456 789',
                    currency: 'TZS'
                });
            }

            // Fetch loan settings
            const { data: loanData, error: loanError } = await supabase
                .from('loan_settings')
                .select('*')
                .single();
                
            if (!loanError && loanData) {
                setLoanSettings({
                    defaultInterestRate: loanData.default_interest_rate || 15,
                    defaultLoanTerm: loanData.default_loan_term || 12,
                    lateFee: loanData.late_fee || 5,
                    gracePeriod: loanData.grace_period || 3
                });
            }

            // Fetch roles from the system_roles table
            const { data: rolesData, error: rolesError } = await supabase
                .from('system_roles')
                .select('*')
                .order('role_name');
                
            if (rolesError) {
                console.error('Error fetching roles:', rolesError);
                // If the table doesn't exist yet, use default roles
                setRoles([
                    { id: 'admin', name: 'Administrator' },
                    { id: 'manager', name: 'Manager' },
                    { id: 'loan_officer', name: 'Loan Officer' },
                    { id: 'accountant', name: 'Accountant' },
                    { id: 'viewer', name: 'Viewer' }
                ]);
            } else {
                setRoles(rolesData.map(role => ({
                    id: role.role_id,
                    name: role.role_name
                })));
            }

            // Fetch branches from the system_branches table
            const { data: branchesData, error: branchesError } = await supabase
                .from('system_branches')
                .select('*')
                .order('branch_name');
                
            if (branchesError) {
                console.error('Error fetching branches:', branchesError);
                // If the table doesn't exist yet, use default branches
                setBranches([
                    { id: 'KIC', name: 'KIC' },
                    { id: 'DSM', name: 'Dar es Salaam' },
                    { id: 'ARU', name: 'Arusha' },
                    { id: 'MWZ', name: 'Mwanza' }
                ]);
            } else {
                setBranches(branchesData.map(branch => ({
                    id: branch.branch_id,
                    name: branch.branch_name
                })));
            }

            // Fetch users
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
            
            // Now fetch pending users
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
            // Upsert general settings to organization_settings table
            const { error } = await supabase
                .from('organization_settings')
                .upsert({
                    id: 1, // Using a single row for org settings
                    organization_name: generalSettings.organizationName,
                    address: generalSettings.address,
                    phone: generalSettings.phone,
                    currency: generalSettings.currency,
                    updated_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
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
            // Upsert loan settings to loan_settings table
            const { error } = await supabase
                .from('loan_settings')
                .upsert({
                    id: 1, // Using a single row for loan settings
                    default_interest_rate: loanSettings.defaultInterestRate,
                    default_loan_term: loanSettings.defaultLoanTerm,
                    late_fee: loanSettings.lateFee,
                    grace_period: loanSettings.gracePeriod,
                    updated_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
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

    // Role management functions
    const openAddRoleModal = () => {
        setNewRole('');
        setShowAddRoleModal(true);
    };
    
    const closeAddRoleModal = () => {
        setShowAddRoleModal(false);
    };
    
    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!newRole.trim()) {
            displayAlert({
                type: 'error',
                message: 'Role name cannot be empty'
            });
            return;
        }
        
        try {
            // Create a role ID from the name (lowercase, replace spaces with underscores)
            const roleId = newRole.toLowerCase().replace(/\s+/g, '_');
            
            // Check if role already exists
            if (roles.some(role => role.id === roleId)) {
                displayAlert({
                    type: 'error',
                    message: 'A role with this ID already exists'
                });
                return;
            }
            
            // Insert into system_roles table
            const { error } = await supabase
                .from('system_roles')
                .insert({
                    role_id: roleId,
                    role_name: newRole,
                    created_at: new Date().toISOString(),
                    created_by: currentUser.id
                });
                
            if (error) throw error;
            
            // Update local state
            setRoles([...roles, { id: roleId, name: newRole }]);
            
            displayAlert({
                type: 'success',
                message: `Role "${newRole}" added successfully!`
            });
            
            closeAddRoleModal();
        } catch (error) {
            console.error('Error adding role:', error);
            displayAlert({
                type: 'error',
                message: `Failed to add role: ${error.message}`
            });
        }
    };
    
    const handleDeleteRole = async (roleId) => {
        // Prevent deleting the admin role
        if (roleId === 'admin') {
            displayAlert({
                type: 'error',
                message: 'The Administrator role cannot be deleted'
            });
            return;
        }
        
        // Check if any users are using this role
        const usersWithRole = users.filter(user => user.role === roleId);
        if (usersWithRole.length > 0) {
            displayAlert({
                type: 'error',
                message: `Cannot delete role: ${usersWithRole.length} user(s) currently have this role assigned`
            });
            return;
        }
        
        try {
            // Delete from system_roles table
            const { error } = await supabase
                .from('system_roles')
                .delete()
                .eq('role_id', roleId);
                
            if (error) throw error;
            
            // Update local state
            setRoles(roles.filter(role => role.id !== roleId));
            
            displayAlert({
                type: 'success',
                message: 'Role deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting role:', error);
            displayAlert({
                type: 'error',
                message: `Failed to delete role: ${error.message}`
            });
        }
    };
    
    // Branch management functions
    const openAddBranchModal = () => {
        setNewBranch('');
        setShowAddBranchModal(true);
    };
    
    const closeAddBranchModal = () => {
        setShowAddBranchModal(false);
    };
    
    const handleAddBranch = async (e) => {
        e.preventDefault();
        if (!newBranch.trim()) {
            displayAlert({
                type: 'error',
                message: 'Branch name cannot be empty'
            });
            return;
        }
        
        try {
            // Create a branch ID from the name (uppercase, replace spaces with underscores)
            const branchId = newBranch.toUpperCase().replace(/\s+/g, '_');
            
            // Check if branch already exists
            if (branches.some(branch => branch.id === branchId)) {
                displayAlert({
                    type: 'error',
                    message: 'A branch with this ID already exists'
                });
                return;
            }
            
            // Insert into system_branches table
            const { error } = await supabase
                .from('system_branches')
                .insert({
                    branch_id: branchId,
                    branch_name: newBranch,
                    created_at: new Date().toISOString(),
                    created_by: currentUser.id
                });
                
            if (error) throw error;
            
            // Update local state
            setBranches([...branches, { id: branchId, name: newBranch }]);
            
            displayAlert({
                type: 'success',
                message: `Branch "${newBranch}" added successfully!`
            });
            
            closeAddBranchModal();
        } catch (error) {
            console.error('Error adding branch:', error);
            displayAlert({
                type: 'error',
                message: `Failed to add branch: ${error.message}`
            });
        }
    };
    
    const handleDeleteBranch = async (branchId) => {
        // Check if any users are assigned to this branch
        const usersWithBranch = users.filter(user => user.branch === branchId);
        if (usersWithBranch.length > 0) {
            displayAlert({
                type: 'error',
                message: `Cannot delete branch: ${usersWithBranch.length} user(s) currently assigned to this branch`
            });
            return;
        }
        
        try {
            // Delete from system_branches table
            const { error } = await supabase
                .from('system_branches')
                .delete()
                .eq('branch_id', branchId);
                
            if (error) throw error;
            
            // Update local state
            setBranches(branches.filter(branch => branch.id !== branchId));
            
            displayAlert({
                type: 'success',
                message: 'Branch deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting branch:', error);
            displayAlert({
                type: 'error',
                message: `Failed to delete branch: ${error.message}`
            });
        }
    };

    // User management functions
    const openAddUserModal = () => {
        // Reset the new user form completely
        setNewUserForm({
            email: '',
            password: '',
            username: '',
            fullName: '',
            role: roles.length > 0 ? roles[0].id : '',
            branch: branches.length > 0 ? branches[0].id : ''
        });
        
        // Make sure edit form is cleared too
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
            
            // Create the user_profile entry
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
    
    const handleDeletePendingUser = async (userId) => {
        try {
            // Remove user from pending list
            const updatedPendingUsers = pendingUsers.filter(user => user.id !== userId);
            setPendingUsers(updatedPendingUsers);
            localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
            
            displayAlert({
                type: 'success',
                message: 'Pending user removed successfully'
            });
        } catch (error) {
            console.error('Error deleting pending user:', error);
            displayAlert({
                type: 'error',
                message: `Failed to delete pending user: ${error.message}`
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

    // Find role display name from ID
    const getRoleDisplayName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : roleId;
    };
    
    // Find branch display name from ID
    const getBranchDisplayName = (branchId) => {
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : branchId;
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
            cursor: 'pointer',
            color: '#aaa'
        },
        closeButtonHover: {
            color: '#000'
        },
        modalHeader: {
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '10px',
            marginBottom: '15px'
        },
        modalFooter: {
            borderTop: '1px solid #dee2e6',
            paddingTop: '15px',
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'flex-end'
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="container mt-5">
                <h1>Settings</h1>
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1>System Settings</h1>
            <p className="lead">Configure your organization's settings, loan parameters, and manage users.</p>
            
            {localAlert && (
                <div className={`alert alert-${localAlert.type} alert-dismissible fade show`} role="alert">
                    {localAlert.message}
                    <button type="button" className="btn-close" onClick={() => setLocalAlert(null)}></button>
                </div>
            )}
            
            <div style={tabStyles.tabContainer}>
                <div style={tabStyles.tabButtons}>
                    <button 
                        style={{...tabStyles.tabButton, ...(activeTab === 'general-settings' ? tabStyles.activeTabButton : {})}}
                        onClick={() => handleTabClick('general-settings')}
                    >
                        General Settings
                    </button>
                    <button 
                        style={{...tabStyles.tabButton, ...(activeTab === 'loan-settings' ? tabStyles.activeTabButton : {})}}
                        onClick={() => handleTabClick('loan-settings')}
                    >
                        Loan Settings
                    </button>
                    <button 
                        style={{...tabStyles.tabButton, ...(activeTab === 'user-management' ? tabStyles.activeTabButton : {})}}
                        onClick={() => handleTabClick('user-management')}
                    >
                        User Management
                    </button>
                    <button 
                        style={{...tabStyles.tabButton, ...(activeTab === 'roles-branches' ? tabStyles.activeTabButton : {})}}
                        onClick={() => handleTabClick('roles-branches')}
                    >
                        Roles & Branches
                    </button>
                </div>
                
                {/* General Settings Tab */}
                <div style={{...tabStyles.tabContent, ...(activeTab === 'general-settings' ? tabStyles.activeTabContent : {})}}>
                    <h3 className="mb-4">Organization Information</h3>
                    <form onSubmit={handleGeneralSubmit}>
                        <div className="mb-3">
                            <label htmlFor="org-organizationName" className="form-label">Organization Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="org-organizationName"
                                value={generalSettings.organizationName}
                                onChange={handleGeneralChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="org-address" className="form-label">Address</label>
                            <textarea 
                                className="form-control" 
                                id="org-address" 
                                rows="2"
                                value={generalSettings.address}
                                onChange={handleGeneralChange}
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="org-phone" className="form-label">Phone Number</label>
                            <input 
                                type="tel" 
                                className="form-control" 
                                id="org-phone"
                                value={generalSettings.phone}
                                onChange={handleGeneralChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="org-currency" className="form-label">Default Currency</label>
                            <select 
                                className="form-select" 
                                id="org-currency"
                                value={generalSettings.currency}
                                onChange={handleGeneralChange}
                            >
                                <option value="TZS">Tanzanian Shilling (TZS)</option>
                                <option value="USD">US Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="KES">Kenyan Shilling (KES)</option>
                                <option value="UGX">Ugandan Shilling (UGX)</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Save General Settings</button>
                    </form>
                </div>
                
                {/* Loan Settings Tab */}
                <div style={{...tabStyles.tabContent, ...(activeTab === 'loan-settings' ? tabStyles.activeTabContent : {})}}>
                    <h3 className="mb-4">Loan Parameters</h3>
                    <form onSubmit={handleLoanSubmit}>
                        <div className="mb-3">
                            <label htmlFor="default-defaultInterestRate" className="form-label">Default Interest Rate (%)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="default-defaultInterestRate" 
                                min="0"
                                step="0.1"
                                value={loanSettings.defaultInterestRate}
                                onChange={handleLoanChange}
                                required
                            />
                            <div className="form-text">The default annual interest rate for new loans</div>
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="default-defaultLoanTerm" className="form-label">Default Loan Term (months)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="default-defaultLoanTerm" 
                                min="1"
                                value={loanSettings.defaultLoanTerm}
                                onChange={handleLoanChange}
                                required
                            />
                            <div className="form-text">The default repayment period for new loans</div>
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="default-lateFee" className="form-label">Late Payment Fee (%)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="default-lateFee" 
                                min="0"
                                step="0.1"
                                value={loanSettings.lateFee}
                                onChange={handleLoanChange}
                                required
                            />
                            <div className="form-text">Additional fee applied to late payments (% of overdue amount)</div>
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="default-gracePeriod" className="form-label">Grace Period (days)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="default-gracePeriod" 
                                min="0"
                                value={loanSettings.gracePeriod}
                                onChange={handleLoanChange}
                                required
                            />
                            <div className="form-text">Days after due date before a payment is marked late</div>
                        </div>
                        
                        <button type="submit" className="btn btn-primary">Save Loan Settings</button>
                    </form>
                </div>
                
                {/* User Management Tab */}
                <div style={{...tabStyles.tabContent, ...(activeTab === 'user-management' ? tabStyles.activeTabContent : {})}}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3>User Management</h3>
                        <div>
                            <button onClick={openPendingUsersModal} className="btn btn-outline-primary me-2">
                                Pending Users 
                                {pendingUsers.length > 0 && (
                                    <span className="badge bg-danger ms-2">{pendingUsers.length}</span>
                                )}
                            </button>
                            <button onClick={openAddUserModal} className="btn btn-primary">Add New User</button>
                        </div>
                    </div>
                    
                    {userLoading ? (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading users...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Role</th>
                                        <th>Branch</th>
                                        <th>Last Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center">No users found</td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.username}</td>
                                                <td>{user.fullName}</td>
                                                <td>{getRoleDisplayName(user.role)}</td>
                                                <td>{getBranchDisplayName(user.branch)}</td>
                                                <td>{user.lastUpdated}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => openEditUserModal(user.id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => openDeleteUserModal(user.id)}
                                                        disabled={user.id === currentUser?.id} // Can't delete yourself
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
                
                {/* Roles & Branches Tab */}
                <div style={{...tabStyles.tabContent, ...(activeTab === 'roles-branches' ? tabStyles.activeTabContent : {})}}>
                    <div className="row">
                        {/* Roles Management */}
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>System Roles</h3>
                                <button onClick={openAddRoleModal} className="btn btn-primary btn-sm">Add Role</button>
                            </div>
                            <div className="list-group mb-4">
                                {roles.map(role => (
                                    <div key={role.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                        <span>{role.name}</span>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteRole(role.id)}
                                            disabled={role.id === 'admin'} // Prevent deleting admin role
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Branches Management */}
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>System Branches</h3>
                                <button onClick={openAddBranchModal} className="btn btn-primary btn-sm">Add Branch</button>
                            </div>
                            <div className="list-group">
                                {branches.map(branch => (
                                    <div key={branch.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                        <span>{branch.name}</span>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteBranch(branch.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add User Modal */}
            {showAddUserModal && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <div style={modalStyles.modalHeader}>
                            <h4>Add New User</h4>
                            <span 
                                style={modalStyles.closeButton} 
                                onClick={closeAddUserModal}
                                onMouseOver={(e) => e.target.style.color = modalStyles.closeButtonHover.color}
                                onMouseOut={(e) => e.target.style.color = modalStyles.closeButton.color}
                            >&times;</span>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="mb-3">
                                <label htmlFor="new-user-email" className="form-label">Email</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    id="new-user-email"
                                    value={newUserForm.email}
                                    onChange={handleNewUserChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new-user-password" className="form-label">Password</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    id="new-user-password"
                                    value={newUserForm.password}
                                    onChange={handleNewUserChange}
                                    required
                                    minLength="6"
                                />
                                <div className="form-text">Minimum 6 characters</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new-user-username" className="form-label">Username</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="new-user-username"
                                    value={newUserForm.username}
                                    onChange={handleNewUserChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new-user-fullName" className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="new-user-fullName"
                                    value={newUserForm.fullName}
                                    onChange={handleNewUserChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new-user-role" className="form-label">Role</label>
                                <select 
                                    className="form-select" 
                                    id="new-user-role"
                                    value={newUserForm.role}
                                    onChange={handleNewUserChange}
                                    required
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new-user-branch" className="form-label">Branch</label>
                                <select 
                                    className="form-select" 
                                    id="new-user-branch"
                                    value={newUserForm.branch}
                                    onChange={handleNewUserChange}
                                    required
                                >
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={modalStyles.modalFooter}>
                                <button type="button" className="btn btn-secondary me-2" onClick={closeAddUserModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Edit User Modal */}
            {showEditUserModal && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <div style={modalStyles.modalHeader}>
                            <h4>Edit User</h4>
                            <span 
                                style={modalStyles.closeButton} 
                                onClick={closeEditUserModal}
                                onMouseOver={(e) => e.target.style.color = modalStyles.closeButtonHover.color}
                                onMouseOut={(e) => e.target.style.color = modalStyles.closeButton.color}
                            >&times;</span>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="mb-3">
                                <label htmlFor="edit-user-username" className="form-label">Username</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="edit-user-username"
                                    value={editUserForm.username}
                                    onChange={handleEditUserChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="edit-user-fullName" className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="edit-user-fullName"
                                    value={editUserForm.fullName}
                                    onChange={handleEditUserChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="edit-user-role" className="form-label">Role</label>
                                <select 
                                    className="form-select" 
                                    id="edit-user-role"
                                    value={editUserForm.role}
                                    onChange={handleEditUserChange}
                                    required
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="edit-user-branch" className="form-label">Branch</label>
                                <select 
                                    className="form-select" 
                                    id="edit-user-branch"
                                    value={editUserForm.branch}
                                    onChange={handleEditUserChange}
                                    required
                                >
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={modalStyles.modalFooter}>
                                <button type="button" className="btn btn-secondary me-2" onClick={closeEditUserModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete User Modal */}
            {showDeleteUserModal && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <div style={modalStyles.modalHeader}>
                            <h4>Delete User</h4>
                            <span 
                                style={modalStyles.closeButton} 
                                onClick={closeDeleteUserModal}
                                onMouseOver={(e) => e.target.style.color = modalStyles.closeButtonHover.color}
                                onMouseOut={(e) => e.target.style.color = modalStyles.closeButton.color}
                            >&times;</span>
                        </div>
                        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        <div style={modalStyles.modalFooter}>
                            <button type="button" className="btn btn-secondary me-2" onClick={closeDeleteUserModal}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleDeleteUser}>Delete User</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Pending Users Modal */}
            {showPendingUsersModal && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <div style={modalStyles.modalHeader}>
                            <h4>Pending Users</h4>
                            <span 
                                style={modalStyles.closeButton} 
                                onClick={closePendingUsersModal}
                                onMouseOver={(e) => e.target.style.color = modalStyles.closeButtonHover.color}
                                onMouseOut={(e) => e.target.style.color = modalStyles.closeButton.color}
                            >&times;</span>
                        </div>
                        {pendingUsers.length === 0 ? (
                            <p>No pending users waiting for confirmation.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Full Name</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.email}</td>
                                                <td>{user.fullName}</td>
                                                <td>{getRoleDisplayName(user.role)}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-success me-2"
                                                        onClick={() => handleManualConfirmation(user.id)}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeletePendingUser(user.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div style={modalStyles.modalFooter}>
                            <button type="button" className="btn btn-secondary" onClick={closePendingUsersModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add Role Modal */}
            {showAddRoleModal && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <div style={modalStyles.modalHeader}>
                            <h4>Add New Role</h4>
                            <span 
                                style={modalStyles.closeButton}
                                onClick={closeAddRoleModal}
                                onMouseOver={(e) => e.target.style.color = modalStyles.closeButtonHover.color}
                                onMouseOut={(e) => e.target.style.color = modalStyles.closeButton.color}
                            >&times;</span>
                        </div>
                        <form onSubmit={handleAddRole}>
                            <div className="mb-3">
                                <label htmlFor="new-role" className="form-label">Role Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="new-role"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    required
                                />
                                <div className="form-text">This will create a role ID based on the name</div>
                            </div>
                            <div style={modalStyles.modalFooter}>
                                <button type="button" className="btn btn-secondary me-2" onClick={closeAddRoleModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Add Branch Modal */}
            {showAddBranchModal && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <div style={modalStyles.modalHeader}>
                            <h4>Add New Branch</h4>
                            <span 
                                style={modalStyles.closeButton}
                                onClick={closeAddBranchModal}
                                onMouseOver={(e) => e.target.style.color = modalStyles.closeButtonHover.color}
                                onMouseOut={(e) => e.target.style.color = modalStyles.closeButton.color}
                            >&times;</span>
                        </div>
                        <form onSubmit={handleAddBranch}>
                            <div className="mb-3">
                                <label htmlFor="new-branch" className="form-label">Branch Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="new-branch"
                                    value={newBranch}
                                    onChange={(e) => setNewBranch(e.target.value)}
                                    required
                                />
                                <div className="form-text">This will create a branch ID based on the name</div>
                            </div>
                            <div style={modalStyles.modalFooter}>
                                <button type="button" className="btn btn-secondary me-2" onClick={closeAddBranchModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Branch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;