
import React, { useState, useEffect } from 'react';
import { Lock, Mail, User as UserIcon, ShieldCheck, Printer, X, AlertCircle, Cpu, Zap, Info, KeyRound, ArrowRight, ShieldAlert, Loader2, ShoppingCart, Package, Barcode, CreditCard, Truck, Store } from 'lucide-react';
import { User as UserType, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface LoginPanelProps {
  onLogin: (user: UserType) => void;
  onBack: () => void;
  registeredUsers: UserType[];
  onRegisterUser: (user: UserType) => void;
  language: Language;
  onSound?: (type: 'click' | 'success' | 'sync' | 'error' | 'loading') => void;
}

const AnimatedBrandIcon = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [ShoppingCart, Package, Barcode, CreditCard, Truck, Store];
  const CurrentIcon = icons[iconIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <div className="bg-red-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(204,0,0,0.4)] rotate-12 transition-all duration-700">
      <CurrentIcon className="w-8 h-8 text-white animate-in fade-in zoom-in duration-500" />
    </div>
  );
};

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, onBack, registeredUsers, onRegisterUser, language, onSound }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const t = TRANSLATIONS[language];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    onSound?.('loading');
    
    setTimeout(() => {
      const foundUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (foundUser) {
        onSound?.('success');
        onLogin(foundUser);
      } else {
        onSound?.('error');
        setError("ERRO DE PROTOCOLO: Credenciais não sincronizadas no Cluster R2.");
        setIsProcessing(false);
      }
    }, 3000);
  };

  const quickLogin = (role: 'admin' | 'hub') => {
    onSound?.('click');
    if (role === 'admin') {
      setEmail('admin@redline.eu');
      setPassword('admin');
    } else {
      setEmail('fra@redline.eu');
      setPassword('hub');
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-[#0A0A0A] rounded-[5rem] border border-white/5 overflow-hidden shadow-[0_0_150px_rgba(204,0,0,0.3)] m-auto">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[6000] premium-glass-dark flex flex-col items-center justify-center text-center p-16 animate-in fade-in transition-all duration-700">
             <div className="relative mb-12">
                <div className="absolute inset-0 laser-v2 z-10" />
                <div className="p-10 bg-red-600/20 rounded-[4rem] border border-red-600/40 shadow-[0_0_100px_rgba(204,0,0,0.3)] status-pulse">
                   <Cpu className="w-24 h-24 text-red-600 animate-spin" />
                </div>
             </div>
             <h3 className="text-6xl font-brand font-black italic text-white uppercase tracking-tighter mb-4 glitch-loader" data-text="Autenticação Quântica.">Autenticação <br/><span className="text-red-600">Quântica.</span></h3>
             <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                   <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em] animate-pulse italic">Injetando Handshake no Cluster R2-Central...</p>
                </div>
                <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                   <div className="h-full bg-red-600 animate-[flow-horizontal_3s_infinite_linear]" style={{ width: '100%' }} />
                </div>
             </div>
          </div>
        )}

        {/* Brand Side */}
        <div className="hidden lg:flex flex-col justify-between p-24 bg-[#0F0F0F] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-1000"><Store className="w-[500px] h-[500px]" /></div>
          <div className="absolute inset-0 industrial-grid opacity-[0.03]" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-32">
               <AnimatedBrandIcon />
               <span className="font-brand text-3xl font-black italic tracking-tighter uppercase">REDLINE <span className="text-red-600">MARKET</span></span>
            </div>
            
            <h2 className="text-8xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter mb-12">GRID <br/> <span className="text-red-600">ACCESS.</span></h2>
            
            <div className="space-y-8">
              <div className="premium-glass p-10 rounded-[4rem] backdrop-blur-3xl hover:border-red-600/20 transition-all shadow-2xl overflow-hidden relative group/aura">
                 <div className="absolute inset-0 data-shimmer opacity-10" />
                 <p className="text-[13px] text-gray-400 leading-relaxed font-black uppercase tracking-widest italic border-l-4 border-red-600 pl-10 relative z-10">
                    Acesso exclusivo para entidades certificadas. O terminal monitoriza latência, reputação e rendimento de mercado em tempo real.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => quickLogin('admin')} className="bg-white/5 hover:bg-red-600 p-8 rounded-[3rem] text-[10px] font-black uppercase tracking-widest text-left border border-white/5 transition-all group/btn shadow-xl hover:scale-105 active-glow">
                    <span className="block text-gray-500 group-hover/btn:text-white mb-2 italic opacity-60">Role: Super Admin</span>
                    <div className="flex items-center justify-between">
                       <span>Master Control</span>
                       <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
                    </div>
                 </button>
                 <button onClick={() => quickLogin('hub')} className="bg-white/5 hover:bg-black p-8 rounded-[3rem] text-[10px] font-black uppercase tracking-widest text-left border border-white/5 transition-all group/btn shadow-xl hover:scale-105 active-glow">
                    <span className="block text-gray-500 group-hover/btn:text-white mb-2 italic opacity-60">Role: Hub Partner</span>
                    <div className="flex items-center justify-between">
                       <span>Frankfurt Unit</span>
                       <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
                    </div>
                 </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
             <div className="w-3 h-3 bg-red-600 rounded-full status-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Cluster Status: Optimal</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-20 md:p-32 flex flex-col justify-center relative bg-white">
          <button onClick={onBack} className="absolute top-16 right-16 p-5 text-gray-200 hover:text-black transition-all transform hover:rotate-90">
            <X className="w-10 h-10"/>
          </button>
          
          <div className="mb-16">
            <h3 className="text-6xl font-brand font-black italic uppercase text-black tracking-tighter leading-none mb-4">
               {mode === 'login' ? 'Terminal' : 'Registo'}<br/>
               <span className="text-red-600">Identidade.</span>
            </h3>
            <div className="flex items-center space-x-3">
               <div className="w-10 h-[2px] bg-red-600" />
               <p className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-black italic">Handshake Industrial ISO-R2</p>
            </div>
          </div>

          {error && (
            <div className="mb-10 p-8 bg-orange-50 border-l-[10px] border-orange-600 text-orange-900 flex items-center space-x-6 rounded-[2.5rem] animate-in slide-in-from-top-4 shadow-xl">
               <ShieldAlert className="w-8 h-8 shrink-0 animate-bounce" />
               <p className="text-[11px] font-black uppercase tracking-widest italic">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-8">
            {mode === 'register' && (
              <div className="relative group">
                <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all"/>
                <input type="text" placeholder="ENTIDADE / NOME COMPLETO" className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner transition-all" required />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all"/>
              <input 
                type="email" 
                value={email} 
                onChange={e => { setEmail(e.target.value); onSound?.('click'); }} 
                placeholder="EMAIL PROTOCOLO" 
                className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner transition-all" 
                required 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all"/>
              <input 
                type="password" 
                value={password} 
                onChange={e => { setPassword(e.target.value); onSound?.('click'); }} 
                placeholder="PASSWORD MASTER" 
                className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner transition-all" 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase text-[11px] tracking-[0.6em] hover:bg-red-600 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center space-x-6 group border-b-[10px] border-gray-900 active:translate-y-1 active:border-b-0 active-glow"
            >
               <span>Injetar no Grid</span> <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
            </button>

            <div className="flex flex-col items-center space-y-6 pt-10">
              <button 
                type="button" 
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); onSound?.('click'); }} 
                className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-red-600 transition-all"
              >
                 {mode === 'login' ? 'Nova Conta B2B' : 'Regressar ao Terminal'}
              </button>
              
              <div className="flex items-center space-x-4">
                 <ShieldCheck className="w-4 h-4 text-green-500" />
                 <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Encriptação AES-256 Verified</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;