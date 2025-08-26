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
  category_id: number;
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
  category?: Category;
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

export interface Manifest {
  id: number;
  user_id?: number; // Opcional agora
  admin_id: number; // Obrigatório - admin responsável
  service_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
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
