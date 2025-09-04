import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import { ChapterContext } from '../context/ChapterContext';

function AdminAddExpensePage() {
  const { activeChapter } = useContext(ChapterContext);
  const [allUsers, setAllUsers] = useState([]);
  const [splitType, setSplitType] = useState('equal');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Form State
  const [creatorId, setCreatorId] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }]);
  const [participants, setParticipants] = useState([]); // For equal split
  const [manualSplits, setManualSplits] = useState({}); // For manual split

  const fetchUsers = useCallback(async () => {
    if (!user?.token || !activeChapter) return;

    try {
      const api = axios.create({ headers: { Authorization: `Bearer ${user.token}` } });
      const res = await api.get(`/api/chapters/${activeChapter._id}/users`);
      
      const filteredUsers = res.data.filter(u => u._id !== user._id);
      setAllUsers(filteredUsers);
    } catch (error) { 
      console.error("Failed to fetch users for chapter", error); 
    }
  }, [user?.token, user?._id, activeChapter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- FORM HANDLERS ---
  const handleItemChange = (index, event) => {
    const newItems = items.map((item, i) => {
        if (i === index) {
            return { ...item, [event.target.name]: event.target.value };
        }
        return item;
    });
    setItems(newItems);
  };
  const addItemField = () => setItems([...items, { name: '', price: '' }]);
  
  const handleParticipantChange = (userId) => {
    setParticipants(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleManualSplitChange = (userId, value) => {
    setManualSplits(prev => ({ ...prev, [userId]: value }));
  };
  
  const calculatedTotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeChapter) {
        return alert("Cannot create an expense without an active chapter selected.");
    }
    
    let payload;
    const description = items.map(item => item.name.trim()).filter(Boolean).join(', ');
    
    if (calculatedTotal <= 0) { return alert("Please add items with prices to create an expense."); }
    if (!creatorId) { return alert("Please select who paid for the expense."); }

    if (splitType === 'equal') {
      if (participants.length === 0) { return alert("Please select at least one person to split with for an equal split."); }
      payload = { creatorId, description, totalAmount: calculatedTotal, items: items.filter(item => item.name && item.price), participants };
    } else { // Manual Split
      const manualParticipants = Object.entries(manualSplits).filter(([, amount]) => Number(amount) > 0).map(([userId, amount]) => ({ userId, amount: Number(amount) }));
      if (manualParticipants.length === 0) { return alert("Please enter a split amount for at least one person for a manual split."); }
      
      const manualSum = manualParticipants.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(manualSum - calculatedTotal) > 0.01) {
        alert(`Error: The sum of the manually split amounts (${manualSum.toFixed(2)}) must exactly match the total from the items list (${calculatedTotal.toFixed(2)}).`);
        return;
      }
      payload = { creatorId, description, totalAmount: calculatedTotal, participants: manualParticipants, items: items.filter(item => item.name && item.price) };
    }

    try {
        const api = axios.create({ headers: { Authorization: `Bearer ${user.token}` } });
        await api.post(`/api/chapters/${activeChapter._id}/transactions`, payload);
        alert('Expense created successfully!');
        navigate('/admin/dashboard');
    } catch (error) { alert(`Error: ${error.response?.data?.message || 'An error occurred'}`); }
  };
  
  const participantUsers = allUsers.filter(u => u._id !== user._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-sans flex flex-col">
      <header className="mb-8 flex justify-between items-center w-full max-w-4xl mx-auto">
        <Link to="/admin/dashboard" className="text-blue-500 dark:text-blue-400 hover:underline font-semibold">&larr; Back to Dashboard</Link>
        <ThemeToggle />
      </header>
      
      <main className="w-full max-w-4xl mx-auto flex-grow">
        <h1 className="text-4xl font-handwritten text-blue-600 dark:text-blue-400 text-center mb-8">Add New Expense</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-8">
          <div className="flex justify-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-1">
            <button type="button" onClick={() => setSplitType('equal')} className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${splitType === 'equal' ? 'bg-blue-500 text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Equal Split</button>
            <button type="button" onClick={() => setSplitType('manual')} className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${splitType === 'manual' ? 'bg-blue-500 text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Manual Split</button>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-handwritten text-gray-700 dark:text-gray-200">Enter Items</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">The transaction name and total are automatically calculated from this list.</p>
            {items.map((item, index) => (
                <div key={index} className="flex gap-4">
                    <input type="text" name="name" placeholder="Item Name" value={item.name} onChange={e => handleItemChange(index, e)} className="w-2/3 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400" />
                    <input type="number" step="0.01" name="price" placeholder="Price" value={item.price} onChange={e => handleItemChange(index, e)} className="w-1/3 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400" />
                </div>
            ))}
            <button type="button" onClick={addItemField} className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">+ Add Item</button>
            <p className="text-right font-bold text-3xl my-4 dark:text-gray-100">Total: {calculatedTotal.toFixed(2)} TK</p>
          </div>
          
          <hr className="my-2 dark:border-gray-700"/>
          
          <div className="space-y-4">
              <h3 className="text-2xl font-handwritten text-gray-700 dark:text-gray-200">Assign People</h3>
              <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">Who paid for this?</label>
                  <select value={creatorId} onChange={e => setCreatorId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400" required>
                      <option value="">Select User...</option>
                      {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
              </div>
              
              <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">Who should this be split among?</label>
                  {splitType === 'equal' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {participantUsers.map(u => (
                              <label key={u._id} className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                                  <input type="checkbox" checked={participants.includes(u._id)} onChange={() => handleParticipantChange(u._id)} className="h-5 w-5 rounded-md text-blue-600 focus:ring-blue-500" />
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                              </label>
                          ))}
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                          {participantUsers.map(u => (
                              <div key={u._id}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{u.name}</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="Amount" 
                                    value={manualSplits[u._id] || ''} 
                                    onChange={e => handleManualSplitChange(u._id, e.target.value)} 
                                    className="mt-1 w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400"
                                />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          <button type="submit" className="w-full bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition-transform hover:scale-105 font-handwritten text-3xl mt-6">
            Add This Expense
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default AdminAddExpensePage;