
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { ShieldCheck, Zap, X, Eye, Server, Activity, BarChart3, Users, Globe, Trash2, Award, UserPlus, Cpu, RefreshCcw, TrendingUp, DollarSign, CheckCircle2, MoreHorizontal, Terminal, Lock, Unlock, Search, Filter, ShieldAlert, Mail } from 'lucide-react';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  users: User[];
  user: User | null;
  products: ExtendedProduct[];
  language: Language;
  onUpdateStatus: (orderId: string, status: ProductionJob['status'], nodeId?: string) => void;
  onCreateHub: (hub: PartnerNode) => void;
  onCreateUser: (u: User) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, language, onUpdateStatus, onCreateHub, onCreateUser, onUpdateUser
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'finance'>('approvals');
  const [showAddHub, setShowAddHub] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    tier: 'Bronze' as User['tier'],
    role: 'Cliente' as User['role']
  });

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingApprovals = orders.filter(o => o.status === 'Aguardando Aprovação');
  const totalGridValue = orders.reduce((acc, o) => acc + parseFloat(o.value), 0);

  // Consolidar eventos de telemetria baseados na história de todos os jobs
  const liveEvents = useMemo(() => {
    const events = orders.flatMap(o => o.history.map(h => ({ ...h, orderId: o.id, productName: o.product })));
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [orders]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUserSubmit = () => {
    if(!newUser.name || !newUser.email) return;
    
    const u: User = {
      id: `USER-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.role === 'Cliente' ? ['ORDER'] : ['PRODUCTION'],
      tier: newUser.tier,
      status: 'Ativo',
      joinedAt: Date.now(),
      password: 'redline-guest' // Default temporary password
    };
    
    onCreateUser(u);
    setShowAddUser(false);
    setNewUser({ name: '', email: '', tier: 'Bronze', role: 'Cliente' });
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in flex flex-col lg:flex-row gap-12">
      
      {/* Main Backoffice Area */}
      <div className="flex-grow">
        {/* Admin Header */}
        <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-16">
          <div>
            <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Master <br/><span className="text-red-600">Control.</span></h2>
            <div className="flex items-center space-x-6 mt-10">
               <div className="bg-black text-white px-8 py-4 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center shadow-2xl border-l-8 border-red-600">
                 <ShieldCheck className="w-5 h-5 mr-4 text-red-600" /> CLUSTER R2: <span className="text-green-500 ml-2">OPTIMAL</span>
               </div>
               <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-full shadow-sm border border-gray-100">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span className="text-[10px] font-black uppercase text-gray-400">Sync Latency: <span className="text-black">12ms</span></span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100 gap-3">
             {['approvals', 'orders', 'hubs', 'users', 'finance'].map(v => (
               <button key={v} onClick={() => setActiveView(v as any)} className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeView === v ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {v} {v === 'approvals' && pendingApprovals.length > 0 && <span className="ml-3 bg-red-600 px-3 py-1 rounded-full text-[9px] animate-bounce text-white">{pendingApprovals.length}</span>}
               </button>
             ))}
          </div>
        </div>

        {/* Dynamic Views */}
        {activeView === 'approvals' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10">
             <h3 className="text-4xl font-brand font-black italic uppercase">Fila de <span className="text-red-600">Validação Master.</span></h3>
             <div className="grid grid-cols-1 gap-8">
                {pendingApprovals.length > 0 ? pendingApprovals.map(o => (
                  <div key={o.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 group hover:border-red-600 transition-all">
                     <div className="flex-grow">
                        <div className="flex items-center space-x-6 mb-4">
                           <span className="text-4xl font-brand font-black italic text-black uppercase">{o.id}</span>
                           <span className="px-5 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">{o.product}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-[11px] font-black uppercase text-gray-400 italic">
                           <div><span className="block text-gray-300 mb-1">Cliente</span>{o.client}</div>
                           <div><span className="block text-gray-300 mb-1">Dimensões</span>{o.width}x{o.height}{o.unit}</div>
                           <div><span className="block text-gray-300 mb-1">Material</span>{o.material}</div>
                           <div><span className="block text-gray-300 mb-1">Anexo</span>{o.fileName || 'Nenhum'}</div>
                        </div>
                     </div>
                     <div className="flex items-center space-x-6">
                        <select className="bg-gray-50 border-2 border-gray-100 p-5 rounded-3xl text-[11px] font-black uppercase outline-none focus:border-red-600" id={`hub-select-${o.id}`}>
                           <option value="">Atribuir Hub...</option>
                           {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <button 
                          onClick={() => {
                            const h = (document.getElementById(`hub-select-${o.id}`) as HTMLSelectElement).value;
                            if (h) onUpdateStatus(o.id, 'Aprovado', h);
                          }}
                          className="bg-black text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-green-600 transition-all flex items-center space-x-4 shadow-xl"
                        >
                           <CheckCircle2 className="w-5 h-5"/> <span>Aprovar Job</span>
                        </button>
                     </div>
                  </div>
                )) : (
                  <div className="p-32 text-center opacity-10 font-brand font-black text-7xl uppercase italic">Protocolo Limpo.</div>
                )}
             </div>
          </div>
        )}

        {/* User Management View */}
        {activeView === 'users' && (
           <div className="space-y-12 animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <h3 className="text-4xl font-brand font-black italic uppercase">Gestão de <span className="text-red-600">Entidades Grid.</span></h3>
                <div className="flex items-center space-x-6 w-full max-w-2xl">
                   <div className="flex flex-grow bg-white p-2 rounded-3xl border border-gray-100 shadow-xl">
                      <div className="p-4"><Search className="w-5 h-5 text-gray-300" /></div>
                      <input 
                        type="text" 
                        placeholder="PESQUISAR UTILIZADOR OU EMAIL..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent flex-grow outline-none font-black uppercase text-[10px] tracking-widest"
                      />
                   </div>
                   <button onClick={() => setShowAddUser(true)} className="bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center shrink-0">
                      <UserPlus className="w-4 h-4 mr-3" /> Adicionar Cliente
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {filteredUsers.map(u => (
                   <div key={u.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-8 ${u.status === 'Bloqueado' ? 'border-gray-200 opacity-60' : 'border-gray-50 hover:border-black shadow-lg'}`}>
                      <div className="flex items-center space-x-8">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-brand font-black italic text-2xl shadow-inner ${u.role === 'Administrador' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>{u.name[0]}</div>
                         <div>
                            <h5 className="text-xl font-brand font-black italic uppercase text-black">{u.name}</h5>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{u.email} // {u.role}</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-6">
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase text-gray-300">Nível de Acesso</span>
                            <span className="text-[11px] font-black uppercase text-black">{u.tier}</span>
                         </div>
                         <div className="h-10 w-[1px] bg-gray-100 mx-4" />
                         <div className="flex space-x-3">
                            <button 
                              onClick={() => onUpdateUser(u.id, { status: u.status === 'Ativo' ? 'Bloqueado' : 'Ativo' })}
                              className={`p-4 rounded-2xl transition-all shadow-md ${u.status === 'Ativo' ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                              title={u.status === 'Ativo' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                            >
                               {u.status === 'Ativo' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                            </button>
                            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all shadow-md" title="Inspecionar Perfil">
                               <Eye className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* Hub Management View */}
        {activeView === 'hubs' && (
          <div className="space-y-12">
             <div className="flex justify-between items-center">
                <h3 className="text-4xl font-brand font-black italic uppercase">Gestão de <span className="text-red-600">Nodos do Grid.</span></h3>
                <button onClick={() => setShowAddHub(true)} className="bg-black text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center space-x-4"><Globe className="w-6 h-6"/> <span>Novo Hub</span></button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {hubs.map(h => (
                  <div key={h.id} className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-xl group relative overflow-hidden">
                     <img src={h.image} className="w-full h-56 object-cover rounded-[3rem] mb-10 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner" />
                     <h5 className="text-4xl font-brand font-black italic uppercase leading-none mb-3">{h.name}</h5>
                     <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-10">{h.location} // {h.id}</p>
                     <div className="flex justify-between items-center pt-10 border-t border-gray-50">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase text-gray-300">Produção</span>
                           <span className="text-3xl font-brand font-black italic">{h.capacity}%</span>
                        </div>
                        <button className="p-5 bg-red-50 text-red-600 rounded-3xl hover:bg-red-600 hover:text-white transition-all"><Trash2/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Finance View */}
        {activeView === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10">
             <div className="bg-black text-white p-16 rounded-[4.5rem] shadow-2xl border-b-[20px] border-red-600 flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute inset-0 industrial-grid opacity-10 group-hover:opacity-20 transition-opacity" />
                <TrendingUp className="w-16 h-16 text-red-600 mb-16 relative z-10" />
                <span className="text-8xl font-brand font-black italic block mb-4 relative z-10">€{totalGridValue.toLocaleString()}</span>
                <span className="text-[12px] font-black uppercase text-gray-500 tracking-[0.5em] relative z-10">Volume de Grid Total</span>
             </div>
             <div className="bg-white border border-gray-100 p-16 rounded-[4.5rem] shadow-sm flex flex-col justify-between">
                <DollarSign className="w-16 h-16 text-red-600 mb-16" />
                <span className="text-8xl font-brand font-black italic block mb-4">€{(totalGridValue * 0.15).toLocaleString()}</span>
                <span className="text-[12px] font-black uppercase text-gray-400 tracking-[0.5em]">Fees Master (15%)</span>
             </div>
             <div className="bg-white border border-gray-100 p-16 rounded-[4.5rem] shadow-sm flex flex-col justify-between">
                <RefreshCcw className="w-16 h-16 text-red-600 mb-16 animate-spin-slow" />
                <span className="text-8xl font-brand font-black italic block mb-4">{(orders.length)}</span>
                <span className="text-[12px] font-black uppercase text-gray-400 tracking-[0.5em]">Jobs Injetados</span>
             </div>
          </div>
        )}
      </div>

      {/* Real-time Telemetry Sidebar (Observational Only) */}
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
                     <span className="text-[8px] font-black text-green-500 uppercase">Live</span>
                  </div>
               </div>

               <div className="space-y-8 h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                  {liveEvents.length > 0 ? liveEvents.map((ev, i) => (
                    <div key={i} className="border-l-2 border-red-600/30 pl-6 space-y-2 group hover:border-red-600 transition-all cursor-default">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">{ev.status}</span>
                          <span className="text-[8px] font-mono text-gray-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-[11px] font-bold text-gray-300 leading-relaxed uppercase tracking-tighter italic">
                         Job <span className="text-white">#{ev.orderId}</span> - {ev.productName}: <br/>
                         {ev.note}
                       </p>
                       <div className="flex items-center space-x-3 text-[8px] font-black text-gray-600 uppercase">
                          <UserPlus className="w-3 h-3" />
                          <span>Author: {ev.author}</span>
                       </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                       <Zap className="w-16 h-16 text-gray-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Aguardando Injeção de Dados...</span>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Grid Guard Status */}
         <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl space-y-8">
            <div className="flex items-center space-x-4">
               <ShieldAlert className="w-8 h-8 text-red-600" />
               <h5 className="text-[12px] font-black uppercase tracking-widest">Protocolo GridGuard Ativo</h5>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>Ameaças Neutralizadas</span>
                  <span className="text-black">128</span>
               </div>
               <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 w-[95%]" />
               </div>
            </div>
         </div>
      </div>

      {/* MODAL ADD HUB */}
      {showAddHub && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[5rem] p-20 shadow-2xl border-[15px] border-red-600 relative overflow-y-auto max-h-[90vh]">
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Novo <br/><span className="text-red-600">Nodo Industrial.</span></h3>
              <div className="space-y-8">
                 <input type="text" placeholder="NOME DA EMPRESA" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" id="hub-name" />
                 <input type="text" placeholder="CIDADE, PAÍS" className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" id="hub-loc" />
                 <div className="flex space-x-6 pt-10">
                    <button 
                      onClick={() => {
                        const name = (document.getElementById('hub-name') as HTMLInputElement).value;
                        const loc = (document.getElementById('hub-loc') as HTMLInputElement).value;
                        if(name && loc) onCreateHub({ id: `NODE-${Date.now()}`, name, location: loc, status: 'Online', capacity: 0, latency: '---', image: hubs[0].image, description: 'Novo Nodo Ativado pelo Master', ownerId: user?.id || 'MASTER' });
                        setShowAddHub(false);
                      }}
                      className="flex-grow bg-black text-white p-10 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[14px] hover:bg-red-600 transition-all shadow-2xl"
                    >
                       Validar Node
                    </button>
                    <button onClick={() => setShowAddHub(false)} className="p-10 bg-gray-100 rounded-full text-black hover:rotate-90 transition-all"><X className="w-8 h-8"/></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL ADD USER (Super Admin Client Creation) */}
      {showAddUser && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-3xl rounded-[5rem] p-20 shadow-2xl border-[15px] border-black relative overflow-y-auto max-h-[95vh]">
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Provisionar <br/><span className="text-red-600">Nova Entidade.</span></h3>
              <div className="space-y-8">
                 <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      type="text" 
                      placeholder="NOME COMPLETO / CORPORATIVO" 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" 
                    />
                 </div>
                 <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      type="email" 
                      placeholder="EMAIL DE CONTACTO" 
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Tier de Acesso</label>
                       <select 
                         value={newUser.tier}
                         onChange={e => setNewUser({...newUser, tier: e.target.value as User['tier']})}
                         className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all"
                       >
                          {['Bronze', 'Prata', 'Ouro', 'Platina'].map(t => <option key={t}>{t}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Função Cluster</label>
                       <select 
                         value={newUser.role}
                         onChange={e => setNewUser({...newUser, role: e.target.value as User['role']})}
                         className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all"
                       >
                          <option value="Cliente">Cliente</option>
                          <option value="B2B_Admin">Parceiro HUB</option>
                       </select>
                    </div>
                 </div>
                 <div className="flex space-x-6 pt-10">
                    <button 
                      onClick={handleCreateUserSubmit}
                      className="flex-grow bg-black text-white p-10 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[14px] hover:bg-red-600 transition-all shadow-2xl"
                    >
                       Ativar Conta
                    </button>
                    <button onClick={() => setShowAddUser(false)} className="p-10 bg-gray-100 rounded-full text-black hover:bg-red-600 hover:text-white transition-all"><X className="w-8 h-8"/></button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
