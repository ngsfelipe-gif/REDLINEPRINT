
import React, { useState } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { ShieldCheck, Zap, X, Eye, Server, Activity, BarChart3, Users, Globe, Trash2, Award, UserPlus, Cpu, RefreshCcw, TrendingUp, DollarSign, CheckCircle2, MoreHorizontal } from 'lucide-react';

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
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, language, onUpdateStatus, onCreateHub, onCreateUser
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'finance'>('approvals');
  const [showAddHub, setShowAddHub] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  
  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingApprovals = orders.filter(o => o.status === 'Aguardando Aprovação');
  const totalGridValue = orders.reduce((acc, o) => acc + parseFloat(o.value), 0);

  return (
    <div className="max-w-[1700px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in">
      {/* Admin Header */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-16">
        <div>
          <h2 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Master <br/><span className="text-red-600">Control.</span></h2>
          <div className="flex items-center space-x-6 mt-10">
             <div className="bg-black text-white px-8 py-4 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center shadow-2xl">
               <ShieldCheck className="w-5 h-5 mr-4 text-red-600" /> GRID CLUSTER: OPERACIONAL
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100 gap-3">
           {['approvals', 'orders', 'hubs', 'users', 'finance'].map(v => (
             <button key={v} onClick={() => setActiveView(v as any)} className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeView === v ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                {v} {v === 'approvals' && pendingApprovals.length > 0 && <span className="ml-3 bg-red-600 px-3 py-1 rounded-full text-[9px] animate-bounce">{pendingApprovals.length}</span>}
             </button>
           ))}
        </div>
      </div>

      {/* Approvals View */}
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
           <div className="bg-black text-white p-16 rounded-[4.5rem] shadow-2xl border-b-[20px] border-red-600 flex flex-col justify-between">
              <TrendingUp className="w-16 h-16 text-red-600 mb-16" />
              <span className="text-8xl font-brand font-black italic block mb-4">€{totalGridValue.toLocaleString()}</span>
              <span className="text-[12px] font-black uppercase text-gray-500 tracking-[0.5em]">Volume de Grid Total</span>
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
    </div>
  );
};

export default Backoffice;
