import { BaseService } from './BaseService';
import type { Type, TypeFilters, PaginatedResponse } from '../types';

export class TypeService extends BaseService {
  async getTypes(filters?: TypeFilters, page: number = 1): Promise<PaginatedResponse<Type>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/types?${queryParams}`;
    return this.get<PaginatedResponse<Type>>(url);
  }

  async getActiveTypes(): Promise<Type[]> {
    return this.get<Type[]>('/types/active');
  }

  async getType(id: number): Promise<Type> {
    return this.get<Type>(`/types/${id}`);
  }

  async createType(formData: FormData): Promise<{ message: string; data: Type }> {
    return this.post<{ message: string; data: Type }>('/types', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async updateType(id: number, formData: FormData): Promise<{ message: string; data: Type }> {
    formData.append('_method', 'PUT');
    return this.post<{ message: string; data: Type }>(`/types/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async deleteType(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/types/${id}`);
  }

  // Upload de imagem para tipo
  async uploadTypeImage(
    typeId: number,
    file: File,
    onProgress?: (progressEvent: any) => void
  ): Promise<{ message: string; data: { image_url: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.post<{ message: string; data: { image_url: string } }>(`/types/${typeId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    });
  }
}

export const typeService = new TypeService();
export default typeService;
