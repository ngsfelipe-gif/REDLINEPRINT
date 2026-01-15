
export enum Category {
  SmallFormat = 'Pequeno Formato',
  LargeFormat = 'Grande Formato',
  Textile = 'Têxtil e Brindes',
  Packaging = 'Embalagens'
}

export type UserRole = 'Client' | 'B2B' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  company?: string;
  creditLimit?: number;
  address?: string;
  nif?: string;
  joinedAt: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Técnico' | 'Faturação' | 'Logística' | 'Produção';
  status: 'Aberto' | 'Em Análise' | 'Resolvido';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  basePrice: number;
  unit: 'm2' | 'un';
  image: string;
  featured?: boolean;
}

export interface ProductionJob {
  id: string;
  client: string;
  product: string;
  status: 'Orçamento Gerado' | 'Pre-flight' | 'Impressão' | 'Acabamento' | 'Expedição';
  priority: boolean;
  deadline: string;
  timestamp: number;
  value: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  fileName?: string;
  quantity?: string;
  progress: number; // 0-100 para real-time status
}
