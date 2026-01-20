
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
  Footprints,
  Compass,
  ZapOff,
  Wind,
  HardHat,
  Leaf,
  BaggageClaim,
  Library,
  CreditCard,
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
  'Industrial 350g (Mate)', 'Premium Silk Coated 400g', 'Reciclado Eco-Fibre 300g', 'Mate Anti-Reflexo UV 500g', 'Brilho High-Gloss 500g', 'PVC Rígido 5mm Branco', 'Lona Mesh Pro Micro-Perfurada', 'Vinil Cast 3D Automotivo', 'Papel Offset Superior 90g', 'Couché Brilho 135g', 'Papel Kraft Industrial 440g', 'Cartão Canelado Micro-E', 'Poliéster Técnico 180g (DTF)', 'Backlight Film Premium 200mic', 'Aço Inox Escovado 0.8mm', 'Bambu Sustentável Laminado', 'Alumínio Dibond 3mm'
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
  // GRANDE FORMATO (GRANDE PRENSA)
  { 
    id: 'lf-01', 
    name: 'Lona Frontlight Industrial', 
    category: Category.LargeFormat, 
    description: 'Publicidade de escala massiva. PVC de alta tenacidade com reforço interno de poliéster. Resistência extrema ao rasgo e intempéries.', 
    basePrice: 19.50, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=1200', 
    badge: 'BEST',
    specs: { weight: '510g/m2', durability: '5 Anos+', usage: 'Billboard Exterior', weatherResistance: 98, ecoLevel: 20, precisionLevel: 'Standard High' }
  },
  { 
    id: 'lf-02', 
    name: 'Vinil Microperfurado Window', 
    category: Category.LargeFormat, 
    description: 'Controlo de visibilidade unilateral. Película de PVC com perfurações calibradas para decoração de montras e frotas sem perder visibilidade interior.', 
    basePrice: 24.00, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1200',
    specs: { weight: '140μ PVC', durability: '3 Anos', usage: 'Montras / Vidro', weatherResistance: 85, ecoLevel: 30, precisionLevel: 'Sub-pixel' }
  },
  { 
    id: 'lf-03', 
    name: 'Alumínio Dibond 3mm', 
    category: Category.LargeFormat, 
    description: 'O suporte definitivo para sinalética rígida. Núcleo de polietileno entre duas chapas de alumínio. Estabilidade térmica e planicidade absoluta.', 
    basePrice: 75.00, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200',
    badge: 'PRO',
    specs: { weight: '3.8kg/m2', durability: '10 Anos+', usage: 'Fachadas / Decor', weatherResistance: 100, ecoLevel: 40, precisionLevel: 'Corte Laser' }
  },
  { 
    id: 'lf-04', 
    name: 'Roll-Up Bambu Sustentável', 
    category: Category.LargeFormat, 
    description: 'Comunicação eco-consciente. Estrutura de bambu maciço com lona de fibra reciclada. Impacto visual máximo com pegada ecológica mínima.', 
    basePrice: 62.00, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9?q=80&w=1200',
    badge: 'ECO',
    specs: { weight: 'Orgânico', durability: 'Modular', usage: 'Eventos / POS', weatherResistance: 20, ecoLevel: 100, precisionLevel: 'Premium' }
  },

  // PEQUENO FORMATO (PRENSA DE PRECISÃO)
  { 
    id: 'sf-01', 
    name: 'Cartões de Visita Silk 400g', 
    category: Category.SmallFormat, 
    description: 'Cartão de luxo com revestimento de seda. Calibração cromática via motor Quantum para reprodução perfeita da identidade corporativa.', 
    basePrice: 0.12, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1593005517304-1813914ad73f?q=80&w=1200',
    badge: 'BEST',
    specs: { weight: '400g Silk', durability: 'Alta Rigidez', usage: 'Networking', weatherResistance: 5, ecoLevel: 65, precisionLevel: 'Ultra-Fino' }
  },
  { 
    id: 'sf-02', 
    name: 'Folhetos Promocionais 135g', 
    category: Category.CommercialPrint, 
    description: 'Distribuição massiva com qualidade industrial. Papel couché de alta brancura disponível em acabamento brilho ou mate.', 
    basePrice: 0.05, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=1200',
    specs: { weight: '135g Couché', durability: 'Efêmera', usage: 'Retalho / Eventos', weatherResistance: 0, ecoLevel: 80, precisionLevel: 'Alta Velocidade' }
  },
  { 
    id: 'sf-03', 
    name: 'Livro de Portfólio Capa Dura', 
    category: Category.CommercialPrint, 
    description: 'Apresentação de prestígio. Capa rígida de 2.5mm, encadernação térmica e papéis interiores de 170g para impacto visual duradouro.', 
    basePrice: 28.00, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200',
    badge: 'QUENTE',
    specs: { weight: 'Premium Bound', durability: 'Arquivo', usage: 'Apresentações', weatherResistance: 5, ecoLevel: 70, precisionLevel: 'Artesanal' }
  },

  // PACKAGING E SMART
  { 
    id: 'pk-01', 
    name: 'Caixa de Envio Eco-Kraft', 
    category: Category.Packaging, 
    description: 'Engenharia de proteção sustentável. Cartão canelado de alta resistência com design de montagem instantânea sem fitas plásticas.', 
    basePrice: 1.10, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200',
    badge: 'ECO',
    specs: { weight: 'Micro-Canelado', durability: 'Estrutural', usage: 'E-commerce', weatherResistance: 15, ecoLevel: 100, precisionLevel: 'Industrial' }
  },
  { 
    id: 'sl-01', 
    name: 'Cartão Metal NFC Black', 
    category: Category.SmartSolution, 
    description: 'Hardware de identidade. Aço inoxidável escovado com chip NFC NXP integrado. O futuro da conectividade física para elite corporativa.', 
    basePrice: 18.00, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200',
    badge: 'PRO',
    specs: { weight: 'Aço 0.8mm', durability: 'Vitalícia', usage: 'Identidade Digital', weatherResistance: 95, ecoLevel: 10, precisionLevel: 'Laser Fibra' }
  }
];

export const MOCK_JOBS: ProductionJob[] = [
  { id: 'RL-1024', client: 'SpaceX EU', product: 'Lona Mesh Giga', status: 'Impressão', priority: true, deadline: 'Hoje', timestamp: Date.now() - 3600000, value: '1.250,00', material: 'Lona Mesh Pro', finish: 'Ilhós Perimetral', dimensions: '10.0x5.0m', quantity: '1', progress: 60 },
  { id: 'RL-1025', client: 'Tesla Berlim', product: 'Caixas E-Commerce', status: 'Acabamento', priority: true, deadline: 'Urgente', timestamp: Date.now() - 7200000, value: '2.890,00', material: 'Papel Kraft 440g', finish: 'Die-Cut Digital', dimensions: '30x20x10cm', quantity: '500', progress: 85 }
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TK-4412', subject: 'Ajuste de Cor Pantone 485C', category: 'Técnico', status: 'Em Análise', priority: 'Alta', timestamp: Date.now() - 86400000 }
];

export const FEATURES = [
  { icon: <Zap className="w-6 h-6" />, title: 'Motor Quantum', text: 'Cálculo de custos instantâneo via algoritmos de área.' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Validação Atómica', text: 'Pre-flight molecular de ficheiros para erro zero.' },
  { icon: <Globe className="w-6 h-6" />, title: 'Logística Global', text: 'Integração direta com DHL Express e FedEx Priority.' },
  { icon: <Activity className="w-6 h-6" />, title: 'Monitorização em Tempo Real', text: 'Acompanhe a sua produção industrial ao segundo.' }
];
