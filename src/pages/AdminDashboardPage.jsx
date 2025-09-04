import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import { ChapterContext } from '../context/ChapterContext';
import ChapterManager from '../components/ChapterManager';

function AdminDashboardPage() {
  const { activeChapter, isLoadingChapters } = useContext(ChapterContext);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ centralBalance: 0 });
  const [users, setUsers] = useState([]); // This will now only contain members
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('activeChapterId');
    navigate('/login');
  }, [navigate]);

  const fetchData = useCallback(async (currentUser, chapter) => {
    if (!currentUser || !chapter) {
      setUsers([]);
      setTransactions([]);
      setStats({ centralBalance: 0 });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const api = axios.create({ headers: { Authorization: `Bearer ${currentUser.token}` } });
      const chapterId = chapter._id;

      const [statsRes, usersRes, historyRes] = await Promise.all([
        api.get(`/api/chapters/${chapterId}/stats/central-balance`),
        api.get(`/api/chapters/${chapterId}/users`), // Now only returns members
        api.get(`/api/chapters/${chapterId}/history`),
      ]);
      
      setStats(statsRes.data);
      setTransactions(historyRes.data.filter(item => item.type === 'TRANSACTION').map(item => item.data));
      setUsers(usersRes.data); // No need to filter here anymore

    } catch (error) {
      console.error("Failed to fetch admin data for chapter", error);
      if (error.response && error.response.status === 401) handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.token || storedUser.role !== 'admin') {
      navigate('/login');
    } else {
      setUser(storedUser);
      if (activeChapter) {
        fetchData(storedUser, activeChapter);
      } else if (!isLoadingChapters) {
        setIsLoading(false);
      }
    }
  }, [navigate, fetchData, activeChapter, isLoadingChapters]);

  const refreshData = useCallback(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    fetchData(storedUser, activeChapter);
  }, [fetchData, activeChapter]);

  if (isLoadingChapters || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 font-handwritten text-3xl text-center dark:bg-gray-900 dark:text-gray-200">
        Loading Admin Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-handwritten text-blue-600 dark:text-blue-400">Admin Dashboard</h1>
        <div className="order-3 sm:order-2 w-full sm:w-auto">
          <ChapterManager />
        </div>
        <div className="flex items-center gap-4 order-2 sm:order-3">
          <ThemeToggle />
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 font-semibold transition-colors">Logout</button>
        </div>
      </header>
      <main className="p-4 sm:p-8 flex-grow">
        {isLoading ? (
            <p className="text-center dark:text-gray-300">Loading Chapter Data...</p>
        ) : activeChapter ? (
            // --- FIX: Reordered layout for mobile-first view ---
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Right Column (now appears first in code for mobile order) */}
              <div className="lg:col-start-3 lg:col-span-1 space-y-8">
                <StatsCard centralBalance={stats.centralBalance} />
                <UserBalances users={users} />
              </div>

              {/* Left Column (now appears second for mobile order) */}
              <div className="lg:col-span-2 lg:row-start-1 space-y-8">
                <FundManagement users={users} token={user.token} refreshData={refreshData} activeChapterId={activeChapter._id} />
                <AdminAddExpense />
                <TransactionHistory transactions={transactions} token={user.token} refreshData={refreshData} activeChapterId={activeChapter._id} />
              </div>
            </div>
        ) : (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome, Admin!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Create or select a chapter to get started.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// --- Sub-components ---
const StatsCard = React.memo(function StatsCard({ centralBalance }) {
    return (
        <div className="bg-cyan-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold opacity-80">Central Balance</h2>
          <p className="text-5xl font-bold mt-2">{centralBalance.toFixed(2)} <span className="text-3xl opacity-80">TK</span></p>
        </div>
    );
});

const UserBalances = React.memo(function UserBalances({ users }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-handwritten text-blue-600 dark:text-blue-400 mb-4 border-b-2 dark:border-gray-700 pb-2">User Balances</h2>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {users.map(u => (
              <li key={u._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{u.name}</span>
                <span className={`font-bold ${u.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>{u.balance.toFixed(2)} TK</span>
              </li>
            ))}
          </ul>
        </div>
    );
});

const FundManagement = React.memo(function FundManagement({ users, token, refreshData, activeChapterId }) {
    const [selectedUser, setSelectedUser] = useState('');
    const [operation, setOperation] = useState('add');
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!selectedUser || !amount || amount <= 0) { return alert('Please select a user and enter a valid amount.'); }
      const url = `/api/chapters/${activeChapterId}/users/${selectedUser}/${operation}-balance`;
      try {
        const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });
        await api.post(url, { amount: Number(amount) });
        alert('Funds managed successfully!');
        await refreshData();
        setSelectedUser('');
        setAmount('');
      } catch (error) { alert(`Error: ${error.response.data.message}`); }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-handwritten text-green-600 dark:text-green-400 mb-4">Fund Management</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full px-3 py-3 border-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 rounded-lg" required>
            <option value="">Select User</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <select value={operation} onChange={e => setOperation(e.target.value)} className="w-full px-3 py-3 border-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 rounded-lg">
            <option value="add">Add Balance</option>
            <option value="remove">Remove Balance</option>
          </select>
          <input type="number" step="0.01" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-3 border-2 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg" required />
          <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-handwritten text-2xl">Done</button>
        </form>
      </div>
    );
});

const AdminAddExpense = React.memo(function AdminAddExpense() {
    return (
       <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
         <h2 className="text-3xl font-handwritten text-purple-600 dark:text-purple-400 mb-4">Add Expense</h2>
         <p className="text-gray-500 dark:text-gray-400 mb-4">Create a new expense on behalf of any user.</p>
         <Link to="/admin/add-expense" className="w-full inline-block bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors font-handwritten text-2xl">
              Go to Add Expense Page
         </Link>
       </div>
    );
});

const TransactionHistory = React.memo(function TransactionHistory({ transactions, token, refreshData, activeChapterId }) {
    const handleDelete = async (transactionId) => {
      if (window.confirm('Are you sure you want to delete this transaction? This will revert the funds.')) {
        try {
          const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });
          await api.delete(`/api/chapters/${activeChapterId}/transactions/${transactionId}`);
          alert('Transaction deleted.');
          await refreshData();
        } catch (error) { alert(`Error: ${error.response.data.message}`); }
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-handwritten text-blue-600 dark:text-blue-400 mb-4 border-b-2 dark:border-gray-700 pb-2">Full Transaction History</h2>
        {transactions.length > 0 ? (
          <ul className="space-y-3 max-h-[200px] overflow-y-auto">
            {transactions.slice(0, 5).map(t => (
              <li key={t._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{t.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-700 dark:text-gray-200">{t.totalAmount.toFixed(2)} TK</span>
                  <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 font-bold">X</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions in this chapter yet.</p>
        )}
         <Link to="/history" className="block text-center mt-4 text-blue-500 dark:text-blue-400 font-semibold hover:underline">
              View Full History &rarr;
          </Link>
      </div>
    );
});

export default AdminDashboardPage;