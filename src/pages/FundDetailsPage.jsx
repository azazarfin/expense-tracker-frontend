import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { ChapterContext } from '../context/ChapterContext';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';

function FundDetailsPage() {
  const { activeChapter } = useContext(ChapterContext);
  const [fundDetails, setFundDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAdded, setTotalAdded] = useState(0);

  useEffect(() => {
    if (activeChapter) {
      const fetchFundDetails = async () => {
        try {
          const { data } = await API.get(`/chapters/${activeChapter._id}/stats/fund-details`);
          setFundDetails(data);
          const total = data.reduce((sum, user) => sum + user.totalAdded, 0);
          setTotalAdded(total);
        } catch (error) {
          console.error("Failed to fetch fund details", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFundDetails();
    }
  }, [activeChapter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-sans flex flex-col">
      <header className="mb-8 flex justify-between items-center w-full max-w-4xl mx-auto">
        <Link to="/admin/dashboard" className="text-blue-500 dark:text-blue-400 hover:underline font-semibold">&larr; Back to Dashboard</Link>
        <ThemeToggle />
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow">
        <h1 className="text-4xl font-handwritten text-blue-600 dark:text-blue-400 text-center mb-8">Fund Details for {activeChapter?.name}</h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">Total Amount Added</h2>
            <p className="text-5xl font-bold text-center text-green-500 mt-2">{totalAdded.toFixed(2)} TK</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-handwritten text-gray-700 dark:text-gray-200 mb-4">Total Added Balance</h2>
          {isLoading ? <p>Loading...</p> : (
            <ul className="space-y-4">
              {fundDetails.map(user => (
                <li key={user.userId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{user.userName}</span>
                  <span className="font-bold text-green-500">{user.totalAdded.toFixed(2)} TK</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default FundDetailsPage;