import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

// Apply saved theme before render to avoid flash
const savedStore = localStorage.getItem('ai-tutor-bot-store');
if (savedStore) {
  try {
    const parsed = JSON.parse(savedStore);
    if (parsed.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {
    document.documentElement.classList.add('dark');
  }
} else {
  // Default to dark
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
