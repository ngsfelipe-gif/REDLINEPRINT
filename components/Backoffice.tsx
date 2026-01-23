
import React, { useState, useMemo, useEffect } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category, SupportTicket, SupportMessage } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle, CheckCircle, BarChart3, CreditCard, PieChart, Coins, TrendingUp, Settings, RefreshCw, FileDigit, QrCode, FileDown, Barcode, Percent, Filter, MapPin, ExternalLink, Box, Power, MessageSquare, Send, Radio, LayoutGrid, FileSpreadsheet, PlayCircle, Truck } from 'lucide-react';
import { generateOrderPDF, downloadOriginalAsset } from '../services/pdfService';
import { MATERIALS, FINISHES } from '../constants';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  users: User[];
  user: User | null;
  products: ExtendedProduct[];
  tickets: SupportTicket[];
  hubRequests: HubRegistrationRequest[];
  authRequests: AuthorizationRequest[];
  language: Language;
  onUpdateStatus: (orderId: string, status: ProductionJob['status'], nodeId?: string) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onUpdateHub: (hubId: string, updates: Partial<PartnerNode>) => void;
  onUpdateProduct: (productId: string, updates: Partial<ExtendedProduct>) => void;
  onUpdateOrder: (orderId: string, updates: Partial<ProductionJob>) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  onAddTicketMessage: (ticketId: string, message: SupportMessage) => void;
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
  orders = [], hubs = [], users = [], user, products = [], tickets = [], hubRequests = [], authRequests = [], language, 
  onUpdateStatus, onUpdateUser, onUpdateHub, onUpdateProduct, onUpdateOrder, 
  onUpdateTicket, onAddTicketMessage, onApproveHub, onApproveAuth, onImpersonate, 
  onCreateUser, onCreateClient, onSound, globalPlatformFee, setGlobalPlatformFee
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'products' | 'financials' | 'tickets'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{type: 'user' | 'hub' | 'product' | 'order', data: any} | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<'user' | 'product' | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

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
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term) || o.product.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    if (activeView === 'tickets') return tickets.filter(t => t.id.toLowerCase().includes(term) || t.subject.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, tickets, activeView, searchTerm]);

  const handleSendReply = () => {
    if (!activeTicket || !replyText.trim()) return;
    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      text: replyText,
      timestamp: Date.now()
    };
    onAddTicketMessage(activeTicket.id, newMessage);
    setReplyText('');
    onSound?.('success');
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    if (editingItem.type === 'user') {
      onUpdateUser(editingItem.data.id, editingItem.data);
    } else if (editingItem.type === 'hub') {
      onUpdateHub(editingItem.data.id, editingItem.data);
    }
    
    setEditingItem(null);
    onSound?.('success');
  };

  const handleResetPassword = (targetUser: User) => {
    const newPassword = prompt(`DEFINIR NOVA PASSWORD MASTER PARA: ${targetUser.name}\n(Esta alteração é imediata no Cluster R2)`);
    if (newPassword && newPassword.trim()) {
      onUpdateUser(targetUser.id, { password: newPassword.trim() });
      onSound?.('success');
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in">
      {/* Header Central de Comando */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-24">
        <div>
          <div className="inline-flex items-center space-x-3 bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl mb-8 border border-white/20 active-glow transition-all">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Super Admin Control v4.7</span>
          </div>
          <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Torre de <br/><span className="text-red-600">Controlo.</span></h2>
        </div>
        
        <div className="flex flex-wrap bg-white p-3 rounded-[3.5rem] shadow-2xl border border-gray-100 gap-4">
           {['approvals', 'orders', 'hubs', 'users', 'products', 'financials', 'tickets'].map(v => (
             <button 
              key={v} 
              onClick={() => { onSound?.('click'); setActiveView(v as any); setSearchTerm(''); }} 
              className={`px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeView === v ? 'bg-black text-white shadow-2xl scale-105 active-glow' : 'text-gray-400 hover:bg-gray-50'}`}
             >
                {v} 
                {(v === 'approvals' && pendingAdminApprovals.length > 0) && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] animate-bounce shadow-lg border-2 border-white">{pendingAdminApprovals.length}</span>
                )}
                {(v === 'tickets' && tickets.filter(t => t.status === 'Pendente').length > 0) && (
                  <span className="absolute -top-2 -right-2 bg-orange-50 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] animate-pulse shadow-lg border-2 border-white">{tickets.filter(t => t.status === 'Pendente').length}</span>
                )}
             </button>
           ))}
        </div>
      </div>

      {/* VIEW: PRODUCTS MANAGEMENT - ENHANCED SPREADSHEET */}
      {activeView === 'products' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-5">
          <div className="bg-white p-8 rounded-[4rem] border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-red-600 rounded-3xl text-white shadow-lg"><FileSpreadsheet className="w-8 h-8" /></div>
              <div>
                <h3 className="text-4xl font-brand font-black italic uppercase leading-none text-black">Product <span className="text-red-600">Spreadsheet.</span></h3>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2 flex items-center"><Activity className="w-3 h-3 mr-2" /> High-Density Inventory Matrix // Cluster Verification Active</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-gray-50 p-2 rounded-full border border-gray-100 flex items-center flex-grow md:w-96 focus-within:ring-2 focus-within:ring-red-600/10 transition-all">
                <Search className="w-5 h-5 text-gray-300 ml-4" />
                <input 
                  type="text" 
                  placeholder="FILTER MODULES..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="bg-transparent flex-grow p-3 font-black text-[11px] uppercase outline-none" 
                />
              </div>
              <button onClick={() => setShowCreateModal('product')} className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                <Plus className="w-4 h-4" /> <span>Add Module</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden relative">
            <div className="overflow-x-auto custom-scrollbar max-h-[850px]">
              <table className="w-full text-left border-collapse table-fixed min-w-[1600px]">
                <thead className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-gray-100">
                  <tr className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    <th className="px-8 py-10 w-44">Module ID</th>
                    <th className="px-8 py-10 w-40">Asset Image</th>
                    <th className="px-8 py-10 w-72">Name Axis</th>
                    <th className="px-8 py-10 w-64">Category Cluster</th>
                    <th className="px-8 py-10 w-96">Tech Description</th>
                    <th className="px-8 py-10 w-44">Base (RC)</th>
                    <th className="px-8 py-10 w-32">Unit</th>
                    <th className="px-8 py-10 w-40">Badge</th>
                    <th className="px-8 py-10 w-52">Status Grid</th>
                    <th className="px-8 py-10 w-52">Owner Hub</th>
                    <th className="px-8 py-10 w-32 text-center">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((p: ExtendedProduct) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-8">
                        <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 w-fit font-mono text-[10px] font-bold text-gray-500">{p.id}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-lg group/img border-2 border-transparent hover:border-red-600 transition-all cursor-pointer">
                          <img src={p.image} className="w-full h-full object-cover group-hover/img:scale-125 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity" onClick={() => {
                            const newUrl = prompt('Enter new Asset Image URL:', p.image);
                            if(newUrl) onUpdateProduct(p.id, { image: newUrl });
                          }}>
                            <Edit className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <input 
                          type="text" 
                          value={p.name} 
                          onChange={(e) => onUpdateProduct(p.id, { name: e.target.value })}
                          className="w-full bg-transparent p-3 rounded-xl font-brand font-black italic uppercase text-xl outline-none focus:bg-white focus:ring-4 focus:ring-red-600/5 transition-all border border-transparent hover:border-gray-200" 
                        />
                      </td>
                      <td className="px-8 py-8">
                        <select 
                          value={p.category} 
                          onChange={(e) => onUpdateProduct(p.id, { category: e.target.value as Category })}
                          className="w-full bg-gray-50/50 p-4 rounded-2xl font-black uppercase text-[11px] outline-none appearance-none border border-gray-100 hover:border-red-600/20 cursor-pointer transition-all"
                        >
                          {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-8">
                        <textarea 
                          value={p.description} 
                          onChange={(e) => onUpdateProduct(p.id, { description: e.target.value })}
                          className="w-full bg-transparent p-4 rounded-2xl text-[11px] font-medium text-gray-500 italic outline-none resize-none h-20 border border-transparent hover:border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-600/5 transition-all" 
                        />
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all">
                          <input 
                            type="number" 
                            value={p.basePrice} 
                            onChange={(e) => onUpdateProduct(p.id, { basePrice: parseFloat(e.target.value) })}
                            className="bg-transparent w-full font-brand font-black italic text-2xl outline-none text-red-600 text-right" 
                          />
                          <span className="text-[10px] font-black text-yellow-500">RC</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <input 
                          type="text" 
                          value={p.unit} 
                          onChange={(e) => onUpdateProduct(p.id, { unit: e.target.value })}
                          className="w-full bg-transparent p-3 rounded-xl font-black text-[11px] uppercase outline-none text-gray-400 border border-transparent text-center" 
                        />
                      </td>
                      <td className="px-8 py-8">
                         <input 
                          type="text" 
                          value={p.badge || ''} 
                          placeholder="NONE"
                          onChange={(e) => onUpdateProduct(p.id, { badge: e.target.value })}
                          className="w-full bg-transparent p-3 rounded-xl font-black text-[10px] uppercase outline-none text-red-600 border border-transparent text-center italic" 
                        />
                      </td>
                      <td className="px-8 py-8">
                        <select 
                          value={p.status} 
                          onChange={(e) => onUpdateProduct(p.id, { status: e.target.value as any })}
                          className={`w-full p-4 rounded-full font-black uppercase text-[10px] outline-none appearance-none border shadow-sm cursor-pointer transition-all ${p.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'}`}
                        >
                          <option value="Ativo">Online / Stable</option>
                          <option value="Aguardando Aprovação">Pending / Alpha</option>
                        </select>
                      </td>
                      <td className="px-8 py-8">
                        <select 
                          value={p.ownerHubId} 
                          onChange={(e) => onUpdateProduct(p.id, { ownerHubId: e.target.value })}
                          className="w-full bg-gray-100 p-4 rounded-2xl font-black text-[10px] uppercase outline-none appearance-none border border-transparent hover:border-black cursor-pointer transition-all"
                        >
                          <option value="SYSTEM">Central Master</option>
                          {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <button onClick={() => { if(confirm('INITIATE DELETE PROTOCOL FOR MODULE '+p.id+'?')) onUpdateProduct(p.id, { ...p, status: 'Aguardando Aprovação' }); }} className="p-5 bg-gray-100 text-gray-400 rounded-3xl hover:bg-black hover:text-white transition-all shadow-md active:scale-90">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] industrial-grid" />
          </div>
        </div>
      )}

      {/* VIEW: TICKETS - MASTER SUPPORT CONTROL */}
      {activeView === 'tickets' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in">
           {/* Tickets List */}
           <div className="xl:col-span-4 space-y-6 max-h-[1000px] overflow-y-auto pr-4 custom-scrollbar">
              <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-gray-100 flex items-center space-x-4 mb-4">
                 <Search className="w-5 h-5 text-gray-300" />
                 <input type="text" placeholder="FILTER TICKETS..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black text-[11px] uppercase" />
              </div>
              {filteredItems.length > 0 ? (filteredItems as SupportTicket[]).map((t: SupportTicket) => (
                <div key={t.id} onClick={() => { onSound?.('click'); setActiveTicket(t); }} className={`p-10 rounded-[3.5rem] cursor-pointer transition-all border-2 relative overflow-hidden group ${activeTicket?.id === t.id ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white border-transparent hover:border-red-600 shadow-xl'}`}>
                   <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">{t.id}</span>
                         <h5 className={`text-2xl font-brand font-black italic uppercase leading-tight ${activeTicket?.id === t.id ? 'text-white' : 'text-black'}`}>{t.subject}</h5>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${t.priority === 'Alta' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.priority}</span>
                   </div>
                   <div className="flex items-center space-x-4 pt-4 border-t border-gray-50/10 relative z-10">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${t.status === 'Pendente' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{t.status}</span>
                      <span className="text-[9px] font-black opacity-40 uppercase">{t.category}</span>
                   </div>
                   <div className="absolute top-0 right-0 p-8 text-red-600/5 group-hover:text-red-600/10 transition-colors"><MessageSquare className="w-32 h-32" /></div>
                </div>
              )) : (
                <div className="p-20 text-center opacity-10"><Zap className="w-20 h-20 mx-auto" /><p className="text-2xl font-brand font-black italic uppercase">Grid Silent.</p></div>
              )}
           </div>

           {/* Ticket Detail / Conversation */}
           <div className="xl:col-span-8">
              {activeTicket ? (
                <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 h-full flex flex-col overflow-hidden animate-in slide-in-from-right-10">
                   <div className="p-12 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center space-x-6">
                         <div className="p-5 bg-black rounded-3xl text-red-600 shadow-xl"><MessageSquare className="w-8 h-8" /></div>
                         <div>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{activeTicket.id} // GLOBAL SUPPORT CHANNEL</span>
                            <h4 className="text-4xl font-brand font-black italic uppercase text-black leading-none">{activeTicket.subject}</h4>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <select 
                            value={activeTicket.status} 
                            onChange={(e) => onUpdateTicket(activeTicket.id, { status: e.target.value })}
                            className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase outline-none"
                         >
                            <option value="Pendente">Open</option>
                            <option value="Em Análise">In Analysis</option>
                            <option value="Concluído">Closed</option>
                         </select>
                         <button onClick={() => setActiveTicket(null)} className="p-4 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all"><X className="w-6 h-6"/></button>
                      </div>
                   </div>

                   <div className="flex-grow p-12 overflow-y-auto space-y-8 industrial-grid max-h-[600px] custom-scrollbar">
                      {activeTicket.messages.map((m, i) => (
                        <div key={m.id} className={`flex ${m.authorId === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
                           <div className={`max-w-[70%] p-8 rounded-[3rem] shadow-xl relative group ${m.authorId === user.id ? 'bg-red-600 text-white rounded-tr-none' : 'bg-black text-white rounded-tl-none'}`}>
                              <div className="flex justify-between items-center mb-4 opacity-50">
                                 <span className="text-[8px] font-black uppercase tracking-widest">{m.authorName}</span>
                                 <span className="text-[8px] font-black">{new Date(m.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-[14px] font-bold leading-relaxed italic">"{m.text}"</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="p-10 border-t border-gray-100 bg-gray-50/80 backdrop-blur-xl">
                      <div className="bg-white p-2 rounded-[3.5rem] shadow-inner border-2 border-gray-100 flex focus-within:border-red-600 transition-all">
                         <textarea 
                            placeholder="TRANSMIT MASTER RESPONSE..." 
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="bg-transparent flex-grow p-8 font-black uppercase text-[12px] outline-none h-24 resize-none"
                         />
                         <div className="flex flex-col justify-end p-4">
                            <button onClick={handleSendReply} className="p-6 bg-black text-white rounded-[2.5rem] hover:bg-red-600 transition-all shadow-xl active-glow group">
                               <Send className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between mt-6 px-10 opacity-30">
                         <div className="flex items-center space-x-3">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Quantum Encryption Active</span>
                         </div>
                         <span className="text-[8px] font-black uppercase">v4.2 Internal Channel</span>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="h-full bg-white rounded-[5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-20 space-y-12">
                   <div className="relative">
                      <Radio className="w-40 h-40 text-gray-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><Activity className="w-16 h-16 text-red-600/20 animate-pulse" /></div>
                   </div>
                   <div>
                      <h4 className="text-5xl font-brand font-black italic uppercase text-gray-200 leading-none mb-6 tracking-tighter">Support Grid <br/>Standby.</h4>
                      <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] max-w-sm">Aguardando seleção de protocolo para transmissão bidirecional.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* VIEW: ORDERS */}
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
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">{stat.label}</span>
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
                                        {/* OPERATIONAL PARITY - ACTIONS BLOCK */}
                                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-10 flex flex-col justify-center">
                                            <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center border-b border-gray-50 pb-4"><Settings className="w-6 h-6 mr-4" /> Master Overrides</h5>
                                            <div className="space-y-4">
                                                {o.status === 'Aprovado' && (
                                                  <button onClick={() => onUpdateStatus(o.id, 'Em Produção')} className="w-full bg-black text-white px-8 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 transition-all flex items-center justify-center space-x-4 shadow-xl">
                                                     <PlayCircle className="w-5 h-5" /> <span>Force Production</span>
                                                  </button>
                                                )}
                                                {o.status === 'Em Produção' && (
                                                  <button onClick={() => onUpdateStatus(o.id, 'Expedição')} className="w-full bg-black text-white px-8 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 transition-all flex items-center justify-center space-x-4 shadow-xl">
                                                     <Truck className="w-5 h-5" /> <span>Force Dispatch</span>
                                                  </button>
                                                )}
                                                {o.status === 'Expedição' && (
                                                  <button onClick={() => onUpdateStatus(o.id, 'Concluído')} className="w-full bg-red-600 text-white px-8 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all flex items-center justify-center space-x-4 shadow-xl">
                                                     <CheckCircle2 className="w-5 h-5" /> <span>Force Completion</span>
                                                  </button>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button onClick={() => generateOrderPDF(o, hubs.find(h => h.id === o.nodeId))} className="bg-gray-100 text-black px-6 py-4 rounded-2xl font-black uppercase text-[9px] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                                                        <FileDown className="w-4 h-4" /> PDF
                                                    </button>
                                                    {o.fileName && (
                                                        <button onClick={() => downloadOriginalAsset(o)} className="bg-gray-100 text-black px-6 py-4 rounded-2xl font-black uppercase text-[9px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                                            <Download className="w-4 h-4" /> Asset
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* BLUEPRINT BLOCK */}
                                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8">
                                           <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center border-b border-gray-50 pb-4"><FileDigit className="w-6 h-6 mr-4" /> Technical Spec</h5>
                                           <div className="grid grid-cols-2 gap-6">
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Substrato</span>
                                                 <span className="text-[11px] font-bold text-black uppercase italic leading-tight">{o.material}</span>
                                              </div>
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Acabamento</span>
                                                 <span className="text-[11px] font-bold text-black uppercase italic leading-tight">{o.finish}</span>
                                              </div>
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Unidades</span>
                                                 <span className="text-xl font-brand font-black italic text-black leading-none">{o.quantity} u.</span>
                                              </div>
                                              <div className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-600 transition-all">
                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Dimensões Axis</span>
                                                 <span className="text-xl font-brand font-black italic text-black leading-none">{o.dimensions || 'N/A'}</span>
                                              </div>
                                           </div>
                                        </div>

                                        {/* LOG BLOCK */}
                                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8 col-span-1 xl:col-span-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                                           <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.4em] flex items-center border-b border-gray-50 pb-4 sticky top-0 bg-white z-10"><History className="w-6 h-6 mr-4" /> Operational Audit Log</h5>
                                           <div className="space-y-6 border-l-2 border-red-100 ml-4 pl-8">
                                              {o.history.map((h, i) => (
                                                <div key={i} className="relative group/log">
                                                   <div className="absolute -left-[41px] top-1 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-md group-hover/log:scale-125 transition-transform" />
                                                   <div className="flex flex-col">
                                                      <span className="text-[8px] font-black text-gray-400 uppercase block tracking-widest mb-1">{new Date(h.timestamp).toLocaleString()}</span>
                                                      <span className="text-[11px] font-black text-black uppercase block italic">{h.status}</span>
                                                      <p className="text-[10px] text-gray-500 font-medium mt-1 leading-relaxed">"{h.note}"</p>
                                                      <div className="mt-2 flex items-center space-x-2 opacity-30">
                                                         <UserCheck className="w-3 h-3" />
                                                         <span className="text-[7px] font-black uppercase tracking-widest">Signed: {h.author}</span>
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

      {/* VIEW: APPROVALS */}
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

      {/* VIEW: FINANCIALS */}
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
        <div className="space-y-12 animate-in slide-in-from-bottom-5">
           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center space-x-6">
                 <div className="p-5 bg-black rounded-3xl text-red-600 shadow-xl"><Users className="w-10 h-10" /></div>
                 <div>
                    <h3 className="text-4xl font-brand font-black italic uppercase leading-none">Entidades do <br/><span className="text-red-600">Ecossistema.</span></h3>
                    <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest mt-2 italic">Gerencie acessos, resets e provisionamento de novos parceiros Hub ou clientes Standard.</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowCreateModal('user')}
                className="bg-red-600 text-white px-12 py-6 rounded-full font-black uppercase text-[11px] tracking-[0.4em] hover:bg-black transition-all shadow-2xl flex items-center space-x-4 active-glow"
              >
                <UserPlus className="w-5 h-5" /> <span>Provisionar Entidade</span>
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredItems.map((u: User) => (
                <div key={u.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl group hover:border-black transition-all relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-black/5"><Users className="w-32 h-32" /></div>
                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-brand font-black italic shadow-xl ${u.role === 'B2B_Admin' ? 'bg-red-600' : 'bg-black'}`}>{u.name[0]}</div>
                      <div className="flex space-x-2">
                         <button onClick={() => onImpersonate(u)} title="Shadow Mode" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md active:scale-90"><Eye className="w-5 h-5" /></button>
                         <button onClick={() => handleResetPassword(u)} title="Reset Password" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md active:scale-90"><KeyRound className="w-5 h-5" /></button>
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
                      <button onClick={() => { const newImg = prompt(`MASTER OVERRIDE: NOVA URL DE IMAGEM PARA HUB ${h.name}`, h.image); if (newImg) onUpdateHub(h.id, { image: newImg }); }} title="Update Hub Visuals" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md"><ImageIcon className="w-5 h-5" /></button>
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

      {/* MODAL: EDIT ITEM (USER / HUB / ORDER) */}
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
                             <option value="Administrador">Super Admin</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2"><Lock className="w-3 h-3"/> Master Password Reset</label>
                          <input 
                            type="password" 
                            placeholder="NOVA PASSWORD (DEIXE EM BRANCO PARA MANTER)" 
                            onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, password: e.target.value || editingItem.data.password}})} 
                            className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" 
                          />
                       </div>
                    </>
                 )}
                 {editingItem.type === 'hub' && (
                    <>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nome da Unidade Hub</label>
                          <input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Localização (Cidade, País)</label>
                          <input type="text" value={editingItem.data.location} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, location: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Capacidade (%)</label>
                            <input type="number" value={editingItem.data.capacity} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, capacity: parseInt(e.target.value)}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Latência (ms)</label>
                            <input type="text" value={editingItem.data.latency} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, latency: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                         </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Estado de Sincronização</label>
                          <select value={editingItem.data.status} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, status: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner">
                             <option value="Online">Online</option>
                             <option value="Busy">Busy</option>
                             <option value="Maintenance">Maintenance</option>
                          </select>
                       </div>
                    </>
                 )}
                 <button onClick={handleSaveEdit} className="w-full bg-black text-white p-12 rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-6 border-b-[10px] border-gray-900 active:translate-y-1 active:border-b-0">
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
                       <p className="text-[10px] text-gray-400 uppercase tracking-widest italic text-center">Credenciais serão geradas automaticamente pelo Cluster.</p>
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
                       <input name="price" type="number" placeholder="PREÇO BASE (RC)" className="w-full bg-gray-50 p-8 rounded-3xl font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner" required />
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
