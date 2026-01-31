
import React, { useState } from 'react';
import Header from './components/Header';
import PlanCard from './components/PlanCard';
import PaymentModal from './components/PaymentModal';
import SuccessView from './components/SuccessView';
import { WIFI_PASSES } from './constants';
import { WifiPass } from './types';

const App: React.FC = () => {
  const [selectedPass, setSelectedPass] = useState<WifiPass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ pass: WifiPass; transaction: any } | null>(null);
  const [showManualRetrieval, setShowManualRetrieval] = useState(false); // New state for manual retrieval

  const handleSelectPlan = (pass: WifiPass) => {
    setSelectedPass(pass);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = (transaction: any) => {
    if (selectedPass) {
      setSuccessData({ pass: selectedPass, transaction: transaction });
      setIsModalOpen(false);
    }
  };

  const handleReset = () => {
    setSelectedPass(null);
    setSuccessData(null);
    setIsModalOpen(false);
    setShowManualRetrieval(false); // Reset manual retrieval state
  };

  // Define a dummy pass for the manual retrieval view, can be any pass from the list
  const dummyPassForManualRetrieval: WifiPass = WIFI_PASSES[0]; 
  // Define a dummy transaction for manual retrieval, no actual ID needed initially
  const dummyTransactionForManualRetrieval: any = { id: null };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SuccessView 
          pass={successData.pass} 
          transaction={successData.transaction} 
          onDone={handleReset} 
          isManualEntry={false} // Not manual entry after payment
        />
      </div>
    );
  }

  if (showManualRetrieval) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SuccessView 
          pass={dummyPassForManualRetrieval} 
          transaction={dummyTransactionForManualRetrieval} 
          onDone={handleReset} 
          isManualEntry={true} // Explicitly set to manual entry mode
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 pb-20">
        <div className="max-w-3xl mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Connectez-vous à <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Fina Digital Spot en illimité à petit prix.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl font-medium">
            Choisissez le forfait qui vous convient et profitez d'une connexion haut débit stable et sécurisée.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {WIFI_PASSES.map((pass) => (
            <PlanCard 
              key={pass.id}
              pass={pass}
              isSelected={selectedPass?.id === pass.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        <section className="mt-24 grid md:grid-cols-3 gap-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <i className="fas fa-bolt text-lg"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Ultra Rapide</h4>
              <p className="text-sm text-gray-500">Connexion fibre optique jusqu'à 100 Mbps pour tous vos appareils.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <i className="fas fa-shield-alt text-lg"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Sécurisé</h4>
              <p className="text-sm text-gray-500">Protocoles de sécurité avancés pour protéger vos données personnelles.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <i className="fas fa-headset text-lg"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Assistance 24/7</h4>
              <p className="text-sm text-gray-500">Une équipe dédiée pour vous aider à tout moment de la journée.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40">
            <i className="fas fa-wifi"></i>
            <span className="font-bold">Fina digital © 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="https://urlr.me/!CGV-FDS" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Conditions d'utilisation</a>
            <a href="https://urlr.me/!POLITIQUE-CONFIDENTIALITE-FDS" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Politique de Confidentialité</a>
          </div>
          <div className="flex gap-4">
            <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <i className="fab fa-facebook-f text-xs"></i>
            </button>
            <a 
              href="https://www.instagram.com/finadigitalspot?igsh=d2p2M2Mydmo4aHNy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              title="Suivez-nous sur Instagram"
            >
              <i className="fab fa-instagram text-xs"></i>
            </a>
          </div>
          {/* New link for manual retrieval */}
          <button
            onClick={() => setShowManualRetrieval(true)}
            className="mt-6 md:mt-0 text-xs text-indigo-500 hover:text-indigo-700 font-semibold underline transition-colors"
          >
            J'ai déjà un ID de transaction
          </button>
        </div>
      </footer>

      {isModalOpen && selectedPass && (
        <PaymentModal 
          pass={selectedPass}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default App;
