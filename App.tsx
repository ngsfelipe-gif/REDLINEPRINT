
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
import { X, Bell, Zap, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  
  // Estado Global Sincronizado
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [showLogin, setShowLogin] = useState(false);
  const [accountSubTab, setAccountSubTab] = useState('overview');
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const createNotification = (type: Notification['type'], orderId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: `NT-${Date.now()}`,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      type,
      orderId
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    setTimeout(() => setActiveToast(null), 5000);
  };

  // HANDLERS ENCOMENDAS
  const handleAddOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    setActiveTab('account');
    setAccountSubTab('orders');
    createNotification('Confirmed', order.id, "Ordem Enviada", `Aguardando aprovação do Hub ${order.nodeId}.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductionJob['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const progressMap: Record<string, number> = {
          'Pendente Aprovação Hub': 5, 'Orçamento Gerado': 10, 'Pre-flight': 25, 
          'Impressão': 55, 'Acabamento': 80, 'Expedição': 95, 'Entregue': 100
        };
        createNotification('Production', o.id, "Status Alterado", `Sua encomenda está agora em: ${newStatus}`);
        return { ...o, status: newStatus, progress: progressMap[newStatus] || o.progress };
      }
      return o;
    }));
  };

  // HANDLERS HUBS
  const handleAddHub = (hub: PartnerNode) => {
    setHubs(prev => [...prev, hub]);
    createNotification('System', hub.id, "Novo Hub", `O hub ${hub.name} foi submetido para validação administrativa.`);
  };

  const handleUpdateHubStatus = (hubId: string, status: PartnerNode['status']) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, status } : h));
  };

  // HANDLERS TICKETS
  const handleAddTicketMessage = (ticketId: string, text: string) => {
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

  const handleCreateTicket = (ticket: SupportTicket) => {
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
      <div className="pt-24 lg:pt-32">
        {activeTab === 'home' && (
          <Hero 
            onStart={() => setActiveTab('products')} 
            onB2B={() => setActiveTab('partners')} 
          />
        )}
        
        {activeTab === 'products' && (
          <ProductBuilder onAddOrder={handleAddOrder} user={user} hubs={hubs} />
        )}
        
        {activeTab === 'partners' && (
          <B2BPartners hubs={hubs} />
        )}
        
        {activeTab === 'production' && (
          <Backoffice 
            orders={orders} 
            hubs={hubs}
            user={user} 
            onUpdateStatus={handleUpdateOrderStatus} 
            onAddHub={handleAddHub}
            onUpdateHub={handleUpdateHubStatus}
          />
        )}
        
        {activeTab === 'account' && (user ? (
          <Account 
            user={user} 
            orders={orders} 
            tickets={tickets} 
            notifications={notifications}
            onAddMessage={handleAddTicketMessage}
            onCreateTicket={handleCreateTicket}
            subTab={accountSubTab}
            setSubTab={setAccountSubTab}
            onLogout={() => { setUser(null); setActiveTab('home'); }}
            onApproveOrder={(id) => handleUpdateOrderStatus(id, 'Pre-flight')}
          />
        ) : (
          <LoginPanel onLogin={(u) => { setUser(u); setActiveTab('account'); }} onBack={() => setActiveTab('home')} />
        ))}
      </div>

      {activeToast && (
        <div className="fixed bottom-10 right-10 z-[3000] w-[380px] bg-black text-white p-6 rounded-[2rem] shadow-2xl border-l-[10px] border-red-600 animate-in slide-in-from-right-10">
           <div className="flex items-center space-x-4">
              <div className="bg-red-600 p-3 rounded-2xl">
                 <Zap className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex-grow">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">{activeToast.title}</h4>
                 <p className="text-[11px] font-bold text-gray-400 mt-1 italic line-clamp-2">{activeToast.message}</p>
              </div>
              <button onClick={() => setActiveToast(null)} className="text-gray-600 hover:text-white transition-all"><X className="w-5 h-5"/></button>
           </div>
        </div>
      )}

      <SupportChat />
      {showLogin && !user && <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} />}
    </Layout>
  );
};

export default App;
