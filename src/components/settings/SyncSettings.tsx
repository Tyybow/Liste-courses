import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { getRoomCode, setRoomCode, clearRoomCode, generateRoomCode, loadFromCloud, saveToCloud } from '../../utils/sync';
import type { SyncData } from '../../utils/sync';

export default function SyncSettings() {
  const [currentCode, setCurrentCode] = useState<string | null>(getRoomCode());
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const store = useStore();

  const showMessage = useCallback((msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setStatus(type);
    setTimeout(() => { setMessage(''); setStatus('idle'); }, 4000);
  }, []);

  // Load from cloud on mount if room code exists
  useEffect(() => {
    const code = getRoomCode();
    if (!code) return;
    loadFromCloud(code)
      .then((data) => {
        if (data) {
          store.loadFromCloudData(data);
        }
      })
      .catch(() => {
        // Silently fail on initial load — data is still in localStorage
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setCurrentCode(code);
    setStatus('loading');

    try {
      const s = useStore.getState();
      const data: SyncData = {
        ingredients: s.ingredients,
        recipes: s.recipes,
        meals: s.meals,
        shoppingList: s.shoppingList,
        manualShoppingItems: s.manualShoppingItems,
        nonFoodItems: s.nonFoodItems,
        shoppingNonFood: s.shoppingNonFood,
        lastModified: Date.now(),
      };
      await saveToCloud(code, data);
      showMessage('Code créé et données synchronisées !', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la synchronisation';
      showMessage(msg, 'error');
    }
  };

  const handleJoin = async () => {
    const code = inputCode.toUpperCase().trim();
    if (code.length < 4) {
      showMessage('Code trop court', 'error');
      return;
    }

    setStatus('loading');
    try {
      const data = await loadFromCloud(code);
      if (!data) {
        showMessage('Code introuvable. Vérifiez le code.', 'error');
        return;
      }
      setRoomCode(code);
      setCurrentCode(code);
      store.loadFromCloudData(data);
      setInputCode('');
      showMessage('Données chargées avec succès !', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      showMessage(msg, 'error');
    }
  };

  const handleDisconnect = () => {
    clearRoomCode();
    setCurrentCode(null);
    showMessage('Déconnecté de la sync', 'success');
  };

  const handleRefresh = async () => {
    if (!currentCode) return;
    setStatus('loading');
    try {
      const data = await loadFromCloud(currentCode);
      if (data) {
        store.loadFromCloudData(data);
        showMessage('Données actualisées !', 'success');
      }
    } catch {
      showMessage('Erreur de chargement', 'error');
    }
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Synchronisation</h3>
          <p className="text-sm text-gray-500">Partagez vos données entre appareils</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium animate-fade-in ${
          status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''
        }`}>
          {message}
        </div>
      )}

      {currentCode ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs text-gray-500 mb-1">Votre code famille</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold tracking-widest text-indigo-700">
                {currentCode}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(currentCode)}
                className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                title="Copier"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Partagez ce code pour synchroniser un autre appareil
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={status === 'loading'}
              className="flex-1 btn-gradient py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <svg className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {status === 'loading' ? 'Chargement...' : 'Actualiser'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
            >
              Déconnecter
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <button
              onClick={handleCreate}
              disabled={status === 'loading'}
              className="w-full btn-gradient-accent py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un code famille
            </button>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              Génère un code unique pour synchroniser vos appareils
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OU</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Rejoindre avec un code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABCD1234"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm font-mono tracking-wider uppercase"
                maxLength={10}
              />
              <button
                onClick={handleJoin}
                disabled={status === 'loading' || inputCode.length < 4}
                className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {status === 'loading' ? '...' : 'Rejoindre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
