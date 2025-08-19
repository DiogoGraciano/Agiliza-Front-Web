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
  is_admin?: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  service_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service?: Service;
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
  user_id: number;
  service_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  zip_code: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: string;
  longitude?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  service?: Service;
  attachments?: ManifestAttachment[];
}

export interface ManifestAttachment {
  id: number;
  manifest_id: number;
  path: string;
  created_at: string;
  updated_at: string;
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
