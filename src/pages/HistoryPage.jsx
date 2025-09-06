import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api'; // UPDATED: Import the configured API instance
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import { ChapterContext } from '../context/ChapterContext';

function HistoryPage() {
  const { activeChapter, isLoadingChapters } = useContext(ChapterContext);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
      } else {
        navigate('/login');
      }
    } catch (error) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || !activeChapter) {
      if (!isLoadingChapters) {
        setIsLoading(false);
        setHistory([]);
      }
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // UPDATED: Use the central API instance and no '/api' prefix
        const res = await API.get(`/chapters/${activeChapter._id}/history`);
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, activeChapter, isLoadingChapters]);

  if (isLoading || !user) {
    return <div className="p-8 font-handwritten text-3xl text-center dark:bg-gray-900 dark:text-gray-200">Loading History...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-sans flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="text-blue-500 dark:text-blue-400 hover:underline font-semibold">
          &larr; Back to Dashboard
        </Link>
        <ThemeToggle />
      </header>
      
      <main className="max-w-4xl mx-auto w-full flex-grow">
        <h1 className="text-4xl font-handwritten text-blue-600 dark:text-blue-400 text-center mb-8">
            Full History for {activeChapter ? `"${activeChapter.name}"` : '...'}
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <ul className="space-y-6">
            {history.length > 0 ? history.map(item => (
                <li key={item._id}>
                {item.type === 'TRANSACTION' ? (
                    <TransactionCard transaction={item.data} user={user} activeChapterId={activeChapter?._id} />
                ) : (
                    <ActivityCard activity={item.data} user={user} activeChapterId={activeChapter?._id} />
                )}
                </li>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-12">No history to display for this chapter.</p>}
            </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- Helper Components ---
const TransactionCard = ({ transaction, user, activeChapterId }) => {
  const handleDelete = async (id) => {
    if (!activeChapterId) {
        alert("Cannot delete: No active chapter found.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this transaction? This will revert the funds.')) {
        try {
            // UPDATED: Use the central API instance and no '/api' prefix
            await API.delete(`/chapters/${activeChapterId}/transactions/${id}`);
            alert('Transaction deleted. The page will now refresh to show changes.');
            window.location.reload();
        } catch (error) {
            alert(`Error: ${error.response.data.message}`);
        }
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex justify-between items-start border-b dark:border-gray-700 pb-2 mb-3">
        <div>
          <p className="font-bold text-xl text-gray-800 dark:text-gray-100">{transaction.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid by: {transaction.creator.name}</p>
        </div>
        <div className="text-right flex-shrink-0 flex items-start gap-4">
            <div>
                <p className="font-bold text-2xl text-gray-700 dark:text-gray-200">{transaction.totalAmount.toFixed(2)} TK</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
            {user.role === 'admin' && <button onClick={() => handleDelete(transaction._id)} className="text-red-500 hover:text-red-700 font-bold p-1">X</button>}
        </div>
      </div>
      <div>
        {transaction.items && transaction.items.length > 0 && (
            <div className="mb-3">
                <h4 className="font-semibold mb-2 dark:text-gray-200">Items:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 pl-2 space-y-1">
                {transaction.items.map((item, index) => ( <li key={index}>{item.name} - {item.price.toFixed(2)} TK</li> ))}
                </ul>
            </div>
        )}
        
        {transaction.splitType === 'manual' ? (
            <div>
                <h4 className="font-semibold mb-2 dark:text-gray-200">Participants (Manual Split):</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 pl-2 space-y-1">
                    {transaction.splitDetails.map(detail => (
                        <li key={detail.user._id}>{detail.user.name} - {detail.amount.toFixed(2)} TK</li>
                    ))}
                </ul>
            </div>
        ) : (
            <div>
                <h4 className="font-semibold mb-2 dark:text-gray-200">Participants (Equal Split):</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 pl-2 space-y-1">
                    {transaction.splitDetails.map(detail => (
                        <li key={detail.user._id}>{detail.user.name} - {detail.amount.toFixed(2)} TK</li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

const ActivityCard = ({ activity, user, activeChapterId }) => {
  const isAdd = activity.type === 'ADD_BALANCE';
  
  const handleDelete = async (id) => {
    if (!activeChapterId) {
        alert("Cannot delete: No active chapter found.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this activity? This will revert the balance change.')) {
        try {
            // UPDATED: Use the central API instance and no '/api' prefix
            await API.delete(`/chapters/${activeChapterId}/activities/${id}`);
            alert('Activity deleted. The page will now refresh to show changes.');
            window.location.reload();
        } catch (error) {
            alert(`Error: ${error.response.data.message}`);
        }
    }
  };

  return (
    <div className={`border-l-4 ${isAdd ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'} rounded-r-lg p-4`}>
       <div className="flex justify-between items-center">
        <div>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{isAdd ? 'Balance Added' : 'Balance Removed'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Funds were {isAdd ? 'added to' : 'removed from'} <span className="font-semibold">{activity.targetUser.name}</span>.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className={`font-bold text-2xl ${isAdd ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{isAdd ? '+' : '-'}{activity.amount.toFixed(2)} TK</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.createdAt).toLocaleString()}</p>
            </div>
            {user.role === 'admin' && <button onClick={() => handleDelete(activity._id)} className="text-red-500 hover:text-red-700 font-bold p-1">X</button>}
        </div>
       </div>
    </div>
  );
};

export default HistoryPage;