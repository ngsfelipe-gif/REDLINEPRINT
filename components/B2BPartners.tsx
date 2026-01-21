
import React from 'react';
import { MOCK_NODES } from '../constants';
import { Globe, Cpu, Zap, MapPin, Activity, ShieldCheck, ArrowRight, Server } from 'lucide-react';

const B2BPartners: React.FC = () => {
  return (
    <div className="max-w-[1500px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40 lg:pt-48">
      <div className="mb-16">
        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-4 flex items-center">
          <Globe className="w-4 h-4 mr-3" /> Redline Global Grid
        </h4>
        <h3 className="text-6xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6">
          Nodos de <br /> <span className="text-red-600">Produção Ativa.</span>
        </h3>
        <p className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed italic border-l-4 border-red-600 pl-8">
          Directório B2B de unidades fabris certificadas com conexão redundante ao Hub R2. Estas empresas disponibilizam o seu parque de máquinas para a rede global Redline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {MOCK_NODES.map((node) => (
          <div key={node.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-700">
            <div className="relative aspect-video overflow-hidden">
               <img src={node.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={node.name} />
               <div className="absolute top-6 left-6 bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl border border-white/10">
                 {node.id}
               </div>
               <div className={`absolute bottom-6 right-6 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-2xl ${node.status === 'Online' ? 'bg-green-500 text-white status-pulse' : 'bg-orange-500 text-white'}`}>
                 {node.status}
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            </div>

            <div className="p-10 flex flex-col flex-grow">
              <div className="mb-8 flex-grow">
                <div className="flex items-center text-gray-400 space-x-2 mb-2">
                   <MapPin className="w-3 h-3 text-red-600" />
                   <span className="text-[9px] font-black uppercase tracking-widest">{node.location}</span>
                </div>
                <h4 className="text-2xl font-brand font-black italic uppercase tracking-tighter leading-none mb-4 group-hover:text-red-600 transition-colors">{node.name}</h4>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic mb-6">
                  {node.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {node.specialization.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[8px] font-black uppercase text-gray-400 tracking-widest flex items-center">
                      <Server className="w-3 h-3 mr-2" /> {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-50 mb-8">
                <div className="space-y-2">
                  <span className="text-[7px] font-black uppercase text-gray-300 tracking-widest flex items-center">
                     <Activity className="w-3 h-3 mr-2 text-red-600" /> Load Capacity
                  </span>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black transition-all duration-1000" style={{ width: `${node.capacity}%` }} />
                  </div>
                  <span className="text-[10px] font-brand font-black italic">{node.capacity}%</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[7px] font-black uppercase text-gray-300 tracking-widest flex items-center">
                     <Zap className="w-3 h-3 mr-2 text-red-600" /> Latency R2
                  </span>
                  <span className="text-[10px] font-brand font-black italic block">{node.latency}</span>
                </div>
              </div>

              <button className="w-full bg-black text-white p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl group flex items-center justify-center space-x-4">
                 <span>Conectar para Produção</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default B2BPartners;
