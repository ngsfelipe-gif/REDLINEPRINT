
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { User, ProductionJob, PartnerNode, ExtendedProduct, Language, SupportTicket, HubRegistrationRequest, AuthorizationRequest } from './types';
import { TRANSLATIONS } from './translations';
import { Zap, ShieldCheck, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [adminBuffer, setAdminBuffer] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('PT');
  
  const [globalPlatformFee, setGlobalPlatformFee] = useState(5.0);

  const [users, setUsers] = useState<User[]>([
    { id: 'ADMIN-01', name: 'Super Admin', email: 'admin@redline.eu', password: 'admin', role: 'Administrador', permissions: ['ALL'], tier: 'Platina', status: 'Ativo', joinedAt: Date.now() },
    { id: 'HUB-FRA-01', name: 'Frankfurt Hub', email: 'fra@redline.eu', password: 'hub', role: 'B2B_Admin', managedHubId: 'NODE-FRA', permissions: ['PRODUCTION'], tier: 'Ouro', status: 'Ativo', joinedAt: Date.now() },
    { id: 'STD-01', name: 'Utilizador Standard', email: 'user@redline.eu', password: 'user', role: 'Utilizador_Standard', permissions: ['BUY'], tier: 'Bronze', status: 'Ativo', joinedAt: Date.now(), partnerCommissionRate: 2.5, balance: 45.50 }
  ]);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES.map(h => ({ ...h, platformCommission: 5.0, primaryCommission: 15.0 })));
  const [hubRequests, setHubRequests] = useState<HubRegistrationRequest[]>([]);
  const [authRequests, setAuthRequests] = useState<AuthorizationRequest[]>([]);
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [products, setProducts] = useState<ExtendedProduct[]>(INITIAL_PRODUCTS.map(p => ({...p, status: 'Ativo', ownerHubId: p.ownerHubId || 'SYSTEM'})));
  
  const [showLogin, setShowLogin] = useState(false);
  const [activeToast, setActiveToast] = useState<{title: string, msg: string, type?: 'success' | 'error' | 'sync'} | null>(null);

  const playSound = useCallback((type: 'click' | 'success' | 'sync' | 'error' | 'loading') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      switch(type) {
        case 'click':
          osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); osc.start(now); osc.stop(now + 0.05);
          break;
        case 'success':
          osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); gain.gain.setValueAtTime(0.03, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2); osc.start(now); osc.stop(now + 0.2);
          break;
        case 'sync':
          osc.type = 'sine'; osc.frequency.setValueAtTime(1500, now); osc.frequency.setValueAtTime(1800, now + 0.05); gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15); osc.start(now); osc.stop(now + 0.15);
          break;
        case 'error':
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(60, now + 0.4); gain.gain.setValueAtTime(0.04, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); osc.start(now); osc.stop(now + 0.4);
          break;
        case 'loading':
          osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(660, now + 0.5); gain.gain.setValueAtTime(0.01, now); gain.gain.linearRampToValueAtTime(0, now + 0.5); osc.start(now); osc.stop(now + 0.5);
          break;
      }
    } catch(e) {}
  }, []);

  const notify = (title: string, msg: string, type: 'success' | 'error' | 'sync' = 'sync') => {
    playSound(type);
    setActiveToast({ title, msg, type });
    setTimeout(() => setActiveToast(null), 5000);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductionJob['status'], nodeId?: string, note?: string) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== orderId) return o;
        
        if (newStatus === 'Concluído' && o.status !== 'Concluído') {
          const client = users.find(u => u.id === o.clientId);
          if (client && client.role === 'Utilizador_Standard') {
            const cashback = parseFloat(o.value) * 0.02;
            handleUpdateUser(client.id, { balance: (client.balance || 0) + cashback });
            notify("Cashback R2 Ativo", `€${cashback.toFixed(2)} creditados em balance.`, "success");
          }
        }

        return { 
          ...o, 
          status: newStatus, 
          nodeId: nodeId || o.nodeId, 
          progress: newStatus === 'Concluído' ? 100 : (newStatus === 'Em Produção' ? 50 : (newStatus === 'Expedição' ? 85 : o.progress)),
          history: [...o.history, { 
            timestamp: Date.now(), 
            status: newStatus, 
            author: user?.name || 'Sistema R3', 
            note: note || `Operação de status validada pelo nodo industrial.` 
          }]
        };
      });
      return updated;
    });
    notify("Grid Sync", `Encomenda ${orderId} atualizada para ${newStatus}.`, "sync");
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => {
      const newList = prev.map(u => u.id === userId ? { ...u, ...updates } : u);
      if (user?.id === userId) {
        setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
      }
      return newList;
    });
    notify("Master Sync", `Entidade ${userId} sincronizada.`, "sync");
  };

  const handleUpdateHub = (hubId: string, updates: Partial<PartnerNode>) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, ...updates } : h));
    notify("Nodo Industrial", `Parâmetros do Hub ${hubId} modificados.`, "sync");
  };

  const handleCreateOrder = (order: ProductionJob, guestData?: { name: string, email: string, password?: string }) => {
    let finalUser = user;
    if (!user && guestData) {
      const newUser: User = {
        id: `AUTO-${Date.now()}`,
        name: guestData.name,
        email: guestData.email,
        password: guestData.password || Math.random().toString(36).slice(-8), 
        role: 'Utilizador_Standard',
        permissions: ['BUY'],
        tier: 'Bronze',
        status: 'Ativo',
        joinedAt: Date.now(),
        partnerCommissionRate: 0,
        balance: 0
      };
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      finalUser = newUser;
      notify("Identidade Criada", `Conta Standard provisionada para ${guestData.email}`, "success");
    }

    const hierarchicalOrder: ProductionJob = {
      ...order,
      client: finalUser?.name || order.client,
      clientId: finalUser?.id || order.clientId,
      status: 'Pendente_Admin' 
    };
    
    setOrders(prev => [hierarchicalOrder, ...prev]);
    notify("Protocolo Injetado", `Encomenda ${order.id} aguarda validação Admin.`, "sync");
    setActiveTab('account');
  };

  const handleUpdateProduct = (productId: string, updates: Partial<ExtendedProduct>) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === productId);
      if (exists) {
        return prev.map(p => p.id === productId ? { ...p, ...updates } : p);
      } else {
        return [...prev, updates as ExtendedProduct];
      }
    });
    notify("Módulo Atualizado", `Ativo ${productId} sincronizado.`, "sync");
  };

  const handleCreateClientByAdmin = (clientData: Partial<User>) => {
    const newUser: User = {
      id: `CLI-${Date.now()}`,
      name: clientData.name || 'Nova Entidade',
      email: clientData.email || 'entidade@redline.eu',
      password: Math.random().toString(36).slice(-8), 
      role: clientData.role || 'Utilizador_Standard',
      permissions: ['BUY'],
      tier: 'Bronze',
      status: 'Ativo',
      joinedAt: Date.now(),
      partnerCommissionRate: 2.0,
      balance: 0,
      ...clientData
    };
    setUsers(prev => [...prev, newUser]);
    notify("Entidade Provisionada", `Acesso gerado para ${newUser.name}.`, "success");
  };

  const handleImpersonate = (targetUser: User) => {
    if (user?.role !== 'Administrador') return;
    setAdminBuffer(user);
    setUser(targetUser);
    setActiveTab('account');
    notify("Shadow Mode", `Controlo total emulado: ${targetUser.name}.`, "sync");
  };

  const handleStopImpersonation = () => {
    if (adminBuffer) {
      setUser(adminBuffer);
      setAdminBuffer(null);
      setActiveTab('production');
      notify("Master Restore", "Controlo Super Admin restabelecido.", "sync");
    }
  };

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={(t) => { playSound('click'); setActiveTab(t); }} user={user} 
      language={language} setLanguage={setLanguage}
      onLoginClick={() => { playSound('click'); setShowLogin(true); }} 
      onLogout={() => { playSound('click'); setUser(null); setActiveTab('home'); }}
    >
      {adminBuffer && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-4 rounded-full flex items-center space-x-6 shadow-[0_0_60px_rgba(204,0,0,0.6)] border border-white/30 animate-bounce">
           <ShieldCheck className="w-6 h-6" />
           <span className="text-[11px] font-black uppercase tracking-[0.3em]">Shadow Protocol: {user?.name}</span>
           <button onClick={handleStopImpersonation} className="bg-white text-red-600 px-6 py-2 rounded-full text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all shadow-lg">Restore Admin</button>
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
            hubs={hubs}
          />
        )}
        {activeTab === 'products' && <ProductBuilder onAddOrder={handleCreateOrder} user={user} hubs={hubs} products={products} language={language} />}
        {activeTab === 'live' && <PublicGrid orders={orders.filter(o => o.status !== 'Pendente_Admin')} hubs={hubs} language={language} />}
        {activeTab === 'partners' && <B2BPartners hubs={hubs} onApply={(req) => {}} onTicketSubmit={(t) => {}} />}
        {activeTab === 'support' && <SupportCenter onOpenTicket={() => {}} hubs={hubs} onTicketSubmit={(t) => {}} />}
        
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
            onUpdateOrder={(id, updates) => setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))}
            onImpersonate={handleImpersonate}
            onCreateUser={(u) => setUsers(prev => [...prev, u])}
            onCreateClient={handleCreateClientByAdmin}
            language={language}
            onSound={playSound}
            globalPlatformFee={globalPlatformFee}
            setGlobalPlatformFee={setGlobalPlatformFee}
          />
        )}

        {activeTab === 'account' && user && (
          <Account 
            user={user} 
            orders={orders.filter(o => {
               if (user.role === 'Administrador') return true;
               if (user.role === 'B2B_Admin') return o.nodeId === user.managedHubId && o.status !== 'Pendente_Admin';
               return o.clientId === user.id;
            })} 
            tickets={tickets.filter(t => user.role === 'Administrador' ? true : (user.role === 'B2B_Admin' ? t.targetHubId === user.managedHubId : t.creatorId === user.id))}
            hubs={hubs} products={products}
            onUpdateStatus={handleUpdateOrderStatus}
            onRequestAuth={(req) => setAuthRequests(prev => [...prev, { ...req, id: `AUTH-${Date.now()}`, timestamp: Date.now(), status: 'Pendente' }])}
            language={language} onLogout={() => { setUser(null); setActiveTab('home'); }}
            onSound={playSound}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </div>

      {activeToast && (
        <div className={`fixed bottom-10 right-10 z-[3000] bg-black text-white p-8 rounded-[2.5rem] shadow-2xl border-l-[15px] animate-in slide-in-from-right-10 w-[400px] ${activeToast.type === 'error' ? 'border-orange-600' : 'border-red-600'}`}>
           <div className="flex items-center space-x-6">
              {activeToast.type === 'sync' ? <RefreshCw className="w-8 h-8 text-red-600 animate-spin" /> : <Zap className="w-8 h-8 text-red-600 animate-pulse" />}
              <div>
                 <h4 className="text-[12px] font-black uppercase text-red-600 tracking-widest">{activeToast.title}</h4>
                 <p className="text-[13px] font-bold text-gray-400 mt-1 italic">{activeToast.msg}</p>
              </div>
           </div>
        </div>
      )}
      
      <SupportChat language={language} />
      {showLogin && (
        <LoginPanel 
          onLogin={(u) => { playSound('success'); setUser(u); setShowLogin(false); }} 
          onBack={() => { playSound('click'); setShowLogin(false); }} 
          registeredUsers={users} 
          language={language} 
          onRegisterUser={(u) => { playSound('success'); setUsers(prev => [...prev, { ...u, status: 'Pendente' }]); }} 
          onSound={playSound}
        />
      )}
    </Layout>
  );
};

export default App;
