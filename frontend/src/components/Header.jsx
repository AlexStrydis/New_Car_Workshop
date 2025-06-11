// frontend/src/components/Header.jsx

import React from 'react';
import { LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Header({ currentUser, onLogout }) {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="text-2xl">🔧</div>
        <div>
          <h1 className="text-xl font-bold">AutoFix Pro</h1>
          {currentUser && (
            <p className="text-sm text-gray-600">
              Καλώς όρισες, {currentUser.name}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <LanguageSelector />
        {currentUser && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded"
          >
            <LogOut size={16} /> <span>Έξοδος</span>
          </button>
        )}
      </div>
    </header>
  );
}
