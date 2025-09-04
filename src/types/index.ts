export interface User {
  id: number;
  name: string;
  email: string;
  cpf_cnpj: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: string;
  longitude?: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  cpf_cnpj: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  sectors?: Sector[]; // Relacionamento com setores
}

export interface Sector {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Enterprise {
  id: number;
  name: string;
  logo: string;
  color_primary: string;
  color_background: string;
  color_text: string;
  color_icon: string;
  color_tabIconDefault: string;
  color_tabIconSelected: string;
  color_tint: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  image?: string;
  category_id?: number; // Mantido para compatibilidade
  sector_id: number;
  page?: string;
  show_in_dashboard: boolean;
  order: number;
  needs_attachment?: boolean;
  needs_address?: boolean;
  needs_phone?: boolean;
  needs_birth_date?: boolean;
  needs_cpf_cnpj?: boolean;
  needs_email?: boolean;
  created_at: string;
  updated_at: string;
  category?: Category; // Mantido para compatibilidade
  categories?: Category[]; // Nova propriedade para múltiplas categorias
  sector?: Sector;
  types?: Type[];
  manifests_count?: number;
}

export interface Category {
  id: number;
  name: string;
  type_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  services?: Service[];
  type?: Type;
}

export interface Type {
  id: number;
  name: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interfaces para o Sistema de Gerenciamento de Senhas
export interface Queue {
  id: number;
  name: string;
  priority: number;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  locations?: Location[];
}

export interface Location {
  id: number;
  name: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  queues?: Queue[];
}

export interface CreateLocationData {
  name: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
  is_active?: boolean;
  queues?: number[];
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

export interface Desk {
  id: number;
  name: string;
  number: string;
  location_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface Ticket {
  id: number;
  number?: string;
  queue_id: number;
  location_id: number;
  desk_id?: number;
  user_id?: number;
  status: 'called' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  in_call?: boolean;
  created_at: string;
  updated_at: string;
  queue?: Queue;
  location?: Location;
  desk?: Desk;
  user?: User;
}

// Interface para tickets no histórico (com propriedades adicionais)
export interface TicketHistoryEntry extends Ticket {
  removed_at?: string;
  removed_reason?: string;
  is_current?: boolean;
}

// Filtros para as novas entidades
export interface QueueFilters {
  name?: string;
  priority?: number;
  is_active?: boolean;
}

export interface LocationFilters {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active?: boolean;
}

export interface DeskFilters {
  name?: string;
  number?: string;
  status?: string;
  location_id?: number;
}

export interface TicketFilters {
  queue_id?: number;
  location_id?: number;
  desk_id?: number;
  user_id?: number;
  status?: string;
  priority?: string;
  with_desk?: boolean;
}

export interface Manifest {
  id: number;
  user_id?: number; // Opcional agora
  admin_id: number; // Obrigatório - admin responsável
  service_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  origin?: 'phone' | 'in_person' | 'mobile_office' | 'internal_document';
  type?: 'information_access' | 'report' | 'complaint' | 'request' | 'simplify' | 'praise' | 'suggestion';
  avaliation?: number;
  cpf_cnpj?: string;
  name?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  description: string;
  zip_code?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  delivery_forecast_date?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  admin?: Admin; // Admin responsável
  service?: Service;
  attachments?: ManifestAttachment[];
}

export interface ManifestAttachment {
  id: number;
  manifest_id: number;
  name: string;
  path: string;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface LoginCredentials {
  email?: string;
  cpf_cnpj?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf_cnpj: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface ApiResponse<T> {
  data: T;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface ApiMessageResponse {
  message: string;
  data?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface FileUploadConfig {
  maxFiles?: number;
  maxSizePerFile?: number; // em MB
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

// Configuração padrão para anexos de manifestos
export const MANIFEST_ATTACHMENT_CONFIG: FileUploadConfig = {
  maxFiles: 5,
  maxSizePerFile: 50, // 50MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip'
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.csv', '.xlsx', '.ppt', '.pptx', '.zip']
}

// Configuração para upload de imagens de tipos
export const TYPE_IMAGE_CONFIG: FileUploadConfig = {
  maxFiles: 1,
  maxSizePerFile: 5, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
}

// Configuração para upload de imagens de serviços
export const SERVICE_IMAGE_CONFIG: FileUploadConfig = {
  maxFiles: 1,
  maxSizePerFile: 5, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
}

export interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  progress?: number;
  error?: string;
  uploaded?: boolean;
}

// Novos tipos para filtros avançados
export interface ManifestFilters {
  status?: string;
  user_id?: number;
  admin_id?: number;
  service_id?: number;
  origin?: string;
  type?: string;
  description?: string;
  zip_code?: string;
  address?: string;
  city?: string;
  cpf_cnpj?: string;
  name?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
}

export interface ServiceFilters {
  type_id?: number;
  category_id?: number;
  sector_id?: number;
  show_in_dashboard?: boolean;
  name?: string;
}

export interface CategoryFilters {
  name?: string;
  service_id?: number;
  type_id?: number;
  is_active?: boolean;
}

export interface TypeFilters {
  name?: string;
  is_active?: boolean;
}

export interface UserFilters {
  name?: string;
  email?: string;
  cpf_cnpj?: string;
  phone?: string;
  birth_date?: string;
}

export interface AdminFilters {
  search?: string; // Busca em nome, email ou CPF/CNPJ
}

// Resposta de login que pode ser tanto usuário quanto admin
export interface LoginResponse {
  token: string;
  user?: User;
  admin?: Admin;
  message?: string;
}

// Resposta de atualização de manifesto com anexos
export interface ManifestWithAttachmentsResponse {
  message: string;
  data: Manifest;
}

// Resposta de anexo criado
export interface AttachmentResponse {
  message: string;
  data: ManifestAttachment;
}

// Tipos para comentários de manifestos
export interface ManifestComment {
  id: number;
  manifest_id: number;
  user_id?: number;
  admin_id?: number;
  comment: string;
  attachment?: string;
  status: 'public' | 'private';
  created_at: string;
  updated_at: string;
  user?: User;
  admin?: Admin;
  attachment_url?: string;
  // Campos de permissão retornados pela API
  can_edit: boolean;
  can_delete: boolean;
  is_deleted: boolean;
}

export interface CreateCommentData {
  manifest_id: number;
  comment: string;
  attachment?: File;
  status?: 'public' | 'private';
}

export interface UpdateCommentData {
  comment?: string;
  attachment?: File;
  status?: 'public' | 'private';
}

export interface CommentResponse {
  message: string;
  data: ManifestComment;
}

// Interfaces para Layouts de Tela de Fila
export interface ScreenLayout {
  id: number;
  name: string;
  template: 'template1' | 'template2' | 'template3' | 'template4';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    highlight: string;
  };
  images: {
    logo?: string;
    background?: string;
    promotional?: string;
  };
  settings: {
    showLogo: boolean;
    showBackground: boolean;
    showPromotional: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    showCurrentTicket: boolean;
    showTicketHistory: boolean;
    showCounterInfo: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScreenLayoutData {
  name: string;
  template: 'template1' | 'template2' | 'template3' | 'template4';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    highlight: string;
  };
  images: {
    logo?: string;
    background?: string;
    promotional?: string;
  };
  settings: {
    showLogo: boolean;
    showBackground: boolean;
    showPromotional: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    showCurrentTicket: boolean;
    showTicketHistory: boolean;
    showCounterInfo: boolean;
  };
  is_active?: boolean;
}

export interface UpdateScreenLayoutData extends Partial<CreateScreenLayoutData> {}

// Interface para Imagens
export interface ImageAsset {
  id: number;
  name: string;
  filename: string;
  url: string;
  type: 'logo' | 'background' | 'promotional' | 'other';
  size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateImageAssetData {
  name: string;
  file: File;
  type: 'logo' | 'background' | 'promotional' | 'other';
}

export interface UpdateImageAssetData {
  name?: string;
  type?: 'logo' | 'background' | 'promotional' | 'other';
}

// Interface para Imagens do Carrossel
export interface DisplayCarouselImage {
  id: number;
  path: string;
  name: string;
  order: number;
  is_active: boolean;
  url?: string; // URL processada pelo backend
  created_at: string;
  updated_at: string;
}

export interface CreateCarouselImageData {
  file: File | string; // File ou base64
  order?: number;
}

// Interfaces para Display (Monitores)
export interface Display {
  id: number;
  name: string;
  template: string;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
  color_accent: string;
  color_highlight: string;
  image_logo?: string;
  desk_name: string;
  show_logo: boolean;
  show_carrosel: boolean;
  show_location_name: boolean;
  show_desk_name: boolean;
  show_ticket_history: boolean;
  show_queue_name: boolean;
  show_date: boolean;
  show_time: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  carousel_images?: DisplayCarouselImage[];
}

export interface CreateDisplayData {
  name: string;
  template: string;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
  color_accent: string;
  color_highlight: string;
  image_logo?: File;
  desk_name: string;
  show_logo: boolean;
  show_carrosel: boolean;
  show_location_name: boolean;
  show_desk_name: boolean;
  show_ticket_history: boolean;
  show_queue_name: boolean;
  show_date: boolean;
  show_time: boolean;
  is_active?: boolean;
  carousel_images?: CreateCarouselImageData[];
}

export interface UpdateDisplayData extends Partial<CreateDisplayData> {}

export interface DisplayFilters {
  is_active?: boolean;
  template?: string;
  name?: string;
}

// Interfaces para Device (Dispositivos)
export interface Device {
  id: number;
  name: string;
  token: string;
  location_id: number;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface CreateDeviceData {
  name: string;
  token: string;
  location_id: number;
}

export interface UpdateDeviceData extends Partial<CreateDeviceData> {}

export interface DeviceFilters {
  name?: string;
  location_id?: number;
}

// Configuração para upload de imagens de displays
export const DISPLAY_IMAGE_CONFIG: FileUploadConfig = {
  maxFiles: 1,
  maxSizePerFile: 5, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
}

// Configuração para upload de imagens do carrossel
export const DISPLAY_CAROUSEL_CONFIG: FileUploadConfig = {
  maxFiles: 10, // Máximo 10 imagens no carrossel
  maxSizePerFile: 5, // 5MB por imagem
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
}
