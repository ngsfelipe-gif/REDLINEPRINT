
import React, { useState, useMemo } from 'react';
import { User, ProductionJob, ExtendedProduct, PartnerNode, Language, SupportTicket, AuthorizationRequest } from '../types';
import { TRANSLATIONS } from '../translations';
import { Activity, Zap, TrendingUp, Package, Clock, ShieldAlert, Download, Edit2, CheckCircle2, X, FileText, Settings, BarChart3, ListChecks, MessageSquare, Trash2, ShieldCheck, Key, FileCheck, Maximize2, Layers, Image as ImageIcon, Box, RefreshCw, ChevronDown, ChevronUp, History, Info, Monitor, Radio, Coins, CreditCard, PieChart, Wallet, Mail, Lock, Server, FileDigit, QrCode, FileDown } from 'lucide-react';
import { generateOrderPDF, downloadOriginalAsset } from '../services/pdfService';

interface AccountProps {
  user: User;
  orders: ProductionJob[];
  tickets: SupportTicket[];
  products: ExtendedProduct[];
  hubs: PartnerNode[];
  language: Language;
  onUpdateStatus: (orderId: string, status: ProductionJob['status'], nodeId?: string, note?: string) => void;
  onRequestAuth: (req: Omit<AuthorizationRequest, 'id' | 'timestamp' | 'status'>) => void;
  onLogout: () => void;
  onSound?: (type: 'click' | 'success' | 'sync' | 'error' | 'loading') => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const Account: React.FC<AccountProps> = ({ user, orders, tickets, products, hubs, language, onUpdateStatus, onRequestAuth, onLogout, onSound, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'finances' | 'profile'>('overview');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email, password: user.password || '' });

  const isB2B = user.role === 'B2B_Admin';
  const isStandard = user.role === 'Utilizador_Standard';
  const isAdmin = user.role === 'Administrador';
  const myHub = hubs.find(h => h.id === user.managedHubId);

  const financials = useMemo(() => {
    const totalVolume = orders.reduce((acc, o) => acc + parseFloat(o.value), 0);
    const hubShare = isB2B && myHub ? totalVolume * ((myHub.primaryCommission || 0) / 100) : 0;
    const partnerShare = (user.partnerCommissionRate || 0) > 0 ? totalVolume * (user.partnerCommissionRate! / 100) : 0;
    const cashbackTotal = isStandard ? (user.balance || 0) : 0;
    
    return { totalVolume, hubShare, partnerShare, cashbackTotal, averageTicket: orders.length > 0 ? totalVolume / orders.length : 0 };
  }, [orders, isB2B, myHub, user, isStandard]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onSound?.('loading');
    setTimeout(() => {
      onUpdateUser(user.id, { ...profileForm });
      onSound?.('success');
    }, 1000);
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
    <div className="max-w-[1600px] mx-auto px-6 pb-32 industrial-grid animate-in fade-in">
      <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-16 mb-20 flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="flex items-center space-x-12">
           <div className={`w-32 h-32 text-white rounded-[3rem] flex items-center justify-center font-brand font-black italic text-6xl shadow-2xl border-b-[12px] ${isAdmin ? 'bg-red-600 border-black' : 'bg-black border-red-600'}`}>{user.name[0]}</div>
           <div>
              <h2 className="text-6xl font-brand font-black italic uppercase tracking-tighter text-black leading-none">{user.name}</h2>
              <div className="flex items-center space-x-6 mt-4">
                 <span className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${isStandard ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-red-50 text-red-600 border-red-100'}`}>{user.role.replace('_', ' ')}</span>
                 {isB2B && <span className="text-[11px] font-black uppercase text-gray-300 italic tracking-[0.2em]">Nodo: {myHub?.name}</span>}
              </div>
           </div>
        </div>
        <div className="flex flex-wrap space-x-4 bg-gray-50 p-3 rounded-[3rem] border border-gray-100 shadow-inner">
           {['overview', 'production', 'finances', 'profile'].map(tab => (
             <button key={tab} onClick={() => { onSound?.('click'); setActiveTab(tab as any); }} className={`px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}>{tab}</button>
           ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 animate-in slide-in-from-bottom-10">
           <div className="bg-white p-12 rounded-[4.5rem] shadow-xl border border-gray-50">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-10">Jobs no Grid</span>
              <span className="text-7xl font-brand font-black italic">{orders.length}</span>
           </div>
           <div className="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 industrial-grid opacity-5" />
              <span className="text-[10px] font-black uppercase text-gray-500 block mb-10">Volume Industrial</span>
              <span className="text-5xl font-brand font-black italic">€{financials.totalVolume.toLocaleString()}</span>
           </div>
           <div className="bg-red-600 text-white p-12 rounded-[4.5rem] shadow-2xl">
              <span className="text-[10px] font-black uppercase text-white/50 block mb-10">Cashback Acumulado</span>
              <span className="text-5xl font-brand font-black italic">€{financials.cashbackTotal.toLocaleString()}</span>
           </div>
           <div className="bg-white p-12 rounded-[4.5rem] shadow-xl border border-gray-50">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-10">Ticket Médio</span>
              <span className="text-5xl font-brand font-black italic text-black">€{financials.averageTicket.toLocaleString()}</span>
           </div>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="space-y-8 animate-in fade-in">
           {orders.length > 0 ? orders.map(o => (
             <div key={o.id} className={`bg-white rounded-[4.5rem] border transition-all duration-500 overflow-hidden shadow-xl ${expandedOrder === o.id ? 'border-black' : 'border-gray-100 hover:border-red-600/30'}`}>
                <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                   <div className="flex-grow">
                      <div className="flex items-center space-x-8 mb-6">
                         <span className="text-4xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                         <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border ${o.status === 'Concluído' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{o.status.replace('_', ' ')}</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-[11px] font-black uppercase text-gray-400 italic">
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Entidade</span><span className="text-black">{o.client}</span></div>
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Módulo</span><span className="text-black">{o.product}</span></div>
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Dimensões</span><span className="text-black font-brand">{o.dimensions || 'N/A'}</span></div>
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Valor Ativo</span><span className="text-black font-brand">€{o.value}</span></div>
                      </div>
                   </div>
                   <div className="flex space-x-4">
                      <button onClick={() => { onSound?.('click'); setExpandedOrder(expandedOrder === o.id ? null : o.id); }} className={`p-8 rounded-full shadow-xl transition-all ${expandedOrder === o.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                         {expandedOrder === o.id ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
                      </button>
                      
                      <div className="flex space-x-2">
                        <button onClick={() => handleDownloadPDF(o)} title="Descarregar Guia de Produção" className="p-8 bg-black text-white rounded-full hover:bg-red-600 transition-all shadow-xl">
                           <FileDown className="w-8 h-8"/>
                        </button>
                        {(isAdmin || isB2B || o.clientId === user.id) && o.fileName && (
                          <button onClick={() => handleDownloadAsset(o)} title="Descarregar Ativo Original" className="p-8 bg-red-600 text-white rounded-full hover:bg-black transition-all shadow-xl">
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
                            <h5 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center"><Server className="w-4 h-4 mr-3" /> Nodo Industrial de Origem</h5>
                            <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                               <span className="text-[12px] font-black uppercase block text-black">{hubs.find(h => h.id === o.nodeId)?.name || 'Redline Central R2'}</span>
                               <span className="text-[10px] font-black uppercase text-gray-400 italic tracking-widest">{hubs.find(h => h.id === o.nodeId)?.location || 'Ativo Descentralizado'}</span>
                            </div>
                            <div className="p-8 bg-black text-white rounded-[2.5rem] shadow-xl flex items-center space-x-6">
                               <QrCode className="w-10 h-10 text-red-600" />
                               <span className="text-[9px] font-mono opacity-40 uppercase">AUTH_HASH: {o.id}-{Math.random().toString(16).slice(2, 6).toUpperCase()}</span>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <h5 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center"><FileDigit className="w-4 h-4 mr-3" /> Engenharia & Assets</h5>
                            <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 space-y-6">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                     <FileText className="w-6 h-6 text-red-600" />
                                     <span className="text-[10px] font-black uppercase text-black">{o.fileName || 'asset_industrial_v1.pdf'}</span>
                                  </div>
                                  <button onClick={() => handleDownloadAsset(o)} className="p-4 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all"><Download className="w-5 h-5"/></button>
                               </div>
                               <div className="pt-4 border-t border-gray-50 space-y-2">
                                  <div className="flex justify-between text-[9px] font-black uppercase italic"><span className="text-gray-400">Material:</span><span className="text-black">{o.material}</span></div>
                                  <div className="flex justify-between text-[9px] font-black uppercase italic"><span className="text-gray-400">Acabamento:</span><span className="text-black">{o.finish}</span></div>
                                  <div className="flex justify-between text-[9px] font-black uppercase italic"><span className="text-gray-400">Quantidade:</span><span className="text-black">{o.quantity} un</span></div>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <h5 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center"><History className="w-4 h-4 mr-3" /> Log R2-Trace</h5>
                            <div className="space-y-6 border-l-2 border-red-100 pl-8 ml-2">
                               {o.history.map((h, i) => (
                                 <div key={i} className="relative">
                                    <div className="absolute -left-[37px] top-0 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-md" />
                                    <span className="text-[8px] font-black text-gray-300 uppercase block tracking-widest">{new Date(h.timestamp).toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-black uppercase block mt-1">{h.status}</span>
                                    <p className="text-[9px] text-gray-400 italic mt-2">"{h.note}"</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                )}
             </div>
           )) : (
             <div className="py-40 text-center space-y-8 opacity-20">
                <Radio className="w-24 h-24 mx-auto animate-pulse" />
                <p className="text-4xl font-brand font-black italic uppercase">Sem Ativos no Grid.</p>
             </div>
           )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto py-12 animate-in fade-in">
           <div className="bg-white p-16 rounded-[5rem] border border-gray-100 shadow-2xl">
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Gestão de <span className="text-red-600">Identidade.</span></h3>
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Nome da Entidade</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Email de Protocolo</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">Nova Password Master</label>
                    <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} placeholder="DEIXE EM BRANCO PARA MANTER" className="w-full bg-gray-50 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" />
                 </div>
                 <button type="submit" className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[13px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-6 group">
                    <span>Sincronizar Credenciais</span> <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Account;
