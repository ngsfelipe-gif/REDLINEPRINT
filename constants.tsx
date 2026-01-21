
import { Category, ExtendedProduct, ProductionJob, SupportTicket, PartnerNode } from './types';

export const COLORS = {
  primary: '#CC0000',
  black: '#0A0A0A',
  white: '#FFFFFF',
};

export const MATERIALS = [
  'Industrial 350g (Mate)', 'Premium Silk Coated 400g', 'Reciclado Eco-Fibre 300g', 'Mate Anti-Reflexo UV 500g', 'Brilho High-Gloss 500g', 'PVC Rígido 5mm Branco', 'Lona Mesh Pro Micro-Perfurada', 'Vinil Cast 3D Automotivo', 'Papel Offset Superior 90g', 'Couché Brilho 135g', 'Papel Kraft Industrial 440g', 'Cartão Canelado Micro-E'
];

export const FINISHES = [
  'Corte Bruto (Sem Acabamento)', 'Corte Reto Laser de Precisão', 'Corte Especial (Die-Cut Digital)', 'Ilhós Perimetral Reforçado 15mm', 'Verniz Localizado 3D High-Build', 'Plastificação Mate Soft-Touch', 'Laminagem Anti-Graffiti', 'Dobra em Cruz (Flyers)'
];

const generateProducts = (): ExtendedProduct[] => {
  const items: ExtendedProduct[] = [];
  const categories = Object.values(Category);
  
  const imgUrls: Record<string, string[]> = {
    [Category.LargeFormat]: ['https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a', 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3'],
    [Category.SmallFormat]: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f', 'https://images.unsplash.com/photo-1619551734325-81aac64e7dff'],
    [Category.Packaging]: ['https://images.unsplash.com/photo-1595079676339-1534801ad6cf', 'https://images.unsplash.com/photo-1528698851214-41da9281a85c'],
    [Category.Textile]: ['https://images.unsplash.com/photo-1591337676887-a217a6970c8a', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
    [Category.CommercialPrint]: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f', 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14'],
    [Category.SmartSolution]: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'],
    [Category.OfficeSupplies]: ['https://images.unsplash.com/photo-1586075010620-22524317b62a'],
    [Category.Events]: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87']
  };

  const productNames: Record<string, string[]> = {
    [Category.LargeFormat]: ['Lona Frontlight', 'Lona Mesh', 'Vinil Fosco', 'Vinil Brilho', 'Alumínio Dibond', 'PVC Expandido', 'Acrílico Cristal', 'Backlight Film'],
    [Category.SmallFormat]: ['Cartão de Visita Silk', 'Cartão de Visita Reciclado', 'Flyer A5 Standard', 'Flyer A6 Premium', 'Folheto Bifold', 'Folheto Trifold'],
    [Category.Packaging]: ['Caixa de Envio P', 'Caixa de Envio M', 'Caixa de Envio G', 'Saco de Papel Kraft', 'Saco de Luxo Laminado'],
    [Category.Textile]: ['T-Shirt Algodão', 'Sweatshirt Premium', 'Tote Bag Orgânico', 'Boné Industrial', 'Polo Piqué'],
    [Category.CommercialPrint]: ['Catálogo A4 PUR', 'Relatório Anual', 'Agenda Corporativa', 'Menu Restaurante'],
    [Category.SmartSolution]: ['Cartão NFC Metal', 'Cartão NFC PVC', 'Tag Ativo R2', 'Placa Smart Feedback'],
    [Category.OfficeSupplies]: ['Papel de Carta', 'Envelope DL', 'Envelope C5', 'Pasta de Documentos'],
    [Category.Events]: ['Roll-up Standard', 'Roll-up Premium', 'Banner de X', 'Pop-up Wall 3x3']
  };

  categories.forEach((cat) => {
    const names = productNames[cat] || [];
    const imgs = imgUrls[cat] || [];
    names.forEach((name, i) => {
      items.push({
        id: `${cat.slice(0, 2).toLowerCase()}-${i + 1}`,
        name,
        category: cat,
        description: `Solução industrial premium para ${cat.toLowerCase()}. Protocolo REDLINE R2.`,
        basePrice: Math.floor(Math.random() * 50) + 10,
        unit: cat === Category.LargeFormat ? 'm2' : 'un',
        image: `${imgs[i % imgs.length]}?q=80&w=800`,
        badge: i % 5 === 0 ? 'NOVO' : (i % 7 === 0 ? 'ECO' : undefined),
        specs: {
          weight: `${Math.floor(Math.random() * 400) + 100}g`,
          durability: `${Math.floor(Math.random() * 5) + 2} Anos`,
          usage: 'Profissional',
          weatherResistance: Math.floor(Math.random() * 100),
          ecoLevel: Math.floor(Math.random() * 100),
          precisionLevel: 'Ultra'
        }
      });
    });
  });

  return items;
};

export const INITIAL_PRODUCTS = generateProducts();

export const MOCK_NODES: PartnerNode[] = [
  { 
    id: 'NODE-FRA', 
    name: 'Frankfurt GigaPress', 
    location: 'Frankfurt, DE', 
    specialization: [Category.LargeFormat, Category.Packaging], 
    status: 'Online', 
    capacity: 85, 
    latency: '0.2ms', 
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800',
    description: 'A maior unidade de impressão da Europa Central. Especializada em grandes volumes e embalagens industriais.'
  },
  { 
    id: 'NODE-LIS', 
    name: 'Lisbon Creative Hub', 
    location: 'Lisboa, PT', 
    specialization: [Category.SmallFormat, Category.Textile], 
    status: 'Online', 
    capacity: 40, 
    latency: '12ms', 
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800',
    description: 'Centro de excelência para acabamentos especiais e impressão comercial de alta fidelidade.'
  },
  { 
    id: 'NODE-BER', 
    name: 'Berlin Tech Print', 
    location: 'Berlim, DE', 
    specialization: [Category.SmartSolution, Category.OfficeSupplies], 
    status: 'Busy', 
    capacity: 98, 
    latency: '4ms', 
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800',
    description: 'Hub de inovação especializado em soluções inteligentes NFC e cartões corporativos de metal.'
  }
];

export const MOCK_JOBS: ProductionJob[] = [
  { id: 'RL-1024', client: 'Elon Musk', product: 'Lona Mesh Giga', status: 'Impressão', priority: true, deadline: 'Hoje', timestamp: Date.now() - 3600000, value: '1250.00', material: 'Lona Mesh Pro', finish: 'Ilhós Perimetral', dimensions: '10.0x5.0m', quantity: '1', progress: 60, nodeId: 'NODE-FRA' }
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TK-4412', subject: 'Ajuste de Cor Pantone 485C', category: 'Técnico', status: 'Em Análise', priority: 'Alta', timestamp: Date.now() - 86400000 }
];
