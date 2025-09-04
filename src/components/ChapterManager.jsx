import React, { useState, useContext } from 'react';
import { ChapterContext } from '../context/ChapterContext';
import { toast } from 'react-toastify';
import api from '../api'; // Import the centralized API client

const ChapterManager = () => {
  const [newChapterName, setNewChapterName] = useState('');
  const { refreshChapters } = useContext(ChapterContext);

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterName.trim()) {
      toast.error('Chapter name cannot be empty');
      return;
    }

    try {
      // --- FIX: Use the centralized api instance ---
      await api.post('/api/chapters', { name: newChapterName });
      toast.success('Chapter added successfully');
      setNewChapterName('');
      refreshChapters(); // Refresh the chapters list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add chapter');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-2">Manage Chapters</h3>
      <form onSubmit={handleAddChapter} className="flex gap-2">
        <input
          type="text"
          value={newChapterName}
          onChange={(e) => setNewChapterName(e.target.value)}
          placeholder="New chapter name"
          className="flex-grow p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-indigo-600 text-white rounded">
          Add Chapter
        </button>
      </form>
    </div>
  );
};

export default ChapterManager;