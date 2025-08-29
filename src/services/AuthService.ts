import { BaseService } from './BaseService';
import type { LoginCredentials, LoginResponse, Admin } from '../types';

export class AuthService extends BaseService {
  async adminLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.post<LoginResponse>('/admin/login', credentials);
  }

  async adminLogout(): Promise<{ message: string }> {
    return this.post<{ message: string }>('/admin/logout');
  }

  async getAdminProfile(): Promise<Admin> {
    return this.get<Admin>('/admin/profile');
  }

  async updateAdminProfile(data: Partial<Admin>): Promise<Admin> {
    return this.put<Admin>('/admin/profile', data);
  }
}

export const authService = new AuthService();
export default authService;
