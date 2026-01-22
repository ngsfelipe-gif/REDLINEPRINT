
import React from 'react';
import { ArrowRight, Zap, Globe, ShieldCheck, Cpu, Target, UserPlus, Server, Box, Layers } from 'lucide-react';
import { Language } from '../types';

// Fixed missing language prop in Hero component
const Hero: React.FC<{ onStart: () => void, onB2B: () => void, onRegister: () => void, language: Language }> = ({ onStart, onB2B, onRegister, language }) => {
  return (
    <div className="space-y-32">
      {/* Hero Section Master */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-red-50 rounded-full blur-[150px] opacity-50"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-gray-50 rounded-full blur-[120px] opacity-30"></div>
           <div className="industrial-grid absolute inset-0 opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-[1500px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center space-x-3 bg-black text-white px-5 py-2.5 rounded-full shadow-2xl">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase">Rede Descentralizada R2 Ativa</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-brand font-black italic tracking-tighter leading-[0.85] text-black uppercase">
              INDUSTRIAL <br />
              <span className="text-red-600">PRODUCTION.</span>
            </h1>
            
            <div className="space-y-8">
              <p className="text-xl md:text-3xl text-gray-500 font-medium leading-relaxed max-w-2xl border-l-8 border-red-600 pl-10 italic">
                A REDLINE PRINT não imprime papel. Nós fabricamos ativos visuais atómicos através de um grid global de nodes industriais sincronizados.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <button onClick={onStart} className="bg-red-600 text-white px-12 py-6 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-black hover:scale-105 transition-all shadow-2xl flex items-center group">
                  Novo Projeto R2 <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={onRegister} className="bg-black text-white px-12 py-6 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-red-600 transition-all flex items-center shadow-xl group">
                  <UserPlus className="mr-4 w-5 h-5 group-hover:scale-110" /> Registo de Cliente
                </button>
                <button onClick={onB2B} className="bg-white border-2 border-black text-black px-12 py-6 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-black hover:text-white transition-all shadow-lg">
                  Portal de Hubs
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-gray-100">
               <div className="space-y-3">
                  <Target className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Precisão de Node</span>
                  <span className="text-2xl font-brand font-black italic">0.01mm</span>
               </div>
               <div className="space-y-3">
                  <Cpu className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">IA Pre-Flight</span>
                  <span className="text-2xl font-brand font-black italic">Active</span>
               </div>
               <div className="space-y-3">
                  <Globe className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Nodes Globais</span>
                  <span className="text-2xl font-brand font-black italic">14 Units</span>
               </div>
               <div className="space-y-3">
                  <Zap className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Sincronia R2</span>
                  <span className="text-2xl font-brand font-black italic">Realtime</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block animate-in zoom-in duration-1000 relative">
             <div className="absolute inset-0 bg-red-600 rounded-[5rem] rotate-3 blur-3xl opacity-10"></div>
             <div className="relative z-10 w-full aspect-[4/5] bg-white rounded-[5rem] overflow-hidden shadow-2xl border-[15px] border-white group hover:rotate-0 transition-all duration-700">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-16 left-16 text-white space-y-4">
                  <span className="text-[12px] font-black uppercase tracking-[0.8em] text-red-600">Node Status: Active</span>
                  <h4 className="text-6xl font-brand font-black italic leading-[0.9] tracking-tighter">FUTURE <br/> GRID.</h4>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="max-w-[1500px] mx-auto px-6 py-24">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <h3 className="text-7xl font-brand font-black italic uppercase leading-none tracking-tighter">O Grid de <br /> <span className="text-red-600">Manufatura.</span></h3>
               <p className="text-2xl text-gray-400 font-medium leading-relaxed italic border-l-8 border-red-600 pl-10">
                  A nossa tecnologia elimina a necessidade de logística pesada. O seu ficheiro é processado quânticamente e injetado no node mais próximo da entrega final.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="p-10 bg-gray-50 rounded-[3.5rem] hover:bg-black hover:text-white transition-all group">
                     <Server className="w-12 h-12 text-red-600 mb-8 group-hover:scale-110" />
                     <h5 className="text-2xl font-brand font-black italic uppercase mb-4">Edge Production</h5>
                     <p className="text-[11px] uppercase font-black tracking-widest opacity-40">Produção no limite da rede para latência zero.</p>
                  </div>
                  <div className="p-10 bg-gray-50 rounded-[3.5rem] hover:bg-black hover:text-white transition-all group">
                     <Layers className="w-12 h-12 text-red-600 mb-8 group-hover:scale-110" />
                     <h5 className="text-2xl font-brand font-black italic uppercase mb-4">Atomic Detail</h5>
                     <p className="text-[11px] uppercase font-black tracking-widest opacity-40">Calibração de cor a nível molecular ISO-R2.</p>
                  </div>
               </div>
            </div>
            <div className="relative">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-8 pt-24">
                     <div className="aspect-square bg-black rounded-[3rem] p-12 flex flex-col justify-between shadow-2xl">
                        <Box className="w-10 h-10 text-red-600" />
                        <span className="text-4xl font-brand font-black italic text-white leading-none">ZERO <br/> WASTE.</span>
                     </div>
                     <img src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=800" className="w-full aspect-[4/5] object-cover rounded-[3rem] shadow-xl" />
                  </div>
                  <div className="space-y-8">
                     <img src="https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=800" className="w-full aspect-[4/5] object-cover rounded-[3rem] shadow-xl" />
                     <div className="aspect-square bg-red-600 rounded-[3rem] p-12 flex flex-col justify-between shadow-2xl">
                        <Zap className="w-10 h-10 text-white" />
                        <span className="text-4xl font-brand font-black italic text-white leading-none">SYNC <br/> GRID.</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Hero;
