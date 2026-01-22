
import React, { useState } from 'react';
import { User as UserType, ProductionJob, SupportTicket, PartnerNode, ExtendedProduct, Category } from '../types';
import { 
  Activity, Zap, ShieldCheck, Eye, X, Cpu, LogOut, Send, Download, Plus, Inbox, Globe, Package, Users, Mail, Lock, PlusCircle, UserPlus, Filter, Trash2
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface AccountProps {
  user: UserType;
  orders: ProductionJob[];
  tickets: SupportTicket[];
  hubs: PartnerNode[];
  products: ExtendedProduct[];
  subTab: string;
  setSubTab: (tab: string) => void;
  onLogout: () => void;
  onCreateProduct: (p: ExtendedProduct) => void;
  onRegisterLocalClient: (u: UserType) => void;
}

const Account: React.FC<AccountProps> = ({ 
  user, orders, tickets, hubs, products, subTab, setSubTab, onLogout, onCreateProduct, onRegisterLocalClient
}) => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: Category.LargeFormat, price: '10' });
  const [newClient, setNewClient] = useState({ name: '', email: '', password: '' });

  const isAdmin = user.role === 'Administrador';
  const isB2B = user.role === 'B2B_Admin';
  
  // ROLE-BASED DATA FILTERING
  const myOrders = isAdmin ? orders : (isB2B ? orders.filter(o => o.nodeId === user.managedHubId) : orders.filter(o => o.clientId === user.id));
  const myProducts = products.filter(p => p.ownerHubId === (isB2B ? user.managedHubId : 'SYSTEM'));
  const activeProducts = products.filter(p => p.status === 'Ativo');

  const generatePDF = (order: ProductionJob) => {
    const doc = new jsPDF();
    doc.setFillColor(204, 0, 0); 
    doc.rect(0,0,210,40,'F');
    doc.setTextColor(255); 
    doc.setFontSize(22); 
    doc.text("REDLINE PRINT R2", 20, 25);
    doc.setFontSize(10);
    doc.text("PROTOCOLO INDUSTRIAL DE PRODUÇÃO", 20, 32);

    doc.setTextColor(0); 
    doc.setFontSize(14); 
    doc.text(`Identificador de Ordem: ${order.id}`, 20, 60);
    doc.text(`Cliente: ${order.client}`, 20, 75);
    doc.text(`Produto Master: ${order.product}`, 20, 90);
    doc.text(`Unidade Fabril (Node): ${order.nodeId}`, 20, 105);
    doc.text(`Status Atual: ${order.status}`, 20, 120);
    
    doc.setFontSize(18); 
    doc.setTextColor(204,0,0); 
    doc.text(`INVESTIMENTO TOTAL: EUR ${order.value}`, 20, 150);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Documento autenticado via Grid Redline R2 Cluster.", 20, 280);
    doc.save(`REDLINE_${order.id}.pdf`);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-12 pb-24 industrial-grid animate-in fade-in">
      {/* ACCOUNT HEADER */}
      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-10 lg:p-16 mb-16 flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="flex items-center space-x-10">
           <div className="w-28 h-28 bg-black rounded-[2.5rem] flex items-center justify-center font-brand text-5xl font-black italic text-white shadow-2xl border-b-[10px] border-red-600">
             {user.name.charAt(0)}
           </div>
           <div>
              <h2 className="text-5xl md:text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">{user.name}</h2>
              <div className="flex items-center space-x-5 mt-4">
                <span className="px-5 py-2 bg-red-50 text-red-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                  {user.role} Industrial
                </span>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {user.id}</span>
              </div>
           </div>
        </div>
        
        <div className="flex flex-wrap bg-gray-50 p-2.5 rounded-[3rem] gap-3 shadow-inner border border-gray-100">
           {['overview', 'orders', 'products', 'clients', 'inbox'].map(tab => (
             (isB2B || isAdmin || (tab !== 'products' && tab !== 'clients')) && (
               <button 
                 key={tab} 
                 onClick={() => setSubTab(tab)} 
                 className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${subTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black hover:bg-white'}`}
               >
                 {tab}
               </button>
             )
           ))}
           <button onClick={onLogout} className="px-8 py-5 text-gray-400 hover:text-red-600 transition-all hover:rotate-12">
             <LogOut className="w-7 h-7"/>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* MAIN WORKSPACE */}
        <div className="xl:col-span-8 space-y-12">
           {subTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10">
                 <div className="bg-black text-white p-14 rounded-[4rem] shadow-2xl border-b-[20px] border-red-600 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                    <Activity className="w-12 h-12 text-red-600 mb-12" />
                    <span className="text-8xl font-brand font-black italic block leading-none">{myOrders.length}</span>
                    <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.5em]">Assets no Grid</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-14 rounded-[4rem] shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all">
                    <Zap className="w-12 h-12 text-red-600 mb-12" />
                    <span className="text-8xl font-brand font-black italic block leading-none">{isB2B ? myProducts.length : orders.filter(o => o.clientId === user.id && o.status === 'Entregue').length}</span>
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em]">{isB2B ? 'Meus Ativos' : 'Finalizados'}</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-14 rounded-[4rem] shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all">
                    <ShieldCheck className="w-12 h-12 text-red-600 mb-12" />
                    <span className="text-5xl font-brand font-black italic block leading-none uppercase">{user.tier} RANK</span>
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em]">Protocolo de Acesso</span>
                 </div>
              </div>
           )}

           {subTab === 'orders' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-10">
                {myOrders.length > 0 ? myOrders.map(o => (
                  <div key={o.id} className="bg-white border border-gray-100 p-12 rounded-[4rem] shadow-xl group flex flex-col md:flex-row justify-between items-center gap-10">
                     <div className="flex items-center space-x-10">
                        <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center font-brand font-black italic text-3xl shadow-xl group-hover:bg-red-600 transition-colors">
                           {o.id.slice(-1)}
                        </div>
                        <div>
                           <h5 className="text-3xl font-brand font-black italic uppercase leading-none mb-2 text-black">{o.product}</h5>
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Job ID: {o.id} // Node: {o.nodeId}</span>
                        </div>
                     </div>
                     <div className="flex items-center space-x-12">
                        <div className="text-right">
                           <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">{o.status}</span>
                           <span className="text-3xl font-brand font-black italic">€{o.value}</span>
                        </div>
                        <button onClick={() => generatePDF(o)} className="p-5 bg-red-50 text-red-600 rounded-3xl hover:bg-red-600 hover:text-white transition-all shadow-xl">
                          <Download className="w-6 h-6"/>
                        </button>
                     </div>
                  </div>
                )) : (
                  <div className="p-32 text-center opacity-10">
                     <Package className="w-32 h-32 mx-auto mb-10" />
                     <p className="text-[14px] font-black uppercase tracking-[1em]">Grid Vazio</p>
                  </div>
                )}
              </div>
           )}

           {subTab === 'products' && (isB2B || isAdmin) && (
              <div className="space-y-12 animate-in slide-in-from-bottom-10">
                 <div className="flex justify-between items-center">
                    <h3 className="text-4xl font-brand font-black italic uppercase">Gestão de <span className="text-red-600">Assets Industriais.</span></h3>
                    <button onClick={() => setShowAddProduct(true)} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all flex items-center space-x-3 shadow-xl">
                       <PlusCircle className="w-5 h-5"/> <span>Novo Ativo Gráfico</span>
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {myProducts.length > 0 ? myProducts.map(p => (
                      <div key={p.id} className="bg-white border border-gray-100 p-8 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:border-black transition-all">
                         <div className="flex items-center space-x-6">
                            <img src={p.image} className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                            <div>
                               <h5 className="text-2xl font-brand font-black italic uppercase leading-none mb-2">{p.name}</h5>
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'Ativo' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600 animate-pulse'}`}>
                                 {p.status}
                               </span>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="p-20 text-center col-span-2 opacity-20 italic font-black uppercase tracking-[0.5em]">Sem produtos próprios no catálogo.</div>
                    )}
                 </div>
              </div>
           )}

           {subTab === 'clients' && (isB2B || isAdmin) && (
              <div className="space-y-12 animate-in slide-in-from-bottom-10">
                 <div className="flex justify-between items-center">
                    <h3 className="text-4xl font-brand font-black italic uppercase">Meus <span className="text-red-600">Clientes Hub.</span></h3>
                    <button onClick={() => setShowAddClient(true)} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all flex items-center space-x-3 shadow-xl">
                       <UserPlus className="w-5 h-5"/> <span>Novo Cliente Local</span>
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-16 bg-gray-50 rounded-[4rem] text-center opacity-40 border border-gray-100 border-dashed">
                       <Users className="w-12 h-12 mx-auto mb-6 text-red-600"/>
                       <p className="text-[10px] font-black uppercase tracking-widest">Base de Dados em Sincronização Local</p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* SIDEBAR TELEMETRY */}
        <div className="xl:col-span-4 space-y-10">
           <div className="bg-black text-white p-14 rounded-[4.5rem] shadow-2xl border-b-[25px] border-red-600 animate-in slide-in-from-right-10 duration-1000">
              <Cpu className="w-16 h-16 text-red-600 mb-14 animate-pulse"/>
              <h4 className="text-5xl font-brand font-black italic uppercase tracking-tighter mb-12 leading-[0.9]">
                Célula <br/> <span className="text-red-600">{user.managedHubId || 'Master'}</span>
              </h4>
              <div className="space-y-8 font-mono text-[11px] opacity-70">
                 <div className="flex justify-between border-b border-white/10 pb-6">
                    <span>SYNC GRID:</span> <span className="text-green-500">OPT-IN ACTIVE</span>
                 </div>
                 <div className="flex justify-between">
                    <span>R2 HASH:</span> <span>{btoa(user.id).slice(0,12)}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>MEMBRO DESDE:</span> <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODAL: ADD PRODUCT (HUB B2B) */}
      {showAddProduct && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-16 border-[10px] border-red-600">
              <h3 className="text-4xl font-brand font-black italic uppercase mb-12">Adicionar <br/><span className="text-red-600">Ativo ao Catálogo.</span></h3>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                onCreateProduct({ 
                  id: `PRD-${Date.now()}`, 
                  name: newProduct.name, 
                  category: newProduct.category, 
                  description: 'Novo produto adicionado via terminal Hub B2B.', 
                  basePrice: parseFloat(newProduct.price), 
                  unit: 'un', 
                  image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', 
                  status: 'Aguardando Aprovação', 
                  ownerHubId: user.managedHubId || 'SYSTEM', 
                  specs: { weight: '---', durability: '---', precisionLevel: 'R2 Industrial' } 
                }); 
                setShowAddProduct(false); 
              }} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nome do Asset</label>
                    <input type="text" placeholder="EX: FLYER PREMIUM R2" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Categoria Grid</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as any})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all">
                       {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Preço Base (€)</label>
                    <input type="number" step="0.01" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required />
                 </div>
                 <div className="flex space-x-4 pt-6">
                    <button type="submit" className="flex-grow bg-black text-white p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-2xl">Submeter para Validação Master</button>
                    <button onClick={() => setShowAddProduct(false)} type="button" className="bg-gray-100 p-8 rounded-[2rem] text-black"><X className="w-8 h-8"/></button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT (HUB B2B) */}
      {showAddClient && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-16 border-[10px] border-red-600">
              <h3 className="text-4xl font-brand font-black italic uppercase mb-12">Registar <br/><span className="text-red-600">Entidade Local.</span></h3>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                onRegisterLocalClient({ 
                  id: `USR-L-${Date.now()}`, 
                  name: newClient.name, 
                  email: newClient.email, 
                  password: newClient.password, 
                  role: 'Cliente', 
                  status: 'Ativo', 
                  permissions: ['VIEW_ORDERS', 'PLACE_ORDERS'], 
                  tier: 'Bronze', 
                  joinedAt: Date.now(), 
                  createdByHubId: user.managedHubId 
                }); 
                setShowAddClient(false); 
              }} className="space-y-8">
                 <div className="relative"><Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"/><input type="text" placeholder="NOME DO CLIENTE" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"/><input type="email" placeholder="EMAIL" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"/><input type="password" placeholder="PASSWORD LOCAL" value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="flex space-x-4 pt-6">
                    <button type="submit" className="flex-grow bg-black text-white p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-2xl">Registar no Hub</button>
                    <button onClick={() => setShowAddClient(false)} type="button" className="bg-gray-100 p-8 rounded-[2rem] text-black"><X className="w-8 h-8"/></button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Account;
