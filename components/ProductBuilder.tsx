
import React, { useState, useMemo, useRef } from 'react';
import { MATERIALS, FINISHES } from '../constants';
import { ArrowRight, ArrowLeft, CheckCircle2, Cpu, ShieldCheck, Zap, Info, ChevronLeft, ChevronRight, X, Upload, Activity, Package, MessageCircle, Server, FileCheck, FileWarning, Layers, Search, BarChart3, Globe, FileDigit } from 'lucide-react';
import { ProductionJob, User, ExtendedProduct, PartnerNode, Language, Category } from '../types';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob, guestData?: { name: string, email: string }) => void;
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

  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
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
    if (!user && (guestInfo.name === '' || !guestInfo.email.includes('@'))) { setStep(3); return; }

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
      onAddOrder(newOrder, !user ? { name: guestInfo.name, email: guestInfo.email } : undefined);
      setIsSyncing(false);
      setStep(4);
    }, 2500);
  };

  const categories = useMemo(() => ['Tudo', ...Object.values(Category)], []);
  const filteredProducts = products.filter(p => (activeCategory === 'Tudo' || p.category === activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen">
      {step === 1 && (
         <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col xl:flex-row justify-between items-end gap-12 mb-16">
               <div className="space-y-6">
                 <h3 className="text-8xl font-brand font-black italic uppercase text-black tracking-tighter leading-none">Módulos de <br/><span className="text-red-600">Produção.</span></h3>
                 <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                    {categories.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-black text-white border-black scale-105 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
               </div>
               <div className="flex-grow bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-2xl flex items-center max-w-lg w-full">
                  <Search className="w-6 h-6 text-gray-300 ml-6" />
                  <input type="text" placeholder="LOCALIZAR MÓDULO R2..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="bg-transparent flex-grow outline-none font-black uppercase text-[11px] p-6" />
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
               {paginatedProducts.map(p => (
                 <div key={p.id} onClick={() => setSelectedProduct(p)} className={`bg-white border-2 rounded-[4.5rem] p-8 transition-all cursor-pointer relative group ${selectedProduct?.id === p.id ? 'border-red-600 shadow-2xl scale-[1.02]' : 'border-gray-50 hover:border-black shadow-lg'}`}>
                    {p.badge && (
                      <div className="absolute top-10 right-10 bg-red-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black z-10 shadow-lg">{p.badge}</div>
                    )}
                    <div className="w-full aspect-[4/3] rounded-[3.5rem] overflow-hidden mb-8 shadow-inner bg-gray-50">
                       <img src={p.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em]">{p.category}</span>
                       <h5 className="text-3xl font-brand font-black italic uppercase text-black leading-none">{p.name}</h5>
                    </div>
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                       <span className="text-4xl font-brand font-black italic">€{p.basePrice}<span className="text-xs font-normal opacity-40">/{p.unit}</span></span>
                       <div className={`p-4 rounded-2xl transition-all ${selectedProduct?.id === p.id ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white'}`}>
                          <Zap className={`w-6 h-6 ${selectedProduct?.id === p.id ? 'animate-pulse' : ''}`} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                 <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-4 bg-white border border-gray-100 rounded-full disabled:opacity-30 hover:bg-black hover:text-white transition-all"><ChevronLeft /></button>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Pág {currentPage} de {totalPages}</span>
                 <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-4 bg-white border border-gray-100 rounded-full disabled:opacity-30 hover:bg-black hover:text-white transition-all"><ChevronRight /></button>
              </div>
            )}

            {selectedProduct && <button onClick={() => setStep(2)} className="w-full bg-black text-white p-10 rounded-[4rem] font-brand font-black italic uppercase tracking-[0.5em] mt-12 hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center animate-in slide-in-from-bottom-5">Configurar Projeto R2 <ArrowRight className="ml-4 w-6 h-6" /></button>}
         </div>
      )}

      {step === 2 && (
         <div className="bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-16 animate-in slide-in-from-right-10 relative overflow-hidden">
            <button onClick={() => setStep(1)} className="absolute top-10 right-10 p-4 text-gray-300 hover:text-black hover:rotate-90 transition-all"><X className="w-10 h-10"/></button>
            <h3 className="text-5xl font-brand font-black italic uppercase mb-12">Configuração <span className="text-red-600">Fase 02.</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Largura (mm)</label>
                        <input type="number" placeholder="LARGURA" value={config.width} onChange={e => setConfig({...config, width: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase outline-none focus:border-red-600 border-2 border-transparent shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Altura (mm)</label>
                        <input type="number" placeholder="ALTURA" value={config.height} onChange={e => setConfig({...config, height: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase outline-none focus:border-red-600 border-2 border-transparent shadow-inner" />
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Quantidade Total</label>
                    <input type="number" placeholder="QUANTIDADE" value={config.quantity} onChange={e => setConfig({...config, quantity: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase outline-none focus:border-red-600 border-2 border-transparent shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Substrato Industrial</label>
                    <select value={config.material} onChange={e => setConfig({...config, material: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase outline-none border-2 border-transparent focus:border-red-600 shadow-inner">
                       {MATERIALS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
               </div>
               <div className="space-y-8">
                  <div className={`relative bg-black text-white p-12 rounded-[4rem] text-center overflow-hidden transition-all border-b-[10px] border-red-900/50 ${isUploading ? 'opacity-50' : 'opacity-100'}`}>
                     {isUploading && <div className="absolute top-0 left-0 w-full z-20"><div className="laser-line"></div></div>}
                     <Upload className="w-12 h-12 text-red-600 mx-auto mb-6" />
                     <h4 className="text-xl font-brand font-black italic uppercase mb-4">{config.fileName || 'Asset Industrial R2'}</h4>
                     <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-6 italic">Handshake seguro de ficheiro vetorial</p>
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">Selecionar PDF/AI</button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Destino Industrial</label>
                    <select value={config.selectedHubId} onChange={e => setConfig({...config, selectedHubId: e.target.value})} className="w-full bg-gray-50 p-6 rounded-3xl font-black uppercase outline-none border-2 border-transparent focus:border-red-600 shadow-inner">
                       <option value="">Roteamento Inteligente R2</option>
                       {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
               </div>
            </div>
            {isSyncing ? (
              <div className="w-full mt-16 p-10 bg-black rounded-[3rem] flex items-center justify-center space-x-6 animate-pulse">
                <Cpu className="w-10 h-10 text-red-600 animate-spin" />
                <span className="text-white font-brand font-black italic uppercase text-xl">Sincronizando com Cluster R2...</span>
              </div>
            ) : (
              <button onClick={handleOrderSubmit} disabled={!config.fileName || !config.width || !config.height} className="w-full mt-16 bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.4em] hover:bg-red-600 transition-all shadow-2xl disabled:opacity-20 flex items-center justify-center space-x-6 group">
                <span>Injetar Protocolo de Produção</span> <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
              </button>
            )}
         </div>
      )}

      {step === 4 && (
        <div className="h-full flex flex-col items-center justify-center text-center py-24 animate-in zoom-in-95">
           <div className="w-40 h-40 bg-green-500 rounded-full flex items-center justify-center mb-10 shadow-2xl status-pulse"><CheckCircle2 className="w-20 h-20 text-white" /></div>
           <h3 className="text-7xl font-brand font-black italic uppercase tracking-tighter text-black leading-none mb-12">Protocolo <br/><span className="text-red-600">Sincronizado.</span></h3>
           <div className="max-w-2xl bg-black text-white p-12 rounded-[4rem] shadow-2xl border-b-[15px] border-red-600 space-y-8 text-left">
              <div className="flex justify-between items-center pb-8 border-b border-white/10">
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Resumo do Ativo</span>
                    <span className="text-2xl font-brand font-black italic text-red-600 uppercase">{selectedProduct?.name}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Valor Estimado</span>
                    <span className="text-4xl font-brand font-black italic">€{(selectedProduct!.basePrice * parseInt(config.quantity)).toFixed(2)}</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-10 text-[10px] font-black uppercase tracking-widest">
                 <div><span className="text-gray-500 block mb-1">Hub Industrial</span>{hubs.find(h => h.id === config.selectedHubId)?.name || 'Grid Central R2'}</div>
                 <div><span className="text-gray-500 block mb-1">Dimensões Master</span>{config.width}x{config.height}{config.unit}</div>
                 <div><span className="text-gray-500 block mb-1">Handshake Asset</span>{config.fileName}</div>
                 <div><span className="text-gray-500 block mb-1">Cashback Estimado</span>€{(selectedProduct!.basePrice * parseInt(config.quantity) * 0.02).toFixed(2)}</div>
              </div>
           </div>
           <div className="flex space-x-6 mt-20">
             <button onClick={() => setStep(1)} className="bg-gray-100 text-black px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-xl">Novo Projeto R2</button>
             <button className="bg-red-600 text-white px-16 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.3em] hover:bg-black transition-all shadow-xl flex items-center space-x-4">
                <FileDigit className="w-5 h-5"/> <span>Ver Meu Grid</span>
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductBuilder;
