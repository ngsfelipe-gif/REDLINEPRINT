
import React, { useState, useMemo, useRef } from 'react';
import { MATERIALS, FINISHES } from '../constants';
import { ArrowRight, ArrowLeft, CheckCircle2, Cpu, ShieldCheck, Zap, Info, ChevronLeft, ChevronRight, X, Upload, Activity, Package, MessageCircle, Server, FileCheck, FileWarning, Layers } from 'lucide-react';
import { ProductionJob, User, ExtendedProduct, PartnerNode, Language } from '../types';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
  const itemsPerPage = 6; // Reduzido para melhor visualização dos cards aumentados

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const isConfigValid = useMemo(() => {
    const hasDimensions = config.width !== '' && config.height !== '';
    const hasFile = config.fileName !== '';
    const hasQuantity = parseInt(config.quantity) > 0;
    const hasHub = config.selectedHubId !== '' || (selectedProduct?.ownerHubId !== 'SYSTEM' && selectedProduct?.ownerHubId);
    return hasDimensions && hasFile && hasQuantity && hasHub;
  }, [config, selectedProduct]);

  const isGuestValid = useMemo(() => {
    return guestInfo.name.trim() !== '' && guestInfo.email.includes('@') && guestInfo.phone.length >= 9;
  }, [guestInfo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Formato inválido. Use PDF, JPG ou PNG.' }));
        return;
      }
      
      setErrors(prev => ({ ...prev, file: '' }));
      setConfig({ ...config, fileName: file.name });
    }
  };

  const handleOrderSubmit = () => {
    if (!selectedProduct) return;

    if (!isConfigValid) {
       setErrors(prev => ({ ...prev, general: 'A Fase 2 requer todos os dados técnicos e arquivo.' }));
       return;
    }

    if (!user && !isGuestValid) {
       setStep(3);
       return;
    }

    setIsSyncing(true);
    
    const hubId = config.selectedHubId || (selectedProduct.ownerHubId === 'SYSTEM' ? 'NODE-LIS' : selectedProduct.ownerHubId);

    const newOrder: ProductionJob = {
      id: `RL-${Math.floor(Math.random() * 9000) + 1000}`,
      client: user ? user.name : guestInfo.name,
      clientId: user ? user.id : `GUEST-${Date.now()}`,
      product: selectedProduct.name,
      status: 'Aguardando Aprovação',
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
      history: [
        { 
           timestamp: Date.now(), 
           status: 'Injetado no Grid', 
           author: user ? user.name : guestInfo.name, 
           note: 'Job industrial configurado com sucesso.' 
        }
      ]
    };

    setTimeout(() => {
      onAddOrder(newOrder);
      setIsSyncing(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 industrial-grid min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/4 space-y-6">
           <div className="bg-black text-white p-10 rounded-[3.5rem] border-b-[15px] border-red-600 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 industrial-grid opacity-10" />
              <div className="relative z-10">
                 <h2 className="text-5xl font-brand font-black italic tracking-tighter uppercase leading-none">R2 <br/>Grid.</h2>
                 <div className="mt-6 flex items-center space-x-3">
                    <Layers className="w-4 h-4 text-red-600" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Inventory Sector 0{currentPage}</p>
                 </div>
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`p-5 rounded-2xl flex justify-between items-center font-black uppercase text-[11px] transition-all duration-500 ${step === s ? 'bg-black text-white scale-105 shadow-xl' : 'text-gray-300'}`}>
                   <span>Pass 0{s}</span>
                   {step > s && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                </div>
              ))}
           </div>
        </div>

        <div className="lg:w-3/4 bg-white rounded-[4.5rem] shadow-2xl border border-gray-100 p-10 lg:p-16 relative overflow-hidden">
           {isSyncing && (
             <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
                <Cpu className="w-20 h-20 text-red-600 animate-spin mb-8" />
                <h3 className="text-4xl font-brand font-black italic uppercase">Syncing Active...</h3>
             </div>
           )}

           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-10">
                   <div>
                      <h3 className="text-6xl font-brand font-black italic uppercase text-black leading-none tracking-tighter">Células <br/><span className="text-red-600">R2 Production.</span></h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 italic">Página {currentPage} de {totalPages} // {products.length} Ativos</p>
                   </div>
                   <div className="flex space-x-3">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-6 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all disabled:opacity-20 shadow-lg border border-gray-100"><ChevronLeft className="w-8 h-8"/></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-6 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all disabled:opacity-20 shadow-lg border border-gray-100"><ChevronRight className="w-8 h-8"/></button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {paginatedProducts.map(p => (
                     <div 
                        key={p.id} 
                        onClick={() => setSelectedProduct(p)} 
                        className={`group bg-white border-2 rounded-[4.5rem] p-10 transition-all duration-700 cursor-pointer flex flex-col gap-8 ${
                          selectedProduct?.id === p.id 
                          ? 'border-red-600 shadow-[0_40px_80px_-20px_rgba(204,0,0,0.3)] scale-[1.01] z-10' 
                          : 'border-gray-50 hover:border-black hover:shadow-xl'
                        }`}
                      >
                        <div className="w-full relative aspect-[16/10] overflow-hidden rounded-[3.5rem] bg-gray-50 border border-gray-100 shadow-inner">
                           <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                           <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest italic border border-white/20 z-10">{p.badge || 'R2 ATOM'}</div>
                        </div>

                        <div className="flex flex-col justify-between flex-grow px-4">
                          <div className="space-y-4">
                            <span className="text-[8px] font-black uppercase text-red-600 tracking-[0.5em]">{p.category}</span>
                            <h5 className="text-4xl font-brand font-black italic uppercase leading-[0.85] text-black group-hover:text-red-600 transition-colors tracking-tighter">{p.name}</h5>
                            <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed uppercase tracking-widest line-clamp-2">{p.description}</p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-8 border-t border-gray-50 mt-8">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Industrial Rate</span>
                                <span className="text-4xl font-brand font-black text-black italic leading-none">€{p.basePrice}<span className="text-sm font-normal ml-1">/{p.unit}</span></span>
                             </div>
                             <div className={`p-6 rounded-[2.5rem] transition-all duration-500 shadow-xl ${selectedProduct?.id === p.id ? 'bg-red-600 text-white scale-110' : 'bg-black text-white hover:bg-red-600'}`}>
                               <Zap className="w-6 h-6"/>
                             </div>
                          </div>
                        </div>
                     </div>
                   ))}
                </div>
                
                {/* Indicadores de Paginação Inferiores */}
                <div className="mt-16 flex justify-center space-x-2">
                   {Array.from({ length: totalPages }).map((_, i) => (
                     <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-12 h-2 rounded-full transition-all duration-500 ${currentPage === i + 1 ? 'bg-red-600 w-24' : 'bg-gray-100 hover:bg-gray-200'}`}
                     />
                   ))}
                </div>

                {selectedProduct && (
                  <button onClick={() => setStep(2)} className="mt-16 w-full bg-black text-white p-12 rounded-[3.5rem] font-brand font-black italic uppercase tracking-[0.4em] text-[16px] hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center group border-b-[10px] border-red-900/30">
                    <span>Configurar Protocolo R2</span> <ArrowRight className="ml-6 w-8 h-8 group-hover:translate-x-6 transition-transform"/>
                  </button>
                )}
             </div>
           )}

           {/* Passos 2 e 3 mantidos conforme lógica anterior para não quebrar fluxos */}
           {step === 2 && selectedProduct && (
              <div className="animate-in fade-in slide-in-from-right-10 space-y-12">
                 <h3 className="text-5xl font-brand font-black italic uppercase leading-none">Fase 02: <span className="text-red-600">Engenharia do Job.</span></h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                             <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Dimensões Exatas (L x A)</label>
                             <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                                {['mm', 'cm', 'm'].map(u => (
                                  <button key={u} onClick={() => setConfig({...config, unit: u as any})} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${config.unit === u ? 'bg-black text-white shadow-md' : 'text-gray-400'}`}>{u}</button>
                                ))}
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <input type="number" placeholder="LARGURA" value={config.width} onChange={e => setConfig({...config, width: e.target.value})} className="w-full bg-white p-4 rounded-xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" />
                             <input type="number" placeholder="ALTURA" value={config.height} onChange={e => setConfig({...config, height: e.target.value})} className="w-full bg-white p-4 rounded-xl font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 transition-all shadow-inner" />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                             <label className="text-[9px] font-black uppercase text-gray-400 block mb-3">Substrato</label>
                             <select value={config.material} onChange={e => setConfig({...config, material: e.target.value})} className="w-full bg-white p-3 rounded-xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600">
                                {MATERIALS.map(m => <option key={m}>{m}</option>)}
                             </select>
                          </div>
                          <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                             <label className="text-[9px] font-black uppercase text-gray-400 block mb-3">Acabamento</label>
                             <select value={config.finish} onChange={e => setConfig({...config, finish: e.target.value})} className="w-full bg-white p-3 rounded-xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600">
                                {FINISHES.map(f => <option key={f}>{f}</option>)}
                             </select>
                          </div>
                          <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                             <label className="text-[9px] font-black uppercase text-gray-400 block mb-3">Quantidade</label>
                             <input type="number" value={config.quantity} onChange={e => setConfig({...config, quantity: e.target.value})} className="w-full bg-white p-3 rounded-xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className={`bg-black text-white p-10 rounded-[4rem] shadow-xl relative overflow-hidden group border-2 transition-all ${config.fileName ? 'border-green-500/50' : (errors.file ? 'border-red-600' : 'border-white/5')}`}>
                          <div className="relative z-10 flex flex-col items-center text-center">
                             {config.fileName ? <FileCheck className="w-12 h-12 mb-4 text-green-500" /> : <Upload className="w-12 h-12 mb-4 text-red-600 animate-bounce" />}
                             <h4 className="text-2xl font-brand font-black italic uppercase mb-2">Arte-Final</h4>
                             <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-6">PDF, JPG ou PNG (Máx 50MB)</p>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.png,.tiff" />
                             <button onClick={() => fileInputRef.current?.click()} className={`w-full p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${config.fileName ? 'bg-green-600' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}>
                                {config.fileName ? config.fileName : 'Selecionar Arquivo'}
                             </button>
                             {errors.file && <span className="mt-3 text-[8px] font-black uppercase text-red-600 flex items-center"><FileWarning className="w-3 h-3 mr-2" /> {errors.file}</span>}
                          </div>
                       </div>

                       <div className="p-6 bg-gray-50 rounded-[3.5rem] border border-gray-100 space-y-4">
                          <div>
                             <label className="text-[9px] font-black uppercase text-gray-400 block mb-3 flex items-center"><Server className="w-3 h-3 mr-3" /> Nodo de Destino R2</label>
                             {selectedProduct.ownerHubId === 'SYSTEM' ? (
                               <select value={config.selectedHubId} onChange={e => setConfig({...config, selectedHubId: e.target.value})} className="w-full bg-white p-4 rounded-xl font-black uppercase text-[10px] border-2 border-transparent focus:border-red-600">
                                  <option value="">Nodo Sugerido...</option>
                                  {hubs.map(h => <option key={h.id} value={h.id}>{h.name} ({h.location})</option>)}
                               </select>
                             ) : (
                               <div className="bg-white p-4 rounded-xl border-2 border-red-50 flex items-center space-x-3">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-[10px] font-black uppercase text-black">{hubs.find(h => h.id === selectedProduct.ownerHubId)?.name || 'Central R2'}</span>
                                </div>
                             )}
                          </div>
                          
                          <div className="relative">
                             <label className="text-[9px] font-black uppercase text-gray-400 block mb-3 flex items-center"><MessageCircle className="w-3 h-3 mr-3" /> Notas</label>
                             <textarea 
                               placeholder="Observações críticas..." 
                               value={config.observations} 
                               onChange={e => setConfig({...config, observations: e.target.value})}
                               className="w-full h-24 bg-white p-4 rounded-xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex space-x-4">
                    <button onClick={() => setStep(1)} className="p-8 bg-gray-50 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"><ArrowLeft className="w-6 h-6"/></button>
                    <button 
                      onClick={handleOrderSubmit} 
                      disabled={!isConfigValid}
                      className={`flex-grow p-8 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[14px] transition-all shadow-2xl flex items-center justify-center group ${isConfigValid ? 'bg-black text-white hover:bg-red-600' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    >
                       <span>{user ? 'Finalizar Encomenda' : 'Prosseguir Identificação'}</span> <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-4 transition-transform" />
                    </button>
                 </div>
              </div>
           )}

           {step === 3 && !user && (
             <div className="animate-in fade-in slide-in-from-right-10 space-y-12 py-8">
                <div className="text-center space-y-3">
                  <h3 className="text-5xl font-brand font-black italic uppercase leading-none">Fase 03: <span className="text-red-600">Handshake.</span></h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Acesso Guest. Identifique-se para o handshake industrial.</p>
                </div>

                <div className="max-w-xl mx-auto space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input 
                        type="text" 
                        placeholder="NOME COMPLETO" 
                        value={guestInfo.name}
                        onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                        className="w-full bg-gray-50 p-6 rounded-[2rem] font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner"
                      />
                      <input 
                        type="email" 
                        placeholder="EMAIL CONTACTO" 
                        value={guestInfo.email}
                        onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                        className="w-full bg-gray-50 p-6 rounded-[2rem] font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner"
                      />
                   </div>
                   <input 
                      type="tel" 
                      placeholder="TELEMÓVEL / WHATSAPP" 
                      value={guestInfo.phone}
                      onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})}
                      className="w-full bg-gray-50 p-6 rounded-[2rem] font-black uppercase text-[11px] outline-none border-2 border-transparent focus:border-red-600 shadow-inner"
                   />
                </div>

                <div className="flex space-x-4">
                    <button onClick={() => setStep(2)} className="p-8 bg-gray-50 rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"><ArrowLeft className="w-6 h-6"/></button>
                    <button 
                      onClick={handleOrderSubmit} 
                      disabled={!isGuestValid}
                      className={`flex-grow p-8 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[14px] transition-all shadow-2xl flex items-center justify-center group ${isGuestValid ? 'bg-red-600 text-white hover:bg-black' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    >
                       <span>Injetar no Grid R2</span> <Zap className="ml-4 w-6 h-6" />
                    </button>
                 </div>
             </div>
           )}

           {step === 4 && (
             <div className="h-full flex flex-col items-center justify-center text-center py-24 animate-in zoom-in-95">
                <div className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center mb-12 shadow-[0_0_100px_rgba(34,197,94,0.3)] status-pulse">
                   <CheckCircle2 className="w-24 h-24 text-white" />
                </div>
                <h3 className="text-7xl font-brand font-black italic uppercase tracking-tighter mb-6">Protocolo <br/><span className="text-red-600">Concluído.</span></h3>
                <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12 max-w-xl">O seu ativo visual foi sincronizado no Grid Industrial REDLINE R2.</p>
                <button onClick={() => {setStep(1); setSelectedProduct(null);}} className="bg-black text-white px-16 py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-red-600 transition-all shadow-2xl">Novo Pedido</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
