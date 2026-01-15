
import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

const SupportChat: React.FC = () => {
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
      setMessages(prev => [...prev, { role: 'ai', text: response || 'Sorry, I am offline.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to support.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-[#CC0000] transition-all group"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      ) : (
        <div className="w-96 h-[500px] glass-dark shadow-2xl flex flex-col overflow-hidden border border-white/10 rounded-2xl">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#CC0000]" />
              <span className="font-brand font-black italic text-white uppercase tracking-widest">Support Agent</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">How can we help you today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 text-sm font-medium ${m.role === 'user' ? 'bg-[#CC0000] text-white rounded-l-xl rounded-tr-xl' : 'bg-white/10 text-gray-300 rounded-r-xl rounded-tl-xl'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-500 px-4 py-2 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-black/50 border-t border-white/10">
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-grow bg-white/5 border border-white/10 px-4 py-2 text-xs text-white uppercase font-bold outline-none focus:border-[#CC0000] transition-colors"
              />
              <button 
                onClick={handleSend}
                className="bg-[#CC0000] p-3 text-white hover:bg-white hover:text-black transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
