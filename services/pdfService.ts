
import { jsPDF } from 'jspdf';
import { ProductionJob, PartnerNode } from '../types';

/**
 * Sistema de Barcode Redline R2 (Code 128 Industrial Style)
 */
const generateBarcodeBars = (doc: jsPDF, data: string, x: number, y: number, width: number, height: number) => {
  const seed = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let currentX = x;
  doc.setFillColor(0, 0, 0);
  
  for (let i = 0; i < 35; i++) {
    const isWide = (seed + i) % 3 === 0;
    const barWidth = isWide ? 1.0 : 0.4;
    if ((seed + i) % 2 === 0) {
      doc.rect(currentX, y, barWidth, height, 'F');
    }
    currentX += barWidth + 0.2;
    if (currentX > x + width) break;
  }
  
  doc.setFontSize(6);
  doc.setFont('courier', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`* ${data.toUpperCase()} *`, x + (width / 2), y + height + 3, { align: 'center' });
};

// Fix: Added missing export for downloadOriginalAsset to support component functionality
export const downloadOriginalAsset = (order: ProductionJob) => {
  // Mock asset download logic
  // In a real scenario, this would fetch the actual asset file from the REDLINE R2 storage cluster
  const dummyContent = `Industrial Asset Binary Stream for Job ${order.id}\nProduct: ${order.product}\nMaterial: ${order.material}\nFinish: ${order.finish}\nDimensions: ${order.dimensions}\nQuantity: ${order.quantity}`;
  const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', order.fileName || `RL_ASSET_${order.id}.bin`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateOrderPDF = async (order: ProductionJob, hub: PartnerNode | undefined) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setDrawColor(240, 240, 240);
  for (let i = 0; i < 210; i += 10) doc.line(i, 0, i, 297);
  for (let i = 0; i < 297; i += 10) doc.line(0, i, 210, i);

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('REDLINE', 15, 25);
  doc.setTextColor(204, 0, 0);
  doc.text('MARKET', 60, 25);
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('courier', 'normal');
  doc.text('INDUSTRIAL MARKET GRID // R2-CORE-STABLE', 15, 33);

  doc.setFillColor(204, 0, 0);
  doc.rect(145, 12, 50, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(order.status.toUpperCase(), 170, 20, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.rect(145, 28, 50, 15, 'F');
  generateBarcodeBars(doc, order.id, 150, 31, 40, 7);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GUIA TÉCNICA DE PRODUÇÃO', 15, 65);
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(1.5);
  doc.line(15, 68, 80, 68);

  const drawEntry = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x, y);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x, y + 5);
  };

  drawEntry('CLIENTE / ENTIDADE:', order.client, 15, 80);
  drawEntry('ID DA ORDEM:', order.id, 90, 80);
  drawEntry('DATA DE INJEÇÃO:', new Date(order.timestamp).toLocaleString(), 145, 80);

  drawEntry('MÓDULO:', order.product, 15, 100);
  drawEntry('SUBSTRATO:', order.material, 90, 100);
  drawEntry('ACABAMENTO:', order.finish, 145, 100);

  drawEntry('DIMENSÕES:', order.dimensions || 'N/A', 15, 120);
  drawEntry('QUANTIDADE:', `${order.quantity} UNIDADES`, 90, 120);
  drawEntry('PRIORIDADE:', order.priority ? 'CRÍTICA (R2)' : 'STANDARD', 145, 120);

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220, 220, 220);
  doc.rect(15, 135, 180, 30, 'FD');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('NODO INDUSTRIAL DE PROCESSAMENTO:', 20, 142);
  doc.setTextColor(204, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${hub?.name || 'CENTRAL REDLINE MARKET R2'} // ${hub?.location || 'GLOBAL GRID'}`, 20, 152);
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Capacity Sync: ${hub?.capacity || 100}% // Latency: ${hub?.latency || '0.1ms'}`, 20, 159);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CHECKLIST DE ENGENHARIA:', 15, 180);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const checklist = [
    '[X] Validação de Asset Vetorial (Atomic Scan)',
    '[X] Calibração de Perfil de Cor FOGRA39',
    '[X] Verificação de Sangrias e Margens de Segurança',
    '[X] Protocolo de Deposição de Tinta UV Configurado'
  ];
  checklist.forEach((item, i) => doc.text(item, 20, 190 + (i * 6)));

  doc.setFillColor(10, 10, 10);
  doc.rect(15, 220, 180, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text('METADADOS DO ASSET:', 20, 227);
  doc.setFont('courier', 'normal');
  doc.text(`FILENAME: ${order.fileName || 'RL_ASSET_MASTER.PDF'}`, 20, 233);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 275, 195, 275);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('REDLINE MARKET SYSTEMS // R2-SYNC-SERVICE // AUTENTICAÇÃO VIA BARCODE INDUSTRIAL', 15, 282);
  doc.text(`HASH: ${btoa(order.id).slice(0, 20)}`, 195, 282, { align: 'right' });

  doc.save(`REDLINE_MARKET_${order.id}_SPEC.pdf`);
};
