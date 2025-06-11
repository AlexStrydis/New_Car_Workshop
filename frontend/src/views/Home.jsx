// frontend/src/views/Home.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Home({ onLogin, onRegister }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">{t('welcome')}</h1>
      <p className="text-lg mb-8 max-w-md text-center">{t('description')}</p>
      <div className="space-x-4 mb-8">
        <button
          onClick={onLogin}
          className="bg-white text-blue-700 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
        >
          {t('login')}
        </button>
        <button
          onClick={onRegister}
          className="bg-white text-blue-700 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
        >
          {t('register')}
        </button>
      </div>
    </div>
);
}
