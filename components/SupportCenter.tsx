
import React from 'react';
import { MessageSquare, FileText, ArrowRight, Zap, ShieldCheck, Mail, Cpu, Globe } from 'lucide-react';

interface SupportCenterProps {
  onOpenTicket: () => void;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ onOpenTicket }) => {
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
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-10">Conecte-se instantaneamente a um técnico de calibração R2.</p>
          <button className="flex items-center space-x-4 text-[11px] font-black uppercase text-red-600 tracking-[0.3em] group-hover:translate-x-4 transition-transform">
            <span>Iniciar Terminal</span> <ArrowRight className="w-5 h-5" />
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
          <p className="text-[11px] text-white/40 font-bold uppercase leading-relaxed tracking-widest mb-10">Guias técnicos avançados sobre FOGRA39, die-cutting e assets industriais.</p>
          <button className="flex items-center space-x-4 text-[11px] font-black uppercase text-white tracking-[0.3em] group-hover:translate-x-4 transition-transform">
            <span>Explorar Hub</span> <ArrowRight className="w-5 h-5" />
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
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-10">Protocolo seguro para gestão de incidentes técnicos ou logísticos.</p>
          <button 
            onClick={onOpenTicket}
            className="flex items-center space-x-4 text-[11px] font-black uppercase text-black tracking-[0.3em] group-hover:translate-x-4 transition-transform"
          >
            <span>Abrir Protocolo</span> <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
