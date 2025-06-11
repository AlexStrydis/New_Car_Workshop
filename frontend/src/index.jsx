// frontend/src/index.jsx

import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // Tailwind or other global styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
