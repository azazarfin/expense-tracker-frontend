import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ChapterProvider } from './context/ChapterContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChapterProvider> {/* 2. Wrap the App component */}
        <App />
      </ChapterProvider>
    </ThemeProvider>
  </React.StrictMode>,
);