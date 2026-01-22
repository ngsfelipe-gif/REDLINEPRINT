
import React, { useState, useMemo, useRef } from 'react';
import { MATERIALS, FINISHES } from '../constants';
import { ArrowRight, ArrowLeft, CheckCircle2, Cpu, ShieldCheck, Zap, Info, ChevronLeft, ChevronRight, X, Upload, Activity, Package, MessageCircle, Server, FileCheck, FileWarning, Layers, Search, BarChart3, Globe, FileDigit, Monitor, LayoutGrid, Clock, Shield, Settings, Barcode, Mail, User as UserIcon, Lock, Target, Droplets, HardHat, Gauge } from 'lucide-react';
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
    <div className="max-w-[1700px] mx-auto px-10 py-12 industrial-grid min-h-screen pt-40 lg:pt-48">
      {step === 1 && (
         <div className="space-y-24 animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row justify-between items-end gap-12">
               <div className="space-y-10">
                 <div className="flex items-center space-x-3 bg-black text-white px-5 py-2.5 rounded-full w-fit shadow-lg">
                    <LayoutGrid className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">R2-Inventory // Cluster Central</span>
                 </div>
                 <h3 className="text-8xl md:text-9xl font-brand font-black italic uppercase text-black tracking-tighter leading-[0.8] mb-4">Módulos <br/><span className="text-red-600">Industriais.</span></h3>
                 <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1); }} className={`px-12 py-5 rounded-full text-[12px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${activeCategory === cat ? 'bg-red-600 text-white border-red-600 shadow-2xl scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}>{cat}</button>
                    ))}
                 </div>
               </div>
               <div className="flex flex-col items-end gap-8 w-full max-w-xl">
                  <div className="flex items-center space-x-10 text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">
                     <div className="flex items-center space-x-3"><Monitor className="w-5 h-5 text-red-600" /> <span>{products.length} Ativos</span></div>
                     <div className="flex items-center space-x-3"><Activity className="w-5 h-5 text-red-600" /> <span>Latência: 0.00ms</span></div>
                  </div>
                  <div className="bg-white p-4 rounded-[3.5rem] border border-gray-100 shadow-2xl flex items-center w-full focus-within:ring-4 focus-within:ring-red-600/10 focus-within:border-black transition-all">
                     <Search className="w-10 h-10 text-gray-300 ml-8" />
                     <input type="text" placeholder="LOCALIZAR MÓDULO NO GRID..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="bg-transparent flex-grow outline-none font-black uppercase text-[15px] p-6 placeholder:text-gray-200" />
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-16">
               {paginatedProducts.map(p => (
                 <div key={p.id} onClick={() => setSelectedProduct(p)} className={`bg-white border-[3px] rounded-[5rem] p-12 transition-all duration-700 cursor-pointer relative group flex flex-col h-full ${selectedProduct?.id === p.id ? 'border-red-600 shadow-[0_80px_150px_rgba(204,0,0,0.15)] scale-[1.04]' : 'border-transparent hover:border-black shadow-xl hover:shadow-2xl'}`}>
                    {p.badge && <div className="absolute top-12 right-12 bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-black z-10 shadow-xl tracking-[0.3em] uppercase border border-white/20 animate-pulse">{p.badge}</div>}
                    
                    <div className="w-full aspect-[4/5] rounded-[4rem] overflow-hidden mb-12 shadow-inner bg-gray-50 relative border border-gray-100">
                       <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                       
                       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0 duration-500">
                          <button onClick={(e) => { e.stopPropagation(); setDetailProduct(p); }} className="bg-white text-black p-6 rounded-3xl hover:bg-red-600 hover:text-white transition-all shadow-2xl flex items-center space-x-3">
                            <Info className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Detalhes R2</span>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-8 flex-grow">
                       <div className="space-y-4">
                          <span className="text-[11px] font-black uppercase text-red-600 tracking-[0.6em] block opacity-60">{p.category}</span>
                          <h5 className="text-5xl font-brand font-black italic uppercase text-black leading-none tracking-tighter group-hover:text-red-600 transition-colors">{p.name}</h5>
                       </div>
                       
                       <p className="text-[14px] font-medium text-gray-500 italic line-clamp-2 leading-relaxed h-12 border-l-2 border-gray-100 pl-4">{p.description}</p>
                       
                       <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-50">
                          <div className="flex items-center space-x-4 group/spec">
                             <div className="p-2.5 bg-gray-50 rounded-xl group-hover/spec:bg-red-50 transition-colors">
                                <Droplets className="w-5 h-5 text-red-600" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Substrato</span>
                                <span className="text-[11px] font-bold text-black uppercase tracking-tighter">{p.specs.weight}</span>
                             </div>
                          </div>
                          <div className="flex items-center space-x-4 group/spec">
                             <div className="p-2.5 bg-gray-50 rounded-xl group-hover/spec:bg-red-50 transition-colors">
                                <Gauge className="w-5 h-5 text-red-600" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Precisão</span>
                                <span className="text-[11px] font-bold text-black uppercase tracking-tighter">{p.specs.precisionLevel}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex justify-between items-center mt-auto pt-10 border-t border-gray-50">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Preço Atómico</span>
                             {user || isAdmin || isB2B ? (
                               <span className="text-5xl font-brand font-black italic text-black">
                                 €{p.basePrice.toFixed(2)}<span className="text-[12px] font-normal opacity-30 italic">/{p.unit}</span>
                               </span>
                             ) : (
                               <span className="text-[11px] font-black uppercase text-red-600 italic tracking-[0.2em] animate-pulse">LOGIN PARA ACESSO</span>
                             )}
                          </div>
                          <div className={`p-8 rounded-[2rem] transition-all duration-700 ${selectedProduct?.id === p.id ? 'bg-red-600 text-white animate-pulse shadow-[0_0_50px_rgba(204,0,0,0.4)] scale-110 rotate-12' : 'bg-gray-50 text-gray-200 group-hover:bg-black group-hover:text-white hover:rotate-12'}`}>
                             <Zap className="w-10 h-10" />
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-16 mt-24 py-16 border-t border-gray-100">
                 <button onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }} disabled={currentPage === 1} className="p-10 bg-white border-2 border-gray-100 rounded-full disabled:opacity-20 hover:bg-black hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-95"><ChevronLeft className="w-12 h-12" /></button>
                 <div className="flex items-center space-x-6">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`w-18 h-18 rounded-[2.5rem] font-brand font-black italic text-3xl transition-all duration-500 ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-[0_20px_40px_rgba(204,0,0,0.3)] scale-125' : 'bg-gray-100 text-gray-400 hover:bg-black hover:text-white'}`}>{i + 1}</button>
                    ))}
                 </div>
                 <button onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({top: 0, behavior: 'smooth'}); }} disabled={currentPage === totalPages} className="p-10 bg-white border-2 border-gray-100 rounded-full disabled:opacity-20 hover:bg-black hover:text-white transition-all shadow-2xl hover:scale-110 active:scale-95"><ChevronRight className="w-12 h-12" /></button>
              </div>
            )}

            {selectedProduct && (
              <div className="sticky bottom-10 left-0 w-full z-40 animate-in slide-in-from-bottom-10 duration-1000">
                <button onClick={() => setStep(2)} className="w-full bg-black text-white p-16 rounded-[5rem] font-brand font-black italic uppercase tracking-[0.8em] text-3xl hover:bg-red-600 transition-all shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex items-center justify-center group border-b-[15px] border-gray-900 overflow-hidden relative">
                   <div className="absolute inset-0 industrial-grid opacity-10 pointer-events-none" />
                   <span className="relative z-10">Configurar {selectedProduct.name}</span> 
                   <ArrowRight className="ml-12 w-12 h-12 animate-pulse group-hover:translate-x-4 transition-transform relative z-10 text-red-600" />
                </button>
              </div>
            )}
         </div>
      )}

      {/* DETAIL VIEW MODAL - FUTURISTIC UX */}
      {detailProduct && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 lg:p-16 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-[1400px] rounded-[6rem] shadow-[0_0_150px_rgba(0,0,0,0.5)] border-[15px] border-black relative overflow-hidden flex flex-col lg:flex-row h-full max-h-[90vh]">
              <button onClick={() => setDetailProduct(null)} className="absolute top-12 right-12 z-[70] p-6 bg-black text-white rounded-full hover:bg-red-600 hover:rotate-90 transition-all shadow-2xl"><X className="w-10 h-10"/></button>
              
              {/* Product Visual Area */}
              <div className="lg:w-1/2 relative bg-gray-50 h-full overflow-hidden">
                 <img src={detailProduct.image} className="w-full h-full object-cover animate-in zoom-in duration-[10s]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                 <div className="absolute bottom-20 left-20 text-white space-y-4">
                    <span className="text-[12px] font-black uppercase tracking-[0.8em] text-red-600 animate-pulse">Inventory Module: {detailProduct.id}</span>
                    <h3 className="text-8xl font-brand font-black italic uppercase leading-none tracking-tighter">{detailProduct.name}</h3>
                 </div>
              </div>

              {/* Technical Specifications Area */}
              <div className="lg:w-1/2 p-20 lg:p-32 overflow-y-auto space-y-16 industrial-grid">
                 <div className="space-y-6">
                    <h4 className="text-[12px] font-black uppercase text-red-600 tracking-[0.6em] flex items-center">
                       <Cpu className="w-6 h-6 mr-4" /> Especificação Técnica R2
                    </h4>
                    <p className="text-2xl text-gray-500 font-medium leading-relaxed italic border-l-8 border-red-600 pl-10">
                       {detailProduct.description}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-12">
                    {[
                      { icon: Layers, label: 'Substrato Base', val: detailProduct.specs.weight },
                      { icon: Shield, label: 'Durabilidade Grid', val: detailProduct.specs.durability },
                      { icon: HardHat, label: 'Uso Recomendado', val: detailProduct.specs.usage || 'Industrial' },
                      { icon: Target, label: 'Precisão Atómica', val: detailProduct.specs.precisionLevel },
                      { icon: Droplets, label: 'Resistência UV', val: `${detailProduct.specs.weatherResistance || 80}%` },
                      { icon: Globe, label: 'Eco Compliance', val: `Nível ${detailProduct.specs.ecoLevel || 5}` }
                    ].map((spec, i) => (
                      <div key={i} className="bg-gray-50 p-10 rounded-[3rem] border-2 border-transparent hover:border-red-600 transition-all group/spec">
                         <spec.icon className="w-10 h-10 text-red-600 mb-6 group-hover/spec:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">{spec.label}</span>
                         <span className="text-2xl font-brand font-black italic text-black uppercase tracking-tight">{spec.val}</span>
                      </div>
                    ))}
                 </div>

                 <div className="bg-black text-white p-12 rounded-[4rem] flex justify-between items-center shadow-2xl relative overflow-hidden group/price">
                    <div className="absolute inset-0 industrial-grid opacity-10" />
                    <div className="relative z-10">
                       <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 block mb-2 italic">Preço Base do Módulo</span>
                       <span className="text-7xl font-brand font-black italic">€{detailProduct.basePrice.toFixed(2)}<span className="text-2xl font-normal opacity-30">/{detailProduct.unit}</span></span>
                    </div>
                    <button onClick={() => { setSelectedProduct(detailProduct); setDetailProduct(null); setStep(2); }} className="relative z-10 bg-red-600 text-white p-10 rounded-3xl hover:bg-white hover:text-black transition-all shadow-xl hover:scale-105">
                       <Zap className="w-12 h-12" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Outros steps (2, 3, 4) mantêm a lógica com refinamentos visuais de tipografia */}
      {step === 2 && (
         <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-24 animate-in slide-in-from-right-10 relative overflow-hidden">
            <button onClick={() => setStep(1)} className="absolute top-12 right-12 p-6 text-gray-200 hover:text-black hover:rotate-90 transition-all"><X className="w-12 h-12"/></button>
            <div className="flex items-center space-x-8 mb-20">
               <div className="p-8 bg-red-600 rounded-3xl text-white shadow-xl"><Settings className="w-12 h-12 animate-spin-slow" /></div>
               <h3 className="text-7xl font-brand font-black italic uppercase text-black leading-none tracking-tighter">GRID <span className="text-red-600">PRESETS.</span></h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
               <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-5">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-8">Width Axis</label>
                        <div className="flex bg-gray-50 p-6 rounded-[3rem] border border-transparent focus-within:border-red-600 shadow-inner">
                           <input type="number" placeholder="00.0" value={config.width} onChange={e => setConfig({...config, width: e.target.value})} className="bg-transparent flex-grow p-4 font-brand font-black italic text-3xl outline-none" />
                           <span className="p-4 font-black uppercase text-gray-300">MM</span>
                        </div>
                     </div>
                     <div className="space-y-5">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-8">Height Axis</label>
                        <div className="flex bg-gray-50 p-6 rounded-[3rem] border border-transparent focus-within:border-red-600 shadow-inner">
                           <input type="number" placeholder="00.0" value={config.height} onChange={e => setConfig({...config, height: e.target.value})} className="bg-transparent flex-grow p-4 font-brand font-black italic text-3xl outline-none" />
                           <span className="p-4 font-black uppercase text-gray-300">MM</span>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-8">Atomic Quantity</label>
                    <input type="number" placeholder="100" value={config.quantity} onChange={e => setConfig({...config, quantity: e.target.value})} className="w-full bg-gray-50 p-10 rounded-[3rem] font-brand font-black italic text-3xl outline-none border border-transparent focus:border-red-600 shadow-inner" />
                  </div>
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-8">Industrial Substrate</label>
                    <select value={config.material} onChange={e => setConfig({...config, material: e.target.value})} className="w-full bg-gray-50 p-10 rounded-[3rem] font-black uppercase text-[14px] outline-none border border-transparent focus:border-red-600 shadow-inner appearance-none cursor-pointer">{MATERIALS.map(m => <option key={m}>{m}</option>)}</select>
                  </div>
               </div>
               <div className="space-y-12">
                  <div className={`relative bg-black text-white p-20 rounded-[5rem] text-center overflow-hidden transition-all border-b-[20px] border-red-900 shadow-2xl group ${isUploading ? 'opacity-50' : 'opacity-100'}`}>
                     {isUploading && <div className="absolute top-0 left-0 w-full z-20"><div className="laser-line"></div></div>}
                     <Upload className="w-20 h-20 text-red-600 mx-auto mb-10 group-hover:scale-110 transition-transform" />
                     <h4 className="text-4xl font-brand font-black italic uppercase mb-6 tracking-tighter leading-none">{config.fileName || 'INJECT ASSET'}</h4>
                     <p className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] mb-12 italic">Vector Protocol (PDF / AI / DXF)</p>
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-16 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all shadow-2xl">Upload Asset</button>
                  </div>
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-8">Node Route Override</label>
                    <select value={config.selectedHubId} onChange={e => setConfig({...config, selectedHubId: e.target.value})} className="w-full bg-gray-50 p-10 rounded-[3rem] font-black uppercase text-[14px] outline-none border border-transparent focus:border-red-600 shadow-inner appearance-none cursor-pointer">
                       <option value="">Roteamento Inteligente (Recomendado)</option>
                       {hubs.map(h => <option key={h.id} value={h.id}>{h.name} [{h.location}]</option>)}
                    </select>
                  </div>
               </div>
            </div>
            <button onClick={handleOrderSubmit} disabled={!config.fileName || !config.width || !config.height} className="w-full mt-32 bg-black text-white p-16 rounded-[4.5rem] font-brand font-black italic uppercase tracking-[0.5em] text-3xl hover:bg-red-600 transition-all shadow-2xl disabled:opacity-20 flex items-center justify-center space-x-12 group border-b-[15px] border-gray-900">
              <span>{user ? 'Sincronizar Produção' : 'Registar Identidade R2'}</span> <Zap className="w-10 h-10 group-hover:scale-125 transition-transform text-red-600" />
            </button>
         </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-[5rem] shadow-2xl border-t-[20px] border-red-600 p-32 text-center space-y-16 animate-in zoom-in-95 duration-700 max-w-4xl mx-auto">
           <div className="relative inline-block">
              <CheckCircle2 className="w-40 h-40 text-green-500 mx-auto animate-in zoom-in-125 duration-1000" />
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
           </div>
           <h3 className="text-7xl font-brand font-black italic uppercase text-black leading-none tracking-tighter">Job <br/><span className="text-red-600">Sincronizado.</span></h3>
           <p className="text-2xl text-gray-400 font-medium italic border-l-8 border-red-600 pl-10 max-w-2xl mx-auto text-left leading-relaxed">
             O protocolo de produção foi injetado com sucesso no cluster central. A Torre de Controlo Master validará os ativos e iniciará a manufatura no node otimizado.
           </p>
           <button onClick={() => { setStep(1); setSelectedProduct(null); }} className="bg-black text-white px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] hover:bg-red-600 transition-all shadow-2xl">
              Regressar ao Grid Central
           </button>
        </div>
      )}
    </div>
  );
};

export default ProductBuilder;
