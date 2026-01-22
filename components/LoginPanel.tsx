
import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ShieldCheck, Printer, X, AlertCircle, Cpu, Zap, Info, KeyRound } from 'lucide-react';
import { User as UserType, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface LoginPanelProps {
  onLogin: (user: UserType) => void;
  onBack: () => void;
  registeredUsers: UserType[];
  onRegisterUser: (user: UserType) => void;
  language: Language;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, onBack, registeredUsers, onRegisterUser, language }) => {
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
    
    // Simulação de latência de rede industrial
    setTimeout(() => {
      const foundUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError("ERRO DE PROTOCOLO: Credenciais não reconhecidas no Grid R2.");
        setIsProcessing(false);
      }
    }, 1500);
  };

  const quickLogin = (role: 'admin' | 'hub') => {
    if (role === 'admin') {
      setEmail('admin@redline.eu');
      setPassword('admin');
    } else {
      setEmail('fra@redline.eu');
      setPassword('hub');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-black rounded-[5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(204,0,0,0.4)] m-auto">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[600] bg-black/98 flex flex-col items-center justify-center text-center p-16 animate-in fade-in">
             <Cpu className="w-20 h-20 text-red-600 animate-spin mb-8" />
             <h3 className="text-4xl font-brand font-black italic text-white uppercase tracking-tighter mb-4">Syncing Handshake...</h3>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">R2 ENCRYPTION ACTIVE</p>
          </div>
        )}

        {/* Left Panel: Brand & Info */}
        <div className="hidden lg:flex flex-col justify-between p-24 bg-gradient-to-br from-red-600 to-red-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10"><Printer className="w-96 h-96" /></div>
          <div>
            <div className="flex items-center space-x-5 mb-24">
               <Printer className="w-12 h-12" />
               <span className="font-brand text-4xl font-black italic tracking-tighter uppercase">REDLINE</span>
            </div>
            <h2 className="text-8xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter mb-10">{t.login_title}.</h2>
            
            <div className="space-y-6">
              <div className="bg-black/30 p-8 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                 <p className="text-[11px] text-white/60 leading-relaxed font-black uppercase tracking-widest italic">Acesso ao Grid R2 industrial para gestão de ativos globais e nodes de manufatura.</p>
              </div>

              {/* Demo Credentials Helper Box */}
              <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-4">
                 <div className="flex items-center space-x-3 mb-2">
                    <KeyRound className="w-4 h-4 text-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Acesso Rápido para Auditoria:</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => quickLogin('admin')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-[9px] font-black uppercase tracking-tighter text-left border border-white/5 transition-all">
                       <span className="block text-red-500 mb-1">Super Admin</span>
                       admin@redline.eu
                    </button>
                    <button onClick={() => quickLogin('hub')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-[9px] font-black uppercase tracking-tighter text-left border border-white/5 transition-all">
                       <span className="block text-red-500 mb-1">Hub B2B</span>
                       fra@redline.eu
                    </button>
                 </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <ShieldCheck className="w-6 h-6 text-red-600" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Protocolo Seguro v.9.2-STABLE</span>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="p-20 md:p-32 flex flex-col justify-center relative bg-white">
          <button onClick={onBack} className="absolute top-16 right-16 p-5 text-gray-200 hover:text-red-600 transition-all transform hover:rotate-90">
            <X className="w-10 h-10"/>
          </button>
          
          <div className="mb-20">
            <h3 className="text-6xl font-brand font-black italic uppercase text-black tracking-tighter leading-none mb-4">{mode === 'login' ? 'Auth Node' : 'Register'}</h3>
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-black italic">Terminal de Conexão R2 Cluster</p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-600 text-red-600 flex items-center space-x-4 rounded-2xl animate-in slide-in-from-top-2">
               <AlertCircle className="w-6 h-6 shrink-0" />
               <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-10">
            {mode === 'register' && (
              <div className="relative group">
                <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all"/>
                <input type="text" placeholder="ENTIDADE / NOME COMPLETO" className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" required />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all"/>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="EMAIL DE ACESSO" 
                className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" 
                required 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all"/>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="PROTOCOL PASS" 
                className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-red-600 text-white p-10 rounded-[3rem] font-black uppercase text-[11px] tracking-[0.5em] hover:bg-black transition-all shadow-2xl flex items-center justify-center space-x-6 group"
            >
               <span>Sincronizar Terminal</span> <Zap className="w-6 h-6 group-hover:animate-bounce" />
            </button>

            <div className="flex flex-col items-center space-y-4 pt-6">
              <button 
                type="button" 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 hover:text-red-600 transition-all"
              >
                 {mode === 'login' ? 'Pedir Acesso ao Grid' : 'Voltar ao Login Master'}
              </button>
              
              <div className="flex items-center space-x-2 text-[8px] font-black text-gray-200 uppercase tracking-widest">
                 <Info className="w-3 h-3" />
                 <span>Audit ID: 0x-RED-SYN-25</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
