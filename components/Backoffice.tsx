
import React, { useState, useMemo, useEffect } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
// Fixed missing Power import from lucide-react
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle, CheckCircle, BarChart3, CreditCard, PieChart, Coins, TrendingUp, Settings, RefreshCw, FileDigit, QrCode, FileDown, Barcode, Percent, Filter, MapPin, ExternalLink, Box, Power } from 'lucide-react';
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
  onSound?: (type: 'click' | 'success' | 'sync' | 'error' | 'loading' | 'redcoin') => void;
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Master Protocol Denied.</div>;

  // Real-time synchronization is handled by the 'orders' prop being updated in App.tsx
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
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term) || o.product.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, activeView, searchTerm]);

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in">
      {/* Header Central de Comando */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-24">
        <div>
          <div className="inline-flex items-center space-x-3 bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl mb-8 border border-white/20 active-glow transition-all">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Super Admin Control v4.6</span>
          </div>
          <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Torre de <br/><span className="text-red-600">Controlo.</span></h2>
        </div>
        
        <div className="flex flex-wrap bg-white p-3 rounded-[3.5rem] shadow-2xl border border-gray-100 gap-4">
           {['approvals', 'orders', 'hubs', 'users', 'products', 'financials'].map(v => (
             <button 
              key={v} 
              onClick={() => { onSound?.('click'); setActiveView(v as any); setSearchTerm(''); }} 
              className={`px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeView === v ? 'bg-black text-white shadow-2xl scale-105 active-glow' : 'text-gray-400 hover:bg-gray-50'}`}
             >
                {v} 
                {(v === 'approvals' && pendingAdminApprovals.length > 0) && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] animate-bounce shadow-lg border-2 border-white">{pendingAdminApprovals.length}</span>
                )}
             </button>
           ))}
        </div>
      </div>

      {/* VIEW: ORDERS - LISTAGEM COMPLETA E DETALHADA */}
      {activeView === 'orders' && (
        <div className="space-y-10 animate-in fade-in">
           {/* Sumário de Operações do Grid */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Total Jobs', val: orders.length, icon: Package, color: 'text-black' },
                { label: 'Em Manufatura', val: orders.filter(o=>o.status==='Em Produção').length, icon: Activity, color: 'text-red-600' },
                { label: 'Aguardando Master', val: pendingAdminApprovals.length, icon: Clock, color: 'text-orange-600' },
                { label: 'Concluídos', val: orders.filter(o=>o.status==='Concluído').length, icon: CheckCircle2, color: 'text-green-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex items-center space-x-6 hover:scale-105 transition-transform">
                   <div className={`p-4 bg-gray-50 rounded-2xl ${stat.color}`}><stat.icon className="w-8 h-8" /></div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">{stat.label}</span>
                      <span className="text-4xl font-brand font-black italic">{stat.val}</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                   <h4 className="text-[12px] font-black uppercase text-black tracking-[0.4em] flex items-center">
                      <Box className="w-5 h-5 mr-3 text-red-600" /> Registro Global de Produção Industrial
                   </h4>
                   <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span className="status-pulse px-4 py-1 bg-green-50 text-green-600 rounded-full">GRID ONLINE</span>
                      <RefreshCw className="w-4 h-4 animate-spin-slow text-red-600" />
                   </div>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-white border-b border-gray-100">
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400">ID / BARCODE</th>
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400">MODULO / PRODUTO</th>
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400">ENTIDADE CLIENTE</th>
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400">NODE HUB ATRIBUÍDO</th>
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400">ESTADO ATUAL</th>
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400 text-right">VALOR ASSET (RC)</th>
                            <th className="px-10 py-8 text-[9px] font-black uppercase text-gray-400 text-center">DETALHES</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {filteredItems.map((o: ProductionJob) => (
                           <React.Fragment key={o.id}>
                             <tr className={`hover:bg-gray-50/80 transition-all cursor-pointer group ${expandedOrder === o.id ? 'bg-red-50/40 border-l-8 border-red-600' : ''}`} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                                <td className="px-10 py-10">
                                   <div className="flex items-center space-x-4">
                                      <div className={`w-1.5 h-12 rounded-full ${o.status === 'Concluído' ? 'bg-green-500' : (o.status === 'Em Produção' ? 'bg-red-600 animate-pulse' : 'bg-gray-300')}`} />
                                      <div className="flex flex-col">
                                         <span className="font-brand font-black italic text-black uppercase tracking-tighter text-2xl">{o.id}</span>
                                         <span className="text-[7px] font-mono text-gray-400 uppercase">Hash: {btoa(o.id).slice(0, 12)}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-10">
                                   <div className="flex flex-col">
                                      <span className="text-[12px] font-black text-black uppercase tracking-tight italic">{o.product}</span>
                                      <span className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1">Axis: {o.dimensions || 'Atomic Unit'}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-10">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{o.client}</span>
                                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">UID: {o.clientId}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-10">
                                   <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-2xl w-fit group-hover:bg-white transition-colors">
                                      <Server className="w-3.5 h-3.5 text-red-600" />
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-black text-black uppercase">{hubs.find(h => h.id === o.nodeId)?.name || 'Central R2'}</span>
                                         <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">{hubs.find(h => h.id === o.nodeId)?.location || 'System Core'}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-10">
                                   <div className="flex items-center space-x-4">
                                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border shadow-sm ${o.status === 'Concluído' ? 'bg-green-50 text-green-600 border-green-100' : (o.status === 'Rejeitado' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100')}`}>
                                         {o.status.replace('_', ' ')}
                                      </span>
                                      {o.priority && <Zap className="w-4 h-4 text-red-600 animate-pulse" />}
                                   </div>
                                </td>
                                <td className="px-10 py-10 text-right">
                                   <div className="flex items-center justify-end space-x-2">
                                      <span className="font-brand font-black italic text-black text-2xl redcoin-text">{o.value}</span>
                                      <span className="text-[8px] font-black text-yellow-400">RC</span>
                                   </div>
                                </td>
                                <td className="px-10 py-10 text-center">
                                   <button className="p-4 bg-gray-100 text-gray-400 rounded-2xl group-hover:bg-black group-hover:text-white transition-all shadow-md">
                                      {expandedOrder === o.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                   </button>
                                </td>
                             </tr>
                             
                             {expandedOrder === o.id && (
                               <tr className="bg-gray-100/30 animate-in slide-in-from-top-4 border-l-8 border-red-600">
                                  <td colSpan={7} className="p-16">
                                     <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                                        {/* Detalhes Técnicos Expandidos */}
                                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8">
                                           <h5 className="text-[11px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center border-b border-gray-50 pb-4"><FileDigit className="w-5 h-5 mr-3" /> Technical Specification</h5>
                                           <div className="grid grid-cols-2 gap-6">
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Substrato</span>
                                                 <span className="text-[11px] font-bold text-black uppercase italic">{o.material}</span>
                                              </div>
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Acabamento</span>
                                                 <span className="text-[11px] font-bold text-black uppercase italic">{o.finish}</span>
                                              </div>
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Unidades</span>
                                                 <span className="text-2xl font-brand font-black italic text-black">{o.quantity} u.</span>
                                              </div>
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Injeção</span>
                                                 <span className="text-[11px] font-bold text-black">{new Date(o.timestamp).toLocaleString()}</span>
                                              </div>
                                           </div>
                                           <div className="p-5 bg-black text-white rounded-3xl flex justify-between items-center group/barcode-c">
                                              <div className="flex flex-col">
                                                 <span className="text-[8px] font-black uppercase text-gray-500 mb-1">R2_SECURE_SCAN</span>
                                                 <span className="text-[10px] font-mono tracking-tighter">{o.id}</span>
                                              </div>
                                              <Barcode className="w-12 h-6 text-red-600 group-hover/barcode-c:scale-x-125 transition-transform" />
                                           </div>
                                        </div>

                                        {/* Ações, Assets e Links Master */}
                                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8">
                                           <h5 className="text-[11px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center border-b border-gray-50 pb-4"><ExternalLink className="w-5 h-5 mr-3" /> Central Asset Hub</h5>
                                           <div className="space-y-4">
                                              <button onClick={() => generateOrderPDF(o, hubs.find(h => h.id === o.nodeId))} className="w-full flex items-center justify-between p-6 bg-black text-white rounded-3xl hover:bg-red-600 transition-all shadow-xl group/btn active:scale-95">
                                                 <div className="flex items-center space-x-4">
                                                    <FileText className="w-5 h-5 text-red-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Guia de Produção PDF</span>
                                                 </div>
                                                 <FileDown className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" />
                                              </button>
                                              
                                              {o.fileName && (
                                                <button onClick={() => downloadOriginalAsset(o)} className="w-full flex items-center justify-between p-6 bg-red-600 text-white rounded-3xl hover:bg-black transition-all shadow-xl group/btn active:scale-95">
                                                   <div className="flex items-center space-x-4">
                                                      <ImageIcon className="w-5 h-5 text-white" />
                                                      <span className="text-[10px] font-black uppercase tracking-widest">Baixar Original: {o.fileName}</span>
                                                   </div>
                                                   <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                              )}
                                              
                                              <div className="p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                                                 <ShieldCheck className="w-6 h-6 text-green-500" />
                                                 <span className="text-[8px] font-black uppercase tracking-widest">Integridade Verificada ISO-R2</span>
                                              </div>
                                           </div>
                                        </div>

                                        {/* Auditoria Operacional Master */}
                                        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col">
                                           <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-6">
                                              <h5 className="text-[11px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center"><History className="w-5 h-5 mr-3" /> Audit Log & Industrial Pulse</h5>
                                              <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[8px] font-black animate-pulse uppercase">Sync Ativo</div>
                                           </div>
                                           <div className="flex-grow max-h-[350px] overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                                              {o.history?.map((log: any, idx: number) => (
                                                <div key={idx} className="flex items-start space-x-6 relative group/log-item">
                                                   <div className="absolute -left-[1px] top-1.5 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_rgba(204,0,0,0.5)] group-hover/log-item:scale-150 transition-transform" />
                                                   <div className="w-full bg-gray-50/50 p-5 rounded-3xl border border-gray-100 group-hover/log-item:border-red-200 transition-all">
                                                      <div className="flex justify-between items-center mb-2">
                                                         <span className="text-[10px] font-black uppercase text-black italic">{log.status}</span>
                                                         <span className="text-[8px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                      </div>
                                                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">"{log.note}"</p>
                                                      <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-gray-100/50">
                                                         <UserCheck className="w-3 h-3 text-gray-400" />
                                                         <span className="text-[8px] font-black uppercase text-gray-400">Assinado por: {log.author}</span>
                                                      </div>
                                                   </div>
                                                </div>
                                              ))}
                                           </div>
                                        </div>
                                     </div>
                                  </td>
                               </tr>
                             )}
                           </React.Fragment>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
        </div>
      )}

      {/* VIEW: APPROVALS - MANTÉM FUNCIONALIDADE EXISTENTE */}
      {activeView === 'approvals' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-5">
           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl mb-12 flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="flex items-center space-x-6">
                 <div className="p-5 bg-red-600 rounded-3xl text-white shadow-xl status-pulse"><ShieldAlert className="w-10 h-10" /></div>
                 <div>
                    <h3 className="text-4xl font-brand font-black italic uppercase leading-none">Pilha de Aprovação <br/><span className="text-red-600">Alpha Master.</span></h3>
                    <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mt-2">Valide a integridade dos assets antes da injeção industrial.</p>
                 </div>
              </div>
              <div className="flex items-center space-x-6 bg-gray-50 px-10 py-6 rounded-[3rem] border border-gray-100">
                 <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.5em]">Pendentes:</span>
                 <span className="text-5xl font-brand font-black italic text-red-600">{pendingAdminApprovals.length}</span>
              </div>
           </div>

           {pendingAdminApprovals.length > 0 ? (
             <div className="grid grid-cols-1 gap-10">
               {pendingAdminApprovals.map(o => (
                 <div key={o.id} className="bg-white p-12 rounded-[5rem] border-2 border-red-100 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-12 group hover:border-red-600 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-red-600/5 rotate-12"><ShieldCheck className="w-64 h-64" /></div>
                    <div className="flex-grow flex items-center space-x-12 relative z-10">
                       <div className="bg-black text-red-600 p-10 rounded-[3rem] shadow-xl group-hover:rotate-12 transition-transform">
                          <Package className="w-12 h-12" />
                       </div>
                       <div>
                          <div className="flex items-center space-x-6 mb-4">
                             <span className="text-6xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                             <span className="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-white/20 animate-pulse">Injeção Pendente</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[12px] font-black uppercase text-gray-400 italic">
                             <div><span className="text-gray-300 block mb-2 tracking-[0.3em]">Entidade Cliente</span><span className="text-black not-italic">{o.client}</span></div>
                             <div><span className="text-gray-300 block mb-2 tracking-[0.3em]">Módulo Asset</span><span className="text-black not-italic">{o.product}</span></div>
                             <div><span className="text-gray-300 block mb-2 tracking-[0.3em]">Valor Liquidação</span><span className="redcoin-text not-italic">{o.value} RC</span></div>
                             <div><span className="text-gray-300 block mb-2 tracking-[0.3em]">HUB Destino</span><span className="text-black not-italic">{hubs.find(h => h.id === o.nodeId)?.name}</span></div>
                          </div>
                       </div>
                    </div>
                    <div className="flex space-x-6 relative z-10">
                       <button onClick={() => { onSound?.('error'); onUpdateStatus(o.id, 'Rejeitado'); }} className="p-10 bg-gray-50 text-gray-400 rounded-full hover:bg-black hover:text-white transition-all shadow-xl active:scale-90"><X className="w-10 h-10"/></button>
                       <button onClick={() => { onSound?.('success'); onUpdateStatus(o.id, 'Aprovado'); }} className="bg-red-600 text-white px-20 py-10 rounded-full font-black uppercase text-[14px] tracking-[0.5em] hover:bg-black transition-all shadow-2xl flex items-center space-x-6 group/btn-approve active:scale-95">
                          <span>Validar & Injetar</span> <CheckCircle className="w-8 h-8 group-hover/btn-approve:scale-125 transition-transform" />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-40 text-center space-y-12 opacity-10 animate-pulse">
                <ShieldCheck className="w-40 h-40 mx-auto" />
                <p className="text-7xl font-brand font-black italic uppercase tracking-tighter">Cluster em Repouso. Zero Pendentes.</p>
             </div>
           )}
        </div>
      )}

      {/* VIEWS: HUBS, USERS, PRODUCTS, FINANCIALS - MANTÉM FUNCIONALIDADES EXISTENTES */}
      {activeView === 'financials' && (
        <div className="space-y-12 animate-in fade-in">
           <div className="bg-white p-16 rounded-[5rem] border border-gray-100 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-12 mb-16">
              <div className="flex items-center space-x-8">
                 <div className="p-8 bg-red-600 rounded-[2.5rem] text-white shadow-xl status-pulse"><Settings className="w-12 h-12 animate-spin-slow" /></div>
                 <div>
                    <h4 className="text-[12px] font-black uppercase text-gray-400 tracking-widest block mb-2">Engenharia de Receita Master</h4>
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

           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 industrial-grid opacity-5" />
                 <CreditCard className="w-12 h-12 text-red-600 mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Gross Revenue (RC)</span>
                 <span className="text-6xl font-brand font-black italic block redcoin-text">{financials.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-xl group hover:border-black transition-all">
                 <Coins className="w-12 h-12 text-red-600 mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Platform Share (RC)</span>
                 <span className="text-6xl font-brand font-black italic block redcoin-text">{financials.totalPlatform.toLocaleString()}</span>
              </div>
              <div className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-xl group hover:border-black transition-all">
                 <PieChart className="w-12 h-12 text-orange-600 mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Hub Payouts (RC)</span>
                 <span className="text-6xl font-brand font-black italic block redcoin-text">{financials.totalHub.toLocaleString()}</span>
              </div>
              <div className="bg-red-600 text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group redcoin-badge">
                 <TrendingUp className="w-12 h-12 text-white mb-10 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-4">Net Industrial Liquid (RC)</span>
                 <span className="text-6xl font-brand font-black italic block redcoin-text">{financials.totalNet.toLocaleString()}</span>
              </div>
           </div>

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
                          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                             <span className="text-[10px] font-black uppercase text-gray-500">Hub Share (%)</span>
                             <input type="number" value={h.primaryCommission} onChange={(e) => onUpdateHub(h.id, { primaryCommission: parseFloat(e.target.value) })} className="bg-transparent text-xl font-brand font-black italic text-black w-16 text-right outline-none" />
                          </div>
                          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                             <span className="text-[10px] font-black uppercase text-gray-500">Plat. Fee (%)</span>
                             <input type="number" value={h.platformCommission} onChange={(e) => onUpdateHub(h.id, { platformCommission: parseFloat(e.target.value) })} className="bg-transparent text-xl font-brand font-black italic text-black w-16 text-right outline-none" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* VIEW: USERS MANAGEMENT */}
      {activeView === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5">
           {filteredItems.map((u: User) => (
             <div key={u.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl group hover:border-black transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-black/5"><Users className="w-32 h-32" /></div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                   <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-brand font-black italic shadow-xl ${u.role === 'B2B_Admin' ? 'bg-red-600' : 'bg-black'}`}>{u.name[0]}</div>
                   <div className="flex space-x-2">
                      <button onClick={() => onImpersonate(u)} title="Shadow Mode" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md active:scale-90"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => setEditingItem({type: 'user', data: u})} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md active:scale-90"><Edit className="w-5 h-5" /></button>
                      <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </div>
                <div className="relative z-10">
                   <h4 className="text-3xl font-brand font-black italic uppercase text-black mb-2 leading-none group-hover:text-red-600 transition-colors">{u.name}</h4>
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">{u.email}</p>
                   <div className="flex items-center space-x-4 pt-6 border-t border-gray-50">
                      <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[9px] font-black uppercase text-gray-500">{u.role.replace('_', ' ')}</span>
                      <span className="px-4 py-1.5 bg-red-50 rounded-full text-[9px] font-black uppercase text-red-600 border border-red-100">{u.tier}</span>
                      <div className="ml-auto flex items-center space-x-1">
                        <span className="text-[11px] font-brand font-black italic redcoin-text">{u.balance?.toLocaleString()}</span>
                        <span className="text-[7px] font-black text-yellow-400">RC</span>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* VIEW: PRODUCTS MANAGEMENT */}
      {activeView === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-5">
           {filteredItems.map((p: ExtendedProduct) => (
             <div key={p.id} className="bg-white rounded-[4rem] border border-gray-100 shadow-xl overflow-hidden group hover:border-red-600 transition-all flex flex-col h-full">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                   <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                   <div className="absolute top-6 right-6 flex space-x-2 z-10">
                      <button onClick={() => setEditingItem({type: 'product', data: p})} className="p-4 bg-white/90 backdrop-blur-md rounded-2xl text-black shadow-xl hover:bg-red-600 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                   </div>
                   <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20">{p.id}</div>
                </div>
                <div className="p-10 flex flex-col flex-grow">
                   <span className="text-[9px] font-black uppercase text-red-600 tracking-[0.4em] mb-3 block opacity-50">{p.category}</span>
                   <h5 className="text-3xl font-brand font-black italic uppercase text-black mb-6 leading-none group-hover:text-red-600 transition-colors">{p.name}</h5>
                   <div className="mt-auto flex justify-between items-end pt-6 border-t border-gray-50">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Base Cost (RC)</span>
                         <span className="text-4xl font-brand font-black italic redcoin-text">{p.basePrice}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl"><Box className="w-6 h-6 text-red-600" /></div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* VIEW: HUBS MANAGEMENT */}
      {activeView === 'hubs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5">
           {filteredItems.map((h: PartnerNode) => (
             <div key={h.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl group hover:border-black transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-red-600/5 rotate-45"><Server className="w-48 h-48" /></div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                   <div className="p-6 bg-red-600 rounded-[2rem] text-white shadow-xl status-pulse"><Server className="w-8 h-8" /></div>
                   <div className="flex space-x-2">
                      <button onClick={() => setEditingItem({type: 'hub', data: h})} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md"><Edit className="w-5 h-5" /></button>
                      <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-md"><Power className="w-5 h-5" /></button>
                   </div>
                </div>
                <div className="relative z-10">
                   <h4 className="text-4xl font-brand font-black italic uppercase text-black mb-2 leading-none group-hover:text-red-600 transition-colors">{h.name}</h4>
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center"><MapPin className="w-3 h-3 mr-2" /> {h.location}</p>
                   
                   <div className="space-y-6 pt-6 border-t border-gray-50">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic">Grid Load Sync</span>
                         <span className="text-2xl font-brand font-black italic text-red-600">{h.capacity}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                         <div className="h-full bg-black group-hover:bg-red-600 transition-all duration-[2000ms]" style={{ width: `${h.capacity}%` }} />
                      </div>
                      <div className="flex items-center justify-between pt-4">
                         <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-green-600">
                            <Activity className="w-3 h-3" />
                            <span>Latência: {h.latency}</span>
                         </div>
                         <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${h.status === 'Online' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600'}`}>{h.status}</span>
                      </div>
                   </div>
                </div>
             </div>
           ))}
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
                          <input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Email de Protocolo</label>
                          <input type="email" value={editingItem.data.email} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, email: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nível de Acesso (Role)</label>
                          <select value={editingItem.data.role} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, role: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner">
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
                          <input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Preço Base (€)</label>
                          <input type="number" value={editingItem.data.basePrice} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, basePrice: parseFloat(e.target.value)}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Descrição Técnica</label>
                          <textarea value={editingItem.data.description} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner h-32" />
                       </div>
                    </>
                 )}
                 <button onClick={() => { 
                    if(editingItem.type === 'user') onUpdateUser(editingItem.data.id, editingItem.data);
                    if(editingItem.type === 'product') onUpdateProduct(editingItem.data.id, editingItem.data);
                    setEditingItem(null); 
                    onSound?.('success'); 
                 }} className="w-full bg-black text-white p-12 rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-6 border-b-[10px] border-gray-900 active:translate-y-1 active:border-b-0">
                    <Save className="w-6 h-6" /> <span>Sincronizar Alterações Master</span>
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
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12 leading-none">Novo <br/><span className="text-red-600">{showCreateModal.toUpperCase()} R3.</span></h3>
              
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
                       <input name="name" type="text" placeholder="NOME DA ENTIDADE" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner" required />
                       <input name="email" type="email" placeholder="EMAIL DE PROTOCOLO" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner" required />
                       <select name="role" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner appearance-none">
                          <option value="Utilizador_Standard">Standard Client</option>
                          <option value="B2B_Admin">HUB Partner</option>
                       </select>
                       <button type="submit" className="w-full bg-black text-white p-12 rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all shadow-2xl border-b-[10px] border-gray-900 active:translate-y-1 active:border-b-0">Provisionar Acesso Master</button>
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
                          specs: { weight: '---', durability: '---', precisionLevel: 'R3' }
                       };
                       onUpdateProduct(newProd.id, newProd);
                       setShowCreateModal(null);
                    }} className="space-y-6">
                       <input name="name" type="text" placeholder="NOME DO MÓDULO" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner" required />
                       <input name="price" type="number" placeholder="PREÇO BASE (€)" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner" required />
                       <select name="category" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner appearance-none">
                          {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <textarea name="desc" placeholder="ESPECIFICAÇÃO TÉCNICA R3" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner h-32" />
                       <button type="submit" className="w-full bg-black text-white p-12 rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all shadow-2xl border-b-[10px] border-gray-900 active:translate-y-1 active:border-b-0">Injetar Módulo no Grid R3</button>
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
