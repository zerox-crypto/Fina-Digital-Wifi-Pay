
import React from 'react';
import { WifiPass } from '../types';

interface PlanCardProps {
  pass: WifiPass;
  isSelected: boolean;
  onSelect: (pass: WifiPass) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ pass, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(pass)}
      className={`relative w-full text-left p-6 rounded-3xl transition-all duration-300 border-2 overflow-hidden ${
        isSelected 
          ? 'border-indigo-600 bg-indigo-50/50 shadow-xl scale-[1.02]' 
          : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-200'
      }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center animate-bounce-short">
          <i className="fas fa-check text-xs"></i>
        </div>
      )}
      
      <div className={`w-12 h-12 ${pass.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-inner`}>
        <i className={`fas ${pass.icon} text-xl`}></i>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-1">{pass.label}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-extrabold text-indigo-600">{pass.price}</span>
        <span className="text-sm font-bold text-gray-500 uppercase">CFA</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <i className="far fa-clock text-gray-400 w-4"></i>
          <span>{pass.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <i className="fas fa-database text-gray-400 w-4"></i>
          <span>{pass.dataLimit}</span>
        </div>
      </div>
    </button>
  );
};

export default PlanCard;
