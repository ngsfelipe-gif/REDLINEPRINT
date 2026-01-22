
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ProductBuilder from './components/ProductBuilder';
import SupportChat from './components/SupportChat';
import Backoffice from './components/Backoffice';
import Account from './components/Account';
import LoginPanel from './components/LoginPanel';
import B2BPartners from './components/B2BPartners';
import { MOCK_JOBS, MOCK_NODES, INITIAL_PRODUCTS } from './constants';
import { User, ProductionJob, PartnerNode, ExtendedProduct, Language, ProductionLog } from './types';
import { TRANSLATIONS } from './translations';
import { Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('PT');
  
  // ESTADO GLOBAL - SINCRONIZAÇÃO EM TEMPO REAL
  const [users, setUsers] = useState<User[]>([
    { id: 'ADMIN-01', name: 'Super Admin', email: 'admin@redline.eu', password: 'admin', role: 'Administrador', permissions: ['ALL'], tier: 'Platina', status: 'Ativo', joinedAt: Date.now() },
    { id: 'HUB-FRA-01', name: 'Frankfurt Hub', email: 'fra@redline.eu', password: 'hub', role: 'B2B_Admin', managedHubId: 'NODE-FRA', permissions: ['PRODUCTION'], tier: 'Ouro', status: 'Ativo', joinedAt: Date.now() }
  ]);
  const [hubs, setHubs] = useState<PartnerNode[]>(MOCK_NODES);
  const [orders, setOrders] = useState<ProductionJob[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>(INITIAL_PRODUCTS.map(p => ({...p, status: 'Ativo', ownerHubId: p.ownerHubId || 'SYSTEM'})));
  
  const [showLogin, setShowLogin] = useState(false);
  const [activeToast, setActiveToast] = useState<{title: string, msg: string} | null>(null);

  const notify = (title: string, msg: string) => {
    setActiveToast({ title, msg });
    setTimeout(() => setActiveToast(null), 5000);
  };

  const handleCreateOrder = (order: ProductionJob) => {
    const orderWithHistory = {
      ...order,
      history: [{ timestamp: Date.now(), status: 'Aguardando Aprovação', author: order.client, note: 'Job injetado via Terminal R2 Público.' }]
    };
    setOrders(prev => [orderWithHistory, ...prev]);
    notify("Encomenda Recebida", `Job ${order.id} injetado no grid e aguarda validação.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductionJob['status'], nodeId?: string, note?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const log: ProductionLog = {
          timestamp: Date.now(),
          status: newStatus,
          author: user?.name || 'Sistema',
          note: note || `Status alterado para ${newStatus}${nodeId ? ` e atribuído ao node ${nodeId}` : ''}.`
        };
        return { 
          ...o, 
          status: newStatus, 
          nodeId: nodeId || o.nodeId, 
          history: [...o.history, log],
          progress: newStatus === 'Em Produção' ? 50 : (newStatus === 'Concluído' ? 100 : o.progress)
        };
      }
      return o;
    }));
    notify("Status Atualizado", `Job ${orderId} atualizado para ${newStatus}.`);
  };

  const handleAddHub = (hub: PartnerNode) => {
    setHubs(prev => [...prev, hub]);
    notify("Grid Expandido", `Novo Hub ${hub.name} ativado.`);
  };

  const handleAddUser = (u: User) => {
    setUsers(prev => [...prev, u]);
    notify("Utilizador Ativado", `Entidade ${u.name} registada no cluster.`);
  };

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} user={user} 
      language={language} setLanguage={setLanguage}
      onLoginClick={() => setShowLogin(true)} 
      onLogout={() => { setUser(null); setActiveTab('home'); }}
    >
      <div className="pt-32 lg:pt-40 min-h-screen">
        {activeTab === 'home' && (
          <Hero 
            onStart={() => setActiveTab('products')} 
            onB2B={() => setActiveTab('partners')} 
            onRegister={() => setShowLogin(true)} 
            language={language} 
          />
        )}
        
        {activeTab === 'products' && (
          <ProductBuilder 
            onAddOrder={handleCreateOrder} 
            user={user} hubs={hubs} products={products} language={language}
          />
        )}
        
        {activeTab === 'production' && (
          <Backoffice 
            orders={orders} hubs={hubs} users={users} user={user} products={products}
            onUpdateStatus={handleUpdateOrderStatus}
            onCreateHub={handleAddHub}
            onCreateUser={handleAddUser}
            language={language}
          />
        )}

        {activeTab === 'account' && user && (
          <Account 
            user={user} 
            orders={orders.filter(o => 
              user.role === 'Administrador' ? true : 
              (user.role === 'B2B_Admin' ? o.nodeId === user.managedHubId : o.clientId === user.id)
            )} 
            hubs={hubs} products={products}
            onUpdateStatus={handleUpdateOrderStatus}
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
      {showLogin && <LoginPanel onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} registeredUsers={users} language={language} onRegisterUser={handleAddUser} />}
    </Layout>
  );
};

export default App;
