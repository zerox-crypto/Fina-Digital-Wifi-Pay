
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 bg-white shadow-sm flex items-center justify-between mb-8 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <i className="fas fa-wifi text-lg"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Fina digital</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Wi-Fi Haut Débit</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <a href="https://wa.me/22994481368" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Aide</a>
      </div>
    </header>
  );
};

export default Header;
