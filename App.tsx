
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import SupportCenter from './components/SupportCenter';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import { FEATURES, PRODUCTS, MOCK_JOBS, MOCK_TICKETS } from './constants';
import { ProductionJob, User, SupportTicket, Notification } from './types';
import { ArrowUpRight, Activity, Trophy, Zap, Clock, Package, Monitor, Thermometer, Mail, X, ShieldCheck, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [accountSubTab, setAccountSubTab] = useState('overview');
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  
  const prevOrdersRef = useRef<Record<string, string>>({});

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    setAccountSubTab('overview');
    setShowLogin(false);
  };

  const createNotification = (type: Notification['type'], orderId: string, productName: string) => {
    const titles = {
      Confirmed: "[RL-SYNC] Order Confirmed: Node R2 Validation Success",
      Production: "[RL-CORE] Production Started: Molecular Calibration Active",
      Shipped: "[RL-LOG] Transit Protocol Initiated: Hub Aéreo Node R2",
      Delivered: "[RL-FINAL] Protocol Concluded: Destination Node Handover"
    };

    const messages = {
      Confirmed: `Protocolo de sincronização RL-${orderId} validado. O asset digital foi injetado no cluster de pré-impressão de Frankfurt. Status: Aguardando fila de impressão.`,
      Production: `O motor Quantum iniciou a deposição molecular para o produto ${productName}. Calibração de perfil ICC concluída. Temperatura do core estável em 39.2°C.`,
      Shipped: `Carga industrial ${orderId} despachada via Hub DHL Express Redline. Previsão de chegada no seu node conforme prioridade contratada.`,
      Delivered: `Handover concluído. O produto ${productName} foi entregue e assinado eletronicamente no node de destino. Protocolo de job encerrado.`
    };

    const newNotif: Notification = {
      id: `NT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      title: titles[type],
      message: messages[type],
      timestamp: Date.now(),
      read: false,
      type,
      orderId
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    
    setTimeout(() => {
      setActiveToast(null);
    }, 8000);
  };

  const addOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    setAccountSubTab('orders');
    setActiveTab('account');
    createNotification('Confirmed', order.id, order.product);
  };

  // Status Change Detection Effect
  useEffect(() => {
    orders.forEach(order => {
      const prevStatus = prevOrdersRef.current[order.id];
      if (prevStatus && prevStatus !== order.status) {
        if (order.status === 'Impressão') createNotification('Production', order.id, order.product);
        if (order.status === 'Expedição') createNotification('Shipped', order.id, order.product);
        if (order.status === 'Entregue') createNotification('Delivered', order.id, order.product);
      }
      prevOrdersRef.current[order.id] = order.status;
    });
  }, [orders]);

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

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(currentOrders => {
        return currentOrders.map(order => {
          if (order.status === 'Entregue') return order;
          
          const states: ProductionJob['status'][] = ['Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição', 'Entregue'];
          const currentIndex = states.indexOf(order.status);
          
          if (Math.random() > 0.85 && currentIndex < states.length - 1) {
            const nextStatus = states[currentIndex + 1];
            return { ...order, status: nextStatus, progress: Math.min(100, order.progress + 20) };
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
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLoginClick={() => setShowLogin(true)} onLogout={handleLogout}>
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-1000 relative">
          <Hero onStart={() => setActiveTab('products')} onB2B={() => setShowLogin(true)} />
          
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
            </div>
          </section>
        </div>
      )}

      {activeTab === 'products' && <ProductBuilder onAddOrder={addOrder} user={user} />}
      {activeTab === 'production' && <Backoffice orders={orders} user={user} />}
      {activeTab === 'support' && <SupportCenter onOpenTicket={navigateToTickets} />}
      {activeTab === 'account' && (user ? (
        <Account 
          user={user} 
          orders={orders} 
          tickets={tickets} 
          notifications={notifications}
          onAddTicket={addTicket}
          subTab={accountSubTab}
          setSubTab={setAccountSubTab}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPanel onLogin={(u) => { setUser(u); setActiveTab('account'); }} onBack={() => setActiveTab('home')} />
      ))}
      
      {/* Real-time Industrial Email Toast */}
      {activeToast && (
        <div className="fixed top-32 right-8 z-[600] w-[420px] bg-white border-4 border-black p-0 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-10 duration-500 overflow-hidden">
           <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-4 border-red-600">
              <div className="flex items-center space-x-3">
                 <div className="bg-red-600 p-1.5 rounded-lg">
                    <Mail className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Protocol Email Inbound</span>
              </div>
              <button onClick={() => setActiveToast(null)}><X className="w-5 h-5 text-white/40 hover:text-white transition-colors" /></button>
           </div>
           
           <div className="p-8 industrial-grid">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-red-600" />
                    <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest">TLS 1.3 SECURE</span>
                 </div>
                 <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest">HUB: DE-FRA-R2</span>
              </div>
              
              <h4 className="text-xl font-brand font-black italic uppercase tracking-tighter text-black mb-3 leading-tight">{activeToast.title}</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest line-clamp-3 leading-relaxed mb-6">
                {activeToast.message}
              </p>
              
              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-red-600 shimmer w-full animate-in slide-in-from-left duration-[8s]" />
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Auto-storing in Terminal...</span>
                 <Cpu className="w-4 h-4 text-red-600 animate-pulse" />
              </div>
           </div>
        </div>
      )}

      <SupportChat />
    </Layout>
  );
};

export default App;
