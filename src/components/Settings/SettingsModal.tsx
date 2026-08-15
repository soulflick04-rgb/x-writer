import React, { useState } from 'react';
import { 
  X, 
  Save, 
  User, 
  Zap, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { AppSettings } from '../../types';
import { storage } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearCache?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearCache,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(form);
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClearCache = () => {
    storage.clearResearchCache();
    onClearCache?.();
    alert('Research cache cleared successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E1B18] border border-[#E5DACB] dark:border-[#332D26] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-fade-in text-[#221D18] dark:text-[#FAF6F0]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EFE7DA] dark:border-[#2C2620] pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C29358]" />
            <h2 className="font-editorial text-xl font-normal">Creator Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9E9283] hover:text-[#221D18] dark:hover:text-white p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* Creator Profile */}
          <div className="space-y-3">
            <div>
              <label className="text-[#7B7163] dark:text-[#A89C8D] block mb-1 font-medium">Display Name</label>
              <input
                type="text"
                value={form.creatorName}
                onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
                placeholder="Arjun"
                className="w-full bg-[#FAF7F2] dark:bg-[#171513] border border-[#E5DACB] dark:border-[#332D26] rounded-xl p-3 text-[#221D18] dark:text-[#FAF6F0] focus:outline-none focus:border-[#C29358]"
              />
            </div>

            <div>
              <label className="text-[#7B7163] dark:text-[#A89C8D] block mb-1 font-medium">X Handle</label>
              <input
                type="text"
                value={form.creatorHandle}
                onChange={(e) => setForm({ ...form, creatorHandle: e.target.value })}
                placeholder="cinephile_x"
                className="w-full bg-[#FAF7F2] dark:bg-[#171513] border border-[#E5DACB] dark:border-[#332D26] rounded-xl p-3 text-[#221D18] dark:text-[#FAF6F0] font-mono focus:outline-none focus:border-[#C29358]"
              />
            </div>
          </div>

          {/* Performance & Zero-Cost Cache */}
          <div className="space-y-3 pt-3 border-t border-[#EFE7DA] dark:border-[#2C2620]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold block">Instant Grounded Cache</span>
                <span className="text-[11px] text-[#7B7163] dark:text-[#A89C8D]">Saves identical queries for 2 hours (0 API cost)</span>
              </div>
              <input
                type="checkbox"
                checked={form.enableClientCache}
                onChange={(e) => setForm({ ...form, enableClientCache: e.target.checked })}
                className="w-4 h-4 accent-[#C29358] rounded"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearCache}
                className="text-[11px] text-[#C29358] hover:underline font-mono"
              >
                Clear Local Cache
              </button>
            </div>
          </div>

          {/* Architecture info */}
          <div className="p-3 bg-[#FAF7F2] dark:bg-[#171513] rounded-xl border border-[#E5DACB] dark:border-[#2C2620] flex items-start gap-2.5 text-[11px] text-[#7B7163] dark:text-[#A89C8D]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Server-side multi-provider routing active: <strong>Gemini (Primary) → Groq → OpenRouter</strong>. Private & single-user.
            </span>
          </div>

          {/* Save Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-[#2A241F] hover:bg-[#1C1814] dark:bg-[#F3EDE6] dark:hover:bg-white text-[#FDFBF7] dark:text-[#1E1B18] shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Preferences!' : 'Save Preferences'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
