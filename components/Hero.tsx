
import React from 'react';
import { ArrowRight, Zap, Globe, ShieldCheck, Trophy, Target } from 'lucide-react';

const Hero: React.FC<{ onStart: () => void, onB2B: () => void }> = ({ onStart, onB2B }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white pt-24 lg:pt-0">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-red-50 rounded-full blur-[150px] opacity-50"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-gray-50 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7 space-y-8 fade-in-up">
          <div className="inline-flex items-center space-x-3 bg-black/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-black">Hub Frankfurt // v6.0 Ativo</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-brand font-black italic tracking-tighter leading-[0.85] text-black uppercase">
            RED<span className="text-red-600">LINE</span> <br />
            PRINTING.
          </h1>
          
          <div className="space-y-6">
            <p className="text-lg md:text-2xl text-gray-500 font-medium leading-relaxed max-w-xl border-l-4 border-red-600 pl-8">
              Engenharia gráfica de deposição molecular para marcas de prestígio. Precisão industrial com acabamento de laboratório.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStart}
                className="bg-red-600 text-white px-10 py-5 font-black uppercase tracking-[0.4em] text-[10px] rounded-xl hover:bg-black hover:scale-105 transition-all shadow-xl flex items-center justify-center group"
              >
                Configurador de Projetos
                <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
              <button onClick={onB2B} className="bg-white border-2 border-black text-black px-10 py-5 font-black uppercase tracking-[0.4em] text-[10px] rounded-xl hover:bg-black hover:text-white transition-all flex items-center justify-center">
                Portal Empresarial B2B
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-gray-100 max-w-2xl">
             <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-red-600" /> 
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Precisão Submétrica</span>
             </div>
             <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-red-600" /> 
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Certificado ISO</span>
             </div>
             <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-red-600" /> 
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Entrega 12h-24h</span>
             </div>
             <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-red-600" /> 
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Logística Pan-Europeia</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 hidden lg:block relative">
           <div className="relative z-10 w-full aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white transform rotate-2 hover:rotate-0 transition-all duration-700 group">
              <img 
                src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1200" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                alt="Produção Gráfica Industrial"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-1 block">Node R2 Frankfurt</span>
                <span className="text-2xl font-brand font-black italic block leading-none">DIGITAL PRESS HUB</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
