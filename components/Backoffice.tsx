
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart } from 'lucide-react';

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
  onUpdateHub: (hubId: string, updates: Partial<PartnerNode>) => void;
  onUpdateProduct: (productId: string, updates: Partial<ExtendedProduct>) => void;
  onUpdateOrder: (orderId: string, updates: Partial<ProductionJob>) => void;
  onApproveHub: (requestId: string) => void;
  onApproveAuth: (authId: string) => void;
  onImpersonate: (user: User) => void;
  onCreateUser: (u: User) => void;
  onCreateClient: (clientData: Partial<User>) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, hubRequests, authRequests, language, onUpdateStatus, onUpdateUser, onUpdateHub, onUpdateProduct, onUpdateOrder, onApproveHub, onApproveAuth, onImpersonate, onCreateUser, onCreateClient
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'products'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{type: 'user' | 'hub' | 'product' | 'order', data: any} | null>(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '' });

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingApprovals = orders.filter(o => o.status === 'Aguardando Aprovação');

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeView === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, activeView, searchTerm]);

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const { type, data } = editingItem;
    if (type === 'user') onUpdateUser(data.id, data);
    if (type === 'hub') onUpdateHub(data.id, data);
    if (type === 'product') onUpdateProduct(data.id, data);
    if (type === 'order') onUpdateOrder(data.id, data);
    setEditingItem(null);
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 pb-32 industrial-grid animate-in fade-in flex flex-col lg:flex-row gap-12">
      <div className="flex-grow">
        <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 pt-16">
          <div>
            <h2 className="text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Master <br/><span className="text-red-600">Control.</span></h2>
            <div className="flex items-center space-x-6 mt-10">
               <div className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl border-l-8 border-red-600">
                 <ShieldCheck className="w-4 h-4 mr-3 text-red-600" /> SESSION: VERIFIED
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap bg-white p-2 rounded-[3rem] shadow-2xl border border-gray-100 gap-2">
             {['approvals', 'orders', 'hubs', 'users', 'products'].map(v => (
               <button key={v} onClick={() => setActiveView(v as any)} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeView === v ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {v}
               </button>
             ))}
          </div>
        </div>

        {activeView !== 'approvals' && (
           <div className="mb-12 flex justify-between items-center gap-8">
              <div className="flex items-center space-x-6 w-full max-w-xl bg-white p-1 rounded-3xl border border-gray-100 shadow-xl">
                 <div className="p-4"><Search className="w-5 h-5 text-gray-300" /></div>
                 <input type="text" placeholder={`PESQUISAR...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black uppercase text-[10px]" />
              </div>
              {activeView === 'users' && (
                 <button onClick={() => setShowCreateClient(true)} className="bg-red-600 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest flex items-center shadow-2xl hover:bg-black transition-all">
                    <UserPlus className="w-5 h-5 mr-3" /> Criar Cliente
                 </button>
              )}
           </div>
        )}

        {activeView === 'approvals' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10">
             <h3 className="text-4xl font-brand font-black italic uppercase">Fila de <span className="text-red-600">Aprovação.</span></h3>
             <div className="grid grid-cols-1 gap-6">
                {pendingApprovals.map(o => (
                  <div key={o.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl flex justify-between items-center group hover:border-red-600 transition-all">
                     <div className="flex-grow">
                        <div className="flex items-center space-x-6 mb-4">
                           <span className="text-3xl font-brand font-black italic text-black uppercase">{o.id}</span>
                           <span className="px-5 py-2 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest">{o.product}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-8 text-[10px] font-black uppercase text-gray-400 italic">
                           <div><span className="block text-gray-300">Cliente</span>{o.client}</div>
                           <div><span className="block text-gray-300">Tamanho</span>{o.dimensions || 'N/A'}</div>
                           <div><span className="block text-gray-300">Material</span>{o.material}</div>
                           <div><span className="block text-gray-300">Ficheiro</span>{o.fileName}</div>
                        </div>
                     </div>
                     <div className="flex items-center space-x-4">
                        <select className="bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase" id={`h-${o.id}`}>
                           <option value="">NODO...</option>
                           {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <button onClick={() => {
                          const h = (document.getElementById(`h-${o.id}`) as HTMLSelectElement).value;
                          if(h) onUpdateStatus(o.id, 'Aprovado', h);
                        }} className="bg-black text-white p-5 rounded-full hover:bg-green-600 transition-all"><CheckCircle2/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Listagem Geral */}
        <div className="grid grid-cols-1 gap-4">
          {activeView !== 'approvals' && filteredItems.map((item: any) => (
             <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-gray-50 hover:border-black shadow-lg transition-all flex items-center justify-between">
                <div className="flex items-center space-x-8">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-brand font-black italic text-xl ${activeView === 'users' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                      {item.name ? item.name[0] : '#'}
                   </div>
                   <div>
                      <h5 className="text-xl font-brand font-black italic uppercase text-black">{item.name || item.id}</h5>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.email || item.category || item.status}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                   {activeView === 'users' && (
                      <button onClick={() => onImpersonate(item)} className="px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2">
                         <ArrowUpRight className="w-4 h-4" /> <span>Shadow</span>
                      </button>
                   )}
                   <button onClick={() => setEditingItem({type: activeView.slice(0, -1) as any, data: {...item}})} className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all">
                      <Edit className="w-5 h-5" />
                   </button>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO GRANULAR */}
      {editingItem && (
        <div className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-16 shadow-2xl border-[15px] border-red-600 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setEditingItem(null)} className="absolute top-10 right-10 p-4 text-gray-300 hover:text-black"><X className="w-8 h-8"/></button>
              <h3 className="text-3xl font-brand font-black italic uppercase mb-10">Edição <span className="text-red-600">Granular R2.</span></h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Nome do Recurso</label>
                    <input type="text" value={editingItem.data.name || editingItem.data.id} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                 </div>
                 {editingItem.type === 'hub' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400">Capacidade (%)</label>
                       <input type="number" value={editingItem.data.capacity} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, capacity: parseInt(e.target.value)}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                    </div>
                 )}
                 <button onClick={handleSaveEdit} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center">
                    <Save className="w-5 h-5 mr-4" /> Aplicar Master
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO DE CLIENTE */}
      {showCreateClient && (
         <div className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[4rem] p-16 shadow-2xl border-[15px] border-black relative">
               <button onClick={() => setShowCreateClient(false)} className="absolute top-10 right-10 p-4 text-gray-300 hover:text-black"><X className="w-8 h-8"/></button>
               <h3 className="text-3xl font-brand font-black italic uppercase mb-10">Novo <span className="text-red-600">Cliente R2.</span></h3>
               <div className="space-y-6">
                  <input type="text" placeholder="NOME COMPLETO" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" />
                  <input type="email" placeholder="EMAIL DE ACESSO" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" />
                  <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex items-center space-x-4">
                     <ShieldAlert className="w-8 h-8 text-red-600" />
                     <p className="text-[9px] font-black text-red-800 uppercase italic">As credenciais de acesso serão geradas automaticamente pelo sistema Master.</p>
                  </div>
                  <button onClick={() => { onCreateClient(newClientData); setShowCreateClient(false); }} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center">
                     <Plus className="w-5 h-5 mr-3" /> Injetar Entidade
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Backoffice;
