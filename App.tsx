
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import B2BPartners from './components/B2BPartners';
import { MOCK_JOBS, MOCK_TICKETS, MOCK_NODES } from './constants';
import { ProductionJob, User, SupportTicket, Notification, PartnerNode, TicketMessage } from './types';
import { X, Bell, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  
  // Estados Globais Sincronizados
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [showLogin, setShowLogin] = useState(false);
  const [accountSubTab, setAccountSubTab] = useState('overview');
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  // Notificações e Toasts
  const createNotification = (type: Notification['type'], orderId: string, productName: string, customMsg?: string) => {
    const newNotif: Notification = {
      id: `NT-${Date.now()}`,
      title: `[RL-SYNC] Update: ${orderId}`,
      message: customMsg || `O estado da encomenda ${productName} foi atualizado no Cluster R2.`,
      timestamp: Date.now(),
      read: false,
      type,
      orderId
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    setTimeout(() => setActiveToast(null), 5000);
  };

  // Handlers de Encomendas
  const addOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    setActiveTab('account');
    setAccountSubTab('orders');
    createNotification('Confirmed', order.id, order.product, "Injeção de material bem-sucedida.");
  };

  const updateOrderStatus = (orderId: string, newStatus: ProductionJob['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (o.status !== newStatus) {
          createNotification('Production', o.id, o.product, `Status alterado para ${newStatus}`);
        }
        const progressMap: Record<string, number> = {
          'Orçamento Gerado': 10, 'Pre-flight': 25, 'Impressão': 55, 'Acabamento': 80, 'Expedição': 95, 'Entregue': 100
        };
        return { ...o, status: newStatus, progress: progressMap[newStatus] || o.progress };
      }
      return o;
    }));
  };

  const approveOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Pre-flight', progress: 25 } : o));
    createNotification('Production', orderId, 'Job', "Orçamento aprovado pelo cliente.");
  };

  // Handlers de Hubs
  const addHub = (hub: PartnerNode) => {
    setHubs(prev => [...prev, hub]);
    createNotification('Confirmed', 'HUB-SYNC', hub.name, "Novo nodo de produção registado na rede.");
  };

  const updateHubStatus = (hubId: string, status: PartnerNode['status']) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, status } : h));
  };

  // Handlers de Tickets
  const addTicketMessage = (ticketId: string, text: string) => {
    if (!user) return;
    const newMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      text,
      timestamp: Date.now()
    };
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, newMessage] } : t));
  };

  const createTicket = (ticket: SupportTicket) => {
    setTickets(prev => [ticket, ...prev]);
    setActiveTab('account');
    setAccountSubTab('inbox');
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLoginClick={() => setShowLogin(true)} 
      onLogout={() => { setUser(null); setActiveTab('home'); }}
    >
      {activeTab === 'home' && (
        <Hero 
          onStart={() => setActiveTab('products')} 
          onB2B={() => setActiveTab('partners')} 
        />
      )}
      
      {activeTab === 'products' && <ProductBuilder onAddOrder={addOrder} user={user} hubs={hubs} />}
      
      {activeTab === 'partners' && <B2BPartners hubs={hubs} />}
      
      {activeTab === 'production' && (
        <Backoffice 
          orders={orders} 
          hubs={hubs}
          users={[]} // Mock users state could be added
          user={user} 
          onUpdateStatus={updateOrderStatus} 
          onAddHub={addHub}
          onUpdateHub={updateHubStatus}
        />
      )}
      
      {activeTab === 'account' && (user ? (
        <Account 
          user={user} 
          orders={orders} 
          tickets={tickets} 
          notifications={notifications}
          onAddMessage={addTicketMessage}
          onCreateTicket={createTicket}
          subTab={accountSubTab}
          setSubTab={setAccountSubTab}
          onLogout={() => { setUser(null); setActiveTab('home'); }}
          onApproveOrder={approveOrder}
        />
      ) : (
        <LoginPanel onLogin={(u) => { setUser(u); setActiveTab('account'); }} onBack={() => setActiveTab('home')} />
      ))}
      
      {activeToast && (
        <div className="fixed top-24 right-6 z-[2000] w-[350px] bg-white border-l-[6px] border-red-600 p-6 shadow-2xl animate-in slide-in-from-right-10 rounded-r-3xl border border-gray-100">
           <div className="flex items-start space-x-4">
              <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-200">
                 <Zap className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex-grow">
                 <h4 className="text-[10px] font-black uppercase text-black mb-1 tracking-widest">{activeToast.title}</h4>
                 <p className="text-[10px] font-medium text-gray-400 line-clamp-2 italic leading-relaxed">{activeToast.message}</p>
              </div>
              <button onClick={() => setActiveToast(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-300" /></button>
           </div>
        </div>
      )}

      <SupportChat />
      {showLogin && !user && <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} />}
    </Layout>
  );
};

export default App;
