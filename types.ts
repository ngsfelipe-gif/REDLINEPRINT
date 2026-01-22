
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
  | 'MANAGE_CATALOG'
  | 'HUB_ANALYTICS'
  | 'CREATE_PRODUCTS';

export type UserRole = 
  | 'Cliente' 
  | 'B2B_Admin' 
  | 'Administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions: Permission[];
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  joinedAt: number;
  managedHubId?: string; // Para B2B_Admin
  createdByHubId?: string; // Para clientes criados por Hubs
}

export interface HubRegistrationRequest {
  id: string;
  companyName: string;
  email: string;
  location: string;
  machinePark: string;
  timestamp: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
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
  ownerId: string;
  tempPassword?: string; 
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

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Técnico' | 'Faturação' | 'Logística' | 'Produção';
  status: 'Aberto' | 'Em Análise' | 'Resolvido';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  timestamp: number;
  messages: any[];
  creatorId: string;
  targetHubId?: string; 
}

// Added Notification interface for the global notification system
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'System' | 'Order' | 'Alert' | 'Message';
}

export interface ExtendedProduct {
  id: string;
  name: string;
  category: Category;
  description: string;
  basePrice: number;
  unit: string;
  image: string;
  status: 'Ativo' | 'Aguardando Aprovação';
  ownerHubId: string; // 'SYSTEM' ou ID do Hub
  // Updated specs to include all properties used in constants.tsx
  specs: {
    weight: string;
    durability: string;
    precisionLevel: string;
    usage?: string;
    weatherResistance?: number;
    ecoLevel?: number;
  };
}
