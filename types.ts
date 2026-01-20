
export enum Category {
  SmallFormat = 'Pequeno Formato',
  LargeFormat = 'Grande Formato',
  CommercialPrint = 'Impressão Comercial',
  Textile = 'Têxtil e Brindes',
  Packaging = 'Embalagens',
  SmartSolution = 'Soluções Inteligentes'
}

export type Permission = 
  | 'VIEW_ORDERS' 
  | 'PLACE_ORDERS' 
  | 'APPROVE_BUDGETS' 
  | 'MANAGE_TEAM' 
  | 'ACCESS_BACKOFFICE';

export type UserRole = 
  | 'Cliente' 
  | 'B2B_Admin' 
  | 'B2B_Aprovador' 
  | 'B2B_Operador' 
  | 'B2B_Visualizador' 
  | 'Administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  company?: string;
  creditLimit?: number;
  address?: string;
  nif?: string;
  joinedAt: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Ativo' | 'Pendente' | 'Desativado';
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Técnico' | 'Faturação' | 'Logística' | 'Produção';
  status: 'Aberto' | 'Em Análise' | 'Resolvido';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'Confirmed' | 'Production' | 'Shipped' | 'Delivered';
  orderId: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  basePrice: number;
  unit: 'm2' | 'un' | 'pack';
  image: string;
  featured?: boolean;
}

export interface ProductionJob {
  id: string;
  client: string;
  product: string;
  status: 'Orçamento Gerado' | 'Pre-flight' | 'Impressão' | 'Acabamento' | 'Expedição' | 'Entregue';
  priority: boolean;
  deadline: string;
  timestamp: number;
  value: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  fileName?: string;
  quantity?: string;
  progress: number;
}
