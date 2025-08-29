import { BaseService } from './BaseService';
import type { User, UserFilters, PaginatedResponse, RegisterData } from '../types';

export class UserService extends BaseService {
  async getUsers(filters?: UserFilters, page: number = 1): Promise<PaginatedResponse<User>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/users?${queryParams}`;
    return this.get<PaginatedResponse<User>>(url);
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.get<{ data: User[] }>('/users?per_page=1000');
    return response.data;
  }

  async createUser(data: Omit<RegisterData, 'password'> & { password: string }): Promise<{ message: string; data: User }> {
    return this.post<{ message: string; data: User }>('/users', data);
  }

  async getUser(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async updateUser(id: number, data: Partial<User>): Promise<{ message: string; data: User }> {
    return this.put<{ message: string; data: User }>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/users/${id}`);
  }
}

export const userService = new UserService();
export default userService;
