
import React, { useMemo } from 'react';
import { ArrowRight, Zap, Globe, ShieldCheck, Cpu, Target, UserPlus, Server, Box, Layers, Users, ShoppingCart, Package, Activity, Monitor, BarChart3, Radio, RefreshCw, Terminal } from 'lucide-react';
import { Language, PartnerNode, User } from '../types';

interface HeroProps {
  onStart: () => void;
  onB2B: () => void;
  onRegister: () => void;
  language: Language;
  hubsCount?: number;
  usersCount?: number;
  ordersCount?: number;
  productsCount?: number;
  hubs?: PartnerNode[];
}

const Hero: React.FC<HeroProps> = ({ onStart, onB2B, onRegister, language, hubsCount = 0, usersCount = 0, ordersCount = 0, productsCount = 0, hubs = [] }) => {
  
  return (
    <div className="space-y-32">
      {/* Hero Section Master */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-red-50 rounded-full blur-[150px] opacity-50"></div>
           <div className="industrial-grid absolute inset-0 opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-[1500px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center space-x-3 bg-black text-white px-5 py-2.5 rounded-full shadow-2xl">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase">Rede Descentralizada Market R2 Ativa</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-brand font-black italic tracking-tighter leading-[0.85] text-black uppercase">
              INDUSTRIAL <br />
              <span className="text-red-600">MARKET.</span>
            </h1>
            
            <div className="space-y-8">
              <p className="text-xl md:text-3xl text-gray-500 font-medium leading-relaxed max-w-2xl border-l-8 border-red-600 pl-10 italic">
                A REDLINE MARKET fabrica ativos visuais através de um grid global de nodes industriais sincronizados em tempo real.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <button onClick={onStart} className="bg-red-600 text-white px-12 py-6 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-black hover:scale-105 transition-all shadow-2xl flex items-center group">
                  Novo Projeto R2 <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={onRegister} className="bg-black text-white px-12 py-6 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-red-600 transition-all flex items-center shadow-xl group">
                  <UserPlus className="mr-4 w-5 h-5 group-hover:scale-110" /> Registo de Cliente
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-gray-100">
               <div className="space-y-3">
                  <Server className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Hubs no Grid</span>
                  <span className="text-2xl font-brand font-black italic">{hubsCount} Units</span>
               </div>
               <div className="space-y-3">
                  <ShoppingCart className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Encomendas</span>
                  <span className="text-2xl font-brand font-black italic">{ordersCount} Live</span>
               </div>
               <div className="space-y-3">
                  <Package className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Ativos R2</span>
                  <span className="text-2xl font-brand font-black italic">{productsCount} Modules</span>
               </div>
               <div className="space-y-3">
                  <Users className="w-6 h-6 text-red-600" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Entidades</span>
                  <span className="text-2xl font-brand font-black italic">{usersCount} Active</span>
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

      {/* R2 GLOBAL TELEMETRY DASHBOARD - FUTURISTIC REFINEMENT */}
      <section className="bg-black py-40 relative overflow-hidden">
        <div className="absolute inset-0 industrial-grid opacity-5" />
        
        {/* Animated Laser Scan Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-0 w-full h-[1px] bg-red-600/30 blur-sm animate-[pulse_3s_infinite]" />
           <div className="absolute top-3/4 left-0 w-full h-[1px] bg-red-600/30 blur-sm animate-[pulse_4s_infinite]" />
        </div>

        <div className="max-w-[1500px] mx-auto px-6 relative z-10">
           <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
              <div className="space-y-6">
                 <div className="flex items-center space-x-4 mb-2">
                    <Terminal className="w-5 h-5 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500">Telemetry Stream v3.0</span>
                 </div>
                 <h2 className="text-7xl font-brand font-black italic uppercase text-white tracking-tighter leading-none">R2 <span className="text-red-600">Grid Monitoring.</span></h2>
              </div>
              <div className="flex items-center space-x-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
                 <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
                 <div>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">Grid Handshake</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Sync: Cluster-Central (0.002ms)</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Activity Monitor with Visual Enhancements */}
              <div className="lg:col-span-8 bg-[#070707] rounded-[5rem] border border-white/10 p-16 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-16 text-white/[0.03] font-brand font-black italic text-[20vw] select-none pointer-events-none">R3</div>
                 
                 <div className="flex items-center justify-between mb-20 relative z-10">
                    <div className="flex items-center space-x-6">
                       <div className="p-4 bg-red-600/10 rounded-2xl border border-red-600/30">
                          <Activity className="w-8 h-8 text-red-600" />
                       </div>
                       <h4 className="text-4xl font-brand font-black italic text-white uppercase tracking-tighter">Market Throughput</h4>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] bg-white/5 px-6 py-2 rounded-full border border-white/10">Master Auth: Verified</div>
                 </div>

                 {/* Real-time Dynamic Grid Chart */}
                 <div className="relative h-72 flex items-end justify-between gap-1.5 px-6 border-b border-white/5 pb-6 overflow-hidden">
                    {/* Background Visual Guide Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none pb-6">
                       <div className="w-full h-[1px] bg-white/50" />
                       <div className="w-full h-[1px] bg-white/50" />
                       <div className="w-full h-[1px] bg-white/50" />
                    </div>

                    {Array.from({ length: 48 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-red-600/20 hover:bg-red-600 transition-all duration-700 rounded-t-sm flex-grow relative group/bar"
                        style={{ height: `${Math.floor(Math.random() * 85) + 10}%` }}
                      >
                         <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1.5 rounded-lg text-[9px] font-black opacity-0 group-hover/bar:opacity-100 transition-all shadow-2xl z-20 scale-125 border-b-4 border-red-600">
                            {Math.floor(Math.random() * 100)}%
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between mt-8 text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
                    <span className="flex items-center"><Target className="w-3 h-3 mr-2" /> Start Protocol</span>
                    <span>Industrial Pulse Frequency (R3-Standard)</span>
                    <span className="text-white">{new Date().toLocaleTimeString()} (UTC)</span>
                 </div>
              </div>

              {/* Sidebar Metrics with Futuristic UX */}
              <div className="lg:col-span-4 space-y-8">
                 <div className="bg-[#0A0A0A] rounded-[4rem] border border-white/10 p-12 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full" />
                    <h5 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.5em] mb-6 flex items-center">
                       <Server className="w-4 h-4 mr-4 text-red-600" /> Operational Load
                    </h5>
                    {hubs.map((h) => (
                      <div key={h.id} className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-white uppercase italic tracking-widest">{h.name}</span>
                            <span className="text-[14px] font-brand font-black italic text-red-600">{h.capacity}%</span>
                         </div>
                         <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-red-900 to-red-600 rounded-full transition-all duration-[2000ms]" 
                              style={{ width: `${h.capacity}%` }} 
                            />
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Master Global KPIs */}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="bg-red-600 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-red-600/30 group hover:scale-105 transition-transform">
                       <Radio className="w-10 h-10 mb-8 animate-pulse" />
                       <span className="text-5xl font-brand font-black italic block leading-none">{usersCount}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest mt-4 opacity-60 block">Linked Entities</span>
                    </div>
                    <div className="bg-white rounded-[3.5rem] p-10 text-black shadow-2xl group hover:scale-105 transition-transform">
                       <Cpu className="w-10 h-10 mb-8 text-red-600" />
                       <span className="text-5xl font-brand font-black italic block leading-none">R3</span>
                       <span className="text-[9px] font-black uppercase tracking-widest mt-4 opacity-40 block">Handshake Ver</span>
                    </div>
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