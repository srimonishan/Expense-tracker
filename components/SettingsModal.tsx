
import React from 'react';
import { GoogleFormConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleFormConfig;
  onSave: (config: GoogleFormConfig) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = React.useState(config);

  // Sync local state when config prop changes (e.g. on first load)
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Form Configuration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
            <p className="text-sm text-indigo-700 font-medium">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Configured for "Expense tracker" Google Form.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Google Form URL</label>
            <input
              type="text"
              value={localConfig.formUrl}
              onChange={e => setLocalConfig({...localConfig, formUrl: e.target.value})}
              className="w-full px-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Entry ID (LKR)</label>
            <input
              type="text"
              value={localConfig.amountEntryId}
              onChange={e => setLocalConfig({...localConfig, amountEntryId: e.target.value})}
              placeholder="entry.527204928"
              className="w-full px-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Type of Expense Entry ID</label>
            <input
              type="text"
              value={localConfig.typeEntryId}
              onChange={e => setLocalConfig({...localConfig, typeEntryId: e.target.value})}
              placeholder="entry.183344116"
              className="w-full px-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cash/Card Entry ID</label>
            <input
              type="text"
              value={localConfig.methodEntryId}
              onChange={e => setLocalConfig({...localConfig, methodEntryId: e.target.value})}
              placeholder="entry.2064509286"
              className="w-full px-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
