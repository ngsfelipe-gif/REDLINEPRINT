
import React, { useState } from 'react';
import { User, ProductionJob, ExtendedProduct, PartnerNode, Language, SupportTicket, AuthorizationRequest } from '../types';
import { TRANSLATIONS } from '../translations';
import { Activity, Zap, TrendingUp, Package, Clock, ShieldAlert, Download, Edit2, CheckCircle2, X, FileText, Settings, BarChart3, ListChecks, MessageSquare, Trash2, ShieldCheck, Key, FileCheck, Maximize2, Layers } from 'lucide-react';
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
}

const Account: React.FC<AccountProps> = ({ user, orders, tickets, products, hubs, language, onUpdateStatus, onRequestAuth, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'tickets' | 'hub-config'>('overview');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const t = TRANSLATIONS[language];

  const isB2B = user.role === 'B2B_Admin';
  const myHub = hubs.find(h => h.id === user.managedHubId);
  
  const totalEarnings = orders.reduce((acc, o) => acc + parseFloat(o.value), 0);

  const handleDeleteProduct = (productId: string) => {
    onRequestAuth({
      type: 'DELETE_PRODUCT',
      requesterId: user.id,
      requesterName: user.name,
      targetId: productId,
      details: `Solicitação de remoção permanente do ativo ${productId} do grid.`
    });
  };

  const generatePDF = (order: ProductionJob) => {
    const doc = new jsPDF();
    doc.setFillColor(204, 0, 0); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
    doc.text("REDLINE R2 PRO", 20, 30);
    doc.setFontSize(10); doc.text("CERTIFICADO DE CONFORMIDADE INDUSTRIAL R2 v4.2", 20, 40);
    doc.setTextColor(0); doc.setFontSize(14);
    doc.text(`JOB ID: ${order.id}`, 20, 70);
    doc.text(`CLIENTE: ${order.client} (ID: ${order.clientId})`, 20, 80);
    doc.text(`PRODUTO: ${order.product}`, 20, 90);
    doc.text(`VALOR: €${order.value}`, 20, 100);
    doc.text(`NODE DE PRODUÇÃO: ${order.nodeId}`, 20, 110);
    doc.text(`DIMENSÕES: ${order.dimensions || 'N/A'}`, 20, 120);
    doc.text(`MATERIAL: ${order.material}`, 20, 130);
    doc.save(`REDLINE_CERT_${order.id}.pdf`);
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
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}>{tab}</button>
           ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10">
           <div className="bg-black text-white p-16 rounded-[4.5rem] shadow-2xl border-b-[20px] border-red-600 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute inset-0 industrial-grid opacity-5" />
              <TrendingUp className="w-16 h-16 text-red-600 mb-16 relative z-10" />
              <span className="text-8xl font-brand font-black italic block mb-6 relative z-10">€{totalEarnings.toLocaleString()}</span>
              <span className="text-[12px] font-black uppercase text-gray-500 tracking-[0.5em] relative z-10">Volume Grid Transacionado</span>
           </div>
           <div className="bg-white border border-gray-100 p-16 rounded-[4.5rem] shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all">
              <Package className="w-16 h-16 text-red-600 mb-16" />
              <span className="text-8xl font-brand font-black italic block mb-6">{orders.length}</span>
              <span className="text-[12px] font-black uppercase text-gray-400 tracking-[0.5em]">Ativos em Manufatura</span>
           </div>
           <div className="bg-white border border-gray-100 p-16 rounded-[4.5rem] shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all">
              <MessageSquare className="w-16 h-16 text-red-600 mb-16" />
              <span className="text-8xl font-brand font-black italic block mb-6">{tickets.length}</span>
              <span className="text-[12px] font-black uppercase text-gray-400 tracking-[0.5em]">Protocolos de Suporte</span>
           </div>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="space-y-16 animate-in fade-in">
           <div className="flex justify-between items-end">
              <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Produção <br/><span className="text-red-600">e Manufatura.</span></h3>
              <div className="bg-gray-50 px-8 py-4 rounded-3xl text-[12px] font-black uppercase italic text-gray-400 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-3 text-red-600" /> Sincronização Master Ativa
              </div>
           </div>
           <div className="grid grid-cols-1 gap-10">
              {orders.length > 0 ? orders.map(o => (
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
                         <div><span className="block text-gray-300 mb-2">Tamanho</span>{o.dimensions || `${o.width}x${o.height}${o.unit}`}</div>
                         <div><span className="block text-gray-300 mb-2">Node Destino</span>{o.nodeId}</div>
                         <div><span className="block text-gray-300 mb-2">Valor Ativo</span>€{o.value}</div>
                      </div>
                      {o.fileName && (
                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl w-fit border border-gray-100 shadow-inner">
                           <FileCheck className="w-4 h-4 text-red-600" />
                           <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Asset: {o.fileName}</span>
                        </div>
                      )}
                   </div>
                   <div className="flex space-x-4">
                      <button onClick={() => setSelectedJobId(selectedJobId === o.id ? null : o.id)} className="p-10 bg-gray-100 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-xl">
                        <ListChecks className="w-8 h-8"/>
                      </button>
                      <button onClick={() => generatePDF(o)} className="p-10 bg-gray-50 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-xl"><Download className="w-8 h-8"/></button>
                      
                      {isB2B && o.status !== 'Concluído' && (
                        <button 
                          onClick={() => onUpdateStatus(o.id, o.status === 'Aprovado' ? 'Em Produção' : 'Concluído', undefined, `Fase de produção atualizada pelo operador ${user.name}.`)}
                          className="bg-black text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-xl"
                        >
                           {o.status === 'Aprovado' ? 'Iniciar Produção' : 'Finalizar Job'}
                        </button>
                      )}
                   </div>

                   {selectedJobId === o.id && (
                     <div className="w-full mt-10 p-10 bg-gray-50 rounded-[3rem] animate-in slide-in-from-top-4">
                        <h6 className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-6 border-b border-gray-200 pb-4 flex items-center">
                          <Clock className="w-4 h-4 mr-3" /> Audit Trail do Ativo R2
                        </h6>
                        <div className="space-y-6">
                           {o.history.map((h, idx) => (
                             <div key={idx} className="flex justify-between items-start text-[11px]">
                                <div><span className="font-black uppercase text-black block">{h.status}</span><span className="text-gray-400 italic">{h.note}</span></div>
                                <div className="text-right"><span className="text-gray-400 block">{new Date(h.timestamp).toLocaleString()}</span><span className="font-black text-red-600 uppercase text-[9px]">{h.author}</span></div>
                             </div>
                           ))}
                        </div>
                        {o.observations && (
                          <div className="mt-8 p-8 bg-white rounded-[2rem] border border-gray-100 space-y-4">
                             <div className="flex items-center space-x-3 text-red-600">
                                <Maximize2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Especificações de Engenharia:</span>
                             </div>
                             <p className="text-[12px] font-medium text-gray-600 italic leading-relaxed">{o.observations}</p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              )) : (
                <div className="p-40 text-center opacity-10 font-brand font-black text-8xl uppercase italic">Protocolo Vazio.</div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-16 animate-in fade-in">
           <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Protocolos de <br/><span className="text-red-600">Suporte Sync.</span></h3>
           <div className="grid grid-cols-1 gap-10">
              {tickets.length > 0 ? tickets.map(t => (
                <div key={t.id} className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-12 group hover:border-red-600 transition-all">
                   <div className="flex-grow space-y-4">
                      <div className="flex items-center space-x-8">
                         <h5 className="text-3xl font-brand font-black italic uppercase text-black">{t.subject}</h5>
                         <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${t.status === 'Resolvido' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                           {t.status}
                         </span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">{t.messages[0].text}</p>
                   </div>
                   <button className="bg-black text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-xl">Visualizar Conversa</button>
                </div>
              )) : (
                <div className="p-40 text-center opacity-10 font-brand font-black text-8xl uppercase italic">Nenhum Ticket Ativo.</div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'hub-config' && isB2B && (
         <div className="space-y-12 animate-in fade-in">
            <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Configuração do <br/><span className="text-red-600">Ativo Industrial.</span></h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {products.filter(p => p.ownerHubId === user.managedHubId).map(p => (
                 <div key={p.id} className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl flex items-center justify-between group hover:border-black transition-all">
                    <div className="flex items-center space-x-8">
                       <img src={p.image} className="w-24 h-24 object-cover rounded-[2rem] grayscale group-hover:grayscale-0 transition-all" />
                       <div>
                          <span className="text-2xl font-brand font-black italic uppercase text-black block leading-none">{p.name}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 block">Rate: €{p.basePrice}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-6 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg flex items-center space-x-3 group"
                    >
                       <Key className="w-5 h-5" /> <span className="text-[9px] font-black uppercase tracking-widest">Pedir Remoção</span>
                    </button>
                 </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default Account;
