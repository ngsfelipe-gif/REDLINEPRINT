
import React, { useState } from 'react';
import { ProductionJob, User, ExtendedProduct, Category, PartnerNode } from '../types';
import { 
  Play, CheckCircle2, Package, Loader2, Cpu, Truck, LayoutDashboard, 
  ShieldAlert, ShieldCheck, Zap, BarChart3, Clock, Settings, Maximize2, X, FileText, 
  User as UserIcon, Calendar, Info, Layers, Eye, Plus, Edit2, Save, Trash2, 
  Image as ImageIcon, Globe, Server, UserCheck
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../constants';

interface BackofficeProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  users: User[];
  user?: User | null;
  onUpdateStatus: (orderId: string, status: ProductionJob['status']) => void;
  onAddHub: (hub: PartnerNode) => void;
  onUpdateHub: (hubId: string, status: PartnerNode['status']) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ orders, hubs, user, onUpdateStatus, onAddHub, onUpdateHub }) => {
  const [activeView, setActiveView] = useState<'orders' | 'catalog' | 'hubs' | 'users'>('orders');
  const [editingHub, setEditingHub] = useState<PartnerNode | null>(null);
  
  const isAdmin = user?.role === 'Administrador';
  const isB2B = user?.role === 'B2B_Admin' || isAdmin;

  if (!isB2B) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-48 text-center animate-in fade-in zoom-in">
         <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-8" />
         <h2 className="text-4xl font-brand font-black italic uppercase text-black">Acesso Bloqueado</h2>
         <p className="text-[10px] font-black uppercase text-gray-400 mt-4 tracking-[0.3em]">Protocolo R2: Credenciais Administrativas Necessárias</p>
      </div>
    );
  }

  const handleCreateHub = () => {
    const newHub: PartnerNode = {
      id: `NODE-${Math.floor(Math.random() * 900) + 100}`,
      name: 'Novo Hub de Produção',
      location: 'Localização do Hub',
      specialization: [Category.LargeFormat],
      status: 'Online',
      capacity: 0,
      latency: '5ms',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800',
      description: 'Descrição técnica do novo hub registrado.',
      ownerId: user?.id
    };
    onAddHub(newHub);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40">
      {/* Admin Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
          <h2 className="text-5xl font-brand font-black italic uppercase tracking-tighter text-black leading-none">
            {isAdmin ? 'Central de' : 'Node'} <br /> <span className="text-red-600">Comando R2.</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-4 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-red-600" /> Operador: {user?.name} // Role: {user?.role}
          </p>
        </div>

        <div className="flex bg-white p-2 rounded-2xl shadow-xl border border-gray-100 space-x-2">
          <button onClick={() => setActiveView('orders')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'orders' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Encomendas</button>
          <button onClick={() => setActiveView('hubs')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'hubs' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Nodos/Hubs</button>
          {isAdmin && <button onClick={() => setActiveView('users')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'users' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Utilizadores</button>}
        </div>
      </div>

      {activeView === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-6">
           {/* Estatísticas Rápidas */}
           <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-[8px] font-black text-gray-400 uppercase block mb-2">Pedidos em Fila</span>
                <span className="text-4xl font-brand font-black italic text-black">{orders.length}</span>
              </div>
              <div className="bg-black text-white p-8 rounded-3xl shadow-2xl">
                <span className="text-[8px] font-black text-red-600 uppercase block mb-2">Taxa de Produção</span>
                <span className="text-4xl font-brand font-black italic">98.2%</span>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-[8px] font-black text-gray-400 uppercase block mb-2">Faturação Pendente</span>
                <span className="text-4xl font-brand font-black italic text-black">€42,8k</span>
              </div>
              <div className="bg-red-600 text-white p-8 rounded-3xl shadow-2xl">
                <span className="text-[8px] font-black text-white/50 uppercase block mb-2">Alertas Pre-flight</span>
                <span className="text-4xl font-brand font-black italic">03</span>
              </div>
           </div>

           {/* Lista de Ordens Master */}
           <div className="lg:col-span-12">
             <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-xl font-brand font-black italic uppercase">Matriz Global de Operações</h3>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Live Sync Ativo</span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black text-white text-[9px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-10 py-6">ID</th>
                        <th className="px-6 py-6">Cliente</th>
                        <th className="px-6 py-6">Produto</th>
                        <th className="px-6 py-6">Estado</th>
                        <th className="px-6 py-6">Node</th>
                        <th className="px-6 py-6">Valor</th>
                        <th className="px-10 py-6 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr key={order.id} className="group hover:bg-red-50/30 transition-all">
                          <td className="px-10 py-8 font-brand font-black italic text-sm">{order.id}</td>
                          <td className="px-6 py-8">
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase">{order.client}</span>
                               <span className="text-[8px] text-gray-400 font-bold uppercase">{order.clientId}</span>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <span className="text-[10px] font-bold text-gray-600 uppercase">{order.product}</span>
                          </td>
                          <td className="px-6 py-8">
                             <select 
                               value={order.status} 
                               onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
                               className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none focus:border-red-600"
                             >
                               {['Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição', 'Entregue'].map(s => (
                                 <option key={s} value={s}>{s}</option>
                               ))}
                             </select>
                          </td>
                          <td className="px-6 py-8">
                             <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-1 rounded">{order.nodeId || 'PENDING'}</span>
                          </td>
                          <td className="px-6 py-8 font-brand font-black italic">€{order.value}</td>
                          <td className="px-10 py-8 text-right">
                             <button className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all"><Eye className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           </div>
        </div>
      )}

      {activeView === 'hubs' && (
        <div className="animate-in fade-in slide-in-from-bottom-6">
           <div className="flex justify-between items-end mb-12">
              <div>
                 <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none mb-2 text-black">Gestão de <span className="text-red-600">Nodos.</span></h3>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Editor de Infraestrutura e Capacidade de Rede</p>
              </div>
              <button onClick={handleCreateHub} className="bg-red-600 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl flex items-center space-x-4">
                 <Plus className="w-4 h-4" /> <span>Novo Hub Parceiro</span>
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hubs.map(hub => (
                <div key={hub.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden group hover:border-red-600 transition-all">
                   <div className="relative aspect-video">
                      <img src={hub.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                         <button className="bg-white p-4 rounded-2xl text-black hover:bg-red-600 hover:text-white transition-all"><Edit2 className="w-5 h-5"/></button>
                         <button className="bg-white p-4 rounded-2xl text-black hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5"/></button>
                      </div>
                   </div>
                   <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <h4 className="text-xl font-brand font-black italic uppercase leading-none mb-1">{hub.name}</h4>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{hub.location}</span>
                         </div>
                         <select 
                            value={hub.status} 
                            onChange={(e) => onUpdateHub(hub.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest outline-none ${hub.status === 'Online' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
                         >
                            <option>Online</option>
                            <option>Busy</option>
                            <option>Maintenance</option>
                         </select>
                      </div>
                      <div className="space-y-4 pt-6 border-t border-gray-50">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase">
                            <span className="text-gray-400">Owner ID</span>
                            <span className="text-black">{hub.ownerId || 'SYSTEM'}</span>
                         </div>
                         <div className="flex justify-between items-center text-[9px] font-black uppercase">
                            <span className="text-gray-400">Latência R2</span>
                            <span className="text-red-600">{hub.latency}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeView === 'users' && (
        <div className="animate-in fade-in slide-in-from-bottom-6">
           <div className="mb-12">
              <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none mb-2 text-black">Células de <span className="text-red-600">Utilizadores.</span></h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Gestão de Identidades e Permissões de Acesso</p>
           </div>
           
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-10">
              <div className="space-y-4">
                 {/* Exemplo de Lista de Utilizadores */}
                 {['admin@redline.eu', 'b2b@spacex.com', 'cliente@gmail.com'].map((email, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl group hover:bg-black hover:text-white transition-all border border-transparent hover:border-gray-800">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center font-brand font-black italic text-gray-500 group-hover:bg-red-600 group-hover:text-white">{email.charAt(0).toUpperCase()}</div>
                        <div>
                           <h5 className="text-[11px] font-black uppercase tracking-widest">{email}</h5>
                           <div className="flex items-center space-x-3 mt-1">
                              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{i === 0 ? 'Administrador' : (i === 1 ? 'B2B Admin' : 'Cliente')}</span>
                              <div className="w-1 h-1 bg-red-600 rounded-full" />
                              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Ativo no Node FRA-01</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="px-5 py-2 bg-white text-black border border-gray-100 rounded-lg text-[8px] font-black uppercase tracking-widest group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600">Permissões</button>
                        <button className="p-3 bg-white text-gray-400 rounded-lg hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
