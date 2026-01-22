
import React, { useState, useMemo } from 'react';
import { User, ProductionJob, ExtendedProduct, PartnerNode, Language, SupportTicket, AuthorizationRequest } from '../types';
import { Activity, Zap, TrendingUp, Package, Clock, ShieldAlert, Download, Edit2, CheckCircle2, X, FileText, Settings, BarChart3, ListChecks, MessageSquare, Trash2, ShieldCheck, Key, FileCheck, Maximize2, Layers, Image as ImageIcon, Box, RefreshCw, ChevronDown, ChevronUp, History, Info, Monitor, Radio, Coins, CreditCard, PieChart, Wallet, Mail, Lock, Server, FileDigit, QrCode, FileDown, Barcode, Search } from 'lucide-react';
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
  const [scanTerm, setScanTerm] = useState('');
  
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email, password: user.password || '' });

  const isB2B = user.role === 'B2B_Admin';
  const isStandard = user.role === 'Utilizador_Standard';
  const isAdmin = user.role === 'Administrador';
  const myHub = hubs.find(h => h.id === user.managedHubId);

  // Engine Financeira Redline R2 - Sync em Tempo Real
  const financials = useMemo(() => {
    const relevantOrders = orders.filter(o => isB2B ? o.nodeId === user.managedHubId : o.clientId === user.id);
    const totalVolume = relevantOrders.reduce((acc, o) => acc + parseFloat(o.value), 0);
    
    // Comissão HUB (Nível 2)
    const hubRate = isB2B && myHub ? (myHub.primaryCommission || 0) : 0;
    const grossHubEarnings = (totalVolume * hubRate) / 100;
    
    // Taxa Plataforma (Nível 1)
    const platRate = isB2B && myHub ? (myHub.platformCommission || 5) : 0;
    const platformDeduction = (totalVolume * platRate) / 100;
    
    const netEarnings = grossHubEarnings - platformDeduction;
    const cashbackTotal = isStandard ? (user.balance || 0) : 0;
    
    return { 
      totalVolume, 
      grossHubEarnings,
      platformDeduction,
      netEarnings,
      cashbackTotal, 
      count: relevantOrders.length,
      average: relevantOrders.length > 0 ? totalVolume / relevantOrders.length : 0 
    };
  }, [orders, isB2B, myHub, user, isStandard]);

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(o => o.id.toLowerCase().includes(scanTerm.toLowerCase()));
    if (found) {
      setExpandedOrder(found.id);
      setActiveTab('production');
      onSound?.('success');
    } else {
      onSound?.('error');
    }
    setScanTerm('');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 pb-32 industrial-grid animate-in fade-in">
      {/* Header com Integração de Scan */}
      <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-16 mb-20 flex flex-col xl:flex-row justify-between items-center gap-12">
        <div className="flex items-center space-x-12">
           <div className={`w-32 h-32 text-white rounded-[3rem] flex items-center justify-center font-brand font-black italic text-6xl shadow-2xl border-b-[12px] ${isAdmin ? 'bg-red-600 border-black' : 'bg-black border-red-600'}`}>{user.name[0]}</div>
           <div>
              <h2 className="text-6xl font-brand font-black italic uppercase tracking-tighter text-black leading-none">{user.name}</h2>
              <div className="flex items-center space-x-6 mt-4">
                 <span className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${isStandard ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-red-50 text-red-600 border-red-100'}`}>{user.role.replace('_', ' ')}</span>
                 {isB2B && <div className="flex items-center space-x-3 bg-black text-white px-6 py-2 rounded-full"><Server className="w-3 h-3 text-red-600"/> <span className="text-[11px] font-black uppercase italic tracking-widest">{myHub?.name}</span></div>}
              </div>
           </div>
        </div>
        
        <div className="flex flex-col items-end gap-6">
          <div className="flex flex-wrap space-x-4 bg-gray-50 p-3 rounded-[3rem] border border-gray-100 shadow-inner">
             {['overview', 'production', 'finances', 'profile'].map(tab => (
               <button key={tab} onClick={() => { onSound?.('click'); setActiveTab(tab as any); }} className={`px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}>{tab}</button>
             ))}
          </div>
          
          {/* Terminal de Scan de Barcode R2 */}
          <form onSubmit={handleBarcodeSearch} className="flex bg-black p-1 rounded-full border border-white/10 w-full max-w-sm group focus-within:ring-2 focus-within:ring-red-600 transition-all">
             <div className="flex items-center px-6"><Barcode className="w-5 h-5 text-red-600 group-focus-within:animate-pulse" /></div>
             <input 
              type="text" 
              placeholder="SCAN BARCODE / ORDER ID..." 
              value={scanTerm}
              onChange={e => setScanTerm(e.target.value)}
              className="bg-transparent text-white font-mono text-[10px] uppercase p-4 outline-none flex-grow placeholder:text-gray-700"
             />
             <button type="submit" className="bg-red-600 text-white p-4 rounded-full hover:bg-white hover:text-black transition-all"><Search className="w-4 h-4" /></button>
          </form>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 animate-in slide-in-from-bottom-10">
           <div className="bg-white p-12 rounded-[4.5rem] shadow-xl border border-gray-50">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-10">Jobs no Grid</span>
              <span className="text-7xl font-brand font-black italic">{financials.count}</span>
           </div>
           <div className="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 industrial-grid opacity-5" />
              <span className="text-[10px] font-black uppercase text-gray-500 block mb-10">Volume Industrial</span>
              <span className="text-5xl font-brand font-black italic">€{financials.totalVolume.toLocaleString()}</span>
           </div>
           <div className="bg-red-600 text-white p-12 rounded-[4.5rem] shadow-2xl relative">
              <div className="absolute top-8 right-8"><Activity className="w-6 h-6 animate-pulse opacity-50" /></div>
              <span className="text-[10px] font-black uppercase text-white/50 block mb-10">{isB2B ? 'Net Hub Earned' : 'Cashback R2'}</span>
              <span className="text-5xl font-brand font-black italic">€{(isB2B ? financials.netEarnings : financials.cashbackTotal).toLocaleString()}</span>
           </div>
           <div className="bg-white p-12 rounded-[4.5rem] shadow-xl border border-gray-50">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-10">Ticket Médio</span>
              <span className="text-5xl font-brand font-black italic text-black">€{financials.average.toLocaleString()}</span>
           </div>
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="space-y-12 animate-in fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-12 rounded-[4.5rem] shadow-2xl border border-gray-100 group hover:border-black transition-all">
                 <div className="flex items-center space-x-6 mb-12">
                    <div className="p-5 bg-black rounded-3xl text-red-600"><CreditCard className="w-8 h-8"/></div>
                    <h4 className="text-3xl font-brand font-black italic uppercase leading-none">Gross <br/>Volume.</h4>
                 </div>
                 <span className="text-6xl font-brand font-black italic text-black">€{financials.totalVolume.toLocaleString()}</span>
              </div>
              <div className="bg-white p-12 rounded-[4.5rem] shadow-2xl border border-gray-100 flex flex-col justify-between">
                 <div className="flex items-center space-x-6 mb-12">
                    <div className="p-5 bg-orange-500 rounded-3xl text-white"><ShieldAlert className="w-8 h-8"/></div>
                    <h4 className="text-3xl font-brand font-black italic uppercase leading-none">Plat. <br/>Fee ({myHub?.platformCommission || 5}%).</h4>
                 </div>
                 <span className="text-6xl font-brand font-black italic text-black">-€{financials.platformDeduction.toLocaleString()}</span>
              </div>
              <div className="bg-black p-12 rounded-[4.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                 <div className="absolute inset-0 industrial-grid opacity-5" />
                 <div className="flex items-center space-x-6 mb-12 relative z-10">
                    <div className="p-5 bg-red-600 rounded-3xl text-white group-hover:scale-110 transition-transform"><Wallet className="w-8 h-8"/></div>
                    <h4 className="text-3xl font-brand font-black italic uppercase leading-none text-white">Net <br/>Profit.</h4>
                 </div>
                 <span className="text-6xl font-brand font-black italic text-white relative z-10">€{financials.netEarnings.toLocaleString()}</span>
              </div>
           </div>

           {/* Ledger de Transações R2 */}
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
                       {orders.filter(o => isB2B ? o.nodeId === user.managedHubId : o.clientId === user.id).map(o => {
                          const val = parseFloat(o.value);
                          const fee = (val * (myHub?.platformCommission || 5)) / 100;
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

      {activeTab === 'production' && (
        <div className="space-y-8 animate-in fade-in">
           {orders.length > 0 ? orders.filter(o => isB2B ? o.nodeId === user.managedHubId : o.clientId === user.id).map(o => (
             <div key={o.id} id={`order-${o.id}`} className={`bg-white rounded-[4.5rem] border transition-all duration-500 overflow-hidden shadow-xl ${expandedOrder === o.id ? 'border-black ring-[10px] ring-black/5 scale-[1.01]' : 'border-gray-100 hover:border-red-600/30'}`}>
                <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                   <div className="flex-grow">
                      <div className="flex items-center space-x-8 mb-6">
                         <span className="text-4xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                         <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border ${o.status === 'Concluído' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{o.status.replace('_', ' ')}</span>
                         {o.priority && <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full text-[8px] font-black uppercase animate-pulse"><Zap className="w-3 h-3 text-red-600"/> <span>Priority</span></div>}
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-[11px] font-black uppercase text-gray-400 italic">
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Entidade</span><span className="text-black">{o.client}</span></div>
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Módulo</span><span className="text-black">{o.product}</span></div>
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Dimensões Axis</span><span className="text-black font-brand">{o.dimensions || 'N/A'}</span></div>
                         <div><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Valor Ativo</span><span className="text-black font-brand">€{o.value}</span></div>
                      </div>
                   </div>
                   <div className="flex space-x-4">
                      <button onClick={() => { onSound?.('click'); setExpandedOrder(expandedOrder === o.id ? null : o.id); }} className={`p-8 rounded-full shadow-xl transition-all ${expandedOrder === o.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                         {expandedOrder === o.id ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
                      </button>
                      
                      <div className="flex space-x-2">
                        <button onClick={() => { onSound?.('success'); generateOrderPDF(o, hubs.find(h => h.id === o.nodeId)); }} title="Download Production Spec" className="p-8 bg-black text-white rounded-full hover:bg-red-600 transition-all shadow-xl">
                           <FileDown className="w-8 h-8"/>
                        </button>
                        {(isAdmin || isB2B || o.clientId === user.id) && o.fileName && (
                          <button onClick={() => { onSound?.('success'); downloadOriginalAsset(o); }} title="Download Original Asset" className="p-8 bg-red-600 text-white rounded-full hover:bg-black transition-all shadow-xl">
                             <Download className="w-8 h-8"/>
                          </button>
                        )}
                      </div>
                   </div>
                </div>
                {expandedOrder === o.id && (
                   <div className="p-16 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                         <div className="space-y-8 text-center lg:text-left">
                            <h5 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center justify-center lg:justify-start"><Server className="w-4 h-4 mr-3" /> Grid Source Node</h5>
                            <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                               <span className="text-[12px] font-black uppercase block text-black">{hubs.find(h => h.id === o.nodeId)?.name || 'Redline Central R2'}</span>
                               <span className="text-[10px] font-black uppercase text-gray-400 italic tracking-widest">{hubs.find(h => h.id === o.nodeId)?.location || 'Grid Descentralizado'}</span>
                            </div>
                            <div className="p-8 bg-black text-white rounded-[2.5rem] shadow-xl flex flex-col items-center group/barcode">
                               <div className="flex items-center space-x-3 mb-6">
                                  <Barcode className="w-8 h-8 text-red-600" />
                                  <span className="text-[12px] font-brand font-black italic uppercase">Industrial Scan</span>
                               </div>
                               <div className="w-full bg-white p-6 rounded-xl flex items-center justify-center overflow-hidden">
                                  <div className="flex gap-0.5 group-hover/barcode:scale-110 transition-transform duration-700">
                                     {o.id.split('').map((c, i) => (
                                       <div key={i} className="bg-black" style={{ width: (i % 3 === 0 ? '4px' : '1px'), height: '40px' }} />
                                     ))}
                                  </div>
                               </div>
                               <span className="text-[9px] font-mono opacity-40 uppercase mt-4">TOKEN: {btoa(o.id).slice(0, 24)}</span>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <h5 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center"><FileDigit className="w-4 h-4 mr-3" /> Technical Spec</h5>
                            <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 space-y-6 shadow-xl">
                               <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                  <div className="flex items-center space-x-4">
                                     <FileText className="w-8 h-8 text-red-600" />
                                     <div>
                                        <span className="text-[10px] font-black uppercase text-black block">{o.fileName || 'RL_ASSET_MASTER.PDF'}</span>
                                        <span className="text-[8px] text-gray-400 uppercase tracking-widest">Vector Protocol 4.2</span>
                                     </div>
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-gray-50 rounded-2xl">
                                     <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Material</span>
                                     <span className="text-[10px] font-black text-black uppercase">{o.material}</span>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-2xl">
                                     <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Finish</span>
                                     <span className="text-[10px] font-black text-black uppercase">{o.finish}</span>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-2xl">
                                     <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Qty</span>
                                     <span className="text-[10px] font-black text-black uppercase">{o.quantity} un</span>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-2xl">
                                     <span className="text-[8px] font-black text-gray-400 uppercase block mb-1">Dims</span>
                                     <span className="text-[10px] font-black text-black uppercase">{o.dimensions}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <h5 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center"><History className="w-4 h-4 mr-3" /> Operational Log</h5>
                            <div className="space-y-6 border-l-2 border-red-100 pl-8 ml-2">
                               {o.history.map((h, i) => (
                                 <div key={i} className="relative">
                                    <div className="absolute -left-[37px] top-0 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-md" />
                                    <span className="text-[8px] font-black text-gray-300 uppercase block tracking-widest">{new Date(h.timestamp).toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-black uppercase block mt-1">{h.status}</span>
                                    <p className="text-[9px] text-gray-400 italic mt-2 leading-relaxed">"{h.note}"</p>
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
              <form onSubmit={(e) => { e.preventDefault(); onUpdateUser(user.id, profileForm); onSound?.('success'); }} className="space-y-8">
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
