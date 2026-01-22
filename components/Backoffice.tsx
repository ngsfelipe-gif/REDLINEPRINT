
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle, CheckCircle, BarChart3, CreditCard, PieChart, Coins, TrendingUp, Settings, RefreshCw, FileDigit, QrCode, FileDown, Barcode, Percent } from 'lucide-react';
import { generateOrderPDF, downloadOriginalAsset } from '../services/pdfService';
import { MATERIALS, FINISHES } from '../constants';

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
  globalPlatformFee: number;
  setGlobalPlatformFee: (fee: number) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, hubRequests, authRequests, language, onUpdateStatus, onUpdateUser, onUpdateHub, onUpdateProduct, onUpdateOrder, onApproveHub, onApproveAuth, onImpersonate, onCreateUser, onCreateClient, onSound, globalPlatformFee, setGlobalPlatformFee
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'products' | 'financials'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{type: 'user' | 'hub' | 'product' | 'order', data: any} | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<'user' | 'product' | null>(null);

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Master Protocol Denied.</div>;

  const pendingAdminApprovals = useMemo(() => orders.filter(o => o.status === 'Pendente_Admin'), [orders]);

  const financials = useMemo(() => {
    let totalRevenue = 0;
    let totalPlatform = 0;
    let totalHub = 0;

    orders.forEach(o => {
      const val = parseFloat(o.value) || 0;
      totalRevenue += val;
      
      const hub = hubs.find(h => h.id === o.nodeId);
      const hubRate = hub?.primaryCommission || 15;
      const platRate = hub?.platformCommission || globalPlatformFee;
      
      const platShare = (val * platRate) / 100;
      const hubGross = (val * hubRate) / 100;
      
      totalPlatform += platShare;
      totalHub += (hubGross - platShare);
    });

    return { totalRevenue, totalPlatform, totalHub, totalNet: totalPlatform };
  }, [orders, hubs, globalPlatformFee]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeView === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, activeView, searchTerm]);

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in">
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-24">
        <div>
          <div className="inline-flex items-center space-x-3 bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl mb-8 border border-white/20">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Master Control v4.2</span>
          </div>
          <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Torre de <br/><span className="text-red-600">Controlo.</span></h2>
        </div>
        
        <div className="flex flex-wrap bg-white p-3 rounded-[3.5rem] shadow-2xl border border-gray-100 gap-4">
           {['approvals', 'orders', 'hubs', 'users', 'products', 'financials'].map(v => (
             <button 
              key={v} 
              onClick={() => { onSound?.('click'); setActiveView(v as any); setSearchTerm(''); }} 
              className={`px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeView === v ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
             >
                {v} 
                {(v === 'approvals' && pendingAdminApprovals.length > 0) && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] animate-bounce shadow-lg border-2 border-white">{pendingAdminApprovals.length}</span>
                )}
             </button>
           ))}
        </div>
      </div>

      {/* Global Search & Master Actions */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="bg-white p-2 rounded-[3rem] border border-gray-100 shadow-2xl flex items-center max-w-2xl w-full">
            <Search className="w-8 h-8 text-gray-300 ml-6" />
            <input type="text" placeholder={`LOCALIZAR EM ${activeView.toUpperCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black uppercase text-[12px] p-8 placeholder:text-gray-200" />
         </div>
         <div className="flex space-x-4">
            {activeView === 'users' && <button onClick={() => setShowCreateModal('user')} className="bg-black text-white px-10 py-6 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all flex items-center space-x-4 shadow-xl"><UserPlus className="w-5 h-5" /> <span>Criar Entidade</span></button>}
            {activeView === 'products' && <button onClick={() => setShowCreateModal('product')} className="bg-black text-white px-10 py-6 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all flex items-center space-x-4 shadow-xl"><Plus className="w-5 h-5" /> <span>Injetar Módulo</span></button>}
         </div>
      </div>

      {/* VIEW: FINANCIALS - ENGENHARIA DE RECEITA */}
      {activeView === 'financials' && (
        <div className="space-y-12 animate-in fade-in">
           <div className="bg-white p-16 rounded-[5rem] border border-gray-100 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-12 mb-16">
              <div className="flex items-center space-x-8">
                 <div className="p-8 bg-red-600 rounded-[2.5rem] text-white shadow-xl"><Settings className="w-12 h-12 animate-spin-slow" /></div>
                 <div>
                    <h4 className="text-[12px] font-black uppercase text-gray-400 tracking-widest block mb-2">Engenharia de Receita</h4>
                    <h3 className="text-4xl font-brand font-black italic uppercase text-black">Taxa da Plataforma Redline (%)</h3>
                 </div>
              </div>
              <div className="flex items-center space-x-6">
                 <div className="flex items-center bg-gray-50 px-12 py-8 rounded-[3rem] border border-gray-100 shadow-inner">
                    <input 
                      type="number" 
                      value={globalPlatformFee} 
                      onChange={(e) => setGlobalPlatformFee(parseFloat(e.target.value))} 
                      className="bg-transparent text-6xl font-brand font-black italic text-black outline-none w-32 text-center" 
                    />
                    <span className="text-4xl font-brand font-black italic text-red-600 ml-4">%</span>
                 </div>
              </div>
           </div>

           {/* Dashboard de KPIs Financeiros */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 industrial-grid opacity-5" />
                 <CreditCard className="w-12 h-12 text-red-600 mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Gross Revenue</span>
                 <span className="text-6xl font-brand font-black italic block">€{financials.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-xl group hover:border-black transition-all">
                 <Coins className="w-12 h-12 text-red-600 mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Platform Share</span>
                 <span className="text-6xl font-brand font-black italic block">€{financials.totalPlatform.toLocaleString()}</span>
              </div>
              <div className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-xl group hover:border-black transition-all">
                 <PieChart className="w-12 h-12 text-orange-600 mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Hub Payouts</span>
                 <span className="text-6xl font-brand font-black italic block">€{financials.totalHub.toLocaleString()}</span>
              </div>
              <div className="bg-red-600 text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
                 <TrendingUp className="w-12 h-12 text-white mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-4">Net Industrial</span>
                 <span className="text-6xl font-brand font-black italic block">€{financials.totalNet.toLocaleString()}</span>
              </div>
           </div>

           {/* Painel de Gestão de Comissões por HUB */}
           <div className="bg-white p-12 rounded-[5rem] shadow-2xl border border-gray-100">
              <h4 className="text-4xl font-brand font-black italic uppercase text-black mb-12 flex items-center gap-4">
                 <Percent className="w-10 h-10 text-red-600" />
                 Gestão de Comissões por Nodo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {hubs.map(h => (
                    <div key={h.id} className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 flex flex-col justify-between group hover:border-black transition-all">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{h.id}</span>
                             <h5 className="text-2xl font-brand font-black italic uppercase text-black leading-none">{h.name}</h5>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                             <span className="text-[10px] font-black uppercase text-gray-500">Hub Share (%)</span>
                             <input 
                                type="number" 
                                value={h.primaryCommission} 
                                onChange={(e) => onUpdateHub(h.id, { primaryCommission: parseFloat(e.target.value) })}
                                className="bg-transparent text-xl font-brand font-black italic text-black w-16 text-right outline-none"
                             />
                          </div>
                          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                             <span className="text-[10px] font-black uppercase text-gray-500">Plat. Fee (%)</span>
                             <input 
                                type="number" 
                                value={h.platformCommission} 
                                onChange={(e) => onUpdateHub(h.id, { platformCommission: parseFloat(e.target.value) })}
                                className="bg-transparent text-xl font-brand font-black italic text-black w-16 text-right outline-none"
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Ledger de Transações em Tempo Real */}
           <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                 <h4 className="text-[12px] font-black uppercase text-black tracking-[0.4em]">Grid Financial Ledger (Real-time)</h4>
                 <div className="flex items-center space-x-3 text-green-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span>Sync Active</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-gray-50">
                          <th className="px-12 py-8 text-[9px] font-black uppercase text-gray-400">Barcode/Order</th>
                          <th className="px-12 py-8 text-[9px] font-black uppercase text-gray-400">Módulo</th>
                          <th className="px-12 py-8 text-[9px] font-black uppercase text-gray-400">Gross</th>
                          <th className="px-12 py-8 text-[9px] font-black uppercase text-gray-400">Platform Fee</th>
                          <th className="px-12 py-8 text-[9px] font-black uppercase text-gray-400">Net Earn</th>
                          <th className="px-12 py-8 text-[9px] font-black uppercase text-gray-400">Status Grid</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {orders.map(o => {
                          const val = parseFloat(o.value) || 0;
                          const hub = hubs.find(h => h.id === o.nodeId);
                          const fee = (val * (hub?.platformCommission || globalPlatformFee)) / 100;
                          return (
                            <tr key={o.id} className="hover:bg-gray-50 transition-colors group cursor-default">
                               <td className="px-12 py-8 font-brand font-black italic text-black uppercase tracking-tighter text-lg">{o.id}</td>
                               <td className="px-12 py-8 font-black text-gray-400 text-[11px] uppercase tracking-widest">{o.product}</td>
                               <td className="px-12 py-8 font-black text-black text-[11px]">€{val.toLocaleString()}</td>
                               <td className="px-12 py-8 font-black text-red-600 text-[11px]">-€{fee.toLocaleString()}</td>
                               <td className="px-12 py-8 font-black text-black text-[13px] group-hover:scale-110 transition-transform">€{(val - fee).toLocaleString()}</td>
                               <td className="px-12 py-8">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${o.status === 'Concluído' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                     {o.status}
                                  </span>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* VIEW: USERS MANAGEMENT (SHADOW MODE) */}
      {activeView === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5">
           {filteredItems.map((u: any) => (
             <div key={u.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl group hover:border-black transition-all">
                <div className="flex justify-between items-start mb-10">
                   <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-brand font-black italic shadow-xl ${u.role === 'B2B_Admin' ? 'bg-red-600' : 'bg-black'}`}>{u.name[0]}</div>
                   <div className="flex space-x-2">
                      <button onClick={() => onImpersonate(u)} title="Shadow Mode" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => setEditingItem({type: 'user', data: u})} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all"><Edit className="w-5 h-5" /></button>
                      <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </div>
                <h4 className="text-3xl font-brand font-black italic uppercase text-black mb-2 leading-none">{u.name}</h4>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">{u.email}</p>
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-50">
                   <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[9px] font-black uppercase text-gray-500">{u.role.replace('_', ' ')}</span>
                   <span className="px-4 py-1.5 bg-red-50 rounded-full text-[9px] font-black uppercase text-red-600">{u.tier}</span>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* VIEW: PRODUCTS MANAGEMENT */}
      {activeView === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-5">
           {filteredItems.map((p: any) => (
             <div key={p.id} className="bg-white rounded-[4rem] border border-gray-100 shadow-xl overflow-hidden group hover:border-red-600 transition-all">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                   <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                   <div className="absolute top-6 right-6 flex space-x-2">
                      <button onClick={() => setEditingItem({type: 'product', data: p})} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-black shadow-lg"><Edit className="w-4 h-4" /></button>
                   </div>
                </div>
                <div className="p-8">
                   <span className="text-[8px] font-black uppercase text-red-600 tracking-widest mb-2 block">{p.category}</span>
                   <h5 className="text-2xl font-brand font-black italic uppercase text-black mb-4 leading-none">{p.name}</h5>
                   <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                      <span className="text-3xl font-brand font-black italic text-black">€{p.basePrice}</span>
                      <span className="text-[9px] font-black uppercase text-gray-400">ID: {p.id}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* VIEW: APPROVALS */}
      {activeView === 'approvals' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-5">
           {pendingAdminApprovals.length > 0 ? (
             <div className="grid grid-cols-1 gap-8">
               {pendingAdminApprovals.map(o => (
                 <div key={o.id} className="bg-white p-12 rounded-[5rem] border-2 border-red-100 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-12 group hover:border-red-600 transition-all">
                    <div className="flex-grow flex items-center space-x-12">
                       <div className="bg-black text-red-600 p-10 rounded-[3rem] shadow-xl group-hover:rotate-12 transition-transform">
                          <Package className="w-12 h-12" />
                       </div>
                       <div>
                          <div className="flex items-center space-x-4 mb-3">
                             <span className="text-5xl font-brand font-black italic text-black uppercase">{o.id}</span>
                             <span className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">Injeção Pendente</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[11px] font-black uppercase text-gray-400 italic">
                             <div><span className="text-gray-300 block mb-1">Entidade:</span>{o.client}</div>
                             <div><span className="text-gray-300 block mb-1">Módulo:</span>{o.product}</div>
                             <div><span className="text-gray-300 block mb-1">Valor:</span>€{o.value}</div>
                             <div><span className="text-gray-300 block mb-1">HUB Destino:</span>{hubs.find(h => h.id === o.nodeId)?.name}</div>
                          </div>
                       </div>
                    </div>
                    <div className="flex space-x-4">
                       <button onClick={() => { onSound?.('error'); onUpdateStatus(o.id, 'Rejeitado'); }} className="p-8 bg-gray-50 text-gray-400 rounded-full hover:bg-black hover:text-white transition-all shadow-xl"><X className="w-8 h-8"/></button>
                       <button onClick={() => { onSound?.('success'); onUpdateStatus(o.id, 'Aprovado'); }} className="bg-red-600 text-white px-16 py-8 rounded-full font-black uppercase text-[12px] tracking-[0.4em] hover:bg-black transition-all shadow-2xl flex items-center space-x-4">
                          <span>Aprovar Ordem</span> <CheckCircle className="w-6 h-6" />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-40 text-center space-y-10 opacity-20">
                <ShieldCheck className="w-32 h-32 mx-auto" />
                <p className="text-5xl font-brand font-black italic uppercase">Grid em Repouso. Zero Pendentes.</p>
             </div>
           )}
        </div>
      )}

      {/* MODAL: EDIT ITEM (USER / HUB / PRODUCT) */}
      {editingItem && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[5rem] p-20 shadow-2xl border-[15px] border-black relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setEditingItem(null)} className="absolute top-12 right-12 p-4 text-gray-300 hover:text-black hover:rotate-90 transition-all"><X className="w-10 h-10"/></button>
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12 leading-none">Editar <br/><span className="text-red-600">{editingItem.type.toUpperCase()}.</span></h3>
              
              <div className="space-y-8">
                 {editingItem.type === 'user' && (
                    <>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nome da Entidade</label>
                          <input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Email de Protocolo</label>
                          <input type="email" value={editingItem.data.email} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, email: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nível de Acesso (Role)</label>
                          <select value={editingItem.data.role} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, role: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600">
                             <option value="Utilizador_Standard">Standard Client</option>
                             <option value="B2B_Admin">HUB Partner</option>
                          </select>
                       </div>
                    </>
                 )}
                 {editingItem.type === 'product' && (
                    <>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nome do Módulo</label>
                          <input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Preço Base (€)</label>
                          <input type="number" value={editingItem.data.basePrice} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, basePrice: parseFloat(e.target.value)}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Descrição Técnica</label>
                          <textarea value={editingItem.data.description} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 h-32" />
                       </div>
                    </>
                 )}
                 <button onClick={() => { 
                    if(editingItem.type === 'user') onUpdateUser(editingItem.data.id, editingItem.data);
                    if(editingItem.type === 'product') onUpdateProduct(editingItem.data.id, editingItem.data);
                    setEditingItem(null); 
                    onSound?.('success'); 
                 }} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all flex items-center justify-center space-x-6">
                    <Save className="w-6 h-6" /> <span>Sincronizar Alterações</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: CREATE MODAL (USER / PRODUCT) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[5rem] p-20 shadow-2xl border-[15px] border-red-600 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowCreateModal(null)} className="absolute top-12 right-12 p-4 text-gray-300 hover:text-black hover:rotate-90 transition-all"><X className="w-10 h-10"/></button>
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12 leading-none">Novo <br/><span className="text-red-600">{showCreateModal.toUpperCase()} R2.</span></h3>
              
              <div className="space-y-8">
                 {showCreateModal === 'user' && (
                    <form onSubmit={(e) => { 
                       e.preventDefault(); 
                       const data = new FormData(e.currentTarget);
                       onCreateClient({
                          name: data.get('name') as string,
                          email: data.get('email') as string,
                          role: data.get('role') as any,
                       });
                       setShowCreateModal(null);
                    }} className="space-y-6">
                       <input name="name" type="text" placeholder="NOME DA ENTIDADE" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" required />
                       <input name="email" type="email" placeholder="EMAIL DE PROTOCOLO" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" required />
                       <select name="role" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none">
                          <option value="Utilizador_Standard">Standard Client</option>
                          <option value="B2B_Admin">HUB Partner</option>
                       </select>
                       <button type="submit" className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all">Provisionar Acesso</button>
                    </form>
                 )}
                 {showCreateModal === 'product' && (
                    <form onSubmit={(e) => { 
                       e.preventDefault();
                       const data = new FormData(e.currentTarget);
                       const newProd: ExtendedProduct = {
                          id: `MOD-${Date.now()}`,
                          name: data.get('name') as string,
                          category: data.get('category') as any,
                          description: data.get('desc') as string,
                          basePrice: parseFloat(data.get('price') as string),
                          unit: 'un',
                          image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=1000',
                          status: 'Ativo',
                          ownerHubId: 'SYSTEM',
                          specs: { weight: '---', durability: '---', precisionLevel: 'R2' }
                       };
                       onUpdateProduct(newProd.id, newProd);
                       setShowCreateModal(null);
                    }} className="space-y-6">
                       <input name="name" type="text" placeholder="NOME DO MÓDULO" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" required />
                       <input name="price" type="number" placeholder="PREÇO BASE (€)" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" required />
                       <select name="category" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none">
                          {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <textarea name="desc" placeholder="ESPECIFICAÇÃO TÉCNICA" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none h-32" />
                       <button type="submit" className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all">Injetar Módulo no Grid</button>
                    </form>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
