
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle, CheckCircle, BarChart3, CreditCard, PieChart, Coins, TrendingUp, Settings, RefreshCw, FileDigit, QrCode, FileDown, Barcode } from 'lucide-react';
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

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Master Protocol Denied.</div>;

  // Garante reatividade total nas ordens pendentes
  const pendingAdminApprovals = useMemo(() => orders.filter(o => o.status === 'Pendente_Admin'), [orders]);

  const financials = useMemo(() => {
    let totalRevenue = 0;
    let hubCommissions = 0;
    let platformShare = 0;
    let cashbackGiven = 0;

    orders.filter(o => o.status === 'Concluído').forEach(order => {
      const val = parseFloat(order.value);
      totalRevenue += val;
      const hub = hubs.find(h => h.id === order.nodeId);
      const client = users.find(u => u.id === order.clientId);
      
      if (hub) {
        hubCommissions += (val * (hub.primaryCommission || 0)) / 100;
        platformShare += (val * (hub.platformCommission || globalPlatformFee)) / 100;
      }
      if (client && client.role === 'Utilizador_Standard') cashbackGiven += val * 0.02;
    });

    const net = totalRevenue - hubCommissions - platformShare - cashbackGiven;
    return { totalRevenue, totalHub: hubCommissions, totalPlatform: platformShare, cashbackGiven, totalNet: net };
  }, [orders, hubs, users, globalPlatformFee]);

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
      <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-16">
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
              onClick={() => { onSound?.('click'); setActiveView(v as any); }} 
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

      {activeView === 'orders' && (
        <div className="space-y-12">
           <div className="bg-white p-2 rounded-[3rem] border border-gray-100 shadow-2xl flex items-center max-w-2xl">
              <Search className="w-8 h-8 text-gray-300 ml-6" />
              <input 
                type="text" 
                placeholder="LOCALIZAR JOB NO GRID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="bg-transparent flex-grow outline-none font-black uppercase text-[12px] p-8 placeholder:text-gray-200" 
              />
           </div>
           <div className="grid grid-cols-1 gap-8">
              {filteredItems.map((o: any) => (
                <div key={o.id} className={`bg-white rounded-[4.5rem] border transition-all duration-500 overflow-hidden shadow-xl ${expandedOrder === o.id ? 'border-black ring-[10px] ring-black/5 scale-[1.01]' : 'border-gray-100 hover:border-red-600/30'}`}>
                   <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                      <div className="flex-grow">
                         <div className="flex items-center space-x-8 mb-6">
                            <span className="text-4xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                            <div className="flex items-center space-x-3 bg-red-50 text-red-600 px-6 py-2 rounded-full border border-red-100">
                               <Activity className="w-4 h-4 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{o.status.replace('_', ' ')}</span>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-[10px] font-black uppercase text-gray-400 italic">
                            <div><span className="text-gray-300 block mb-1">Entidade</span><span className="text-black">{o.client}</span></div>
                            <div><span className="text-gray-300 block mb-1">Módulo</span><span className="text-black">{o.product}</span></div>
                            <div><span className="text-gray-300 block mb-1">Dimensões Axis</span><span className="text-black font-brand">{o.dimensions || 'N/A'}</span></div>
                            <div><span className="text-gray-300 block mb-1">Valor Industrial</span><span className="text-black font-brand">€{o.value}</span></div>
                         </div>
                      </div>
                      <div className="flex space-x-4">
                         <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} className={`p-8 rounded-full transition-all shadow-xl ${expandedOrder === o.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-black hover:text-white'}`}>
                            {expandedOrder === o.id ? <ChevronUp className="w-8 h-8"/> : <ChevronDown className="w-8 h-8"/>}
                         </button>
                         <div className="flex space-x-2">
                           <button onClick={() => { onSound?.('success'); generateOrderPDF(o, hubs.find(h => h.id === o.nodeId)); }} title="Download Production Spec" className="p-8 bg-black text-white rounded-full hover:bg-red-600 transition-all shadow-xl">
                              <FileDown className="w-8 h-8"/>
                           </button>
                           {o.fileName && (
                             <button onClick={() => { onSound?.('success'); downloadOriginalAsset(o); }} title="Download Original Asset" className="p-8 bg-red-50 text-red-600 rounded-full hover:bg-black hover:text-white transition-all shadow-xl">
                                <Download className="w-8 h-8"/>
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
                               <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                                  <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Nodo Atribuído</span>
                                  <span className="text-[13px] font-black text-black uppercase">{hubs.find(h => h.id === o.nodeId)?.name || 'Grid Central R2'}</span>
                               </div>
                               <div className="p-10 bg-black text-white rounded-[3rem] flex flex-col items-center shadow-2xl relative group/barcode">
                                  <div className="absolute top-4 right-4"><Barcode className="w-4 h-4 text-red-600 opacity-30" /></div>
                                  <div className="w-full bg-white p-6 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                                     <div className="flex gap-1 group-hover/barcode:scale-105 transition-transform duration-500">
                                        {o.id.split('').map((c, i) => (
                                          <div key={i} className="bg-black" style={{ width: (i % 3 === 0 ? '5px' : '2px'), height: '40px' }} />
                                        ))}
                                     </div>
                                  </div>
                                  <span className="text-[9px] font-mono text-white/30">SYNC_ID: {btoa(o.id).slice(0, 24)}</span>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center"><FileDigit className="w-4 h-4 mr-3" /> Assets & Engenharia</h5>
                               <div className="p-10 bg-white rounded-[3rem] border border-gray-100 space-y-8 shadow-xl">
                                  <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                                     <div className="flex items-center space-x-6">
                                        <div className="p-4 bg-red-50 rounded-2xl text-red-600"><FileText className="w-8 h-8" /></div>
                                        <div>
                                           <span className="text-[11px] font-black text-black uppercase block leading-none mb-1">{o.fileName || 'RL_ASSET_MASTER.PDF'}</span>
                                           <span className="text-[8px] text-gray-400 uppercase tracking-widest">Protocolo R2 Ready</span>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 bg-gray-50 rounded-2xl text-[9px] font-black uppercase tracking-widest">Mat: {o.material}</div>
                                     <div className="p-4 bg-gray-50 rounded-2xl text-[9px] font-black uppercase tracking-widest">Fin: {o.finish}</div>
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center"><History className="w-4 h-4 mr-3" /> Protocolo de Auditoria</h5>
                               <div className="space-y-6 border-l-2 border-red-100 pl-10 ml-2">
                                  {o.history.map((h: any, i: number) => (
                                    <div key={i} className="relative">
                                       <div className="absolute -left-[45px] top-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
                                       <span className="text-[8px] font-black text-gray-300 uppercase block">{new Date(h.timestamp).toLocaleString()}</span>
                                       <span className="text-[11px] font-black text-black uppercase block mt-1">{h.status}</span>
                                       <p className="text-[9px] text-gray-400 italic mt-2 leading-relaxed">"{h.note}"</p>
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
        </div>
      )}

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
        </div>
      )}
    </div>
  );
};

export default Backoffice;
