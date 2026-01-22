
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { INITIAL_PRODUCTS as PRODUCTS, MATERIALS, FINISHES, MOCK_NODES } from '../constants';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, Maximize, Layers, Box, Zap, Scale, ChevronRight, Scan, Leaf, Droplets, Settings, Upload, Cpu, Smartphone, Sun, FileCheck, Download, Loader2, Send, Tag, Filter, ChevronLeft, Globe, X, ShieldAlert
} from 'lucide-react';
import { generateTechnicalNote } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { ProductionJob, User, Category, ExtendedProduct, PartnerNode } from '../types';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob) => void;
  user: User | null;
  hubs: PartnerNode[];
}

const ITEMS_PER_PAGE = 9;

const ProductBuilder: React.FC<ProductBuilderProps> = ({ onAddOrder, user, hubs }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct>(PRODUCTS[0]);
  const [selectedNode, setSelectedNode] = useState<PartnerNode>(hubs[0] || MOCK_NODES[0]);
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 1.0, height: 1.0 });
  const [options, setOptions] = useState<Record<string, any>>({
    material: MATERIALS[0],
    finish: FINISHES[0],
    quantity: '10',
    priority: 'Standard (48-72h)',
    vdp: false,
    ecoFriendly: true
  });
  const [file, setFile] = useState<{name: string, size: string} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocolReady, setProtocolReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [technicalNote, setTechnicalNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPlaceOrders = !!user;
  const categories: ('Todos' | Category)[] = ['Todos', ...Object.values(Category)];
  
  const filteredProducts = useMemo(() => {
    return activeCategory === 'Todos' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const calculatePrice = () => {
    const qty = parseFloat(options.quantity) || 1;
    let factor = 1.0;
    if (selectedProduct.unit === 'm2') factor = dimensions.width * dimensions.height;
    const priorityMultiplier = options.priority.includes('Atomic') ? 1.5 : (options.priority.includes('Express') ? 1.2 : 1.0);
    const vdpPremium = options.vdp ? 1.15 : 1.0;
    const ecoPremium = options.ecoFriendly ? 1.05 : 1.0;
    return (selectedProduct.basePrice * factor * qty * priorityMultiplier * vdpPremium * ecoPremium).toFixed(2);
  };

  const handleSyncProtocol = async () => {
    setIsSyncing(true);
    setProtocolReady(false);
    try {
      const note = await generateTechnicalNote(selectedProduct, {
        ...options,
        dimensions: `${dimensions.width}x${dimensions.height}m`,
        price: calculatePrice()
      });
      setTechnicalNote(note);
      setProtocolReady(true);
    } catch (e) {
      setTechnicalNote("Aviso: Falha na telemetria remota. Protocolo de segurança R2 aplicado via node local.");
      setProtocolReady(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!canPlaceOrders) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newOrder: ProductionJob = {
        id: `RL-${Math.floor(Math.random() * 9000) + 1000}`,
        client: user?.name || 'Cliente GUEST',
        clientId: user?.id || 'guest-01',
        product: selectedProduct.name,
        status: 'Pendente Aprovação Hub',
        priority: options.priority !== 'Standard (48-72h)',
        deadline: options.priority,
        timestamp: Date.now(),
        value: calculatePrice(),
        progress: 5,
        material: options.material,
        finish: options.finish,
        quantity: options.quantity,
        dimensions: `${dimensions.width}x${dimensions.height}m`,
        nodeId: selectedNode.id
      };
      
      onAddOrder(newOrder);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 industrial-grid min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* INDICADOR DE FASE E COTAÇÃO */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border-b-[10px] border-red-600 animate-in fade-in">
              <span className="text-[10px] font-black uppercase text-red-600 block mb-4 tracking-[0.4em]">Investimento Estimado</span>
              <div className="flex items-end space-x-2">
                <h2 className="text-6xl font-brand font-black italic tracking-tighter leading-none">€{calculatePrice()}</h2>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                 <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500">
                    <span>Node Selecionado</span>
                    <span className="text-white">{selectedNode.id}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm">
              <h4 className="font-brand text-[10px] font-black italic uppercase tracking-[0.4em] mb-8 flex items-center text-red-600">
                 <Settings className="w-5 h-5 mr-4" /> Protocolo Industrial
              </h4>
              <div className="space-y-4">
                {[
                  { s: 1, l: 'Substrato' },
                  { s: 2, l: 'Engenharia' },
                  { s: 3, l: 'Logística' },
                  { s: 4, l: 'Sincronização' }
                ].map((item) => (
                  <div key={item.s} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${step === item.s ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-300 opacity-50'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.l}</span>
                    {step > item.s ? <CheckCircle2 className="w-4 h-4 text-red-600" /> : <ChevronRight className="w-4 h-4 opacity-20" />}
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* WORKSPACE CENTRAL */}
        <div className="lg:col-span-9 bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-10 lg:p-16 min-h-[850px] flex flex-col relative overflow-hidden">
           
           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-10 duration-500 flex-grow">
                <div className="mb-16 flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                   <div>
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-4 flex items-center"><Layers className="w-5 h-5 mr-4" /> Protocol 01 // Asset Selection</h4>
                      <h3 className="text-5xl md:text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Células de <br /><span className="text-red-600">Produção.</span></h3>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 overflow-x-auto max-w-full shadow-inner">
                      {categories.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => { setActiveCategory(cat as any); setCurrentPage(1); }}
                          className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black hover:bg-gray-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   {paginatedProducts.map(p => (
                     <button 
                       key={p.id} 
                       onClick={() => setSelectedProduct(p)}
                       className={`group relative rounded-[3.5rem] border-2 transition-all duration-700 flex flex-col text-left overflow-hidden h-full ${selectedProduct.id === p.id ? 'border-red-600 bg-red-50/10 shadow-2xl scale-[1.02]' : 'border-gray-50 hover:border-gray-200'}`}
                     >
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                           <img src={p.image} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={p.name} />
                        </div>
                        <div className="p-10">
                           <span className="text-[8px] font-black uppercase text-red-600 tracking-widest mb-3 block">{p.category}</span>
                           <h5 className="text-2xl font-brand font-black italic uppercase tracking-tighter mb-6 leading-none">{p.name}</h5>
                           <div className="flex justify-between items-center border-t border-gray-50 pt-6">
                              <span className="text-xl font-brand font-black italic">€{p.basePrice}<span className="text-[9px] text-gray-400 font-normal ml-1">/{p.unit}</span></span>
                              <ChevronRight className={`w-6 h-6 transition-all ${selectedProduct.id === p.id ? 'text-red-600 translate-x-2' : 'text-gray-200'}`} />
                           </div>
                        </div>
                     </button>
                   ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center space-x-4">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all disabled:opacity-20"><ChevronLeft className="w-6 h-6"/></button>
                    <div className="flex space-x-2">
                       {[...Array(totalPages)].map((_, i) => (
                         <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}> {i + 1} </button>
                       ))}
                    </div>
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all disabled:opacity-20"><ChevronRight className="w-6 h-6"/></button>
                  </div>
                )}
             </div>
           )}

           {step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-10 duration-500 flex-grow">
                <div className="mb-16">
                   <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-4 flex items-center"><Maximize className="w-5 h-5 mr-4" /> Protocol 02 // Engineering</h4>
                   <h3 className="text-5xl md:text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Módulo de <br /><span className="text-red-600">Geometria.</span></h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                   <div className="bg-gray-50 p-12 rounded-[4rem] border border-gray-100 space-y-12 shadow-inner">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 block mb-8">Dimensões Master (Metros)</label>
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <span className="text-[8px] font-black uppercase text-gray-300 ml-4">Largura</span>
                               <input type="number" step="0.1" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-6 rounded-3xl text-3xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-xl" />
                            </div>
                            <div className="space-y-3">
                               <span className="text-[8px] font-black uppercase text-gray-300 ml-4">Altura</span>
                               <input type="number" step="0.1" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-6 rounded-3xl text-3xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-xl" />
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 block mb-4">Volume de Produção</label>
                         <input type="number" value={options.quantity} onChange={(e) => setOptions({...options, quantity: e.target.value})} className="w-full bg-black text-white p-8 rounded-[2rem] text-6xl font-brand font-black italic text-center outline-none border-b-[15px] border-red-600 shadow-2xl" />
                      </div>
                   </div>

                   <div className="space-y-8 flex flex-col justify-center">
                      <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-6">Substrato Técnico</label>
                         <select value={options.material} onChange={(e) => setOptions({...options, material: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm">
                            {MATERIALS.map(m => <option key={m}>{m}</option>)}
                         </select>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-6">Acabamento Industrial</label>
                         <select value={options.finish} onChange={(e) => setOptions({...options, finish: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm">
                            {FINISHES.map(f => <option key={f}>{f}</option>)}
                         </select>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="animate-in fade-in slide-in-from-right-10 duration-500 flex-grow">
                <div className="mb-16">
                   <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-4 flex items-center"><Globe className="w-5 h-5 mr-4" /> Protocol 03 // Logistical Node</h4>
                   <h3 className="text-5xl md:text-7xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Nodo de <br /><span className="text-red-600">Fabrico.</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mb-16">
                   {hubs.filter(h => h.status === 'Online').map(node => (
                     <button 
                      key={node.id} 
                      onClick={() => setSelectedNode(node)}
                      className={`p-10 rounded-[3.5rem] border-2 transition-all text-left flex flex-col justify-between h-full ${selectedNode.id === node.id ? 'border-red-600 bg-red-50/10 shadow-2xl scale-105' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                     >
                        <div>
                           <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.4em] block mb-6">{node.id}</span>
                           <h5 className="text-2xl font-brand font-black italic uppercase leading-tight mb-2">{node.name}</h5>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{node.location}</p>
                        </div>
                        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase text-green-600 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> {node.status}</span>
                           <span className="text-[10px] font-brand font-black italic text-black">{node.latency} R2</span>
                        </div>
                     </button>
                   ))}
                </div>

                <div className="bg-gray-50 p-16 rounded-[4rem] border border-gray-100 flex flex-col items-center justify-center text-center shadow-inner">
                   <Upload className="w-16 h-16 text-red-600 mb-8 animate-bounce" />
                   <h4 className="text-3xl font-brand font-black italic uppercase mb-4 text-black">Upload Master Asset</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12">PDF-X4 // CMYK FOGRA39 // MAX 2GB</p>
                   {!file ? (
                     <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl">Selecionar Ficheiro Gráfico</button>
                   ) : (
                     <div className="flex items-center space-x-6 bg-white p-6 rounded-3xl border-2 border-red-600 shadow-2xl animate-in zoom-in">
                        <FileCheck className="w-8 h-8 text-red-600" />
                        <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[250px]">{file.name}</span>
                        <button onClick={() => setFile(null)} className="text-gray-300 hover:text-red-600 transition-all"><X className="w-6 h-6" /></button>
                     </div>
                   )}
                   <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ? {name: e.target.files[0].name, size: '2MB'} : null)} />
                </div>
             </div>
           )}

           {step === 4 && (
              <div className="animate-in slide-in-from-bottom-10 duration-700 flex flex-col items-center justify-center text-center space-y-16 flex-grow">
                 {!protocolReady ? (
                    <div className="space-y-12 max-w-3xl">
                       <div className="relative mx-auto w-40 h-40">
                          <div className="w-40 h-40 border-[12px] border-gray-50 rounded-full flex items-center justify-center shadow-inner"><Zap className="w-16 h-16 text-red-600 animate-pulse" /></div>
                          <div className="absolute inset-0 w-40 h-40 border-t-[12px] border-red-600 rounded-full animate-spin" />
                       </div>
                       <h3 className="text-6xl md:text-8xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Validar <br /><span className="text-red-600">Célula R2.</span></h3>
                       <button onClick={handleSyncProtocol} disabled={isSyncing} className="bg-black text-white px-20 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.6em] hover:bg-red-600 transition-all shadow-2xl scale-110 flex items-center space-x-6">
                          {isSyncing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Zap className="w-8 h-8" />}
                          <span>Gerar Protocolo de Produção</span>
                       </button>
                    </div>
                 ) : (
                    <div className="bg-gray-50 p-16 rounded-[5rem] border-[6px] border-white w-full max-w-6xl shadow-2xl text-left animate-in zoom-in-95">
                       <h3 className="text-6xl md:text-8xl font-brand font-black italic uppercase tracking-tighter leading-none mb-16 text-black">Protocolo <br /><span className="text-red-600">Validado.</span></h3>
                       
                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-16">
                          <div className="bg-black text-white p-12 rounded-[3.5rem] flex flex-col justify-between shadow-2xl border-b-[20px] border-red-600">
                             <span className="text-[11px] font-black uppercase tracking-[0.6em] text-red-600 mb-6">Investimento Atómico</span>
                             <span className="text-7xl font-brand font-black italic leading-none">€{calculatePrice()}</span>
                          </div>
                          <div className="bg-white border-4 border-gray-50 p-12 rounded-[3.5rem] shadow-sm">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] block mb-6">Relatório de Engenharia Gemini</span>
                             <p className="text-[13px] font-bold text-gray-500 uppercase leading-relaxed italic line-clamp-5">{technicalNote}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <button onClick={handleFinalSubmit} disabled={isSubmitting || !canPlaceOrders} className="flex items-center justify-center space-x-6 bg-red-600 text-white p-8 rounded-3xl font-black uppercase text-[12px] tracking-[0.4em] hover:bg-black transition-all shadow-2xl group disabled:opacity-50">
                             {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />} 
                             <span>Injetar no Hub Industrial</span>
                          </button>
                          {!canPlaceOrders && (
                            <div className="bg-black text-white p-8 rounded-3xl flex items-center justify-center space-x-4 border border-white/10 opacity-60">
                               <ShieldAlert className="w-8 h-8 text-red-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Login Requerido para Injeção</span>
                            </div>
                          )}
                       </div>
                    </div>
                 )}
              </div>
           )}

           {!submitted && (
              <div className="mt-auto pt-16 flex justify-between items-center border-t border-gray-50">
                 <button 
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className={`flex items-center space-x-4 text-[11px] font-black uppercase tracking-[0.5em] transition-all hover:text-red-600 group ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                 >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> <span>Protocolo Anterior</span>
                 </button>
                 
                 {step < 4 && (
                    <button 
                      onClick={() => setStep(step + 1)}
                      disabled={(step === 3 && !file) || (step === 1 && !selectedProduct)}
                      className="bg-black text-white px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-red-600 hover:scale-105 transition-all shadow-2xl group flex items-center disabled:opacity-10"
                    >
                       <span>Próxima Fase</span>
                       <ArrowRight className="ml-6 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                 )}
              </div>
           )}

           {submitted && (
              <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center text-center p-20 animate-in fade-in duration-1000">
                 <div className="w-56 h-56 bg-green-500 rounded-[4rem] flex items-center justify-center shadow-2xl mb-16 animate-bounce">
                    <CheckCircle2 className="w-28 h-28 text-white" />
                 </div>
                 <h3 className="text-6xl md:text-8xl font-brand font-black italic uppercase tracking-tighter leading-none mb-8 text-black">Injeção <br /> <span className="text-red-600">Efetuada.</span></h3>
                 <p className="text-2xl text-gray-400 font-medium max-w-xl mx-auto mb-16">O projeto foi enviado ao Node {selectedNode.name} e aguarda aprovação imediata do operador local.</p>
                 <button onClick={() => window.location.reload()} className="bg-black text-white px-16 py-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.5em] hover:bg-red-600 transition-all shadow-2xl">Reiniciar Terminal</button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
