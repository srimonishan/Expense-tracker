
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReceiptData, GoogleFormConfig, DEFAULT_CONFIG } from './types';
import { extractReceiptInfo } from './services/geminiService';
import { submitToGoogleForm } from './services/googleFormService';
import ReceiptProcessor from './components/ReceiptProcessor';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [config, setConfig] = useState<GoogleFormConfig>(() => {
    const saved = localStorage.getItem('paytrack_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'capture' | 'history'>('capture');

  useEffect(() => {
    localStorage.setItem('paytrack_config', JSON.stringify(config));
  }, [config]);

  const handleNewImage = useCallback(async (base64: string) => {
    const newReceipt: ReceiptData = {
      id: uuidv4(),
      merchant: 'Identifying...',
      amount: '...',
      currency: '',
      date: new Date().toLocaleDateString(),
      category: 'Uncategorized',
      image: base64,
      status: 'processing'
    };

    setReceipts(prev => [newReceipt, ...prev]);
    setActiveTab('history');

    try {
      const extractedData = await extractReceiptInfo(base64);
      setReceipts(prev => prev.map(r => 
        r.id === newReceipt.id 
          ? { ...r, ...extractedData, status: 'ready' } 
          : r
      ));
    } catch (error) {
      console.error(error);
      setReceipts(prev => prev.map(r => 
        r.id === newReceipt.id 
          ? { ...r, status: 'error', error: 'Failed to process image' } 
          : r
      ));
    }
  }, []);

  const handleSync = async (receipt: ReceiptData) => {
    if (!config.formUrl) {
      alert("Please configure your Google Form URL in settings first!");
      setIsSettingsOpen(true);
      return;
    }

    setReceipts(prev => prev.map(r => r.id === receipt.id ? { ...r, status: 'processing' } : r));
    
    const success = await submitToGoogleForm(receipt, config);
    
    if (success) {
      setReceipts(prev => prev.map(r => r.id === receipt.id ? { ...r, status: 'submitted' } : r));
    } else {
      setReceipts(prev => prev.map(r => r.id === receipt.id ? { ...r, status: 'error', error: 'Upload failed' } : r));
      alert("Submission failed. Check your network or form configuration.");
    }
  };

  const removeReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto border-x border-slate-200 shadow-sm relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-receipt text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">PayTrack AI</h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <i className="fa-solid fa-gear text-xl"></i>
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex px-4 pt-4 pb-2 gap-2 bg-white">
        <button
          onClick={() => setActiveTab('capture')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'capture' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Capture
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'history' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Pending ({receipts.filter(r => r.status !== 'submitted').length})
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'capture' ? (
          <div className="flex flex-col gap-8 items-center py-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">New Payment</h2>
              <p className="text-slate-500 text-sm">Snap a receipt or upload a file to extract data</p>
            </div>
            
            <ReceiptProcessor onImageCaptured={handleNewImage} />

            <div className="w-full bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-3">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <i className="fa-solid fa-sparkles"></i>
                AI-Powered OCR
              </h3>
              <p className="text-sm text-indigo-700 leading-relaxed">
                Gemini AI will automatically read your receipts, identifying merchant, amount, date, and category for one-click Google Form submission.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {receipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <i className="fa-solid fa-receipt text-6xl opacity-20"></i>
                <p className="text-lg">No receipts yet</p>
                <button 
                  onClick={() => setActiveTab('capture')}
                  className="text-indigo-600 font-semibold"
                >
                  Start capturing
                </button>
              </div>
            ) : (
              receipts.map(receipt => (
                <div 
                  key={receipt.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      {receipt.image ? (
                        <img src={receipt.image} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-image text-slate-300"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 truncate pr-2">{receipt.merchant}</h3>
                        <button 
                          onClick={() => removeReceipt(receipt.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                      <p className="text-indigo-600 font-bold text-lg mt-1">
                        {receipt.currency} {receipt.amount}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                          {receipt.date}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                          {receipt.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {receipt.status === 'ready' && (
                      <button
                        onClick={() => handleSync(receipt)}
                        className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all"
                      >
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        Sync to Google Form
                      </button>
                    )}
                    {receipt.status === 'processing' && (
                      <div className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl font-semibold flex items-center justify-center gap-2">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Processing...
                      </div>
                    )}
                    {receipt.status === 'submitted' && (
                      <div className="flex-1 bg-green-100 text-green-700 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 border border-green-200">
                        <i className="fa-solid fa-circle-check"></i>
                        Synced Successfully
                      </div>
                    )}
                    {receipt.status === 'error' && (
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="bg-red-50 text-red-700 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 border border-red-100">
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          Error
                        </div>
                        <button 
                          onClick={() => handleNewImage(receipt.image!)}
                          className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                          Retry Extraction
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config} 
        onSave={(newConfig) => {
          setConfig(newConfig);
          setIsSettingsOpen(false);
        }}
      />

      {/* Footer Branding */}
      <footer className="p-4 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} PayTrack AI • Powered by Gemini
      </footer>
    </div>
  );
};

export default App;
