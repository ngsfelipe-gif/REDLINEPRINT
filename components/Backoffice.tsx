
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle, CheckCircle, BarChart3, CreditCard, PieChart, Coins, TrendingUp, Settings, RefreshCw, FileDigit, QrCode, FileDown } from 'lucide-react';
import { generateOrderPDF, downloadOriginalAsset } from '../services/pdfService';

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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingAdminApprovals = orders.filter(o => o.status === 'Pendente_Admin');

  const financials = useMemo(() => {
    let totalRevenue = 0;
    let hubCommissions = 0;
    let platformShare = 0;
    let partnerShare = 0;
    let cashbackGiven = 0;

    orders.filter(o => o.status === 'Concluído').forEach(order => {
      const val = parseFloat(order.value);
      totalRevenue += val;
      const hub = hubs.find(h => h.id === order.nodeId);
      const client = users.find(u => u.id === order.clientId);
      
      if (hub) {
        hubCommissions += val * ((hub.primaryCommission || 0) / 100);
        platformShare += val * ((hub.platformCommission || globalPlatformFee) / 100);
      }
      if (client) {
        if (client.partnerCommissionRate) partnerShare += val * (client.partnerCommissionRate / 100);
        if (client.role === 'Utilizador_Standard') cashbackGiven += val * 0.02;
      }
    });

    const net = totalRevenue - hubCommissions - platformShare - partnerShare - cashbackGiven;
    return { totalRevenue, totalHub: hubCommissions, totalPlatform: platformShare, totalPartner: partnerShare, cashbackGiven, totalNet: net };
  }, [orders, hubs, users, globalPlatformFee]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeView === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, activeView, searchTerm]);

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

  const handleDownloadPDF = (o: ProductionJob) => {
    onSound?.('success');
    const hub = hubs.find(h => h.id === o.nodeId);
    generateOrderPDF(o, hub);
  };

  const handleDownloadAsset = (o: ProductionJob) => {
    onSound?.('success');
    downloadOriginalAsset(o);
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
                  {v} {(v === 'approvals' && pendingAdminApprovals.length > 0) && <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-full text-[8px] animate-pulse">{pendingAdminApprovals.length}</span>}
               </button>
             ))}
          </div>
        </div>

        {activeView === 'financials' && (
          <div className="space-y-12 animate-in fade-in">
             <div className="bg-white p-16 rounded-[5rem] border border-gray-100 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-12 mb-16">
                <div className="flex items-center space-x-8">
                   <div className="p-6 bg-red-600 rounded-3xl text-white shadow-xl"><Settings className="w-10 h-10 animate-spin-slow" /></div>
                   <div>
                      <h4 className="text-[12px] font-black uppercase text-gray-400 tracking-widest block mb-2">Engenharia de Receita</h4>
                      <h3 className="text-3xl font-brand font-black italic uppercase text-black">Taxa da Plataforma Redline (%)</h3>
                   </div>
                </div>
                <div className="flex items-center space-x-6">
                   <div className="flex items-center bg-gray-50 px-10 py-6 rounded-[2.5rem] border border-gray-100 shadow-inner">
                      <input type="number" value={globalPlatformFee} onChange={(e) => setGlobalPlatformFee(parseFloat(e.target.value))} className="bg-transparent text-5xl font-brand font-black italic text-black outline-none w-24 text-center" />
                      <span className="text-3xl font-brand font-black italic text-red-600 ml-2">%</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-black text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 industrial-grid opacity-5" />
                   <CreditCard className="w-10 h-10 text-red-600 mb-6" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Revenue Bruto</span>
                   <span className="text-5xl font-brand font-black italic block">€{financials.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl group">
                   <Coins className="w-10 h-10 text-red-600 mb-6" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Plataforma (Fee)</span>
                   <span className="text-5xl font-brand font-black italic block">€{financials.totalPlatform.toLocaleString()}</span>
                </div>
                <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl group">
                   <PieChart className="w-10 h-10 text-orange-600 mb-6" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Comissão HUBs</span>
                   <span className="text-5xl font-brand font-black italic block">€{financials.totalHub.toLocaleString()}</span>
                </div>
                <div className="bg-red-600 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                   <TrendingUp className="w-10 h-10 text-white mb-6" />
                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-2">Net Industrial</span>
                   <span className="text-5xl font-brand font-black italic block">€{financials.totalNet.toLocaleString()}</span>
                </div>
             </div>
          </div>
        )}

        {activeView === 'orders' && (
           <div className="space-y-8">
              <div className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-2xl flex items-center mb-12">
                 <Search className="w-6 h-6 text-gray-300 ml-6" />
                 <input type="text" placeholder="LOCALIZAR JOB NO GRID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black uppercase text-[11px] p-6" />
              </div>
              {filteredItems.map((o: any) => (
                <div key={o.id} className={`bg-white rounded-[4.5rem] border transition-all duration-500 overflow-hidden shadow-xl ${expandedOrder === o.id ? 'border-black ring-4 ring-black/5' : 'border-gray-100 hover:border-red-600/30'}`}>
                   <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                      <div className="flex-grow">
                         <div className="flex items-center space-x-8 mb-6">
                            <span className="text-3xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                            <div className="flex items-center space-x-3 bg-red-50 text-red-600 px-6 py-2 rounded-full border border-red-100">
                               <Activity className="w-4 h-4 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{o.status.replace('_', ' ')}</span>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-[10px] font-black uppercase text-gray-400 italic">
                            <div><span className="text-gray-300 block mb-1">Entidade</span><span className="text-black">{o.client}</span></div>
                            <div><span className="text-gray-300 block mb-1">Módulo</span><span className="text-black">{o.product}</span></div>
                            <div><span className="text-gray-300 block mb-1">Dimensões</span><span className="text-black font-brand">{o.dimensions || 'N/A'}</span></div>
                            <div><span className="text-gray-300 block mb-1">Valor Ativo</span><span className="text-black font-brand">€{o.value}</span></div>
                         </div>
                      </div>
                      <div className="flex space-x-4">
                         <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} className={`p-6 rounded-3xl transition-all shadow-xl ${expandedOrder === o.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-black hover:text-white'}`}>
                            {expandedOrder === o.id ? <ChevronUp /> : <ChevronDown />}
                         </button>
                         <div className="flex space-x-2">
                           <button onClick={() => handleDownloadPDF(o)} title="Descarregar PDF" className="p-6 bg-black text-white rounded-3xl hover:bg-red-600 transition-all shadow-xl">
                              <FileDown className="w-5 h-5"/>
                           </button>
                           {o.fileName && (
                             <button onClick={() => handleDownloadAsset(o)} title="Descarregar Ativo" className="p-6 bg-red-50 text-red-600 rounded-3xl hover:bg-black hover:text-white transition-all shadow-xl">
                                <Download className="w-5 h-5"/>
                             </button>
                           )}
                         </div>
                      </div>
                   </div>
                   {expandedOrder === o.id && (
                      <div className="p-16 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-4">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="space-y-8">
                               <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center"><Server className="w-4 h-4 mr-3" /> Distribuição Industrial</h5>
                               <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl">
                                  <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Nodo Processamento</span>
                                  <span className="text-[11px] font-black text-black uppercase">{hubs.find(h => h.id === o.nodeId)?.name || 'Central R2'}</span>
                               </div>
                               <div className="p-8 bg-black text-white rounded-[2.5rem] flex items-center space-x-6 shadow-2xl">
                                  <QrCode className="w-10 h-10 text-red-600" />
                                  <span className="text-[10px] font-mono text-white/40">AUTH_HASH: {o.id}-{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center"><FileDigit className="w-4 h-4 mr-3" /> Assets & Engenharia</h5>
                               <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 space-y-4 shadow-xl">
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center space-x-4">
                                        <FileText className="w-6 h-6 text-red-600" />
                                        <span className="text-[10px] font-black text-black uppercase">{o.fileName || 'asset_industrial_v1.pdf'}</span>
                                     </div>
                                     <button onClick={() => handleDownloadAsset(o)} className="p-4 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all"><Download className="w-5 h-5"/></button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 bg-gray-50 rounded-2xl text-[9px] font-black uppercase tracking-widest">Mat: {o.material}</div>
                                     <div className="p-4 bg-gray-50 rounded-2xl text-[9px] font-black uppercase tracking-widest">Fin: {o.finish}</div>
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center"><History className="w-4 h-4 mr-3" /> Protocolo R2-Log</h5>
                               <div className="space-y-4 border-l-2 border-red-100 pl-8 ml-2">
                                  {o.history.map((h: any, i: number) => (
                                    <div key={i} className="relative">
                                       <span className="text-[8px] font-black text-gray-300 uppercase block">{new Date(h.timestamp).toLocaleString()}</span>
                                       <span className="text-[10px] font-black text-black uppercase block">{h.status}</span>
                                       <p className="text-[9px] text-gray-400 italic">"{h.note}"</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>
              ))}
           </div>
        )}

        {(activeView === 'users' || activeView === 'hubs' || activeView === 'products') && (
           <div className="grid grid-cols-1 gap-4">
              {filteredItems.map((item: any) => (
                 <div key={item.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-50 hover:border-black shadow-lg transition-all flex items-center justify-between group">
                    <div className="flex items-center space-x-8">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-brand font-black italic text-xl shadow-inner ${activeView === 'users' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                          {item.name ? item.name[0] : '#'}
                       </div>
                       <div>
                          <h5 className="text-xl font-brand font-black italic uppercase text-black">{item.name || item.id}</h5>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.email || item.category || item.status || item.role}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-4">
                       {(activeView === 'users' || activeView === 'hubs') && (
                          <button onClick={() => onImpersonate(activeView === 'users' ? item : users.find(u => u.managedHubId === item.id))} className="px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2">
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
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[5rem] p-16 shadow-2xl border-[15px] border-black relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setEditingItem(null)} className="absolute top-10 right-10 p-4 text-gray-300 hover:text-black transition-all"><X className="w-8 h-8"/></button>
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Edit <span className="text-red-600">{editingItem.type}</span></h3>
              <div className="space-y-8">
                 {editingItem.type === 'user' && (
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-gray-400">Dados da Entidade</label>
                      <input type="text" value={editingItem.data.name} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                      <input type="email" value={editingItem.data.email} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, email: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                      <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
                         <label className="text-[9px] font-black uppercase text-red-600">Comissão de Parceiro (%)</label>
                         <input type="number" value={editingItem.data.partnerCommissionRate || 0} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, partnerCommissionRate: parseFloat(e.target.value)}})} className="w-full bg-white p-4 rounded-xl font-black text-xl outline-none" />
                      </div>
                      <select value={editingItem.data.role} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, role: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none">
                         <option value="Cliente">Cliente B2B</option>
                         <option value="B2B_Admin">Hub Manager</option>
                         <option value="Administrador">Super Admin</option>
                         <option value="Utilizador_Standard">Utilizador Comum</option>
                      </select>
                   </div>
                 )}
                 {editingItem.type === 'hub' && (
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-gray-400">Parâmetros de Comissão do Nodo</label>
                       <input type="text" value={editingItem.data.name} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none" />
                       <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase text-gray-400">Primary (%)</label>
                             <input type="number" value={editingItem.data.primaryCommission} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, primaryCommission: parseFloat(e.target.value)}})} className="w-full bg-gray-50 p-4 rounded-xl font-black outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase text-gray-400">Sec (%)</label>
                             <input type="number" value={editingItem.data.secondaryCommission} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, secondaryCommission: parseFloat(e.target.value)}})} className="w-full bg-gray-50 p-4 rounded-xl font-black outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black uppercase text-red-600">Plat (%)</label>
                             <input type="number" value={editingItem.data.platformCommission} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, platformCommission: parseFloat(e.target.value)}})} className="w-full bg-red-50 p-4 rounded-xl font-black outline-none" />
                          </div>
                       </div>
                    </div>
                 )}
                 <button onClick={handleSaveEdit} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-4">
                    <Save className="w-5 h-5" /> <span>Persistir no Grid R2</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
