import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, 
  Enterprise, 
  Service, 
  Category, 
  Type, 
  Manifest, 
  ManifestAttachment,
  LoginCredentials,
  RegisterData,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
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
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticação
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response: AxiosResponse<{ token: string; user: User }> = await this.api.post('/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    const response: AxiosResponse<{ token: string; user: User }> = await this.api.post('/register', data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/profile', data);
    return response.data;
  }

  // Empresa
  async getEnterprise(): Promise<Enterprise> {
    const response: AxiosResponse<Enterprise> = await this.api.get('/enterprise');
    return response.data;
  }

  async updateEnterprise(data: Partial<Enterprise>): Promise<Enterprise> {
    const response: AxiosResponse<Enterprise> = await this.api.put('/enterprise', data);
    return response.data;
  }

  // Usuários (Admin)
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get('/users');
    return response.data;
  }

  async createUser(data: Omit<RegisterData, 'password'> & { password: string }): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Serviços
  async getServices(): Promise<PaginatedResponse<Service>> {
    const response: AxiosResponse<PaginatedResponse<Service>> = await this.api.get('/services');
    return response.data;
  }

  async getServicesWithManifestCount(): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get('/services/with-manifest-count');
    return response.data;
  }

  async searchServices(query: string): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get(`/services/search?q=${query}`);
    return response.data;
  }

  async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.post('/services', data);
    return response.data;
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.put(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.api.delete(`/services/${id}`);
  }

  // Categorias
  async getCategories(): Promise<PaginatedResponse<Category>> {
    const response: AxiosResponse<PaginatedResponse<Category>> = await this.api.get('/categories');
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

  async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Tipos
  async getTypes(): Promise<PaginatedResponse<Type>> {
    const response: AxiosResponse<PaginatedResponse<Type>> = await this.api.get('/types');
    return response.data;
  }

  async getActiveTypes(): Promise<Type[]> {
    const response: AxiosResponse<Type[]> = await this.api.get('/types/active');
    return response.data;
  }

  async createType(data: Omit<Type, 'id' | 'created_at' | 'updated_at'>): Promise<Type> {
    const response: AxiosResponse<Type> = await this.api.post('/types', data);
    return response.data;
  }

  async updateType(id: number, data: Partial<Type>): Promise<Type> {
    const response: AxiosResponse<Type> = await this.api.put(`/types/${id}`, data);
    return response.data;
  }

  async deleteType(id: number): Promise<void> {
    await this.api.delete(`/types/${id}`);
  }

  // Manifestos
  async getManifests(): Promise<PaginatedResponse<Manifest>> {
    const response: AxiosResponse<PaginatedResponse<Manifest>> = await this.api.get('/manifests');
    return response.data;
  }

  async getManifestsByStatus(status: string): Promise<PaginatedResponse<Manifest>> {
    const response: AxiosResponse<PaginatedResponse<Manifest>> = await this.api.get(`/manifests/status/${status}`);
    return response.data;
  }

  async getManifestsByUser(userId: number): Promise<PaginatedResponse<Manifest>> {
    const response: AxiosResponse<PaginatedResponse<Manifest>> = await this.api.get(`/manifests/user/${userId}`);
    return response.data;
  }

  async createManifest(data: Omit<Manifest, 'id' | 'created_at' | 'updated_at'>): Promise<Manifest> {
    const response: AxiosResponse<Manifest> = await this.api.post('/manifests', data);
    return response.data;
  }

  async updateManifest(id: number, data: Partial<Manifest>): Promise<Manifest> {
    const response: AxiosResponse<Manifest> = await this.api.put(`/manifests/${id}`, data);
    return response.data;
  }

  async deleteManifest(id: number): Promise<void> {
    await this.api.delete(`/manifests/${id}`);
  }

  async updateManifestStatus(id: number, status: string): Promise<Manifest> {
    const response: AxiosResponse<Manifest> = await this.api.patch(`/manifests/${id}/status`, { status });
    return response.data;
  }

  // Anexos
  async getManifestAttachments(): Promise<PaginatedResponse<ManifestAttachment>> {
    const response: AxiosResponse<PaginatedResponse<ManifestAttachment>> = await this.api.get('/manifest-attachments');
    return response.data;
  }

  async getAttachmentsByManifest(manifestId: number): Promise<ManifestAttachment[]> {
    const response: AxiosResponse<ManifestAttachment[]> = await this.api.get(`/manifest-attachments/manifest/${manifestId}`);
    return response.data;
  }

  async createAttachment(data: Omit<ManifestAttachment, 'id' | 'created_at' | 'updated_at'>): Promise<ManifestAttachment> {
    const response: AxiosResponse<ManifestAttachment> = await this.api.post('/manifest-attachments', data);
    return response.data;
  }

  async updateAttachment(id: number, data: Partial<ManifestAttachment>): Promise<ManifestAttachment> {
    const response: AxiosResponse<ManifestAttachment> = await this.api.put(`/manifest-attachments/${id}`, data);
    return response.data;
  }

  async deleteAttachment(id: number): Promise<void> {
    await this.api.delete(`/manifest-attachments/${id}`);
  }
}

export const apiService = new ApiService();
export default apiService;
