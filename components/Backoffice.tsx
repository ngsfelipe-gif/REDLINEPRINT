
import React, { useState } from 'react';
import { ProductionJob, User, ExtendedProduct, Category } from '../types';
import { 
  Play, CheckCircle2, Package, Loader2, Cpu, Truck, LayoutDashboard, 
  ShieldAlert, Zap, BarChart3, Clock, Settings, Maximize2, X, FileText, 
  User as UserIcon, Calendar, Info, Layers, Eye, Plus, Edit2, Save, Trash2, Image as ImageIcon
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../constants';

interface BackofficeProps {
  orders: ProductionJob[];
  user?: User | null;
  onUpdateStatus: (orderId: string, status: ProductionJob['status']) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ orders, user, onUpdateStatus }) => {
  const [activeView, setActiveView] = useState<'orders' | 'catalog' | 'b2b'>('orders');
  const [catalog, setCatalog] = useState<ExtendedProduct[]>(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  
  const hasAdminAccess = user?.role === 'Administrador';
  const hasB2BAccess = user?.role === 'B2B_Admin' || hasAdminAccess;

  const handleUpdateProduct = (updated: ExtendedProduct) => {
    setCatalog(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    const newProduct: ExtendedProduct = {
      id: `new-${Date.now()}`,
      name: 'Novo Produto Industrial',
      category: Category.LargeFormat,
      description: 'Descrição técnica do novo item...',
      basePrice: 0,
      unit: 'un',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800',
      specs: { weight: '0g', durability: 'N/A', usage: 'N/A', weatherResistance: 0, ecoLevel: 0 }
    };
    setCatalog([newProduct, ...catalog]);
    setEditingProduct(newProduct);
  };

  if (!hasB2BAccess) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-48 text-center animate-in fade-in zoom-in">
         <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-8" />
         <h2 className="text-4xl font-brand font-black italic uppercase text-black">Acesso Bloqueado</h2>
         <p className="text-[10px] font-black uppercase text-gray-400 mt-4 tracking-[0.3em]">Protocolo R2: Credenciais B2B/Admin Necessárias</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40">
      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-12 bg-white p-2 rounded-2xl shadow-xl w-fit border border-gray-100">
        <button onClick={() => setActiveView('orders')} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'orders' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}>
          Operações
        </button>
        {hasAdminAccess && (
          <button onClick={() => setActiveView('catalog')} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'catalog' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}>
            Gestor de Catálogo
          </button>
        )}
        <button onClick={() => setActiveView('b2b')} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'b2b' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}>
          Portal Empresarial
        </button>
      </div>

      {activeView === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
           {/* Reusing existing orders logic but simplified for brevity in this response */}
           <div className="lg:col-span-12">
             <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8">
               <h3 className="text-xl font-brand font-black italic uppercase mb-8">Matriz de Produção Ativa</h3>
               <div className="space-y-4">
                 {orders.map(order => (
                   <div key={order.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group">
                     <div className="flex items-center space-x-6">
                       <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-brand font-black italic text-sm">{order.id.slice(-2)}</div>
                       <div>
                         <h4 className="text-sm font-brand font-black italic uppercase leading-none mb-1">{order.product}</h4>
                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{order.client} // {order.status}</span>
                       </div>
                     </div>
                     <div className="flex items-center space-x-4">
                       <span className="text-sm font-brand font-black italic">€{order.value}</span>
                       <button className="p-2 hover:bg-red-600 hover:text-white transition-all rounded-lg"><Eye className="w-4 h-4"/></button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      )}

      {activeView === 'catalog' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-end mb-12">
             <div>
                <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none mb-2 text-black">Gestão de <span className="text-red-600">Catálogo R2.</span></h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Editor de Ativos e Metadados Industriais</p>
             </div>
             <button onClick={handleAddProduct} className="bg-red-600 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl flex items-center space-x-4">
                <Plus className="w-4 h-4" /> <span>Inserir Novo Asset</span>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {catalog.map(product => (
               <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="relative aspect-video overflow-hidden">
                     <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
                     <button onClick={() => setEditingProduct(product)} className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl text-black hover:bg-red-600 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-500">
                        <Edit2 className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-8">
                     <span className="text-[7px] font-black uppercase text-red-600 tracking-widest mb-2 block">{product.category}</span>
                     <h4 className="text-lg font-brand font-black italic uppercase mb-4 leading-none">{product.name}</h4>
                     <div className="flex justify-between items-center border-t border-gray-50 pt-6">
                        <span className="text-sm font-brand font-black italic">€{product.basePrice}<span className="text-[8px] opacity-40">/{product.unit}</span></span>
                        <div className="flex space-x-2">
                           <div className="w-2 h-2 rounded-full bg-green-500" />
                           <span className="text-[8px] font-black uppercase text-gray-400">Ativo em Node</span>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeView === 'b2b' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl border-b-[15px] border-red-600">
                 <Zap className="w-10 h-10 text-red-600 mb-8" />
                 <h4 className="text-3xl font-brand font-black italic uppercase tracking-tighter mb-8 leading-none">Telemetria <br /> Corporativa.</h4>
                 <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                       <span className="text-[8px] font-black uppercase text-gray-500 block mb-2">Crédito Global Cluster</span>
                       <span className="text-2xl font-brand font-black italic">€{user?.creditLimit?.toLocaleString() || '150,000'}</span>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                       <span className="text-[8px] font-black uppercase text-gray-500 block mb-2">Pedidos em Fila</span>
                       <span className="text-2xl font-brand font-black italic">14 Unid.</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="lg:col-span-8">
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-10">
                 <h3 className="text-2xl font-brand font-black italic uppercase mb-10">Histórico de Transações B2B</h3>
                 <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                         <div className="flex items-center space-x-6">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-gray-400"/></div>
                            <div>
                               <h5 className="text-[10px] font-black uppercase tracking-widest">FATURA_RL_2025_00{i}</h5>
                               <span className="text-[8px] font-bold text-gray-400">Liquidado via Crédito Node // 12 Jan 2025</span>
                            </div>
                         </div>
                         <div className="flex items-center space-x-6">
                            <span className="text-sm font-brand font-black italic">€{(Math.random() * 5000).toFixed(2)}</span>
                            <button className="text-[8px] font-black uppercase text-red-600 hover:text-black tracking-[0.2em]">Download</button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 border-[10px] border-white">
              <div className="w-full md:w-[350px] bg-black text-white p-12 flex flex-col justify-between border-r-[15px] border-red-600">
                 <div>
                    <Settings className="w-10 h-10 text-red-600 mb-10" />
                    <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-8 leading-none">Editor de <br /> Assets.</h4>
                    <img src={editingProduct.image} className="w-full aspect-square object-cover rounded-3xl border border-white/10 mb-8" />
                 </div>
                 <button onClick={() => setEditingProduct(null)} className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-red-600 transition-all">
                    <X className="w-6 h-6" /> <span>Cancelar</span>
                 </button>
              </div>

              <div className="flex-grow p-16 industrial-grid overflow-y-auto max-h-[85vh]">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Nome Industrial</label>
                       <input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-2xl font-brand font-black italic outline-none focus:border-red-600 shadow-inner" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Preço Base (€)</label>
                          <input type="number" value={editingProduct.basePrice} onChange={e => setEditingProduct({...editingProduct, basePrice: parseFloat(e.target.value)})} className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-2xl font-brand font-black italic outline-none focus:border-red-600 shadow-inner" />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Unidade</label>
                          <select value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value as any})} className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-2xl font-brand font-black italic outline-none focus:border-red-600 shadow-inner appearance-none">
                             <option value="un">un</option>
                             <option value="m2">m2</option>
                             <option value="pack">pack</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">URL da Imagem (Unsplash/Industrial)</label>
                       <div className="flex space-x-4">
                          <input value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="flex-grow bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-sm font-mono outline-none focus:border-red-600 shadow-inner" />
                          <button className="bg-black text-white p-5 rounded-2xl hover:bg-red-600 transition-all shadow-xl"><ImageIcon className="w-6 h-6" /></button>
                       </div>
                    </div>

                    <button onClick={() => handleUpdateProduct(editingProduct)} className="w-full bg-red-600 text-white p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.5em] hover:bg-black transition-all shadow-2xl flex items-center justify-center space-x-6 group">
                       <Save className="w-6 h-6 group-hover:scale-125 transition-transform" /> <span>Sincronizar no Catálogo</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
