
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Printer, Award, Globe, LogIn, LogOut, Menu, 
  ChevronDown, Twitter, Linkedin, Github, Instagram, Mail, Shield, 
  Cpu, Zap, Activity, Radio, MapPin, ExternalLink, ShieldCheck, Terminal, Server,
  Package, Barcode, CreditCard, Truck, Store
} from 'lucide-react';
import { User as UserType, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

const AnimatedLogo = ({ isScrolled }: { isScrolled: boolean }) => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [ShoppingCart, Package, Barcode, CreditCard, Truck, Store];
  const CurrentIcon = icons[iconIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <div className={`bg-[#CC0000] p-1.5 rounded-lg transition-all duration-700 shadow-lg ${isScrolled ? 'scale-90' : 'scale-100'}`}>
      <CurrentIcon className="text-white w-5 h-5 animate-in fade-in zoom-in duration-500" />
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, language, setLanguage, onLoginClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <div className={`bg-black text-white text-[9px] font-black tracking-[0.4em] uppercase py-2 text-center z-[70] fixed w-full transition-all duration-500 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        REDLINE // R2 INDUSTRIAL MARKET GRID // {language} VERSION
      </div>

      <nav className={`fixed left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-500 rounded-full flex items-center justify-between shadow-2xl border ${
        isScrolled 
        ? 'top-4 h-16 px-6 bg-white/80 backdrop-blur-lg border-gray-200/50 scale-[0.98]' 
        : 'top-12 h-20 px-10 bg-white border-transparent'
      }`}>
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <AnimatedLogo isScrolled={isScrolled} />
            <span className={`font-brand tracking-tighter font-black italic transition-all ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
              REDLINE<span className="text-[#CC0000]">MARKET</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-8 font-black text-[9px] uppercase tracking-widest text-gray-400">
            <button onClick={() => setActiveTab('products')} className={`hover:text-black transition-all ${activeTab === 'products' ? 'text-black' : ''}`}>{t.nav_catalog}</button>
            <button onClick={() => setActiveTab('live')} className={`hover:text-red-600 flex items-center space-x-2 transition-all ${activeTab === 'live' ? 'text-red-600' : ''}`}>
              <Activity className="w-3 h-3" />
              <span>Market Live</span>
            </button>
            <button onClick={() => setActiveTab('partners')} className={`hover:text-black flex items-center space-x-2 transition-all ${activeTab === 'partners' ? 'text-black' : ''}`}>
              <Server className="w-3 h-3" />
              <span>Nodos</span>
            </button>
            {user && (user.role === 'Administrador' || user.role === 'B2B_Admin') && (
              <button onClick={() => setActiveTab('production')} className={`hover:text-black transition-all ${activeTab === 'production' ? 'text-black' : ''}`}>{t.nav_production}</button>
            )}
            <button onClick={() => setActiveTab('support')} className={`hover:text-black transition-all ${activeTab === 'support' ? 'text-black' : ''}`}>{t.nav_support}</button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
             <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-gray-100 transition-all border border-gray-100">
                <Globe className="w-3 h-3 text-red-600" /> <span>{language}</span> <ChevronDown className="w-3 h-3" />
             </button>
             {showLangMenu && (
               <div className="absolute top-full right-0 mt-2 bg-black text-white p-2 rounded-2xl shadow-2xl w-24 space-y-1 animate-in slide-in-from-top-2">
                  {['PT', 'EN', 'ES', 'FR'].map((l) => (
                    <button key={l} onClick={() => { setLanguage(l as Language); setShowLangMenu(false); }} className={`w-full text-left px-4 py-2 rounded-xl text-[9px] font-black hover:bg-red-600 transition-all ${language === l ? 'bg-red-600' : ''}`}> {l} </button>
                  ))}
               </div>
             )}
          </div>

          <button onClick={user ? () => setActiveTab('account') : onLoginClick} className={`bg-black text-white rounded-full hover:bg-red-600 transition-all shadow-xl font-black uppercase text-[9px] tracking-widest flex items-center space-x-3 ${isScrolled ? 'px-6 py-2.5' : 'px-8 py-3.5'}`}>
            {user ? <User className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
            <span>{user ? user.name.split(' ')[0] : t.nav_login}</span>
          </button>

          {user && (
            <button onClick={onLogout} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-red-600 transition-all">
               <LogOut className="w-3 h-3" />
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      {/* Futuristic R2 Footer */}
      <footer className="relative bg-[#0A0A0A] text-white pt-32 pb-12 px-8 mt-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600/20">
           <div className="laser-line"></div>
        </div>
        <div className="absolute inset-0 industrial-grid opacity-[0.03] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] text-[20vw] font-brand font-black italic text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter">
          Redline Market
        </div>

        <div className="max-w-[1500px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="space-y-10">
              <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => setActiveTab('home')}>
                <div className="p-2.5 bg-red-600 rounded-xl rotate-12 group-hover:rotate-0 transition-all shadow-[0_0_30px_rgba(204,0,0,0.4)]">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <span className="font-brand text-4xl font-black italic tracking-tighter uppercase">REDLINE<span className="text-red-600">MARKET</span></span>
              </div>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-relaxed italic border-l-4 border-red-600 pl-8 max-w-xs">
                Fabricando ativos visuais atómicos através de um grid global de nodes sincronizados. <br/>
                <span className="text-white mt-4 block">Protocolo R2 v.4.2-STABLE Market Cluster Ativo em 14 Unidades.</span>
              </p>
              <div className="flex items-center space-x-4 pt-4">
                 {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                   <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all group">
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                   </a>
                 ))}
              </div>
            </div>

            <div className="space-y-10">
               <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center">
                  <Terminal className="w-4 h-4 mr-3" /> Grid Access
               </h4>
               <ul className="space-y-5">
                  {['Catálogo Industrial', 'Portal de Nodes B2B', 'Suporte de Engenharia', 'API para Desenvolvedores', 'Redline Corporate'].map((link) => (
                    <li key={link}>
                       <a href="#" className="text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:pl-3 transition-all flex items-center group">
                          <Zap className="w-3 h-3 mr-3 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {link}
                       </a>
                    </li>
                  ))}
               </ul>
            </div>

            <div className="space-y-10">
               <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center">
                  <Activity className="w-4 h-4 mr-3" /> Live Telemetry
               </h4>
               <div className="space-y-6">
                  {[
                    { city: 'LISBON', status: 'Online', lat: '12ms' },
                    { city: 'FRANKFURT', status: 'Busy', lat: '0.2ms' },
                    { city: 'NEW YORK', status: 'Online', lat: '45ms' },
                    { city: 'TOKYO', status: 'Maint', lat: '---' }
                  ].map((node) => (
                    <div key={node.city} className="flex items-center justify-between group cursor-default">
                       <div className="flex items-center space-x-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Online' ? 'bg-green-500 animate-pulse' : node.status === 'Busy' ? 'bg-orange-500' : 'bg-red-600'}`} />
                          <span className="text-[10px] font-mono font-bold text-gray-500 group-hover:text-white transition-colors">{node.city} UNIT</span>
                       </div>
                       <span className="text-[9px] font-mono text-red-600 opacity-40 group-hover:opacity-100">{node.lat}</span>
                    </div>
                  ))}
               </div>
               <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center space-x-3 text-gray-500">
                     <ShieldCheck className="w-4 h-4 text-green-500" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Master Control Verified</span>
                  </div>
               </div>
            </div>

            <div className="space-y-10">
               <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center">
                  <Radio className="w-4 h-4 mr-3" /> Grid Sync
               </h4>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed italic">
                  Subscreva a telemetria do grid para receber atualizações de disponibilidade e novos acabamentos.
               </p>
               <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 focus-within:border-red-600 transition-all">
                  <input type="email" placeholder="EMAIL@NODE.COM" className="bg-transparent px-4 py-3 text-[10px] font-black uppercase outline-none flex-grow placeholder:text-gray-700" />
                  <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase hover:bg-white hover:text-black transition-all">Sync</button>
               </div>
               <div className="flex items-center space-x-3 text-[9px] font-black uppercase text-gray-700 tracking-[0.2em]">
                  <Globe className="w-3 h-3" />
                  <span>Global Coverage 99.9% Up</span>
               </div>
            </div>

          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-10 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
               <span>© 2025 REDLINE MARKET SYSTEMS</span>
               <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-white transition-colors">Compliance R2</a>
            </div>
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <Cpu className="w-3 h-3 text-red-600" />
                  <span className="text-[9px] font-black uppercase text-gray-400">Node ID: 0x-7FF-MASTER</span>
               </div>
               <div className="text-[9px] font-black uppercase text-gray-500 tracking-[0.5em] animate-pulse">
                  System Status: <span className="text-green-500">OPTIMAL</span>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;