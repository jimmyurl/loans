import React, { useState, useEffect, useContext } from 'react';
import { AlertContext } from '../context/AlertContext';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import LoanTable from '../components/LoanTable';
import { getDisbursements } from '../services/loans';
import { formatCurrency, formatDate } from '../utils/formatters';

const Disbursements = () => {
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', date: 'all' });
  const { setAlert } = useContext(AlertContext);

  useEffect(() => {
    const fetchDisbursements = async () => {
      try {
        const data = await getDisbursements(filter);
        setDisbursements(data);
        setLoading(false);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Failed to load disbursements. Please try again later.'
        });
        setLoading(false);
      }
    };

    fetchDisbursements();
  }, [filter, setAlert]);

  const stats = [
    { 
      title: 'Total Disbursed', 
      value: formatCurrency(disbursements.reduce((sum, item) => sum + item.amount, 0)),
      icon: 'cash',
      change: '+5.2%',
      timeframe: 'from last month'
    },
    { 
      title: 'Pending Disbursements', 
      value: disbursements.filter(d => d.status === 'pending').length,
      icon: 'clock',
      change: '-2.3%',
      timeframe: 'from last month'
    },
    { 
      title: 'Avg. Disbursement', 
      value: formatCurrency(
        disbursements.length > 0 
          ? disbursements.reduce((sum, item) => sum + item.amount, 0) / disbursements.length 
          : 0
      ),
      icon: 'chart-bar',
      change: '+1.8%',
      timeframe: 'from last month'
    }
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Client', accessor: 'clientName' },
    { header: 'Loan ID', accessor: 'loanId' },
    { 
      header: 'Amount', 
      accessor: 'amount',
      cell: (row) => formatCurrency(row.amount)
    },
    { 
      header: 'Date', 
      accessor: 'date',
      cell: (row) => formatDate(row.date)
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleViewDetails(row.id)}
          >
            View
          </button>
          {row.status === 'pending' && (
            <button 
              className="text-green-600 hover:text-green-800"
              onClick={() => handleApprove(row.id)}
            >
              Approve
            </button>
          )}
        </div>
      )
    }
  ];

  const handleApprove = (id) => {
    // Implementation for approving a disbursement
    console.log(`Approve disbursement: ${id}`);
  };

  const handleViewDetails = (id) => {
    // Implementation for viewing disbursement details
    console.log(`View disbursement: ${id}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Loan Disbursements</h1>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => console.log('Create new disbursement')}
          >
            New Disbursement
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          </div>
          <div className="p-4 flex flex-wrap gap-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                name="date"
                value={filter.date}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <LoanTable 
            columns={columns} 
            data={disbursements} 
            loading={loading} 
            emptyMessage="No disbursements found."
          />
        </div>
      </div>
    </Layout>
  );
};

export default Disbursements;