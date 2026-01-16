
import React from 'react';
import { ProductionJob, User } from '../types';
import { Settings, Play, CheckCircle2, AlertTriangle, Package, Loader2, BarChart3, Clock, Activity, Monitor, Cpu, Truck, LayoutDashboard, ShieldAlert } from 'lucide-react';

interface BackofficeProps {
  orders: ProductionJob[];
  user?: User | null;
}

const Backoffice: React.FC<BackofficeProps> = ({ orders, user }) => {
  const hasAccess = user?.permissions.includes('ACCESS_BACKOFFICE');

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-48 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
         <div className="w-32 h-32 bg-red-50 rounded-[2.5rem] flex items-center justify-center mb-12 border-2 border-red-100">
            <ShieldAlert className="w-16 h-16 text-red-600" />
         </div>
         <h2 className="text-5xl font-brand font-black italic uppercase tracking-tighter text-black mb-4">Access Restricted.</h2>
         <p className="text-xl text-gray-400 font-bold uppercase max-w-xl border-l-8 border-red-600 pl-8 text-left mx-auto leading-relaxed">
            Your authorization node does not have the required permissions to access Global Factory Telemetry. Please contact a Tier 1 Administrator.
         </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-24 animate-in fade-in duration-1000 industrial-grid">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-6 text-red-600 mb-8">
             <div className="w-4 h-4 bg-red-600 rounded-full animate-ping" />
             <span className="text-[12px] font-black uppercase tracking-[1em]">FACTORY HUB FRANKFURT // LIVE TELEMETRY</span>
          </div>
          <h2 className="text-9xl font-brand font-black italic uppercase tracking-tighter leading-[0.8] text-black">Control <br /> <span className="text-red-600">Center.</span></h2>
          <p className="text-2xl text-gray-500 font-medium leading-relaxed mt-10 border-l-[16px] border-red-600 pl-16">
            Monitorização em tempo real do workflow industrial. Gestão de recursos de hardware e assets digitais em sincronização atómica.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-6">
           <div className="bg-black text-white px-12 py-6 rounded-[3rem] text-[12px] font-black uppercase tracking-[0.5em] flex items-center shadow-2xl border-b-8 border-red-600 animate-float">
              <Loader2 className="w-6 h-6 mr-6 animate-spin text-red-600" /> Factory Sync: Optimal
           </div>
           <div className="flex space-x-4">
              <div className="bg-white border-2 border-gray-100 p-6 rounded-[2.5rem] shadow-sm flex items-center space-x-6">
                 <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-gray-300 block tracking-widest">Active Jobs</span>
                    <span className="text-5xl font-brand font-black italic">{orders.length}</span>
                 </div>
                 <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-black" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* WORKFLOW TABLE */}
        <div className="lg:col-span-9">
          <div className="bg-white border-4 border-gray-50 rounded-[7rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.1)] relative">
             <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 to-black" />
             <div className="p-16 bg-gray-50/50 border-b-4 border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                   <div className="p-4 bg-black text-white rounded-2xl">
                      <LayoutDashboard className="w-6 h-6" />
                   </div>
                   <div>
                     <span className="text-[14px] font-brand font-black italic uppercase tracking-tighter">Production Stack Matrix</span>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Sorting: Priority Queue (FCFS)</p>
                   </div>
                </div>
                <div className="flex space-x-6">
                   <button className="px-10 py-4 bg-white border-2 border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-red-600 transition-all">Export XLS</button>
                   <button className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Refactor Matrix</button>
                </div>
             </div>
             
             <div className="divide-y-8 divide-gray-50">
               {orders.length === 0 ? (
                 <div className="p-48 text-center">
                    <Package className="w-40 h-40 text-gray-100 mx-auto mb-12" />
                    <p className="text-2xl font-brand font-black italic uppercase text-gray-300 tracking-[0.5em]">No Modules in Buffer</p>
                 </div>
               ) : (
                 orders.map((job) => (
                  <div key={job.id} className="p-14 hover:bg-red-50/20 transition-all flex flex-col md:flex-row items-center justify-between group relative scan-effect">
                    <div className="flex items-center space-x-12 w-full md:w-auto relative z-10">
                      <div className={`w-24 h-24 rounded-[3.5rem] flex items-center justify-center font-brand font-black italic text-4xl shadow-2xl transition-all duration-700 ${
                        job.status === 'Impressão' ? 'bg-red-600 text-white shadow-[0_20px_60px_rgba(204,0,0,0.4)] animate-pulse' : 
                        job.status === 'Expedição' ? 'bg-green-500 text-white' : 'bg-black text-white'
                      } group-hover:rotate-12`}>
                        {job.id.split('-')[1].charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-5xl font-brand font-black italic uppercase tracking-tighter group-hover:text-red-600 transition-colors leading-none mb-3">{job.product}</h4>
                        <div className="flex items-center space-x-10">
                          <span className="text-[11px] font-black text-red-600 tracking-[0.6em] border border-red-600/20 px-4 py-1.5 rounded-full">{job.id}</span>
                          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Client: {job.client}</span>
                          <span className="text-[11px] font-black text-black uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full">Unit Value: €{job.value}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-16 mt-10 md:mt-0 relative z-10">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-gray-300 uppercase block mb-4 tracking-[0.4em]">Engine State</span>
                        <div className={`text-[12px] font-black uppercase px-12 py-4 rounded-full border-4 transition-all duration-500 ${
                          job.status === 'Impressão' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-black text-white border-black'
                        }`}>
                          {job.status}
                        </div>
                      </div>
                      <div className="text-right hidden xl:block">
                        <span className="text-[10px] font-black text-gray-300 uppercase block mb-4 tracking-[0.4em]">Asset Integrity</span>
                        <div className="flex items-center text-xs font-brand font-black italic text-green-500">
                           <CheckCircle2 className="w-5 h-5 mr-3" /> VERIFIED 100%
                        </div>
                      </div>
                      <button className="p-10 bg-gray-50 text-gray-300 rounded-[2.5rem] hover:bg-black hover:text-white transition-all shadow-xl group/btn">
                         <Play className="w-8 h-8 group-hover/btn:scale-125 transition-transform" />
                      </button>
                    </div>
                  </div>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* SIDEBAR OPS */}
        <div className="lg:col-span-3 space-y-12">
           <div className="bg-black text-white p-20 rounded-[6rem] shadow-[0_80px_160px_rgba(0,0,0,0.5)] relative overflow-hidden group border-b-[30px] border-red-600 animate-float">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/20 blur-[100px] pointer-events-none" />
              <div className="w-24 h-24 bg-red-600 rounded-[3rem] flex items-center justify-center mb-12 shadow-2xl group-hover:rotate-12 transition-transform">
                <Truck className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-6 leading-none">Global <br /> Dispatch Hub.</h4>
              <p className="text-[12px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest mb-16 opacity-60">Scheduled DHL Express departures active. Frequency: 15 min cycle.</p>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-red-600 border-b border-white/10 pb-4">
                    <span>NEXT LOADING</span>
                    <span className="text-white">08:14 MIN</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 border-b border-white/10 pb-4">
                    <span>HUB STATUS</span>
                    <span className="text-green-500">OPEN</span>
                 </div>
              </div>
           </div>
           
           <div className="bg-white border-4 border-gray-50 p-16 rounded-[6rem] shadow-2xl relative group">
              <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-red-600 mb-10 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-10 h-10 animate-pulse" />
              </div>
              <h4 className="text-3xl font-brand font-black italic uppercase tracking-tighter mb-6 leading-none">Critical <br /> Resources.</h4>
              <p className="text-[11px] text-gray-400 font-black uppercase leading-relaxed tracking-widest mb-10">Stock alert: PET Backlight Film 200mic is below threshold (12%).</p>
              <button className="w-full bg-black text-white py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-red-600 transition-all">Order Repletion</button>
           </div>

           <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white shadow-inner">
              <div className="flex items-center space-x-6 mb-10">
                 <Cpu className="w-10 h-10 text-red-600" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Hardware Latency</span>
              </div>
              <div className="h-2 w-full bg-white rounded-full overflow-hidden mb-6">
                 <div className="h-full bg-red-600 w-[42%]" />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-300">
                 <span>R1 NODE</span>
                 <span>42.8 MS</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Backoffice;
