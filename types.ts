
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
  | 'APPROVE_HUB_ORDERS' 
  | 'MANAGE_HUBS' 
  | 'MANAGE_USERS'
  | 'ACCESS_ADMIN_PANEL'
  | 'APPROVE_BUDGETS'
  | 'MANAGE_TEAM'
  | 'ACCESS_BACKOFFICE'
  | 'MANAGE_CATALOG';

export type UserRole = 
  | 'Cliente' 
  | 'B2B_Admin' 
  | 'Administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  company?: string;
  joinedAt: number;
  creditLimit?: number;
}

export interface PartnerNode {
  id: string;
  name: string;
  location: string;
  specialization: Category[];
  status: 'Online' | 'Busy' | 'Maintenance' | 'Aguardando Validação';
  capacity: number;
  latency: string;
  image: string;
  description: string;
  ownerId: string; // ID do B2B Admin
}

export interface ProductionJob {
  id: string;
  client: string;
  clientId: string;
  product: string;
  status: 'Pendente Aprovação Hub' | 'Orçamento Gerado' | 'Pre-flight' | 'Impressão' | 'Acabamento' | 'Expedição' | 'Entregue';
  priority: boolean;
  deadline: string;
  timestamp: number;
  value: string;
  material?: string;
  finish?: string;
  dimensions?: string;
  quantity?: string;
  progress: number;
  nodeId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'Confirmed' | 'Production' | 'Alert' | 'System';
  orderId?: string;
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

/**
 * Interface para os produtos no catálogo com detalhes técnicos estendidos.
 */
export interface ExtendedProduct {
  id: string;
  name: string;
  category: Category;
  description: string;
  basePrice: number;
  unit: string;
  image: string;
  badge?: string;
  specs: {
    weight: string;
    durability: string;
    usage: string;
    weatherResistance: number;
    ecoLevel: number;
    precisionLevel: string;
  };
}
