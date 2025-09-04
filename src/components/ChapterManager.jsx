import React, { useContext } from 'react';
import { ChapterContext } from '../context/ChapterContext';
import axios from 'axios';

function ChapterManager() {
  const { chapters, activeChapter, switchChapter, refreshChapters, isLoading } = useContext(ChapterContext);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleCreateChapter = async () => {
    const name = prompt("Enter the name for the new chapter (e.g., 'September Expenses'):");
    if (name && name.trim()) {
      try {
        const api = axios.create({ headers: { Authorization: `Bearer ${user.token}` } });
        await api.post('/api/chapters', { name: name.trim() });
        alert(`Chapter "${name.trim()}" created successfully!`);
        await refreshChapters(); // Re-fetch the chapter list
      } catch (error) {
        console.error("Failed to create chapter", error);
        alert("Failed to create chapter.");
      }
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Loading chapters...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {chapters.length > 0 && activeChapter ? (
        <select
          value={activeChapter._id}
          onChange={(e) => switchChapter(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          {chapters.map((chapter) => (
            <option key={chapter._id} value={chapter._id}>
              {chapter.name}
            </option>
          ))}
        </select>
      ) : (
         <p className="text-sm text-gray-500 dark:text-gray-400">No chapters found.</p>
      )}
      <button onClick={handleCreateChapter} className="p-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600">
        + New Chapter
      </button>
    </div>
  );
}

export default ChapterManager;