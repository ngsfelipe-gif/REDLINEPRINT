
import React, { useState } from 'react';
import { User as UserType, ProductionJob, SupportTicket, Notification, TeamMember, Permission, UserRole } from '../types';
// Fixed: Added Printer and LogOut to the lucide-react import list
import { 
  Trophy, Activity, Database, Clock, Package, Briefcase, 
  CreditCard, Download, ExternalLink, Zap, ShieldCheck, 
  Users, Settings, MessageSquare, Plus, CheckCircle2, AlertCircle,
  Eye, X, ChevronRight, FileText, MapPin, Info, Cpu, Truck, BarChart4,
  Layers, Gauge, ArrowRight, Maximize, Mail, Inbox, UserPlus, ShieldAlert,
  Trash2, UserCog, Send, Hash, CornerDownRight, Printer, LogOut
} from 'lucide-react';

interface AccountProps {
  user: UserType;
  orders: ProductionJob[];
  tickets: SupportTicket[];
  notifications: Notification[];
  onAddTicket: (ticket: SupportTicket) => void;
  subTab: string;
  setSubTab: (tab: string) => void;
  onLogout: () => void;
}

const MOCK_TEAM: TeamMember[] = [
  { id: 'TM-01', name: 'Sarah Connor', email: 's.connor@spacex.com', role: 'B2B_Orderer', status: 'Active' },
  { id: 'TM-02', name: 'James Holden', email: 'j.holden@spacex.com', role: 'B2B_Approver', status: 'Active' },
  { id: 'TM-03', name: 'Naomi Nagata', email: 'n.nagata@spacex.com', role: 'B2B_Viewer', status: 'Active' },
  { id: 'TM-04', name: 'Alex Kamal', email: 'a.kamal@spacex.com', role: 'B2B_Orderer', status: 'Pending' },
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: ['VIEW_ORDERS', 'PLACE_ORDERS', 'APPROVE_BUDGETS', 'MANAGE_TEAM', 'ACCESS_BACKOFFICE'],
  B2B_Admin: ['VIEW_ORDERS', 'PLACE_ORDERS', 'APPROVE_BUDGETS', 'MANAGE_TEAM'],
  B2B_Approver: ['VIEW_ORDERS', 'APPROVE_BUDGETS'],
  B2B_Orderer: ['VIEW_ORDERS', 'PLACE_ORDERS'],
  B2B_Viewer: ['VIEW_ORDERS'],
  Client: ['VIEW_ORDERS', 'PLACE_ORDERS']
};

const Account: React.FC<AccountProps> = ({ user, orders, tickets, notifications, onAddTicket, subTab, setSubTab, onLogout }) => {
  const isB2B = user.role.startsWith('B2B');
  const canManageTeam = user.permissions.includes('MANAGE_TEAM');
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [selectedOrder, setSelectedOrder] = useState<ProductionJob | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Notification | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const filteredOrders = user.role === 'Admin' ? orders : orders.filter(o => o.client === user.name || (isB2B && o.client.includes('SpaceX')));

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'Orçamento Gerado': return 10;
      case 'Pre-flight': return 30;
      case 'Impressão': return 60;
      case 'Acabamento': return 85;
      case 'Expedição': return 95;
      case 'Entregue': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue': return 'bg-green-500';
      case 'Expedição': return 'bg-blue-400';
      case 'Impressão': return 'bg-red-600 animate-pulse';
      case 'Acabamento': return 'bg-blue-600';
      default: return 'bg-black';
    }
  };

  const handleUpdateRole = (id: string, newRole: UserRole) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  const tabs = ['overview', 'orders', 'inbox', 'tickets'];
  if (canManageTeam) tabs.push('team');
  tabs.push('settings');

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-24 animate-in fade-in duration-700 industrial-grid">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-10">
        <div className="flex items-center space-x-8 group">
          <div className="relative">
            <div className="w-24 h-24 bg-black rounded-[1.5rem] flex items-center justify-center font-brand text-5xl font-black italic shadow-xl border-b-[6px] border-red-600 relative overflow-hidden group-hover:rotate-2 transition-transform">
              <span className="relative z-10 text-white">{user.name.charAt(0)}</span>
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 opacity-20" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1.5 rounded-lg shadow-lg border border-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex flex-col mb-1.5">
               <span className="text-[8px] font-black uppercase text-red-600 tracking-[0.4em] mb-1">Industrial Identity Enabled</span>
               <h2 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">
                 {user.name.split(' ')[0]} <span className="text-gray-200">{user.name.split(' ')[1] || ''}</span>
               </h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-black text-white px-5 py-1.5 rounded-full shadow-md">
                <span className="text-[8px] font-black uppercase tracking-widest">{user.role.replace('_', ' ')} NODE</span>
              </div>
              <div className="bg-white border-2 border-gray-100 px-5 py-1.5 rounded-full shadow-sm">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Tier: {user.tier}</span>
              </div>
              
              {/* Logout button in header for mobile/quick access */}
              <button 
                onClick={onLogout}
                className="flex lg:hidden items-center space-x-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100 font-black text-[8px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-50/80 backdrop-blur-md p-1.5 rounded-full space-x-1 border border-gray-200 shadow-inner self-center flex-wrap justify-center gap-y-2">
           {tabs.map(tab => (
             <button 
               key={tab}
               onClick={() => setSubTab(tab)}
               className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 relative ${subTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-white'}`}
             >
               {tab}
               {tab === 'inbox' && notifications.some(n => !n.read) && (
                 <div className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full animate-ping" />
               )}
             </button>
           ))}
           
           <button 
            onClick={onLogout}
            className="px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center space-x-2 border border-transparent hover:border-red-100"
           >
             <LogOut className="w-4 h-4" />
             <span className="hidden sm:inline">Logout Protocol</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-8">
           {subTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-black text-white p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden group border-b-[15px] border-red-600 flex flex-col justify-between min-h-[400px]">
                    <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-red-600 opacity-10 blur-[80px] -z-10 group-hover:opacity-20 transition-all" />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Activity className="w-10 h-10 text-red-600" />
                        <span className="text-[8px] font-black uppercase text-red-600 tracking-[0.3em] border border-red-600/30 px-4 py-1.5 rounded-full">Telemetry active</span>
                      </div>
                      <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Global <br /> Throughput.</h4>
                      <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Node Frankfurt-R2: Sincronizado</p>
                    </div>
                    
                    <div className="mt-auto">
                      <span className="text-7xl font-brand font-black italic block text-white leading-none tracking-tighter mb-4">{filteredOrders.length}</span>
                      <button onClick={() => setSubTab('orders')} className="group flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-white transition-all">
                        <span>Ver Terminal</span> 
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white border-2 border-gray-100 p-10 rounded-[2.5rem] shadow-lg group hover:border-red-600 transition-all relative overflow-hidden">
                       <Trophy className="w-10 h-10 text-red-600 mb-6" />
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-gray-300 tracking-[0.3em] mb-2">Protocol Access</span>
                          <span className="text-4xl font-brand font-black italic block uppercase text-black leading-none">{user.tier} Rank</span>
                          <div className="mt-8 h-1 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner">
                             <div className="h-full bg-red-600 shimmer w-[65%]" />
                          </div>
                          <span className="text-[7px] font-black uppercase text-gray-400 mt-2 tracking-widest text-right">35% to Platinum</span>
                       </div>
                    </div>
                    
                    <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-lg border-b-[10px] border-gray-800">
                       <div className="flex items-center space-x-4 mb-8">
                          <Gauge className="w-8 h-8 text-red-600" />
                          <h5 className="text-xl font-brand font-black italic text-white uppercase tracking-tighter">System Health</h5>
                       </div>
                       <div className="space-y-4">
                          {[
                            { l: 'CPU LOAD', v: '14%', c: 'bg-green-500' },
                            { l: 'LATENCY', v: '0.4ms', c: 'bg-green-500' },
                            { l: 'INK STOCK', v: '78%', c: 'bg-red-600' }
                          ].map((stat, i) => (
                            <div key={i} className="flex justify-between items-center">
                               <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{stat.l}</span>
                               <div className="flex items-center space-x-3 flex-grow mx-4">
                                  <div className="h-0.5 flex-grow bg-gray-800 rounded-full overflow-hidden">
                                     <div className={`h-full ${stat.c}`} style={{ width: stat.v }} />
                                  </div>
                               </div>
                               <span className="text-[9px] font-mono text-white font-bold">{stat.v}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {subTab === 'orders' && (
              <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
                 <div className="mb-4">
                   <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-2">Modules <span className="text-red-600">Active.</span></h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fila de produção em node prioritário R2.</p>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((o, i) => (
                      <div key={i} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-lg flex flex-col lg:flex-row items-center justify-between hover:border-red-600 transition-all group relative overflow-hidden">
                         <div className="flex items-center space-x-6 w-full lg:w-auto relative z-10">
                            <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center font-brand font-black italic text-2xl shadow-lg ${getStatusColor(o.status)} text-white transition-all group-hover:rotate-6`}>
                               {o.id.charAt(o.id.length-1)}
                            </div>
                            <div>
                               <h5 className="text-2xl font-brand font-black italic uppercase tracking-tighter leading-none group-hover:text-red-600 transition-colors mb-1.5">{o.product}</h5>
                               <div className="flex items-center space-x-4">
                                  <span className="text-[8px] text-red-600 font-black tracking-widest flex items-center bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase">
                                     {o.id}
                                  </span>
                                  <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">{new Date(o.timestamp).toLocaleDateString()}</span>
                                  <span className="text-[8px] text-black font-black uppercase tracking-widest">Unit: {o.quantity}</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center space-x-8 w-full lg:w-auto justify-between lg:justify-end mt-6 lg:mt-0 relative z-10">
                            <div className="w-32">
                               <div className="flex justify-between mb-1">
                                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{o.status}</span>
                                  <span className="text-[7px] font-black text-red-600">{getStatusProgress(o.status)}%</span>
                               </div>
                               <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                  <div className={`h-full ${getStatusColor(o.status)} transition-all duration-1000`} style={{ width: `${getStatusProgress(o.status)}%` }} />
                               </div>
                            </div>
                            <button onClick={() => setSelectedOrder(o)} className="p-4 bg-black text-white rounded-full hover:bg-red-600 transition-all shadow-md active:scale-90">
                               <Eye className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           )}

           {subTab === 'inbox' && (
              <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
                 <div className="mb-8 flex justify-between items-end">
                   <div>
                     <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-2">Protocol <span className="text-red-600">Inbox.</span></h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comunicações industriais encriptadas.</p>
                   </div>
                   <Inbox className="w-12 h-12 text-red-600 opacity-20" />
                 </div>

                 <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="bg-gray-50 p-20 rounded-[3rem] text-center">
                         <Mail className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sem transmissões pendentes.</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedEmail(n)}
                          className={`p-8 rounded-[2rem] cursor-pointer transition-all border-l-8 flex items-center justify-between group ${!n.read ? 'bg-white border-red-600 shadow-xl' : 'bg-gray-50 border-gray-200 opacity-60'}`}
                        >
                           <div className="flex items-center space-x-6">
                              <div className={`p-4 rounded-xl ${!n.read ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                                 <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                 <h5 className="text-xl font-brand font-black italic uppercase tracking-tighter mb-1 line-clamp-1">{n.title}</h5>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{n.orderId} // {new Date(n.timestamp).toLocaleTimeString()}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-2 transition-transform" />
                        </div>
                      ))
                    )}
                 </div>
              </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           {isB2B && (
             <div className="bg-red-600 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group border-b-[16px] border-black">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] -z-10" />
                <CreditCard className="w-12 h-12 mb-8 text-white" />
                <h4 className="text-4xl font-brand font-black italic uppercase leading-tight tracking-tighter mb-8">B2B <br /> Credit.</h4>
                <div className="space-y-4 mb-10">
                   <div className="flex justify-between items-end border-b border-white/20 pb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Linha Crédito</span>
                      <span className="text-3xl font-brand font-black italic">€{user.creditLimit?.toLocaleString()}</span>
                   </div>
                </div>
                {user.permissions.includes('APPROVE_BUDGETS') ? (
                  <button className="w-full bg-white text-black py-6 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all">Approve Credit Line</button>
                ) : (
                  <div className="w-full bg-black/20 text-white/50 py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest text-center">Viewer Access Only</div>
                )}
             </div>
           )}

           <div className="bg-white border-2 border-gray-100 p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black" />
              <div className="flex items-center justify-between mb-10">
                <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">Protocol Feed</h5>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              </div>
              <div className="space-y-8">
                 {[
                   { t: 'Deploy efetuado', d: 'Agora', i: <Zap className="w-4 h-4" /> },
                   { t: 'Asset Synced', d: '2h ago', i: <FileText className="w-4 h-4" /> },
                   { t: 'Order Validated', d: 'Today', i: <ShieldCheck className="w-4 h-4" /> }
                 ].map((log, i) => (
                   <div key={i} className="flex items-start space-x-6 border-l-2 border-gray-50 pl-6 relative group/log">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-red-600 rounded-full border border-white group-hover/log:scale-110 transition-all shadow-sm" />
                      <div className="bg-gray-50 p-3 rounded-xl text-gray-400 group-hover/log:bg-red-50 group-hover/log:text-red-600 transition-all">{log.i}</div>
                      <div className="pt-0.5">
                         <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1.5">{log.t}</p>
                         <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest block">{log.d}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Industrial Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-[550] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 border-b-[20px] border-red-600 flex flex-col">
              
              {/* Email Header Interface */}
              <div className="bg-black text-white p-10 border-b-[8px] border-red-600">
                 <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center space-x-4">
                       <div className="bg-red-600 p-3 rounded-2xl">
                          <Send className="w-6 h-6 text-white" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-brand font-black italic uppercase tracking-tighter">Email Terminal</h4>
                          <p className="text-[8px] font-black uppercase tracking-widest text-red-600">Secure Transmission // DE-FRA-R2</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedEmail(null)} className="p-3 bg-white/10 rounded-xl hover:bg-red-600 transition-all">
                       <X className="w-6 h-6" />
                    </button>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-4">
                       <span className="text-[10px] font-black uppercase text-gray-500 w-16 tracking-widest">From:</span>
                       <span className="text-[10px] font-mono text-red-600">REDLINE_PROTOCOL@DE-FRA-R2.EU</span>
                    </div>
                    <div className="flex items-center space-x-4">
                       <span className="text-[10px] font-black uppercase text-gray-500 w-16 tracking-widest">To:</span>
                       <span className="text-[10px] font-mono text-white">{user.email.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                       <span className="text-[10px] font-black uppercase text-gray-500 w-16 tracking-widest">Subject:</span>
                       <span className="text-sm font-brand font-black italic uppercase text-white tracking-tight">{selectedEmail.title}</span>
                    </div>
                 </div>
              </div>

              {/* Email Body */}
              <div className="p-12 industrial-grid flex-grow min-h-[450px]">
                 <div className="flex justify-between items-center mb-10 opacity-30 grayscale pointer-events-none">
                    <div className="flex items-center space-x-3">
                       <Hash className="w-4 h-4" />
                       <span className="text-[8px] font-mono tracking-widest">TRANS_ID: {selectedEmail.id}</span>
                    </div>
                    <span className="text-[8px] font-mono tracking-widest">TS: {new Date(selectedEmail.timestamp).toISOString()}</span>
                 </div>
                 
                 <div className="flex items-start space-x-6 mb-8">
                    <CornerDownRight className="w-10 h-10 text-red-600 mt-2 flex-shrink-0" />
                    <div className="space-y-6">
                       <p className="text-2xl font-medium leading-relaxed text-black/80 font-brand italic">
                          {selectedEmail.message}
                       </p>
                       
                       <div className="bg-gray-50 p-8 rounded-[2rem] border-2 border-white shadow-inner space-y-4">
                          <h5 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center">
                             <Cpu className="w-4 h-4 mr-3" /> Technical Payload Details
                          </h5>
                          <div className="grid grid-cols-2 gap-y-3">
                             <div>
                                <span className="text-[8px] font-black uppercase text-gray-300 block">Linked Module</span>
                                <span className="text-[10px] font-black uppercase tracking-tight">{selectedEmail.orderId}</span>
                             </div>
                             <div>
                                <span className="text-[8px] font-black uppercase text-gray-300 block">Security Key</span>
                                <span className="text-[10px] font-mono text-black uppercase tracking-tight">ENCRYPTED-AES-256</span>
                             </div>
                             <div>
                                <span className="text-[8px] font-black uppercase text-gray-300 block">Delivery Node</span>
                                <span className="text-[10px] font-black uppercase tracking-tight">R2-FRANKFURT-GATEWAY</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto pt-12 flex justify-between items-center opacity-40 grayscale border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                       <ShieldCheck className="w-5 h-5 text-black" />
                       <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encrypted via Redline Protocol</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Printer className="w-4 h-4" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Digital Copy Only</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {selectedOrder && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative animate-in zoom-in-95">
                <div className="w-full lg:w-[350px] bg-black text-white p-12 flex flex-col justify-between border-r-[15px] border-red-600">
                    <div>
                      <h4 className="text-4xl font-brand font-black italic uppercase tracking-tighter mb-6 leading-none">Module <br /> Data.</h4>
                      <div className="space-y-2 text-[8px] font-black uppercase tracking-widest opacity-60">
                         <p>Ref: {selectedOrder.id}</p>
                         <p>Sync: {new Date(selectedOrder.timestamp).toLocaleTimeString()}</p>
                         <p>Priority: {selectedOrder.priority ? 'HIGH-PRIO' : 'STANDARD'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="mt-8 text-white/40 hover:text-white flex items-center space-x-3 uppercase font-black text-[9px] tracking-[0.4em] transition-all">
                       <X className="w-5 h-5" /> <span>Fechar Terminal</span>
                    </button>
                </div>
                <div className="flex-grow p-12 md:p-16 industrial-grid">
                    <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-8">{selectedOrder.product}</h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="bg-gray-50 p-6 rounded-[2rem]">
                          <span className="text-[7px] font-black text-gray-300 uppercase block mb-1">Custo Node</span>
                          <p className="text-4xl font-brand font-black italic">€{selectedOrder.value}</p>
                       </div>
                       <div className="bg-black text-white p-6 rounded-[2rem]">
                          <span className="text-[7px] font-black text-red-600 uppercase block mb-1">Carga Produção</span>
                          <p className="text-4xl font-brand font-black italic">{getStatusProgress(selectedOrder.status)}%</p>
                       </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                       <div>
                          <p className="text-[8px] font-black uppercase text-gray-300 mb-0.5">Shipping Hub</p>
                          <p className="text-lg font-brand font-black italic uppercase">DHL AIR NODE R2</p>
                       </div>
                       <button className="bg-red-600 text-white px-8 py-3 rounded-full text-[8px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all">Track Hub</button>
                    </div>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Account;
