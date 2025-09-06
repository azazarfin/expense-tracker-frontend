import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import API from '../api'; // UPDATED: Import the configured API instance

export const ChapterContext = createContext();

export function useChapter() {
  return useContext(ChapterContext);
}

export const ChapterProvider = ({ children }) => {
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      return null;
    }
  });

  const fetchChapters = useCallback(async () => {
    if (!user || !user.token) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      // UPDATED: Use the central API instance directly and no '/api' prefix
      const response = await API.get('/chapters');
      const fetchedChapters = response.data;
      setChapters(fetchedChapters);

      if (fetchedChapters.length > 0) {
        const savedChapterId = localStorage.getItem('activeChapterId');
        let chapterToActivate = fetchedChapters.find(c => c._id === savedChapterId);
        
        if (!chapterToActivate) {
          chapterToActivate = fetchedChapters[0];
          localStorage.setItem('activeChapterId', chapterToActivate._id);
        }
        setActiveChapter(chapterToActivate);
      } else {
        setActiveChapter(null);
        localStorage.removeItem('activeChapterId');
      }
    } catch (error) {
      console.error("Failed to fetch chapters", error);
      setChapters([]);
      setActiveChapter(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const switchChapter = (chapterId) => {
    if (chapterId) {
      const chapterToSwitchTo = chapters.find(c => c._id === chapterId);
      if (chapterToSwitchTo) {
        setActiveChapter(chapterToSwitchTo);
        localStorage.setItem('activeChapterId', chapterToSwitchTo._id);
        window.location.reload(); 
      }
    }
  };

  const value = {
    chapters,
    activeChapter,
    isLoadingChapters: isLoading,
    switchChapter,
    refreshChapters: fetchChapters,
  };

  return (
    <ChapterContext.Provider value={value}>
      {children}
    </ChapterContext.Provider>
  );
};