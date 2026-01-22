
import React, { useMemo } from 'react';
import { ProductionJob, PartnerNode, Language } from '../types';
import { Activity, Globe, Zap, Cpu, Server, MapPin, Search } from 'lucide-react';

interface PublicGridProps {
  orders: ProductionJob[];
  hubs: PartnerNode[];
  language: Language;
}

const PublicGrid: React.FC<PublicGridProps> = ({ orders, hubs, language }) => {
  // Filtragem estrita de dados para anonimização pública
  const publicOrders = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Concluído')
      .map(o => ({
        id: o.id.replace('RL-', 'TX-'), // Máscara de ID
        product: o.product,
        status: o.status,
        progress: o.progress,
        node: o.nodeId,
        timestamp: o.timestamp
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [orders]);

  const totalActiveLoad = useMemo(() => {
    const totalCapacity = hubs.reduce((acc, h) => acc + h.capacity, 0);
    return Math.min(Math.round(totalCapacity / hubs.length), 100);
  }, [hubs]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Left Stats Console */}
        <div className="lg:w-1/3 space-y-8">
           <div className="bg-black text-white p-14 rounded-[4rem] border-t-[20px] border-red-600 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 industrial-grid opacity-5" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center space-x-4">
                    <Activity className="w-10 h-10 text-red-600 animate-pulse" />
                    <h2 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Global <br/>Live Load.</h2>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Grid Saturation</span>
                       <span className="text-3xl font-brand font-black italic">{totalActiveLoad}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${totalActiveLoad}%` }} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                    <div>
                       <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">Active Jobs</span>
                       <span className="text-2xl font-brand font-black italic">{publicOrders.length}</span>
                    </div>
                    <div>
                       <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">Grid Sync</span>
                       <span className="text-2xl font-brand font-black italic text-green-500">OPTIMAL</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl space-y-8">
              <h4 className="text-[11px] font-black uppercase text-black tracking-widest flex items-center">
                 <Globe className="w-5 h-5 mr-4 text-red-600" /> Regional Node Traffic
              </h4>
              <div className="space-y-6">
                 {hubs.map(h => (
                   <div key={h.id} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center space-x-4">
                         <div className={`w-2 h-2 rounded-full ${h.status === 'Online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-600'}`} />
                         <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-black transition-colors">{h.name}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-red-600">{h.capacity}% LOAD</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Live Telemetry Feed */}
        <div className="lg:w-2/3 bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-12 lg:p-24 relative overflow-hidden">
           <div className="absolute inset-0 industrial-grid opacity-20 pointer-events-none" />
           <div className="relative z-10">
              <div className="flex justify-between items-end mb-16">
                 <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Public <br/><span className="text-red-600">Telemetry Stream.</span></h3>
                 <div className="flex space-x-4">
                    <div className="bg-gray-50 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                       Auto-Refresh: 10s
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 {publicOrders.length > 0 ? publicOrders.map((o, i) => (
                   <div key={i} className="bg-gray-50/50 backdrop-blur-sm border border-gray-100 p-8 rounded-[3rem] hover:border-red-600/30 transition-all group flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex-grow space-y-4">
                         <div className="flex items-center space-x-6">
                            <span className="text-3xl font-brand font-black italic text-black uppercase opacity-60 group-hover:opacity-100 transition-opacity">{o.id}</span>
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black uppercase text-red-600 tracking-widest">Product Module</span>
                               <span className="text-[12px] font-black uppercase text-black italic">{o.product}</span>
                            </div>
                         </div>
                         <div className="flex items-center space-x-10 text-[9px] font-black uppercase text-gray-400 italic">
                            <div className="flex items-center space-x-2">
                               <Server className="w-3 h-3" />
                               <span>Node: {o.node}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                               <MapPin className="w-3 h-3" />
                               <span>Routed Via Grid</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="w-full md:w-64 space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-gray-400">{o.status}</span>
                            <span className="text-[12px] font-brand font-black italic">{o.progress}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-white rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full transition-all duration-1000 ${o.status === 'Em Produção' ? 'bg-red-600 animate-pulse' : 'bg-black'}`} 
                              style={{ width: `${o.progress}%` }} 
                            />
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="h-96 flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                      <Zap className="w-24 h-24 text-black" />
                      <span className="text-4xl font-brand font-black italic uppercase">Grid em Repouso.</span>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicGrid;
