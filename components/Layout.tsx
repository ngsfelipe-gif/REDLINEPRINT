
import React from 'react';
import { ShoppingCart, User, Printer, Award, Globe, LogIn } from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLoginClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLoginClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <div className="bg-black text-white text-[10px] font-bold tracking-[0.3em] uppercase py-2 text-center z-[60] relative">
        Portal Industrial REDLINE // Hub Europeu v.4.0
      </div>

      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 glass rounded-full px-8 h-20 flex items-center justify-between shadow-2xl border border-gray-200/50">
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="bg-[#E60000] p-2 rounded-xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-red-200">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <span className="font-brand text-2xl tracking-tighter font-black italic">
            REDLINE<span className="text-[#E60000]">PRINT</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-12 font-black text-[11px] uppercase tracking-[0.2em] text-gray-400">
          {['Products', 'Production', 'Support'].map((item) => (
            <button 
              key={item} 
              className={`hover:text-[#E60000] transition-all relative py-2 ${activeTab === item.toLowerCase() ? 'text-black' : ''}`}
              onClick={() => setActiveTab(item.toLowerCase())}
            >
              {item}
              {activeTab === item.toLowerCase() && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E60000] rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          {user && (
            <div className="hidden md:flex items-center bg-black/5 rounded-full px-4 py-2 space-x-2 border border-black/5">
              <Award className="w-4 h-4 text-red-600" />
              <span className="text-[10px] font-black uppercase">{user.tier} Member</span>
            </div>
          )}
          
          <button 
            className="flex items-center space-x-3 bg-black text-white px-8 py-3.5 rounded-full hover:bg-[#E60000] transition-all shadow-xl group"
            onClick={user ? () => setActiveTab('account') : onLoginClick}
          >
            {user ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {user ? user.name.split(' ')[0] : 'Entrar'}
            </span>
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <footer className="bg-black text-white py-32 px-6 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
          <div className="space-y-10">
            <div className="flex items-center space-x-3">
              <div className="bg-[#E60000] p-2.5 rounded-xl">
                <Printer className="w-8 h-8 text-white" />
              </div>
              <span className="font-brand text-3xl font-black italic tracking-tighter">REDLINE</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Liderando a revolução industrial gráfica na Europa com inteligência artificial e logística de alta performance.
            </p>
          </div>
          
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.5em] mb-10 text-[#E60000]">SOLUÇÕES</h4>
            <ul className="space-y-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <li><a href="#" className="hover:text-red-600 transition-colors">Business Cards Pro</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">Large Format Vinyl</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">B2B Dashboards</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">API Integration</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.5em] mb-10 text-[#E60000]">HUB EUROPA</h4>
            <ul className="space-y-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <li>Frankfurt, DE</li>
              <li>Lisbon, PT</li>
              <li>Madrid, ES</li>
              <li>Milan, IT</li>
            </ul>
          </div>

          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl">
            <h4 className="font-black uppercase text-[10px] tracking-[0.4em] mb-4">REDLINE INSIDER</h4>
            <p className="text-[10px] text-gray-500 mb-8 font-black uppercase tracking-widest">Recebe atualizações de engenharia.</p>
            <div className="flex flex-col space-y-4">
              <input type="email" placeholder="EMAIL@EMPRESA.EU" className="bg-black border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#E60000]" />
              <button className="bg-[#E60000] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Sincronizar</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
