
import React, { useState, useRef } from 'react';
import { PRODUCTS, MATERIALS, FINISHES, ExtendedProduct } from '../constants';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, Maximize, Layers, Box, Zap, Scale, ChevronRight, Scan, Leaf, Droplets, Settings, Upload, Cpu, Smartphone, Sun, FileCheck, Download, Loader2, Send, Tag, Filter
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
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
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
  const categories: ('Todos' | Category)[] = ['Todos', ...Object.values(Category)];
  const filteredProducts = activeCategory === 'Todos' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const calculatePrice = () => {
    const qty = parseFloat(options.quantity) || 1;
    let factor = 1.0;
    if (selectedProduct.unit === 'm2') factor = dimensions.width * dimensions.height;
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
        status: 'Orçamento Gerado',
        priority: options.priority !== 'Standard (48-72h)',
        deadline: options.priority,
        timestamp: Date.now(),
        value: calculatePrice(),
        progress: 10,
        material: options.material,
        finish: options.finish,
        quantity: options.quantity
      });
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2500);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-12 industrial-grid min-h-screen pt-40 lg:pt-48">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Status */}
        <div className="lg:col-span-3 space-y-4">
           <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border-b-[8px] border-red-600 group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
              <span className="text-[8px] font-black uppercase text-red-600 block mb-3 tracking-[0.3em]">Investimento Estimado</span>
              <div className="flex items-end space-x-1">
                <h2 className="text-4xl font-brand font-black italic tracking-tighter leading-none">€{calculatePrice()}</h2>
              </div>
           </div>

           <div className="bg-white border border-gray-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                 <div className="bg-green-100 p-2 rounded-xl">
                    <Leaf className="w-4 h-4 text-green-600" />
                 </div>
                 <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Impacto CO2</span>
              </div>
              <span className="text-sm font-brand font-black italic text-green-600">{calculateCarbon()} kg</span>
           </div>

           <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
              <h4 className="font-brand text-[9px] font-black italic uppercase tracking-[0.3em] mb-6 flex items-center text-red-600">
                 <Settings className="w-4 h-4 mr-3" /> Fase do Protocolo
              </h4>
              <div className="space-y-2">
                {[
                  { s: 1, l: 'Substrato' },
                  { s: 2, l: 'Geometria' },
                  { s: 3, l: 'Assets' },
                  { s: 4, l: 'Sync' }
                ].map((item) => (
                  <div key={item.s} className={`flex items-center justify-between p-3 rounded-xl transition-all ${step === item.s ? 'bg-black text-white' : 'text-gray-300 opacity-50'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest">{item.l}</span>
                    {step > item.s ? <CheckCircle2 className="w-3 h-3 text-red-600" /> : <ChevronRight className="w-3 h-3 opacity-20" />}
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Workspace Central */}
        <div className="lg:col-span-9 bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 min-h-[800px] flex flex-col relative overflow-hidden group">
           
           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-grow">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                   <div>
                      <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center"><Layers className="w-4 h-4 mr-3" /> Protocol 01 // Materials</h4>
                      <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Matriz de <br /><span className="text-red-600">Suportes Industriais.</span></h3>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      {categories.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveCategory(cat as any)}
                          className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black hover:bg-gray-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {filteredProducts.map(p => (
                     <button 
                       key={p.id} 
                       onClick={() => setSelectedProduct(p)}
                       className={`group/card relative rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col text-left overflow-hidden h-full ${selectedProduct.id === p.id ? 'border-red-600 bg-red-50/5 shadow-2xl scale-[1.02]' : 'border-gray-50 hover:border-gray-200 hover:shadow-xl'}`}
                     >
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                           <img src={p.image} className="w-full h-full object-cover transition-transform duration-[5s] group-hover/card:scale-110" alt={p.name} />
                           {p.badge && (
                             <div className="absolute top-6 left-6 bg-black text-white text-[7px] font-black px-3 py-1.5 rounded-full tracking-[0.3em] shadow-2xl border border-white/10">
                               {p.badge}
                             </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        </div>

                        <div className="p-8 flex flex-col flex-grow bg-white">
                           <div className="flex justify-between items-start mb-4">
                             <span className="text-[7px] font-black uppercase text-red-600 tracking-widest">{p.category}</span>
                             <span className="text-sm font-brand font-black italic text-black">€{p.basePrice}<span className="text-[7px] text-gray-400">/{p.unit}</span></span>
                           </div>
                           <h5 className="text-lg font-brand font-black italic uppercase tracking-tighter leading-none mb-4">{p.name}</h5>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed line-clamp-2 mb-6 italic">
                              {p.description}
                           </p>

                           <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-50">
                              <div className="space-y-1">
                                 <span className="text-[6px] font-black uppercase text-gray-300 tracking-widest">Durabilidade</span>
                                 <span className="text-[8px] font-black uppercase text-black block truncate">{p.specs.durability}</span>
                              </div>
                              <div className="space-y-1 border-l border-gray-50 pl-4">
                                 <span className="text-[6px] font-black uppercase text-gray-300 tracking-widest">Resistência UV</span>
                                 <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-600" style={{ width: `${p.specs.weatherResistance}%` }} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                   <div>
                      <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center"><Maximize className="w-4 h-4 mr-3" /> Protocol 02 // Engineering</h4>
                      <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter leading-none">Job <br /><span className="text-red-600">Geometry.</span></h3>
                   </div>
                   <div className="bg-black text-white px-8 py-5 rounded-[2rem] flex items-center space-x-4 shadow-2xl">
                      <div className="bg-red-600 p-3 rounded-2xl"><Box className="w-5 h-5" /></div>
                      <div>
                         <span className="text-[7px] font-black uppercase text-gray-500 block mb-1">Target Asset</span>
                         <span className="text-lg font-brand font-black italic uppercase tracking-tight">{selectedProduct.name}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 space-y-10">
                      <div>
                         <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-6 flex items-center"><Scale className="w-4 h-4 mr-3" /> Matriz de Dimensões (Metros)</label>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <span className="text-[7px] font-black uppercase text-gray-400 ml-4">Largura</span>
                              <input type="number" step="0.1" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-5 rounded-2xl text-3xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-inner" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-[7px] font-black uppercase text-gray-400 ml-4">Altura</span>
                              <input type="number" step="0.1" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-5 rounded-2xl text-3xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center shadow-inner" />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4 pt-10 border-t border-gray-200">
                         <button onClick={() => setOptions({...options, vdp: !options.vdp})} className={`w-full flex items-center justify-between p-5 rounded-2xl cursor-pointer border-2 transition-all ${options.vdp ? 'bg-black text-white border-red-600' : 'bg-white border-transparent shadow-sm'}`}>
                            <div className="flex items-center space-x-4">
                               <Smartphone className="w-4 h-4 text-red-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Variable Data Injection</span>
                            </div>
                            {options.vdp && <CheckCircle2 className="w-4 h-4" />}
                         </button>
                         <button onClick={() => setOptions({...options, ecoFriendly: !options.ecoFriendly})} className={`w-full flex items-center justify-between p-5 rounded-2xl cursor-pointer border-2 transition-all ${options.ecoFriendly ? 'bg-green-600 text-white border-green-400' : 'bg-white border-transparent shadow-sm'}`}>
                            <div className="flex items-center space-x-4">
                               <Leaf className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Eco Offset Protocol</span>
                            </div>
                            {options.ecoFriendly && <CheckCircle2 className="w-4 h-4" />}
                         </button>
                      </div>
                   </div>

                   <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl relative flex flex-col justify-center text-center overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />
                      {/* Fixed: Replaced Flash with Zap as Flash was not defined */}
                      <Zap className="w-12 h-12 text-red-600 mx-auto mb-6 group-hover:scale-125 transition-transform" />
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 block mb-6">Volume de Produção</label>
                      <input type="number" value={options.quantity} onChange={(e) => setOptions({...options, quantity: e.target.value})} className="w-full bg-transparent text-white text-7xl font-brand font-black italic outline-none focus:text-red-600 transition-all text-center leading-none" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-50">
                   <div className="space-y-3">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4 block">Material Específico</label>
                      <select value={options.material} onChange={(e) => setOptions({...options, material: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm">
                         {MATERIALS.map(m => <option key={m}>{m}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4 block">Acabamento</label>
                      <select value={options.finish} onChange={(e) => setOptions({...options, finish: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-600 shadow-sm">
                         {FINISHES.map(f => <option key={f}>{f}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4 block">Prioridade</label>
                      <select value={options.priority} onChange={(e) => setOptions({...options, priority: e.target.value})} className="w-full bg-black text-white p-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-2 border-red-600 shadow-xl">
                         <option>Standard (48-72h)</option>
                         <option>Express (24h)</option>
                         <option>Atomic (Same Day)</option>
                      </select>
                   </div>
                </div>
             </div>
           )}

           {step === 3 && (
              <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center space-y-10 flex-grow">
                 <div className="max-w-2xl">
                    <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 flex items-center justify-center"><Upload className="w-4 h-4 mr-3" /> Protocol 03 // Assets</h4>
                    <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6">Sincronizar <span className="text-red-600">Ficheiros de Arte.</span></h3>
                    <p className="text-lg text-gray-400 font-medium">Os nossos sistemas realizam um pre-flight molecular automático para garantir erro zero na deposição de tinta.</p>
                 </div>

                 {!file && !isScanningFile ? (
                    <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full max-w-2xl h-[400px] border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
                    >
                       <div className="bg-red-600 p-6 rounded-[2rem] text-white shadow-2xl group-hover:scale-110 transition-transform mb-8">
                          <Upload className="w-8 h-8" />
                       </div>
                       <span className="text-2xl font-brand font-black italic uppercase mb-2">Upload Master Asset</span>
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">PDF-X4, AI, TIFF, PSD // Max: 4GB</p>
                       <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                 ) : isScanningFile ? (
                    <div className="w-full max-w-2xl h-[400px] bg-black rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                       <div className="scanline-fast" />
                       <Cpu className="w-16 h-16 text-red-600 animate-pulse mb-6" />
                       <h5 className="text-2xl font-brand font-black italic text-white uppercase tracking-tighter">Mapeamento de Camadas...</h5>
                       <div className="w-48 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
                          <div className="h-full bg-red-600 shimmer" />
                       </div>
                    </div>
                 ) : (
                    <div className="w-full max-w-2xl bg-black text-white p-16 rounded-[3rem] relative overflow-hidden border-b-[15px] border-red-600 shadow-2xl animate-in fade-in group">
                       <FileCheck className="w-16 h-16 text-red-600 mx-auto mb-8" />
                       <h4 className="text-2xl font-brand font-black italic uppercase tracking-tighter truncate px-8 mb-4">{file?.name}</h4>
                       <div className="flex items-center justify-center space-x-4 mb-10 opacity-50">
                          <span className="text-[9px] font-black uppercase tracking-widest">{file?.size}</span>
                          <span className="w-1 h-1 bg-white rounded-full" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Pre-flight OK</span>
                       </div>
                       <button onClick={() => setFile(null)} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">Substituir Asset</button>
                    </div>
                 )}
              </div>
           )}

           {step === 4 && (
              <div className="animate-in slide-in-from-bottom-10 duration-700 flex flex-col items-center justify-center text-center space-y-12 flex-grow">
                 {!pdfReady ? (
                    <div className="space-y-10 max-w-2xl">
                       <div className="relative mx-auto w-32 h-32">
                          <div className="w-32 h-32 border-[8px] border-gray-50 rounded-full flex items-center justify-center shadow-inner">
                             <Zap className="w-14 h-14 text-red-600 animate-pulse" />
                          </div>
                          <div className="absolute inset-0 w-32 h-32 border-t-[8px] border-red-600 rounded-full animate-spin" />
                       </div>
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none">Compilar <br /><span className="text-red-600">Redline Blueprint.</span></h3>
                       <p className="text-lg text-gray-400 font-medium">A gerar nota técnica via IA para calibração de cor e perfis de corte.</p>
                       <button onClick={handleGeneratePdf} className="bg-black text-white px-16 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.5em] hover:bg-red-600 transition-all shadow-2xl scale-110 active:scale-95">Gerar Protocolo Técnico</button>
                    </div>
                 ) : (
                    <div className="bg-gray-50 p-12 rounded-[4rem] border-4 border-white w-full max-w-5xl shadow-2xl text-left animate-in zoom-in-95">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                          <div className="bg-red-600 p-5 rounded-[2rem] text-white shadow-xl">
                            <CheckCircle2 className="w-10 h-10" />
                          </div>
                          <div className="text-right">
                             <span className="text-[9px] font-black uppercase text-red-600 tracking-[0.4em] block mb-2">Sync ID: R2-NODE-LIS</span>
                             <span className="text-3xl font-brand font-black italic">#HUB-{Math.floor(Math.random()*900000)}</span>
                          </div>
                       </div>
                       
                       <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-12">Protocolo <br /><span className="text-red-600">Sincronizado.</span></h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="bg-black text-white p-10 rounded-[2.5rem] flex flex-col justify-between shadow-2xl border-b-[12px] border-red-600">
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 mb-4">Investimento Total</span>
                             <span className="text-5xl font-brand font-black italic leading-none">€{calculatePrice()}</span>
                          </div>
                          <div className="bg-white border-2 border-gray-100 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu className="w-12 h-12" /></div>
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Nota Técnica Gemini R2</span>
                             <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed italic line-clamp-4">{technicalNote || 'A processar metadados industriais...'}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <button onClick={handleDownload} className="flex items-center justify-center space-x-4 bg-white border-2 border-gray-100 p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-red-600 transition-all shadow-sm group">
                             <Download className="w-6 h-6 text-red-600 group-hover:-translate-y-2 transition-transform" /> <span>Download Blueprint</span>
                          </button>
                          <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center justify-center space-x-4 bg-red-600 text-white p-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-2xl group">
                             {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />} 
                             <span>Iniciar Produção</span>
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {/* Footer Navigation */}
           {!submitted && (
              <div className="mt-auto pt-10 flex justify-between items-center border-t border-gray-100">
                 <button 
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:text-red-600 group ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                 >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> <span>Fase Anterior</span>
                 </button>
                 
                 {step < 4 && (
                    <button 
                      onClick={() => setStep(step + 1)}
                      disabled={step === 3 && !file}
                      className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:scale-105 transition-all shadow-2xl group flex items-center disabled:opacity-20"
                    >
                       <span>Próxima Fase</span>
                       <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                 )}
              </div>
           )}

           {submitted && (
              <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center text-center p-16 animate-in fade-in duration-1000">
                 <div className="w-48 h-48 bg-green-500 rounded-[3rem] flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.15)] mb-12 animate-bounce">
                    <CheckCircle2 className="w-24 h-24 text-white" />
                 </div>
                 <h3 className="text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6">Pipeline <br /> <span className="text-red-600">Confirmado.</span></h3>
                 <p className="text-lg text-gray-400 font-medium max-w-md mx-auto mb-12">
                    A sua encomenda foi injetada com sucesso no cluster de produção. Acompanhe a telemetria na sua conta.
                 </p>
                 <div className="flex space-x-4">
                    <button onClick={() => window.location.reload()} className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-2xl">Novo Projeto</button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
