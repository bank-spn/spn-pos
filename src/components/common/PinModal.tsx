import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/i18n';

interface PinModalProps {
  onSuccess: () => void;
}

export const PinModal = ({ onSuccess }: PinModalProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { language } = useStore();
  const t = translations[language];
  
  const masterPin = import.meta.env.MASTER_PIN || '260539';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === masterPin) {
      onSuccess();
      setError('');
    } else {
      setError(t.invalidPin);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t.enterPin}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t.pinPlaceholder}
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 text-center text-2xl tracking-widest"
            autoFocus
          />
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full mt-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {t.confirm}
          </button>
        </form>
      </div>
    </div>
  );
};

