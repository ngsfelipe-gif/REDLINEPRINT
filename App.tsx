
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import SupportCenter from './components/SupportCenter';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import { FEATURES, PRODUCTS, MOCK_JOBS, MOCK_TICKETS } from './constants';
import { ProductionJob, User, SupportTicket } from './types';
import { ArrowUpRight, Activity, Trophy, Zap, Clock, Package, Monitor, Thermometer } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [accountSubTab, setAccountSubTab] = useState('overview');

  const addOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    setAccountSubTab('orders');
    setActiveTab('account');
  };

  const addTicket = (ticket: SupportTicket) => {
    setTickets(prev => [ticket, ...prev]);
  };

  const navigateToTickets = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setAccountSubTab('tickets');
      setActiveTab('account');
    }
  };

  // Quantum Industrial Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(currentOrders => {
        return currentOrders.map(order => {
          if (order.status === 'Expedição') return order;
          
          const states: ProductionJob['status'][] = ['Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição'];
          const currentIndex = states.indexOf(order.status);
          
          // Random chance of progress based on industry priority
          if (Math.random() > 0.7 && currentIndex < states.length - 1) {
            return { ...order, status: states[currentIndex + 1], progress: Math.min(100, order.progress + 25) };
          }
          return order;
        });
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (showLogin && !user) {
    return <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLoginClick={() => setShowLogin(true)}>
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-1000 relative">
          <Hero onStart={() => setActiveTab('products')} onB2B={() => setShowLogin(true)} />
          
          {/* Global Statistics Section */}
          <section className="bg-black py-56 relative overflow-hidden z-20 border-y-[20px] border-red-600">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16 relative z-10">
               {[
                 { v: '22.4M+', l: 'Páginas/Mês', color: 'text-white' },
                 { v: '99.99%', l: 'Uptime Atómico', color: 'text-red-600' },
                 { v: '0.8ms', l: 'Latência de Sync', color: 'text-white' },
                 { v: 'ISO 12k', l: 'Garantia de Cor', color: 'text-red-600' }
               ].map((s, i) => (
                 <div key={i} className="text-center group border-l-4 border-white/5 pl-12 first:border-0 hover:bg-white/5 py-16 transition-all cursor-default transform hover:-translate-y-4">
                    <span className={`${s.color} font-brand text-8xl font-black italic block transition-all tracking-tighter group-hover:scale-110`}>{s.v}</span>
                    <span className="text-[12px] text-gray-500 font-black uppercase tracking-[0.5em] mt-8 block">{s.l}</span>
                 </div>
               ))}
            </div>
          </section>

          {/* Real-Time Factory Feed */}
          <section className="py-48 bg-white relative z-10 industrial-grid">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-16">
                <div className="max-w-4xl">
                   <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-1 bg-red-600" />
                      <h4 className="text-[12px] font-black text-red-600 uppercase tracking-[0.6em]">TELEMETRIA GLOBAL EM DIRECTO</h4>
                   </div>
                   <h3 className="text-[10rem] font-brand font-black italic uppercase tracking-tighter leading-[0.8] mb-0">Production <br /> <span className="text-red-600">Hub Monitor.</span></h3>
                </div>
                <div className="bg-black text-white p-14 rounded-[5rem] shadow-[0_60px_100px_rgba(0,0,0,0.3)] flex items-center space-x-16 border-b-[16px] border-red-600">
                   <div className="text-right">
                      <span className="text-[11px] font-black uppercase text-red-600 block mb-3 tracking-widest">Jobs Activos</span>
                      <span className="text-8xl font-brand font-black italic leading-none">{orders.length}</span>
                   </div>
                   <div className="w-20 h-20 bg-red-600 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                      <Monitor className="w-10 h-10 text-white" />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 {orders.slice(0, 6).map((job) => (
                    <div key={job.id} className="bg-white p-14 rounded-[6rem] border-4 border-gray-50 hover:border-red-600 transition-all group hover:shadow-2xl relative overflow-hidden red-shadow">
                       <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 rounded-full blur-[80px] group-hover:bg-red-600/10 transition-all" />
                       <div className="flex justify-between items-start mb-16 relative z-10">
                          <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center font-brand font-black italic text-3xl transition-all ${job.status === 'Impressão' ? 'bg-red-600 text-white shadow-2xl animate-pulse' : 'bg-black text-white'} group-hover:rotate-12`}>
                             {job.id.charAt(job.id.length-1)}
                          </div>
                          <div className="text-right">
                             <span className="text-[11px] font-black uppercase text-gray-300 block mb-2">Protocolo</span>
                             <span className="text-[11px] font-black uppercase px-8 py-3 bg-gray-50 border-2 border-gray-100 rounded-full shadow-inner">{job.status}</span>
                          </div>
                       </div>
                       <h5 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-6 group-hover:text-red-600 transition-colors leading-none">{job.product}</h5>
                       <p className="text-[13px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">UNIDADE: {job.client}</p>
                       
                       <div className="mt-16 flex items-center justify-between pt-12 border-t-4 border-gray-50">
                          <div className="flex items-center space-x-4">
                             <Clock className="w-5 h-5 text-red-600" />
                             <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">{job.deadline}</span>
                          </div>
                          <span className="font-brand font-black italic text-4xl text-black">€{job.value}</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-32 text-center">
                 <button onClick={() => setActiveTab('production')} className="bg-black text-white px-20 py-10 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.6em] hover:bg-red-600 hover:scale-110 transition-all shadow-2xl group border-b-[10px] border-red-600">
                   Aceder ao Terminal de Fábrica
                   <ArrowUpRight className="inline ml-6 w-6 h-6 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform" />
                 </button>
              </div>
            </div>
          </section>

          {/* B2B Section */}
          <section className="py-64 bg-gray-900 text-white relative z-10 overflow-hidden border-t-[30px] border-black">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/5 skew-x-[-25deg] translate-x-1/2 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-40 items-center relative z-20">
               <div className="animate-in slide-in-from-left-20 duration-1000">
                  <h2 className="text-[12rem] font-brand font-black italic uppercase tracking-tighter leading-[0.7] mb-20">B2B <br /> <span className="text-red-600">Elite.</span></h2>
                  <p className="text-3xl text-white/50 font-medium leading-relaxed max-w-2xl mb-24 border-l-[16px] border-red-600 pl-16">
                    A REDLINE PRINT não é apenas uma plataforma; é o sistema operativo da sua marca. Engenharia gráfica molecular para quem exige consistência absoluta.
                  </p>
                  <div className="grid grid-cols-2 gap-20">
                     {FEATURES.map((f, i) => (
                       <div key={i} className="group cursor-default border-t border-white/10 pt-10">
                          <div className="text-red-600 mb-10 transform group-hover:scale-125 transition-transform duration-700">{f.icon}</div>
                          <h4 className="text-[15px] font-black uppercase tracking-[0.5em] mb-6 group-hover:text-red-600 transition-colors">{f.title}</h4>
                          <p className="text-[12px] text-white/40 uppercase font-bold leading-relaxed tracking-widest">{f.text}</p>
                       </div>
                     ))}
                  </div>
                  <button onClick={() => setShowLogin(true)} className="mt-32 bg-red-600 text-white px-24 py-12 rounded-[3.5rem] font-black uppercase text-[12px] tracking-[0.7em] hover:bg-white hover:text-black transition-all shadow-2xl hover:scale-110">Activar Unidade B2B</button>
               </div>
               <div className="relative group animate-in slide-in-from-right-20 duration-1000">
                  <div className="aspect-[3/4] rounded-[8rem] overflow-hidden border-[32px] border-white/5 shadow-2xl relative transform rotate-6 hover:rotate-0 transition-all duration-[2s]">
                     <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200" className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[10s]" alt="Industrial Machine" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                     <div className="scanline"></div>
                  </div>
                  <div className="absolute -bottom-20 -left-20 bg-red-600 p-20 rounded-[6rem] shadow-[0_80px_160px_rgba(0,0,0,0.8)] border-8 border-white/10 group-hover:scale-110 transition-all duration-700">
                     <Trophy className="w-20 h-20 text-white mb-10" />
                     <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white/60 mb-3">Rank EU</p>
                     <p className="text-5xl font-brand font-black italic text-white uppercase tracking-tighter leading-none">Global Tier 1</p>
                  </div>
               </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'products' && <ProductBuilder onAddOrder={addOrder} user={user} />}
      {activeTab === 'production' && <Backoffice orders={orders} />}
      {activeTab === 'support' && <SupportCenter onOpenTicket={navigateToTickets} />}
      {activeTab === 'account' && (user ? (
        <Account 
          user={user} 
          orders={orders} 
          tickets={tickets} 
          onAddTicket={addTicket}
          subTab={accountSubTab}
          setSubTab={setAccountSubTab}
        />
      ) : (
        <LoginPanel onLogin={(u) => { setUser(u); setActiveTab('account'); }} onBack={() => setActiveTab('home')} />
      ))}
      
      <SupportChat />
    </Layout>
  );
};

export default App;
