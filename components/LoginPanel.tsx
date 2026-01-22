
import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ShieldCheck, Printer, X, AlertCircle, Cpu, Zap, Info } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginPanelProps {
  onLogin: (user: UserType) => void;
  onBack: () => void;
  registeredUsers: UserType[];
  onRegisterUser: (user: UserType) => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, onBack, registeredUsers, onRegisterUser }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    setTimeout(() => {
      if (mode === 'register') {
        const newUser: UserType = {
          id: `USR-${Math.floor(Math.random() * 9000) + 1000}`,
          name,
          email,
          password,
          role: 'Cliente',
          status: 'Pendente', // Needs approval from Admin
          permissions: ['VIEW_ORDERS', 'PLACE_ORDERS'],
          tier: 'Bronze',
          joinedAt: Date.now()
        };
        onRegisterUser(newUser);
        onLogin(newUser);
        setIsProcessing(false);
        return;
      }

      // CENTRALIZED SYNC CHECK
      const foundUser = registeredUsers.find(u => 
        (u.email.toLowerCase() === email.toLowerCase() || u.id.toLowerCase() === email.toLowerCase()) && 
        u.password === password
      );

      if (foundUser) {
        if (foundUser.status === 'Bloqueado') {
          setError('ACESSO BLOQUEADO: Contacte o Super Admin Master.');
          setIsProcessing(false);
          return;
        }
        onLogin(foundUser as UserType);
      } else {
        setError('PROTOCOL ERROR: Credenciais inválidas ou Terminal offline.');
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-black/70 rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl m-auto animate-in zoom-in-95 duration-700">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[600] bg-black/98 flex flex-col items-center justify-center text-center p-16 animate-in fade-in">
             <div className="relative mb-12">
                <div className="w-40 h-40 border-8 border-white/5 rounded-full flex items-center justify-center">
                  <Cpu className="w-16 h-16 text-red-600 animate-pulse" />
                </div>
                <div className="absolute inset-0 w-40 h-40 border-t-8 border-red-600 rounded-full animate-spin" />
             </div>
             <h3 className="text-4xl font-brand font-black italic text-white uppercase tracking-tighter mb-4">Handshaking Grid...</h3>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Validando Protocolos R2 Industrial</p>
          </div>
        )}

        {/* LEFT BRAND PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-br from-red-600 to-red-950 text-white relative">
          <div>
            <div className="flex items-center space-x-5 mb-16">
               <div className="bg-black p-4 rounded-3xl shadow-2xl"><Printer className="w-10 h-10" /></div>
               <span className="font-brand text-4xl font-black italic tracking-tighter uppercase">REDLINE</span>
            </div>
            <h2 className="text-7xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter mb-10">Terminal <br /> <span className="text-black">Industrial.</span></h2>
            <div className="bg-black/30 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] block mb-4 text-white/50">Rede Segura R2 Master</span>
               <p className="text-[10px] text-white/80 leading-relaxed font-mono">Aceda ao seu hub de produção global. Monitorização de ativos em tempo real.</p>
            </div>
          </div>
          <button className="flex items-center space-x-6 text-[11px] font-black uppercase tracking-[0.5em] bg-black text-white px-12 py-6 rounded-2xl hover:bg-white hover:text-black transition-all shadow-2xl border border-white/5">
             <ShieldCheck className="w-5 h-5 text-red-600" /> 
             <span>Protocolo Criptografado</span>
          </button>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div className="p-12 md:p-24 flex flex-col justify-center relative bg-white">
          <button onClick={onBack} className="absolute top-12 right-12 p-4 text-gray-200 hover:text-red-600 transition-all transform hover:rotate-90"> <X className="w-10 h-10" /> </button>
          
          <div className="mb-16">
            <h3 className="text-5xl font-brand font-black italic uppercase text-black tracking-tighter leading-none mb-4">{mode === 'login' ? 'Auth Node' : 'Register Asset'}</h3>
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.5em] font-black italic">Acesso Restrito Redline Grid</p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border-l-[8px] border-red-600 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center space-x-4 animate-in slide-in-from-top-4"> 
              <AlertCircle className="w-6 h-6" /> 
              <span>{error}</span> 
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-8">
            {mode === 'register' && (
              <div className="relative group">
                 <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-colors" />
                 <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="NOME DA ENTIDADE" className="w-full bg-gray-50 pl-16 p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" required />
              </div>
            )}
            <div className="relative group">
               <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-colors" />
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="IDENTIFICADOR MASTER (EMAIL)" className="w-full bg-gray-50 pl-16 p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" required />
            </div>
            <div className="relative group">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-colors" />
               <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="PROTOCOLO DE ACESSO" className="w-full bg-gray-50 pl-16 p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" required />
            </div>
            
            <button type="submit" className="w-full bg-red-600 text-white p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.6em] hover:bg-black transition-all shadow-2xl flex items-center justify-center space-x-6"> 
               <span>Iniciar Sincronização</span> <Zap className="w-7 h-7" /> 
            </button>
            
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-center text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 hover:text-red-600 transition-all"> 
               {mode === 'login' ? 'Candidatar a Membro do Grid / Hub' : 'Voltar ao Login Master'} 
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
