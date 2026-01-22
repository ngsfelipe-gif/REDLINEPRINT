
import { jsPDF } from 'jspdf';
import { ProductionJob, PartnerNode } from '../types';

/**
 * Gera um PDF industrial (Guia de Produção) com layout Redline R2.
 */
export const generateOrderPDF = async (order: ProductionJob, hub: PartnerNode | undefined) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background Grid Industrial (Simulado)
  doc.setDrawColor(240, 240, 240);
  for (let i = 0; i < 210; i += 10) {
    doc.line(i, 0, i, 297);
  }
  for (let i = 0; i < 297; i += 10) {
    doc.line(0, i, 210, i);
  }

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('REDLINE PRINT', 15, 20);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('R2 INDUSTRIAL GRID // PROTOCOLO DE PRODUÇÃO', 15, 28);
  
  doc.setFillColor(204, 0, 0);
  doc.rect(160, 0, 50, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(order.id, 170, 22);
  doc.setFontSize(7);
  doc.text('STATUS: ' + order.status.toUpperCase(), 170, 30);

  // Body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHES DA ENTIDADE', 15, 60);
  
  doc.setDrawColor(204, 0, 0);
  doc.line(15, 62, 195, 62);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${order.client}`, 15, 70);
  doc.text(`ID Cliente: ${order.clientId}`, 15, 75);
  doc.text(`Data: ${new Date(order.timestamp).toLocaleString()}`, 15, 80);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ESPECIFICAÇÕES TÉCNICAS', 15, 100);
  doc.line(15, 102, 195, 102);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Módulo: ${order.product}`, 15, 110);
  doc.text(`Material: ${order.material}`, 15, 115);
  doc.text(`Acabamento: ${order.finish}`, 15, 120);
  doc.text(`Quantidade: ${order.quantity} un`, 15, 125);
  doc.text(`Dimensões: ${order.dimensions || 'N/A'}`, 15, 130);
  doc.text(`Asset Original: ${order.fileName || 'N/A'}`, 15, 135);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NODO INDUSTRIAL DE DESTINO', 15, 155);
  doc.line(15, 157, 195, 157);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Hub: ${hub?.name || 'Central R2'}`, 15, 165);
  doc.text(`Localização: ${hub?.location || 'Grid Descentralizado'}`, 15, 170);
  doc.text(`ID Nodo: ${order.nodeId}`, 15, 175);

  // Footer / QR Code Placeholder
  doc.setDrawColor(0, 0, 0);
  doc.rect(15, 200, 40, 40);
  doc.setFontSize(7);
  doc.text('QR AUTH R2', 25, 222);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento é uma guia oficial do sistema REDLINE PRINT. A alteração de qualquer dado invalida o protocolo industrial.', 15, 280);
  doc.text('HASH_VAL: ' + btoa(order.id + order.timestamp).slice(0, 32), 15, 285);

  doc.save(`REDLINE_JOB_${order.id}.pdf`);
};

/**
 * Simula o download de um ativo industrial (arquivo original).
 */
export const downloadOriginalAsset = (order: ProductionJob) => {
  // Em uma app real, isso seria um fetch para um blob storage.
  // Aqui simulamos o download de um arquivo dummy para validar a UI.
  const element = document.createElement('a');
  const file = new Blob([`CONTEÚDO BINÁRIO SIMULADO DO ATIVO: ${order.fileName}`], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = order.fileName || `asset_${order.id}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
