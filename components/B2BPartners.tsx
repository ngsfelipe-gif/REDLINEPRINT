
import React, { useState } from 'react';
import { MOCK_NODES } from '../constants';
import { Globe, Cpu, Zap, MapPin, Activity, ShieldCheck, ArrowRight, Server, Building, Mail, Package, X, MessageSquare, Send, ShieldAlert, AlertTriangle } from 'lucide-react';
import { HubRegistrationRequest, PartnerNode, SupportTicket } from '../types';

interface B2BPartnersProps {
  hubs: PartnerNode[];
  onApply: (req: HubRegistrationRequest) => void;
  onTicketSubmit: (ticket: SupportTicket) => void;
}

const B2BPartners: React.FC<B2BPartnersProps> = ({ hubs, onApply, onTicketSubmit }) => {
  const [showApply, setShowApply] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState<PartnerNode | null>(null);
  const [formData, setFormData] = useState({ company: '', email: '', location: '', park: '' });
  const [ticketData, setTicketData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTicketModal) return;
    
    const newTicket: SupportTicket = {
      id: `TK-H-${Math.floor(Math.random() * 9000) + 1000}`,
      subject: ticketData.subject,
      category: 'Técnico / HUB Direct',
      status: 'Pendente',
      priority: 'Média',
      timestamp: Date.now(),
      creatorId: `GUEST-${Date.now()}`,
      targetHubId: showTicketModal.id,
      messages: [
        {
          id: 'm1',
          authorId: 'GUEST',
          authorName: ticketData.name,
          text: ticketData.message,
          timestamp: Date.now()
        }
      ]
    };
    onTicketSubmit(newTicket);
    setShowTicketModal(null);
    setTicketData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40 lg:pt-48">
      <div className="mb-24 flex flex-col lg:flex-row justify-between items-end gap-16 animate-in slide-in-from-bottom-10">
        <div className="max-w-3xl">
          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em] mb-6 flex items-center"><Globe className="w-5 h-5 mr-4" /> Redline Industrial Grid</h4>
          <h3 className="text-8xl font-brand font-black italic uppercase tracking-tighter leading-[0.85] mb-10 text-black">Nodos de <br /> <span className="text-red-600">Manufatura Global.</span></h3>
          <p className="text-2xl text-gray-400 font-medium leading-relaxed italic border-l-8 border-red-600 pl-10">Directório público de unidades fabris certificadas R2. Cada nodo opera de forma independente, sincronizado pelo cluster central REDLINE.</p>
        </div>
        <button onClick={() => setShowApply(true)} className="bg-black text-white px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] hover:bg-red-600 transition-all shadow-2xl flex items-center space-x-6 group border-b-[10px] border-red-900/30">
          <Server className="w-8 h-8 group-hover:scale-110" /> <span>Provisionar Minha Unidade</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {hubs.map((node) => (
          <div key={node.id} className="bg-white rounded-[4rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col group hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:scale-[1.02]">
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 shadow-inner">
               <img src={node.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
               <div className="absolute top-8 left-8 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 z-10">{node.id}</div>
               <div className={`absolute bottom-8 right-8 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest z-10 ${node.status === 'Online' ? 'bg-green-500 text-white status-pulse' : 'bg-orange-500 text-white'}`}>{node.status}</div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="p-12 flex flex-col flex-grow relative">
              <div className="mb-10 flex-grow">
                <div className="flex items-center text-gray-400 space-x-3 mb-4"><MapPin className="w-4 h-4 text-red-600" /><span className="text-[10px] font-black uppercase tracking-widest italic">{node.location}</span></div>
                <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6 group-hover:text-red-600 transition-colors">{node.name}</h4>
                <p className="text-[12px] font-medium text-gray-500 leading-relaxed italic line-clamp-3">{node.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-50 mb-12">
                <div className="space-y-4">
                   <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest flex items-center"><Activity className="w-4 h-4 mr-3 text-red-600" /> Active Load</span>
                   <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div className="h-full bg-black group-hover:bg-red-600 transition-all duration-1000" style={{ width: `${node.capacity}%` }} />
                   </div>
                   <span className="text-[12px] font-brand font-black italic text-black">{node.capacity}%</span>
                </div>
                <div className="space-y-4">
                   <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest flex items-center"><Zap className="w-4 h-4 mr-3 text-red-600" /> Latency R2</span>
                   <span className="text-[12px] font-brand font-black italic text-black block mt-2">{node.latency}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                 <button 
                  onClick={() => setShowTicketModal(node)}
                  className="p-8 bg-gray-50 text-black rounded-3xl hover:bg-black hover:text-white transition-all shadow-lg group/btn flex items-center justify-center"
                 >
                    <MessageSquare className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                 </button>
                 <button className="flex-grow bg-black text-white p-8 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl group/btn flex items-center justify-center space-x-6">
                    <span>Conectar Nodo</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-4 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CANDIDATURA HUB */}
      {showApply && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[5rem] shadow-2xl p-20 border-[20px] border-red-600 overflow-y-auto max-h-[90vh] relative">
              <button onClick={() => setShowApply(false)} className="absolute top-12 right-12 p-4 text-gray-300 hover:text-black hover:rotate-90 transition-all"><X className="w-10 h-10"/></button>
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12 leading-none">Expandir o <br/><span className="text-red-600">Grid Industrial.</span></h3>
              <form onSubmit={(e) => { e.preventDefault(); onApply({ id: `HUB-REQ-${Date.now()}`, companyName: formData.company, email: formData.email, location: formData.location, machinePark: formData.park, timestamp: Date.now(), status: 'Pendente' }); setShowApply(false); }} className="space-y-8">
                 <div className="relative group">
                    <Building className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <input type="text" placeholder="NOME DA EMPRESA / UNIDADE" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" required />
                 </div>
                 <div className="relative group">
                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <input type="email" placeholder="EMAIL CORPORATIVO" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" required />
                 </div>
                 <div className="relative group">
                    <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <input type="text" placeholder="LOCALIZAÇÃO (CIDADE, PAÍS)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" required />
                 </div>
                 <div className="relative group">
                    <Package className="absolute left-8 top-8 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <textarea placeholder="DESCRIÇÃO DO PARQUE DE MÁQUINAS (EQUIPAMENTOS E CAPACIDADES)" value={formData.park} onChange={e => setFormData({...formData, park: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 transition-all h-40 shadow-inner" required />
                 </div>
                 <button type="submit" className="w-full bg-black text-white p-12 rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-[16px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-6 group">
                    <span>Submeter Pedido Master</span> <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE TICKET DIRETO AO HUB */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-3xl rounded-[5rem] p-20 shadow-2xl border-[15px] border-black relative">
              <button onClick={() => setShowTicketModal(null)} className="absolute top-12 right-12 p-4 text-gray-300 hover:text-black hover:rotate-90 transition-all"><X className="w-10 h-10"/></button>
              
              <div className="flex items-center space-x-6 mb-12">
                 <div className="p-5 bg-red-600 rounded-3xl text-white shadow-xl"><MessageSquare className="w-10 h-10"/></div>
                 <h3 className="text-5xl font-brand font-black italic uppercase leading-none">Mensagem <br/><span className="text-red-600">Direta ao Hub.</span></h3>
              </div>

              <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 mb-12 flex items-center space-x-6">
                 <Server className="w-10 h-10 text-red-600" />
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Protocolo Direto Node:</span>
                    <span className="text-2xl font-brand font-black italic text-black uppercase block">{showTicketModal.name}</span>
                 </div>
              </div>

              <form onSubmit={handleTicketSubmit} className="space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <input type="text" placeholder="SEU NOME" value={ticketData.name} onChange={e => setTicketData({...ticketData, name: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" required />
                    <input type="email" placeholder="SEU EMAIL" value={ticketData.email} onChange={e => setTicketData({...ticketData, email: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" required />
                 </div>
                 <input type="text" placeholder="ASSUNTO DO PROTOCOLO" value={ticketData.subject} onChange={e => setTicketData({...ticketData, subject: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" required />
                 <textarea placeholder="DESCREVA SUA SOLICITAÇÃO TÉCNICA..." value={ticketData.message} onChange={e => setTicketData({...ticketData, message: e.target.value})} className="w-full h-40 bg-gray-50 p-8 rounded-[2.5rem] font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" required />
                 
                 <div className="p-8 bg-orange-50 rounded-[3rem] border border-orange-100 flex items-center space-x-6 mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-600 shrink-0" />
                    <p className="text-[10px] font-black text-orange-800 uppercase italic leading-relaxed">Nota: Tickets de convidados são filtrados pelo Cluster Central para segurança e auditoria.</p>
                 </div>

                 <button type="submit" className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[13px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-6 group">
                    <span>Injetar Protocolo Direto</span> <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default B2BPartners;
