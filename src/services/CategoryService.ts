import { BaseService } from './BaseService';
import type { Category, CategoryFilters, PaginatedResponse } from '../types';

export class CategoryService extends BaseService {
  async getCategories(filters?: CategoryFilters, page: number = 1): Promise<PaginatedResponse<Category>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/categories?${queryParams}`;
    return this.get<PaginatedResponse<Category>>(url);
  }

  async getActiveCategories(): Promise<Category[]> {
    return this.get<Category[]>('/categories/active');
  }

  async getCategoriesByService(serviceId: number): Promise<Category[]> {
    return this.get<Category[]>(`/categories/service/${serviceId}`);
  }

  async getCategory(id: number): Promise<Category> {
    return this.get<Category>(`/categories/${id}`);
  }

  async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Category }> {
    return this.post<{ message: string; data: Category }>('/categories', data);
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<{ message: string; data: Category }> {
    return this.put<{ message: string; data: Category }>(`/categories/${id}`, data);
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
