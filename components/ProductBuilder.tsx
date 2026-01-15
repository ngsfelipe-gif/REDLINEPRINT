
import React, { useState, useRef, useEffect } from 'react';
import { PRODUCTS, MATERIALS, FINISHES } from '../constants';
import { 
  Check, Upload, ArrowRight, ArrowLeft, Loader2, FileText, Download, Send, 
  ShieldCheck, CheckCircle2, Maximize, Target, Activity, FileCheck, Cpu, 
  Settings, Thermometer, Layers, Box, Info, Zap, Scale, Clock
} from 'lucide-react';
import { generateTechnicalNote } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { ProductionJob, User } from '../types';

interface ProductBuilderProps {
  onAddOrder: (order: ProductionJob) => void;
  user: User | null;
}

const ProductBuilder: React.FC<ProductBuilderProps> = ({ onAddOrder, user }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [dimensions, setDimensions] = useState({ width: 1.0, height: 1.0 });
  const [options, setOptions] = useState<Record<string, string>>({
    material: MATERIALS[0],
    finish: FINISHES[0],
    quantity: '10',
    priority: 'Standard (48-72h)'
  });
  const [file, setFile] = useState<{name: string, size: string} | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [technicalNote, setTechnicalNote] = useState('');
  const [isScanningFile, setIsScanningFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculatePrice = () => {
    const qty = parseFloat(options.quantity) || 1;
    let factor = 1.0;
    if (selectedProduct.unit === 'm2') {
      factor = dimensions.width * dimensions.height;
    }
    const priorityMultiplier = options.priority.includes('Atomic') ? 1.5 : (options.priority.includes('Express') ? 1.2 : 1.0);
    return (selectedProduct.basePrice * factor * qty * priorityMultiplier).toFixed(2);
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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color definitions
    const red: [number, number, number] = [204, 0, 0];
    const black: [number, number, number] = [10, 10, 10];
    const gray: [number, number, number] = [150, 150, 150];
    const softGray: [number, number, number] = [240, 240, 240];
    
    const orderId = `RL-PRT-${Math.floor(Math.random() * 90000) + 10000}`;
    const date = new Date().toLocaleDateString('pt-PT');
    const time = new Date().toLocaleTimeString('pt-PT');

    // --- 1. INDUSTRIAL GRID BACKGROUND ---
    doc.setDrawColor(...softGray);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= 210; i += 5) doc.line(i, 0, i, 297);
    for (let i = 0; i <= 297; i += 5) doc.line(0, i, 210, i);

    // --- 2. HEADER BLOCK ---
    doc.setFillColor(...black);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Aesthetic red accent
    doc.setFillColor(...red);
    doc.rect(0, 43, 210, 2, 'F');

    // Logo & Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('REDLINE PRINT', 15, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('INDUSTRIAL PRINTING ECOSYSTEM // QUANTUM PRODUCTION HUB', 15, 26);
    doc.text('FRANKFURT NODE R2 // ISO 12647-2 CERTIFIED', 15, 30);

    // Order Metadata
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(`JOB_ID: ${orderId}`, 150, 15);
    doc.text(`SYNC_DATE: ${date}`, 150, 21);
    doc.text(`TIMESTAMP: ${time}`, 150, 27);
    doc.text(`NODE: DE-FRA-02`, 150, 33);

    // --- 3. CLIENT INFO SECTION ---
    doc.setTextColor(...black);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DESTINATÁRIO / CLIENTE NODE', 15, 55);
    
    doc.setFontSize(12);
    doc.text(user?.name || 'GUEST_OPERATOR', 15, 62);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`EMAIL: ${user?.email || 'unauthorized@node.local'}`, 15, 67);
    doc.text(`ROLE: ${user?.role || 'EXTERNAL'} // TIER: ${user?.tier || 'GUEST'}`, 15, 71);
    if(user?.company) doc.text(`COMPANY: ${user.company.toUpperCase()}`, 15, 75);

    // Corner frame aesthetic
    doc.setDrawColor(...red);
    doc.setLineWidth(0.5);
    doc.line(190, 50, 200, 50);
    doc.line(200, 50, 200, 60);

    // --- 4. PRODUCT SPECS SECTION ---
    doc.setFillColor(252, 252, 252);
    doc.rect(15, 85, 180, 120, 'F');
    doc.setDrawColor(230, 230, 230);
    doc.rect(15, 85, 180, 120, 'D');

    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('MATRIZ DE PRODUÇÃO ATIVA', 20, 93);

    doc.setTextColor(...red);
    doc.setFontSize(16);
    doc.text(selectedProduct.name.toUpperCase(), 20, 102);

    // Technical Table Simulation
    const tableY = 115;
    const drawRow = (y: number, label: string, value: string) => {
      doc.setDrawColor(240, 240, 240);
      doc.line(20, y + 2, 190, y + 2);
      doc.setFontSize(7);
      doc.setTextColor(...gray);
      doc.text(label.toUpperCase(), 20, y);
      doc.setFontSize(9);
      doc.setTextColor(...black);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 190, y, { align: 'right' });
    };

    drawRow(tableY, 'Substrato Industrial', options.material);
    drawRow(tableY + 12, 'Esquema de Acabamento', options.finish);
    drawRow(tableY + 24, 'Geometria (Largura x Altura)', `${dimensions.width}m x ${dimensions.height}m`);
    drawRow(tableY + 36, 'Área Total Calculada', `${(dimensions.width * dimensions.height).toFixed(3)} m2`);
    drawRow(tableY + 48, 'Volume de Produção (Qtd)', `${options.quantity} Unidades`);
    drawRow(tableY + 60, 'Prioridade de Deploy', options.priority.toUpperCase());
    drawRow(tableY + 72, 'Asset Digital Sincronizado', file ? file.name : 'N/A (UPLOAD PENDENTE)');

    // --- 5. AI ENGINEERING NOTES ---
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 215, 180, 35, 'F');
    doc.setDrawColor(...red);
    doc.setLineWidth(0.5);
    doc.line(15, 215, 20, 215); // Top left accent
    doc.line(15, 215, 15, 220);

    doc.setTextColor(...red);
    doc.setFontSize(7);
    doc.text('GEMINI AI // TECHNICAL PRE-FLIGHT ANALYSIS', 20, 222);
    
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const splitNote = doc.splitTextToSize(technicalNote || "Análise do motor Quantum pendente. O sistema assumirá calibração standard ISO 12647-2 para o substrato selecionado.", 170);
    doc.text(splitNote, 20, 230);

    // --- 6. PRICING BLOCK ---
    doc.setFillColor(...black);
    doc.rect(130, 255, 65, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('TOTAL ESTIMADO (C/ IVA)', 135, 263);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${calculatePrice()} EUR`, 135, 275);

    // --- 7. BARCODE & TRACKING ---
    doc.setFillColor(...black);
    const codeX = 15;
    const codeY = 260;
    for (let i = 0; i < 40; i++) {
      const w = Math.random() * 1.2 + 0.1;
      doc.rect(codeX + (i * 1.8), codeY, w, 12, 'F');
    }
    doc.setFontSize(6);
    doc.setTextColor(...black);
    doc.setFont('courier', 'bold');
    doc.text(`* AUTH-TOKEN: ${Math.random().toString(36).substring(7).toUpperCase()} *`, codeX, codeY + 16);

    // --- 8. FOOTER BLOCK ---
    doc.setFillColor(...black);
    doc.rect(0, 290, 210, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('REDLINE PRINT INDUSTRIAL ECOSYSTEM // FRANKFURT R2 NODE // WWW.REDLINEPRINT.EU', 105, 294.5, { align: 'center' });

    // Save PDF
    doc.save(`REDLINE_BLUEPRINT_${orderId}.pdf`);
  };

  const handleSubmit = () => {
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
    <div className="max-w-[1400px] mx-auto px-6 py-24 industrial-grid min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 space-y-6 animate-in slide-in-from-left-4 duration-500">
           <div className="bg-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border-b-[8px] border-red-600">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-600 block mb-4">Total Estimate</span>
              <div className="flex items-end space-x-1">
                <h2 className="text-4xl md:text-5xl font-brand font-black italic tracking-tighter leading-none">{calculatePrice()}</h2>
                <span className="text-xl font-brand font-black italic mb-0.5 text-red-600">€</span>
              </div>
              <p className="text-[8px] font-bold text-gray-500 mt-4 uppercase tracking-widest">Inclui Pre-flight e Taxa Hub R2.</p>
           </div>

           <div className="glass p-6 rounded-3xl border border-gray-100 shadow-lg">
              <h4 className="font-brand text-sm font-black italic uppercase tracking-widest mb-6 flex items-center">
                 <Settings className="w-4 h-4 mr-2 text-red-600" /> Pipeline
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Substrato', step: 1 },
                  { label: 'Geometria', step: 2 },
                  { label: 'Carga Asset', step: 3 },
                  { label: 'Deploy', step: 4 }
                ].map((s) => (
                  <div key={s.step} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${step === s.step ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-400 opacity-60'}`}>
                    <div className="flex items-center space-x-3">
                       <span className="text-base font-brand font-black italic">0{s.step}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                    </div>
                    {step > s.step && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <Thermometer className="w-5 h-5 text-red-600" />
                 <div>
                    <span className="text-[8px] font-black text-gray-300 uppercase block">Node Status</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Core: 39.2°C</span>
                 </div>
              </div>
              <div className="w-6 h-1 bg-green-500 rounded-full" />
           </div>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-9 bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-12 min-h-[750px] flex flex-col relative overflow-hidden group">
           
           {/* Step 1: Products */}
           {step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-grow">
                <div className="mb-12">
                   <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em] mb-2 flex items-center"><Layers className="w-4 h-4 mr-2" /> Phase 01 // Matrix</h4>
                   <h3 className="text-3xl md:text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-2">Selecione o <span className="text-red-600">Suporte.</span></h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {PRODUCTS.map(p => (
                     <button 
                       key={p.id} 
                       onClick={() => setSelectedProduct(p)}
                       className={`group/card relative rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden flex flex-col sm:flex-row ${selectedProduct.id === p.id ? 'border-red-600 bg-red-50/5 shadow-2xl scale-[1.02]' : 'border-gray-50 hover:border-gray-100'}`}
                     >
                        <div className="sm:w-1/2 aspect-square relative overflow-hidden bg-gray-100">
                           <img src={p.image} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[3s]" alt={p.name} />
                           {selectedProduct.id === p.id && <div className="scanline-fast"></div>}
                        </div>
                        <div className="sm:w-1/2 p-6 text-left flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-2">
                                 <h5 className="text-xl font-brand font-black italic uppercase tracking-tighter leading-tight group-hover/card:text-red-600 transition-colors">{p.name}</h5>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-4 line-clamp-3">{p.description}</p>
                           </div>
                           <div className="space-y-1.5 border-t border-gray-50 pt-4">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                 <span className="text-gray-300">Grama:</span> <span className="text-black font-bold">{p.specs.weight}</span>
                              </div>
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                 <span className="text-gray-300">Uso:</span> <span className="text-black font-bold">{p.specs.usage}</span>
                              </div>
                           </div>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
           )}

           {/* Step 2: Config */}
           {step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 flex-grow">
                <div>
                   <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em] mb-2 flex items-center"><Maximize className="w-4 h-4 mr-2" /> Phase 02 // Engineering</h4>
                   <h3 className="text-4xl md:text-5xl font-brand font-black italic uppercase tracking-tighter leading-none">Matriz de <span className="text-red-600">Configuração.</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-gray-50 p-10 rounded-[2.5rem] shadow-inner space-y-8">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 block flex items-center"><Scale className="w-4 h-4 mr-2" /> Dimensões Físicas (Metros)</label>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest px-2 block">Width</span>
                            <input type="number" step="0.1" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-4 rounded-xl text-3xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center" />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest px-2 block">Height</span>
                            <input type="number" step="0.1" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0.1})} className="w-full bg-white border-2 border-transparent p-4 rounded-xl text-3xl font-brand font-black italic outline-none focus:border-red-600 transition-all text-center" />
                         </div>
                      </div>
                   </div>

                   <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl relative flex flex-col justify-center text-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-red-600 block mb-2">Volume de Produção</label>
                      <input type="number" value={options.quantity} onChange={(e) => setOptions({...options, quantity: e.target.value})} className="w-full bg-transparent text-white text-5xl md:text-6xl font-brand font-black italic outline-none focus:text-red-600 transition-all text-center leading-none" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 mt-2">Unidades Ativas</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 block">Substrato</label>
                      <select value={options.material} onChange={(e) => setOptions({...options, material: e.target.value})} className="w-full bg-gray-50 border-2 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-red-600 cursor-pointer">
                         {MATERIALS.map(m => <option key={m}>{m}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 block">Acabamento</label>
                      <select value={options.finish} onChange={(e) => setOptions({...options, finish: e.target.value})} className="w-full bg-gray-50 border-2 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:border-red-600 cursor-pointer">
                         {FINISHES.map(f => <option key={f}>{f}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 block">Prioridade</label>
                      <select value={options.priority} onChange={(e) => setOptions({...options, priority: e.target.value})} className="w-full bg-black text-white p-4 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none border-2 border-red-600">
                         <option>Standard (48-72h)</option>
                         <option>Express (24h)</option>
                         <option>Atomic (Same Day)</option>
                      </select>
                   </div>
                </div>
             </div>
           )}

           {/* Step 3: Asset */}
           {step === 3 && (
             <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center space-y-12 flex-grow">
                <div className="max-w-md">
                   <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em] mb-2 flex items-center justify-center"><Upload className="w-4 h-4 mr-2" /> Phase 03 // Assets</h4>
                   <h3 className="text-4xl md:text-5xl font-brand font-black italic uppercase tracking-tighter leading-tight mb-2">Injeção de <span className="text-red-600">Assets.</span></h3>
                </div>

                {!file && !isScanningFile ? (
                   <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-xl h-[300px] border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
                   >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                         <Upload className="w-8 h-8 text-red-600" />
                      </div>
                      <span className="text-lg font-brand font-black italic uppercase tracking-widest mb-1">Transferir Design</span>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">PDF-X, AI, TIFF // MAX 4GB</p>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                   </div>
                ) : isScanningFile ? (
                   <div className="w-full max-w-xl h-[300px] bg-black rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                      <div className="scanline-fast"></div>
                      <Cpu className="w-16 h-16 text-red-600 animate-pulse mb-6" />
                      <h5 className="text-xl font-brand font-black italic text-white uppercase tracking-widest">Sincronizando Cluster...</h5>
                   </div>
                ) : (
                   <div className="w-full max-w-xl bg-black text-white p-12 rounded-[2.5rem] relative overflow-hidden border-b-[12px] border-red-600 shadow-xl animate-in fade-in">
                      <FileCheck className="w-16 h-16 text-red-600 mx-auto mb-8" />
                      <h4 className="text-2xl font-brand font-black italic uppercase tracking-tighter truncate px-6">{file?.name}</h4>
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mt-4">Verified Hash // {file?.size}</p>
                      <button onClick={() => setFile(null)} className="mt-8 bg-white text-black px-10 py-3 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Remover Asset</button>
                   </div>
                )}
             </div>
           )}

           {/* Step 4: Final */}
           {step === 4 && (
             <div className="animate-in slide-in-from-bottom-6 duration-500 flex flex-col items-center justify-center text-center space-y-12 flex-grow">
                {!pdfReady ? (
                   <div className="space-y-10">
                      <div className="relative mx-auto w-32 h-32">
                         <div className="w-32 h-32 border-[8px] border-gray-50 rounded-full flex items-center justify-center shadow-inner">
                            <Zap className="w-16 h-16 text-red-600 animate-pulse" />
                         </div>
                         <div className="absolute inset-0 w-32 h-32 border-t-[8px] border-red-600 rounded-full animate-spin" />
                      </div>
                      <h3 className="text-4xl font-brand font-black italic uppercase tracking-tighter">Validação <span className="text-red-600">Final.</span></h3>
                      <button onClick={handleGeneratePdf} className="bg-black text-white px-16 py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.5em] hover:bg-red-600 transition-all shadow-lg hover:scale-105">Validar Ordem Industrial</button>
                   </div>
                ) : (
                   <div className="bg-gray-50 p-12 rounded-[3rem] border-4 border-white w-full max-w-4xl shadow-2xl relative overflow-hidden">
                      <CheckCircle2 className="w-24 h-24 text-red-600 mx-auto mb-6" />
                      <h3 className="text-4xl md:text-5xl font-brand font-black italic uppercase tracking-tighter leading-none mb-4">Protocol Ready.</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 px-6">
                         <div className="text-left border-l-2 border-red-100 pl-4">
                            <span className="text-[7px] font-black text-gray-300 uppercase block">Product</span>
                            <span className="text-sm font-brand font-black italic uppercase truncate block">{selectedProduct.name}</span>
                         </div>
                         <div className="text-left border-l-2 border-red-100 pl-4">
                            <span className="text-[7px] font-black text-gray-300 uppercase block">Config</span>
                            <span className="text-sm font-brand font-black italic uppercase">{dimensions.width}x{dimensions.height}m</span>
                         </div>
                         <div className="text-left border-l-2 border-red-100 pl-4">
                            <span className="text-[7px] font-black text-gray-300 uppercase block">Volume</span>
                            <span className="text-sm font-brand font-black italic uppercase">{options.quantity} UN</span>
                         </div>
                         <div className="text-left border-l-2 border-red-100 pl-4">
                            <span className="text-[7px] font-black text-gray-300 uppercase block">Logic</span>
                            <span className="text-sm font-brand font-black italic uppercase text-red-600">{options.priority.split(' ')[0]}</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
                         <button onClick={handleDownload} className="flex items-center justify-center space-x-4 bg-white border border-gray-200 p-6 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:border-red-600 transition-all shadow-md group">
                            <Download className="w-6 h-6 text-red-600 group-hover:-translate-y-1 transition-transform" /> <span>Download Blueprint PDF</span>
                         </button>
                         <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center justify-center space-x-4 bg-red-600 text-white p-6 rounded-2xl font-black uppercase text-[9px] tracking-[0.4em] hover:bg-black transition-all shadow-xl group">
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />} <span>Deploy Node</span>
                         </button>
                      </div>
                   </div>
                )}
             </div>
           )}

           {/* Footer Nav */}
           {!submitted && (
              <div className="mt-auto pt-8 flex justify-between items-center border-t border-gray-100">
                 <button 
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className={`flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest transition-all hover:text-red-600 group ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                 >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> <span>Anterior</span>
                 </button>
                 
                 {step < 4 && (
                    <button 
                      onClick={() => setStep(step + 1)}
                      disabled={step === 3 && !file}
                      className="bg-black text-white px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-red-600 hover:scale-105 transition-all shadow-lg group flex items-center disabled:opacity-20 active:scale-95"
                    >
                       <span>Siguiente Fase</span>
                       <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                 )}
              </div>
           )}

           {/* Success Overlay */}
           {submitted && (
              <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center text-center p-12 animate-in fade-in duration-500">
                 <div className="w-48 h-48 bg-green-500 rounded-[2rem] flex items-center justify-center shadow-2xl mb-12 animate-bounce">
                    <CheckCircle2 className="w-24 h-24 text-white" />
                 </div>
                 <h3 className="text-5xl md:text-6xl font-brand font-black italic uppercase tracking-tighter leading-none mb-6">Synced.</h3>
                 <p className="text-xl text-gray-400 font-bold uppercase max-w-2xl border-l-8 border-red-600 pl-10 text-left mx-auto">
                    Ordem sincronizada com cluster R2. Processamento molecular ativo.
                 </p>
                 <button onClick={() => window.location.reload()} className="mt-12 bg-black text-white px-16 py-6 rounded-xl font-black uppercase text-[9px] tracking-[0.6em] hover:bg-red-600 transition-all shadow-xl active:scale-95">Nova Produção</button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductBuilder;
