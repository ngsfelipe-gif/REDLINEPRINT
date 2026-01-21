
import React, { useState } from 'react';
import { User as UserType, ProductionJob, SupportTicket, Notification, TicketMessage } from '../types';
import { 
  Activity, Zap, ShieldCheck, Eye, X, ChevronRight, Cpu, ArrowRight, Mail, Inbox, 
  CornerDownRight, Printer, LogOut, Check, Clock, AlertTriangle, CheckCircle2, 
  Send, Download, FileText, FileCheck, Plus
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
  const myOrders = isAdmin ? orders : orders.filter(o => o.clientId === user.id || o.client === user.name);
  const myTickets = isAdmin ? tickets : tickets.filter(t => t.creatorId === user.id);
  const pendingApprovals = myOrders.filter(o => o.status === 'Orçamento Gerado');
  const deliveredOrders = myOrders.filter(o => o.status === 'Entregue');

  const handleGenerateInvoice = (order: ProductionJob) => {
    const doc = new jsPDF();
    const invoiceId = `FAT-${order.id}-${Date.now().toString().slice(-4)}`;
    
    // Header Industrial
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('REDLINE PRINT', 20, 30);
    doc.setFontSize(8);
    doc.text(`FATURA COMERCIAL // HUB R2-SYNC // REF: ${invoiceId}`, 20, 40);

    // Detalhes Cliente/Emissor
    doc.setTextColor(10, 10, 10);
    doc.setFontSize(10);
    doc.text('EMISSOR:', 20, 70);
    doc.setFontSize(9);
    doc.text('Redline Systems Frankfurt GMBH', 20, 76);
    doc.text('Frankfurt-on-Main, DE', 20, 81);
    
    doc.setFontSize(10);
    doc.text('CLIENTE:', 120, 70);
    doc.setFontSize(9);
    doc.text(order.client, 120, 76);
    doc.text(`ID: ${order.clientId}`, 120, 81);

    // Tabela de Itens
    doc.setFillColor(245, 245, 247);
    doc.rect(15, 100, 180, 10, 'F');
    doc.setFontSize(8);
    doc.text('DESCRIÇÃO DO JOB', 20, 106.5);
    doc.text('QUANT', 120, 106.5);
    doc.text('TOTAL', 170, 106.5);

    doc.text(order.product, 20, 120);
    doc.text(order.quantity || '1', 120, 120);
    doc.text(`EUR ${order.value}`, 170, 120);

    // Footer & Hash
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    const hash = btoa(`${order.id}-${order.timestamp}`).slice(0, 24);
    doc.text(`CERTIFICADO DIGITAL R2: ${hash}`, 20, 270);
    doc.text('Documento gerado automaticamente pelo Ecossistema Redline Print.', 20, 275);

    doc.save(`${invoiceId}.pdf`);
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !replyText.trim()) return;
    onAddMessage(selectedTicket.id, replyText);
    setReplyText('');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 animate-in fade-in duration-700 industrial-grid">
      {/* Header Account */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center font-brand text-3xl font-black italic text-white shadow-xl border-b-4 border-red-600">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">
              {user.name}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{user.role} NODE</span>
              <span className="text-[9px] font-black uppercase text-gray-400">ID: {user.id}</span>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl space-x-1">
          {['overview', 'orders', 'approvals', 'inbox', 'financeiro'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setSubTab(tab)}
              className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${subTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-white'}`}
            >
              {tab === 'approvals' && pendingApprovals.length > 0 ? `Aprovações (${pendingApprovals.length})` : tab}
            </button>
          ))}
          <button onClick={onLogout} className="px-5 py-3 text-gray-400 hover:text-red-600 transition-all"><LogOut className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           {subTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <Activity className="w-10 h-10 text-red-600 mb-8" />
                    <span className="text-5xl font-brand font-black italic block leading-none mb-1">{myOrders.length}</span>
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Orders Ativos</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                    <Zap className="w-10 h-10 text-red-600 mb-8" />
                    <span className="text-5xl font-brand font-black italic block leading-none mb-1">{deliveredOrders.length}</span>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Jobs Concluídos</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                    <ShieldCheck className="w-10 h-10 text-red-600 mb-8" />
                    <span className="text-3xl font-brand font-black italic block leading-none uppercase mb-1">{user.tier} RANK</span>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Protocolo de Segurança</span>
                 </div>
              </div>
           )}

           {subTab === 'orders' && (
              <div className="space-y-6">
                 {myOrders.map(order => (
                   <div key={order.id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm group hover:border-red-600 transition-all">
                      <div className="flex justify-between items-center mb-8">
                         <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center font-brand font-black italic text-xl">{order.id.slice(-1)}</div>
                            <div>
                               <h5 className="text-xl font-brand font-black italic uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">{order.product}</h5>
                               <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Ref: {order.id} // TS: {new Date(order.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">{order.status}</span>
                            <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${order.progress}%` }} />
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                         <span className="text-lg font-brand font-black italic">€{order.value}</span>
                         <div className="flex space-x-3">
                            {order.status === 'Entregue' && (
                              <button onClick={() => handleGenerateInvoice(order)} className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                <Download className="w-3 h-3" /> <span>Fatura</span>
                              </button>
                            )}
                            <button onClick={() => setSelectedOrder(order)} className="p-3 bg-gray-50 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Eye className="w-4 h-4"/></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           )}

           {subTab === 'inbox' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
                {/* Tickets List */}
                <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[2.5rem] overflow-y-auto p-6 space-y-4">
                   <div className="flex justify-between items-center mb-4 px-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Suporte Técnico</h4>
                      <Plus className="w-4 h-4 text-gray-300 cursor-pointer hover:text-black" />
                   </div>
                   {myTickets.map(ticket => (
                     <div 
                        key={ticket.id} 
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-6 rounded-2xl cursor-pointer transition-all border-l-8 ${selectedTicket?.id === ticket.id ? 'bg-black text-white border-red-600 shadow-xl' : 'bg-gray-50 border-gray-200 hover:border-black'}`}
                     >
                        <h5 className="text-[10px] font-black uppercase tracking-widest mb-1 line-clamp-1">{ticket.subject}</h5>
                        <div className="flex justify-between items-center">
                           <span className="text-[7px] font-bold opacity-40 uppercase">{ticket.status}</span>
                           <span className="text-[7px] font-mono opacity-40">{new Date(ticket.timestamp).toLocaleDateString()}</span>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[2.5rem] flex flex-col overflow-hidden">
                   {selectedTicket ? (
                     <>
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                           <div>
                              <h4 className="text-sm font-brand font-black italic uppercase leading-none mb-1">{selectedTicket.subject}</h4>
                              <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">{selectedTicket.category} // {selectedTicket.id}</span>
                           </div>
                           <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${selectedTicket.status === 'Resolvido' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{selectedTicket.status}</div>
                        </div>
                        <div className="flex-grow overflow-y-auto p-8 space-y-6 industrial-grid">
                           {selectedTicket.messages.map(msg => (
                             <div key={msg.id} className={`flex flex-col ${msg.authorId === user.id ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-[10px] font-bold uppercase leading-relaxed ${msg.authorId === user.id ? 'bg-red-600 text-white rounded-tr-none' : 'bg-black text-white rounded-tl-none'}`}>
                                   {msg.text}
                                </div>
                                <span className="text-[7px] font-black text-gray-300 mt-2 uppercase tracking-widest">{msg.authorName} // {new Date(msg.timestamp).toLocaleTimeString()}</span>
                             </div>
                           ))}
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-white">
                           <div className="flex space-x-3">
                              <input 
                                 value={replyText}
                                 onChange={e => setReplyText(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                 placeholder="ENVIAR RESPOSTA AO TÉCNICO..." 
                                 className="flex-grow bg-gray-50 border border-transparent p-4 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-red-600" 
                              />
                              <button onClick={handleSendMessage} className="bg-black text-white p-4 rounded-xl hover:bg-red-600 transition-all"><Send className="w-5 h-5" /></button>
                           </div>
                        </div>
                     </>
                   ) : (
                     <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-20">
                        <Inbox className="w-16 h-16 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Selecione uma comunicação para abrir the terminal.</p>
                     </div>
                   )}
                </div>
             </div>
           )}

           {subTab === 'financeiro' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Total Faturado</span>
                      <span className="text-4xl font-brand font-black italic">€{(myOrders.reduce((acc, o) => acc + parseFloat(o.value), 0)).toLocaleString()}</span>
                   </div>
                   <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Faturas Disponíveis</span>
                      <span className="text-4xl font-brand font-black italic">{deliveredOrders.length}</span>
                   </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                   <div className="p-8 border-b border-gray-50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Documentação Fiscal</h4>
                   </div>
                   <div className="divide-y divide-gray-50">
                      {deliveredOrders.length === 0 ? (
                        <div className="p-20 text-center opacity-20">
                           <FileText className="w-12 h-12 mx-auto mb-4" />
                           <p className="text-[9px] font-black uppercase tracking-widest">Sem faturas emitidas no cluster.</p>
                        </div>
                      ) : (
                        deliveredOrders.map(o => (
                          <div key={o.id} className="p-8 flex items-center justify-between group hover:bg-gray-50 transition-all">
                             <div className="flex items-center space-x-6">
                                <div className="p-4 bg-gray-100 rounded-xl text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all"><FileCheck className="w-6 h-6" /></div>
                                <div>
                                   <h5 className="text-[11px] font-black uppercase tracking-widest">FATURA_{o.id}</h5>
                                   <span className="text-[8px] font-bold text-gray-400 uppercase">Ordem Concluída em {new Date(o.timestamp).toLocaleDateString()}</span>
                                </div>
                             </div>
                             <div className="flex items-center space-x-8">
                                <span className="text-sm font-brand font-black italic">€{o.value}</span>
                                <button onClick={() => handleGenerateInvoice(o)} className="flex items-center space-x-2 text-[8px] font-black uppercase text-red-600 hover:text-black tracking-[0.2em] transition-all">
                                   <Download className="w-4 h-4" /> <span>PDF</span>
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

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border-b-[15px] border-red-600">
              <Zap className="w-10 h-10 text-red-600 mb-8" />
              <h4 className="text-3xl font-brand font-black italic uppercase tracking-tighter mb-8 leading-none">Status do <br /> Perfil.</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-white/10 pb-4">
                    <span className="text-gray-500">Node Local</span>
                    <span>FRA-01</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-white/10 pb-4">
                    <span className="text-gray-500">Membro Desde</span>
                    <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-gray-500">Cotação R2</span>
                    <span className="text-red-600">Top 5%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modal Detalhe Ordem */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95">
                <div className="w-full md:w-[350px] bg-black text-white p-12 flex flex-col justify-between border-r-[15px] border-red-600">
                    <div>
                      <Cpu className="w-10 h-10 text-red-600 mb-10" />
                      <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-8 leading-none">Dados do <br /> Módulo.</h4>
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Transmissão Ativa via Node R2 Frankfurt-Lisboa.</p>
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
                          <span>Progressão de Produção</span>
                          <span>{selectedOrder.progress}%</span>
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
