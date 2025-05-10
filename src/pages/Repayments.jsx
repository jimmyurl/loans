import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfihpvkbzppaejluyqoq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWhwdmtienBwYWVqbHV5cW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NDQzMzgsImV4cCI6MjA0NDEyMDMzOH0.U30_ovXdjGrovUZhBeVbeXtX-Xg29BPNZF9mhz7USfM';
const supabase = createClient(supabaseUrl, supabaseKey);

const Repayments = () => {
    const [activeSubTab, setActiveSubTab] = useState('due-repayments');
    const [dueRepayments, setDueRepayments] = useState([]);
    const [recentRepayments, setRecentRepayments] = useState([]);
    const [overdueRepayments, setOverdueRepayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // CSS styles for tab transitions (copied from Settings.jsx)
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

    useEffect(() => {
        fetchRepaymentsData();
    }, []);

    const fetchRepaymentsData = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: due, error: dueError } = await supabase
                .from('due_repayments') // Replace with your actual table name
                .select('*');

            if (dueError) throw dueError;
            setDueRepayments(due);

            const { data: recent, error: recentError } = await supabase
                .from('recent_repayments') // Replace with your actual table name
                .select('*');

            if (recentError) throw recentError;
            setRecentRepayments(recent);

            const { data: overdue, error: overdueError } = await supabase
                .from('overdue_repayments') // Replace with your actual table name
                .select('*');

            if (overdueError) throw overdueError;
            setOverdueRepayments(overdue);

        } catch (err) {
            setError(err.message || 'Failed to fetch repayments data.');
            console.error('Error fetching repayments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveSubTab(tab);
    };

    const handleCollectPayment = (repayment) => {
        // Implement your logic to handle payment collection
        console.log('Collect payment for:', repayment);
    };

    return (
        <div className="repayments-page">
            <h2>Loan Repayments</h2>

            <div className="tab-container" style={tabStyles.tabContainer}>
                <div className="tab-buttons" style={tabStyles.tabButtons}>
                    <button
                        className={`tab-button ${activeSubTab === 'due-repayments' ? 'active' : ''}`}
                        style={{
                            ...tabStyles.tabButton,
                            ...(activeSubTab === 'due-repayments' ? tabStyles.activeTabButton : {})
                        }}
                        onClick={() => handleTabChange('due-repayments')}
                    >
                        Due Repayments
                    </button>
                    <button
                        className={`tab-button ${activeSubTab === 'recent-repayments' ? 'active' : ''}`}
                        style={{
                            ...tabStyles.tabButton,
                            ...(activeSubTab === 'recent-repayments' ? tabStyles.activeTabButton : {})
                        }}
                        onClick={() => handleTabChange('recent-repayments')}
                    >
                        Recent Repayments
                    </button>
                    <button
                        className={`tab-button ${activeSubTab === 'overdue-repayments' ? 'active' : ''}`}
                        style={{
                            ...tabStyles.tabButton,
                            ...(activeSubTab === 'overdue-repayments' ? tabStyles.activeTabButton : {})
                        }}
                        onClick={() => handleTabChange('overdue-repayments')}
                    >
                        Overdue Repayments
                    </button>
                </div>

                {loading && <p>Loading repayments data...</p>}
                {error && <p className="error-message">Error: {error}</p>}

                {/* Due Repayments Tab Content */}
                <div
                    id="due-repayments"
                    className={`tab-content ${activeSubTab === 'due-repayments' ? 'active' : ''}`}
                    style={{
                        ...tabStyles.tabContent,
                        ...(activeSubTab === 'due-repayments' ? tabStyles.activeTabContent : {})
                    }}
                >
                    <h3>Due Repayments</h3>
                    {dueRepayments.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Loan ID</th>
                                        <th>Client Name</th>
                                        <th>Due Date</th>
                                        <th>Installment Amount</th>
                                        <th>Outstanding Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dueRepayments.map((repayment) => (
                                        <tr key={repayment.id}>
                                            <td>{repayment.loan_id}</td>
                                            <td>{repayment.client_name}</td>
                                            <td>{repayment.due_date}</td>
                                            <td>{repayment.installment_amount}</td>
                                            <td>{repayment.outstanding_balance}</td>
                                            <td><span className={`status-tag ${repayment.status?.toLowerCase()}`}>{repayment.status}</span></td>
                                            <td>
                                                <button
                                                    className="action-button collect-button"
                                                    onClick={() => handleCollectPayment(repayment)}
                                                >
                                                    Collect Payment
                                                </button>
                                                <button className="action-button view-button">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No due repayments found.</p>
                    )}
                </div>

                {/* Recent Repayments Tab Content */}
                <div
                    id="recent-repayments"
                    className={`tab-content ${activeSubTab === 'recent-repayments' ? 'active' : ''}`}
                    style={{
                        ...tabStyles.tabContent,
                        ...(activeSubTab === 'recent-repayments' ? tabStyles.activeTabContent : {})
                    }}
                >
                    <h3>Recent Repayments</h3>
                    {recentRepayments.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Repayment ID</th>
                                        <th>Loan ID</th>
                                        <th>Client Name</th>
                                        <th>Payment Date</th>
                                        <th>Amount Paid</th>
                                        <th>Payment Method</th>
                                        {/* Add more columns as needed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRepayments.map((repayment) => (
                                        <tr key={repayment.id}>
                                            <td>{repayment.id}</td>
                                            <td>{repayment.loan_id}</td>
                                            <td>{repayment.client_name}</td>
                                            <td>{repayment.payment_date}</td>
                                            <td>{repayment.amount_paid}</td>
                                            <td>{repayment.payment_method}</td>
                                            {/* Add more data cells as needed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No recent repayments found.</p>
                    )}
                </div>

                {/* Overdue Repayments Tab Content */}
                <div
                    id="overdue-repayments"
                    className={`tab-content ${activeSubTab === 'overdue-repayments' ? 'active' : ''}`}
                    style={{
                        ...tabStyles.tabContent,
                        ...(activeSubTab === 'overdue-repayments' ? tabStyles.activeTabContent : {})
                    }}
                >
                    <h3>Overdue Repayments</h3>
                    {overdueRepayments.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Loan ID</th>
                                        <th>Client Name</th>
                                        <th>Due Date</th>
                                        <th>Installment Amount</th>
                                        <th>Outstanding Balance</th>
                                        <th>Days Overdue</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueRepayments.map((repayment) => (
                                        <tr key={repayment.id}>
                                            <td>{repayment.loan_id}</td>
                                            <td>{repayment.client_name}</td>
                                            <td>{repayment.due_date}</td>
                                            <td>{repayment.installment_amount}</td>
                                            <td>{repayment.outstanding_balance}</td>
                                            <td>{repayment.days_overdue}</td> {/* Assuming this field exists */}
                                            <td><span className={`status-tag overdue ${repayment.status?.toLowerCase()}`}>{repayment.status}</span></td>
                                            <td>
                                                <button className="action-button remind-button">Remind</button>
                                                <button className="action-button view-button">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No overdue repayments found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Repayments;