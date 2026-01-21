
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Printer, Award, Globe, LogIn, LogOut, Menu } from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLoginClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      {/* Top bar sumindo no scroll */}
      <div className={`bg-black text-white text-[9px] font-black tracking-[0.4em] uppercase py-2 text-center z-[70] fixed w-full transition-all duration-500 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        Portal Industrial REDLINE // Hub Europeu v.9.0 // Frankfurt-Lisboa
      </div>

      <nav className={`fixed left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-500 rounded-full flex items-center justify-between shadow-2xl border ${
        isScrolled 
        ? 'top-4 h-16 px-6 bg-white/80 backdrop-blur-lg border-gray-200/50 scale-[0.98]' 
        : 'top-12 h-20 px-10 bg-white border-transparent'
      }`}>
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className={`bg-[#CC0000] p-1.5 rounded-lg rotate-12 group-hover:rotate-0 transition-all duration-500 shadow-lg ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            <Printer className={`text-white transition-all ${isScrolled ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <span className={`font-brand tracking-tighter font-black italic transition-all ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
            REDLINE<span className="text-[#CC0000]">PRINT</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-10 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
          {[
            { id: 'products', label: 'Catálogo' },
            { id: 'production', label: 'Produção' },
            { id: 'support', label: 'Suporte' }
          ].map((item) => (
            <button 
              key={item.id} 
              className={`hover:text-[#CC0000] transition-all relative py-2 ${activeTab === item.id ? 'text-black' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
              {activeTab === item.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#CC0000] rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <div className={`hidden md:flex items-center bg-black/5 rounded-full px-3 py-1.5 space-x-2 border border-black/5 transition-all ${isScrolled ? 'opacity-0 scale-90 w-0 overflow-hidden' : 'opacity-100'}`}>
              <Award className="w-3 h-3 text-red-600" />
              <span className="text-[8px] font-black uppercase">Membro {user.tier}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button 
              className={`flex items-center space-x-3 bg-black text-white rounded-full hover:bg-[#CC0000] transition-all shadow-xl group ${isScrolled ? 'px-5 py-2' : 'px-8 py-3.5'}`}
              onClick={user ? () => setActiveTab('account') : onLoginClick}
            >
              {user ? <User className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
              <span className="text-[9px] font-black uppercase tracking-widest">
                {user ? user.name.split(' ')[0] : 'Entrar'}
              </span>
            </button>

            {user && (
              <button 
                onClick={onLogout}
                className={`bg-gray-100 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-md active:scale-95 ${isScrolled ? 'p-2' : 'p-3.5'}`}
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-black text-white py-20 px-6 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Printer className="w-6 h-6 text-red-600" />
              <span className="font-brand text-xl font-black italic tracking-tighter">REDLINE</span>
            </div>
            <p className="text-gray-500 text-[11px] font-medium leading-relaxed">
              Sincronizamos o digital com o tátil através de IA industrial.
            </p>
          </div>
          
          <div>
            <h4 className="font-black uppercase text-[8px] tracking-[0.5em] mb-6 text-red-600">PROTOCOLOS</h4>
            <ul className="space-y-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <li><button onClick={() => setActiveTab('products')} className="hover:text-red-600">Catálogo Pro</button></li>
              <li><button onClick={() => setActiveTab('production')} className="hover:text-red-600">Dashboard Backoffice</button></li>
              <li><button onClick={() => setActiveTab('account')} className="hover:text-red-600">Minha Célula</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-[8px] tracking-[0.5em] mb-6 text-red-600">NODE R2</h4>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-loose">
              Frankfurt, DE // Sede Global<br/>Lisboa, PT // Hub Sul
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <h4 className="font-black uppercase text-[8px] tracking-widest mb-4">Sincronização</h4>
            <div className="flex flex-col space-y-2">
              <input type="email" placeholder="EMAIL@EMPRESA.EU" className="bg-black border border-white/10 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-red-600" />
              <button className="bg-red-600 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Sincronizar</button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-center">
           <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">© 2025 REDLINE PRINTING SYSTEMS // HUB R2 ACTIVE</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
