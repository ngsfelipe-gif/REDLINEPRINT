
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import B2BPartners from './components/B2BPartners';
import SupportCenter from './components/SupportCenter';
import { MOCK_JOBS, MOCK_TICKETS, MOCK_NODES, INITIAL_PRODUCTS } from './constants';
import { ProductionJob, User, SupportTicket, Notification, PartnerNode, ExtendedProduct, HubRegistrationRequest } from './types';
import { X, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  
  // GLOBAL STATE - SINGLE SOURCE OF TRUTH
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
    { id: 'ADMIN-MASTER', name: 'Super Admin Redline', email: 'admin@redline.eu', password: 'redline2025', role: 'Administrador', status: 'Ativo', permissions: ['VIEW_ORDERS', 'PLACE_ORDERS', 'APPROVE_HUB_ORDERS', 'MANAGE_HUBS', 'MANAGE_USERS', 'ACCESS_ADMIN_PANEL', 'MANAGE_CATALOG'], tier: 'Platina', joinedAt: 1704067200000 },
    { id: 'B2B-FRA', name: 'Frankfurt GigaPress', email: 'fra@redline.eu', password: 'redline2025', role: 'B2B_Admin', status: 'Ativo', managedHubId: 'NODE-FRA', permissions: ['VIEW_ORDERS', 'APPROVE_HUB_ORDERS', 'HUB_ANALYTICS', 'CREATE_PRODUCTS'], tier: 'Platina', joinedAt: 1704153600000 }
  ]);
  
  const [products, setProducts] = useState<ExtendedProduct[]>(
    INITIAL_PRODUCTS.map(p => ({ ...p, status: 'Ativo', ownerHubId: 'SYSTEM' }))
  );
  
  const [orders, setOrders] = useState<ProductionJob[]>(MOCK_JOBS);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES);
  const [hubRequests, setHubRequests] = useState<HubRegistrationRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [showLogin, setShowLogin] = useState(false);
  const [accountSubTab, setAccountSubTab] = useState('overview');
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const notify = (title: string, message: string, type: Notification['type'] = 'System') => {
    const n: Notification = { id: `NT-${Date.now()}`, title, message, timestamp: Date.now(), read: false, type };
    setNotifications(prev => [n, ...prev]);
    setActiveToast(n);
    setTimeout(() => setActiveToast(null), 5000);
  };

  // SYNC HANDLERS
  const handleAddOrder = (order: ProductionJob) => {
    setOrders(prev => [order, ...prev]);
    notify("Nova Encomenda", `Ordem ${order.id} injetada com sucesso.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductionJob['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const progressMap: Record<string, number> = {
          'Pendente Aprovação Hub': 5, 'Orçamento Gerado': 10, 'Pre-flight': 25, 
          'Impressão': 55, 'Acabamento': 80, 'Expedição': 95, 'Entregue': 100
        };
        return { ...o, status: newStatus, progress: progressMap[newStatus] || o.progress };
      }
      return o;
    }));
    notify("Status Industrial", `A ordem ${orderId} foi atualizada.`);
  };

  const handleCreateProduct = (p: ExtendedProduct) => {
    setProducts(prev => [p, ...prev]);
    notify("Novo Ativo Gráfico", "O produto foi enviado para aprovação do Super Admin.");
  };

  const handleApproveProduct = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'Ativo' } : p));
    notify("Catálogo Atualizado", "Novo produto aprovado no grid global.");
  };

  const handleAddHubRequest = (req: HubRegistrationRequest) => {
    setHubRequests(prev => [req, ...prev]);
    notify("Candidatura Hub", "Pedido registado. O Admin analisará o seu parque de máquinas.");
  };

  const handleApproveHub = (reqId: string) => {
    const req = hubRequests.find(r => r.id === reqId);
    if (!req) return;
    
    const newHub: PartnerNode = {
      id: `NODE-${req.id.slice(-3)}`,
      name: req.companyName,
      location: req.location,
      specialization: [],
      status: 'Aguardando Validação',
      capacity: 0,
      latency: '---',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      description: req.machinePark,
      ownerId: req.id,
      tempPassword: 'REDLINE-SYNC'
    };
    
    setHubs(prev => [...prev, newHub]);
    setHubRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Aprovado' } : r));
    
    const newUser: User = { 
      id: req.id, 
      name: req.companyName, 
      email: req.email, 
      password: 'REDLINE-SYNC', 
      role: 'B2B_Admin', 
      status: 'Ativo', 
      managedHubId: newHub.id, 
      permissions: ['VIEW_ORDERS', 'APPROVE_HUB_ORDERS', 'CREATE_PRODUCTS', 'HUB_ANALYTICS'], 
      tier: 'Prata', 
      joinedAt: Date.now() 
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    notify("Hub Aprovado", `Bem-vindo à rede, ${req.companyName}.`);
  };

  const handleRegisterUser = (u: User) => {
    setRegisteredUsers(prev => [...prev, u]);
    notify("Utilizador Registado", `${u.name} foi adicionado ao cluster.`);
  };

  const handleApproveUser = (userId: string) => {
    setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Ativo' } : u));
    notify("Acesso Autorizado", "O utilizador foi validado no sistema.");
  };

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} user={user} 
      onLoginClick={() => setShowLogin(true)} 
      onLogout={() => { setUser(null); setActiveTab('home'); }}
    >
      <div className="pt-32 lg:pt-40 min-h-screen">
        {activeTab === 'home' && (
          <Hero 
            onStart={() => setActiveTab('products')} 
            onB2B={() => setActiveTab('partners')} 
            onRegister={() => setShowLogin(true)} 
            onApplyHub={() => { setActiveTab('partners'); }}
          />
        )}
        
        {activeTab === 'products' && (
          <ProductBuilder 
            onAddOrder={handleAddOrder} 
            user={user} 
            hubs={hubs} 
            products={products.filter(p => p.status === 'Ativo')}
          />
        )}
        
        {activeTab === 'partners' && (
          <B2BPartners hubs={hubs} onApply={handleAddHubRequest} />
        )}
        
        {activeTab === 'support' && (
          <SupportCenter onOpenTicket={() => { setActiveTab('account'); setAccountSubTab('inbox'); }} />
        )}
        
        {activeTab === 'production' && (
          <Backoffice 
            orders={orders} 
            hubs={hubs} 
            users={registeredUsers} 
            user={user}
            products={products} 
            hubRequests={hubRequests}
            onUpdateStatus={handleUpdateOrderStatus} 
            onApproveProduct={handleApproveProduct}
            onApproveUser={handleApproveUser}
            onApproveHub={handleApproveHub}
            onRegisterUser={handleRegisterUser}
          />
        )}
        
        {activeTab === 'account' && (user ? (
          <Account 
            user={user} 
            orders={orders} 
            tickets={tickets} 
            hubs={hubs} 
            products={products}
            subTab={accountSubTab} 
            setSubTab={setAccountSubTab}
            onLogout={() => { setUser(null); setActiveTab('home'); }}
            onCreateProduct={handleCreateProduct}
            onRegisterLocalClient={handleRegisterUser}
          />
        ) : (
          <LoginPanel 
            onLogin={setUser} 
            onBack={() => setActiveTab('home')} 
            registeredUsers={registeredUsers} 
            onRegisterUser={handleRegisterUser} 
          />
        ))}
      </div>

      {activeToast && (
        <div className="fixed bottom-10 right-10 z-[3000] bg-black text-white p-6 rounded-[2rem] shadow-2xl border-l-[10px] border-red-600 animate-in slide-in-from-right-10 w-[350px]">
           <div className="flex items-center space-x-4">
              <Zap className="w-5 h-5 text-red-600 animate-pulse" />
              <div>
                 <h4 className="text-[10px] font-black uppercase text-red-600">{activeToast.title}</h4>
                 <p className="text-[11px] font-bold text-gray-400 mt-1 italic line-clamp-2">{activeToast.message}</p>
              </div>
           </div>
        </div>
      )}
      <SupportChat />
      {showLogin && !user && <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} registeredUsers={registeredUsers} onRegisterUser={handleRegisterUser} />}
    </Layout>
  );
};

export default App;
