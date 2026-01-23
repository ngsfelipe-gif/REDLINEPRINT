
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
import { Zap, ShieldCheck, RefreshCw, Cpu, Database, Coins } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [adminBuffer, setAdminBuffer] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('PT');
  
  const [globalPlatformFee, setGlobalPlatformFee] = useState(5.0);

  // Centralized Real-Time State
  const [users, setUsers] = useState<User[]>([
    { id: 'ADMIN-01', name: 'Super Admin', email: 'admin@redline.eu', password: 'admin', role: 'Administrador', permissions: ['ALL'], tier: 'Platina', status: 'Ativo', joinedAt: Date.now(), balance: 15400.00 },
    { id: 'HUB-FRA-01', name: 'Frankfurt Hub', email: 'fra@redline.eu', password: 'hub', role: 'B2B_Admin', managedHubId: 'NODE-FRA', permissions: ['PRODUCTION'], tier: 'Ouro', status: 'Ativo', joinedAt: Date.now(), balance: 450.25 },
    { id: 'STD-01', name: 'Utilizador Standard', email: 'user@redline.eu', password: 'user', role: 'Utilizador_Standard', permissions: ['BUY'], tier: 'Bronze', status: 'Ativo', joinedAt: Date.now(), partnerCommissionRate: 2.5, balance: 45.50 }
  ]);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES.map(h => ({ ...h, platformCommission: 5.0, primaryCommission: 15.0 })));
  const [hubRequests, setHubRequests] = useState<HubRegistrationRequest[]>([]);
  const [authRequests, setAuthRequests] = useState<AuthorizationRequest[]>([]);
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [products, setProducts] = useState<ExtendedProduct[]>(INITIAL_PRODUCTS.map(p => ({...p, status: 'Ativo', ownerHubId: p.ownerHubId || 'SYSTEM'})));
  
  const [showLogin, setShowLogin] = useState(false);
  const [activeToast, setActiveToast] = useState<{title: string, msg: string, type?: 'success' | 'error' | 'sync' | 'loading' | 'redcoin'} | null>(null);

  const playSound = useCallback((type: 'click' | 'success' | 'sync' | 'error' | 'loading' | 'redcoin') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      const now = audioCtx.currentTime;

      const createBleep = (freq: number, dur: number, type: OscillatorType = 'sine', slide?: number, volume = 0.05) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slide) osc.frequency.exponentialRampToValueAtTime(slide, now + dur);
        
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur);
      };

      switch(type) {
        case 'click': createBleep(1400, 0.05, 'sine'); break;
        case 'success': createBleep(660, 0.1, 'triangle', 880); setTimeout(() => createBleep(880, 0.2, 'triangle', 1320), 50); break;
        case 'sync': createBleep(1200, 0.1, 'sine', 1600); createBleep(1400, 0.1, 'sine', 1800); break;
        case 'error': createBleep(220, 0.4, 'sawtooth', 60); break;
        case 'loading': createBleep(440, 0.3, 'sine', 220); break;
        case 'redcoin': 
          // High-tech coin collect sound
          createBleep(880, 0.1, 'sine', 1760, 0.1);
          setTimeout(() => createBleep(1760, 0.2, 'sine', 2200, 0.08), 50);
          setTimeout(() => createBleep(2200, 0.3, 'triangle', 440, 0.05), 150);
          break;
      }
    } catch(e) {}
  }, []);

  const notify = (title: string, msg: string, type: 'success' | 'error' | 'sync' | 'loading' | 'redcoin' = 'sync') => {
    playSound(type);
    setActiveToast({ title, msg, type });
    if (type !== 'loading') setTimeout(() => setActiveToast(null), 5000);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductionJob['status'], nodeId?: string, note?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      
      const isCompletion = newStatus === 'Concluído' && o.status !== 'Concluído';
      
      if (isCompletion) {
        const val = parseFloat(o.value);
        const currentHub = hubs.find(h => h.id === (nodeId || o.nodeId));
        const hubRate = currentHub?.primaryCommission || 15;
        const platRate = currentHub?.platformCommission || globalPlatformFee;
        
        const platformAmount = (val * platRate) / 100;
        const hubGross = (val * hubRate) / 100;
        const hubNet = hubGross - platformAmount;
        const clientCashback = val * 0.02;

        handleUpdateUserInternal('ADMIN-01', { balance: (users.find(u=>u.id==='ADMIN-01')?.balance || 0) + platformAmount });
        const hubOwner = users.find(u => u.managedHubId === (nodeId || o.nodeId));
        if (hubOwner) handleUpdateUserInternal(hubOwner.id, { balance: (hubOwner.balance || 0) + hubNet });
        handleUpdateUserInternal(o.clientId, { balance: (users.find(u=>u.id===o.clientId)?.balance || 0) + clientCashback });
        
        // Sensory celebration for REDCOIN earnings
        notify("REDCOIN Reward", `Protocolo ${orderId} liquidado. +${clientCashback.toFixed(2)} REDCOINS em circulação.`, "redcoin");
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
          note: note || `Transição de estado validada na Torre de Controlo.` 
        }]
      };
    }));
  };

  const handleUpdateUserInternal = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (user?.id === userId) setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  };

  const handleUpdateUserPublic = (userId: string, updates: Partial<User>) => {
    handleUpdateUserInternal(userId, updates);
    notify("Master Sync", `Entidade ${userId} sincronizada.`, "sync");
  };

  const handleUpdateHub = (hubId: string, updates: Partial<PartnerNode>) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, ...updates } : h));
    notify("Nodo Industrial", `Hub ${hubId} atualizado no Grid.`, "sync");
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
      notify("Identidade Ativa", `Conta provisionada para ${guestData.email}`, "success");
    }

    const syncOrder: ProductionJob = {
      ...order,
      client: finalUser?.name || order.client,
      clientId: finalUser?.id || order.clientId,
      status: 'Pendente_Admin' 
    };
    
    setOrders(prev => [syncOrder, ...prev]);
    notify("Injeção de Asset", `Protocolo ${order.id} injetado com sucesso.`, "sync");
    setActiveTab('account');
  };

  const handleUpdateOrderGranular = (orderId: string, updates: Partial<ProductionJob>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    notify("Master Grid Sync", `Job ${orderId} atualizado em tempo real.`, "sync");
  };

  const handleUpdateProduct = (productId: string, updates: Partial<ExtendedProduct>) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === productId);
      if (exists) return prev.map(p => p.id === productId ? { ...p, ...updates } : p);
      return [...prev, updates as ExtendedProduct];
    });
    notify("Inventory Sync", `Módulo ${productId} sincronizado.`, "sync");
  };

  const handleCreateClientByAdmin = (clientData: Partial<User>) => {
    const autoPass = Math.random().toString(36).slice(-8);
    const newUser: User = {
      id: `CLI-${Date.now()}`,
      name: clientData.name || 'Nova Entidade',
      email: clientData.email || 'entidade@redline.eu',
      password: autoPass, 
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
    notify("Entidade Provisionada", `Credenciais: ${newUser.email} / PW: ${autoPass}`, "success");
  };

  const handleImpersonate = (targetUser: User) => {
    if (user?.role !== 'Administrador') return;
    setAdminBuffer(user);
    setUser(targetUser);
    setActiveTab('account');
    notify("Shadow Mode", `Controlo Master emulado: ${targetUser.name}.`, "sync");
  };

  const handleStopImpersonation = () => {
    if (adminBuffer) {
      setUser(adminBuffer);
      setAdminBuffer(null);
      setActiveTab('production');
      notify("Master Restore", "Controlo Administrador Central restabelecido.", "sync");
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] premium-glass-dark text-white px-10 py-4 rounded-full flex items-center space-x-6 shadow-[0_0_80px_rgba(204,0,0,0.4)] border border-red-600/30 active-glow">
           <ShieldCheck className="w-6 h-6 text-red-600" />
           <span className="text-[11px] font-black uppercase tracking-[0.3em]">Protocolo Sombra: {user?.name}</span>
           <button onClick={handleStopImpersonation} className="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all shadow-lg active-glow">Sair</button>
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
        {activeTab === 'products' && <ProductBuilder onAddOrder={handleCreateOrder} user={user} hubs={hubs} products={products} language={language} notify={notify} onSound={playSound} />}
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
            onUpdateUser={handleUpdateUserPublic}
            onUpdateHub={handleUpdateHub}
            onUpdateProduct={handleUpdateProduct}
            onUpdateOrder={handleUpdateOrderGranular}
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
            onUpdateUser={handleUpdateUserPublic}
          />
        )}
      </div>

      {activeToast && (
        <div className={`fixed bottom-10 right-10 z-[3000] premium-glass-dark text-white p-8 rounded-[2.5rem] shadow-[0_50px_120px_rgba(0,0,0,0.6)] border-l-[15px] ${activeToast.type === 'redcoin' ? 'border-yellow-400 active-glow' : 'border-red-600'} animate-in slide-in-from-right-10 w-[420px] overflow-hidden group`}>
           <div className="absolute inset-0 data-shimmer opacity-20 pointer-events-none" />
           <div className="flex items-center space-x-6 relative z-10">
              <div className={`p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] ${activeToast.type === 'redcoin' ? 'bg-yellow-400/20' : 'bg-red-600/20'}`}>
                 {activeToast.type === 'sync' ? <RefreshCw className="w-8 h-8 text-red-600 animate-spin" /> : 
                  activeToast.type === 'loading' ? <Database className="w-8 h-8 text-red-600 animate-pulse" /> : 
                  activeToast.type === 'redcoin' ? <Coins className="w-8 h-8 text-yellow-400 animate-bounce" /> :
                  <Zap className="w-8 h-8 text-red-600 animate-pulse" />}
              </div>
              <div>
                 <h4 className={`text-[12px] font-black uppercase tracking-widest ${activeToast.type === 'redcoin' ? 'text-yellow-400' : 'text-red-600'}`}>{activeToast.title}</h4>
                 <p className="text-[13px] font-bold text-gray-400 mt-1 italic leading-tight">{activeToast.msg}</p>
              </div>
           </div>
           {/* Progress Indicator for Loading Toast */}
           <div className={`absolute bottom-0 left-0 w-full h-1 ${activeToast.type === 'redcoin' ? 'bg-yellow-400/10' : 'bg-red-600/10'}`}>
              <div className={`h-full transition-all duration-[5000ms] ease-linear shadow-[0_0_15px_rgba(0,0,0,1)] ${activeToast.type === 'redcoin' ? 'bg-yellow-400' : 'bg-red-600'}`} style={{ width: activeToast.type === 'loading' ? '100%' : '0%' }} />
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
