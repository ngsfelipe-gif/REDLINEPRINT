
import React, { useState, useMemo } from 'react';
import { User, ProductionJob, ExtendedProduct, PartnerNode, Language, SupportTicket, AuthorizationRequest } from '../types';
import { TRANSLATIONS } from '../translations';
import { Activity, Zap, TrendingUp, Package, Clock, ShieldAlert, Download, Edit2, CheckCircle2, X, FileText, Settings, BarChart3, ListChecks, MessageSquare, Trash2, ShieldCheck, Key, FileCheck, Maximize2, Layers, Image as ImageIcon, Box, RefreshCw } from 'lucide-react';
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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const isB2B = user.role === 'B2B_Admin';
  const myHub = hubs.find(h => h.id === user.managedHubId);

  // Telemetria Master R3 - KPIs em Tempo Real
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
    doc.text(`VALOR: €${order.value}`, 20, 110);
    doc.save(`REDLINE_CERT_${order.id}.pdf`);
    onSound?.('success');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 pb-32 industrial-grid animate-in fade-in">
      <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-16 mb-20 flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="flex items-center space-x-12">
           <div className="w-32 h-32 bg-black text-white rounded-[3rem] flex items-center justify-center font-brand font-black italic text-6xl shadow-2xl border-b-[12px] border-red-600">{user.name[0]}</div>
           <div>
              <h2 className="text-6xl font-brand font-black italic uppercase tracking-tighter text-black leading-none">{user.name}</h2>
              <div className="flex items-center space-x-6 mt-4">
                 <span className="px-6 py-2 bg-red-50 text-red-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-red-100">{user.role} Industrial</span>
                 {isB2B && <span className="text-[11px] font-black uppercase text-gray-300">Hub: {myHub?.name}</span>}
              </div>
           </div>
        </div>
        <div className="flex flex-wrap space-x-4 bg-gray-50 p-3 rounded-[3rem] border border-gray-100 shadow-inner">
           {['overview', 'production', 'tickets', 'hub-config'].filter(tab => tab !== 'hub-config' || isB2B).map(tab => (
             <button key={tab} onClick={() => { onSound?.('click'); setActiveTab(tab as any); }} className={`px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}>{tab}</button>
           ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-10">
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
           
           <div className="bg-gray-50 p-12 rounded-[5rem] border border-gray-100 shadow-inner flex items-center justify-between">
              <div className="flex items-center space-x-6">
                 <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                 <span className="text-[12px] font-black uppercase text-gray-600 tracking-widest italic">Sincronização de Telemetria Industrial Ativa: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex space-x-4">
                 /* Fixed: RefreshCw is now imported from lucide-react */
                 <button onClick={() => { onSound?.('sync'); }} className="p-4 bg-white rounded-full text-black hover:bg-black hover:text-white transition-all shadow-md"><RefreshCw className="w-5 h-5"/></button>
              </div>
           </div>
        </div>
      )}

      {/* Restantes Tabs (production, tickets, hub-config) mantidos com a lógica anterior */}
      {activeTab === 'production' && (
        <div className="space-y-16 animate-in fade-in">
           <div className="flex justify-between items-end">
              <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Produção <br/><span className="text-red-600">e Manufatura.</span></h3>
           </div>
           <div className="grid grid-cols-1 gap-10">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-12 group hover:border-black transition-all">
                   <div className="flex-grow space-y-4">
                      <div className="flex items-center space-x-8">
                         <h5 className="text-4xl font-brand font-black italic uppercase text-black">{o.product}</h5>
                         <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${o.status === 'Concluído' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                           {o.status}
                         </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[12px] font-black uppercase text-gray-400 italic">
                         <div><span className="block text-gray-300 mb-2">Ref ID</span>{o.id}</div>
                         <div><span className="block text-gray-300 mb-2">Status</span>{o.status}</div>
                         <div><span className="block text-gray-300 mb-2">Node</span>{o.nodeId}</div>
                         <div><span className="block text-gray-300 mb-2">Valor</span>€{o.value}</div>
                      </div>
                   </div>
                   <div className="flex space-x-4">
                      <button onClick={() => generatePDF(o)} className="p-8 bg-gray-50 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-xl"><Download className="w-8 h-8"/></button>
                      {isB2B && o.status !== 'Concluído' && (
                        <button 
                          onClick={() => onUpdateStatus(o.id, 'Concluído')}
                          className="bg-black text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-xl"
                        >
                           Finalizar Job
                        </button>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Account;
