
import React, { useState, useEffect, useCallback } from 'react';
import { WifiPass } from '../types';

interface SuccessViewProps {
  pass: WifiPass;
  transaction: any;
  onDone: () => void;
  isManualEntry?: boolean; // New prop to indicate manual entry mode
}

// Webhook pour la récupération automatique du code WiFi après paiement
const AUTO_WEBHOOK_URL = "https://themislab-n8n.okrh4i.easypanel.host/webhook/3de9d75a-cb72-429e-a14b-a71fb619e9a4";
// Webhook pour la récupération manuelle du code WiFi par ID de transaction
const MANUAL_WEBHOOK_URL = "https://themislab-n8n.okrh4i.easypanel.host/webhook/3de9d75a-cb72-429e-a14b-a71fb619e9a4";

const SuccessView: React.FC<SuccessViewProps> = ({ pass, transaction, onDone, isManualEntry = false }) => {
  const [wifiCode, setWifiCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isManualEntry); 
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [manualTransactionId, setManualTransactionId] = useState<string>(transaction.id?.toString() || '');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [manualRetrievalError, setManualRetrievalError] = useState<string | null>(
    isManualEntry ? "Entrez votre ID de transaction pour récupérer votre code Wi-Fi." : null
  );
  
  // Fonction utilitaire pour extraire le code d'un objet ou d'une chaîne
  const extractCode = (data: any): string | null => {
    if (!data) return null;
    
    // Si c'est déjà une chaîne (n8n renvoie parfois juste le texte)
    if (typeof data === 'string') return data.trim();

    // Si c'est un tableau, on prend le premier élément
    if (Array.isArray(data)) {
      return extractCode(data[0]);
    }

    // Recherche dans les propriétés courantes
    const code = data?.code_wifi || 
                 data?.wifi_code || 
                 data?.code || 
                 data?.ticket || 
                 data?.wifiCode || 
                 data?.pin || 
                 data?.password;
    
    return code ? String(code).trim() : null;
  };

  // --- Fonction pour la récupération automatique ---
  const fetchCode = useCallback(async (attempt: number = 0) => {
    if (isManualEntry || !transaction.id) {
      setLoading(false);
      return; 
    }

    setLoading(true);
    setManualRetrievalError(null);
    setError(null);
    setWifiCode(null);

    const requestBody = JSON.stringify({ transaction_id: transaction.id?.toString() || '' });

    try {
      const response = await fetch(AUTO_WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText.substring(0, 100)}`);
      }

      const responseText = await response.text();
      
      let data;
      if (!responseText || responseText.trim() === "") {
        // Réponse vide, on traitera comme code non trouvé (tentative de réessai)
        data = null;
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // Si ce n'est pas du JSON, on traite le texte brut comme le code
          data = responseText;
        }
      }
      
      const code = extractCode(data);
      
      if (code && code !== '{{ $json.output }}') {
        setWifiCode(code);
        setLoading(false);
        setError(null);
      } else if (attempt < 2) { 
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchCode(attempt + 1);
        }, 3000);
      } else {
        setError("Le serveur n'a pas pu générer un code WiFi pour le moment. Veuillez vérifier la configuration de votre workflow n8n ou essayer la récupération manuelle.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(`[Fetch Auto - Attempt ${attempt + 1}] Error:`, err);
      if (attempt < 2) {
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchCode(attempt + 1);
        }, 3000);
      } else {
        setError(`Erreur de connexion : ${err.message}. Veuillez vérifier votre connexion ou essayer la récupération manuelle.`);
        setLoading(false);
      }
    }
  }, [transaction, pass, isManualEntry]);

  // --- Fonction pour la récupération manuelle ---
  const fetchManualCode = useCallback(async () => {
    if (!manualTransactionId.trim()) {
      setManualRetrievalError("Veuillez entrer un ID de transaction.");
      return;
    }

    setIsManualLoading(true);
    setManualRetrievalError(null);
    setWifiCode(null);
    setError(null);

    const requestBody = JSON.stringify({ transaction_id: manualTransactionId.trim() });

    try {
      const response = await fetch(MANUAL_WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText.substring(0, 100)}`);
      }

      const responseText = await response.text();
      
      let data;
      // Gestion gracieuse d'une réponse vide
      if (!responseText || responseText.trim() === "") {
        data = null;
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = responseText;
        }
      }
      
      const code = extractCode(data);
      
      if (code && code !== '{{ $json.output }}') {
        setWifiCode(code);
        setManualRetrievalError(null);
      } else {
        setManualRetrievalError("Aucun code WiFi trouvé pour cet ID de transaction. Vérifiez l'ID ou attendez quelques instants si le paiement est récent.");
      }
    } catch (err: any) {
      console.error("[Fetch Manual] Error:", err);
      setManualRetrievalError(`Erreur : ${err.message}`);
    } finally {
      setIsManualLoading(false);
    }
  }, [manualTransactionId]);

  useEffect(() => {
    if (!isManualEntry) {
      fetchCode();
    }
  }, [fetchCode, isManualEntry]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-4xl">
            <i className="fas fa-sync-alt animate-spin"></i>
          </div>
          {retryCount > 0 && (
            <div className="absolute -bottom-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
              Tentative {retryCount + 1}/3
            </div>
          )}
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Génération de votre ticket</h2>
        <p className="text-gray-500 font-medium text-lg">Veuillez patienter pendant que nous récupérons votre accès WiFi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className={`py-10 flex flex-col items-center justify-center text-white relative overflow-hidden ${error || manualRetrievalError ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
            <i className={`fas ${error || manualRetrievalError ? 'fa-exclamation-triangle' : 'fa-check-circle'} text-3xl`}></i>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest">
            {wifiCode ? "Paiement Confirmé" : "Ticket indisponible"}
          </h2>
          <p className="opacity-80 text-sm font-bold mt-1">
            {transaction.id ? `ID Transaction: ${transaction.id}` : "Récupération manuelle"}
          </p>
        </div>
        
        <div className="p-8 md:p-12">
          {(!wifiCode && (error || manualRetrievalError)) ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-8 text-center">
              <p className="text-amber-800 font-bold leading-relaxed mb-6">
                {manualRetrievalError || error}
              </p>
              
              <div className="mt-8 pt-6 border-t border-amber-100 text-left">
                <p className="text-sm font-black text-amber-900 mb-3 uppercase tracking-wide">
                  Récupération manuelle du code WiFi
                </p>
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={manualTransactionId}
                    onChange={(e) => setManualTransactionId(e.target.value)}
                    placeholder="Entrez votre ID de transaction (ex: 123456)"
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-900"
                    disabled={isManualLoading}
                  />
                  <button
                    onClick={fetchManualCode}
                    disabled={isManualLoading || !manualTransactionId.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-white text-xs font-bold transition-all ${
                      isManualLoading || !manualTransactionId.trim()
                        ? 'bg-amber-300 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {isManualLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Récupérer'}
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-900 mb-2 uppercase">Aide & Support :</p>
                  <ul className="text-xs text-amber-800 space-y-1.5 font-medium">
                    <li>• Vérifiez votre connexion internet.</li>
                    <li>• Attendez 1 à 2 minutes après le paiement.</li>
                    <li>• Contactez le support WhatsApp avec votre ID.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4 text-gray-800 text-base md:text-lg leading-relaxed">
                <p className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span>Félicitations ! Votre paiement de <span className="font-black text-indigo-600">{pass.price}F CFA</span> est confirmé.</span>
                </p>
                
                <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-[2rem] p-8 my-6 flex flex-col items-center text-center shadow-inner">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-mobile-alt"></i>
                    Votre code WiFi (valide {pass.duration})
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter tabular-nums select-all">
                      {wifiCode}
                    </span>
                    <button 
                      onClick={() => {
                        if (wifiCode) {
                          navigator.clipboard.writeText(wifiCode);
                          alert('Code WiFi copié !');
                        }
                      }}
                      className="w-12 h-12 bg-white text-indigo-600 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 transition-all active:scale-90"
                      title="Copier le code"
                    >
                      <i className="far fa-copy text-lg"></i>
                    </button>
                  </div>
                </div>

                <p className="flex items-start gap-3">
                  <span className="text-2xl">🔗</span>
                  <span>Connectez-vous au réseau <span className="font-black text-indigo-600">Fina Digital Spot</span> et entrez ce code.</span>
                </p>

                <div className="pt-8 border-t border-gray-100 space-y-3">
                  <p className="font-black text-gray-900 flex items-center gap-2">
                    <span className="text-xl">❓</span> Besoin d'aide ?
                  </p>
                  <div className="pl-8 space-y-1 text-sm font-medium text-gray-600">
                    <p>E-mail: <a href="mailto:finadigitalzone1@gmail.com" className="text-indigo-600 font-bold hover:underline">finadigitalzone1@gmail.com</a></p>
                    <p>WhatsApp: <a href="https://wa.me/22997197316" target="_blank" rel="noopener noreferrer" className="text-green-600 font-black hover:underline">+22997197316</a></p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-10 pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onDone}
              className="flex-1 py-5 bg-white hover:bg-gray-50 text-gray-600 font-bold rounded-2xl border-2 border-gray-100 transition-all active:scale-[0.98]"
            >
              Retour à l'accueil
            </button>
            {wifiCode && (
              <button
                onClick={() => {
                  // Redirection vers le portail captif local
                  window.location.href = 'http://fina.spot/';
                }}
                className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <i className="fas fa-wifi"></i>
                <span>SE CONNECTER</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessView;
