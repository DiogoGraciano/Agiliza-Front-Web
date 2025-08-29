import { BaseService } from './BaseService';
import type { Admin, AdminFilters, PaginatedResponse, Sector } from '../types';

export class AdminService extends BaseService {
  async getAdmins(filters?: AdminFilters, page: number = 1): Promise<PaginatedResponse<Admin>> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append('search', filters.search);
    }

    params.append('page', page.toString());
    params.append('include', 'sectors'); // Incluir setores relacionados

    const url = `/admins?${params.toString()}`;
    return this.get<PaginatedResponse<Admin>>(url);
  }

  async createAdmin(data: Omit<Admin, 'id' | 'created_at' | 'updated_at'> & { password: string; sectors?: number[] }): Promise<{ message: string; data: Admin }> {
    return this.post<{ message: string; data: Admin }>('/admins', data);
  }

  async getAdmin(id: number): Promise<Admin> {
    const params = new URLSearchParams();
    params.append('include', 'sectors'); // Incluir setores relacionados

    const url = `/admins/${id}?${params.toString()}`;
    return this.get<Admin>(url);
  }

  async updateAdmin(id: number, data: Partial<Admin> & { password?: string; sectors?: number[] }): Promise<{ message: string; data: Admin }> {
    return this.put<{ message: string; data: Admin }>(`/admins/${id}`, data);
  }

  async deleteAdmin(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/admins/${id}`);
  }
}

export const adminService = new AdminService();
export default adminService;
