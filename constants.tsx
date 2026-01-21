
import React from 'react';
import { Category, Product, ProductionJob, SupportTicket } from './types';
import { 
  Printer, 
  FileText, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Trophy,
  Activity,
  Globe,
  Settings,
  Truck,
  Box,
  Cpu,
  Smartphone,
  Package,
  Shirt,
  Shield,
  Target,
  Sun,
  Leaf,
  BaggageClaim,
  Maximize,
  Scan,
  Zap as Flash
} from 'lucide-react';

export const COLORS = {
  primary: '#CC0000',
  black: '#0A0A0A',
  white: '#FFFFFF',
};

export const MATERIALS = [
  'Industrial 350g (Mate)', 'Premium Silk Coated 400g', 'Reciclado Eco-Fibre 300g', 'Mate Anti-Reflexo UV 500g', 'Brilho High-Gloss 500g', 'PVC Rígido 5mm Branco', 'Lona Mesh Pro Micro-Perfurada', 'Vinil Cast 3D Automotivo', 'Papel Offset Superior 90g', 'Couché Brilho 135g', 'Papel Kraft Industrial 440g', 'Cartão Canelado Micro-E', 'Poliéster Técnico 180g (DTF)', 'Backlight Film Premium 200mic', 'Aço Inox Escovado 0.8mm', 'Bambu Sustentável Laminado', 'Alumínio Dibond 3mm', 'Acrílico Cristal 10mm'
];

export const FINISHES = [
  'Corte Bruto (Sem Acabamento)', 'Corte Reto Laser de Precisão', 'Corte Especial (Die-Cut Digital)', 'Ilhós Perimetral Reforçado 15mm', 'Verniz Localizado 3D High-Build', 'Plastificação Mate Soft-Touch', 'Laminagem Anti-Graffiti', 'Dobra em Cruz (Flyers)', 'Dobra em Janela (Trifold)', 'Estampagem Foil Ouro 24k', 'Estampagem Foil Prata Industrial', 'Relevo Seco (Embossing)', 'Laminagem Antiderrapante R10', 'Gravação Laser Fibra Ocular'
];

export interface ExtendedProduct extends Product {
  specs: {
    weight: string;
    durability: string;
    usage: string;
    weatherResistance?: number; // 0-100
    ecoLevel?: number; // 0-100
    precisionLevel?: string;
  };
  badge?: 'NOVO' | 'ECO' | 'BEST' | 'PRO' | 'QUENTE';
}

export const PRODUCTS: ExtendedProduct[] = [
  // GRANDE FORMATO
  { 
    id: 'lf-01', 
    name: 'Lona Frontlight Industrial', 
    category: Category.LargeFormat, 
    description: 'Publicidade de escala massiva. PVC de alta tenacidade com reforço interno de poliéster. Resistência extrema ao rasgo.', 
    basePrice: 19.50, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=1200', 
    badge: 'BEST',
    specs: { weight: '510g/m2', durability: '5 Anos+', usage: 'Billboard Exterior', weatherResistance: 98, ecoLevel: 20, precisionLevel: 'Standard High' }
  },
  { 
    id: 'lf-02', 
    name: 'Lona Mesh Micro-Perfurada', 
    category: Category.LargeFormat, 
    description: 'Ideal para zonas de vento forte e fachadas de edifícios. Permite a passagem do ar sem comprometer a visibilidade.', 
    basePrice: 22.00, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', 
    badge: 'PRO',
    specs: { weight: '350g/m2', durability: '3 Anos', usage: 'Andaimos / Fachadas', weatherResistance: 100, ecoLevel: 10, precisionLevel: 'Industrial' }
  },
  { 
    id: 'lf-03', 
    name: 'Alumínio Dibond 3mm', 
    category: Category.LargeFormat, 
    description: 'Sinalética rígida premium. Núcleo de polietileno entre chapas de alumínio. Estabilidade térmica absoluta.', 
    basePrice: 75.00, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1626606103904-4ec58145781a?q=80&w=1200',
    badge: 'PRO',
    specs: { weight: '3.8kg/m2', durability: '10 Anos+', usage: 'Fachadas / Decor', weatherResistance: 100, ecoLevel: 40, precisionLevel: 'Corte Laser' }
  },
  { 
    id: 'lf-04', 
    name: 'Vinil Adesivo Monomérico', 
    category: Category.LargeFormat, 
    description: 'Vinil de alta aderência para superfícies planas. Cores vibrantes com secagem UV instantânea.', 
    basePrice: 12.50, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1614202241590-99c0a294710d?q=80&w=1200',
    badge: 'QUENTE',
    specs: { weight: '100μm', durability: '2 Anos', usage: 'Montras / Paredes', weatherResistance: 80, ecoLevel: 10, precisionLevel: 'High Precision' }
  },

  // PEQUENO FORMATO / COMERCIAL
  { 
    id: 'sf-01', 
    name: 'Cartões Silk 400g + Verniz 3D', 
    category: Category.SmallFormat, 
    description: 'Cartão de luxo com revestimento de seda e verniz localizado. Calibração cromática via motor Quantum.', 
    basePrice: 0.18, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200',
    badge: 'BEST',
    specs: { weight: '400g Silk', durability: 'Premium', usage: 'Networking', weatherResistance: 5, ecoLevel: 65, precisionLevel: 'Ultra-Fine' }
  },
  { 
    id: 'sf-02', 
    name: 'Flyers Reciclados 150g', 
    category: Category.SmallFormat, 
    description: 'Comunicação em massa eco-responsável. Papel 100% reciclado com textura natural elegante.', 
    basePrice: 0.05, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1619551734325-81aac64e7dff?q=80&w=1200',
    badge: 'ECO',
    specs: { weight: '150g Eco', durability: 'Standard', usage: 'Promoção', weatherResistance: 2, ecoLevel: 100, precisionLevel: 'Standard' }
  },
  { 
    id: 'sf-03', 
    name: 'Livro Portfólio Capa Dura', 
    category: Category.CommercialPrint, 
    description: 'Apresentação de prestígio. Capa rígida de 2.5mm, encadernação térmica e papéis de 170g.', 
    basePrice: 28.00, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200',
    badge: 'PRO',
    specs: { weight: 'Premium Bound', durability: 'Arquivo', usage: 'Apresentações', weatherResistance: 5, ecoLevel: 70, precisionLevel: 'Artesanal' }
  },
  { 
    id: 'sf-04', 
    name: 'Catálogo de Produtos A4', 
    category: Category.CommercialPrint, 
    description: 'Brochuras multi-página com lombada colada (PUR). Fidelidade extrema às cores originais.', 
    basePrice: 3.50, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=1200',
    badge: 'QUENTE',
    specs: { weight: '250g/135g', durability: 'Alta', usage: 'Vendas', weatherResistance: 5, ecoLevel: 60, precisionLevel: 'Offset Digital' }
  },

  // EMBALAGENS
  { 
    id: 'pk-01', 
    name: 'Caixa Envio Eco-Kraft', 
    category: Category.Packaging, 
    description: 'Engenharia de proteção sustentável. Cartão canelado de alta resistência sem plásticos.', 
    basePrice: 1.10, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=1200',
    badge: 'ECO',
    specs: { weight: 'Micro-Canelado', durability: 'Estrutural', usage: 'E-commerce', weatherResistance: 15, ecoLevel: 100, precisionLevel: 'Industrial' }
  },
  { 
    id: 'pk-02', 
    name: 'Sacos de Papel Industrial', 
    category: Category.Packaging, 
    description: 'Sacos reforçados para retail com pega em cordão de algodão. Impressão total em quadricromia.', 
    basePrice: 0.85, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1528698851214-41da9281a85c?q=80&w=1200',
    badge: 'NOVO',
    specs: { weight: '220g Kraft', durability: 'Média', usage: 'Lojas / Eventos', weatherResistance: 10, ecoLevel: 90, precisionLevel: 'Vibrant' }
  },

  // TÊXTIL / BRINDES
  { 
    id: 'tx-01', 
    name: 'Tote Bag Algodão Orgânico', 
    category: Category.Textile, 
    description: 'Personalização via DTF de alta definição. Tecido de 200g resistente a múltiplas lavagens.', 
    basePrice: 3.20, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970c8a?q=80&w=1200',
    badge: 'ECO',
    specs: { weight: '200g Algodão', durability: 'Elevada', usage: 'Branding', weatherResistance: 40, ecoLevel: 100, precisionLevel: 'DTF 1440dpi' }
  },
  { 
    id: 'tx-02', 
    name: 'T-Shirt Premium Algodão', 
    category: Category.Textile, 
    description: 'Corte moderno e toque suave. Impressão digital direta (DTG) ou serigrafia industrial.', 
    basePrice: 8.50, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200',
    badge: 'QUENTE',
    specs: { weight: '190g Jersey', durability: 'Elevada', usage: 'Merchandising', weatherResistance: 30, ecoLevel: 80, precisionLevel: 'Soft Hand' }
  },

  // SMART SOLUTIONS
  { 
    id: 'ss-01', 
    name: 'Cartão de Visita NFC Metal', 
    category: Category.SmartSolution, 
    description: 'O futuro do networking. Aço inoxidável com chip NTAG213 e gravação laser de precisão.', 
    basePrice: 15.00, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200',
    badge: 'PRO',
    specs: { weight: '0.8mm Aço', durability: 'Eterna', usage: 'VIP Networking', weatherResistance: 100, ecoLevel: 30, precisionLevel: 'Nano-Laser' }
  }
];

export const MOCK_JOBS: ProductionJob[] = [
  { id: 'RL-1024', client: 'SpaceX EU', product: 'Lona Mesh Giga', status: 'Impressão', priority: true, deadline: 'Hoje', timestamp: Date.now() - 3600000, value: '1.250,00', material: 'Lona Mesh Pro', finish: 'Ilhós Perimetral', dimensions: '10.0x5.0m', quantity: '1', progress: 60 },
  { id: 'RL-1025', client: 'Tesla Berlim', product: 'Caixas E-Commerce', status: 'Orçamento Gerado', priority: true, deadline: 'Urgente', timestamp: Date.now() - 7200000, value: '2.890,00', material: 'Papel Kraft 440g', finish: 'Die-Cut Digital', dimensions: '30x20x10cm', quantity: '500', progress: 10 }
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TK-4412', subject: 'Ajuste de Cor Pantone 485C', category: 'Técnico', status: 'Em Análise', priority: 'Alta', timestamp: Date.now() - 86400000 }
];
