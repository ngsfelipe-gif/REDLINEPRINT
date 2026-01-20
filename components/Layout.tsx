
import React from 'react';
import { ShoppingCart, User, Printer, Award, Globe, LogIn, LogOut } from 'lucide-react';
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
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <div className="bg-black text-white text-[10px] font-bold tracking-[0.3em] uppercase py-2 text-center z-[60] relative">
        Portal Industrial REDLINE // Hub Europeu v.6.0 // Frankfurt-Lisboa
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
          {[
            { id: 'products', label: 'Catálogo' },
            { id: 'production', label: 'Produção' },
            { id: 'support', label: 'Suporte' }
          ].map((item) => (
            <button 
              key={item.id} 
              className={`hover:text-[#E60000] transition-all relative py-2 ${activeTab === item.id ? 'text-black' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
              {activeTab === item.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E60000] rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="hidden md:flex items-center bg-black/5 rounded-full px-4 py-2 space-x-2 border border-black/5">
              <Award className="w-4 h-4 text-red-600" />
              <span className="text-[10px] font-black uppercase">Membro {user.tier}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center space-x-3 bg-black text-white px-8 py-3.5 rounded-full hover:bg-[#E60000] transition-all shadow-xl group"
              onClick={user ? () => setActiveTab('account') : onLoginClick}
            >
              {user ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {user ? user.name.split(' ')[0] : 'Entrar'}
              </span>
            </button>

            {user && (
              <button 
                onClick={onLogout}
                className="bg-gray-100 p-3.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-md active:scale-95"
                title="Desautenticar Node"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
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
              A liderar a revolução gráfica industrial na Europa com Inteligência Artificial e logística de alto rendimento. Sincronizamos o digital com o tátil.
            </p>
          </div>
          
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.5em] mb-10 text-[#E60000]">SOLUÇÕES</h4>
            <ul className="space-y-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <li><a href="#" className="hover:text-red-600 transition-colors">Cartões de Visita Pro</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">Vinil de Grande Formato</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">Dashboards B2B</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">Integração via API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.5em] mb-10 text-[#E60000]">HUBS EUROPA</h4>
            <ul className="space-y-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <li>Frankfurt, DE (Principal)</li>
              <li>Lisboa, PT (Sul)</li>
              <li>Madrid, ES</li>
              <li>Milão, IT</li>
            </ul>
          </div>

          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl">
            <h4 className="font-black uppercase text-[10px] tracking-widest mb-4">REDLINE INSIDER</h4>
            <p className="text-[10px] text-gray-500 mb-8 font-black uppercase tracking-widest">Receba relatórios de engenharia gráfica.</p>
            <div className="flex flex-col space-y-4">
              <input type="email" placeholder="EMAIL@EMPRESA.EU" className="bg-black border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#E60000]" />
              <button className="bg-[#E60000] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Sincronizar</button>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-10 border-t border-white/5 text-center">
           <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">© 2025 REDLINE PRINTING SYSTEMS // TECNOLOGIA ATÓMICA GARANTIDA</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
