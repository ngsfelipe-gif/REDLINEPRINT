
import React, { useState, useMemo, useRef } from 'react';
import { MATERIALS, FINISHES } from '../constants';
import { ArrowRight, ArrowLeft, CheckCircle2, Cpu, ShieldCheck, Zap, Info, ChevronLeft, ChevronRight, X, Upload, Activity, Package, MessageCircle, Server, FileCheck, FileWarning, Layers, Search, BarChart3, Globe, FileDigit, Monitor, LayoutGrid, Clock, Shield, Settings, Barcode, Mail, User as UserIcon, Lock } from 'lucide-react';
import { ProductionJob, User, ExtendedProduct, PartnerNode, Language, Category } from '../types';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob, guestData?: { name: string, email: string, password?: string }) => void;
  user: User | null;
  hubs: PartnerNode[];
  products: ExtendedProduct[];
  language: Language;
}

const ProductBuilder: React.FC<ProductBuilderProps> = ({ onAddOrder, user, hubs, products, language }) => {
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tudo');
  const [detailProduct, setDetailProduct] = useState<ExtendedProduct | null>(null);
  
  const isAdmin = user?.role === 'Administrador';
  const isB2B = user?.role === 'B2B_Admin';

  const [config, setConfig] = useState({
    material: MATERIALS[0],
    finish: FINISHES[0],
    quantity: '100',
    width: '',
    height: '',
    unit: 'mm' as 'mm' | 'cm' | 'm',
    observations: '',
    fileName: '',
    selectedHubId: ''
  });

  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', password: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setConfig({ ...config, fileName: e.target.files![0].name });
        setIsUploading(false);
      }, 2000);
    }
  };

  const handleOrderSubmit = () => {
    if (!selectedProduct) return;
    
    // Se o utilizador não está logado, ele precisa de preencher o registo no Step 3
    if (!user && step === 2) {
      setStep(3);
      return;
    }

    setIsSyncing(true);
    const hubId = config.selectedHubId || (selectedProduct.ownerHubId === 'SYSTEM' ? 'NODE-LIS' : selectedProduct.ownerHubId);

    const newOrder: ProductionJob = {
      id: `RL-${Math.floor(Math.random() * 9000) + 1000}`,
      client: user ? user.name : guestInfo.name,
      clientId: user ? user.id : 'GUEST',
      product: selectedProduct.name,
      status: 'Pendente_Admin',
      value: (selectedProduct.basePrice * (parseInt(config.quantity) || 1)).toFixed(2),
      nodeId: hubId,
      progress: 0,
      timestamp: Date.now(),
      material: config.material,
      finish: config.finish,
      quantity: config.quantity,
      width: config.width,
      height: config.height,
      unit: config.unit,
      observations: config.observations,
      fileName: config.fileName,
      dimensions: `${config.width}x${config.height}${config.unit}`,
      history: [{ timestamp: Date.now(), status: 'Protocolo Injetado', author: user ? user.name : guestInfo.name, note: 'Job submetido via Grid R2.' }]
    };

    setTimeout(() => {
      onAddOrder(newOrder, !user ? { name: guestInfo.name, email: guestInfo.email, password: guestInfo.password } : undefined);
      setIsSyncing(false);
      setStep(4);
    }, 2500);
  };

  const categories = useMemo(() => ['Tudo', ...Object.values(Category)], []);
  const filteredProducts = products.filter(p => (activeCategory === 'Tudo' || p.category === activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-32 lg:pt-40">
      {step === 1 && (
         <div className="space-y-20 animate-in fade-in">
            <div className="flex flex-col xl:flex-row justify-between items-end gap-12">
               <div className="space-y-8">
                 <div className="flex items-center space-x-3 bg-black text-white px-5 py-2 rounded-full w-fit">
                    <LayoutGrid className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">R2-Catalog / Cluster: v4.2</span>
                 </div>
                 <h3 className="text-8xl font-brand font-black italic uppercase text-black tracking-tighter leading-[0.8]">Módulos <br/><span className="text-red-600">Industriais.</span></h3>
                 <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1); }} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-red-600 text-white border-red-600 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}>{cat}</button>
                    ))}
                 </div>
               </div>
               <div className="flex flex-col items-end gap-8 w-full max-w-xl">
                  <div className="flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                     <div className="flex items-center space-x-2"><Monitor className="w-3 h-3 text-red-600" /> <span>{products.length} Assets</span></div>
                     <div className="flex items-center space-x-2"><Activity className="w-3 h-3 text-red-600" /> <span>Sync: 0.2ms</span></div>
                  </div>
                  <div className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-2xl flex items-center w-full focus-within:border-black transition-all">
                     <Search className="w-6 h-6 text-gray-300 ml-6" />
                     <input type="text" placeholder="SEARCH PRODUCT GRID..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="bg-transparent flex-grow outline-none font-black uppercase text-[11px] p-6 placeholder:text-gray-200" />
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
               {paginatedProducts.map(p => (
                 <div key={p.id} onClick={() => setSelectedProduct(p)} className={`bg-white border-2 rounded-[4.5rem] p-10 transition-all cursor-pointer relative group ${selectedProduct?.id === p.id ? 'border-red-600 shadow-[0_50px_100px_rgba(204,0,0,0.1)] scale-[1.03]' : 'border-gray-50 hover:border-black shadow-lg'}`}>
                    {p.badge && <div className="absolute top-12 right-12 bg-black text-white px-4 py-1.5 rounded-full text-[8px] font-black z-10 shadow-lg tracking-widest">{p.badge}</div>}
                    <div className="w-full aspect-square rounded-[3.5rem] overflow-hidden mb-10 shadow-inner bg-gray-50 relative">
                       <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                          <button onClick={(e) => { e.stopPropagation(); setDetailProduct(p); }} className="bg-white/90 backdrop-blur-md p-3 rounded-2xl text-black hover:bg-red-600 hover:text-white transition-all"><Info className="w-5 h-5" /></button>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.3em]">{p.category}</span>
                          <h5 className="text-3xl font-brand font-black italic uppercase text-black leading-tight mt-1">{p.name}</h5>
                       </div>
                       <p className="text-[11px] font-medium text-gray-400 italic line-clamp-2 leading-relaxed">{p.description}</p>
                       <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                          <div className="flex items-center space-x-2">
                             <Clock className="w-3 h-3 text-red-600" />
                             <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">24H ETD</span>
                          </div>
                          <div className="flex items-center space-x-2">
                             <Shield className="w-3 h-3 text-red-600" />
                             <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">ISO-R2</span>
                          </div>
                       </div>
                       <div className="flex justify-between items-center mt-10 pt-6">
                          {user || isAdmin || isB2B ? <span className="text-4xl font-brand font-black italic">€{p.basePrice}<span className="text-[10px] font-normal opacity-30">/{p.unit}</span></span> : <span className="text-[10px] font-black uppercase text-gray-300 italic tracking-[0.2em]">Login for pricing</span>}
                          <div className={`p-5 rounded-2xl transition-all ${selectedProduct?.id === p.id ? 'bg-red-600 text-white animate-pulse shadow-xl shadow-red-600/30' : 'bg-gray-50 text-gray-200 group-hover:bg-black group-hover:text-white'}`}><Zap className="w-6 h-6" /></div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-12 mt-20 py-10 border-t border-gray-100">
                 <button onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }} disabled={currentPage === 1} className="p-6 bg-white border border-gray-100 rounded-full disabled:opacity-20 hover:bg-black hover:text-white transition-all shadow-xl"><ChevronLeft className="w-8 h-8" /></button>
                 <div className="flex items-center space-x-4">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`w-14 h-14 rounded-2xl font-brand font-black italic text-lg transition-all ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-2xl scale-110' : 'bg-gray-50 text-gray-300 hover:bg-black hover:text-white'}`}>{i + 1}</button>
                    ))}
                 </div>
                 <button onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({top: 0, behavior: 'smooth'}); }} disabled={currentPage === totalPages} className="p-6 bg-white border border-gray-100 rounded-full disabled:opacity-20 hover:bg-black hover:text-white transition-all shadow-xl"><ChevronRight className="w-8 h-8" /></button>
              </div>
            )}

            {selectedProduct && <button onClick={() => setStep(2)} className="w-full bg-black text-white p-12 rounded-[4.5rem] font-brand font-black italic uppercase tracking-[0.6em] text-xl mt-12 hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center animate-in slide-in-from-bottom-5">Configurar Unidade R2 <ArrowRight className="ml-8 w-8 h-8 animate-pulse" /></button>}
         </div>
      )}

      {step === 2 && (
         <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-20 animate-in slide-in-from-right-10 relative overflow-hidden">
            <button onClick={() => setStep(1)} className="absolute top-12 right-12 p-5 text-gray-200 hover:text-black hover:rotate-90 transition-all"><X className="w-12 h-12"/></button>
            <div className="flex items-center space-x-6 mb-16">
               <div className="p-6 bg-red-600 rounded-3xl text-white shadow-xl"><Settings className="w-10 h-10 animate-spin-slow" /></div>
               <h3 className="text-6xl font-brand font-black italic uppercase text-black leading-none">GRID <span className="text-red-600">PRESETS.</span></h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
               <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Width Axis</label>
                        <div className="flex bg-gray-50 p-4 rounded-[2.5rem] border border-transparent focus-within:border-red-600 shadow-inner">
                           <input type="number" placeholder="00.0" value={config.width} onChange={e => setConfig({...config, width: e.target.value})} className="bg-transparent flex-grow p-4 font-brand font-black italic text-2xl outline-none" />
                           <span className="p-4 font-black uppercase text-gray-300">MM</span>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Height Axis</label>
                        <div className="flex bg-gray-50 p-4 rounded-[2.5rem] border border-transparent focus-within:border-red-600 shadow-inner">
                           <input type="number" placeholder="00.0" value={config.height} onChange={e => setConfig({...config, height: e.target.value})} className="bg-transparent flex-grow p-4 font-brand font-black italic text-2xl outline-none" />
                           <span className="p-4 font-black uppercase text-gray-300">MM</span>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Atomic Quantity</label>
                    <input type="number" placeholder="100" value={config.quantity} onChange={e => setConfig({...config, quantity: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[2.5rem] font-brand font-black italic text-2xl outline-none border border-transparent focus:border-red-600 shadow-inner" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Industrial Substrate</label>
                    <select value={config.material} onChange={e => setConfig({...config, material: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner appearance-none cursor-pointer">{MATERIALS.map(m => <option key={m}>{m}</option>)}</select>
                  </div>
               </div>
               <div className="space-y-12">
                  <div className={`relative bg-black text-white p-16 rounded-[5rem] text-center overflow-hidden transition-all border-b-[15px] border-red-900 group ${isUploading ? 'opacity-50' : 'opacity-100'}`}>
                     {isUploading && <div className="absolute top-0 left-0 w-full z-20"><div className="laser-line"></div></div>}
                     <Upload className="w-16 h-16 text-red-600 mx-auto mb-8 group-hover:scale-110 transition-transform" />
                     <h4 className="text-3xl font-brand font-black italic uppercase mb-4 tracking-tighter">{config.fileName || 'INJECT ASSET'}</h4>
                     <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mb-10 italic">Vector Protocol (PDF / AI / DXF)</p>
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all shadow-2xl">Selecionar Ficheiro</button>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Node Route Override</label>
                    <select value={config.selectedHubId} onChange={e => setConfig({...config, selectedHubId: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border border-transparent focus:border-red-600 shadow-inner appearance-none cursor-pointer">
                       <option value="">Roteamento Inteligente (Recomendado)</option>
                       {hubs.map(h => <option key={h.id} value={h.id}>{h.name} [{h.location}]</option>)}
                    </select>
                  </div>
               </div>
            </div>
            <button onClick={handleOrderSubmit} disabled={!config.fileName || !config.width || !config.height} className="w-full mt-24 bg-black text-white p-14 rounded-[4.5rem] font-brand font-black italic uppercase tracking-[0.5em] hover:bg-red-600 transition-all shadow-2xl disabled:opacity-20 flex items-center justify-center space-x-10 group">
              <span>{user ? 'Sincronizar Produção' : 'Registar Identidade R2'}</span> <Zap className="w-8 h-8 group-hover:scale-125 transition-transform text-red-600" />
            </button>
         </div>
      )}

      {/* STEP 3: REGISTO PARA CONVIDADOS */}
      {step === 3 && (
        <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-20 animate-in slide-in-from-bottom-10 relative overflow-hidden">
           <button onClick={() => setStep(2)} className="absolute top-12 right-12 p-5 text-gray-200 hover:text-black transition-all transform hover:rotate-90"><ChevronLeft className="w-12 h-12"/></button>
           <div className="max-w-2xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                 <h3 className="text-6xl font-brand font-black italic uppercase text-black leading-none">Criar Conta <br/><span className="text-red-600">Standard.</span></h3>
                 <p className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-black italic">Provisionamento de Identidade Industrial</p>
              </div>
              <div className="space-y-8">
                 <div className="relative group">
                    <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <input type="text" placeholder="NOME COMPLETO DA ENTIDADE" value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" required />
                 </div>
                 <div className="relative group">
                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <input type="email" placeholder="EMAIL DE PROTOCOLO" value={guestInfo.email} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" required />
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all" />
                    <input type="password" placeholder="PASSWORD MASTER" value={guestInfo.password} onChange={e => setGuestInfo({...guestInfo, password: e.target.value})} className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner" required />
                 </div>
                 <button onClick={handleOrderSubmit} disabled={!guestInfo.name || !guestInfo.email || !guestInfo.password} className="w-full bg-black text-white p-12 rounded-[3.5rem] font-black uppercase tracking-[0.5em] text-[16px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center space-x-6 group disabled:opacity-20">
                    <span>Provisionar e Encomendar</span> <ShieldCheck className="w-8 h-8 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {step === 4 && (
        <div className="h-full flex flex-col items-center justify-center text-center py-24 animate-in zoom-in-95">
           <div className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center mb-16 shadow-[0_0_100px_rgba(34,197,94,0.3)] status-pulse border-[15px] border-white"><CheckCircle2 className="w-24 h-24 text-white" /></div>
           <h3 className="text-8xl font-brand font-black italic uppercase tracking-tighter text-black leading-none mb-12">GRID <br/><span className="text-red-600">LOCKED.</span></h3>
           <div className="max-w-4xl w-full bg-black text-white p-16 rounded-[5rem] shadow-2xl border-b-[20px] border-red-600 space-y-12 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-white/5"><Barcode className="w-40 h-40"/></div>
              <div className="flex justify-between items-center pb-12 border-b border-white/10 relative z-10">
                 <div>
                    <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] block mb-3">Industrial Asset Summary</span>
                    <span className="text-4xl font-brand font-black italic text-red-600 uppercase">{selectedProduct?.name}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] block mb-3">Credit Estimate</span>
                    <span className="text-6xl font-brand font-black italic text-white">€{(selectedProduct!.basePrice * parseInt(config.quantity)).toFixed(2)}</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                 <div><span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Target Node</span><span className="text-[12px] font-black uppercase italic">{hubs.find(h => h.id === config.selectedHubId)?.name || 'Central R2-Unit'}</span></div>
                 <div><span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Atomic Spec</span><span className="text-[12px] font-black uppercase italic">{config.width}x{config.height}{config.unit}</span></div>
                 <div><span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Handshake ID</span><span className="text-[12px] font-black uppercase italic">{config.fileName.slice(0, 15)}...</span></div>
                 <div><span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Grid Sync</span><span className="text-[12px] font-black uppercase italic text-green-500">Verified</span></div>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 mt-24">
             <button onClick={() => setStep(1)} className="bg-gray-100 text-black px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-xl">Novo Projeto Industrial</button>
             <button className="bg-red-600 text-white px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] hover:bg-black transition-all shadow-xl flex items-center space-x-6">
                <Activity className="w-5 h-5"/> <span>Abrir Meu Dashboard</span>
             </button>
           </div>
        </div>
      )}

      {detailProduct && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in">
           <div className="bg-white w-full max-w-6xl rounded-[5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] grid grid-cols-1 lg:grid-cols-2 relative h-[85vh]">
              <button onClick={() => setDetailProduct(null)} className="absolute top-12 right-12 z-20 p-5 text-gray-300 hover:text-black transition-all transform hover:rotate-90"><X className="w-12 h-12"/></button>
              <div className="relative bg-gray-50 overflow-hidden">
                 <img src={detailProduct.image} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                 <div className="absolute bottom-16 left-16 text-white space-y-4">
                    <span className="bg-red-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{detailProduct.category}</span>
                    <h4 className="text-6xl font-brand font-black italic uppercase leading-none tracking-tighter">{detailProduct.name}</h4>
                 </div>
              </div>
              <div className="p-24 overflow-y-auto space-y-12">
                 <div className="space-y-6">
                    <h5 className="text-[12px] font-black uppercase text-red-600 tracking-[0.5em] flex items-center"><FileDigit className="w-5 h-5 mr-4" /> Technical Blueprint</h5>
                    <p className="text-xl text-gray-500 italic leading-relaxed">{detailProduct.description}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Precision Level</span><span className="text-2xl font-brand font-black italic text-black">{detailProduct.specs.precisionLevel}</span></div>
                    <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Industrial Usage</span><span className="text-2xl font-brand font-black italic text-black">{detailProduct.specs.usage}</span></div>
                    <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Durability R2</span><span className="text-2xl font-brand font-black italic text-black">{detailProduct.specs.durability}</span></div>
                    <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Output Weight</span><span className="text-2xl font-brand font-black italic text-black">{detailProduct.specs.weight}</span></div>
                 </div>
                 <div className="p-10 bg-black text-white rounded-[4rem] flex items-center justify-between shadow-2xl">
                    <div>
                       <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.4em] block mb-2">Base Grid Price</span>
                       <span className="text-5xl font-brand font-black italic">€{detailProduct.basePrice}<span className="text-lg opacity-30">/{detailProduct.unit}</span></span>
                    </div>
                    <button onClick={() => { setSelectedProduct(detailProduct); setDetailProduct(null); setStep(2); }} className="bg-red-600 text-white px-10 py-6 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">Configurar Agora</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductBuilder;
