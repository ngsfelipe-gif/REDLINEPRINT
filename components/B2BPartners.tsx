
import React, { useState } from 'react';
import { MOCK_NODES } from '../constants';
// Added X to the imports
import { Globe, Cpu, Zap, MapPin, Activity, ShieldCheck, ArrowRight, Server, Building, Mail, Package, X } from 'lucide-react';
import { HubRegistrationRequest } from '../types';

interface B2BPartnersProps {
  hubs: any[];
  onApply: (req: HubRegistrationRequest) => void;
}

const B2BPartners: React.FC<B2BPartnersProps> = ({ hubs, onApply }) => {
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({ company: '', email: '', location: '', park: '' });

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40 lg:pt-48">
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-12">
        <div>
          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-4 flex items-center"><Globe className="w-4 h-4 mr-3" /> Redline Global Grid</h4>
          <h3 className="text-6xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6">Nodos de <br /> <span className="text-red-600">Produção Ativa.</span></h3>
          <p className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed italic border-l-4 border-red-600 pl-8">Directório B2B de unidades fabris certificadas. Estas empresas disponibilizam o seu parque de máquinas para a rede global Redline R2.</p>
        </div>
        <button onClick={() => setShowApply(true)} className="bg-black text-white px-12 py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-2xl flex items-center space-x-4"><Server className="w-6 h-6"/> <span>Candidatar minha Empresa</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {hubs.map((node) => (
          <div key={node.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-700">
            <div className="relative aspect-video overflow-hidden">
               <img src={node.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute top-6 left-6 bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10">{node.id}</div>
               <div className={`absolute bottom-6 right-6 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${node.status === 'Online' ? 'bg-green-500 text-white status-pulse' : 'bg-orange-500 text-white'}`}>{node.status}</div>
            </div>
            <div className="p-10 flex flex-col flex-grow">
              <div className="mb-8 flex-grow">
                <div className="flex items-center text-gray-400 space-x-2 mb-2"><MapPin className="w-3 h-3 text-red-600" /><span className="text-[9px] font-black uppercase tracking-widest">{node.location}</span></div>
                <h4 className="text-2xl font-brand font-black italic uppercase tracking-tighter leading-none mb-4 group-hover:text-red-600 transition-colors">{node.name}</h4>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic mb-6 line-clamp-3">{node.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-50 mb-8">
                <div className="space-y-2"><span className="text-[7px] font-black uppercase text-gray-300 tracking-widest flex items-center"><Activity className="w-3 h-3 mr-2 text-red-600" /> Load Capacity</span><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-black transition-all duration-1000" style={{ width: `${node.capacity}%` }} /></div><span className="text-[10px] font-brand font-black italic">{node.capacity}%</span></div>
                <div className="space-y-2"><span className="text-[7px] font-black uppercase text-gray-300 tracking-widest flex items-center"><Zap className="w-3 h-3 mr-2 text-red-600" /> Latency R2</span><span className="text-[10px] font-brand font-black italic block">{node.latency}</span></div>
              </div>
              <button className="w-full bg-black text-white p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl group flex items-center justify-center space-x-4"><span>Conectar Nodo</span><ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></button>
            </div>
          </div>
        ))}
      </div>

      {showApply && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-16 border-[10px] border-red-600 overflow-y-auto max-h-[90vh]">
              <h3 className="text-4xl font-brand font-black italic uppercase mb-12">Expandir o <br/><span className="text-red-600">Grid R2.</span></h3>
              <form onSubmit={(e) => { e.preventDefault(); onApply({ id: `HUB-REQ-${Date.now()}`, companyName: formData.company, email: formData.email, location: formData.location, machinePark: formData.park, timestamp: Date.now(), status: 'Pendente' }); setShowApply(false); }} className="space-y-8 text-left">
                 <div className="relative"><Building className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"/><input type="text" placeholder="NOME DA EMPRESA" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"/><input type="email" placeholder="EMAIL CORPORATIVO" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"/><input type="text" placeholder="LOCALIZAÇÃO (CIDADE, PAÍS)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase outline-none border-2 border-transparent focus:border-red-600 transition-all" required /></div>
                 <div className="relative"><Package className="absolute left-6 top-6 w-5 h-5 text-gray-300"/><textarea placeholder="DESCRIÇÃO DO PARQUE DE MÁQUINAS (EX: DURST P5, HEIDELBERG, ETC)" value={formData.park} onChange={e => setFormData({...formData, park: e.target.value})} className="w-full bg-gray-50 pl-16 p-6 rounded-3xl font-black uppercase outline-none border-2 border-transparent focus:border-red-600 transition-all h-32" required /></div>
                 <div className="flex space-x-4 pt-6"><button type="submit" className="flex-grow bg-black text-white p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-2xl">Submeter Candidatura</button><button onClick={() => setShowApply(false)} type="button" className="bg-gray-100 p-8 rounded-[2rem] text-black"><X className="w-8 h-8"/></button></div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default B2BPartners;
