import React, { useState, useEffect, useContext } from 'react';
import { AlertContext } from '../context/AlertContext';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import LoanTable from '../components/LoanTable';
import { getRepayments } from '../services/loans';
import { formatCurrency, formatDate } from '../utils/formatters';

const Repayments = () => {
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', date: 'all', overdue: 'all' });
  const { setAlert } = useContext(AlertContext);

  useEffect(() => {
    const fetchRepayments = async () => {
      try {
        const data = await getRepayments(filter);
        setRepayments(data);
        setLoading(false);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Failed to load repayments. Please try again later.'
        });
        setLoading(false);
      }
    };

    fetchRepayments();
  }, [filter, setAlert]);

  const stats = [
    { 
      title: 'Total Repaid', 
      value: formatCurrency(repayments.reduce((sum, item) => sum + item.amount, 0)),
      icon: 'cash',
      change: '+8.1%',
      timeframe: 'from last month'
    },
    { 
      title: 'Overdue Payments', 
      value: repayments.filter(r => r.status === 'overdue').length,
      icon: 'exclamation',
      change: '-3.4%',
      timeframe: 'from last month'
    },
    { 
      title: 'Collection Rate', 
      value: '92.7%',
      icon: 'chart-pie',
      change: '+1.5%',
      timeframe: 'from last month'
    }
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Client', accessor: 'clientName' },
    { header: 'Loan ID', accessor: 'loanId' },
    { 
      header: 'Due Amount', 
      accessor: 'dueAmount',
      cell: (row) => formatCurrency(row.dueAmount)
    },
    { 
      header: 'Paid Amount', 
      accessor: 'paidAmount',
      cell: (row) => formatCurrency(row.paidAmount)
    },
    { 
      header: 'Due Date', 
      accessor: 'dueDate',
      cell: (row) => formatDate(row.dueDate)
    },
    { 
      header: 'Payment Date', 
      accessor: 'paymentDate',
      cell: (row) => row.paymentDate ? formatDate(row.paymentDate) : '—'
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'paid' ? 'bg-green-100 text-green-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'overdue' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
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
          {(row.status === 'pending' || row.status === 'overdue') && (
            <button 
              className="text-green-600 hover:text-green-800"
              onClick={() => handleRecordPayment(row.id)}
            >
              Record Payment
            </button>
          )}
        </div>
      )
    }
  ];

  const handleRecordPayment = (id) => {
    // Implementation for recording a payment
    console.log(`Record payment for: ${id}`);
  };

  const handleViewDetails = (id) => {
    // Implementation for viewing repayment details
    console.log(`View repayment: ${id}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Loan Repayments</h1>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => console.log('Record new repayment')}
          >
            Record Repayment
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial Payment</option>
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
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Overdue</label>
              <select
                name="overdue"
                value={filter.overdue}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All</option>
                <option value="yes">Overdue Only</option>
                <option value="no">Not Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <LoanTable 
            columns={columns} 
            data={repayments} 
            loading={loading} 
            emptyMessage="No repayments found."
          />
        </div>
      </div>
    </Layout>
  );
};

export default Repayments;