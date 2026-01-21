
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import SupportCenter from './components/SupportCenter';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import B2BPartners from './components/B2BPartners';
import { MOCK_JOBS, MOCK_TICKETS } from './constants';
import { ProductionJob, User, SupportTicket, Notification } from './types';
import { X, Bell, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [accountSubTab, setAccountSubTab] = useState('overview');
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  
  const createNotification = (type: Notification['type'], orderId: string, productName: string, customMsg?: string) => {
    const titles = {
      Confirmed: "[RL-SYNC] Orçamento Validado",
      Production: "[RL-CORE] Produção Ativa",
      Shipped: "[RL-LOG] Em Trânsito",
      Delivered: "[RL-FINAL] Concluído"
    };

    const newNotif: Notification = {
      id: `NT-${Date.now()}`,
      title: titles[type],
      message: customMsg || `O módulo ${orderId} (${productName}) alterou o seu estado no cluster Frankfurt.`,
      timestamp: Date.now(),
      read: false,
      type,
      orderId
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    const timeout = setTimeout(() => setActiveToast(prev => prev?.id === newNotif.id ? null : prev), 6000);
    return () => clearTimeout(timeout);
  };

  const addOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    setAccountSubTab('orders');
    setActiveTab('account');
    createNotification('Confirmed', order.id, order.product, "Pedido injetado com sucesso no cluster. Aguarda validação técnica.");
  };

  const updateOrderStatus = (orderId: string, newStatus: ProductionJob['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const progressMap: Record<string, number> = {
          'Orçamento Gerado': 10,
          'Pre-flight': 25,
          'Impressão': 55,
          'Acabamento': 80,
          'Expedição': 95,
          'Entregue': 100
        };
        
        let notifType: Notification['type'] = 'Production';
        if (newStatus === 'Expedição') notifType = 'Shipped';
        if (newStatus === 'Entregue') notifType = 'Delivered';
        
        if (o.status !== newStatus) {
          createNotification(notifType, o.id, o.product);
        }
        
        return { ...o, status: newStatus, progress: progressMap[newStatus] };
      }
      return o;
    }));
  };

  const approveOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        createNotification('Production', o.id, o.product, "Orçamento aprovado pelo cliente. Movido para Pre-flight molecular.");
        return { ...o, status: 'Pre-flight', progress: 25 };
      }
      return o;
    }));
  };

  const handleSupportLink = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setActiveTab('account');
      setAccountSubTab('inbox');
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLoginClick={() => setShowLogin(true)} onLogout={() => { setUser(null); setActiveTab('home'); }}>
      {activeTab === 'home' && (
        <Hero 
          onStart={() => setActiveTab('products')} 
          onB2B={() => setActiveTab('partners')} 
        />
      )}
      {activeTab === 'products' && <ProductBuilder onAddOrder={addOrder} user={user} />}
      {activeTab === 'partners' && <B2BPartners />}
      {activeTab === 'production' && <Backoffice orders={orders} user={user} onUpdateStatus={updateOrderStatus} />}
      {activeTab === 'support' && <SupportCenter onOpenTicket={handleSupportLink} />}
      {activeTab === 'account' && (user ? (
        <Account 
          user={user} 
          orders={orders} 
          tickets={tickets} 
          notifications={notifications}
          onAddTicket={(t) => setTickets(prev => [t, ...prev])}
          subTab={accountSubTab}
          setSubTab={setAccountSubTab}
          onLogout={() => { setUser(null); setActiveTab('home'); }}
          onApproveOrder={approveOrder}
        />
      ) : (
        <LoginPanel onLogin={(u) => { setUser(u); setActiveTab('account'); }} onBack={() => setActiveTab('home')} />
      ))}
      
      {activeToast && (
        <div className="fixed top-24 right-6 z-[2000] w-[350px] bg-white border-l-[6px] border-red-600 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.15)] animate-in slide-in-from-right-10 flex items-start space-x-4 rounded-r-3xl border border-gray-100">
           <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-200">
              <Zap className="w-4 h-4 text-white animate-pulse" />
           </div>
           <div className="flex-grow">
              <h4 className="text-[10px] font-black uppercase text-black mb-1 tracking-widest">{activeToast.title}</h4>
              <p className="text-[10px] font-medium text-gray-400 line-clamp-2 italic leading-relaxed">{activeToast.message}</p>
           </div>
           <button onClick={() => setActiveToast(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-all"><X className="w-4 h-4 text-gray-300" /></button>
        </div>
      )}

      <SupportChat />
      {showLogin && !user && <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} />}
    </Layout>
  );
};

export default App;
