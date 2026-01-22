
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

export type Language = 'PT' | 'EN' | 'ES' | 'FR';

export interface ProductionLog {
  timestamp: number;
  status: string;
  author: string;
  note: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Cliente' | 'B2B_Admin' | 'Administrador';
  permissions: string[];
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  joinedAt: number;
  managedHubId?: string;
}

export interface SupportMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  timestamp: number;
  creatorId: string;
  targetHubId?: string; // Direcionado a um Hub específico
  messages: SupportMessage[];
}

export interface HubRegistrationRequest {
  id: string;
  companyName: string;
  email: string;
  location: string;
  machinePark: string;
  timestamp: number;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}

export interface AuthorizationRequest {
  id: string;
  type: 'DELETE_PRODUCT' | 'UPDATE_PRICE' | 'BLOCK_USER';
  requesterId: string;
  requesterName: string;
  targetId: string;
  details: string;
  timestamp: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface ProductionJob {
  id: string;
  client: string;
  clientId: string;
  product: string;
  status: 'Aguardando Aprovação' | 'Aprovado' | 'Em Produção' | 'Expedição' | 'Concluído';
  value: string;
  nodeId: string;
  progress: number;
  timestamp: number;
  material: string;
  finish: string;
  quantity: string;
  width?: string;
  height?: string;
  unit?: 'mm' | 'cm' | 'm';
  observations?: string;
  attachmentUrl?: string;
  fileName?: string;
  priority?: boolean;
  deadline?: string;
  dimensions?: string;
  history: ProductionLog[]; // Rastreabilidade industrial
}

export interface PartnerNode {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Busy' | 'Maintenance';
  capacity: number;
  latency: string;
  image: string;
  description: string;
  ownerId: string;
  specialization?: Category[];
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
  ownerHubId: string;
  badge?: string;
  specs: {
    weight: string;
    durability: string;
    precisionLevel: string;
    usage?: string;
    weatherResistance?: number;
    ecoLevel?: number;
  };
}
