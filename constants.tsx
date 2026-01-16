
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
  Cpu
} from 'lucide-react';

export const COLORS = {
  primary: '#CC0000',
  black: '#0A0A0A',
  white: '#FFFFFF',
};

export const MATERIALS = [
  'Padrão Industrial 350g (Fosco)', 'Premium Silk Coated 400g', 'Reciclado Eco-Fibre 300g', 'Fosco Anti-Reflexo UV 500g', 'Brilho High-Gloss 500g', 'PVC Rígido 5mm Branco', 'Lona Mesh Pro Micro-Perfurada', 'Vinil Cast 3D Automotivo', 'Papel Offset Superior 90g', 'Couche Brilho 135g'
];

export const FINISHES = [
  'Sem Acabamento (Corte Bruto)', 'Corte Reto Laser de Precisão', 'Corte Especial (Die-Cut Digital)', 'Ilhós Perimetral Reforçado 15mm', 'Verniz Localizado 3D High-Build', 'Plastificação Mate Soft-Touch', 'Laminagem Anti-Graffiti', 'Dobra em Cruz (Flyers)', 'Dobra em Janela (Trifold)'
];

export interface ExtendedProduct extends Product {
  specs: {
    weight: string;
    durability: string;
    usage: string;
  };
}

export const PRODUCTS: ExtendedProduct[] = [
  { 
    id: '1', 
    name: 'Lona Frontlight 510g', 
    category: Category.LargeFormat, 
    description: 'Resistência extrema para outdoors e publicidade de grande escala com tratamento anti-UV e brilho controlado.', 
    basePrice: 19.38, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=1200', 
    featured: true,
    specs: { weight: '510g/m2', durability: '5 Anos+', usage: 'Exterior/Outdoor' }
  },
  { 
    id: '12', 
    name: 'Cartões Visita Elite', 
    category: Category.SmallFormat, 
    description: 'Papel Mate Premium com corte laser de alta precisão e tecnologia de impressão molecular para cores vibrantes.', 
    basePrice: 0.15, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1593005517304-1813914ad73f?q=80&w=1200', 
    featured: true,
    specs: { weight: '400g/m2', durability: 'Eterna', usage: 'Networking Pro' }
  },
  { 
    id: '20', 
    name: 'Flyers A5 Express', 
    category: Category.CommercialPrint, 
    description: 'A solução perfeita para promoções rápidas. Impressão offset de alta velocidade em papel couche brilhante de 135g.', 
    basePrice: 0.08, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200',
    specs: { weight: '135g/m2', durability: 'Curta', usage: 'Promoções' }
  },
  { 
    id: '21', 
    name: 'Folhetos Trifold Pro', 
    category: Category.CommercialPrint, 
    description: 'Brochuras tri-dobradas para apresentações de produto detalhadas. Acabamento mate com vincos de alta precisão.', 
    basePrice: 0.45, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1586075010633-2470bb201c43?q=80&w=1200',
    specs: { weight: '250g/m2', durability: 'Média', usage: 'Marketing' }
  },
  { 
    id: '22', 
    name: 'Papel Timbrado A4', 
    category: Category.CommercialPrint, 
    description: 'Identidade corporativa consistente. Papel offset premium de 90g compatível com impressoras laser e jacto de tinta.', 
    basePrice: 0.12, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200',
    specs: { weight: '90g/m2', durability: 'Longa', usage: 'Escritório' }
  },
  { 
    id: '5', 
    name: 'Vinil Monomérico Pro', 
    category: Category.LargeFormat, 
    description: 'Aplicações planas com adesivo tecnológico blockout. Ideal para sinalética de curto-médio prazo e promoções.', 
    basePrice: 19.38, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1200', 
    featured: true,
    specs: { weight: '100mic', durability: '3 Anos', usage: 'Montras/Paredes' }
  },
  { 
    id: '7', 
    name: 'Vinil Cast UV 3D', 
    category: Category.LargeFormat, 
    description: 'Moldagem extrema em curvas de viaturas. Tecnologia Easy-Apply para evitar bolhas durante a aplicação.', 
    basePrice: 47.50, 
    unit: 'm2', 
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200',
    specs: { weight: '80mic', durability: '7 Anos', usage: 'Frotas/Veículos' }
  },
  { 
    id: '14', 
    name: 'Folders Corporativos', 
    category: Category.SmallFormat, 
    description: 'Dossiers com bolsas duplas e acabamento de luxo laminado. Apresentação profissional para propostas de valor.', 
    basePrice: 1.20, 
    unit: 'un', 
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=1200',
    specs: { weight: '350g/m2', durability: 'Alta', usage: 'Corporate' }
  }
];

export const MOCK_JOBS: ProductionJob[] = [
  { id: 'RL-1024', client: 'SpaceX EU', product: 'Lona Mesh Giga', status: 'Impressão', priority: true, deadline: 'Hoje', timestamp: Date.now() - 3600000, value: '1,250.00', material: 'Lona Mesh Pro', finish: 'Ilhós Perimetral', dimensions: '10.0x5.0m', quantity: '1', progress: 60 },
  { id: 'RL-1025', client: 'Tesla Berlin', product: 'Vinil Cast 3D', status: 'Acabamento', priority: true, deadline: 'Urgente', timestamp: Date.now() - 7200000, value: '890.00', material: 'Vinil Cast UV', finish: 'Corte Especial', dimensions: '15.0x1.2m', quantity: '1', progress: 85 },
  { id: 'RL-1026', client: 'Nike Lisbon', product: 'Flyers Premium', status: 'Expedição', priority: false, deadline: 'Hoje', timestamp: Date.now() - 10800000, value: '450.00', material: 'Premium Silk 135g', finish: 'Corte Reto', dimensions: 'A5', quantity: '5000', progress: 100 }
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TK-4412', subject: 'Ajuste de Cor Pantone 485C', category: 'Técnico', status: 'Em Análise', priority: 'Alta', timestamp: Date.now() - 86400000 },
  { id: 'TK-4415', subject: 'Erro na Morada de Entrega', category: 'Logística', status: 'Resolvido', priority: 'Normal', timestamp: Date.now() - 172800000 }
];

export const FEATURES = [
  { icon: <Zap className="w-6 h-6" />, title: 'Motor Quantum', text: 'Cálculo de custos instantâneo via algoritmos de área.' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Validação Atómica', text: 'Pre-flight molecular de ficheiros para erro zero.' },
  { icon: <Globe className="w-6 h-6" />, title: 'Logística Global', text: 'Integração direta com DHL Express e FedEx Priority.' },
  { icon: <Activity className="w-6 h-6" />, title: 'Real-time Feed', text: 'Monitorização ao vivo da sua produção industrial.' }
];
