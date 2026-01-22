
import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Cpu, ShieldCheck } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { Language } from '../types';

// Fixed missing language prop in SupportChat component
const SupportChat: React.FC<{ language: Language }> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getChatResponse(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response || 'Terminal Offline. Tente novamente.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão com o cluster de suporte.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] mb-4 bg-black/90 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-2 border-white/10 rounded-[2.5rem] animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
          {/* Header Industrial */}
          <div className="p-6 border-b-2 border-red-600 bg-black flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-600 rounded-lg animate-pulse">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-brand font-black italic text-white uppercase tracking-widest text-sm block leading-none">AI Support</span>
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Quantum Node R2</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 industrial-grid bg-white/5">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <Sparkles className="w-10 h-10 text-red-600 mx-auto opacity-20" />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                  Terminal de Suporte Ativo.<br/>Aguardando instruções do operador.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-5 py-3 text-[11px] font-bold uppercase tracking-widest leading-relaxed shadow-lg ${
                  m.role === 'user' 
                  ? 'bg-red-600 text-white rounded-2xl rounded-tr-none border border-white/10' 
                  : 'bg-black/60 text-gray-300 rounded-2xl rounded-tl-none border border-white/10'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/60 px-5 py-3 rounded-2xl rounded-tl-none border border-white/10">
                  <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input Terminal */}
          <div className="p-6 bg-black border-t-2 border-white/5">
            <div className="flex space-x-3 bg-white/5 p-1 rounded-2xl border border-white/10 focus-within:border-red-600 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="DIGITE SUA DÚVIDA TÉCNICA..."
                className="flex-grow bg-transparent px-4 py-3 text-[10px] text-white uppercase font-black outline-none placeholder:text-gray-700"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="bg-red-600 p-4 text-white rounded-xl hover:bg-white hover:text-black transition-all shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between opacity-30">
               <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span className="text-[7px] font-black text-white uppercase tracking-widest">Secure Sync</span>
               </div>
               <span className="text-[7px] font-black text-white uppercase tracking-widest">v4.2-STABLE</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bubble (Bolinha) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-18 h-18 p-5 bg-black text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-110 transition-all duration-500 group relative border-2 ${isOpen ? 'border-red-600 scale-90' : 'border-white/10'}`}
      >
        {/* Glow Pulsante quando fechado */}
        {!isOpen && <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping -z-10" />}
        
        {isOpen ? (
          <X className="w-8 h-8 text-red-600" />
        ) : (
          <div className="relative">
             <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-black" />
          </div>
        )}
      </button>
    </div>
  );
};

export default SupportChat;
