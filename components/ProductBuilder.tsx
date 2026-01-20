
import React, { useState, useRef, useEffect } from 'react';
import { PRODUCTS, MATERIALS, FINISHES, ExtendedProduct } from '../constants';
import { 
  Check, Upload, ArrowRight, ArrowLeft, Loader2, FileText, Download, Send, 
  ShieldCheck, CheckCircle2, Maximize, Target, Activity, FileCheck, Cpu, 
  Settings, Thermometer, Layers, Box, Info, Zap, Zap as Flash, Scale, Clock, Shield, ChevronRight,
  Monitor, Info as InfoIcon, Hash, ShieldAlert, Leaf, Droplets, HardDrive, Smartphone,
  Globe, Sun, Footprints, Compass, Wind, Scan
} from 'lucide-react';
import { generateTechnicalNote } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { ProductionJob, User, Category } from '../types';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob) => void;
  user: User | null;
}

const ProductBuilder: React.FC<ProductBuilderProps> = ({ onAddOrder, user }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct>(PRODUCTS[0]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [technicalNote, setTechnicalNote] = useState('');
  const [isScanningFile, setIsScanningFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPlaceOrders = !user || user.permissions.includes('PLACE_ORDERS');
  const categories = ['All', ...Object.values(Category)];
  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const calculatePrice = () => {
    const qty = parseFloat(options.quantity) || 1;
    let factor = 1.0;
    if (selectedProduct.unit === 'm2') {
      factor = dimensions.width * dimensions.height;
    }
    const priorityMultiplier = options.priority.includes('Atomic') ? 1.5 : (options.priority.includes('Express') ? 1.2 : 1.0);
    const vdpPremium = options.vdp ? 1.15 : 1.0;
    const ecoPremium = options.ecoFriendly ? 1.05 : 1.0;
    return (selectedProduct.basePrice * factor * qty * priorityMultiplier * vdpPremium * ecoPremium).toFixed(2);
  };

  const calculateCarbon = () => {
    const qty = parseFloat(options.quantity) || 1;
    const base = qty * 0.15;
    return options.ecoFriendly ? (base * 0.4).toFixed(2) : base.toFixed(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setIsScanningFile(true);
      setTimeout(() => {
        setFile({ name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + ' MB' });
        setIsScanningFile(false);
      }, 1800);
    }
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    const note = await generateTechnicalNote(selectedProduct, options);
    setTechnicalNote(note);
    setIsGeneratingPdf(false);
    setPdfReady(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text(`REDLINE BLUEPRINT: ${selectedProduct.name}`, 10, 10);
    doc.text(`VDP Active: ${options.vdp ? 'SIM' : 'NÃO'}`, 10, 20);
    doc.text(`Pegada Carbono: ${calculateCarbon()}kg CO2e`, 10, 30);
    doc.save(`REDLINE_BLUEPRINT_${Date.now()}.pdf`);
  };

  const handleSubmit = () => {
    if (!canPlaceOrders) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAddOrder({
        id: `RL-${Math.floor(Math.random() * 9000) + 1000}`,
        client: user?.name || 'GUEST-NODE',
        product: selectedProduct.name,
        status: 'Pre-flight',
        priority: options.priority !== 'Standard (48-72h)',
        deadline: options.priority,
        timestamp: Date.now(),
        value: calculatePrice(),
        progress: 10
      });
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2500);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-24 industrial-grid min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 space-y-6 animate-in slide-in-from-left-4 duration-500">
           <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-b-[10px] border-red-600">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 block mb-6">Investimento Estimado</span>
              <div className="flex items-end space-x-1">
                <h2 className="text-5xl md:text-6xl font-brand font-black italic tracking-tighter leading-none">{calculatePrice()}</h2>
                <span className="text-2xl font-brand font-black italic mb-1 text-red-600">€</span>
              </div>
              <div className="h-1 w-full bg-white/10 mt-8 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 shimmer w-[70%]" />
              </div>
              <p className="text-[8px] font-bold text-gray-500 mt-4 uppercase tracking-widest">Base: Otimização Hub Frankfurt</p>
           </div>

           <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-100 shadow-lg relative overflow-hidden">
              <Leaf className="absolute top-[-10px] right-[-10px] w-24 h-24 text-green-600 opacity-5" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-4">Matriz de Sustentabilidade</h4>
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-md">
                    <Droplets className="w-7 h-7" />
                 </div>
                 <div>
                    <span className="text-3xl font-brand font-black italic text-green-800 leading-none block">{calculateCarbon()} kg</span>
                    <span className="text-[8px] font-black uppercase text-green-600 opacity-60">CO2 Equivalente</span>
                 </div>
              </div>
              <div className="h-2 w-full bg-green-200 rounded-full overflow-hidden">
                 <div className="h-full bg-green-600 w-[72%] shimmer" />
              </div>
           </div>

           <div className="glass p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
              <h4 className="font-brand text-sm font-black italic uppercase tracking-widest mb-8 flex items-center">
                 <Settings className="w-4 h-4 mr-3 text-red-600" /> Controlo de Pipeline
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Matriz de Suporte', step: 1 },
                  { label: 'Geometria do Node', step: 2 },
                  { label: 'Injeção de Assets', step: 3 },
                  { label: 'Sincronização', step: 4 }
                ].map((s) => (
                  <div key={s.step} className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${step === s.step ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 opacity-50'}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg font-brand font-black italic">0{s.step}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                    </div>
                    {step > s.step ? <CheckCircle2 className="w-5 h-5 text-red-600" /> : <ChevronRight className="w-4 h-4 opacity-20" />}
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-9 bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-8 md:p-14 min-h-[900px] flex flex-col relative overflow-hidden group">
           
           {/* Step 1: Catálogo Expandido */}
           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-grow">
                <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-10">
                   <div>
                      <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.6em] mb-3 flex items-center"><Layers className="w-5 h-5 mr-3" /> Fase 01 // Hub de Prensa Industrial</h4>
                      <h3 className="text-4xl md:text-7xl font-brand font-black italic uppercase tracking-tighter leading-none mb-3">Showroom de <span className="text-red-600">Suportes.</span></h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Navegue pelas unidades de produção: Pequena e Grande Tiragem.</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-2">
                      {['Todos', ...Object.values(Category)].map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveCategory(cat === 'Todos' ? 'All' : cat as any)}
                          className={`px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === (cat === 'Todos' ? 'All' : cat) ? 'bg-black text-white shadow-2xl' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {filteredProducts.map(p => (
                     <button 
                       key={p.id} 
                       onClick={() => setSelectedProduct(p)}
                       className={`group/card relative rounded-[4rem] border-2 transition-all duration-700 flex flex-col text-left overflow-hidden h-full ${selectedProduct.id === p.id ? 'border-red-600 bg-red-50/10 shadow-[0_50px_100px_rgba(204,0,0,0.15)] scale-[1.02]' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50/50 shadow-md'}`}
                     >
                        {/* Imagem de Grande Impacto */}
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 border-b border-gray-100">
                           <img src={p.image} className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover/card:scale-110" alt={p.name} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                           
                           {/* Sistema de Badges */}
                           {p.badge && (
                             <div className="absolute top-8 left-8 flex items-center bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-xl border border-white/10 shadow-2xl">
                                <Zap className={`w-3.5 h-3.5 mr-2 ${p.badge === 'ECO' ? 'text-green-500' : 'text-red-600'}`} />
                                <span className="text-[10px] font-black uppercase text-white tracking-[0.3em]">{p.badge} TECH</span>
                             </div>
                           )}

                           {/* Telemetria de Resistência */}
                           <div className="absolute top-8 right-8">
                              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative">
                                 <Sun className="w-6 h-6 text-white" />
                                 <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                    <circle cx="28" cy="28" r="24" fill="transparent" stroke="#CC0000" strokeWidth="3" strokeDasharray="150.8" strokeDashoffset={150.8 - (150.8 * (p.specs.weatherResistance || 0)) / 100} />
                                 </svg>
                              </div>
                           </div>

                           <div className="absolute bottom-8 left-8 right-8">
                              <span className="text-[9px] font-black uppercase text-red-600 tracking-[0.4em] block mb-2">{p.category}</span>
                              <h5 className="text-3xl md:text-4xl font-brand font-black italic uppercase tracking-tighter leading-none text-white transition-colors drop-shadow-lg">{p.name}</h5>
                           </div>

                           {selectedProduct.id === p.id && <div className="scanline-fast" />}
                        </div>

                        {/* Área de Conteúdo */}
                        <div className="p-10 flex flex-col flex-grow bg-white">
                           <div className="mb-8 flex-grow">
                              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-widest leading-relaxed line-clamp-3 italic">
                                 {p.description}
                              </p>
                           </div>

                           {/* Grelha de Specs Técnicas */}
                           <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                              <div className="flex flex-col space-y-3">
                                 <div className="flex items-center space-x-2 text-gray-300">
                                    <Layers className="w-5 h-5" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Substrato</span>
                                 </div>
                                 <span className="text-[11px] font-black uppercase text-black truncate">{p.specs.weight}</span>
                              </div>
                              <div className="flex flex-col space-y-3 border-x border-gray-100 px-6">
                                 <div className="flex items-center space-x-2 text-gray-300">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Vida Útil</span>
                                 </div>
                                 <span className="text-[11px] font-black uppercase text-black truncate">{p.specs.durability}</span>
                              </div>
                              <div className="flex flex-col space-y-3 pl-6">
                                 <div className="flex items-center space-x-2 text-gray-300">
                                    <Scan className="w-5 h-5" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Precisão</span>
                                 </div>
                                 <span className="text-[11px] font-black uppercase text-black truncate">{p.specs.precisionLevel || 'Standard'}</span>
                              </div>
                           </div>

                           <div className="mt-10 flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Hub: R2-LISBOA ATIVO</span>
                              </div>
                              <div className="flex items-baseline space-x-2">
                                 <span className="text-[9px] font-black text-gray-300 uppercase">Desde</span>
                                 <span className="text-3xl font-brand font-black italic text-black">€{p.basePrice}<span className="text-xs ml-1 text-gray-400">/{p.unit}</span></span>
                              </div>
                           </div>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
           )}

           {/* Step 2: Configuração */}
           {step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                   <div>
                      <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.6em] mb-3 flex items-center"><Maximize className="w-5 h-5 mr-3" /> Fase 02 // Engenharia de Precisão</h4>
                      <h3 className="text-4xl md:text-6xl font-brand font-black italic uppercase tracking-tighter leading-none">Geometria do <span className="text-red-600">Trabalho.</span></h3>
                   </div>
                   <div className="bg-black text-white p-8 rounded-[2.5rem] flex items-center space-x-8 shadow-2xl">
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center">
                         <Box className="w-7 h-7" />
                      </div>
                      <div>
                         <span className="text-[9px] font-black uppercase text-red-600 block mb-1.5 tracking-widest">Módulo Ativo</span>
                         <span className="text-lg font-brand font-black italic uppercase tracking-tight">{selectedProduct.name}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                   <div className="bg-gray-50 p-12 rounded-[3.5rem] shadow-inner space-y-12">
                      <div>
                         <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 px-2 block mb-10 flex items-center"><Scale className="w-6 h-6 mr-3" /> Matriz de Dimensões (Metros)</label>
                         <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-3">
                               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 block text-center">Eixo da Largura</span>
                               <input type="number" step="0.1" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-4 border-transparent p-7 rounded-3xl text-5xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-xl" />
                            </div>
                            <div className="space-y-3">
                               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 block text-center">Eixo da Altura</span>
                               <input type="number" step="0.1" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-4 border-transparent p-7 rounded-3xl text-5xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-xl" />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6 pt-10 border-t border-gray-200">
                         <div onClick={() => setOptions({...options, vdp: !options.vdp})} className={`flex items-center justify-between p-8 rounded-[2.5rem] cursor-pointer transition-all border-2 ${options.vdp ? 'bg-black text-white border-red-600 shadow-2xl scale-[1.02]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                            <div className="flex items-center space-x-8 text-left">
                               <Smartphone className={`w-10 h-10 ${options.vdp ? 'text-red-600' : 'text-gray-300'}`} />
                               <div>
                                  <span className="text-[12px] font-black uppercase tracking-widest block mb-1.5">Dados Variáveis (VDP)</span>
                                  <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Injeção Dinâmica de QR / IDs</span>
                               </div>
                            </div>
                         </div>

                         <div onClick={() => setOptions({...options, ecoFriendly: !options.ecoFriendly})} className={`flex items-center justify-between p-8 rounded-[2.5rem] cursor-pointer transition-all border-2 ${options.ecoFriendly ? 'bg-green-600 text-white border-green-400 shadow-2xl scale-[1.02]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                            <div className="flex items-center space-x-8 text-left">
                               <Leaf className={`w-10 h-10 ${options.ecoFriendly ? 'text-white' : 'text-gray-300'}`} />
                               <div>
                                  <span className="text-[12px] font-black uppercase tracking-widest block mb-1.5">Protocolo Carbon-Neutral</span>
                                  <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Compensação Ativa de Carbono</span>
                               </div>
                            </div>
                            <CheckCircle2 className="w-7 h-7" />
                         </div>
                      </div>
                   </div>

                   <div className="bg-black text-white p-16 rounded-[4rem] shadow-2xl relative flex flex-col justify-center text-center overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2.5 bg-red-600" />
                      <div className="mb-14">
                         <Box className="w-20 h-20 text-red-600 mx-auto mb-8" />
                         <label className="text-[12px] font-black uppercase tracking-[0.6em] text-red-600 block mb-6">Volume de Produção</label>
                         <input type="number" value={options.quantity} onChange={(e) => setOptions({...options, quantity: e.target.value})} className="w-full bg-transparent text-white text-8xl md:text-[10rem] font-brand font-black italic outline-none focus:text-red-600 transition-all text-center leading-none tracking-tighter" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
                   <div className="space-y-5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-2 block">Substrato Industrial</label>
                      <select value={options.material} onChange={(e) => setOptions({...options, material: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-6 rounded-2xl text-[12px] font-black uppercase tracking-widest appearance-none outline-none focus:border-red-600 cursor-pointer shadow-sm">
                         {MATERIALS.map(m => <option key={m}>{m}</option>)}
                      </select>
                   </div>
                   <div className="space-y-5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-2 block">Refinamento de Acabamento</label>
                      <select value={options.finish} onChange={(e) => setOptions({...options, finish: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-6 rounded-2xl text-[12px] font-black uppercase tracking-widest appearance-none outline-none focus:border-red-600 cursor-pointer shadow-sm">
                         {FINISHES.map(f => <option key={f}>{f}</option>)}
                      </select>
                   </div>
                   <div className="space-y-5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-2 block">Prioridade de Entrega</label>
                      <select value={options.priority} onChange={(e) => setOptions({...options, priority: e.target.value})} className="w-full bg-black text-white p-6 rounded-2xl text-[12px] font-black uppercase tracking-widest appearance-none outline-none border-2 border-red-600 shadow-2xl">
                         <option>Standard (48-72h)</option>
                         <option>Express (24h)</option>
                         <option>Atomic (Próprio Dia)</option>
                      </select>
                   </div>
                </div>
             </div>
           )}

           {/* Step 3: Assets */}
           {step === 3 && (
              <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center space-y-12 flex-grow">
                 <div className="max-w-2xl">
                    <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.6em] mb-4 flex items-center justify-center"><Upload className="w-6 h-6 mr-3" /> Fase 03 // Assets Digitais</h4>
                    <h3 className="text-5xl md:text-[5.5rem] font-brand font-black italic uppercase tracking-tighter leading-[0.8] mb-6">Injetar <span className="text-red-600">Assets.</span></h3>
                    <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest italic leading-relaxed">Sincronize o seu ficheiro digital com a nossa linha de produção física.</p>
                 </div>

                 {!file && !isScanningFile ? (
                    <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full max-w-2xl h-[450px] border-[6px] border-dashed border-gray-100 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group relative overflow-hidden shadow-sm"
                    >
                       <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform border border-gray-50">
                          <Upload className="w-12 h-12 text-red-600" />
                       </div>
                       <span className="text-3xl font-brand font-black italic uppercase tracking-widest mb-3">Carregar Design Master</span>
                       <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest">PDF-X4, AI, TIFF (CMYK) // LIMITE: 4GB</p>
                       <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                 ) : isScanningFile ? (
                    <div className="w-full max-w-2xl h-[450px] bg-black rounded-[4rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                       <div className="scanline-fast" />
                       <Cpu className="w-28 h-28 text-red-600 animate-pulse mb-12" />
                       <h5 className="text-4xl font-brand font-black italic text-white uppercase tracking-tighter">A Analisar Camadas...</h5>
                       <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em] mt-6">NODE DE PRE-FLIGHT R2-LISBOA ATIVO</p>
                    </div>
                 ) : (
                    <div className="w-full max-w-2xl bg-black text-white p-20 rounded-[4.5rem] relative overflow-hidden border-b-[25px] border-red-600 shadow-2xl animate-in fade-in">
                       <FileCheck className="w-28 h-28 text-red-600 mx-auto mb-12" />
                       <h4 className="text-3xl md:text-5xl font-brand font-black italic uppercase tracking-tighter truncate px-10 mb-6">{file?.name}</h4>
                       <button onClick={() => setFile(null)} className="mt-14 bg-white text-black px-16 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.6em] hover:bg-red-600 hover:text-white transition-all shadow-xl">Purgar Asset</button>
                    </div>
                 )}
              </div>
           )}

           {/* Step 4: Finalize */}
           {step === 4 && (
              <div className="animate-in slide-in-from-bottom-10 duration-700 flex flex-col items-center justify-center text-center space-y-12 flex-grow">
                 {!pdfReady ? (
                    <div className="space-y-14 max-w-2xl">
                       <div className="relative mx-auto w-48 h-48">
                          <div className="w-48 h-48 border-[15px] border-gray-50 rounded-full flex items-center justify-center shadow-inner">
                             <Flash className="w-24 h-24 text-red-600 animate-pulse" />
                          </div>
                          <div className="absolute inset-0 w-48 h-48 border-t-[15px] border-red-600 rounded-full animate-spin" />
                       </div>
                       <h3 className="text-6xl md:text-[6.5rem] font-brand font-black italic uppercase tracking-tighter leading-[0.8]">Gerar <br /><span className="text-red-600">Protocolo.</span></h3>
                       <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">Sincronizando parâmetros técnicos com o hub de produção industrial.</p>
                       <button onClick={handleGeneratePdf} className="bg-black text-white px-24 py-10 rounded-[2.5rem] font-black uppercase text-[13px] tracking-[0.7em] hover:bg-red-600 transition-all shadow-2xl hover:scale-105">Estabelecer Ligação</button>
                    </div>
                 ) : (
                    <div className="bg-gray-50 p-16 rounded-[4.5rem] border-8 border-white w-full max-w-6xl shadow-2xl relative overflow-hidden text-left animate-in zoom-in-95">
                       <div className="flex justify-between items-start mb-16">
                          <CheckCircle2 className="w-28 h-28 text-red-600" />
                          <div className="text-right">
                             <span className="text-[12px] font-black uppercase text-red-600 tracking-[0.6em] block mb-3">ID de Sincronização</span>
                             <span className="text-4xl font-brand font-black italic">#NODE-LIS-{Math.floor(Math.random()*9000000)}</span>
                          </div>
                       </div>
                       <h3 className="text-6xl md:text-[6rem] font-brand font-black italic uppercase tracking-tighter leading-[0.8] mb-16">Hub <br /><span className="text-red-600">Sincronizado.</span></h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                          <div className="space-y-8">
                             <div className="border-l-[6px] border-red-600 pl-10 text-left">
                                <span className="text-[10px] font-black text-gray-300 uppercase block mb-2 tracking-widest">Matriz de Dados Variáveis</span>
                                <span className="text-[16px] font-black uppercase tracking-tight">{options.vdp ? 'ATIVO: PAYLOAD DINÂMICO' : 'INATIVO: MASTER ESTÁTICO'}</span>
                             </div>
                             <div className="border-l-[6px] border-green-600 pl-10 text-left">
                                <span className="text-[10px] font-black text-gray-300 uppercase block mb-2 tracking-widest">Protocolo de Sustentabilidade</span>
                                <span className="text-[16px] font-black uppercase text-green-700 tracking-tight">{calculateCarbon()} kg CO2e COMPENSADO</span>
                             </div>
                          </div>
                          
                          <div className="bg-black text-white p-12 rounded-[3.5rem] flex flex-col justify-between shadow-2xl border-b-[20px] border-red-600 relative overflow-hidden">
                             <div className="flex items-center justify-between relative z-10">
                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600">Valor de Investimento</span>
                                <Activity className="w-6 h-6 text-red-600 animate-pulse" />
                             </div>
                             <div className="flex items-end space-x-3 relative z-10">
                                <span className="text-8xl font-brand font-black italic leading-none tracking-tighter">€{calculatePrice()}</span>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <button onClick={handleDownload} className="flex items-center justify-center space-x-8 bg-white border-4 border-gray-50 p-10 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.6em] hover:border-red-600 transition-all shadow-xl group">
                             <Download className="w-10 h-10 text-red-600 group-hover:-translate-y-3 transition-transform duration-500" /> <span>Descarregar Protocolo</span>
                          </button>
                          <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center justify-center space-x-8 bg-red-600 text-white p-10 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.7em] hover:bg-black transition-all shadow-2xl group relative overflow-hidden">
                             {isSubmitting ? <Loader2 className="w-10 h-10 animate-spin" /> : <Send className="w-10 h-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-500" />} 
                             <span>Iniciar Produção</span>
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {/* Footer Nav */}
           {!submitted && (
              <div className="mt-auto pt-14 flex justify-between items-center border-t border-gray-100">
                 <button 
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className={`flex items-center space-x-6 text-[12px] font-black uppercase tracking-[0.4em] transition-all hover:text-red-600 group ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                 >
                    <ArrowLeft className="w-8 h-8 group-hover:-translate-x-4 transition-transform" /> <span>Fase Anterior</span>
                 </button>
                 
                 {step < 4 && (
                    <button 
                      onClick={() => setStep(step + 1)}
                      disabled={step === 3 && !file}
                      className="bg-black text-white px-20 py-7 rounded-3xl font-black uppercase text-[12px] tracking-[0.6em] hover:bg-red-600 hover:scale-105 transition-all shadow-2xl group flex items-center disabled:opacity-5"
                    >
                       <span>Próxima Fase</span>
                       <ArrowRight className="ml-8 w-10 h-10 group-hover:translate-x-4 transition-transform" />
                    </button>
                 )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
