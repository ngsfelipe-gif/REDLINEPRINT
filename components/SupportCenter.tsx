
import React from 'react';
import { MessageSquare, FileText, Phone, HelpCircle, ArrowRight, Zap, ShieldCheck, Mail } from 'lucide-react';

interface SupportCenterProps {
  onOpenTicket: () => void;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ onOpenTicket }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-40 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
        <div className="max-w-3xl">
          <h2 className="text-[10px] font-black text-red-600 uppercase tracking-[1em] mb-8">Suporte Especializado</h2>
          <h3 className="text-8xl font-brand font-black italic uppercase leading-[0.85] tracking-tighter">Centro de <br /> <span className="text-red-600">Engenharia.</span></h3>
          <p className="text-2xl text-gray-500 font-medium leading-relaxed mt-12 border-l-8 border-red-600 pl-10">
            Dúvidas sobre perfis de cor, materiais ou prazos? A nossa equipa de engenheiros gráficos está disponível para suporte atómico.
          </p>
        </div>
        <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-4">Tempo de Resposta</span>
          <span className="text-6xl font-brand font-black italic">14<span className="text-2xl opacity-50 font-normal ml-2">min</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-white border border-gray-100 p-12 rounded-[5rem] shadow-sm hover:shadow-2xl transition-all group">
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white mb-10 group-hover:rotate-12 transition-transform">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter">Live Chat <br /> Industrial</h4>
          <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-10">Conversa direta com um técnico de pré-impressão em tempo real.</p>
          <button className="flex items-center space-x-3 text-[10px] font-black uppercase text-red-600 tracking-widest group-hover:translate-x-4 transition-transform">
            <span>Iniciar Sessão</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-black text-white p-12 rounded-[5rem] shadow-2xl group">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-red-600 mb-10 group-hover:rotate-12 transition-transform">
            <FileText className="w-10 h-10" />
          </div>
          <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter">Centro de <br /> Conhecimento</h4>
          <p className="text-xs text-white/40 font-bold uppercase leading-relaxed tracking-widest mb-10">Guias técnicos sobre sangrias, cores spot e acabamentos especiais ISO.</p>
          <button className="flex items-center space-x-3 text-[10px] font-black uppercase text-white tracking-widest group-hover:translate-x-4 transition-transform">
            <span>Explorar Docs</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-gray-100 p-12 rounded-[5rem] shadow-sm hover:shadow-2xl transition-all group">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-black mb-10 group-hover:rotate-12 transition-transform">
            <Mail className="w-10 h-10" />
          </div>
          <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter">Tickets de <br /> Produção</h4>
          <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-10">Para questões complexas sobre encomendas em curso ou logística.</p>
          <button 
            onClick={onOpenTicket}
            className="flex items-center space-x-3 text-[10px] font-black uppercase text-black tracking-widest group-hover:translate-x-4 transition-transform"
          >
            <span>Abrir Ticket</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
