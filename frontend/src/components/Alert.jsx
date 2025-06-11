// frontend/src/components/Alert.jsx

import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

export default function Alert({ type, message, onClose }) {
  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded shadow-lg flex items-center space-x-2 ${
        type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 font-bold">×</button>
    </div>
  );
}
