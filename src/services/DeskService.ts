import { BaseService } from './BaseService';
import type { Desk, DeskFilters, PaginatedResponse } from '../types';

export class DeskService extends BaseService {
  async getDesks(filters?: DeskFilters, page: number = 1): Promise<PaginatedResponse<Desk>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/desks?${queryParams}`;
    return this.get<PaginatedResponse<Desk>>(url);
  }

  async getAllDesks(): Promise<Desk[]> {
    const response = await this.get<{ data: Desk[] }>('/desks?per_page=1000');
    return response.data;
  }

  async getDesk(id: number): Promise<Desk> {
    return this.get<Desk>(`/desks/${id}`);
  }

  async createDesk(data: Omit<Desk, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Desk }> {
    return this.post<{ message: string; data: Desk }>('/desks', data);
  }

  async updateDesk(id: number, data: Partial<Desk>): Promise<{ message: string; data: Desk }> {
    return this.put<{ message: string; data: Desk }>(`/desks/${id}`, data);
  }

  async deleteDesk(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/desks/${id}`);
  }
}

export const deskService = new DeskService();
export default deskService;
