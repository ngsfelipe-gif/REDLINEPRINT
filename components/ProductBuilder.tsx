
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { INITIAL_PRODUCTS as PRODUCTS, MATERIALS, FINISHES, MOCK_NODES } from '../constants';
// Add missing X icon import
import { 
  ArrowRight, ArrowLeft, CheckCircle2, Maximize, Layers, Box, Zap, Scale, ChevronRight, Scan, Leaf, Droplets, Settings, Upload, Cpu, Smartphone, Sun, FileCheck, Download, Loader2, Send, Tag, Filter, ChevronLeft, Globe, X
} from 'lucide-react';
import { generateTechnicalNote } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { ProductionJob, User, Category, ExtendedProduct, PartnerNode } from '../types';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob) => void;
  user: User | null;
}

const ITEMS_PER_PAGE = 9;

const ProductBuilder: React.FC<ProductBuilderProps> = ({ onAddOrder, user }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct>(PRODUCTS[0]);
  const [selectedNode, setSelectedNode] = useState<PartnerNode>(MOCK_NODES[0]);
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

  const canPlaceOrders = !user || user.permissions.includes('PLACE_ORDERS');
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

  const generateAndDownloadPDF = () => {
    const doc = new jsPDF();
    const price = calculatePrice();
    const orderID = `RL-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Header
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('REDLINE PRINT INDUSTRIAL', 20, 25);
    doc.setFontSize(10);
    doc.text(`BLUEPRINT TÉCNICO // REF: ${orderID}`, 20, 32);

    // Body
    doc.setTextColor(10, 10, 10);
    doc.setFontSize(14);
    doc.text('ESPECIFICAÇÕES DE PRODUÇÃO', 20, 55);
    
    doc.setFontSize(10);
    let y = 65;
    const addLine = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, y);
      y += 8;
    };

    addLine('Produto', selectedProduct.name);
    addLine('Material', options.material);
    addLine('Acabamento', options.finish);
    addLine('Geometria', `${dimensions.width}m x ${dimensions.height}m`);
    addLine('Volume', `${options.quantity} unidades`);
    addLine('Node de Fabrico', selectedNode.name);
    addLine('Prioridade', options.priority);
    addLine('Total Estimado', `EUR ${price}`);

    // Technical Note
    doc.setFillColor(245, 245, 247);
    doc.rect(15, y + 10, 180, 40, 'F');
    doc.setTextColor(204, 0, 0);
    doc.text('NOTA TÉCNICA GEMINI R2:', 20, y + 20);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    const splitNote = doc.splitTextToSize(technicalNote, 170);
    doc.text(splitNote, 20, y + 28);

    // Footer
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.text('Este blueprint é um documento oficial do ecossistema Redline Print R2. Validade: 48h.', 20, 285);

    doc.save(`REDLINE_${orderID}.pdf`);
  };

  const handleFinalSubmit = () => {
    if (!canPlaceOrders) return;
    setIsSubmitting(true);
    
    // Simular injeção no pipeline
    setTimeout(() => {
      // Fix: Added missing clientId property
      const newOrder: ProductionJob = {
        id: `RL-${Math.floor(Math.random() * 9000) + 1000}`,
        client: user?.name || 'GUEST-NODE',
        clientId: user?.id || 'guest-01',
        product: selectedProduct.name,
        status: 'Orçamento Gerado',
        priority: options.priority !== 'Standard (48-72h)',
        deadline: options.priority,
        timestamp: Date.now(),
        value: calculatePrice(),
        progress: 10,
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
    <div className="max-w-[1500px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40 lg:pt-48">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Step Indicator & Status */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border-b-[8px] border-red-600">
              <span className="text-[8px] font-black uppercase text-red-600 block mb-3 tracking-[0.3em]">Investimento Estimado</span>
              <div className="flex items-end space-x-1">
                <h2 className="text-4xl font-brand font-black italic tracking-tighter leading-none">€{calculatePrice()}</h2>
              </div>
           </div>

           <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
              <h4 className="font-brand text-[9px] font-black italic uppercase tracking-[0.3em] mb-6 flex items-center text-red-600">
                 <Settings className="w-4 h-4 mr-3" /> Fase do Protocolo
              </h4>
              <div className="space-y-2">
                {[
                  { s: 1, l: 'Substrato' },
                  { s: 2, l: 'Geometria' },
                  { s: 3, l: 'Produção' },
                  { s: 4, l: 'Sincronização' }
                ].map((item) => (
                  <div key={item.s} className={`flex items-center justify-between p-3 rounded-xl transition-all ${step === item.s ? 'bg-black text-white' : 'text-gray-300 opacity-50'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest">{item.l}</span>
                    {step > item.s ? <CheckCircle2 className="w-3 h-3 text-red-600" /> : <ChevronRight className="w-3 h-3 opacity-20" />}
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Central Workspace */}
        <div className="lg:col-span-9 bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 min-h-[800px] flex flex-col relative overflow-hidden">
           
           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-grow">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                   <div>
                      <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center"><Layers className="w-4 h-4 mr-3" /> Protocol 01 // Asset Selection</h4>
                      <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Matriz de <br /><span className="text-red-600">Produtos Industriais.</span></h3>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 overflow-x-auto max-w-full">
                      {categories.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => { setActiveCategory(cat as any); setCurrentPage(1); }}
                          className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black hover:bg-gray-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {paginatedProducts.map(p => (
                     <button 
                       key={p.id} 
                       onClick={() => setSelectedProduct(p)}
                       className={`group relative rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col text-left overflow-hidden h-full ${selectedProduct.id === p.id ? 'border-red-600 bg-red-50/5 shadow-2xl scale-[1.02]' : 'border-gray-50 hover:border-gray-200 hover:shadow-xl'}`}
                     >
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                           <img src={p.image} className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" alt={p.name} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-8">
                           <span className="text-[7px] font-black uppercase text-red-600 tracking-widest mb-2 block">{p.category}</span>
                           <h5 className="text-lg font-brand font-black italic uppercase tracking-tighter mb-4">{p.name}</h5>
                           <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                              <span className="text-sm font-brand font-black italic">€{p.basePrice}<span className="text-[7px] text-gray-400">/{p.unit}</span></span>
                              <ChevronRight className={`w-4 h-4 transition-all ${selectedProduct.id === p.id ? 'text-red-600 translate-x-1' : 'text-gray-200'}`} />
                           </div>
                        </div>
                     </button>
                   ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-6">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all disabled:opacity-20"><ChevronLeft className="w-5 h-5"/></button>
                    <div className="flex space-x-2">
                       {[...Array(totalPages)].map((_, i) => (
                         <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[9px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}> {i + 1} </button>
                       ))}
                    </div>
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all disabled:opacity-20"><ChevronRight className="w-5 h-5"/></button>
                  </div>
                )}
             </div>
           )}

           {step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-grow">
                <div className="mb-12">
                   <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center"><Maximize className="w-4 h-4 mr-3" /> Protocol 02 // Engineering</h4>
                   <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Job <br /><span className="text-red-600">Geometry.</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 space-y-8">
                      <div>
                         <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-6">Dimensões (Metros)</label>
                         <div className="grid grid-cols-2 gap-6">
                            <input type="number" step="0.1" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-5 rounded-2xl text-2xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-inner" />
                            <input type="number" step="0.1" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-5 rounded-2xl text-2xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-inner" />
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-2">Volume Industrial</label>
                         <input type="number" value={options.quantity} onChange={(e) => setOptions({...options, quantity: e.target.value})} className="w-full bg-black text-white p-6 rounded-2xl text-4xl font-brand font-black italic text-center outline-none border-2 border-red-600" />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">Material Específico</label>
                         <select value={options.material} onChange={(e) => setOptions({...options, material: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm">
                            {MATERIALS.map(m => <option key={m}>{m}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">Acabamento</label>
                         <select value={options.finish} onChange={(e) => setOptions({...options, finish: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm">
                            {FINISHES.map(f => <option key={f}>{f}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">Prioridade Logística</label>
                         <select value={options.priority} onChange={(e) => setOptions({...options, priority: e.target.value})} className="w-full bg-black text-white p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border-2 border-red-600 shadow-xl">
                            <option>Standard (48-72h)</option>
                            <option>Express (24h)</option>
                            <option>Atomic (Same Day)</option>
                         </select>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-grow">
                <div className="mb-12">
                   <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center"><Globe className="w-4 h-4 mr-3" /> Protocol 03 // Logistical Node</h4>
                   <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Unidade de <br /><span className="text-red-600">Produção Local.</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                   {MOCK_NODES.map(node => (
                     <button 
                      key={node.id} 
                      onClick={() => setSelectedNode(node)}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between h-full ${selectedNode.id === node.id ? 'border-red-600 bg-red-50/5 shadow-xl' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                     >
                        <div>
                           <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block mb-4">{node.id}</span>
                           <h5 className="text-lg font-brand font-black italic uppercase leading-tight mb-2">{node.name}</h5>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{node.location}</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                           <span className={`text-[8px] font-black uppercase ${node.status === 'Online' ? 'text-green-600' : 'text-orange-500'}`}>{node.status}</span>
                           <span className="text-[9px] font-black text-black">{node.latency}</span>
                        </div>
                     </button>
                   ))}
                </div>

                <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                   <Upload className="w-10 h-10 text-red-600 mb-6" />
                   <h4 className="text-xl font-brand font-black italic uppercase mb-2">Upload Master Asset</h4>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8">PDF-X4 // CMYK FOGRA39 // MAX 2GB</p>
                   {!file ? (
                     <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all">Selecionar Ficheiro</button>
                   ) : (
                     <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-red-600 shadow-lg">
                        <FileCheck className="w-5 h-5 text-red-600" />
                        <span className="text-[10px] font-black uppercase truncate max-w-[200px]">{file.name}</span>
                        <button onClick={() => setFile(null)} className="text-gray-300 hover:text-red-600"><X className="w-4 h-4" /></button>
                     </div>
                   )}
                   <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ? {name: e.target.files[0].name, size: '2MB'} : null)} />
                </div>
             </div>
           )}

           {step === 4 && (
              <div className="animate-in slide-in-from-bottom-10 duration-700 flex flex-col items-center justify-center text-center space-y-12 flex-grow">
                 {!protocolReady ? (
                    <div className="space-y-10 max-w-2xl">
                       <div className="relative mx-auto w-32 h-32">
                          <div className="w-32 h-32 border-[8px] border-gray-50 rounded-full flex items-center justify-center shadow-inner"><Zap className="w-14 h-14 text-red-600 animate-pulse" /></div>
                          <div className="absolute inset-0 w-32 h-32 border-t-[8px] border-red-600 rounded-full animate-spin" />
                       </div>
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none text-black">Compilar <br /><span className="text-red-600">Blueprint R2.</span></h3>
                       <button onClick={handleSyncProtocol} disabled={isSyncing} className="bg-black text-white px-16 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.5em] hover:bg-red-600 transition-all shadow-2xl scale-110 flex items-center space-x-4">
                          {isSyncing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                          <span>Gerar Protocolo Automático</span>
                       </button>
                    </div>
                 ) : (
                    <div className="bg-gray-50 p-12 rounded-[4rem] border-4 border-white w-full max-w-5xl shadow-2xl text-left animate-in zoom-in-95">
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-12 text-black">Protocolo <br /><span className="text-red-600">Sincronizado.</span></h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="bg-black text-white p-10 rounded-[2.5rem] flex flex-col justify-between shadow-2xl border-b-[12px] border-red-600">
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 mb-4">Investimento Final</span>
                             <span className="text-5xl font-brand font-black italic leading-none">€{calculatePrice()}</span>
                          </div>
                          <div className="bg-white border-2 border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Relatório Técnico Gemini R2</span>
                             <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed italic line-clamp-4">{technicalNote}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <button onClick={generateAndDownloadPDF} className="flex items-center justify-center space-x-4 bg-white border-2 border-gray-100 p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-red-600 transition-all shadow-sm group">
                             <Download className="w-6 h-6 text-red-600 group-hover:-translate-y-2 transition-transform" /> <span>Download Blueprint PDF</span>
                          </button>
                          <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex items-center justify-center space-x-4 bg-red-600 text-white p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-2xl group">
                             {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />} 
                             <span>Iniciar Produção Atômica</span>
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {!submitted && (
              <div className="mt-auto pt-10 flex justify-between items-center border-t border-gray-100">
                 <button 
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:text-red-600 group ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                 >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> <span>Voltar</span>
                 </button>
                 
                 {step < 4 && (
                    <button 
                      onClick={() => setStep(step + 1)}
                      disabled={step === 3 && !file}
                      className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:scale-105 transition-all shadow-2xl group flex items-center disabled:opacity-20"
                    >
                       <span>Avançar Protocolo</span>
                       <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                 )}
              </div>
           )}

           {submitted && (
              <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center text-center p-16 animate-in fade-in duration-1000">
                 <div className="w-48 h-48 bg-green-500 rounded-[3rem] flex items-center justify-center shadow-2xl mb-12 animate-bounce">
                    <CheckCircle2 className="w-24 h-24 text-white" />
                 </div>
                 <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6 text-black">Injeção <br /> <span className="text-red-600">Concluída.</span></h3>
                 <p className="text-lg text-gray-400 font-medium max-w-md mx-auto mb-12">A sua encomenda foi injetada no Node {selectedNode.name}. Acompanhe em tempo real na sua conta.</p>
                 <button onClick={() => window.location.reload()} className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-2xl">Novo Projeto</button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
