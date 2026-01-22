
import React, { useState } from 'react';
import { MessageSquare, FileText, ArrowRight, Zap, ShieldCheck, Mail, Cpu, Globe, X, Send, User, MessageCircle, AlertTriangle } from 'lucide-react';
import { PartnerNode, SupportTicket } from '../types';

interface SupportCenterProps {
  onOpenTicket: () => void;
  hubs: PartnerNode[];
  onTicketSubmit: (ticket: SupportTicket) => void;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ onOpenTicket, hubs, onTicketSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'Técnico',
    priority: 'Média' as 'Alta' | 'Média' | 'Baixa',
    targetHub: 'MASTER',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: `TK-G-${Math.floor(Math.random() * 9000) + 1000}`,
      subject: formData.subject,
      category: formData.category,
      status: 'Pendente',
      priority: formData.priority,
      timestamp: Date.now(),
      creatorId: `GUEST-${Date.now()}`,
      messages: [
        {
          id: 'm1',
          authorId: 'GUEST',
          authorName: formData.name,
          text: formData.message,
          timestamp: Date.now()
        }
      ]
    };
    onTicketSubmit(newTicket);
    setShowModal(false);
    setFormData({ name: '', email: '', subject: '', category: 'Técnico', priority: 'Média', targetHub: 'MASTER', message: '' });
  };

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-40 animate-in fade-in duration-700 industrial-grid min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-3 bg-red-50 text-red-600 px-4 py-2 rounded-full border border-red-100 mb-8">
             <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Terminal de Engenharia Ativo</span>
          </div>
          <h3 className="text-8xl font-brand font-black italic uppercase leading-[0.85] tracking-tighter">Support <br /> <span className="text-red-600">Quantum Node.</span></h3>
          <p className="text-2xl text-gray-400 font-medium leading-relaxed mt-12 border-l-8 border-red-600 pl-10 max-w-2xl">
            Sincronizamos a sua visão criativa com os nossos algoritmos de pré-impressão industrial. Suporte especializado em perfis ICC, tintas UV e acabamentos moleculares.
          </p>
        </div>
        <div className="bg-black text-white p-14 rounded-[4.5rem] shadow-2xl border-b-[20px] border-red-600 animate-in slide-in-from-right-10">
          <Cpu className="w-12 h-12 text-red-600 mb-8" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-4">Média de Resposta R2</span>
          <span className="text-7xl font-brand font-black italic leading-none">08<span className="text-2xl opacity-50 font-normal ml-2 tracking-tighter uppercase">min</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-white border border-gray-100 p-14 rounded-[5rem] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <MessageSquare className="w-40 h-40" />
          </div>
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white mb-10 group-hover:rotate-12 transition-transform shadow-xl">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter">Live Chat <br /> Industrial</h4>
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-10">Conecte-se instantaneamente a um técnico de calibração R2 através do nosso terminal AI flutuante.</p>
          <button className="flex items-center space-x-4 text-[11px] font-black uppercase text-red-600 tracking-[0.3em] group-hover:translate-x-4 transition-transform">
            <span>Terminal AI Ativo</span> <Zap className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-black text-white p-14 rounded-[5rem] shadow-2xl group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Globe className="w-40 h-40" />
          </div>
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-red-600 mb-10 group-hover:rotate-12 transition-transform shadow-xl">
            <FileText className="w-10 h-10" />
          </div>
          <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter">Knowledge <br /> R2 Cluster</h4>
          <p className="text-[11px] text-white/40 font-bold uppercase leading-relaxed tracking-widest mb-10">Guias técnicos avançados sobre FOGRA39, die-cutting e assets industriais disponíveis no catálogo.</p>
          <button className="flex items-center space-x-4 text-[11px] font-black uppercase text-white tracking-[0.3em] group-hover:translate-x-4 transition-transform">
            <span>Explorar Guias</span> <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white border border-gray-100 p-14 rounded-[5rem] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Zap className="w-40 h-40" />
          </div>
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-black mb-10 group-hover:rotate-12 transition-transform shadow-xl">
            <Mail className="w-10 h-10" />
          </div>
          <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter">Tickets de <br /> Produção</h4>
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-10">Protocolo seguro para gestão de incidentes técnicos ou logísticos para clientes e parceiros.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-4 text-[11px] font-black uppercase text-black tracking-[0.3em] group-hover:translate-x-4 transition-transform"
          >
            <span>Abrir Protocolo</span> <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8 animate-in fade-in">
           <div className="bg-white w-full max-w-4xl rounded-[5rem] p-20 shadow-2xl border-[15px] border-red-600 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowModal(false)} className="absolute top-12 right-12 p-4 text-gray-300 hover:text-black hover:rotate-90 transition-all"><X className="w-10 h-10"/></button>
              
              <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Novo Protocolo <br/><span className="text-red-600">de Suporte.</span></h3>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="relative group">
                       <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all" />
                       <input type="text" placeholder="NOME COMPLETO" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" required />
                    </div>
                    <div className="relative group">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-600 transition-all" />
                       <input type="email" placeholder="EMAIL DE CONTACTO" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600">
                          <option>Técnico</option>
                          <option>Logístico</option>
                          <option>Financeiro</option>
                          <option>Outro</option>
                       </select>
                       <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600">
                          <option>Alta</option>
                          <option>Média</option>
                          <option>Baixa</option>
                       </select>
                    </div>
                    <select value={formData.targetHub} onChange={e => setFormData({...formData, targetHub: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600">
                       <option value="MASTER">REDLINE CENTRAL (MASTER)</option>
                       {hubs.map(h => <option key={h.id} value={h.id}>DIRETO: {h.name}</option>)}
                    </select>
                 </div>
                 
                 <div className="space-y-8 flex flex-col">
                    <div className="relative flex-grow">
                       <MessageCircle className="absolute left-6 top-6 w-5 h-5 text-gray-300" />
                       <textarea placeholder="DESCREVA O INCIDENTE OU DÚVIDA COM DETALHE TÉCNICO..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full h-full min-h-[200px] bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" required />
                    </div>
                    <button type="submit" className="w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center group">
                       <span>Injetar Protocolo</span> <Send className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                 </div>
              </form>

              <div className="mt-12 p-8 bg-orange-50 rounded-[3rem] border border-orange-100 flex items-center space-x-6">
                 <AlertTriangle className="w-8 h-8 text-orange-600 shrink-0" />
                 <p className="text-[10px] font-black text-orange-800 uppercase italic leading-relaxed">Nota: Protocolos de convidados são validados em modo 'Sanitized'. Não inclua chaves privadas ou passwords no terminal de mensagem.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SupportCenter;
