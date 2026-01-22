
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle, CheckCircle, BarChart3, CreditCard, PieChart, Coins } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  users: User[];
  user: User | null;
  products: ExtendedProduct[];
  hubRequests: HubRegistrationRequest[];
  authRequests: AuthorizationRequest[];
  language: Language;
  onUpdateStatus: (orderId: string, status: ProductionJob['status'], nodeId?: string) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onUpdateHub: (hubId: string, updates: Partial<PartnerNode>) => void;
  onUpdateProduct: (productId: string, updates: Partial<ExtendedProduct>) => void;
  onUpdateOrder: (orderId: string, updates: Partial<ProductionJob>) => void;
  onApproveHub: (requestId: string) => void;
  onApproveAuth: (authId: string) => void;
  onImpersonate: (user: User) => void;
  onCreateUser: (u: User) => void;
  onCreateClient: (clientData: Partial<User>) => void;
  onSound?: (type: 'click' | 'success' | 'sync' | 'error' | 'loading') => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, hubRequests, authRequests, language, onUpdateStatus, onUpdateUser, onUpdateHub, onUpdateProduct, onUpdateOrder, onApproveHub, onApproveAuth, onImpersonate, onCreateUser, onCreateClient, onSound
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'products' | 'financials'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{type: 'user' | 'hub' | 'product' | 'order', data: any} | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [credentialModal, setCredentialModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingAdminApprovals = orders.filter(o => o.status === 'Pendente_Admin');
  const pendingHubAssignments = orders.filter(o => o.status === 'Aguardando Aprovação');
  const pendingUsers = users.filter(u => u.status === 'Pendente');

  const financials = useMemo(() => {
    let totalRevenue = 0;
    let hubCommissions = 0;
    let secondaryCommissions = 0;

    const hubBreakdown = hubs.map(hub => {
      const hubOrders = orders.filter(o => o.nodeId === hub.id);
      const hubRev = hubOrders.reduce((acc, o) => acc + parseFloat(o.value || '0'), 0);
      const hubComm = hubRev * ((hub.primaryCommission || 0) / 100);
      const hubSecComm = hubRev * ((hub.secondaryCommission || 0) / 100);
      
      totalRevenue += hubRev;
      hubCommissions += hubComm;
      secondaryCommissions += hubSecComm;

      return {
        id: hub.id,
        name: hub.name,
        revenue: hubRev,
        primary: hubComm,
        secondary: hubSecComm,
        net: hubRev - hubComm - hubSecComm
      };
    });

    const clientBreakdown = users.filter(u => u.role === 'Cliente' || u.role === 'Utilizador_Standard').map(client => {
      const clientOrders = orders.filter(o => o.clientId === client.id);
      const clientRev = clientOrders.reduce((acc, o) => acc + parseFloat(o.value || '0'), 0);
      return {
        id: client.id,
        name: client.name,
        revenue: clientRev,
        jobCount: clientOrders.length
      };
    });

    return {
      totalRevenue,
      totalPrimary: hubCommissions,
      totalSecondary: secondaryCommissions,
      totalNet: totalRevenue - hubCommissions - secondaryCommissions,
      hubBreakdown,
      clientBreakdown
    };
  }, [orders, hubs, users]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeView === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, activeView, searchTerm]);

  const handleUpdateCredentials = () => {
    if (credentialModal && newPassword) {
      onUpdateUser(credentialModal.id, { password: newPassword });
      setCredentialModal(null);
      setNewPassword('');
      onSound?.('success');
    }
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const { type, data } = editingItem;
    if (type === 'user') onUpdateUser(data.id, data);
    if (type === 'hub') onUpdateHub(data.id, data);
    if (type === 'product') onUpdateProduct(data.id, data);
    if (type === 'order') onUpdateOrder(data.id, data);
    setEditingItem(null);
    onSound?.('success');
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in flex flex-col lg:flex-row gap-12">
      <div className="flex-grow">
        <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-16">
          <div>
            <h2 className="text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Torre de <br/><span className="text-red-600">Controlo.</span></h2>
            <div className="flex items-center space-x-6 mt-10">
               <div className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl border-l-8 border-red-600">
                 <ShieldCheck className="w-4 h-4 mr-3 text-red-600" /> MASTER SESSION: VERIFIED
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100 gap-3">
             {['approvals', 'orders', 'hubs', 'users', 'products', 'financials'].map(v => (
               <button key={v} onClick={() => { onSound?.('click'); setActiveView(v as any); }} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeView === v ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {v} {(v === 'approvals' && (pendingAdminApprovals.length + pendingHubAssignments.length + pendingUsers.length) > 0) && <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-full text-[8px] animate-pulse">{pendingAdminApprovals.length + pendingHubAssignments.length + pendingUsers.length}</span>}
               </button>
             ))}
          </div>
        </div>

        {activeView !== 'approvals' && activeView !== 'financials' && (
           <div className="mb-12 flex justify-between items-center gap-8">
              <div className="flex items-center space-x-6 w-full max-w-xl bg-white p-1 rounded-3xl border border-gray-100 shadow-xl">
                 <div className="p-4"><Search className="w-5 h-5 text-gray-300" /></div>
                 <input type="text" placeholder={`PESQUISAR EM ${activeView.toUpperCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black uppercase text-[10px]" />
              </div>
              <button onClick={() => {
                if(activeView === 'users') onCreateClient({});
              }} className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase flex items-center shadow-xl hover:bg-red-600 transition-all">
                <Plus className="w-4 h-4 mr-3" /> Novo {activeView.slice(0, -1)}
              </button>
           </div>
        )}

        {/* Financial Dashboard View */}
        {activeView === 'financials' && (
          <div className="space-y-12 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-black text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 industrial-grid opacity-5" />
                 <CreditCard className="w-10 h-10 text-red-600 mb-6" />
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Volume Total Bruto</span>
                 <span className="text-5xl font-brand font-black italic block">€{financials.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl group">
                 <Coins className="w-10 h-10 text-red-600 mb-6" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Comissão HUB (Primária)</span>
                 <span className="text-5xl font-brand font-black italic block">€{financials.totalPrimary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl group">
                 <PieChart className="w-10 h-10 text-orange-600 mb-6" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Camada Secundária</span>
                 <span className="text-5xl font-brand font-black italic block">€{financials.totalSecondary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-red-600 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                 <Zap className="w-10 h-10 text-white mb-6" />
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-2">Volume Líquido Final</span>
                 <span className="text-5xl font-brand font-black italic block">€{financials.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
               <div className="bg-white p-12 rounded-[5rem] border border-gray-100 shadow-xl">
                  <h4 className="text-2xl font-brand font-black italic uppercase mb-10 flex items-center"><Server className="w-6 h-6 mr-4 text-red-600" /> Performance Financeira por HUB</h4>
                  <div className="space-y-6">
                     {financials.hubBreakdown.map(hb => (
                       <div key={hb.id} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center group hover:bg-black hover:text-white transition-all">
                          <div>
                             <span className="text-[14px] font-brand font-black italic block uppercase">{hb.name}</span>
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID: {hb.id}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-xl font-brand font-black italic block">€{hb.revenue.toLocaleString()}</span>
                             <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Net: €{hb.net.toLocaleString()}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white p-12 rounded-[5rem] border border-gray-100 shadow-xl">
                  <h4 className="text-2xl font-brand font-black italic uppercase mb-10 flex items-center"><Users className="w-6 h-6 mr-4 text-red-600" /> Volume de Faturação por Cliente</h4>
                  <div className="space-y-6">
                     {financials.clientBreakdown.slice(0, 5).map(cb => (
                       <div key={cb.id} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center group hover:bg-black hover:text-white transition-all">
                          <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-brand font-black italic">{cb.name[0]}</div>
                             <div>
                                <span className="text-[14px] font-brand font-black italic block uppercase">{cb.name}</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{cb.jobCount} Jobs Concluídos</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-xl font-brand font-black italic block">€{cb.revenue.toLocaleString()}</span>
                             <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Total Consumido</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Hierarchical Approvals Stream */}
        {activeView === 'approvals' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-10">
             {/* 1. Admin Validation Queue */}
             {pendingAdminApprovals.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase flex items-center">
                    <ShieldCheck className="w-8 h-8 mr-4 text-red-600" /> Validação <span className="text-red-600 ml-2">Master Admin.</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                     {pendingAdminApprovals.map(o => (
                       <div key={o.id} className="bg-black text-white p-10 rounded-[3.5rem] shadow-2xl flex justify-between items-center group border border-white/5">
                          <div className="flex-grow">
                             <div className="flex items-center space-x-6 mb-4">
                                <span className="text-3xl font-brand font-black italic text-white uppercase">{o.id}</span>
                                <span className="px-5 py-2 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Aprovação Master Requerida</span>
                             </div>
                             <div className="grid grid-cols-4 gap-8 text-[10px] font-black uppercase text-gray-500 italic">
                                <div><span className="block text-gray-600">Cliente</span>{o.client}</div>
                                <div><span className="block text-gray-600">Material</span>{o.material}</div>
                                <div><span className="block text-gray-600">Módulo</span>{o.product}</div>
                                <div><span className="block text-gray-600">Valor</span>€{o.value}</div>
                             </div>
                          </div>
                          <div className="flex space-x-4">
                             <button onClick={() => { onSound?.('success'); onUpdateStatus(o.id, 'Aguardando Aprovação'); }} className="bg-white text-black px-8 py-4 rounded-full font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all">Validar e Submeter Hub</button>
                             <button onClick={() => { onSound?.('error'); onUpdateStatus(o.id, 'Rejeitado'); }} className="p-4 bg-red-600/20 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"><X /></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {/* 2. Hub Assignment Queue */}
             {pendingHubAssignments.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase flex items-center">
                    <Server className="w-8 h-8 mr-4 text-red-600" /> Atribuição de <span className="text-red-600 ml-2">Nodo Industrial.</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                     {pendingHubAssignments.map(o => (
                       <div key={o.id} className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl flex justify-between items-center group hover:border-red-600 transition-all">
                          <div className="flex-grow">
                             <div className="flex items-center space-x-6 mb-4">
                                <span className="text-3xl font-brand font-black italic text-black uppercase">{o.id}</span>
                                <span className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Validado Admin</span>
                             </div>
                             <div className="grid grid-cols-4 gap-8 text-[10px] font-black uppercase text-gray-400 italic">
                                <div><span className="block text-gray-300">Entidade</span>{o.client}</div>
                                <div><span className="block text-gray-300">Produto</span>{o.product}</div>
                                <div><span className="block text-gray-300">Capital</span>€{o.value}</div>
                             </div>
                          </div>
                          <div className="flex items-center space-x-4">
                             <select className="bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase" id={`h-${o.id}`}>
                                <option value="">ESCOLHER NODO...</option>
                                {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                             </select>
                             <button onClick={() => {
                               const h = (document.getElementById(`h-${o.id}`) as HTMLSelectElement).value;
                               if(h) { onSound?.('success'); onUpdateStatus(o.id, 'Aprovado', h); }
                             }} className="bg-black text-white p-5 rounded-full hover:bg-green-600 transition-all shadow-xl"><CheckCircle /></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {/* 3. User Quarantine */}
             {pendingUsers.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase">Utilizadores em <span className="text-red-600">Quarentena.</span></h3>
                  <div className="grid grid-cols-1 gap-4">
                     {pendingUsers.map(u => (
                       <div key={u.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl flex justify-between items-center group hover:border-red-600 transition-all">
                          <div className="flex items-center space-x-6">
                             <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center font-brand font-black italic text-xl">{u.name[0]}</div>
                             <div>
                                <span className="text-2xl font-brand font-black italic uppercase text-black block">{u.name}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.email} // Role: {u.role}</span>
                             </div>
                          </div>
                          <div className="flex space-x-3">
                             <button onClick={() => { onSound?.('success'); onUpdateUser(u.id, { status: 'Ativo' }); }} className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all">Autorizar Handshake</button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Existing & Enhanced Views (Orders, Hubs, Users, Products) */}
        <div className="grid grid-cols-1 gap-4">
          {activeView !== 'approvals' && activeView !== 'financials' && filteredItems.map((item: any) => (
             <div key={item.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-50 hover:border-black shadow-lg transition-all flex items-center justify-between">
                <div className="flex items-center space-x-8">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-brand font-black italic text-xl shadow-inner ${activeView === 'users' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                      {item.name ? item.name[0] : '#'}
                   </div>
                   <div>
                      <h5 className="text-xl font-brand font-black italic uppercase text-black">{item.name || item.id}</h5>
                      <div className="flex items-center space-x-4">
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.email || item.category || item.status || item.role}</p>
                         {activeView === 'hubs' && (
                           <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[8px] font-black uppercase">Comm: {item.primaryCommission || 0}%</span>
                         )}
                      </div>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                   {(activeView === 'users' || activeView === 'hubs') && (
                      <button 
                        onClick={() => {
                          const targetUser = activeView === 'users' ? item : users.find(u => u.managedHubId === item.id);
                          if (targetUser) onImpersonate(targetUser);
                        }} 
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2"
                      >
                         <ArrowUpRight className="w-4 h-4" /> <span>Shadow Mode</span>
                      </button>
                   )}
                   <button onClick={() => setEditingItem({type: activeView.slice(0, -1) as any, data: {...item}})} className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all">
                      <Edit className="w-5 h-5" />
                   </button>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Full Super Admin Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[5rem] p-16 shadow-2xl border-[15px] border-black relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setEditingItem(null)} className="absolute top-10 right-10 p-4 text-gray-300 hover:text-black transition-all"><X className="w-8 h-8"/></button>
              
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Editar <span className="text-red-600">{editingItem.type}</span></h3>
              
              <div className="space-y-8">
                 {editingItem.type === 'user' && (
                   <>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-gray-400">Dados do Utilizador</label>
                         <input type="text" value={editingItem.data.name} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} placeholder="NOME" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                         <input type="email" value={editingItem.data.email} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, email: e.target.value}})} placeholder="EMAIL" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                         <select value={editingItem.data.role} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, role: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none">
                            <option value="Cliente">Cliente</option>
                            <option value="B2B_Admin">Hub Admin</option>
                            <option value="Administrador">Super Admin</option>
                            <option value="Utilizador_Standard">Standard</option>
                         </select>
                         <select value={editingItem.data.status} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, status: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none">
                            <option value="Ativo">Ativo</option>
                            <option value="Bloqueado">Bloqueado</option>
                            <option value="Pendente">Pendente</option>
                         </select>
                         <select value={editingItem.data.tier} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, tier: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none">
                            <option value="Bronze">Bronze</option>
                            <option value="Prata">Prata</option>
                            <option value="Ouro">Ouro</option>
                            <option value="Platina">Platina</option>
                         </select>
                      </div>
                   </>
                 )}

                 {editingItem.type === 'hub' && (
                   <>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-gray-400">Configuração HUB & Comissões</label>
                         <input type="text" value={editingItem.data.name} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} placeholder="NOME DO HUB" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                         <input type="text" value={editingItem.data.location} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, location: e.target.value}})} placeholder="LOCALIZAÇÃO" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                         
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-red-600">Comissão HUB (%)</label>
                               <input type="number" value={editingItem.data.primaryCommission || 0} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, primaryCommission: parseFloat(e.target.value)}})} className="w-full bg-gray-100 p-6 rounded-3xl font-black text-xl outline-none" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-orange-600">Camada Secundária (%)</label>
                               <input type="number" value={editingItem.data.secondaryCommission || 0} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, secondaryCommission: parseFloat(e.target.value)}})} className="w-full bg-gray-100 p-6 rounded-3xl font-black text-xl outline-none" />
                            </div>
                         </div>
                      </div>
                   </>
                 )}

                 <button onClick={handleSaveEdit} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-4">
                    <Save className="w-5 h-5" /> <span>Sincronizar Alterações</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
