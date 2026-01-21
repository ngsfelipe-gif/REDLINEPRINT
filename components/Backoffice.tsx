
import React, { useState } from 'react';
import { ProductionJob, User, Category, PartnerNode } from '../types';
import { 
  CheckCircle2, Loader2, Cpu, ShieldAlert, ShieldCheck, Zap, Settings, X, 
  Eye, Plus, Edit2, Trash2, Globe, Server, Users, Activity, BarChart3
} from 'lucide-react';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  user?: User | null;
  onUpdateStatus: (orderId: string, status: ProductionJob['status']) => void;
  onAddHub: (hub: PartnerNode) => void;
  onUpdateHub: (hubId: string, status: PartnerNode['status']) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ orders, hubs, user, onUpdateStatus, onAddHub, onUpdateHub }) => {
  const [activeView, setActiveView] = useState<'orders' | 'hubs' | 'users'>('orders');
  
  const isAdmin = user?.role === 'Administrador';
  const isB2B = user?.role === 'B2B_Admin' || isAdmin;

  // Filtragem de Hubs para B2B Admins (vêem apenas os seus hubs)
  const visibleHubs = isAdmin ? hubs : hubs.filter(h => h.ownerId === user?.id);
  const visibleOrders = isAdmin ? orders : orders.filter(o => o.nodeId && visibleHubs.some(vh => vh.id === o.nodeId));

  if (!isB2B) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-40 text-center animate-in zoom-in">
         <ShieldAlert className="w-24 h-24 text-red-600 mx-auto mb-10" />
         <h2 className="text-6xl font-brand font-black italic uppercase text-black leading-none">Acesso Restrito</h2>
         <p className="text-[12px] font-black uppercase text-gray-400 mt-6 tracking-[0.5em]">Protocolo R2: Credenciais Nível Administrativo Requeridas</p>
      </div>
    );
  }

  const handleCreateHub = () => {
    const newHub: PartnerNode = {
      id: `NODE-${Math.floor(Math.random() * 900) + 100}`,
      name: 'Nova Unidade Industrial',
      location: 'Definir Localização',
      specialization: [Category.LargeFormat],
      status: 'Online',
      capacity: 0,
      latency: '1ms',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800',
      description: 'Nodo fabril registado via terminal B2B.',
      ownerId: user?.id
    };
    onAddHub(newHub);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 industrial-grid min-h-screen">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 gap-10">
        <div className="animate-in slide-in-from-left-6">
          <h2 className="text-6xl md:text-8xl font-brand font-black italic uppercase tracking-tighter text-black leading-none">
            {isAdmin ? 'Controlo' : 'Gestão'} <br /> <span className="text-red-600">Operacional.</span>
          </h2>
          <div className="flex items-center space-x-4 mt-8">
            <div className="bg-black text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center">
               <ShieldCheck className="w-3 h-3 mr-2 text-red-600" /> {user?.role} Mode
            </div>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sincronização: Node R2-Master</div>
          </div>
        </div>

        <div className="flex flex-wrap bg-white p-2 rounded-[2rem] shadow-2xl border border-gray-100 gap-2 animate-in slide-in-from-right-6">
          <button onClick={() => setActiveView('orders')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'orders' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>Encomendas</button>
          <button onClick={() => setActiveView('hubs')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'hubs' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>Os Meus Hubs</button>
          {isAdmin && <button onClick={() => setActiveView('users')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'users' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>Utilizadores B2B</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
           <BarChart3 className="w-10 h-10 text-red-600 mb-6" />
           <span className="text-6xl font-brand font-black italic">{visibleOrders.length}</span>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordens em Produção</span>
        </div>
        <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between border-b-[15px] border-red-600">
           <Zap className="w-10 h-10 text-red-600 mb-6" />
           <span className="text-6xl font-brand font-black italic">99.8%</span>
           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uptime da Rede</span>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
           <Activity className="w-10 h-10 text-red-600 mb-6" />
           <span className="text-6xl font-brand font-black italic">{visibleHubs.length}</span>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nodos Fabris Ativos</span>
        </div>
        <div className="bg-red-600 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between">
           <Server className="w-10 h-10 text-black mb-6" />
           <span className="text-5xl font-brand font-black italic uppercase">Active</span>
           <span className="text-[10px] font-black text-red-100 uppercase tracking-widest">Protocolo R2-Sync</span>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl overflow-hidden mb-20">
        {activeView === 'orders' && (
          <div className="animate-in fade-in duration-500">
            <div className="p-12 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
               <h3 className="text-3xl font-brand font-black italic uppercase text-black">Master Pipeline</h3>
               <div className="flex space-x-3">
                  <div className="flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase">
                     <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                     <span>Sincronização em Tempo Real</span>
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-12 py-8">Ordem ID</th>
                    <th className="px-8 py-8">Cliente Industrial</th>
                    <th className="px-8 py-8">Produto / Especificação</th>
                    <th className="px-8 py-8">Fase / Status</th>
                    <th className="px-8 py-8">Node</th>
                    <th className="px-12 py-8 text-right">Controlo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleOrders.map(order => (
                    <tr key={order.id} className="group hover:bg-gray-50/80 transition-all">
                      <td className="px-12 py-10 font-brand font-black italic text-lg">{order.id}</td>
                      <td className="px-8 py-10">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black uppercase text-black">{order.client}</span>
                           <span className="text-[9px] font-bold text-gray-300 uppercase">{order.clientId}</span>
                        </div>
                      </td>
                      <td className="px-8 py-10">
                         <span className="text-[11px] font-black uppercase text-gray-600">{order.product}</span>
                         <div className="text-[8px] font-bold text-gray-400 uppercase mt-1">Qt: {order.quantity} // {order.material}</div>
                      </td>
                      <td className="px-8 py-10">
                        <select 
                           value={order.status} 
                           onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
                           className="bg-white border-2 border-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm"
                        >
                           {['Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição', 'Entregue'].map(s => (
                             <option key={s} value={s}>{s}</option>
                           ))}
                        </select>
                      </td>
                      <td className="px-8 py-10">
                         <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase">{order.nodeId || 'PENDING'}</span>
                      </td>
                      <td className="px-12 py-10 text-right">
                         <button className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm"><Eye className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'hubs' && (
          <div className="p-12 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-16">
                <div>
                   <h3 className="text-4xl font-brand font-black italic uppercase leading-none">Rede de <span className="text-red-600">Nodos B2B.</span></h3>
                   <p className="text-[11px] font-black text-gray-400 uppercase mt-2 tracking-widest">Gerir infraestrutura física do cluster industrial</p>
                </div>
                <button onClick={handleCreateHub} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl flex items-center space-x-4">
                   <Plus className="w-5 h-5" /> <span>Registar Novo Hub</span>
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {visibleHubs.map(hub => (
                  <div key={hub.id} className="bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 group hover:border-red-600 transition-all">
                     <div className="relative aspect-video">
                        <img src={hub.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                           <button className="bg-white p-5 rounded-2xl text-black hover:bg-red-600 hover:text-white transition-all shadow-xl"><Edit2 className="w-6 h-6"/></button>
                           <button className="bg-white p-5 rounded-2xl text-black hover:bg-red-600 hover:text-white transition-all shadow-xl"><Trash2 className="w-6 h-6"/></button>
                        </div>
                     </div>
                     <div className="p-10">
                        <div className="flex justify-between items-start mb-8">
                           <div>
                              <h4 className="text-2xl font-brand font-black italic uppercase mb-1 leading-none">{hub.name}</h4>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{hub.location}</span>
                           </div>
                           <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${hub.status === 'Online' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>{hub.status}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                           <div className="space-y-1">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest block">Capacidade</span>
                              <span className="text-xl font-brand font-black italic">{hub.capacity}%</span>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest block">Latência R2</span>
                              <span className="text-xl font-brand font-black italic text-red-600">{hub.latency}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backoffice;
