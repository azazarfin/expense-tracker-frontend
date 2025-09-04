import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { ChapterContext } from '../context/ChapterContext';
import api from '../api'; // Import the centralized API client

const DashboardPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { activeChapter } = useContext(ChapterContext);

    useEffect(() => {
        const fetchData = async () => {
            if (activeChapter) {
                setIsLoading(true);
                try {
                    // --- FIX: Use the centralized api instance ---
                    const res = await api.get(`/api/transactions/chapter/${activeChapter._id}`);
                    setTransactions(res.data);
                } catch (err) {
                    console.error('Failed to fetch transactions', err);
                    toast.error('Failed to fetch transactions');
                }
                setIsLoading(false);
            }
        };
        fetchData();
    }, [activeChapter]);

    const addTransaction = async (e) => {
        e.preventDefault();
        if (text.trim() === '' || amount === 0) {
            toast.error('Please add a text and amount');
            return;
        }

        const newTransaction = {
            text,
            amount: +amount,
        };

        try {
            // --- FIX: Use the centralized api instance ---
            const res = await api.post(`/api/transactions/chapter/${activeChapter._id}`, newTransaction);
            setTransactions([...transactions, res.data]);
            setText('');
            setAmount(0);
            toast.success('Transaction added');
        } catch (err) {
            console.error('Failed to add transaction', err);
            toast.error('Failed to add transaction');
        }
    };

    const deleteTransaction = async (id) => {
        try {
            // --- FIX: Use the centralized api instance ---
            await api.delete(`/api/transactions/${id}`);
            setTransactions(transactions.filter((transaction) => transaction._id !== id));
            toast.success('Transaction deleted');
        } catch (err) {
            console.error('Failed to delete transaction', err);
            toast.error('Failed to delete transaction');
        }
    };

    const amounts = transactions.map((transaction) => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter((item) => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Expense Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h4 className="font-bold">Income</h4>
                    <p className="text-green-500 text-2xl">+${income}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h4 className="font-bold">Expense</h4>
                    <p className="text-red-500 text-2xl">-${expense}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                <h3 className="text-xl font-bold border-b pb-2 mb-2">History</h3>
                <ul className="space-y-2">
                    {transactions.map((transaction) => (
                        <li
                            key={transaction._id}
                            className={`flex justify-between items-center p-2 rounded-lg ${
                                transaction.amount < 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
                            }`}
                        >
                            <span>{transaction.text}</span>
                            <span>
                                {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
                            </span>
                            <button onClick={() => deleteTransaction(transaction._id)} className="ml-4 text-red-500">
                                x
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold border-b pb-2 mb-2">Add new transaction</h3>
                <form onSubmit={addTransaction}>
                    <div className="mb-2">
                        <label className="block mb-1">Text</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">
                            Amount <br />
                            (negative - expense, positive - income)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button className="w-full p-2 bg-indigo-600 text-white rounded">Add transaction</button>
                </form>
            </div>
        </div>
    );
};

export default DashboardPage;