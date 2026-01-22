
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key } from 'lucide-react';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  users: User[];
  user: User | null;
  products: ExtendedProduct[];
  hubRequests: HubRegistrationRequest[];
  authRequests: AuthorizationRequest[];
  language: Language;
  onUpdateStatus: (orderId: string, status: ProductionJob['status'], nodeId?: string) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onApproveHub: (requestId: string) => void;
  onApproveAuth: (authId: string) => void;
  onImpersonate: (user: User) => void;
  onCreateUser: (u: User) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, hubRequests, authRequests, language, onUpdateStatus, onUpdateUser, onApproveHub, onApproveAuth, onImpersonate, onCreateUser
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'finance'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingApprovals = orders.filter(o => o.status === 'Aguardando Aprovação');
  const pendingUsers = users.filter(u => u.status === 'Pendente');
  const pendingAuths = authRequests.filter(r => r.status === 'Pendente');

  const liveEvents = useMemo(() => {
    const events = orders.flatMap(o => o.history.map(h => ({ ...h, orderId: o.id, productName: o.product })));
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [orders]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in flex flex-col lg:flex-row gap-12">
      <div className="flex-grow">
        <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-16">
          <div>
            <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Master <br/><span className="text-red-600">Control.</span></h2>
            <div className="flex items-center space-x-6 mt-10">
               <div className="bg-black text-white px-8 py-4 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center shadow-2xl border-l-8 border-red-600">
                 <ShieldCheck className="w-5 h-5 mr-4 text-red-600" /> ADMIN SESSION: <span className="text-green-500 ml-2">VERIFIED</span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100 gap-3">
             {['approvals', 'orders', 'hubs', 'users', 'finance'].map(v => (
               <button key={v} onClick={() => setActiveView(v as any)} className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeView === v ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {v} {(v === 'approvals' && (pendingApprovals.length + hubRequests.length + pendingUsers.length + pendingAuths.length) > 0) && <span className="ml-3 bg-red-600 px-3 py-1 rounded-full text-[9px] animate-bounce text-white">{pendingApprovals.length + hubRequests.length + pendingUsers.length + pendingAuths.length}</span>}
               </button>
             ))}
          </div>
        </div>

        {activeView === 'approvals' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-10">
             {/* SOLICITAÇÕES DE AUTORIZAÇÃO MASTER */}
             {pendingAuths.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase">Autorizações <span className="text-red-600">Críticas.</span></h3>
                  <div className="grid grid-cols-1 gap-6">
                     {pendingAuths.map(req => (
                       <div key={req.id} className="bg-white p-12 rounded-[4rem] flex justify-between items-center shadow-2xl border-l-[15px] border-red-600">
                          <div className="flex items-center space-x-8">
                             <div className="p-6 bg-red-50 text-red-600 rounded-3xl"><Key className="w-8 h-8"/></div>
                             <div>
                                <span className="text-2xl font-brand font-black italic uppercase text-black block">{req.type}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Solicitado por {req.requesterName} // Alvo: {req.targetId}</span>
                                <p className="mt-2 text-[10px] text-gray-500 uppercase italic font-bold">{req.details}</p>
                             </div>
                          </div>
                          <button onClick={() => onApproveAuth(req.id)} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-green-600 transition-all">Conceder Autorização</button>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {hubRequests.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase">Candidaturas de <span className="text-red-600">HUB Grid.</span></h3>
                  <div className="grid grid-cols-1 gap-6">
                     {hubRequests.map(req => (
                       <div key={req.id} className="bg-black text-white p-12 rounded-[4rem] flex justify-between items-center shadow-2xl border-l-[15px] border-orange-500">
                          <div>
                             <span className="text-4xl font-brand font-black italic uppercase block">{req.companyName}</span>
                             <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{req.location} // {req.email}</span>
                             <p className="mt-4 text-[10px] text-gray-500 uppercase italic font-bold max-w-lg">{req.machinePark}</p>
                          </div>
                          <button onClick={() => onApproveHub(req.id)} className="bg-white text-black px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Aprovar Node</button>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {pendingUsers.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase">Utilizadores em <span className="text-red-600">Quarentena.</span></h3>
                  <div className="grid grid-cols-1 gap-6">
                     {pendingUsers.map(u => (
                       <div key={u.id} className="bg-white p-10 rounded-[4rem] border border-gray-100 flex justify-between items-center shadow-xl">
                          <div className="flex items-center space-x-8">
                             <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center font-brand font-black italic text-2xl">{u.name[0]}</div>
                             <div>
                                <span className="text-2xl font-brand font-black italic uppercase text-black block">{u.name}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.email} // Role: {u.role}</span>
                             </div>
                          </div>
                          <button onClick={() => onUpdateUser(u.id, { status: 'Ativo' })} className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all">Validar Acesso</button>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             <h3 className="text-4xl font-brand font-black italic uppercase">Fila de <span className="text-red-600">Produção Master.</span></h3>
             <div className="grid grid-cols-1 gap-8">
                {pendingApprovals.length > 0 ? pendingApprovals.map(o => (
                  <div key={o.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl flex justify-between items-center group hover:border-red-600 transition-all">
                     <div className="flex-grow">
                        <div className="flex items-center space-x-6 mb-4">
                           <span className="text-4xl font-brand font-black italic text-black uppercase">{o.id}</span>
                           <span className="px-5 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">{o.product}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-10 text-[11px] font-black uppercase text-gray-400 italic">
                           <div><span className="block text-gray-300 mb-1">Cliente</span>{o.client}</div>
                           <div><span className="block text-gray-300 mb-1">Dimensões</span>{o.width}x{o.height}{o.unit}</div>
                           <div><span className="block text-gray-300 mb-1">Material</span>{o.material}</div>
                           <div><span className="block text-gray-300 mb-1">Ficheiro</span>{o.fileName}</div>
                        </div>
                     </div>
                     <div className="flex items-center space-x-6">
                        <select className="bg-gray-50 border-2 border-gray-100 p-5 rounded-3xl text-[11px] font-black uppercase outline-none" id={`hub-${o.id}`}>
                           <option value="">HUB...</option>
                           {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <button onClick={() => {
                          const h = (document.getElementById(`hub-${o.id}`) as HTMLSelectElement).value;
                          if(h) onUpdateStatus(o.id, 'Aprovado', h);
                        }} className="bg-black text-white p-6 rounded-full hover:bg-green-600 transition-all shadow-xl"><CheckCircle2/></button>
                     </div>
                  </div>
                )) : (
                  <div className="p-32 text-center opacity-10 font-brand font-black text-7xl uppercase italic">Grid Sync Limpo.</div>
                )}
             </div>
          </div>
        )}

        {activeView === 'users' && (
           <div className="space-y-12 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-brand font-black italic uppercase">Gestão de <span className="text-red-600">Entidades Grid.</span></h3>
                <div className="flex items-center space-x-6 w-full max-w-md bg-white p-2 rounded-3xl border border-gray-100 shadow-xl">
                   <div className="p-4"><Search className="w-5 h-5 text-gray-300" /></div>
                   <input type="text" placeholder="PESQUISAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black uppercase text-[10px] tracking-widest" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {filteredUsers.map(u => (
                   <div key={u.id} className="bg-white p-8 rounded-[3rem] border border-gray-50 hover:border-black shadow-lg transition-all flex items-center justify-between">
                      <div className="flex items-center space-x-8">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-brand font-black italic text-2xl shadow-inner ${u.role === 'Administrador' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>{u.name[0]}</div>
                         <div>
                            <h5 className="text-xl font-brand font-black italic uppercase text-black">{u.name}</h5>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{u.email} // Role: {u.role}</p>
                            <span className={`text-[8px] font-black uppercase tracking-widest mt-2 block ${u.status === 'Ativo' ? 'text-green-500' : 'text-orange-500'}`}>{u.status}</span>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <button onClick={() => onImpersonate(u)} className="px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center space-x-3">
                            <ArrowUpRight className="w-4 h-4" /> <span>Shadow Login</span>
                         </button>
                         <button onClick={() => onUpdateUser(u.id, { status: u.status === 'Ativo' ? 'Bloqueado' : 'Ativo' })} className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all">
                            {u.status === 'Ativo' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      <div className="lg:w-[450px] space-y-8 pt-16">
         <div className="bg-black text-white p-12 rounded-[4rem] border-t-[15px] border-red-600 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 industrial-grid opacity-5" />
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center">
                    <Terminal className="w-5 h-5 mr-4 text-red-600" /> Audit Stream
                  </h4>
                  <div className="flex space-x-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  </div>
               </div>

               <div className="space-y-8 h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                  {liveEvents.map((ev, i) => (
                    <div key={i} className="border-l-2 border-red-600/30 pl-6 space-y-2 group hover:border-red-600 transition-all cursor-default">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">{ev.status}</span>
                          <span className="text-[8px] font-mono text-gray-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-[11px] font-bold text-gray-300 leading-relaxed uppercase tracking-tighter italic">
                         Job <span className="text-white">#{ev.orderId}</span> - {ev.productName}: <br/>
                         {ev.note}
                       </p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Backoffice;
