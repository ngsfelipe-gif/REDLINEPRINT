
import React, { useState, useMemo, useRef } from 'react';
import { MATERIALS, FINISHES } from '../constants';
import { ArrowRight, ArrowLeft, CheckCircle2, Box, Cpu, ShieldCheck, Zap, Info, ChevronLeft, ChevronRight, X, Upload, FileText, AlertTriangle, User as UserIcon, Mail, Activity } from 'lucide-react';
import { ProductionJob, User, ExtendedProduct, PartnerNode, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob) => void;
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
  
  // Configuração Industrial
  const [config, setConfig] = useState({
    material: MATERIALS[0],
    finish: FINISHES[0],
    quantity: '100',
    width: '',
    height: '',
    unit: 'mm' as 'mm' | 'cm' | 'm',
    observations: '',
    fileName: ''
  });

  // Dados do Convidado (Guest)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const isConfigValid = useMemo(() => {
    return config.width !== '' && config.height !== '' && config.fileName !== '' && parseInt(config.quantity) > 0;
  }, [config]);

  const isGuestValid = useMemo(() => {
    return guestInfo.name.trim() !== '' && guestInfo.email.includes('@');
  }, [guestInfo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setConfig({ ...config, fileName: e.target.files[0].name });
    }
  };

  const handleOrderSubmit = () => {
    if (!selectedProduct || !isConfigValid) return;
    if (!user && !isGuestValid) return;
    
    setIsSyncing(true);
    
    const newOrder: ProductionJob = {
      id: `RL-${Math.floor(Math.random() * 9000) + 1000}`,
      client: user ? user.name : guestInfo.name,
      clientId: user ? user.id : `GUEST-${Date.now()}`,
      product: selectedProduct.name,
      status: 'Aguardando Aprovação',
      value: (selectedProduct.basePrice * (parseInt(config.quantity) || 1)).toFixed(2),
      // Vinculação Automática ao HUB proprietário ou PENDING se sistema
      nodeId: selectedProduct.ownerHubId === 'SYSTEM' ? 'PENDING' : selectedProduct.ownerHubId,
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
      history: []
    };

    setTimeout(() => {
      onAddOrder(newOrder);
      setIsSyncing(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Progress Sidebar */}
        <div className="lg:w-1/4 space-y-8">
           <div className="bg-black text-white p-14 rounded-[4rem] border-b-[20px] border-red-600 shadow-2xl">
              <h2 className="text-6xl font-brand font-black italic tracking-tighter uppercase leading-none">R2 <br/>Terminal.</h2>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-8 italic">Catálogo Público v.4.2</p>
           </div>
           <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl space-y-6">
              {[1, 2, 3].map(s => (
                <div key={s} className={`p-6 rounded-3xl flex justify-between items-center font-black uppercase text-[12px] transition-all ${step === s || (s === 3 && step === 3) ? 'bg-black text-white scale-105' : 'text-gray-300'}`}>
                   <span>Fase 0{s === 3 && !user ? '3 (Guest)' : s}</span>
                   {step > s && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                </div>
              ))}
           </div>
        </div>

        {/* Workspace */}
        <div className="lg:w-3/4 bg-white rounded-[5rem] shadow-2xl border border-gray-100 p-12 lg:p-24 relative overflow-hidden">
           {isSyncing && (
             <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
                <Cpu className="w-24 h-24 text-red-600 animate-spin mb-8" />
                <h3 className="text-4xl font-brand font-black italic uppercase">Sincronizando Ativo...</h3>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mt-4">Vinculando ao HUB Designado</p>
             </div>
           )}

           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                   <h3 className="text-7xl font-brand font-black italic uppercase text-black leading-none">Explorar <br/><span className="text-red-600">o Catálogo.</span></h3>
                   <div className="flex space-x-6">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-6 bg-gray-50 rounded-3xl hover:bg-black hover:text-white transition-all disabled:opacity-30 shadow-sm"><ChevronLeft/></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-6 bg-gray-50 rounded-3xl hover:bg-black hover:text-white transition-all disabled:opacity-30 shadow-sm"><ChevronRight/></button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                   {paginatedProducts.map(p => (
                     <div 
                        key={p.id} 
                        onClick={() => setSelectedProduct(p)} 
                        className={`group relative bg-white border-4 rounded-[4rem] p-8 transition-all duration-700 cursor-pointer flex flex-col ${
                          selectedProduct?.id === p.id 
                          ? 'border-red-600 shadow-[0_30px_60px_-15px_rgba(204,0,0,0.2)] scale-105 z-10' 
                          : 'border-gray-50 hover:border-gray-200 hover:shadow-xl'
                        }`}
                      >
                        {/* Badge R2 Industrial */}
                        {p.badge && (
                          <div className="absolute top-6 right-6 z-20 bg-red-600 text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-lg tracking-[0.2em] shadow-lg italic">
                            {p.badge}
                          </div>
                        )}

                        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] mb-8 bg-gray-50 border border-gray-100 group-hover:border-transparent transition-all duration-500">
                          <img 
                            src={p.image} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>

                        {/* Metadata Industrial */}
                        <div className="flex flex-col flex-grow">
                          <span className="text-[8px] font-black uppercase text-red-600 tracking-[0.4em] mb-3 block opacity-80">{p.category}</span>
                          <h5 className="text-xl font-brand font-black italic uppercase leading-[0.9] mb-4 text-black group-hover:text-red-600 transition-colors line-clamp-1">{p.name}</h5>
                          
                          {/* Atomic Telemetry (Specs Summary) */}
                          <div className="flex flex-wrap gap-4 mb-8">
                             <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                                <Activity className="w-2.5 h-2.5 text-red-600" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-900">{p.specs.precisionLevel}</span>
                             </div>
                             <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                                <Box className="w-2.5 h-2.5 text-red-600" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-900">{p.specs.weight}</span>
                             </div>
                          </div>
                        </div>

                        {/* Card CTA Footer */}
                        <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-50 group-hover:border-red-50 transition-colors">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Preço Base</span>
                              <span className="text-[13px] font-black text-black italic">€{p.basePrice}/{p.unit}</span>
                           </div>
                           <div className={`p-3.5 rounded-2xl transition-all duration-500 ${selectedProduct?.id === p.id ? 'bg-red-600 text-white shadow-lg' : 'bg-black text-white group-hover:bg-red-600 group-hover:scale-110'}`}>
                             <Zap className="w-5 h-5"/>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
                {selectedProduct && (
                  <button onClick={() => setStep(2)} className="mt-20 w-full bg-black text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[14px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center group">
                    <span>Configurar Especificações</span> <ArrowRight className="ml-6 w-6 h-6 group-hover:translate-x-4 transition-transform"/>
                  </button>
                )}
             </div>
           )}

           {step === 2 && selectedProduct && (
              <div className="animate-in fade-in slide-in-from-right-10 space-y-16">
                 <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Configuração <span className="text-red-600">do Job.</span></h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                       <div className="p-10 bg-gray-50 rounded-[4rem] border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                             <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Dimensões Customizadas</label>
                             <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                                {['mm', 'cm', 'm'].map(u => (
                                  <button key={u} onClick={() => setConfig({...config, unit: u as any})} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${config.unit === u ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>{u}</button>
                                ))}
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <input type="number" placeholder="LARGURA" value={config.width} onChange={e => setConfig({...config, width: e.target.value})} className="w-full bg-white p-5 rounded-2xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" />
                             <input type="number" placeholder="ALTURA" value={config.height} onChange={e => setConfig({...config, height: e.target.value})} className="w-full bg-white p-5 rounded-2xl font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
                             <label className="text-[10px] font-black uppercase text-gray-400 block mb-4">Material</label>
                             <select value={config.material} onChange={e => setConfig({...config, material: e.target.value})} className="w-full bg-white p-4 rounded-2xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600">
                                {MATERIALS.map(m => <option key={m}>{m}</option>)}
                             </select>
                          </div>
                          <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
                             <label className="text-[10px] font-black uppercase text-gray-400 block mb-4">Quantidade</label>
                             <input type="number" value={config.quantity} onChange={e => setConfig({...config, quantity: e.target.value})} className="w-full bg-white p-4 rounded-2xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className={`bg-black text-white p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden group border-2 transition-all ${config.fileName ? 'border-green-500/50' : 'border-white/5'}`}>
                          <div className="relative z-10 flex flex-col items-center text-center">
                             <Upload className={`w-16 h-16 mb-6 transition-all ${config.fileName ? 'text-green-500 scale-110' : 'text-red-600 animate-bounce'}`} />
                             <h4 className="text-3xl font-brand font-black italic uppercase mb-4">Arte Final</h4>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.png,.ai,.eps" />
                             <button onClick={() => fileInputRef.current?.click()} className={`w-full p-6 rounded-3xl font-black uppercase text-[12px] tracking-widest transition-all shadow-xl ${config.fileName ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}>
                                {config.fileName ? config.fileName : 'Carregar Ficheiro'}
                             </button>
                          </div>
                       </div>

                       <div className="bg-gray-50 p-10 rounded-[4rem] border-l-[15px] border-red-600">
                          <span className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-widest">HUB de Destino</span>
                          <span className="text-2xl font-brand font-black italic text-black leading-none">
                            {selectedProduct.ownerHubId === 'SYSTEM' ? 'Cluster Master' : `Node: ${selectedProduct.ownerHubId}`}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="flex space-x-6">
                    <button onClick={() => setStep(1)} className="p-10 bg-gray-50 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"><ArrowLeft className="w-8 h-8"/></button>
                    <button 
                      onClick={() => user ? handleOrderSubmit() : setStep(3)} 
                      disabled={!isConfigValid}
                      className={`flex-grow p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[14px] transition-all shadow-2xl flex items-center justify-center group ${isConfigValid ? 'bg-black text-white hover:bg-red-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'}`}
                    >
                       <span>{user ? 'Finalizar Encomenda' : 'Prosseguir para Checkout'}</span> <ArrowRight className="ml-6 w-8 h-8 group-hover:translate-x-4 transition-transform" />
                    </button>
                 </div>
              </div>
           )}

           {step === 3 && !user && (
             <div className="animate-in fade-in slide-in-from-right-10 space-y-16 py-12">
                <div className="text-center space-y-4">
                  <h3 className="text-6xl font-brand font-black italic uppercase leading-none">Identificação <span className="text-red-600">de Grid.</span></h3>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Não está autenticado. Por favor, identifique-se para registar a ordem de produção.</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-8">
                   <div className="relative group">
                      <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all"/>
                      <input 
                        type="text" 
                        placeholder="NOME COMPLETO / EMPRESA" 
                        value={guestInfo.name}
                        onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                        className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner"
                      />
                   </div>
                   <div className="relative group">
                      <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-red-600 transition-all"/>
                      <input 
                        type="email" 
                        placeholder="EMAIL DE CONTACTO" 
                        value={guestInfo.email}
                        onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                        className="w-full bg-gray-50 pl-20 p-8 rounded-[2.5rem] font-black uppercase text-[12px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner"
                      />
                   </div>
                   
                   <div className="p-8 bg-orange-50 rounded-[3rem] border border-orange-100 flex items-center space-x-6">
                      <Info className="w-10 h-10 text-orange-600 shrink-0" />
                      <p className="text-[10px] font-black text-orange-800 uppercase italic leading-relaxed">Nota: Encomendas de convidados requerem validação manual e pagamento antecipado no HUB de destino.</p>
                   </div>
                </div>

                <div className="flex space-x-6">
                    <button onClick={() => setStep(2)} className="p-10 bg-gray-50 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"><ArrowLeft className="w-8 h-8"/></button>
                    <button 
                      onClick={handleOrderSubmit} 
                      disabled={!isGuestValid}
                      className={`flex-grow p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-[14px] transition-all shadow-2xl flex items-center justify-center group ${isGuestValid ? 'bg-red-600 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'}`}
                    >
                       <span>Injetar no Grid R2</span> <ShieldCheck className="ml-6 w-8 h-8 group-hover:rotate-12 transition-transform" />
                    </button>
                 </div>
             </div>
           )}

           {step === 4 && (
             <div className="h-full flex flex-col items-center justify-center text-center py-32 animate-in zoom-in-95">
                <div className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center mb-12 shadow-[0_0_80px_rgba(34,197,94,0.4)] status-pulse">
                   <CheckCircle2 className="w-24 h-24 text-white" />
                </div>
                <h3 className="text-7xl font-brand font-black italic uppercase tracking-tighter mb-6">Job Aceite.</h3>
                <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.5em] mb-16 max-w-xl">O seu pedido foi encaminhado para o HUB {selectedProduct?.ownerHubId}. <br/>Receberá um email com os próximos passos de produção.</p>
                <div className="flex space-x-6">
                   <button onClick={() => {setStep(1); setSelectedProduct(null);}} className="bg-black text-white px-16 py-7 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl">Novo Pedido</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
