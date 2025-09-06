import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { ChapterContext } from '../context/ChapterContext';
import ChapterManager from '../components/ChapterManager';

function DashboardPage() {
  const navigate = useNavigate();
  const { activeChapter, isLoadingChapters } = useContext(ChapterContext);
  
  const [user, setUser] = useState(null);
  const [personalBalance, setPersonalBalance] = useState(0);
  const [centralBalance, setCentralBalance] = useState(0);
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (currentUser, chapter) => {
    if (!currentUser || !chapter) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const api = axios.create({ headers: { Authorization: `Bearer ${currentUser.token}` } });
      const chapterId = chapter._id;

      const [membershipRes, historyRes, statsRes] = await Promise.all([
        api.get(`/api/chapters/${chapterId}/users/me/membership`),
        api.get(`/api/chapters/${chapterId}/history`),
        api.get(`/api/chapters/${chapterId}/stats/central-balance`),
      ]);
      
      setPersonalBalance(membershipRes.data.balance);
      setHistoryItems(historyRes.data);
      setCentralBalance(statsRes.data.centralBalance);

    } catch (error) {
      console.error('Failed to fetch user dashboard data:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('activeChapterId');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.token) {
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('activeChapterId');
    navigate('/login');
  };

  if (isLoadingChapters || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-handwritten text-3xl dark:bg-gray-900 dark:text-gray-200">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-handwritten text-blue-600 dark:text-blue-400">Dashboard</h1>
        <div className="order-3 sm:order-2 w-full sm:w-auto">
          <ChapterManager />
        </div>
        <div className="flex items-center gap-4 order-2 sm:order-3">
          <span className="font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">
            Welcome, {user.name}!
          </span>
          <ThemeToggle />
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 font-semibold transition-colors">
            Logout
          </button>
        </div>
      </header>
      <main className="p-4 sm:p-8 flex-grow">
        {isLoading ? (
          <p className="text-center dark:text-gray-300">Loading Chapter Data...</p>
        ) : !activeChapter ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Please create or select a chapter to begin.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-purple-500 text-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold opacity-80">Personal Balance</h2>
                <p className="text-5xl font-bold mt-2">{personalBalance.toFixed(2)} <span className="text-3xl opacity-80">TK</span></p>
              </div>
              <div className="bg-cyan-500 text-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold opacity-80">Central Balance</h2>
                <p className="text-5xl font-bold mt-2">{centralBalance.toFixed(2)} <span className="text-3xl opacity-80">TK</span></p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-handwritten text-blue-600 dark:text-blue-400 mb-4 border-b-2 dark:border-gray-700 pb-2">Recent History</h2>
              <ul className="space-y-4">
                {historyItems.length > 0 ? historyItems.slice(0, 5).map(item => (
                  <li key={item._id}>
                    {item.type === 'TRANSACTION' 
                      ? <TransactionHistoryItem transaction={item.data} /> 
                      : <ActivityHistoryItem activity={item.data} />
                    }
                  </li>
                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">You have no history yet.</p>}
              </ul>
              <Link to="/history" className="block text-center mt-6 text-blue-500 dark:text-blue-400 font-semibold hover:underline">
                View Full History &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


// --- Helper Components for the History List ---
const TransactionHistoryItem = ({ transaction }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userIsParticipant = transaction.participants.some(p => p._id === user._id);

  let costText = `Total: ${transaction.totalAmount.toFixed(2)} TK`;
  if (userIsParticipant) {
    const userShareDetail = transaction.splitDetails.find(d => d.user._id === user._id);
    if (userShareDetail) {
      costText = `Your Share: -${userShareDetail.amount.toFixed(2)} TK`;
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div>
        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{transaction.description}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Paid by: {transaction.creator.name}</p>
      </div>
      <p className={`font-bold text-xl ${userIsParticipant ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>{costText}</p>
    </div>
  );
};


const ActivityHistoryItem = ({ activity }) => {
  const isAdd = activity.type === 'ADD_BALANCE';
  return (
    <div className={`p-4 rounded-xl flex justify-between items-center ${isAdd ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                {isAdd ? 'Balance Added' : 'Balance Removed'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
        </div>
        <p className={`font-bold text-xl ${isAdd ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {isAdd ? '+' : '-'}{activity.amount.toFixed(2)} TK
        </p>
    </div>
  );
};

export default DashboardPage;