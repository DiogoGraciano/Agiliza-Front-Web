import { BaseService } from './BaseService';
import type { Display, DisplayFilters, PaginatedResponse, CreateDisplayData, UpdateDisplayData } from '../types';

export class DisplayService extends BaseService {
  async getDisplays(filters?: DisplayFilters, page: number = 1): Promise<PaginatedResponse<Display>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/displays?${queryParams}`;
    return this.get<PaginatedResponse<Display>>(url);
  }

  async getAllDisplays(): Promise<Display[]> {
    const response = await this.get<{ data: Display[] }>('/displays?per_page=1000');
    return response.data;
  }

  async getDisplay(id: number): Promise<Display> {
    return this.get<Display>(`/displays/${id}`);
  }

  async createDisplay(data: CreateDisplayData): Promise<{ message: string; data: Display }> {
    const formData = new FormData();

    // Adiciona campos de texto e arquivos
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'carousel_images' && Array.isArray(value)) {
          // Trata especificamente o array de imagens do carrossel
          value.forEach((carouselImage, index) => {
            if (carouselImage.file instanceof File) {
              // Nova imagem
              formData.append(`carousel_images[${index}][file]`, carouselImage.file);
              formData.append(`carousel_images[${index}][order]`, carouselImage.order?.toString() || (index + 1).toString());
            }
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else if (typeof value === 'object') {
          // Para outros objetos, converte para JSON
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.post<{ message: string; data: Display }>('/displays', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateDisplay(id: number, data: UpdateDisplayData): Promise<{ message: string; data: Display }> {
    const formData = new FormData();

    // Adiciona campos de texto e arquivos
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'carousel_images' && Array.isArray(value)) {
          // Trata especificamente o array de imagens do carrossel
          value.forEach((carouselImage, index) => {
            if (carouselImage.file instanceof File) {
              // Nova imagem
              formData.append(`carousel_images[${index}][file]`, carouselImage.file);
              formData.append(`carousel_images[${index}][order]`, carouselImage.order?.toString() || (index + 1).toString());
            } else if (carouselImage.id) {
              formData.append(`carousel_images[${index}][id]`, carouselImage.id);
              formData.append(`carousel_images[${index}][order]`, carouselImage.order?.toString() || (index + 1).toString());
            }
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('_method', 'PUT');

    return this.post<{ message: string; data: Display }>(`/displays/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteDisplay(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/displays/${id}`);
  }

  async reorderCarouselImages(displayId: number, imageOrders: { id: number; order: number }[]): Promise<{ message: string; data: Display }> {
    return this.post<{ message: string; data: Display }>(`/displays/${displayId}/reorder-carousel`, {
      image_orders: imageOrders
    });
  }
}

export const displayService = new DisplayService();
export default displayService;
