
import React, { useState, useMemo } from 'react';
import { ProductionJob, User, PartnerNode, ExtendedProduct, Language, HubRegistrationRequest, AuthorizationRequest, Category } from '../types';
import { ShieldCheck, Zap, X, Eye, Server, Activity, Users, Globe, Trash2, UserPlus, CheckCircle2, Terminal, Lock, Unlock, Search, ShieldAlert, Mail, ArrowUpRight, UserCheck, Key, Edit, Save, Plus, Package, ShoppingCart, Calendar, Download, FileText, Image as ImageIcon, KeyRound, ChevronDown, ChevronUp, History, Info, Clock, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  onSound?: (type: 'click' | 'success' | 'sync' | 'error' | 'loading') => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  orders, hubs, users, user, products, hubRequests, authRequests, language, onUpdateStatus, onUpdateUser, onUpdateHub, onUpdateProduct, onUpdateOrder, onApproveHub, onApproveAuth, onImpersonate, onCreateUser, onCreateClient, onSound
}) => {
  const [activeView, setActiveView] = useState<'approvals' | 'orders' | 'hubs' | 'users' | 'products'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{type: 'user' | 'hub' | 'product' | 'order', data: any} | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [credentialModal, setCredentialModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  if (user?.role !== 'Administrador') return <div className="p-40 text-center font-brand font-black italic text-5xl uppercase opacity-20">Acesso Master Negado.</div>;

  const pendingApprovals = orders.filter(o => o.status === 'Aguardando Aprovação');
  const pendingUsers = users.filter(u => u.status === 'Pendente');

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeView === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (activeView === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term));
    if (activeView === 'products') return products.filter(p => p.name.toLowerCase().includes(term));
    if (activeView === 'hubs') return hubs.filter(h => h.name.toLowerCase().includes(term));
    return [];
  }, [users, orders, products, hubs, activeView, searchTerm]);

  const handleUpdateCredentials = () => {
    if (credentialModal && newPassword) {
      onUpdateUser(credentialModal.id, { password: newPassword });
      setCredentialModal(null);
      setNewPassword('');
      onSound?.('success');
    }
  };

  const generatePDF = (order: ProductionJob) => {
    onSound?.('sync');
    const doc = new jsPDF();
    doc.setFillColor(204, 0, 0); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
    doc.text("REDLINE R2 PRO", 20, 30);
    doc.setFontSize(10); doc.text("CERTIFICADO DE CONFORMIDADE INDUSTRIAL R2 v4.2", 20, 40);
    doc.setTextColor(0); doc.setFontSize(14);
    doc.text(`JOB ID: ${order.id}`, 20, 70);
    doc.text(`CLIENTE: ${order.client} (ID: ${order.clientId})`, 20, 80);
    doc.text(`PRODUTO: ${order.product}`, 20, 90);
    doc.text(`STATUS: ${order.status}`, 20, 100);
    doc.text(`VALOR: €${order.value}`, 20, 110);
    doc.text(`NODE DE PRODUÇÃO: ${order.nodeId}`, 20, 120);
    doc.text(`DIMENSÕES: ${order.dimensions || 'N/A'}`, 20, 130);
    doc.text(`MATERIAL: ${order.material}`, 20, 140);
    doc.save(`REDLINE_MASTER_CERT_${order.id}.pdf`);
    onSound?.('success');
  };

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
            <h2 className="text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Torre de <br/><span className="text-red-600">Controlo.</span></h2>
            <div className="flex items-center space-x-6 mt-10">
               <div className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl border-l-8 border-red-600">
                 <ShieldCheck className="w-4 h-4 mr-3 text-red-600" /> MASTER SESSION: VERIFIED
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100 gap-3">
             {['approvals', 'orders', 'hubs', 'users', 'products'].map(v => (
               <button key={v} onClick={() => { onSound?.('click'); setActiveView(v as any); }} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeView === v ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {v} {(v === 'approvals' && (pendingApprovals.length + pendingUsers.length) > 0) && <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-full text-[8px] animate-pulse">{pendingApprovals.length + pendingUsers.length}</span>}
               </button>
             ))}
          </div>
        </div>

        {activeView !== 'approvals' && (
           <div className="mb-12 flex justify-between items-center gap-8">
              <div className="flex items-center space-x-6 w-full max-w-xl bg-white p-1 rounded-3xl border border-gray-100 shadow-xl">
                 <div className="p-4"><Search className="w-5 h-5 text-gray-300" /></div>
                 <input type="text" placeholder={`PESQUISAR EM ${activeView.toUpperCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent flex-grow outline-none font-black uppercase text-[10px]" />
              </div>
           </div>
        )}

        {/* Orders Table with Deep Protocol View Refined */}
        {activeView === 'orders' && (
           <div className="space-y-8">
              {filteredItems.map((o: any) => (
                 <div key={o.id} className={`bg-white rounded-[4.5rem] border transition-all duration-500 overflow-hidden shadow-2xl ${expandedOrder === o.id ? 'border-black ring-4 ring-black/5' : 'border-gray-100 hover:border-red-600/30'}`}>
                    <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                       <div className="flex-grow">
                          <div className="flex items-center space-x-8 mb-6">
                             <span className="text-4xl font-brand font-black italic text-black uppercase tracking-tighter">{o.id}</span>
                             <div className="flex items-center space-x-3 bg-red-50 text-red-600 px-6 py-2 rounded-full border border-red-100">
                                <Activity className="w-4 h-4 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{o.status}</span>
                             </div>
                             <div className="hidden lg:flex items-center space-x-3 text-gray-300">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{new Date(o.timestamp).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-[11px] font-black uppercase text-gray-400 italic">
                             <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Cliente Master</span><span className="text-black">{o.client}</span></div>
                             <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Módulo Produto</span><span className="text-black">{o.product}</span></div>
                             <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Node Industrial</span><span className="text-red-600">{o.nodeId}</span></div>
                             <div className="space-y-1"><span className="block text-[8px] text-gray-300 tracking-[0.3em]">Capital Ativo</span><span className="text-black font-brand">€{o.value}</span></div>
                          </div>
                       </div>
                       <div className="flex space-x-4">
                          <button onClick={() => { onSound?.('click'); setExpandedOrder(expandedOrder === o.id ? null : o.id); }} className={`p-8 rounded-full transition-all duration-500 shadow-xl ${expandedOrder === o.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-black hover:text-white'}`}>
                             {expandedOrder === o.id ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
                          </button>
                          <button onClick={() => generatePDF(o)} className="p-8 bg-gray-50 text-black rounded-full hover:bg-black hover:text-white transition-all shadow-xl">
                             <FileText className="w-8 h-8" />
                          </button>
                          <button onClick={() => { onSound?.('click'); setEditingItem({type: 'order', data: {...o}}); }} className="p-8 bg-black text-white rounded-full hover:bg-red-600 transition-all shadow-xl">
                             <Edit className="w-8 h-8" />
                          </button>
                       </div>
                    </div>

                    {/* Deep Protocol View - Detalhamento Completo */}
                    {expandedOrder === o.id && (
                       <div className="p-16 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-6 duration-700">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                             
                             {/* Specs Técnicas */}
                             <div className="lg:col-span-4 space-y-10">
                                <h6 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center border-l-4 border-red-600 pl-4">
                                   <Zap className="w-4 h-4 mr-3" /> Protocolo Técnico
                                </h6>
                                <div className="space-y-5 bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
                                   <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                      <span className="text-[9px] font-black uppercase text-gray-400">Substrato</span>
                                      <span className="text-[12px] font-black uppercase text-black">{o.material}</span>
                                   </div>
                                   <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                      <span className="text-[9px] font-black uppercase text-gray-400">Acabamento</span>
                                      <span className="text-[12px] font-black uppercase text-black">{o.finish}</span>
                                   </div>
                                   <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                      <span className="text-[9px] font-black uppercase text-gray-400">Dimensões</span>
                                      <span className="text-[12px] font-black uppercase text-black">{o.dimensions}</span>
                                   </div>
                                   <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                      <span className="text-[9px] font-black uppercase text-gray-400">Volumetria</span>
                                      <span className="text-[12px] font-black uppercase text-black">{o.quantity} UN</span>
                                   </div>
                                   {o.fileName && (
                                      <div className="pt-4 flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                                         <ImageIcon className="w-6 h-6 text-red-600" />
                                         <div className="flex-grow">
                                            <span className="text-[8px] font-black uppercase text-gray-400 block">Asset Digital</span>
                                            <span className="text-[10px] font-black uppercase text-black line-clamp-1">{o.fileName}</span>
                                         </div>
                                         <Download className="w-4 h-4 text-gray-300 hover:text-red-600 cursor-pointer" />
                                      </div>
                                   )}
                                </div>
                             </div>

                             {/* Histórico e Observações */}
                             <div className="lg:col-span-8 space-y-10">
                                <h6 className="text-[11px] font-black uppercase text-black tracking-[0.5em] flex items-center border-l-4 border-black pl-4">
                                   <History className="w-4 h-4 mr-3" /> Industrial Transactions
                                </h6>
                                <div className="space-y-6">
                                   <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 min-h-[150px]">
                                      <span className="text-[8px] font-black uppercase text-gray-300 block mb-6 tracking-widest">Protocol Stream</span>
                                      <div className="space-y-6">
                                         {o.history?.map((log: any, idx: number) => (
                                            <div key={idx} className="flex gap-6 group/log">
                                               <div className="flex flex-col items-center">
                                                  <div className="w-3 h-3 rounded-full bg-red-600 border-4 border-white ring-2 ring-red-600 shadow-lg" />
                                                  {idx !== o.history.length - 1 && <div className="w-[2px] flex-grow bg-gray-100 group-hover/log:bg-red-200 transition-colors" />}
                                               </div>
                                               <div className="pb-6">
                                                  <div className="flex items-center space-x-4 mb-1">
                                                     <span className="text-[10px] font-black uppercase text-black">{log.status}</span>
                                                     <span className="text-[8px] font-mono text-gray-300 bg-gray-50 px-3 py-0.5 rounded-full">{new Date(log.timestamp).toLocaleString()}</span>
                                                  </div>
                                                  <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed uppercase tracking-widest">{log.note}</p>
                                               </div>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                   
                                   {o.observations && (
                                      <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-100 flex items-start space-x-6">
                                         <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                                         <div>
                                            <span className="text-[8px] font-black uppercase text-orange-800 tracking-widest block mb-2">Operador Notes</span>
                                            <p className="text-[11px] font-black text-orange-900 uppercase italic leading-relaxed">{o.observations}</p>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        )}

        {/* Demais Views (Approvals, Hubs, Users, Products) mantidas para garantir integridade */}
        {activeView === 'approvals' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-10">
             {pendingUsers.length > 0 && (
               <div className="space-y-8">
                  <h3 className="text-4xl font-brand font-black italic uppercase">Entidades em <span className="text-red-600">Quarentena.</span></h3>
                  <div className="grid grid-cols-1 gap-4">
                     {pendingUsers.map(u => (
                       <div key={u.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl flex justify-between items-center group hover:border-red-600 transition-all">
                          <div className="flex items-center space-x-6">
                             <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center font-brand font-black italic text-xl">{u.name[0]}</div>
                             <div>
                                <span className="text-2xl font-brand font-black italic uppercase text-black block">{u.name}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.email} // Tier: {u.tier}</span>
                             </div>
                          </div>
                          <div className="flex space-x-3">
                             <button onClick={() => { onSound?.('success'); onUpdateUser(u.id, { status: 'Ativo' }); }} className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all">Autorizar Acesso</button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             <div className="space-y-8">
               <h3 className="text-4xl font-brand font-black italic uppercase">Fila de <span className="text-red-600">Handshake Industrial.</span></h3>
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
                             <div><span className="block text-gray-300">Substrato</span>{o.material}</div>
                             <div><span className="block text-gray-300">Capital</span>€{o.value}</div>
                          </div>
                       </div>
                       <div className="flex items-center space-x-4">
                          <select className="bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase" id={`h-${o.id}`}>
                             <option value="">NODO...</option>
                             {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                          </select>
                          <button onClick={() => {
                            const h = (document.getElementById(`h-${o.id}`) as HTMLSelectElement).value;
                            if(h) { onSound?.('success'); onUpdateStatus(o.id, 'Aprovado', h); }
                          }} className="bg-black text-white p-5 rounded-full hover:bg-green-600 transition-all shadow-xl"><CheckCircle2/></button>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        )}

        {/* Seção de Listagem para as outras views (Users, Hubs, Products) */}
        <div className="grid grid-cols-1 gap-4">
          {activeView !== 'approvals' && activeView !== 'orders' && filteredItems.map((item: any) => (
             <div key={item.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-50 hover:border-black shadow-lg transition-all flex items-center justify-between">
                <div className="flex items-center space-x-8">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-brand font-black italic text-xl shadow-inner ${activeView === 'users' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                      {item.name ? item.name[0] : '#'}
                   </div>
                   <div>
                      <h5 className="text-xl font-brand font-black italic uppercase text-black">{item.name || item.id}</h5>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.email || item.category || item.status}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                   {(activeView === 'users' || activeView === 'hubs') && (
                      <button 
                        onClick={() => {
                          const targetUser = activeView === 'users' ? item : users.find(u => u.managedHubId === item.id);
                          if (targetUser) onImpersonate(targetUser);
                        }} 
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2"
                      >
                         <ArrowUpRight className="w-4 h-4" /> <span>Shadow</span>
                      </button>
                   )}
                   {(activeView === 'users' || activeView === 'hubs') && (
                      <button 
                        onClick={() => {
                          const u = activeView === 'users' ? item : users.find(u => u.managedHubId === item.id);
                          if(u) setCredentialModal(u);
                        }} 
                        className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all"
                      >
                         <KeyRound className="w-5 h-5" />
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

      {/* Modal de Gestão de Credenciais Master */}
      {credentialModal && (
        <div className="fixed inset-0 z-[7000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[4rem] p-16 shadow-2xl border-[15px] border-black relative">
              <button onClick={() => setCredentialModal(null)} className="absolute top-10 right-10 p-4 text-gray-300 hover:text-black transition-all"><X className="w-8 h-8"/></button>
              <h3 className="text-3xl font-brand font-black italic uppercase mb-10">Master <span className="text-red-600">Auth Control.</span></h3>
              <div className="space-y-8">
                 <div className="bg-gray-50 p-6 rounded-3xl">
                    <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Entidade</span>
                    <span className="text-xl font-brand font-black italic text-black uppercase">{credentialModal.name}</span>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400">Nova Password R3</label>
                    <input 
                      type="text" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="GERAR TOKEN..."
                      className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600"
                    />
                 </div>
                 <button onClick={handleUpdateCredentials} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 mr-3" /> Atualizar Credencial
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Outros modais mantidos por compatibilidade */}
      {editingItem && (
        <div className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-16 shadow-2xl border-[15px] border-red-600 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setEditingItem(null)} className="absolute top-12 right-12 p-4 text-gray-300 hover:text-black"><X className="w-8 h-8"/></button>
              <h3 className="text-3xl font-brand font-black italic uppercase mb-10">Edição <span className="text-red-600">Granular R2.</span></h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Nome do Recurso</label>
                    <input type="text" value={editingItem.data.name || editingItem.data.id} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600" />
                 </div>
                 <button onClick={handleSaveEdit} className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center">
                    <Save className="w-5 h-5 mr-4" /> Aplicar Master
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
