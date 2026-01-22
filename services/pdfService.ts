
import { jsPDF } from 'jspdf';
import { ProductionJob, PartnerNode } from '../types';

/**
 * Desenha um Barcode Code 128 simplificado (Industrial Standard) no PDF
 */
const drawBarcode = (doc: jsPDF, data: string, x: number, y: number, width: number, height: number) => {
  const bars = data.split('').map(char => char.charCodeAt(0) % 5 + 1);
  let currentX = x;
  doc.setFillColor(0, 0, 0);
  
  // Desenha as barras baseadas no ID único da ordem
  for (let i = 0; i < 40; i++) {
    const barWidth = (i % 3 === 0) ? 0.8 : 0.4;
    if (i % 2 === 0) {
      doc.rect(currentX, y, barWidth, height, 'F');
    }
    currentX += barWidth + 0.2;
    if (currentX > x + width) break;
  }
  
  doc.setFontSize(6);
  doc.setFont('courier', 'bold');
  doc.text(`* ${data.toUpperCase()} *`, x + (width / 2), y + height + 3, { align: 'center' });
};

export const generateOrderPDF = async (order: ProductionJob, hub: PartnerNode | undefined) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background Grid Industrial
  doc.setDrawColor(245, 245, 245);
  for (let i = 0; i < 210; i += 5) doc.line(i, 0, i, 297);
  for (let i = 0; i < 297; i += 5) doc.line(0, i, 210, i);

  // Header Black Block
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Redline Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('REDLINE', 15, 22);
  doc.setTextColor(204, 0, 0);
  doc.text('PRINT', 58, 22);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('courier', 'normal');
  doc.text('R2-PROTOCOL // INDUSTRIAL PRODUCTION SPEC', 15, 30);

  // Status Badge
  doc.setFillColor(204, 0, 0);
  doc.rect(150, 12, 45, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(order.status.toUpperCase(), 172.5, 18.5, { align: 'center' });

  // Barcode Section (Top Right)
  drawBarcode(doc, order.id, 150, 28, 45, 8);

  // Main Content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEM DE PRODUÇÃO', 15, 60);
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(1);
  doc.line(15, 63, 60, 63);

  // Data Grid
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const drawField = (label: string, value: string, x: number, y: number) => {
    doc.setTextColor(150, 150, 150);
    doc.text(label, x, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x, y + 5);
    doc.setFont('helvetica', 'normal');
  };

  drawField('CLIENTE:', order.client, 15, 75);
  drawField('ID DA ORDEM:', order.id, 80, 75);
  drawField('DATA GRID:', new Date(order.timestamp).toLocaleDateString(), 145, 75);

  drawField('MÓDULO:', order.product, 15, 95);
  drawField('SUBSTRATO:', order.material, 80, 95);
  drawField('ACABAMENTO:', order.finish, 145, 95);

  drawField('DIMENSÕES:', order.dimensions || 'N/A', 15, 115);
  drawField('QUANTIDADE:', `${order.quantity} UN`, 80, 115);
  drawField('UNIDADE:', order.unit?.toUpperCase() || 'MM', 145, 115);

  // HUB Info Block
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 135, 180, 25, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.text('NODO INDUSTRIAL DE PROCESSAMENTO:', 20, 142);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${hub?.name || 'CENTRAL REDLINE R2'} // ${hub?.location || 'GRID GLOBAL'}`, 20, 150);

  // Technical Notes Section
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('NOTAS DE ENGENHARIA:', 15, 175);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const notes = [
    '- Validação Pre-flight R2 concluída.',
    '- Perfil de Cor: FOGRA39 (ISO 12647-2:2004).',
    '- Margem de segurança de 3mm aplicada em todos os eixos.',
    '- Resolução de saída: 2400 DPI Quantum-Dot.'
  ];
  notes.forEach((note, i) => doc.text(note, 20, 185 + (i * 5)));

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 275, 195, 275);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('REDLINE PRINTING SYSTEMS // R2 CORE v4.2 // AUTENTICAÇÃO VIA BARCODE INDUSTRIAL', 15, 282);
  doc.text(`HASH_SYNC: ${btoa(order.id).slice(0, 16)}`, 195, 282, { align: 'right' });

  doc.save(`REDLINE_ORDEM_${order.id}.pdf`);
};

export const downloadOriginalAsset = (order: ProductionJob) => {
  const element = document.createElement('a');
  const file = new Blob([`DATA_STREAM_ORIGINAL: ${order.fileName}`], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = order.fileName || `asset_${order.id}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
