
export enum Category {
  SmallFormat = 'Pequeno Formato',
  LargeFormat = 'Grande Formato',
  CommercialPrint = 'Impressão Comercial',
  Textile = 'Têxtil e Brindes',
  Packaging = 'Embalagens',
  SmartSolution = 'Soluções Inteligentes',
  OfficeSupplies = 'Escritório e Papelaria',
  Events = 'Eventos e Exposição'
}

export type Permission = 
  | 'VIEW_ORDERS' 
  | 'PLACE_ORDERS' 
  | 'APPROVE_BUDGETS' 
  | 'MANAGE_TEAM' 
  | 'MANAGE_CATALOG'
  | 'MANAGE_HUBS'
  | 'MANAGE_USERS'
  | 'ACCESS_BACKOFFICE';

export type UserRole = 
  | 'Cliente' 
  | 'B2B_Admin' 
  | 'B2B_Operador' 
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
  creditUsed?: number;
  joinedAt: number;
}

export interface PartnerNode {
  id: string;
  name: string;
  location: string;
  specialization: Category[];
  status: 'Online' | 'Busy' | 'Maintenance';
  capacity: number;
  latency: string;
  image: string;
  description: string;
  ownerId?: string; // ID do B2B Admin ou 'SYSTEM'
}

export interface ExtendedProduct {
  id: string;
  name: string;
  category: Category;
  description: string;
  basePrice: number;
  unit: 'm2' | 'un' | 'pack';
  image: string;
  badge?: 'NOVO' | 'ECO' | 'BEST' | 'PRO' | 'QUENTE';
  specs: {
    weight: string;
    durability: string;
    usage: string;
    weatherResistance?: number;
    ecoLevel?: number;
    precisionLevel?: string;
  };
}

export interface ProductionJob {
  id: string;
  client: string;
  clientId: string;
  product: string;
  status: 'Orçamento Gerado' | 'Pre-flight' | 'Impressão' | 'Acabamento' | 'Expedição' | 'Entregue';
  priority: boolean;
  deadline: string;
  timestamp: number;
  value: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  quantity?: string;
  progress: number;
  nodeId?: string;
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

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Técnico' | 'Faturação' | 'Logística' | 'Produção';
  status: 'Aberto' | 'Em Análise' | 'Resolvido';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  timestamp: number;
  messages: TicketMessage[];
  creatorId: string;
  orderId?: string;
}
