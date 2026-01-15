
import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, Printer, X, AlertCircle, Building2, UserPlus, Loader2, Cpu, Zap } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginPanelProps {
  onLogin: (user: UserType) => void;
  onBack: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<'Client' | 'B2B'>('Client');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    setAuthProgress(0);

    const interval = setInterval(() => {
      setAuthProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeAuth();
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const completeAuth = () => {
    if (mode === 'login') {
      if (email === 'admin@redline.eu' && password === 'redline2025') {
        onLogin({ id: 'admin-01', name: 'Admin Node', email, role: 'Admin', tier: 'Platina', joinedAt: Date.now() });
        return;
      }
      if (email === 'b2b@spacex.com' && password === 'redline2025') {
        onLogin({ id: 'b2b-01', name: 'Elon Musk', email, role: 'B2B', tier: 'Platina', company: 'SpaceX EU', creditLimit: 50000, joinedAt: Date.now() });
        return;
      }
      if (email === 'cliente@gmail.com' && password === 'redline2025') {
        onLogin({ id: 'client-01', name: 'João Silva', email, role: 'Client', tier: 'Bronze', joinedAt: Date.now() });
        return;
      }
      setError('PROTOCOL ERROR: Authentication failed in R2 Cluster.');
      setIsProcessing(false);
    } else {
      onLogin({
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        role,
        company: role === 'B2B' ? company : undefined,
        tier: role === 'B2B' ? 'Prata' : 'Bronze',
        joinedAt: Date.now()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[70%] bg-red-800 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-black/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 m-auto">
        
        {isProcessing && (
           <div className="absolute inset-0 z-[600] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12">
              <div className="relative mb-12">
                 <div className="w-40 h-40 border-[10px] border-white/5 rounded-full flex items-center justify-center">
                    <Cpu className="w-16 h-16 text-red-600 animate-pulse" />
                 </div>
                 <div className="absolute inset-0 w-40 h-40 border-t-[10px] border-red-600 rounded-full animate-spin" />
              </div>
              <h3 className="text-4xl font-brand font-black italic text-white uppercase tracking-tighter mb-2">Sincronizando...</h3>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">Auth Node R2-Frankfurt connection active</p>
              <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-red-600 shimmer transition-all duration-200" style={{ width: `${authProgress}%` }} />
              </div>
           </div>
        )}

        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-red-600 to-red-900 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-12">
               <div className="bg-black p-3 rounded-2xl">
                  <Printer className="w-8 h-8" />
               </div>
               <span className="font-brand text-3xl font-black italic tracking-tighter uppercase">REDLINE</span>
            </div>
            <h2 className="text-6xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter mb-8">
              Node <br /> <span className="text-black">Access.</span>
            </h2>
            <div className="space-y-6 border-l-4 border-black pl-8 py-2">
               <p className="text-lg font-medium leading-tight max-w-xs">
                  Sincronização industrial para ativos gráficos globais.
               </p>
               <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-black" />
                  <span className="text-[8px] font-black uppercase tracking-widest">ENCRYPTED R2 NODE</span>
               </div>
            </div>
          </div>
          <div className="relative z-10 pt-10">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="group flex items-center space-x-4 text-[9px] font-black uppercase tracking-[0.4em] bg-black px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-all shadow-xl"
            >
              <span>{mode === 'login' ? 'Nova Célula' : 'Tenho Login'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center relative industrial-grid bg-white">
          <button onClick={onBack} className="absolute top-8 right-8 p-3 text-gray-300 hover:text-red-600 transition-all transform hover:rotate-90">
            <X className="w-8 h-8" />
          </button>

          <div className="mb-12">
            <div className="w-12 h-1 bg-red-600 mb-6" />
            <h3 className="text-4xl font-brand font-black italic uppercase text-black tracking-tighter leading-none mb-2">
              {mode === 'login' ? 'Autenticação' : 'Registro Node'}
            </h3>
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black">Cluster Identification Protocol</p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-4 text-red-600 text-[9px] font-black uppercase tracking-widest">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="NOME DO OPERADOR" className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-xl text-black text-[11px] font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all" required />
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setRole('Client')} className={`p-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${role === 'Client' ? 'bg-black border-black text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>Standard</button>
                  <button type="button" onClick={() => setRole('B2B')} className={`p-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${role === 'B2B' ? 'bg-black border-black text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>Corporate</button>
                </div>
              </div>
            )}

            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="IDENT: EMAIL@HUB.EU" className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-xl text-black text-[11px] font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all shadow-inner" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD PROTOCOL" className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-xl text-black text-[11px] font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all shadow-inner" required />

            <button type="submit" className="w-full bg-red-600 text-white p-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.5em] hover:bg-black transition-all shadow-xl group flex items-center justify-center">
              <span>Sincronizar Cluster</span>
              <Zap className="ml-4 w-6 h-6 group-hover:scale-125 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
