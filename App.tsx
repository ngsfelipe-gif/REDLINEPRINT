
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import B2BPartners from './components/B2BPartners';
import PublicGrid from './components/PublicGrid';
import SupportCenter from './components/SupportCenter';
import { MOCK_JOBS, MOCK_NODES, INITIAL_PRODUCTS, MOCK_TICKETS } from './constants';
import { User, ProductionJob, PartnerNode, ExtendedProduct, Language, ProductionLog, SupportTicket, HubRegistrationRequest, AuthorizationRequest } from './types';
import { TRANSLATIONS } from './translations';
import { Zap, ShieldCheck, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [adminBuffer, setAdminBuffer] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('PT');
  
  const [users, setUsers] = useState<User[]>([
    { id: 'ADMIN-01', name: 'Super Admin', email: 'admin@redline.eu', password: 'admin', role: 'Administrador', permissions: ['ALL'], tier: 'Platina', status: 'Ativo', joinedAt: Date.now() },
    { id: 'HUB-FRA-01', name: 'Frankfurt Hub', email: 'fra@redline.eu', password: 'hub', role: 'B2B_Admin', managedHubId: 'NODE-FRA', permissions: ['PRODUCTION'], tier: 'Ouro', status: 'Ativo', joinedAt: Date.now() }
  ]);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES);
  const [hubRequests, setHubRequests] = useState<HubRegistrationRequest[]>([]);
  const [authRequests, setAuthRequests] = useState<AuthorizationRequest[]>([]);
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [products, setProducts] = useState<ExtendedProduct[]>(INITIAL_PRODUCTS.map(p => ({...p, status: 'Ativo', ownerHubId: p.ownerHubId || 'SYSTEM'})));
  
  const [showLogin, setShowLogin] = useState(false);
  const [activeToast, setActiveToast] = useState<{title: string, msg: string} | null>(null);

  const playSound = useCallback((type: 'click' | 'success' | 'sync') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'sync') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch(e) {}
  }, []);

  const notify = (title: string, msg: string) => {
    playSound('sync');
    setActiveToast({ title, msg });
    setTimeout(() => setActiveToast(null), 5000);
  };

  const handleCreateOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    playSound('success');
    notify("Encomenda Recebida", `Job ${order.id} injetado no grid.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductionJob['status'], nodeId?: string, note?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      status: newStatus, 
      nodeId: nodeId || o.nodeId, 
      progress: newStatus === 'Concluído' ? 100 : (newStatus === 'Em Produção' ? 50 : o.progress),
      history: [...o.history, { timestamp: Date.now(), status: newStatus, author: user?.name || 'Sistema', note: note || `Status alterado para ${newStatus}.` }]
    } : o));
    playSound('success');
  };

  const handleUpdateOrderGranular = (orderId: string, updates: Partial<ProductionJob>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    notify("Encomenda Atualizada", `Dados da encomenda ${orderId} modificados via Master Control.`);
  };

  const handleUpdateHub = (hubId: string, updates: Partial<PartnerNode>) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, ...updates } : h));
    notify("Hub Atualizado", `Parâmetros do Nodo ${hubId} sincronizados.`);
  };

  const handleUpdateProduct = (productId: string, updates: Partial<ExtendedProduct>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    notify("Ativo Atualizado", `Catálogo R2 atualizado para o item ${productId}.`);
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    notify("Utilizador Atualizado", `Perfil de ${userId} modificado.`);
  };

  const handleCreateClientByAdmin = (clientData: Partial<User>) => {
    const newUser: User = {
      id: `CLI-${Date.now()}`,
      name: clientData.name || 'Novo Cliente',
      email: clientData.email || 'cliente@redline.eu',
      password: Math.random().toString(36).slice(-8),
      role: 'Cliente',
      permissions: ['BUY'],
      tier: 'Bronze',
      status: 'Ativo',
      joinedAt: Date.now(),
      ...clientData
    };
    setUsers(prev => [...prev, newUser]);
    notify("Cliente Provisionado", `Entidade ${newUser.name} injetada no Grid. Password: ${newUser.password}`);
  };

  const handleImpersonate = (targetUser: User) => {
    if (user?.role !== 'Administrador') return;
    setAdminBuffer(user);
    setUser(targetUser);
    setActiveTab('account');
    notify("Sessão Shadow", `Simulando acesso como ${targetUser.name}.`);
  };

  const handleStopImpersonation = () => {
    if (adminBuffer) {
      setUser(adminBuffer);
      setAdminBuffer(null);
      setActiveTab('production');
      notify("Sessão Master", "Controle de Administrador restabelecido.");
    }
  };

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={(t) => { playSound('click'); setActiveTab(t); }} user={user} 
      language={language} setLanguage={setLanguage}
      onLoginClick={() => setShowLogin(true)} 
      onLogout={() => { setUser(null); setActiveTab('home'); }}
    >
      {adminBuffer && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-3 rounded-full flex items-center space-x-4 shadow-[0_0_40px_rgba(204,0,0,0.5)] border border-white/20 animate-bounce">
           <ShieldCheck className="w-5 h-5" />
           <span className="text-[10px] font-black uppercase tracking-widest">Sombra Ativa: {user?.name}</span>
           <button onClick={handleStopImpersonation} className="bg-white text-red-600 px-4 py-1 rounded-full text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all">Sair</button>
        </div>
      )}

      <div className="pt-32 lg:pt-40 min-h-screen">
        {activeTab === 'home' && (
          <Hero 
            onStart={() => setActiveTab('products')} 
            onB2B={() => setActiveTab('partners')} 
            onRegister={() => setShowLogin(true)} 
            language={language} 
            hubsCount={hubs.length}
            usersCount={users.length}
            ordersCount={orders.length}
            productsCount={products.length}
          />
        )}
        {activeTab === 'products' && <ProductBuilder onAddOrder={handleCreateOrder} user={user} hubs={hubs} products={products} language={language} />}
        {activeTab === 'live' && <PublicGrid orders={orders} hubs={hubs} language={language} />}
        {activeTab === 'partners' && <B2BPartners hubs={hubs} onApply={(req) => setHubRequests(prev => [...prev, req])} onTicketSubmit={(t) => setTickets(prev => [t, ...prev])} />}
        {activeTab === 'support' && <SupportCenter onOpenTicket={() => {}} hubs={hubs} onTicketSubmit={(t) => setTickets(prev => [t, ...prev])} />}
        
        {activeTab === 'production' && (
          <Backoffice 
            orders={orders} hubs={hubs} users={users} user={user} products={products}
            hubRequests={hubRequests} authRequests={authRequests}
            onApproveHub={(id) => {}} 
            onApproveAuth={(id) => {}}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdateUser={handleUpdateUser}
            onUpdateHub={handleUpdateHub}
            onUpdateProduct={handleUpdateProduct}
            onUpdateOrder={handleUpdateOrderGranular}
            onImpersonate={handleImpersonate}
            onCreateUser={(u) => setUsers(prev => [...prev, u])}
            onCreateClient={handleCreateClientByAdmin}
            language={language}
          />
        )}

        {activeTab === 'account' && user && (
          <Account 
            user={user} 
            orders={orders.filter(o => user.role === 'Administrador' ? true : (user.role === 'B2B_Admin' ? o.nodeId === user.managedHubId : o.clientId === user.id))} 
            tickets={tickets.filter(t => user.role === 'Administrador' ? true : (user.role === 'B2B_Admin' ? t.targetHubId === user.managedHubId : t.creatorId === user.id))}
            hubs={hubs} products={products}
            onUpdateStatus={handleUpdateOrderStatus}
            onRequestAuth={(req) => setAuthRequests(prev => [...prev, { ...req, id: `AUTH-${Date.now()}`, timestamp: Date.now(), status: 'Pendente' }])}
            language={language} onLogout={() => { setUser(null); setActiveTab('home'); }}
          />
        )}
      </div>

      {activeToast && (
        <div className="fixed bottom-10 right-10 z-[3000] bg-black text-white p-8 rounded-[2.5rem] shadow-2xl border-l-[15px] border-red-600 animate-in slide-in-from-right-10 w-[400px]">
           <div className="flex items-center space-x-6">
              <Zap className="w-8 h-8 text-red-600 animate-pulse" />
              <div>
                 <h4 className="text-[12px] font-black uppercase text-red-600 tracking-widest">{activeToast.title}</h4>
                 <p className="text-[13px] font-bold text-gray-400 mt-1 italic">{activeToast.msg}</p>
              </div>
           </div>
        </div>
      )}
      
      <SupportChat language={language} />
      {showLogin && <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} registeredUsers={users} language={language} onRegisterUser={(u) => setUsers(prev => [...prev, { ...u, status: 'Pendente' }])} />}
    </Layout>
  );
};

export default App;
