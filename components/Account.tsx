
import React, { useState, useMemo } from 'react';
import { User, ProductionJob, ExtendedProduct, PartnerNode, Language, SupportTicket, AuthorizationRequest, SupportMessage } from '../types';
import { 
  Activity, Zap, TrendingUp, Package, Clock, ShieldAlert, Download, Edit2, CheckCircle2, X, FileText, 
  Settings, BarChart3, ListChecks, MessageSquare, Trash2, ShieldCheck, Key, FileCheck, Maximize2, 
  Layers, Image as ImageIcon, Box, RefreshCw, ChevronDown, ChevronUp, History, Info, Monitor, 
  Radio, Coins, CreditCard, PieChart, Wallet, Mail, Lock, Server, FileDigit, QrCode, FileDown, 
  Barcode, Search, Truck, PlayCircle, MapPin, UserCheck, User as UserIcon, Send, MessageCircle, KeyRound
} from 'lucide-react';
import { generateOrderPDF, downloadOriginalAsset } from '../services/pdfService';

interface AccountProps {
  user: User;
  orders: ProductionJob[];
  tickets: SupportTicket[];
  products: ExtendedProduct[];
  hubs: PartnerNode[];
  language: Language;
  onUpdateStatus: (orderId: string, status: ProductionJob['status'], nodeId?: string, note?: string) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  onAddTicketMessage: (ticketId: string, message: SupportMessage) => void;
  onRequestAuth: (req: Omit<AuthorizationRequest, 'id' | 'timestamp' | 'status'>) => void;
  onLogout: () => void;
  onSound?: (type: 'click' | 'success' | 'sync' | 'error' | 'loading' | 'redcoin') => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const Account: React.FC<AccountProps> = ({ 
  user, orders = [], tickets = [], products = [], hubs = [], language, 
  onUpdateStatus, onUpdateTicket, onAddTicketMessage, onRequestAuth, onLogout, onSound, onUpdateUser 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'finances' | 'profile' | 'tickets'>('overview');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [scanTerm, setScanTerm] = useState('');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email, password: user.password || '' });

  const isB2B = user.role === 'B2B_Admin';
  const isStandard = user.role === 'Utilizador_Standard';
  const isAdmin = user.role === 'Administrador';
  const myHub = hubs.find(h => h.id === user.managedHubId);

  const financials = useMemo(() => {
    const relevantOrders = orders.filter(o => isB2B ? (o.nodeId === user.managedHubId && o.status === 'Concluído') : (o.clientId === user.id && o.status === 'Concluído'));
    const totalVolume = relevantOrders.reduce((acc, o) => acc + parseFloat(o.value), 0);
    const hubRate = isB2B && myHub ? (myHub.primaryCommission || 15) : 0;
    const platRate = isB2B && myHub ? (myHub.platformCommission || 5) : 0;
    
    const grossHubEarnings = (totalVolume * hubRate) / 100;
    const platformDeduction = (totalVolume * platRate) / 100;
    const netEarnings = grossHubEarnings - platformDeduction;
    
    return { 
      totalVolume, 
      grossHubEarnings,
      platformDeduction,
      netEarnings,
      cashbackTotal: user.balance || 0, 
      count: relevantOrders.length,
      average: relevantOrders.length > 0 ? totalVolume / relevantOrders.length : 0 
    };
  }, [orders, isB2B, myHub, user]);

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

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(o => o.id.toLowerCase().includes(scanTerm.toLowerCase()));
    if (found) {
      setExpandedOrder(found.id);
      setActiveTab('production');
      onSound?.('success');
      const element = document.getElementById(`order-${found.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      onSound?.('error');
    }
    setScanTerm('');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-10 pb-32 industrial-grid animate-in fade-in">
      {/* Dynamic Dashboard Header */}
      <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-16 mb-20 flex flex-col xl:flex-row justify-between items-center gap-12 group hover:border-red-600/20 transition-all">
        <div className="flex items-center space-x-12">
           <div className={`w-32 h-32 text-white rounded-[3.5rem] flex items-center justify-center font-brand font-black italic text-6xl shadow-2xl border-b-[15px] transition-transform group-hover:scale-105 duration-700 ${isAdmin ? 'bg-red-600 border-black' : 'bg-black border-red-600'}`}>
              {user.name[0]}
           </div>
           <div>
              <div className="flex items-center space-x-4 mb-2">
                 <h2 className="text-6xl font-brand font-black italic uppercase tracking-tighter text-black leading-none">{user.name}</h2>
                 {user.tier === 'Platina' && <Zap className="w-8 h-8 text-red-600 animate-pulse" />}
              </div>
              <div className="flex items-center space-x-6">
                 <span className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${isStandard ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-red-50 text-red-600 border-red-100'}`}>{user.role.replace('_', ' ')}</span>
                 {isB2B && (
                    <div className="flex items-center space-x-3 bg-black text-white px-6 py-2 rounded-full shadow-lg">
                       <Server className="w-3 h-3 text-red-600"/> 
                       <span className="text-[11px] font-black uppercase italic tracking-widest">{myHub?.name}</span>
                    </div>
                 )}
                 <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">ID: {user.id}</span>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col items-end gap-8">
          <div className="flex flex-wrap space-x-4 bg-gray-100/50 p-3 rounded-[3.5rem] border border-gray-100 shadow-inner backdrop-blur-md">
             {['overview', 'production', 'finances', 'profile', 'tickets'].map(tab => (
               <button 
                key={tab} 
                onClick={() => { onSound?.('click'); setActiveTab(tab as any); }} 
                className={`px-12 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-110 z-10' : 'text-gray-400 hover:text-black hover:bg-white'}`}
               >
                  {tab}
                  {tab === 'production' && orders.filter(o => o.status === 'Em Produção').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] animate-pulse shadow-lg">{orders.filter(o => o.status === 'Em Produção').length}</span>
                  )}
                  {tab === 'tickets' && tickets.filter(t => t.status === 'Pendente').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[8px] animate-pulse shadow-lg">{tickets.filter(t => t.status === 'Pendente').length}</span>
                  )}
               </button>
             ))}
          </div>
          <form onSubmit={handleBarcodeSearch} className="flex bg-black p-1 rounded-full border border-white/10 w-full max-w-sm group focus-within:ring-4 focus-within:ring-red-600/30 transition-all shadow-2xl">
             <div className="flex items-center px-6"><Barcode className="w-5 h-5 text-red-600 group-focus-within:animate-pulse" /></div>
             <input type="text" placeholder="LOCALIZAR BARCODE..." value={scanTerm} onChange={e => setScanTerm(e.target.value)} className="bg-transparent text-white font-mono text-[11px] uppercase p-4 outline-none flex-grow placeholder:text-gray-700" />
             <button type="submit" className="bg-red-600 text-white p-4 rounded-full hover:bg-white hover:text-black transition-all shadow-lg"><Search className="w-5 h-5" /></button>
          </form>
        </div>
      </div>

      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in">
           {/* Sidebar Tickets List */}
           <div className="xl:col-span-4 space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {tickets.length > 0 ? tickets.map(t => (
                <div key={t.id} onClick={() => { onSound?.('click'); setActiveTicket(t); }} className={`p-10 rounded-[3.5rem] cursor-pointer transition-all border-2 relative overflow-hidden group ${activeTicket?.id === t.id ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white border-transparent hover:border-red-600 shadow-xl'}`}>
                   <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                         <span className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">{t.id}</span>
                         <h5 className={`text-2xl font-brand font-black italic uppercase leading-tight ${activeTicket?.id === t.id ? 'text-white' : 'text-black'}`}>{t.subject}</h5>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${t.priority === 'Alta' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.priority}</span>
                   </div>
                   <div className="flex items-center space-x-4 pt-4 border-t border-gray-50/10 relative z-10">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${t.status === 'Pendente' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{t.status}</span>
                      <span className="text-[9px] font-black opacity-40 uppercase italic">{t.category}</span>
                   </div>
                   <div className="absolute top-0 right-0 p-8 text-red-600/5 group-hover:text-red-600/10 transition-colors"><MessageSquare className="w-32 h-32" /></div>
                </div>
              )) : (
                <div className="p-20 text-center opacity-10 bg-white rounded-[4rem] w-full"><Zap className="w-20 h-20 mx-auto" /><p className="text-2xl font-brand font-black italic uppercase">Grid Silent.</p></div>
              )}
           </div>

           {/* Conversation Area */}
           <div className="xl:col-span-8">
              {activeTicket ? (
                <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 h-full min-h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-right-10">
                   <div className="p-12 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center space-x-6">
                         <div className="p-5 bg-black rounded-3xl text-red-600 shadow-xl"><MessageSquare className="w-8 h-8" /></div>
                         <div>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{activeTicket.id} // SECURE SUPPORT PROTOCOL</span>
                            <h4 className="text-4xl font-brand font-black italic uppercase text-black leading-none">{activeTicket.subject}</h4>
                         </div>
                      </div>
                      <button onClick={() => setActiveTicket(null)} className="p-4 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all"><X className="w-6 h-6"/></button>
                   </div>

                   <div className="flex-grow p-12 overflow-y-auto space-y-8 industrial-grid custom-scrollbar">
                      {activeTicket.messages.map((m, i) => (
                        <div key={m.id} className={`flex ${m.authorId === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
                           <div className={`max-w-[75%] p-8 rounded-[3rem] shadow-xl relative ${m.authorId === user.id ? 'bg-black text-white rounded-tr-none' : 'bg-red-600 text-white rounded-tl-none'}`}>
                              <div className="flex justify-between items-center mb-4 opacity-50">
                                 <span className="text-[8px] font-black uppercase tracking-widest">{m.authorName}</span>
                                 <span className="text-[8px] font-black">{new Date(m.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-[14px] font-bold leading-relaxed italic">"{m.text}"</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   {activeTicket.status !== 'Concluído' && (
                     <div className="p-10 border-t border-gray-100 bg-gray-50/80 backdrop-blur-xl">
                        <div className="bg-white p-2 rounded-[3.5rem] shadow-inner border-2 border-gray-100 flex focus-within:border-red-600 transition-all">
                           <textarea 
                              placeholder="ENVIAR RESPOSTA AO SUPORTE..." 
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
                     </div>
                   )}
                </div>
              ) : (
                <div className="h-full min-h-[600px] bg-white rounded-[5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-20 space-y-12">
                   <div className="relative">
                      <MessageCircle className="w-40 h-40 text-gray-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><Activity className="w-16 h-16 text-red-600/20 animate-pulse" /></div>
                   </div>
                   <div>
                      <h4 className="text-5xl font-brand font-black italic uppercase text-gray-200 leading-none mb-6 tracking-tighter">Support Grid <br/>Inativo.</h4>
                      <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] max-w-sm">Selecione um protocolo de ticket para visualizar a conversa ou abrir um novo pedido via Terminal de Engenharia.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 animate-in slide-in-from-bottom-10">
           <div className="bg-white p-14 rounded-[4.5rem] shadow-xl border border-gray-100 group hover:border-black transition-all">
              <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest block mb-12 flex items-center"><Package className="w-4 h-4 mr-3 text-red-600" /> Protocolos no Grid</span>
              <span className="text-8xl font-brand font-black italic text-black leading-none">{financials.count}</span>
           </div>
           <div className="bg-black text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 industrial-grid opacity-5" />
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest block mb-12 relative z-10 flex items-center"><Activity className="w-4 h-4 mr-3 text-red-600" /> Volume de Manufatura</span>
              <span className="text-6xl font-brand font-black italic text-white leading-none relative z-10">€{financials.totalVolume.toLocaleString()}</span>
           </div>
           <div className="bg-black text-white p-14 rounded-[4.5rem] shadow-2xl relative group hover:scale-[1.02] transition-transform redcoin-badge">
              <div className="absolute top-10 right-10"><Coins className="w-10 h-10 animate-bounce text-yellow-400/60" /></div>
              <span className="text-[11px] font-black uppercase text-white/50 tracking-widest block mb-12">{isB2B ? 'Net Hub Earnings' : 'Proprietary REDCOIN Balance'}</span>
              <div className="flex items-end space-x-3">
                <span className="text-6xl font-brand font-black italic redcoin-text">{(isB2B ? financials.netEarnings : financials.cashbackTotal).toLocaleString()}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-yellow-400 mb-2">RC</span>
              </div>
           </div>
           <div className="bg-white p-14 rounded-[4.5rem] shadow-xl border border-gray-100 group hover:border-black transition-all">
              <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest block mb-12 flex items-center"><TrendingUp className="w-4 h-4 mr-3 text-red-600" /> Rendimento Médio</span>
              <span className="text-6xl font-brand font-black italic text-black leading-none">€{financials.average.toLocaleString()}</span>
           </div>
        </div>
      )}

      {/* VIEW: FINANCES */}
      {activeTab === 'finances' && (
        <div className="space-y-12 animate-in fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="bg-white p-14 rounded-[5rem] shadow-2xl border border-gray-100 group hover:border-black transition-all flex flex-col justify-between h-[350px]">
                 <div className="flex items-center space-x-6 mb-12">
                    <div className="p-6 bg-black rounded-3xl text-red-600 shadow-lg group-hover:rotate-12 transition-transform"><CreditCard className="w-10 h-10"/></div>
                    <h4 className="text-4xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter">Gross <br/>Volume.</h4>
                 </div>
                 <span className="text-7xl font-brand font-black italic text-black">€{financials.totalVolume.toLocaleString()}</span>
              </div>
              <div className="bg-white p-14 rounded-[5rem] shadow-2xl border border-gray-100 flex flex-col justify-between h-[350px]">
                 <div className="flex items-center space-x-6 mb-12">
                    <div className="p-6 bg-orange-500 rounded-3xl text-white shadow-lg"><ShieldAlert className="w-10 h-10"/></div>
                    <h4 className="text-4xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter">Deduções <br/>Grid ({isB2B ? (myHub?.platformCommission || 5) : 0}%).</h4>
                 </div>
                 <span className="text-7xl font-brand font-black italic text-black">-€{financials.platformDeduction.toLocaleString()}</span>
              </div>
              <div className="bg-black p-14 rounded-[5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group h-[350px] redcoin-badge">
                 <div className="absolute inset-0 industrial-grid opacity-5" />
                 <div className="flex items-center space-x-6 mb-12 relative z-10">
                    <div className="p-6 bg-red-600 rounded-3xl text-white shadow-lg group-hover:scale-110 transition-transform"><Wallet className="w-10 h-10"/></div>
                    <h4 className="text-4xl font-brand font-black italic uppercase leading-[0.8] tracking-tighter text-white">REDCOIN <br/>Net Assets.</h4>
                 </div>
                 <div className="flex items-end space-x-4 relative z-10">
                   <span className="text-7xl font-brand font-black italic redcoin-text">{(isB2B ? financials.netEarnings : financials.cashbackTotal).toLocaleString()}</span>
                   <span className="text-2xl font-black text-yellow-400 mb-2">RC</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-16 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h4 className="text-[13px] font-black uppercase text-black tracking-[0.5em] flex items-center">
                    <FileDigit className="w-5 h-5 mr-4 text-red-600" /> Global Financial Ledger
                 </h4>
                 <div className="flex items-center space-x-4 bg-green-50 px-6 py-2 rounded-full border border-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-green-600 text-[10px] font-black uppercase tracking-widest">Sincronização Ativa</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-16 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Order Protocol</th>
                          <th className="px-16 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Módulo Asset</th>
                          <th className="px-16 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Gross Value</th>
                          <th className="px-16 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Dedução Platform</th>
                          <th className="px-16 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Net Liquidação (RC)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {orders.filter(o => isB2B ? o.nodeId === user.managedHubId : o.clientId === user.id).map(o => {
                          const val = parseFloat(o.value);
                          const fee = (val * (isB2B ? (myHub?.platformCommission || 5) : 0)) / 100;
                          return (
                            <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group cursor-default">
                               <td className="px-16 py-10 font-brand font-black italic text-black uppercase tracking-tighter text-2xl">{o.id}</td>
                               <td className="px-16 py-10">
                                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Industrial Module</span>
                                  <span className="text-[12px] font-black uppercase text-black italic">{o.product}</span>
                               </td>
                               <td className="px-16 py-10 font-brand font-black italic text-black text-xl text-right">€{val.toLocaleString()}</td>
                               <td className="px-16 py-10 font-black text-red-600 text-[13px] text-right">-€{fee.toLocaleString()}</td>
                               <td className="px-16 py-10 text-right">
                                  <div className="inline-flex items-center space-x-2 bg-black px-8 py-3 rounded-2xl group-hover:scale-105 transition-all">
                                    <span className="font-brand font-black italic text-2xl redcoin-text">{(val - fee).toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-yellow-400">RC</span>
                                  </div>
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

      {/* VIEW: PRODUCTION GRID */}
      {activeTab === 'production' && (
        <div className="space-y-10 animate-in fade-in">
           {orders.length > 0 ? orders.filter(o => isB2B ? o.nodeId === user.managedHubId : o.clientId === user.id).map(o => (
             <div key={o.id} id={`order-${o.id}`} className={`bg-white rounded-[5rem] border transition-all duration-700 overflow-hidden shadow-2xl relative ${expandedOrder === o.id ? 'border-black ring-[20px] ring-black/5 scale-[1.02]' : 'border-gray-100 hover:border-red-600/30'}`}>
                {o.priority && <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />}
                
                <div className="p-16 flex flex-col xl:flex-row justify-between items-center gap-16">
                   <div className="flex-grow w-full">
                      <div className="flex flex-wrap items-center gap-8 mb-10">
                         <span className="text-6xl font-brand font-black italic text-black uppercase tracking-tighter leading-none">{o.id}</span>
                         <span className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm ${o.status === 'Concluído' ? 'bg-green-50 text-green-600 border-green-100' : (o.status === 'Rejeitado' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600 border-red-100')}`}>{o.status.replace('_', ' ')}</span>
                         {o.priority && (
                           <div className="flex items-center space-x-3 bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">
                              <Zap className="w-4 h-4 text-red-600"/> <span>Priority Alpha</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                         <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] block">Entidade Master</span>
                            <span className="text-black font-brand font-black italic uppercase text-2xl">{o.client}</span>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] block">Módulo Produção</span>
                            <span className="text-black font-brand font-black italic uppercase text-2xl">{o.product}</span>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] block">Dimensões Axis</span>
                            <span className="text-black font-brand font-black italic text-2xl uppercase">{o.dimensions || 'Dynamic'}</span>
                         </div>
                         <div className="space-y-2 text-right">
                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] block">Valor Ativo</span>
                            <div className="flex items-center justify-end space-x-2">
                              <span className="redcoin-text font-brand font-black italic text-4xl leading-none">{o.value}</span>
                              <span className="text-[10px] font-black text-yellow-400">RC</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* OPERATIONAL HUB CONTROLS */}
                   {isB2B && o.status !== 'Concluído' && o.status !== 'Rejeitado' && (
                     <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-[3.5rem] flex items-center space-x-4 border border-gray-100 shadow-xl animate-in zoom-in-95 duration-500 shrink-0">
                        {o.status === 'Aprovado' && (
                          <button onClick={() => onUpdateStatus(o.id, 'Em Produção')} className="bg-black text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-red-600 transition-all flex items-center space-x-4 shadow-xl">
                             <PlayCircle className="w-5 h-5" /> <span>Start Production</span>
                          </button>
                        )}
                        {o.status === 'Em Produção' && (
                          <button onClick={() => onUpdateStatus(o.id, 'Expedição')} className="bg-black text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-red-600 transition-all flex items-center space-x-4 shadow-xl">
                             <Truck className="w-5 h-5" /> <span>Dispatch Unit</span>
                          </button>
                        )}
                        {o.status === 'Expedição' && (
                          <button onClick={() => onUpdateStatus(o.id, 'Concluído')} className="bg-red-600 text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-black transition-all flex items-center space-x-4 shadow-xl">
                             <CheckCircle2 className="w-5 h-5" /> <span>Finalize Job</span>
                          </button>
                        )}
                     </div>
                   )}

                   <div className="flex space-x-4 shrink-0">
                      <button onClick={() => { onSound?.('click'); setExpandedOrder(expandedOrder === o.id ? null : o.id); }} className={`p-10 rounded-[2.5rem] shadow-xl transition-all duration-500 flex items-center justify-center ${expandedOrder === o.id ? 'bg-black text-white rotate-180' : 'bg-gray-50 text-gray-400 hover:text-black'}`}>
                         <ChevronDown className="w-10 h-10" />
                      </button>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => { onSound?.('success'); generateOrderPDF(o, hubs.find(h => h.id === o.nodeId)); }} className="p-6 bg-black text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl group/btn">
                           <FileDown className="w-6 h-6 group-hover/btn:scale-110 transition-transform"/>
                        </button>
                        {(isAdmin || isB2B || o.clientId === user.id) && o.fileName && (
                          <button onClick={() => { onSound?.('success'); downloadOriginalAsset(o); }} className="p-6 bg-red-600 text-white rounded-2xl hover:bg-black transition-all shadow-xl group/btn">
                             <Download className="w-6 h-6 group-hover/btn:scale-110 transition-transform"/>
                          </button>
                        )}
                      </div>
                   </div>
                </div>

                {expandedOrder === o.id && (
                   <div className="p-20 bg-gray-50/50 border-t-2 border-gray-100 animate-in slide-in-from-top-10 duration-700">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-20">
                         {/* Hub Telemetry */}
                         <div className="space-y-10">
                            <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.6em] flex items-center mb-8"><Server className="w-6 h-6 mr-4" /> Node Grid Telemetry</h5>
                            <div className="p-10 bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 hover:border-red-600 transition-all">
                               <div className="flex justify-between items-start mb-6">
                                  <div>
                                     <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest block mb-2">Assigned Facility</span>
                                     <span className="text-3xl font-brand font-black italic uppercase block text-black">{hubs.find(h => h.id === o.nodeId)?.name || 'CENTRAL REDLINE GRID'}</span>
                                  </div>
                                  <div className="bg-red-50 p-4 rounded-2xl"><Activity className="w-6 h-6 text-red-600 animate-pulse" /></div>
                               </div>
                               <div className="flex items-center space-x-6 pt-6 border-t border-gray-50 text-[11px] font-black uppercase text-gray-400 italic">
                                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-red-600" /> {hubs.find(h => h.id === o.nodeId)?.location || 'Global Cluster'}</div>
                                  <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-red-600" /> Sync: 0.02ms</div>
                               </div>
                            </div>
                            
                            {/* Barcode Scanner UI */}
                            <div className="p-10 bg-black text-white rounded-[3.5rem] shadow-2xl flex flex-col items-center group/barcode hover:scale-105 transition-all duration-700">
                               <div className="flex items-center space-x-4 mb-8">
                                  <Barcode className="w-10 h-10 text-red-600 animate-pulse" />
                                  <span className="text-2xl font-brand font-black italic uppercase tracking-widest">Industrial Scan</span>
                               </div>
                               <div className="w-full bg-white p-8 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner border-[10px] border-black">
                                  <div className="flex gap-1 group-hover/barcode:scale-x-125 transition-transform duration-[2s] ease-in-out">
                                     {Array.from({length: 40}).map((_, i) => (
                                       <div key={i} className="bg-black" style={{ width: (i % 5 === 0 ? '6px' : (i % 2 === 0 ? '1.5px' : '3px')), height: '60px' }} />
                                     ))}
                                  </div>
                               </div>
                               <div className="mt-8 text-center">
                                  <span className="text-[10px] font-mono text-red-600 block mb-1">R2_SECURE_TOKEN_V4.2</span>
                                  <span className="text-[12px] font-mono text-gray-500 uppercase">{btoa(o.id).slice(0, 32)}</span>
                               </div>
                            </div>
                         </div>

                         {/* Industrial Blueprints */}
                         <div className="space-y-10">
                            <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.6em] flex items-center mb-8"><FileDigit className="w-6 h-6 mr-4" /> Technical Blueprint</h5>
                            <div className="p-12 bg-white rounded-[4rem] border border-gray-100 space-y-10 shadow-2xl relative overflow-hidden group/card">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-5 group-hover/card:scale-150 transition-transform duration-1000 rounded-full -mr-16 -mt-16" />
                               <div className="flex items-center justify-between border-b border-gray-100 pb-8 relative z-10">
                                  <div className="flex items-center space-x-6">
                                     <div className="p-4 bg-gray-50 rounded-2xl"><FileText className="w-10 h-10 text-red-600" /></div>
                                     <div>
                                        <span className="text-[11px] font-black uppercase text-black block tracking-widest leading-none mb-2">{o.fileName || 'REDLINE_ASSET_R2.PDF'}</span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-bold">Encrypted Vector Protocol</span>
                                     </div>
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-8 relative z-10">
                                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-red-600 transition-all">
                                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Substrato Industrial</span>
                                     <span className="text-[12px] font-black text-black uppercase italic leading-tight">{o.material}</span>
                                  </div>
                                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-red-600 transition-all">
                                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Acabamento R2</span>
                                     <span className="text-[12px] font-black text-black uppercase italic leading-tight">{o.finish}</span>
                                  </div>
                                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-red-600 transition-all">
                                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Unidades Ativas</span>
                                     <span className="text-3xl font-brand font-black italic text-black leading-none">{o.quantity} <span className="text-[10px] font-normal opacity-30">u.</span></span>
                                  </div>
                                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-red-600 transition-all">
                                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Dimensões Axis</span>
                                     <span className="text-3xl font-brand font-black italic text-black leading-none">{o.dimensions || 'N/A'}</span>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Log */}
                         <div className="space-y-10">
                            <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.6em] flex items-center mb-8"><History className="w-6 h-6 mr-4" /> Operational Audit Log</h5>
                            <div className="space-y-8 border-l-[3px] border-red-100 pl-10 ml-3 py-4">
                               {o.history.map((h, i) => (
                                 <div key={i} className="relative animate-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="absolute -left-[54px] top-0 w-6 h-6 bg-red-600 rounded-full border-[6px] border-white shadow-[0_0_15px_rgba(204,0,0,0.3)] group-hover:scale-125 transition-transform" />
                                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 hover:border-red-600 transition-all group/log">
                                       <span className="text-[9px] font-black text-gray-300 uppercase block tracking-widest mb-2">{new Date(h.timestamp).toLocaleString()}</span>
                                       <span className="text-[13px] font-black text-black uppercase block italic group-hover/log:text-red-600 transition-colors">{h.status}</span>
                                       <p className="text-[11px] text-gray-400 font-medium mt-3 leading-relaxed">"{h.note}"</p>
                                       <div className="mt-4 flex items-center space-x-3 opacity-30 group-hover/log:opacity-100 transition-opacity">
                                          <UserCheck className="w-3 h-3" />
                                          <span className="text-[8px] font-black uppercase tracking-widest">Signed: {h.author}</span>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                )}
             </div>
           )) : (
             <div className="py-60 text-center space-y-12 opacity-10 animate-pulse">
                <Radio className="w-32 h-32 mx-auto text-black" />
                <p className="text-6xl font-brand font-black italic uppercase tracking-tighter">Grid Deserto. Aguardando Injeção.</p>
             </div>
           )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95">
           <div className="bg-white p-20 rounded-[6rem] border border-gray-100 shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 text-red-600/5 rotate-12"><Settings className="w-64 h-64" /></div>
              <h3 className="text-6xl font-brand font-black italic uppercase mb-16 leading-none relative z-10">Gestão de <br/><span className="text-red-600">Identidade Master.</span></h3>
              <form onSubmit={(e) => { e.preventDefault(); onUpdateUser(user.id, profileForm); onSound?.('success'); }} className="space-y-10 relative z-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-8 flex items-center"><UserIcon className="w-4 h-4 mr-3" /> Nome da Entidade</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-gray-50 p-10 rounded-[3rem] font-brand font-black italic uppercase text-2xl outline-none border-2 border-transparent focus:border-red-600 shadow-inner transition-all" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-8 flex items-center"><Mail className="w-4 h-4 mr-3" /> Email de Protocolo</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-gray-50 p-10 rounded-[3rem] font-brand font-black italic uppercase text-2xl outline-none border-2 border-transparent focus:border-red-600 shadow-inner transition-all" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-8 flex items-center"><Lock className="w-4 h-4 mr-3" /> Nova Master Password</label>
                    <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} placeholder="DEIXE VAZIO PARA MANTER" className="w-full bg-gray-50 p-10 rounded-[3rem] font-brand font-black italic uppercase text-2xl outline-none border-2 border-transparent focus:border-red-600 shadow-inner transition-all" />
                 </div>
                 <button type="submit" className="w-full bg-black text-white p-14 rounded-[4rem] font-brand font-black italic uppercase tracking-[0.5em] text-2xl hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-8 group border-b-[15px] border-gray-900">
                    <span>Sincronizar Credenciais</span> <RefreshCw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-1000" />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Account;
