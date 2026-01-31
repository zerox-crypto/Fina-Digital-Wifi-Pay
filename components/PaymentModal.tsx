
import React, { useState, useEffect } from 'react';
import { WifiPass, CustomerInfo, PaymentStatus } from '../types';
import { FEDAPAY_PUBLIC_KEY } from '../constants';

interface PaymentModalProps {
  pass: WifiPass;
  onClose: () => void;
  onSuccess: (transaction: any) => void;
}

declare global {
  interface Window {
    FedaPay: any;
  }
}

const DATA_PERSISTENCE_WEBHOOK = "https://themislab-n8n.okrh4i.easypanel.host/webhook/DATA";

const PaymentModal: React.FC<PaymentModalProps> = ({ pass, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CustomerInfo>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    country: 'BJ',
    idReference: '',
    whatsappNumber: ''
  });
  
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isFormValid = 
      formData.firstname.trim().length > 0 && 
      formData.lastname.trim().length > 0 && 
      /^\S+@\S+\.\S+$/.test(formData.email) && 
      formData.phone.length === 8 &&
      formData.idReference.trim().length > 0 &&
      formData.whatsappNumber.trim().length >= 8;

    if (window.FedaPay && isFormValid && status === PaymentStatus.IDLE) {
      window.FedaPay.init('#feda-checkout-btn', {
        public_key: FEDAPAY_PUBLIC_KEY,
        transaction: {
          amount: pass.price,
          description: `WiFi Fina Digital: ${pass.label} | ID: ${formData.idReference} | WA: ${formData.whatsappNumber}`
        },
        customer: {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone_number: {
            number: formData.phone,
            country: formData.country
          }
        },
        onComplete: async (response: any) => {
          if (response && response.transaction && response.transaction.status === 'approved') {
            // Sauvegarde des données dans Google Sheets via le webhook /DATA
            try {
              await fetch(DATA_PERSISTENCE_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firstname: formData.firstname,
                  lastname: formData.lastname,
                  email: formData.email,
                  phone: formData.phone,
                  id_reference: formData.idReference,
                  whatsapp_number: formData.whatsappNumber,
                  transaction_id: response.transaction.id,
                  amount: pass.price,
                  plan: pass.label,
                  date: new Date().toISOString()
                })
              });
              console.log("Données client envoyées avec succès pour sauvegarde.");
            } catch (e) {
              console.error("Erreur lors de la sauvegarde des données client:", e);
              // On continue quand même vers onSuccess car le paiement est réussi
            }
            
            onSuccess(response.transaction);
          } else {
            if (response && response.transaction && response.transaction.status === 'canceled') {
              setStatus(PaymentStatus.IDLE);
            } else {
              setError("Le paiement n'a pas pu être validé.");
              setStatus(PaymentStatus.ERROR);
            }
          }
        }
      });
    }
  }, [formData, pass, status, onSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status === PaymentStatus.ERROR) setStatus(PaymentStatus.IDLE);
  };

  const isButtonDisabled = !(
    formData.firstname.trim().length > 0 && 
    formData.lastname.trim().length > 0 && 
    formData.email.includes('@') && 
    formData.phone.length === 8 &&
    formData.idReference.trim().length > 0 &&
    formData.whatsappNumber.trim().length >= 8
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-10">
      <div 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-2">
                <i className="fas fa-shield-check text-[10px]"></i>
                IDENTIFICATION OBLIGATOIRE
              </div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">Détails de facturation</h2>
              <p className="text-gray-500 text-sm font-medium">Pass {pass.label} • {pass.price} CFA</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                <input
                  required
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                <input
                  required
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Référence Pièce d'Identité (CNI / CIP / Passeport)</label>
              <input
                required
                name="idReference"
                value={formData.idReference}
                onChange={handleChange}
                placeholder="Ex: 1029384756..."
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean@exemple.com"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
                </div>
                <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro WhatsApp</label>
                <input
                    required
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="97000000"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                />
                </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Money (Bénin)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-gray-200 group-focus-within:border-indigo-500 transition-colors">
                  <img src="https://flagcdn.com/w20/bj.png" alt="BJ" className="w-5 rounded-sm" />
                  <span className="text-xs font-black text-gray-600">+229</span>
                </div>
                <input
                  required
                  type="tel"
                  name="phone"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="90909090"
                  className="w-full pl-20 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-gray-900 tracking-[0.15em]"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                <p className="text-[10px] leading-relaxed text-amber-800 font-medium italic">
                    <i className="fas fa-gavel mr-1"></i>
                    L'utilisateur doit donner les renseignements justes sous peine d'engager sa responsabilité en cas de poursuite conformément aux dispositions du code du numérique et de la législation sur les services de communications électroniques au Bénin.
                </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-bold flex items-start gap-3">
                <i className="fas fa-exclamation-circle mt-0.5"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                id="feda-checkout-btn"
                disabled={isButtonDisabled}
                className={`w-full py-4.5 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                  isButtonDisabled 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span className="uppercase tracking-widest text-sm">
                  {isButtonDisabled ? "Remplir tous les champs" : "Payer " + pass.price + " CFA"}
                </span>
                {!isButtonDisabled && <i className="fas fa-arrow-right"></i>}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3.5 text-gray-400 font-bold hover:text-gray-600 transition-all text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <i className="fas fa-arrow-left text-[10px]"></i>
                Annuler et revenir à l'accueil
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col items-center opacity-40">
            <img src="https://www.fedapay.com/assets/images/logo-fedapay.png" alt="FedaPay" className="h-4 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sécurisé par FedaPay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
