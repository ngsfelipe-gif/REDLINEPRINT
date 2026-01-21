
import React, { useState } from 'react';
import { ProductionJob, User } from '../types';
import { 
  Play, CheckCircle2, Package, Loader2, Cpu, Truck, LayoutDashboard, 
  ShieldAlert, Zap, BarChart3, Clock, Settings, Maximize2, X, FileText, 
  User as UserIcon, Calendar, Info, Layers, Eye
} from 'lucide-react';

interface BackofficeProps {
  orders: ProductionJob[];
  user?: User | null;
  onUpdateStatus: (orderId: string, status: ProductionJob['status']) => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ orders, user, onUpdateStatus }) => {
  const hasAccess = user?.role === 'Administrador';
  const statusStages: ProductionJob['status'][] = ['Orçamento Gerado', 'Pre-flight', 'Impressão', 'Acabamento', 'Expedição', 'Entregue'];
  const [filter, setFilter] = useState<string>('Todos');
  const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null);

  const filteredOrders = filter === 'Todos' ? orders : orders.filter(o => o.status === filter);

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-48 text-center animate-in fade-in zoom-in">
         <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-8" />
         <h2 className="text-4xl font-brand font-black italic uppercase text-black">Acesso Bloqueado</h2>
         <p className="text-[10px] font-black uppercase text-gray-400 mt-4 tracking-[0.3em]">Protocolo R2: Credenciais de Nível 1 Necessárias</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40">
      {/* Telemetria de Topo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-black text-white p-6 rounded-2xl border-b-4 border-red-600 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[8px] font-black uppercase text-gray-500">Carga de Fábrica</span>
            <Zap className="w-3 h-3 text-red-600" />
          </div>
          <div className="text-3xl font-brand font-black italic">84%</div>
          <div className="mt-2 h-1 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 w-[84%] shimmer" />
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[8px] font-black uppercase text-gray-400 block mb-4">Encomendas em Fila</span>
          <div className="text-3xl font-brand font-black italic text-black">{orders.length}</div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[8px] font-black uppercase text-gray-400 block mb-4">Volume Diário Est.</span>
          <div className="text-3xl font-brand font-black italic text-black">€12.4K</div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[8px] font-black uppercase text-gray-400 block mb-4">Estado do Hub R2</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full status-pulse" />
            <span className="text-[10px] font-black uppercase text-green-500">Sincronizado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <LayoutDashboard className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-brand font-black italic uppercase">Matriz de Operações</h3>
              </div>
              <div className="flex space-x-1 overflow-x-auto w-full md:w-auto bg-white p-1 rounded-xl shadow-inner border border-gray-100">
                {['Todos', ...statusStages].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setFilter(s)}
                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <div className="p-20 text-center text-gray-300">
                   <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Nenhum registo no cluster.</p>
                </div>
              ) : (
                filteredOrders.map(job => (
                  <div key={job.id} className="p-8 flex flex-col md:flex-row items-center justify-between hover:bg-red-50/20 transition-all group">
                    <div className="flex items-center space-x-6 w-full md:w-auto mb-6 md:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-brand font-black italic text-xl shadow-xl ${job.status === 'Impressão' ? 'bg-red-600 text-white status-pulse' : 'bg-black text-white'}`}>
                        {job.id.slice(-1)}
                      </div>
                      <div>
                        <h4 className="text-base font-brand font-black italic uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">{job.product}</h4>
                        <div className="flex items-center space-x-3">
                          <span className="text-[8px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase border border-red-100">{job.id}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{job.client}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-[7px] font-black text-gray-300 uppercase mb-2 tracking-widest">Controlo de Fase</span>
                        <select 
                          value={job.status} 
                          onChange={(e) => onUpdateStatus(job.id, e.target.value as any)}
                          className="bg-white border-2 border-gray-100 rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm cursor-pointer hover:border-black transition-all"
                        >
                          {statusStages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <span className="text-[7px] font-black text-gray-300 uppercase block mb-1 tracking-widest">Faturação</span>
                        <span className="text-sm font-brand font-black italic text-black">€{job.value}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl border-l-[10px] border-red-600 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
            <BarChart3 className="w-8 h-8 text-red-600 mb-6" />
            <h4 className="text-lg font-brand font-black italic uppercase mb-4 leading-tight">Métricas do <br /> Cluster R2</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest border-b border-white/5 pb-3">
                <span className="text-gray-500">Fluxo Ativo</span>
                <span>12 Un/Min</span>
              </div>
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Gargalo Crítico</span>
                <span className="text-yellow-500">Acabamento</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-lg">
            <h5 className="text-[10px] font-black uppercase text-red-600 mb-6 flex items-center tracking-[0.2em]">
              <Settings className="w-4 h-4 mr-2" /> Global Config
            </h5>
            <div className="space-y-2">
              <button className="w-full py-3.5 bg-black text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl">Suspender Hub R2</button>
              <button className="w-full py-3.5 bg-gray-50 text-black border border-gray-100 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white transition-all">Limpar Assets</button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Inspection Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 border-[10px] border-white">
              
              {/* Sidebar Técnica */}
              <div className="w-full md:w-[380px] bg-black text-white p-12 flex flex-col justify-between border-r-[15px] border-red-600">
                 <div>
                    <Cpu className="w-12 h-12 text-red-600 mb-10" />
                    <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-10 leading-[0.85]">Inspecção <br /> Deep Node.</h4>
                    <div className="space-y-6">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[7px] font-black uppercase text-red-600 block mb-2">Deploy Sync ID</span>
                          <span className="text-sm font-mono text-gray-300">#RL-{selectedJob.id}-SYNC</span>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[7px] font-black uppercase text-gray-500 block mb-2">Timestamp Cluster</span>
                          <span className="text-[10px] font-bold">{new Date(selectedJob.timestamp).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedJob(null)}
                  className="mt-12 flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-red-600 transition-all"
                 >
                    <X className="w-6 h-6" /> <span>Encerrar Terminal</span>
                 </button>
              </div>

              {/* Conteúdo de Engenharia */}
              <div className="flex-grow p-16 industrial-grid overflow-y-auto max-h-[85vh]">
                 <div className="flex justify-between items-start mb-12 border-b-2 border-gray-50 pb-8">
                    <div>
                       <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] block mb-2">Asset Identificado</span>
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none">{selectedJob.product}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-gray-300 uppercase block mb-1">Custo de Operação</span>
                       <span className="text-5xl font-brand font-black italic text-black leading-none">€{selectedJob.value}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-8">
                       <div className="flex items-center space-x-6">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black shadow-sm"><UserIcon className="w-6 h-6" /></div>
                          <div>
                             <span className="text-[7px] font-black uppercase text-gray-300 block">Propriedade Intelectual</span>
                             <span className="text-sm font-brand font-black italic uppercase">{selectedJob.client}</span>
                          </div>
                       </div>
                       <div className="flex items-center space-x-6">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black shadow-sm"><Layers className="w-6 h-6" /></div>
                          <div>
                             <span className="text-[7px] font-black uppercase text-gray-300 block">Substrato Base</span>
                             <span className="text-sm font-brand font-black italic uppercase">{selectedJob.material || 'Poliéster Industrial 500g'}</span>
                          </div>
                       </div>
                       <div className="flex items-center space-x-6">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black shadow-sm"><Settings className="w-6 h-6" /></div>
                          <div>
                             <span className="text-[7px] font-black uppercase text-gray-300 block">Acabamento de Precisão</span>
                             <span className="text-sm font-brand font-black italic uppercase">{selectedJob.finish || 'Corte Laser / Laminação'}</span>
                          </div>
                       </div>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                       <div>
                          <Info className="w-8 h-8 text-red-600 mb-6" />
                          <h5 className="text-[10px] font-black uppercase tracking-widest mb-4">Nota de Engenharia</h5>
                          <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed">
                            "Asset validado no cluster Frankfurt. Perfil de cor ISO Fogra 39 aplicado. Validação de sangria concluída. O ficheiro está pronto para deposição molecular de tinta UV."
                          </p>
                       </div>
                       <div className="pt-8 flex items-center justify-between border-t border-gray-200 mt-8">
                          <span className="text-[7px] font-black uppercase text-gray-300">Estado Produção</span>
                          <span className="text-lg font-brand font-black italic uppercase text-red-600">{selectedJob.status}</span>
                       </div>
                    </div>
                 </div>

                 {/* Tracker de Produção */}
                 <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                       <div className="flex items-center space-x-4">
                          <Clock className="w-5 h-5 text-red-600" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Timeline Ativa</span>
                       </div>
                       <span className="text-2xl font-brand font-black italic">{selectedJob.progress}%</span>
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-12">
                       <div className="absolute inset-0 bg-red-600 shimmer" style={{ width: `${selectedJob.progress}%` }} />
                    </div>
                    <div className="flex justify-between opacity-30">
                       {statusStages.map((s, idx) => (
                         <div key={s} className={`flex flex-col items-center space-y-3 ${statusStages.indexOf(selectedJob.status) >= idx ? 'opacity-100 text-red-600' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${statusStages.indexOf(selectedJob.status) >= idx ? 'bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'bg-white/10'}`} />
                            <span className="text-[6px] font-black uppercase tracking-widest text-center max-w-[50px] leading-tight">{s}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
