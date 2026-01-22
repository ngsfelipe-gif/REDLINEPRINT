
import React, { useState, useMemo } from 'react';
import { User, ProductionJob, ExtendedProduct, PartnerNode, Language, SupportTicket, AuthorizationRequest } from '../types';
import { TRANSLATIONS } from '../translations';
import { Activity, Zap, TrendingUp, Package, Clock, ShieldAlert, Download, Edit2, CheckCircle2, X, FileText, Settings, BarChart3, ListChecks, MessageSquare, Trash2, ShieldCheck, Key, FileCheck, Maximize2, Layers, Image as ImageIcon, Box, RefreshCw, ChevronDown, ChevronUp, History, Info, Monitor, Radio } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
}

const Account: React.FC<AccountProps> = ({ user, orders, tickets, products, hubs, language, onUpdateStatus, onRequestAuth, onLogout, onSound }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'tickets' | 'hub-config'>('overview');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const isB2B = user.role === 'B2B_Admin';
  const isStandard = user.role === 'Utilizador_Standard';
  const isAdmin = user.role === 'Administrador';
  const myHub = hubs.find(h => h.id === user.managedHubId);

  const kpis = useMemo(() => {
    return {
      totalVolume: orders.reduce((acc, o) => acc + parseFloat(o.value), 0),
      completed: orders.filter(o => o.status === 'Concluído').length,
      pending: orders.filter(o => o.status !== 'Concluído').length,
      activeTickets: tickets.filter(t => t.status !== 'Resolvido').length,
      averageProgress: orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.progress, 0) / orders.length) : 0
    };
  }, [orders, tickets]);

  const generatePDF = (order: ProductionJob) => {
    onSound?.('sync');
    const doc = new jsPDF();
    doc.setFillColor(204, 0, 0); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
    doc.text("REDLINE R2 PRO", 20, 30);
    doc.setFontSize(10); doc.text("CERTIFICADO DE CONFORMIDADE INDUSTRIAL R2 v4.2", 20, 40);
    doc.setTextColor(0); doc.setFontSize(14);
    doc.text(`JOB ID: ${order.id}`, 20, 70);
    doc.text(`CLIENTE: ${order.client}`, 20, 80);
    doc.text(`PRODUTO: ${order.product}`, 20, 90);
    doc.text(`STATUS: ${order.status}`, 20, 100);
    doc.text(`VALOR: €${order.value}`, 20, 110);
    doc.text(`DATA: ${new Date(order.timestamp).toLocaleDateString()}`, 20, 120);
    doc.save(`REDLINE_CERT_${order.id}.pdf`);
    onSound?.('success');
  };

  const downloadAsset = (order: ProductionJob) => {
    onSound?.('sync');
    if (order.attachmentUrl) {
       const link = document.createElement('a');
       link.href = order.attachmentUrl;
       link.download = order.fileName || 'asset_r2.pdf';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       onSound?.('success');
    } else {
       alert("Simulação: Ficheiro original solicitado ao cluster REDLINE.");
       onSound?.('success');
    }
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
                 {isB2B && <span className="text-[11px] font-black uppercase text-gray-300 italic tracking-[0.2em]">HUB: {myHub?.name}</span>}
                 {isStandard && <span className="text-[11px] font-black uppercase text-gray-300 italic tracking-[0.2em]">Tier: {user.tier} Client</span>}
              </div>
           </div>
        </div>
        <div className="flex flex-wrap space-x-4 bg-gray-50 p-3 rounded-[3rem] border border-gray-100 shadow-inner">
           {['overview', 'production', 'tickets', 'hub-config'].filter(tab => {
             if (isStandard && (tab === 'hub-config')) return false;
             if (isB2B && tab === 'hub-config') return true;
             return true;
           }).map(tab => (
             <button key={tab} onClick={() => { onSound?.('click'); setActiveTab(tab as any); }} className={`px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}>{tab}</button>
           ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-10">
           {isStandard ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white border-2 border-gray-50 p-12 rounded-[4.5rem] shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Package className="w-24 h-24" /></div>
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-10">Encomendas Ativas</span>
                   <span className="text-7xl font-brand font-black italic block mb-4">{orders.length}</span>
                </div>
                <div className="bg-white border-2 border-gray-50 p-12 rounded-[4.5rem] shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="w-24 h-24" /></div>
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-10">Handshake Progress</span>
                   <span className="text-7xl font-brand font-black italic block mb-4 text-red-600">{kpis.averageProgress}%</span>
                </div>
                <div className="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 industrial-grid opacity-5" />
                   <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-10">Protocolo Tier</span>
                   <span className="text-5xl font-brand font-black italic block mb-4">{user.tier}</span>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 industrial-grid opacity-5" />
                   <TrendingUp className="w-12 h-12 text-red-600 mb-10" />
                   <span className="text-6xl font-brand font-black italic block mb-4">€{kpis.totalVolume.toLocaleString()}</span>
                   <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Master Volume</span>
                </div>
                <div className="bg-white border border-gray-100 p-12 rounded-[4.5rem] shadow-sm hover:shadow-2xl transition-all">
                   <Box className="w-12 h-12 text-red-600 mb-10" />
                   <span className="text-6xl font-brand font-black italic block mb-4">{kpis.completed}</span>
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Jobs Concluídos</span>
                </div>
                <div className="bg-white border border-gray-100 p-12 rounded-[4.5rem] shadow-sm hover:shadow-2xl transition-all">
                   <Zap className="w-12 h-12 text-red-600 mb-10" />
                   <span className="text-6xl font-brand font-black italic block mb-4">{kpis.averageProgress}%</span>
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Throughput Médio</span>
                </div>
                <div className="bg-white border border-gray-100 p-12 rounded-[4.5rem] shadow-sm hover:shadow-2xl transition-all">
                   <MessageSquare className="w-12 h-12 text-red-600 mb-10" />
                   <span className="text-6xl font-brand font-black italic block mb-4">{kpis.activeTickets}</span>
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Protocolos Abertos</span>
                </div>
             </div>
           )}
           
           <div className="bg-gray-50 p-12 rounded-[5rem] border border-gray-100 shadow-inner flex items-center justify-between">
              <div className="flex items-center space-x-6">
                 <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                 <span className="text-[12px] font-black uppercase text-gray-600 tracking-widest italic">Sincronização de Telemetria Industrial Ativa: {new Date().toLocaleTimeString()}</span>
              </div>
              <button onClick={() => { onSound?.('sync'); }} className="p-4 bg-white rounded-full text-black hover:bg-black hover:text-white transition-all shadow-md"><RefreshCw className="w-5 h-5"/></button>
           </div>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="space-y-12 animate-in fade-in">
           <div className="flex justify-between items-end mb-16">
              <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Job <br/><span className="text-red-600">{isStandard ? 'Orders.' : 'Inventory.'}</span></h3>
              {isStandard && (
                <div className="flex items-center space-x-4 bg-gray-50 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Monitor className="w-4 h-4 mr-2" /> Live Tracking Active
                </div>
              )}
           </div>
           
           <div className="space-y-8">
              {orders.length > 0 ? orders.map(o => (
                <div key={o.id} className={`bg-white rounded-[4.5rem] border transition-all duration-500 overflow-hidden shadow-xl ${expandedOrder === o.id ? 'border-black ring-4 ring-black/5' : 'border-gray-100 hover:border-red-600/30'}`}>
                   <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                      <div className="flex-grow">
                         <div className="flex items-center space-x-8 mb-6">
                            <span className="text-4xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                            <div className="flex items-center space-x-3 bg-red-50 text-red-600 px-6 py-2 rounded-full border border-red-100">
                               <Activity className="w-4 h-4 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{o.status.replace('_', ' ')}</span>
                            </div>
                            <div className="hidden lg:flex items-center space-x-3 text-gray-300">
                               <Clock className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{new Date(o.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-[11px] font-black uppercase text-gray-400 italic">
                            <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Cliente</span><span className="text-black">{o.client}</span></div>
                            <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Módulo Produto</span><span className="text-black">{o.product}</span></div>
                            <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Nodo Industrial</span><span className="text-red-600">{o.nodeId || 'PENDING CLUSTER'}</span></div>
                            <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Valor Ativo</span><span className="text-black font-brand">€{o.value}</span></div>
                         </div>
                      </div>
                      <div className="flex space-x-4">
                         <button onClick={() => { onSound?.('click'); setExpandedOrder(expandedOrder === o.id ? null : o.id); }} className={`p-8 rounded-full transition-all duration-500 shadow-xl ${expandedOrder === o.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-black hover:text-white'}`}>
                            {expandedOrder === o.id ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
                         </button>
                         <button onClick={() => generatePDF(o)} className="p-8 bg-gray-50 text-black rounded-full hover:bg-black hover:text-white transition-all shadow-xl">
                            <FileText className="w-8 h-8" />
                         </button>
                         {isB2B && o.status === 'Aprovado' && (
                            <button onClick={() => onUpdateStatus(o.id, 'Em Produção')} className="bg-black text-white px-12 py-6 rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-xl">Iniciar Produção</button>
                         )}
                         {isB2B && o.status === 'Em Produção' && (
                            <button onClick={() => onUpdateStatus(o.id, 'Concluído')} className="bg-green-600 text-white px-12 py-6 rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-black transition-all shadow-xl">Finalizar Job</button>
                         )}
                      </div>
                   </div>

                   {expandedOrder === o.id && (
                      <div className="p-16 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-6 duration-700">
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            <div className="lg:col-span-4 space-y-10">
                               <h6 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center border-l-4 border-red-600 pl-4">
                                  <Zap className="w-4 h-4 mr-3" /> Protocolo Técnico
                               </h6>
                               <div className="space-y-5 bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
                                  <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                     <span className="text-[9px] font-black uppercase text-gray-400">Substrato</span>
                                     <span className="text-[12px] font-black uppercase text-black">{o.material}</span>
                                  </div>
                                  <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                     <span className="text-[9px] font-black uppercase text-gray-400">Acabamento</span>
                                     <span className="text-[12px] font-black uppercase text-black">{o.finish}</span>
                                  </div>
                                  <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                     <span className="text-[9px] font-black uppercase text-gray-400">Dimensões</span>
                                     <span className="text-[12px] font-black uppercase text-black">{o.dimensions}</span>
                                  </div>
                                  <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                     <span className="text-[9px] font-black uppercase text-gray-400">Volumetria</span>
                                     <span className="text-[12px] font-black uppercase text-black">{o.quantity} UN</span>
                                  </div>
                                  <button onClick={() => downloadAsset(o)} className="mt-4 w-full p-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-4 hover:bg-black transition-all shadow-xl">
                                     <Download className="w-5 h-5" /> <span>Download Asset R2</span>
                                  </button>
                               </div>
                            </div>
                            <div className="lg:col-span-8 space-y-10">
                               <h6 className="text-[11px] font-black uppercase text-black tracking-[0.5em] flex items-center border-l-4 border-black pl-4">
                                  <History className="w-4 h-4 mr-3" /> Transações Industriais
                               </h6>
                               <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 min-h-[150px]">
                                  <div className="space-y-6">
                                     {o.history?.map((log, idx) => (
                                        <div key={idx} className="flex gap-6">
                                           <div className="flex flex-col items-center">
                                              <div className="w-3 h-3 rounded-full bg-red-600 border-4 border-white ring-2 ring-red-600" />
                                              {idx !== o.history.length - 1 && <div className="w-[2px] flex-grow bg-gray-100" />}
                                           </div>
                                           <div className="pb-6">
                                              <div className="flex items-center space-x-4 mb-1">
                                                 <span className="text-[10px] font-black uppercase text-black">{log.status.replace('_', ' ')}</span>
                                                 <span className="text-[8px] font-mono text-gray-300 bg-gray-50 px-3 py-0.5 rounded-full">{new Date(log.timestamp).toLocaleString()}</span>
                                              </div>
                                              <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed uppercase tracking-widest">{log.note}</p>
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>
              )) : (
                <div className="py-40 text-center space-y-8 opacity-20">
                  <Radio className="w-20 h-20 mx-auto animate-pulse" />
                  <p className="text-4xl font-brand font-black italic uppercase">Zero Ativos no Grid.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Account;
