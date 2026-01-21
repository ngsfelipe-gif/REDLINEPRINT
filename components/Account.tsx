
import React, { useState } from 'react';
import { User as UserType, ProductionJob, SupportTicket, Notification, TeamMember, UserRole } from '../types';
import { 
  Activity, Zap, ShieldCheck, Eye, X, ChevronRight, Cpu, ArrowRight, Mail, Inbox, CornerDownRight, Printer, LogOut, Check, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface AccountProps {
  user: UserType;
  orders: ProductionJob[];
  tickets: SupportTicket[];
  notifications: Notification[];
  onAddTicket: (ticket: SupportTicket) => void;
  subTab: string;
  setSubTab: (tab: string) => void;
  onLogout: () => void;
  onApproveOrder: (orderId: string) => void;
}

const Account: React.FC<AccountProps> = ({ user, orders, tickets, notifications, subTab, setSubTab, onLogout, onApproveOrder }) => {
  const isB2B = user.role.startsWith('B2B') || user.role === 'Administrador';
  const canApprove = user.permissions.includes('APPROVE_BUDGETS');
  const [selectedOrder, setSelectedOrder] = useState<ProductionJob | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Notification | null>(null);
  
  const filteredOrders = user.role === 'Administrador' ? orders : orders.filter(o => o.client === user.name || (isB2B && (o.client.includes('SpaceX') || o.client.includes('Tesla'))));
  const pendingApprovals = filteredOrders.filter(o => o.status === 'Orçamento Gerado');

  const statusStages: ProductionJob['status'][] = ['Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição', 'Entregue'];

  const getStatusProgress = (status: string) => {
    const idx = statusStages.indexOf(status as any);
    return ((idx + 1) / statusStages.length) * 100;
  };

  const tabs = ['overview', 'orders', 'inbox'];
  if (canApprove) tabs.push('approvals');
  tabs.push('settings');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 animate-in fade-in duration-700 industrial-grid">
      {/* Header Profissional */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
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

        <div className="flex bg-gray-100 p-1 rounded-xl space-x-1 flex-wrap justify-center overflow-x-auto">
           {tabs.map(tab => (
             <button 
               key={tab}
               onClick={() => setSubTab(tab)}
               className={`px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${subTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-white'}`}
             >
               {tab === 'approvals' && pendingApprovals.length > 0 ? `Aprovações (${pendingApprovals.length})` : tab}
             </button>
           ))}
           <button onClick={onLogout} className="px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 flex items-center space-x-2 transition-all">
             <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Logout</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           {subTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-black text-white p-8 rounded-3xl shadow-2xl flex flex-col justify-between min-h-[180px]">
                    <Activity className="w-8 h-8 text-red-600" />
                    <div>
                      <span className="text-5xl font-brand font-black italic block leading-none mb-1">{filteredOrders.length}</span>
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Ativos em Node R2</span>
                    </div>
                 </div>
                 <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-md flex flex-col justify-between min-h-[180px]">
                    <Cpu className="w-8 h-8 text-red-600" />
                    <div>
                      <span className="text-5xl font-brand font-black italic block leading-none mb-1">0.4<span className="text-lg">ms</span></span>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Sincronização</span>
                    </div>
                 </div>
                 <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-md flex flex-col justify-between min-h-[180px]">
                    <ShieldCheck className="w-8 h-8 text-red-600" />
                    <div>
                      <span className="text-3xl font-brand font-black italic block uppercase mb-1">{user.tier} RANK</span>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nível de Membro</span>
                    </div>
                 </div>
              </div>
           )}

           {subTab === 'orders' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-end mb-4">
                    <h3 className="text-2xl font-brand font-black italic uppercase tracking-tighter leading-none">Pipeline de <span className="text-red-600">Produção.</span></h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Telemetry FRA-R2</span>
                 </div>
                 
                 {filteredOrders.length === 0 ? (
                   <div className="p-20 bg-gray-50 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                     <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sem encomendas ativas no cluster.</p>
                   </div>
                 ) : (
                   filteredOrders.map((o, i) => (
                     <div key={i} className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm hover:border-red-600 transition-all group relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                           <div className="flex items-center space-x-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-brand font-black italic text-2xl shadow-xl ${o.status === 'Impressão' ? 'bg-red-600 text-white status-pulse' : 'bg-black text-white'}`}>
                                 {o.id.slice(-1)}
                              </div>
                              <div>
                                 <h5 className="text-xl font-brand font-black italic uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">{o.product}</h5>
                                 <div className="flex items-center space-x-4">
                                    <span className="text-[8px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-widest">{o.id}</span>
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{o.quantity} unidades</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center space-x-6 w-full md:w-auto justify-between">
                              <div className="text-right">
                                 <span className="text-2xl font-brand font-black italic block">€{o.value}</span>
                              </div>
                              <button onClick={() => setSelectedOrder(o)} className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"><Eye className="w-5 h-5"/></button>
                           </div>
                        </div>

                        {/* Tracker Visual Superior de 6 Estágios */}
                        <div className="relative pt-6 pb-2">
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2"></div>
                          <div className="absolute top-1/2 left-0 h-0.5 bg-red-600 -translate-y-1/2 transition-all duration-[1.5s] ease-in-out" style={{ width: `${getStatusProgress(o.status)}%` }}></div>
                          <div className="flex justify-between relative z-10">
                            {statusStages.map((stage, idx) => {
                              const isPast = statusStages.indexOf(o.status as any) >= idx;
                              const isCurrent = o.status === stage;
                              return (
                                <div key={stage} className="flex flex-col items-center group/step">
                                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${isPast ? 'bg-red-600 border-red-600 scale-125' : 'bg-white border-gray-200'} ${isCurrent ? 'status-pulse shadow-lg' : ''}`}>
                                    {isPast && !isCurrent && <Check className="w-2.5 h-2.5 text-white mx-auto mt-0.5" />}
                                  </div>
                                  <span className={`text-[7px] font-black uppercase mt-3 tracking-tighter text-center max-w-[60px] leading-tight transition-opacity ${isCurrent ? 'opacity-100 text-red-600' : 'opacity-20 text-gray-400 group-hover/step:opacity-50'}`}>{stage}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           )}

           {subTab === 'approvals' && (
             <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                   <div className="bg-red-600 p-4 rounded-2xl shadow-xl"><ShieldCheck className="w-6 h-6 text-white"/></div>
                   <div>
                      <h3 className="text-2xl font-brand font-black italic uppercase tracking-tighter leading-none">Governança <span className="text-red-600">B2B.</span></h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Autorização de Orçamentos Pendentes</p>
                   </div>
                </div>
                {pendingApprovals.length === 0 ? (
                  <div className="p-20 bg-gray-50 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                    {/* Add missing CheckCircle2 import to lucide-react list above */}
                    <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nenhuma transação aguarda aprovação.</p>
                  </div>
                ) : (
                  pendingApprovals.map((o, i) => (
                    <div key={i} className="bg-white border-2 border-black p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 animate-in slide-in-from-bottom-6">
                       <div className="flex-grow">
                          <span className="text-[8px] font-black uppercase text-red-600 tracking-[0.3em] block mb-2">Requisição de Compra</span>
                          <h4 className="text-3xl font-brand font-black italic uppercase leading-none">{o.product}</h4>
                          <div className="flex items-center space-x-4 mt-4">
                             <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Aguarda Aprovação de {user.name}</span>
                             </div>
                             <span className="text-[9px] font-black text-black bg-gray-50 px-3 py-1 rounded uppercase tracking-widest">Ref: {o.id}</span>
                          </div>
                       </div>
                       <div className="flex items-center space-x-8 w-full md:w-auto">
                          <div className="text-right">
                             <span className="text-4xl font-brand font-black italic">€{o.value}</span>
                          </div>
                          <div className="flex flex-col space-y-2">
                             <button onClick={() => onApproveOrder(o.id)} className="px-10 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center space-x-3">
                               <Check className="w-4 h-4" /> <span>Validar</span>
                             </button>
                             <button className="px-10 py-3 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-all">Rejeitar</button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
           )}

           {subTab === 'inbox' && (
              <div className="space-y-4">
                 <div className="mb-6 flex justify-between items-center">
                   <h3 className="text-2xl font-brand font-black italic uppercase tracking-tighter">Terminal <span className="text-red-600">Inbox.</span></h3>
                   <Inbox className="w-8 h-8 text-red-600 opacity-20" />
                 </div>
                 <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="bg-gray-50 p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                         <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Sem comunicações criptografadas.</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} onClick={() => setSelectedEmail(n)} className={`p-6 rounded-2xl cursor-pointer transition-all border-l-8 flex items-center justify-between group ${!n.read ? 'bg-white border-red-600 shadow-xl' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                           <div className="flex items-center space-x-6">
                              <div className={`p-4 rounded-xl ${!n.read ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                                 <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                 <h5 className="text-sm font-brand font-black italic uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">{n.title}</h5>
                                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{n.orderId} // {new Date(n.timestamp).toLocaleTimeString()}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-5 h-5 text-gray-200 group-hover:translate-x-2 transition-transform" />
                        </div>
                      ))
                    )}
                 </div>
              </div>
           )}
        </div>

        {/* Sidebar Informativa */}
        <div className="lg:col-span-4 space-y-6">
           {isB2B && (
             <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-b-[12px] border-red-600">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
                <Zap className="w-10 h-10 text-red-600 mb-8 animate-pulse" />
                <h4 className="text-2xl font-brand font-black italic uppercase tracking-tighter mb-4 leading-tight">Crédito <br /> Corporativo.</h4>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-white/10 pb-3">
                      <span className="text-gray-500">Plafond Disponível</span>
                      <span>€{user.creditLimit?.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-gray-500">Utilização Node</span>
                      <span className="text-red-600">12%</span>
                   </div>
                </div>
                <button className="w-full py-4 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Pedir Extensão</button>
             </div>
           )}

           <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
              <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-6 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-3" /> Telemetria de Segurança
              </h5>
              <div className="space-y-6">
                 <div className="flex items-start space-x-4">
                    <div className="w-1 h-1 bg-red-600 rounded-full mt-2" />
                    <div>
                       <p className="text-[9px] font-black uppercase text-black leading-none mb-1">ISO 12647-2</p>
                       <span className="text-[7px] font-bold text-gray-300 uppercase">Perfil de Cor Sincronizado</span>
                    </div>
                 </div>
                 <div className="flex items-start space-x-4">
                    <div className="w-1 h-1 bg-red-600 rounded-full mt-2" />
                    <div>
                       <p className="text-[9px] font-black uppercase text-black leading-none mb-1">Asset Validation</p>
                       <span className="text-[7px] font-bold text-gray-300 uppercase">Pre-flight Molecular Ativo</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modais de Detalhe */}
      {selectedEmail && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative border-b-[20px] border-red-600 flex flex-col">
              <div className="bg-black text-white p-8 border-b-4 border-red-600 flex justify-between items-center">
                 <div className="flex items-center space-x-4">
                    <Mail className="w-6 h-6 text-red-600" />
                    <span className="text-xl font-brand font-black italic uppercase">Terminal de Comunicação</span>
                 </div>
                 <button onClick={() => setSelectedEmail(null)} className="p-3 hover:bg-red-600 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-12">
                 <div className="flex items-start space-x-6 mb-10">
                    <CornerDownRight className="w-10 h-10 text-red-600 flex-shrink-0 mt-2" />
                    <div>
                       <h4 className="text-3xl font-brand font-black italic uppercase text-black mb-6 leading-none">{selectedEmail.title}</h4>
                       <p className="text-lg font-medium leading-relaxed text-gray-600 italic border-l-4 border-gray-100 pl-8">{selectedEmail.message}</p>
                    </div>
                 </div>
                 <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between items-center opacity-40">
                    <div className="flex items-center space-x-4">
                       <ShieldCheck className="w-5 h-5" />
                       <span className="text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted via Node R2</span>
                    </div>
                    <Printer className="w-5 h-5" />
                 </div>
              </div>
           </div>
        </div>
      )}

      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95">
                <div className="w-full md:w-[350px] bg-black text-white p-12 flex flex-col justify-between border-r-[15px] border-red-600">
                    <div>
                      <Cpu className="w-10 h-10 text-red-600 mb-10" />
                      <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-8 leading-none">Dados do <br /> Módulo.</h4>
                      <div className="space-y-4 text-[9px] font-black uppercase tracking-widest opacity-50">
                         <p>Transmissão: {selectedOrder.id}</p>
                         <p>Node Origem: FRA-R2</p>
                         <p>Sync TS: {new Date(selectedOrder.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="mt-12 flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] hover:text-red-600 transition-all">
                       <X className="w-6 h-6" /> <span>Fechar</span>
                    </button>
                </div>
                <div className="flex-grow p-16 industrial-grid">
                    <div className="flex justify-between items-start mb-12">
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none text-huge">{selectedOrder.product}</h3>
                       <span className="text-4xl font-brand font-black italic text-black">€{selectedOrder.value}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-12">
                       <div className="bg-gray-50 p-8 rounded-3xl">
                          <span className="text-[8px] font-black uppercase text-gray-400 block mb-2">Material Industrial</span>
                          <p className="text-sm font-brand font-black italic uppercase">{selectedOrder.material || 'Standard Industrial'}</p>
                       </div>
                       <div className="bg-gray-50 p-8 rounded-3xl">
                          <span className="text-[8px] font-black uppercase text-gray-400 block mb-2">Estado Produção</span>
                          <p className="text-sm font-brand font-black italic uppercase text-red-600">{selectedOrder.status}</p>
                       </div>
                    </div>

                    <div className="flex items-center space-x-6 pt-10 border-t border-gray-100">
                       <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 shimmer transition-all duration-1000" style={{ width: `${getStatusProgress(selectedOrder.status)}%` }} />
                       </div>
                       <span className="text-xl font-brand font-black italic">{getStatusProgress(selectedOrder.status)}%</span>
                    </div>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Account;
