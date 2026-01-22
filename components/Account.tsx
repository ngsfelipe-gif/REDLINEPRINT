
import React, { useState } from 'react';
import { User as UserType, ProductionJob, SupportTicket, Notification } from '../types';
import { 
  Activity, Zap, ShieldCheck, Eye, X, Cpu, LogOut, Send, Download, FileText, FileCheck, Plus, Inbox, Clock, AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface AccountProps {
  user: UserType;
  orders: ProductionJob[];
  tickets: SupportTicket[];
  notifications: Notification[];
  onAddMessage: (ticketId: string, text: string) => void;
  onCreateTicket: (ticket: SupportTicket) => void;
  subTab: string;
  setSubTab: (tab: string) => void;
  onLogout: () => void;
  onApproveOrder: (orderId: string) => void;
}

const Account: React.FC<AccountProps> = ({ 
  user, orders, tickets, notifications, onAddMessage, onCreateTicket,
  subTab, setSubTab, onLogout, onApproveOrder 
}) => {
  const [selectedOrder, setSelectedOrder] = useState<ProductionJob | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const isAdmin = user.role === 'Administrador';
  const myOrders = isAdmin ? orders : orders.filter(o => o.clientId === user.id);
  const myTickets = isAdmin ? tickets : tickets.filter(t => t.creatorId === user.id);
  const deliveredOrders = myOrders.filter(o => o.status === 'Entregue');

  const handleGenerateInvoice = (order: ProductionJob) => {
    const doc = new jsPDF();
    const invoiceId = `REDLINE-FAT-${order.id}-${Date.now().toString().slice(-4)}`;
    
    // Design Industrial Fatura
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text('REDLINE PRINT', 20, 35);
    doc.setFontSize(9);
    doc.text(`INDUSTRIAL INVOICE // PROOF OF PRODUCTION // REF: ${invoiceId}`, 20, 48);

    doc.setTextColor(10, 10, 10);
    doc.setFontSize(10);
    doc.text('EMISSOR:', 20, 80);
    doc.setFontSize(9);
    doc.text('Redline Systems industrial cluster FRA-01', 20, 86);
    doc.text('Frankfurt-on-Main, Germany', 20, 91);
    
    doc.setFontSize(10);
    doc.text('CLIENTE:', 120, 80);
    doc.setFontSize(9);
    doc.text(order.client, 120, 86);
    doc.text(`ID: ${order.clientId}`, 120, 91);

    doc.setFillColor(245, 245, 247);
    doc.rect(15, 110, 180, 12, 'F');
    doc.setFontSize(9);
    doc.text('DESCRIÇÃO TÉCNICA', 20, 117.5);
    doc.text('VOLUME', 140, 117.5);
    doc.text('TOTAL EUR', 170, 117.5);

    doc.text(order.product, 20, 135);
    doc.text(order.quantity || '1', 140, 135);
    doc.text(`${order.value}`, 170, 135);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Material: ${order.material || 'Standard Industrial'}`, 20, 142);
    doc.text(`Node Hub: ${order.nodeId}`, 20, 147);

    doc.setTextColor(180, 180, 180);
    doc.text(`R2-HASH: ${btoa(order.id).slice(0, 20)}`, 20, 275);
    doc.text('Documento gerado automaticamente pelo Ecossistema REDLINE R2.', 20, 280);

    doc.save(`${invoiceId}.pdf`);
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !replyText.trim()) return;
    onAddMessage(selectedTicket.id, replyText);
    setReplyText('');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 industrial-grid animate-in fade-in duration-700">
      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-10 lg:p-16 mb-16 flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="flex items-center space-x-8">
           <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center font-brand text-4xl font-black italic text-white shadow-2xl border-b-[8px] border-red-600">
             {user.name.charAt(0)}
           </div>
           <div>
              <h2 className="text-5xl md:text-6xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">{user.name}</h2>
              <div className="flex items-center space-x-4 mt-3">
                 <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">{user.role}</span>
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {user.id}</span>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap bg-gray-50 p-2 rounded-[2.5rem] gap-2 shadow-inner border border-gray-100">
           {['overview', 'orders', 'inbox', 'financeiro'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setSubTab(tab)}
               className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${subTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black hover:bg-white'}`}
             >
               {tab}
             </button>
           ))}
           <button onClick={onLogout} className="px-6 py-4 text-gray-400 hover:text-red-600 transition-all"><LogOut className="w-6 h-6"/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-12">
           {subTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6">
                 <div className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl border-b-[15px] border-red-600 hover:scale-[1.02] transition-transform">
                    <Activity className="w-12 h-12 text-red-600 mb-10" />
                    <span className="text-7xl font-brand font-black italic block leading-none mb-2">{myOrders.length}</span>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Pedidos na Rede</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all">
                    <Zap className="w-12 h-12 text-red-600 mb-10" />
                    <span className="text-7xl font-brand font-black italic block leading-none mb-2">{deliveredOrders.length}</span>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em]">Concluídos R2</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all">
                    <ShieldCheck className="w-12 h-12 text-red-600 mb-10" />
                    <span className="text-4xl font-brand font-black italic block leading-none uppercase mb-2">{user.tier} RANK</span>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em]">Auth Tier</span>
                 </div>
              </div>
           )}

           {subTab === 'orders' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-6">
                 {myOrders.map(order => (
                   <div key={order.id} className="bg-white border border-gray-100 p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:border-red-600 transition-all group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                         <div className="flex items-center space-x-8">
                            <div className="w-16 h-16 bg-black text-white rounded-[1.5rem] flex items-center justify-center font-brand font-black italic text-2xl group-hover:bg-red-600 transition-colors">
                               {order.id.slice(-1)}
                            </div>
                            <div>
                               <h5 className="text-3xl font-brand font-black italic uppercase leading-none mb-1 text-black">{order.product}</h5>
                               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Ordem: {order.id} // Node: {order.nodeId}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-[11px] font-black text-red-600 uppercase tracking-widest block mb-2">{order.status}</span>
                            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-red-600 shimmer transition-all duration-1000" style={{ width: `${order.progress}%` }} />
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                         <span className="text-3xl font-brand font-black italic text-black">€{order.value}</span>
                         <div className="flex space-x-4">
                            {order.status === 'Entregue' && (
                              <button onClick={() => handleGenerateInvoice(order)} className="flex items-center space-x-3 bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl">
                                <Download className="w-4 h-4" /> <span>PDF</span>
                              </button>
                            )}
                            <button onClick={() => setSelectedOrder(order)} className="p-4 bg-gray-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Eye className="w-5 h-5"/></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           )}

           {subTab === 'inbox' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px] animate-in slide-in-from-bottom-6">
                 <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[3.5rem] overflow-y-auto p-8 space-y-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                       <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600">Terminal de Suporte</h4>
                       <Plus className="w-6 h-6 text-gray-200 cursor-pointer hover:text-black transition-all" />
                    </div>
                    {myTickets.map(ticket => (
                      <div 
                         key={ticket.id} 
                         onClick={() => setSelectedTicket(ticket)}
                         className={`p-8 rounded-[2.5rem] cursor-pointer transition-all border-l-[12px] ${selectedTicket?.id === ticket.id ? 'bg-black text-white border-red-600 shadow-2xl scale-105' : 'bg-gray-50 border-gray-100 hover:border-black'}`}
                      >
                         <h5 className="text-[12px] font-black uppercase tracking-widest mb-2 line-clamp-1">{ticket.subject}</h5>
                         <div className="flex justify-between items-center">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${selectedTicket?.id === ticket.id ? 'text-red-600' : 'text-gray-400'}`}>{ticket.status}</span>
                            <span className="text-[8px] font-mono opacity-40">{new Date(ticket.timestamp).toLocaleDateString()}</span>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[3.5rem] flex flex-col overflow-hidden shadow-2xl">
                    {selectedTicket ? (
                      <>
                         <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <div>
                               <h4 className="text-xl font-brand font-black italic uppercase leading-none mb-1 text-black">{selectedTicket.subject}</h4>
                               <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.5em]">{selectedTicket.category} // {selectedTicket.id}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                               <Clock className="w-4 h-4 text-gray-300" />
                               <span className="text-[8px] font-black uppercase text-gray-400">Live Sync Ready</span>
                            </div>
                         </div>
                         <div className="flex-grow overflow-y-auto p-10 space-y-8 industrial-grid">
                            {selectedTicket.messages.map(msg => (
                              <div key={msg.id} className={`flex flex-col ${msg.authorId === user.id ? 'items-end' : 'items-start'}`}>
                                 <div className={`max-w-[85%] p-6 rounded-[2rem] text-[11px] font-bold uppercase leading-relaxed tracking-wider shadow-lg ${msg.authorId === user.id ? 'bg-red-600 text-white rounded-tr-none' : 'bg-black text-white rounded-tl-none'}`}>
                                    {msg.text}
                                 </div>
                                 <span className="text-[8px] font-black text-gray-300 mt-3 uppercase tracking-widest">{msg.authorName} // {new Date(msg.timestamp).toLocaleTimeString()}</span>
                              </div>
                            ))}
                         </div>
                         <div className="p-8 border-t border-gray-100 bg-white">
                            <div className="flex space-x-4">
                               <input 
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                  placeholder="INSERIR RESPOSTA TÉCNICA..." 
                                  className="flex-grow bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-inner" 
                               />
                               <button onClick={handleSendMessage} className="bg-black text-white p-5 rounded-2xl hover:bg-red-600 transition-all shadow-xl">
                                  <Send className="w-6 h-6" />
                               </button>
                            </div>
                         </div>
                      </>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-20 opacity-10">
                         <Inbox className="w-32 h-32 mb-8" />
                         <p className="text-[12px] font-black uppercase tracking-[1em]">Selecione um Ticket</p>
                      </div>
                    )}
                 </div>
              </div>
           )}

           {subTab === 'financeiro' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-100 p-12 rounded-[3.5rem] shadow-sm flex flex-col justify-between">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] block mb-4">Volume Faturado</span>
                       <span className="text-6xl font-brand font-black italic">€{(myOrders.reduce((acc, o) => acc + parseFloat(o.value), 0)).toLocaleString()}</span>
                    </div>
                    <div className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col justify-between border-b-[15px] border-red-600">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] block mb-4">Crédito Disponível</span>
                       <span className="text-6xl font-brand font-black italic text-red-600">€15,0k</span>
                    </div>
                 </div>

                 <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl overflow-hidden">
                    <div className="p-10 border-b border-gray-50">
                       <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600">Arquivo Fiscal Automático</h4>
                    </div>
                    <div className="divide-y divide-gray-50">
                       {deliveredOrders.length === 0 ? (
                         <div className="p-32 text-center opacity-10">
                            <FileText className="w-24 h-24 mx-auto mb-6" />
                            <p className="text-[12px] font-black uppercase tracking-[1em]">Sem Documentos</p>
                         </div>
                       ) : (
                         deliveredOrders.map(o => (
                           <div key={o.id} className="p-10 flex items-center justify-between group hover:bg-gray-50 transition-all">
                              <div className="flex items-center space-x-10">
                                 <div className="p-6 bg-gray-100 rounded-3xl text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                                    <FileCheck className="w-8 h-8" />
                                 </div>
                                 <div>
                                    <h5 className="text-[14px] font-black uppercase tracking-widest text-black">FATURA_{o.id}</h5>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mt-1">{new Date(o.timestamp).toLocaleDateString()} // Node: {o.nodeId}</span>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-12">
                                 <span className="text-2xl font-brand font-black italic text-black">€{o.value}</span>
                                 <button onClick={() => handleGenerateInvoice(o)} className="flex items-center space-x-3 text-[10px] font-black uppercase text-red-600 hover:text-black tracking-[0.3em] transition-all bg-red-50 px-6 py-3 rounded-2xl group border border-red-100">
                                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> <span>PDF</span>
                                 </button>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </div>
           )}
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border-b-[20px] border-red-600 animate-in slide-in-from-right-10">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck className="w-32 h-32" />
              </div>
              <Cpu className="w-12 h-12 text-red-600 mb-12" />
              <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-10 leading-tight text-white">Status da <br /> Identidade.</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-white/10 pb-6">
                    <span className="text-gray-600">Hub Local</span>
                    <span className="text-red-600">FRA-MASTER</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-white/10 pb-6">
                    <span className="text-gray-600">Status Sync</span>
                    <span className="text-green-500">Opt-in Active</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-gray-600">Rank Industrial</span>
                    <span className="text-white">TOP Tier 1%</span>
                 </div>
              </div>
              <button className="w-full mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Relatório Detalhado</button>
           </div>

           <div className="bg-white border border-gray-100 p-12 rounded-[4rem] shadow-xl animate-in slide-in-from-right-10 delay-200">
              <div className="flex items-center space-x-4 mb-8">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-black">Alertas R2</h5>
              </div>
              {notifications.slice(0, 3).map(n => (
                <div key={n.id} className="mb-6 pb-6 border-b border-gray-50 last:border-0 last:mb-0">
                  <span className="text-[8px] font-black text-red-600 uppercase tracking-widest block mb-1">{n.title}</span>
                  <p className="text-[10px] font-medium text-gray-400 line-clamp-2 italic">{n.message}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL DETALHE ORDEM */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95">
                <div className="w-full md:w-[350px] bg-black text-white p-12 flex flex-col justify-between border-r-[15px] border-red-600">
                    <div>
                      <Cpu className="w-10 h-10 text-red-600 mb-10" />
                      <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-8 leading-none">Dados do <br /> Módulo.</h4>
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Transmissão Ativa via Hub {selectedOrder.nodeId}.</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] hover:text-red-600 transition-all">
                       <X className="w-6 h-6" /> <span>Fechar Terminal</span>
                    </button>
                </div>
                <div className="flex-grow p-16 industrial-grid overflow-y-auto max-h-[85vh]">
                    <div className="mb-12">
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none text-black mb-4">{selectedOrder.product}</h3>
                       <span className="text-4xl font-brand font-black italic text-red-600">€{selectedOrder.value}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-12">
                       <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                          <span className="text-[8px] font-black uppercase text-gray-400 block mb-2">Especificação Técnica</span>
                          <p className="text-[11px] font-black uppercase leading-relaxed text-gray-600">{selectedOrder.material || 'N/A'}</p>
                       </div>
                       <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                          <span className="text-[8px] font-black uppercase text-gray-400 block mb-2">Volume / Unidade</span>
                          <p className="text-[11px] font-black uppercase leading-relaxed text-gray-600">{selectedOrder.quantity || '1'} Unid.</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span>Status de Produção</span>
                          <span className="text-red-600">{selectedOrder.status}</span>
                       </div>
                       <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 shimmer transition-all duration-1000" style={{ width: `${selectedOrder.progress}%` }} />
                       </div>
                    </div>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Account;
