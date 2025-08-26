import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User,
  Admin,
  Enterprise,
  Service,
  Category,
  Type,
  Manifest,
  ManifestAttachment,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  PaginatedResponse,
  ManifestFilters,
  ServiceFilters,
  CategoryFilters,
  TypeFilters,
  UserFilters,
  AdminFilters,
  ManifestWithAttachmentsResponse,
  AttachmentResponse,
  ManifestComment,
  CreateCommentData,
  UpdateCommentData,
  CommentResponse,
  Sector
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratamento de erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('admin');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticação de Administradores
  async adminLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/admin/login', credentials);
    return response.data;
  }

  async adminLogout(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/admin/logout');
    return response.data;
  }

  async getAdminProfile(): Promise<Admin> {
    const response: AxiosResponse<Admin> = await this.api.get('/admin/profile');
    return response.data;
  }

  async updateAdminProfile(data: Partial<Admin>): Promise<Admin> {
    const response: AxiosResponse<Admin> = await this.api.put('/admin/profile', data);
    return response.data;
  }

  // Empresa (endpoint público)
  async getEnterprise(): Promise<Enterprise | null> {
    try {
      const response: AxiosResponse<Enterprise> = await this.api.get('/enterprise');
      return response.data;
    } catch (error) {
      // Retorna null se não houver empresa cadastrada
      return null;
    }
  }

  async updateEnterprise(data: Partial<Enterprise>): Promise<{ message: string; data: Enterprise }> {
    const response: AxiosResponse<{ message: string; data: Enterprise }> = await this.api.put('/enterprise', data);
    return response.data;
  }

  // Administradores (Admin)
  async getAdmins(filters?: AdminFilters, page: number = 1): Promise<PaginatedResponse<Admin>> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append('search', filters.search);
    }

    params.append('page', page.toString());
    params.append('include', 'sectors'); // Incluir setores relacionados

    const url = `/admins?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<Admin>> = await this.api.get(url);
    return response.data;
  }

  async createAdmin(data: Omit<Admin, 'id' | 'created_at' | 'updated_at'> & { password: string; sectors?: number[] }): Promise<{ message: string; data: Admin }> {
    const response: AxiosResponse<{ message: string; data: Admin }> = await this.api.post('/admins', data);
    return response.data;
  }

  async getAdmin(id: number): Promise<Admin> {
    const params = new URLSearchParams();
    params.append('include', 'sectors'); // Incluir setores relacionados

    const url = `/admins/${id}?${params.toString()}`;
    const response: AxiosResponse<Admin> = await this.api.get(url);
    return response.data;
  }

  async updateAdmin(id: number, data: Partial<Admin> & { password?: string; sectors?: number[] }): Promise<{ message: string; data: Admin }> {
    const response: AxiosResponse<{ message: string; data: Admin }> = await this.api.put(`/admins/${id}`, data);
    return response.data;
  }

  async deleteAdmin(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/admins/${id}`);
    return response.data;
  }

  // Usuários (Admin)
  async getUsers(filters?: UserFilters, page: number = 1): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    params.append('page', page.toString());

    const url = `/users?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get(url);
    return response.data;
  }

  async createUser(data: Omit<RegisterData, 'password'> & { password: string }): Promise<{ message: string; data: User }> {
    const response: AxiosResponse<{ message: string; data: User }> = await this.api.post('/users', data);
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<{ message: string; data: User }> {
    const response: AxiosResponse<{ message: string; data: User }> = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Serviços
  async getServices(filters?: ServiceFilters, page: number = 1): Promise<PaginatedResponse<Service>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    params.append('page', page.toString());

    const url = `/services?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<Service>> = await this.api.get(url);
    return response.data;
  }

  async getServicesWithManifestCount(): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get('/services/with-manifest-count');
    return response.data;
  }

  async searchServices(query: string): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get(`/services/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getService(id: number): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.get(`/services/${id}`);
    return response.data;
  }

  async createService(data: FormData): Promise<{ message: string; data: Service }> {
    const response: AxiosResponse<{ message: string; data: Service }> = await this.api.post('/services', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateService(id: number, data: FormData): Promise<{ message: string; data: Service }> {
    const response: AxiosResponse<{ message: string; data: Service }> = await this.api.put(`/services/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteService(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/services/${id}`);
    return response.data;
  }

  // Categorias
  async getCategories(filters?: CategoryFilters, page: number = 1): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    params.append('page', page.toString());

    const url = `/categories?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<Category>> = await this.api.get(url);
    return response.data;
  }

  async getActiveCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get('/categories/active');
    return response.data;
  }

  async getCategoriesByService(serviceId: number): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get(`/categories/service/${serviceId}`);
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.get(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Category }> {
    const response: AxiosResponse<{ message: string; data: Category }> = await this.api.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<{ message: string; data: Category }> {
    const response: AxiosResponse<{ message: string; data: Category }> = await this.api.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/categories/${id}`);
    return response.data;
  }

  // Tipos
  async getTypes(filters?: TypeFilters, page: number = 1): Promise<PaginatedResponse<Type>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    params.append('page', page.toString());

    const url = `/types?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<Type>> = await this.api.get(url);
    return response.data;
  }

  async getActiveTypes(): Promise<Type[]> {
    const response: AxiosResponse<Type[]> = await this.api.get('/types/active');
    return response.data;
  }

  async getType(id: number): Promise<Type> {
    const response: AxiosResponse<Type> = await this.api.get(`/types/${id}`);
    return response.data;
  }

  async createType(formData: FormData): Promise<{ message: string; data: Type }> {
    const response: AxiosResponse<{ message: string; data: Type }> = await this.api.post('/types', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  async updateType(id: number, formData: FormData): Promise<{ message: string; data: Type }> {
    const response: AxiosResponse<{ message: string; data: Type }> = await this.api.put(`/types/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  async deleteType(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/types/${id}`);
    return response.data;
  }

  // Upload de imagem para tipo
  async uploadTypeImage(
    typeId: number,
    file: File,
    onProgress?: (progressEvent: any) => void
  ): Promise<{ message: string; data: { image_url: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<{ message: string; data: { image_url: string } }> = await this.api.post(`/types/${typeId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    });

    return response.data;
  }

  // Manifestos
  async getManifests(filters?: ManifestFilters, page: number = 1): Promise<PaginatedResponse<Manifest>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    params.append('page', page.toString());

    const url = `/manifests?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<Manifest>> = await this.api.get(url);
    return response.data;
  }

  async getManifest(id: number): Promise<Manifest> {
    const response: AxiosResponse<Manifest> = await this.api.get(`/manifests/${id}`);
    return response.data;
  }

  async createManifest(data: Omit<Manifest, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Manifest }> {
    const response: AxiosResponse<{ message: string; data: Manifest }> = await this.api.post('/manifests', data);
    return response.data;
  }

  // Criar manifesto com anexos
  async createManifestWithAttachments(
    manifestData: Omit<Manifest, 'id' | 'created_at' | 'updated_at'>,
    files: File[]
  ): Promise<ManifestWithAttachmentsResponse> {
    const formData = new FormData();

    // Adicionar dados do manifesto
    Object.entries(manifestData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Adicionar arquivos
    files.forEach((file, index) => {
      formData.append(`attachments[${index}][file]`, file);
    });

    const response: AxiosResponse<ManifestWithAttachmentsResponse> = await this.api.post('/manifests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  }

  async updateManifest(id: number, data: Partial<Manifest>): Promise<{ message: string; data: Manifest }> {
    const response: AxiosResponse<{ message: string; data: Manifest }> = await this.api.put(`/manifests/${id}`, data);
    return response.data;
  }

  // Atualizar manifesto com novos anexos
  async updateManifestWithAttachments(
    id: number,
    data: Partial<Manifest>,
    files?: File[]
  ): Promise<ManifestWithAttachmentsResponse> {
    const formData = new FormData();

    // Adicionar dados do manifesto
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Adicionar arquivos (se houver)
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`attachments[${index}][file]`, file);
      });
    }

    const response: AxiosResponse<ManifestWithAttachmentsResponse> = await this.api.put(`/manifests/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  }

  async deleteManifest(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/manifests/${id}`);
    return response.data;
  }

  async updateManifestStatus(id: number, status: string): Promise<{ message: string; data: Manifest }> {
    const response: AxiosResponse<{ message: string; data: Manifest }> = await this.api.patch(`/manifests/${id}/status`, { status });
    return response.data;
  }

  async setManifestAdmin(manifestId: number): Promise<{ message: string; data: Manifest }> {
    const response: AxiosResponse<{ message: string; data: Manifest }> = await this.api.post(`/manifests/${manifestId}/set-admin`);
    return response.data;
  }

  async changeDeliveryForecastDate(manifestId: number, deliveryForecastDate: string): Promise<{ message: string; data: Manifest }> {
    const response: AxiosResponse<{ message: string; data: Manifest }> = await this.api.patch(`/manifests/${manifestId}/change-delivery-forecast-date`, {
      delivery_forecast_date: deliveryForecastDate
    });
    return response.data;
  }

  // Anexos
  async getManifestAttachments(filters?: { manifest_id?: number }, page: number = 1): Promise<PaginatedResponse<ManifestAttachment>> {
    const params = new URLSearchParams();

    if (filters?.manifest_id) {
      params.append('manifest_id', filters.manifest_id.toString());
    }

    params.append('page', page.toString());

    const url = `/manifest-attachments?${params.toString()}`;
    const response: AxiosResponse<PaginatedResponse<ManifestAttachment>> = await this.api.get(url);
    return response.data;
  }

  async getAttachmentsByManifest(manifestId: number): Promise<ManifestAttachment[]> {
    const response: AxiosResponse<ManifestAttachment[]> = await this.api.get(`/manifest-attachments/manifest/${manifestId}`);
    return response.data;
  }

  async getAttachment(id: number): Promise<ManifestAttachment> {
    const response: AxiosResponse<ManifestAttachment> = await this.api.get(`/manifest-attachments/${id}`);
    return response.data;
  }

  async createAttachment(data: Omit<ManifestAttachment, 'id' | 'created_at' | 'updated_at'>): Promise<AttachmentResponse> {
    const response: AxiosResponse<AttachmentResponse> = await this.api.post('/manifest-attachments', data);
    return response.data;
  }

  async updateAttachment(id: number, data: Partial<ManifestAttachment>): Promise<{ message: string; data: ManifestAttachment }> {
    const response: AxiosResponse<{ message: string; data: ManifestAttachment }> = await this.api.put(`/manifest-attachments/${id}`, data);
    return response.data;
  }

  async deleteAttachment(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/manifest-attachments/${id}`);
    return response.data;
  }

  // Upload de anexo com FormData
  async uploadAttachment(
    manifestId: number,
    file: File,
    onProgress?: (progressEvent: any) => void
  ): Promise<AttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('manifest_id', manifestId.toString());

    const response: AxiosResponse<AttachmentResponse> = await this.api.post('/manifest-attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    });

    return response.data;
  }

  // Comentários de manifestos
  async getManifestComments(manifestId: number, page: number = 1): Promise<PaginatedResponse<ManifestComment>> {
    const response: AxiosResponse<PaginatedResponse<ManifestComment>> = await this.api.get(`/manifests/${manifestId}/comments?page=${page}`);
    return response.data;
  }

  async getComment(id: number): Promise<ManifestComment> {
    const response: AxiosResponse<ManifestComment> = await this.api.get(`/manifest-comments/${id}`);
    return response.data;
  }

  async createComment(data: CreateCommentData): Promise<CommentResponse> {
    const formData = new FormData();
    formData.append('manifest_id', data.manifest_id.toString());
    formData.append('comment', data.comment);

    if (data.status) {
      formData.append('status', data.status);
    }

    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    const response: AxiosResponse<CommentResponse> = await this.api.post(`/manifests/${data.manifest_id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  }

  async updateComment(id: number, data: UpdateCommentData): Promise<CommentResponse> {
    let response: AxiosResponse<CommentResponse>;

    if(data.attachment) {
      const formData = new FormData();

      if (data.comment) {
        formData.append('comment', data.comment);
      }

      if (data.status) {
        formData.append('status', data.status);
      }

      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }

      response = await this.api.put(`/manifest-comments/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    }
    else {
      response = await this.api.put(`/manifest-comments/${id}`, data);
    }

    return response.data;
  }

  async deleteComment(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/manifest-comments/${id}`);
    return response.data;
  }

  // Setores (Admin)
  async getSectors(): Promise<Sector[]> {
    const response: AxiosResponse<Sector[]> = await this.api.get('/sectors');
    return response.data;
  }

  async createSector(data: Omit<Sector, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Sector }> {
    const response: AxiosResponse<{ message: string; data: Sector }> = await this.api.post('/sectors', data);
    return response.data;
  }

  async getSector(id: number): Promise<Sector> {
    const response: AxiosResponse<Sector> = await this.api.get(`/sectors/${id}`);
    return response.data;
  }

  async updateSector(id: number, data: Partial<Omit<Sector, 'id' | 'created_at' | 'updated_at'>>): Promise<{ message: string; data: Sector }> {
    const response: AxiosResponse<{ message: string; data: Sector }> = await this.api.put(`/sectors/${id}`, data);
    return response.data;
  }

  async deleteSector(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/sectors/${id}`);
    return response.data;
  }

  // Estatísticas dos manifestos
  async getManifestStatistics(filters?: {
    start_date?: string;
    end_date?: string;
    service_id?: number;
  }): Promise<{
    message: string;
    data: {
      total_manifests: number;
      status_distribution: Record<string, number>;
      monthly_trend: Array<{ month: string; count: number }>;
      service_distribution: Array<{ service_name: string; count: number }>;
      performance_metrics: {
        average_resolution_time_hours: number;
        overdue_manifests: number;
        average_response_time_hours: number;
      };
      filters_applied: {
        start_date: string | null;
        end_date: string | null;
        service_id: number | null;
      };
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }

    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }

    if (filters?.service_id) {
      params.append('service_id', filters.service_id.toString());
    }

    const url = `/manifests/statistics?${params.toString()}`;
    const response: AxiosResponse<{
      message: string;
      data: {
        total_manifests: number;
        status_distribution: Record<string, number>;
        monthly_trend: Array<{ month: string; count: number }>;
        service_distribution: Array<{ service_name: string; count: number }>;
        performance_metrics: {
          average_resolution_time_hours: number;
          overdue_manifests: number;
          average_response_time_hours: number;
        };
        filters_applied: {
          start_date: string | null;
          end_date: string | null;
          service_id: number | null;
        };
      };
    }> = await this.api.get(url);

    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
