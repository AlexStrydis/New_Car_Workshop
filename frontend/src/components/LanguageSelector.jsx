// frontend/src/components/LanguageSelector.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  return (
    <select
      value={i18n.language}
      onChange={e => i18n.changeLanguage(e.target.value)}
      className="text-sm border rounded px-2 py-1 bg-white"
    >
      <option value="el">Ελληνικά</option>
      <option value="en">English</option>
    </select>
  );
}
