
import React, { useState } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, HubRegistrationRequest } from '../types';
// Added Cpu to the imports
import { 
  ShieldAlert, ShieldCheck, Zap, X, Eye, Plus, Server, Activity, BarChart3, Clock, Check, Users, Key, Package, Globe, Mail, Lock, Trash2, Award, UserPlus, Cpu
} from 'lucide-react';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  users: User[];
  user?: User | null;
  products: ExtendedProduct[];
  hubRequests: HubRegistrationRequest[];
  onUpdateStatus: (id: string, s: any) => void;
  onApproveProduct: (id: string) => void;
  onApproveUser: (id: string) => void;
  onApproveHub: (id: string) => void;
  onRegisterUser: (u: User) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, hubRequests,
  onUpdateStatus, onApproveProduct, onApproveUser, onApproveHub, onRegisterUser 
}) => {
  const [activeView, setActiveView] = useState<'orders' | 'hubs' | 'users' | 'approvals'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<ProductionJob | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Cliente' as any });

  const isAdmin = user?.role === 'Administrador';
  if (!isAdmin) return (
    <div className="p-40 text-center industrial-grid h-[80vh] flex flex-col items-center justify-center">
      <ShieldAlert className="w-20 h-20 mx-auto text-red-600 mb-10"/>
      <h2 className="text-5xl font-brand font-black italic uppercase">Terminal Restrito</h2>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] mt-4">Acesso Exclusivo a Administradores Master</p>
    </div>
  );

  const pendingProds = products.filter(p => p.status === 'Aguardando Aprovação');
  const pendingUsers = users.filter(u => u.status === 'Pendente');
  const pendingHubs = hubRequests.filter(h => h.status === 'Pendente');

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-12 pb-24 industrial-grid animate-in fade-in">
      {/* HEADER COMMAND CENTER */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-16 gap-10">
        <div>
          <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Torre de <br/><span className="text-red-600">Controlo.</span></h2>
          <div className="flex items-center space-x-4 mt-8">
             <div className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl">
               <ShieldCheck className="w-4 h-4 mr-3 text-red-600" /> MASTER ADMIN ACTIVE
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap bg-white p-2 rounded-[2.5rem] shadow-2xl border border-gray-100 gap-2">
           {[
             { id: 'orders', label: 'Matriz Ordens' },
             { id: 'hubs', label: 'Gestão Hubs' },
             { id: 'users', label: 'Utilizadores' },
             { id: 'approvals', label: 'Aprovações' }
           ].map(v => (
             <button key={v.id} onClick={() => setActiveView(v.id as any)} className={`px-10 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${activeView === v.id ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                {v.label} 
                {(v.id === 'approvals' && (pendingProds.length + pendingUsers.length + pendingHubs.length) > 0) && (
                  <span className="ml-3 bg-red-600 px-2 py-0.5 rounded-full text-[8px] animate-pulse">
                    {pendingProds.length + pendingUsers.length + pendingHubs.length}
                  </span>
                )}
             </button>
           ))}
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col justify-between"><BarChart3 className="w-10 h-10 text-red-600 mb-8" /><span className="text-7xl font-brand font-black italic leading-none">{orders.length}</span><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Volume Grid</span></div>
        <div className="bg-black text-white p-12 rounded-[3.5rem] border-b-[15px] border-red-600 flex flex-col justify-between"><Users className="w-10 h-10 text-red-600 mb-8" /><span className="text-7xl font-brand font-black italic leading-none">{users.length}</span><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Entidades</span></div>
        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col justify-between"><Globe className="w-10 h-10 text-red-600 mb-8" /><span className="text-7xl font-brand font-black italic leading-none">{hubs.length}</span><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Nodos Ativos</span></div>
        <div className="bg-red-600 text-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col justify-between"><Zap className="w-10 h-10 text-white mb-8" /><span className="text-5xl font-brand font-black italic leading-none">MASTER</span><span className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-2">Sync Realtime</span></div>
      </div>

      {/* APPROVALS VIEW */}
      {activeView === 'approvals' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-10">
           {/* PRODUCT APPROVALS */}
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100">
              <h3 className="text-4xl font-brand font-black italic uppercase mb-10">Produtos <span className="text-red-600">Pendentes</span> ({pendingProds.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pendingProds.map(p => (
                  <div key={p.id} className="p-10 bg-gray-50 rounded-[3rem] flex items-center justify-between border border-gray-100 group hover:border-black transition-all">
                     <div className="flex items-center space-x-6">
                        <img src={p.image} className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                        <div>
                          <h5 className="font-brand font-black italic text-2xl uppercase leading-none mb-2">{p.name}</h5>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Injetado por Hub: {p.ownerHubId}</span>
                        </div>
                     </div>
                     <button onClick={() => onApproveProduct(p.id)} className="bg-green-600 text-white p-5 rounded-2xl hover:bg-black transition-all shadow-xl"><Check className="w-7 h-7"/></button>
                  </div>
                ))}
                {pendingProds.length === 0 && <p className="text-gray-300 font-black uppercase text-[10px] p-10 text-center italic tracking-widest">Sem ativos para validação.</p>}
              </div>
           </div>

           {/* HUB REGISTRATIONS */}
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100">
              <h3 className="text-4xl font-brand font-black italic uppercase mb-10">Novas <span className="text-red-600">Candidaturas Hub</span> ({pendingHubs.length})</h3>
              <div className="space-y-6">
                {pendingHubs.map(h => (
                  <div key={h.id} className="p-10 bg-gray-50 rounded-[3rem] flex items-center justify-between border border-gray-100">
                     <div className="max-w-2xl">
                        <h5 className="font-brand font-black italic text-3xl uppercase leading-none mb-3">{h.companyName}</h5>
                        <p className="text-[11px] font-bold text-gray-400 uppercase italic mb-4">{h.location} // {h.email}</p>
                        <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                           <span className="text-[8px] font-black text-gray-300 uppercase block mb-2">Parque de Máquinas</span>
                           <p className="text-[11px] font-mono leading-relaxed">{h.machinePark}</p>
                        </div>
                     </div>
                     <div className="flex space-x-4">
                        <button onClick={() => onApproveHub(h.id)} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center space-x-3"><Server className="w-5 h-5"/> <span>Certificar Nodo</span></button>
                        <button className="bg-white p-5 rounded-2xl text-gray-300 border border-gray-100 hover:text-red-600"><X className="w-8 h-8"/></button>
                     </div>
                  </div>
                ))}
                {pendingHubs.length === 0 && <p className="text-gray-300 font-black uppercase text-[10px] p-10 text-center italic tracking-widest">Nenhuma candidatura pendente.</p>}
              </div>
           </div>

           {/* USER APPROVALS */}
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100">
              <h3 className="text-4xl font-brand font-black italic uppercase mb-10">Contas <span className="text-red-600">Aguardando Validação</span> ({pendingUsers.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pendingUsers.map(u => (
                  <div key={u.id} className="p-10 bg-gray-50 rounded-[3rem] flex items-center justify-between border border-gray-100">
                     <div>
                        <h5 className="font-brand font-black italic text-2xl uppercase mb-2">{u.name}</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase italic">{u.email}</p>
                     </div>
                     <button onClick={() => onApproveUser(u.id)} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all">Autorizar Acesso</button>
                  </div>
                ))}
                {pendingUsers.length === 0 && <p className="text-gray-300 font-black uppercase text-[10px] p-10 text-center italic tracking-widest">Todos os utilizadores ativos.</p>}
              </div>
           </div>
        </div>
      )}

      {/* USERS LIST VIEW */}
      {activeView === 'users' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 animate-in fade-in">
           <div className="flex justify-between items-center mb-16">
              <h3 className="text-4xl font-brand font-black italic uppercase">Matriz de <span className="text-red-600">Entidades.</span></h3>
              <button onClick={() => setShowAddUser(true)} className="bg-black text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center space-x-3">
                <UserPlus className="w-5 h-5"/> <span>Novo Master User</span>
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {users.map(u => (
                <div key={u.id} className="bg-gray-50 p-10 rounded-[4rem] border border-gray-100 flex flex-col justify-between group hover:border-black transition-all">
                   <div>
                      <div className="flex justify-between items-start mb-10">
                         <div className="w-16 h-16 bg-black text-white rounded-[1.5rem] flex items-center justify-center font-brand font-black italic text-2xl shadow-xl">{u.name.charAt(0)}</div>
                         <div className="flex flex-col items-end">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 ${u.role === 'Administrador' ? 'bg-red-600 text-white' : 'bg-white text-black border border-gray-200'}`}>{u.role}</span>
                            <span className={`text-[8px] font-black uppercase ${u.status === 'Ativo' ? 'text-green-500' : 'text-orange-500 animate-pulse'}`}>{u.status}</span>
                         </div>
                      </div>
                      <h5 className="text-2xl font-brand font-black italic uppercase tracking-tighter mb-2 text-black leading-none">{u.name}</h5>
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-10 italic">{u.email}</p>
                      
                      {/* ADMIN-ONLY CREDENTIALS VIEW */}
                      <div className="bg-white p-6 rounded-3xl border border-gray-200 font-mono text-[10px] space-y-3 shadow-inner">
                         <div className="flex justify-between items-center">
                            <span className="opacity-40 uppercase">Acesso:</span>
                            <span className="font-bold text-black">{u.id}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="opacity-40 uppercase">Password:</span>
                            <span className="font-bold text-red-600">{u.password || '********'}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between pt-10 mt-10 border-t border-gray-100">
                      <div className="flex items-center space-x-3 text-black">
                         <Award className="w-5 h-5 text-red-600" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{u.tier} Tier</span>
                      </div>
                      <button className="p-4 bg-white text-gray-300 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-5 h-5"/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* HUBS LIST VIEW */}
      {activeView === 'hubs' && (
        <div className="p-16 animate-in fade-in bg-white rounded-[4rem] shadow-2xl border border-gray-100">
           <div className="mb-16">
              <h3 className="text-4xl font-brand font-black italic uppercase leading-none tracking-tighter text-black">Células <span className="text-red-600">Industriais.</span></h3>
              <p className="text-[12px] font-black text-gray-400 uppercase mt-2 tracking-[0.4em]">Gestão de telemetria e calibração por nodo</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {hubs.map(hub => (
                <div key={hub.id} className="bg-gray-50 rounded-[4rem] overflow-hidden border border-gray-100 group hover:border-red-600 transition-all shadow-sm hover:shadow-2xl">
                   <div className="relative aspect-video">
                      <img src={hub.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" />
                      <div className={`absolute bottom-6 right-6 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-2xl ${hub.status === 'Online' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}> {hub.status} </div>
                   </div>
                   <div className="p-12">
                      <h4 className="text-3xl font-brand font-black italic uppercase mb-2 leading-none text-black">{hub.name}</h4>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-10">{hub.location} // {hub.id}</span>
                      
                      <div className="mb-10 p-6 bg-black rounded-3xl text-white font-mono text-[9px] space-y-2">
                         <div className="flex justify-between"><span>LOGIN:</span> <span>{hub.id.toLowerCase()}@redline.eu</span></div>
                         <div className="flex justify-between text-red-600"><span>PASS:</span> <span>{hub.tempPassword || 'MASTER'}</span></div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-200">
                         <div className="space-y-2">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Capacidade</span>
                            <span className="text-3xl font-brand font-black italic text-black">{hub.capacity}%</span>
                         </div>
                         <div className="space-y-2 text-right">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Latência</span>
                            <span className="text-3xl font-brand font-black italic text-red-600">{hub.latency}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ORDERS LIST VIEW */}
      {activeView === 'orders' && (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in">
          <div className="p-12 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
             <h3 className="text-3xl font-brand font-black italic uppercase text-black tracking-tighter">Matriz de Produção Global</h3>
             <div className="flex items-center space-x-4 bg-green-50 text-green-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-green-100">
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse mr-2" />
                <span>Transmissão Industrial Síncrona</span>
             </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white text-[11px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-12 py-10">Job ID</th>
                <th className="px-8 py-10">Cliente</th>
                <th className="px-8 py-10">Nodo / Hub</th>
                <th className="px-8 py-10">Estado R2</th>
                <th className="px-12 py-10 text-right">Telemetria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="group hover:bg-gray-50 transition-all">
                  <td className="px-12 py-12 font-brand font-black italic text-2xl uppercase">{o.id}</td>
                  <td className="px-8 py-12">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black uppercase">{o.client}</span>
                      <span className="text-[9px] text-gray-400">ID: {o.clientId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-12">
                    <span className="text-[11px] font-black uppercase text-red-600 tracking-widest">{o.nodeId}</span>
                  </td>
                  <td className="px-8 py-12">
                    <select 
                      value={o.status} 
                      onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                      className="bg-white border-2 border-gray-100 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600 transition-all"
                    >
                      {['Pendente Aprovação Hub', 'Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição', 'Entregue'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-12 py-12 text-right">
                    <button onClick={() => setSelectedOrder(o)} className="p-5 bg-gray-100 rounded-3xl hover:bg-black hover:text-white transition-all"><Eye className="w-6 h-6"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-16 border-[12px] border-red-600">
              <h3 className="text-4xl font-brand font-black italic uppercase text-black leading-none mb-12">Novo <br/><span className="text-red-600">Master R2.</span></h3>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                onRegisterUser({ ...newUser, id: `USR-${Date.now()}`, status: 'Ativo', tier: 'Bronze', joinedAt: Date.now(), permissions: newUser.role === 'Administrador' ? ['ACCESS_ADMIN_PANEL', 'MANAGE_USERS', 'MANAGE_HUBS'] : ['VIEW_ORDERS', 'PLACE_ORDERS'] } as any); 
                setShowAddUser(false); 
              }} className="space-y-8">
                 <div className="relative"><Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" /><input type="text" placeholder="NOME COMPLETO" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" /><input type="email" placeholder="EMAIL DE ACESSO" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" /><input type="text" placeholder="PASSWORD MASTER" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all">
                    <option value="Cliente">Utilizador Comum</option>
                    <option value="B2B_Admin">Administrador Hub (B2B)</option>
                    <option value="Administrador">Super Administrador (Master)</option>
                 </select>
                 <div className="flex space-x-4 pt-6"><button type="submit" className="flex-grow bg-black text-white p-8 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-2xl">Confirmar Protocolo</button><button onClick={() => setShowAddUser(false)} type="button" className="bg-gray-100 p-8 rounded-[2rem] text-black"><X className="w-8 h-8"/></button></div>
              </form>
           </div>
        </div>
      )}

      {/* ORDER TELEMETRY MODAL */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
             <div className="bg-white w-full max-w-5xl rounded-[5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95">
                <div className="w-full md:w-[400px] bg-black text-white p-16 flex flex-col justify-between border-r-[20px] border-red-600 shadow-2xl">
                    <div>
                      <Cpu className="w-14 h-14 text-red-600 mb-12 animate-pulse" />
                      <h4 className="text-5xl font-brand font-black italic uppercase tracking-tighter mb-10 leading-[0.9]">Módulo de <br /> Telemetria.</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 leading-loose italic">Status Ativo via Hub {selectedOrder.nodeId}. <br/> Protocolo Redline R2 Industrial.</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="flex items-center space-x-6 text-[11px] font-black uppercase tracking-[0.6em] hover:text-red-600 transition-all mt-20 group">
                       <X className="w-8 h-8 group-hover:rotate-90 transition-transform" /> <span>Fechar Terminal</span>
                    </button>
                </div>
                <div className="flex-grow p-20 industrial-grid overflow-y-auto max-h-[85vh]">
                    <div className="mb-16">
                       <h3 className="text-6xl font-brand font-black italic uppercase tracking-tighter leading-none text-black mb-6">{selectedOrder.product}</h3>
                       <span className="text-5xl font-brand font-black italic text-red-600">EUR {selectedOrder.value}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-10 mb-16">
                       <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-inner">
                          <span className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-[0.3em]">Material Utilizado</span>
                          <p className="text-[13px] font-black uppercase leading-relaxed text-gray-700 italic">{selectedOrder.material || 'Standard Industrial'}</p>
                       </div>
                       <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-inner">
                          <span className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-[0.3em]">Volume Industrial</span>
                          <p className="text-[13px] font-black uppercase leading-relaxed text-gray-700 italic">{selectedOrder.quantity || '1'} Unidades</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em]">
                          <span className="text-gray-400">Progresso de Chão de Fábrica</span>
                          <span className="text-red-600 font-brand italic">{selectedOrder.status}</span>
                       </div>
                       <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
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

export default Backoffice;
