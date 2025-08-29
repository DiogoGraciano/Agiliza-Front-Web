import { BaseService } from './BaseService';
import type { Service, ServiceFilters, PaginatedResponse } from '../types';

export class ServiceService extends BaseService {
  async getServices(filters?: ServiceFilters, page: number = 1): Promise<PaginatedResponse<Service>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/services?${queryParams}`;
    return this.get<PaginatedResponse<Service>>(url);
  }

  async getServicesWithManifestCount(): Promise<Service[]> {
    return this.get<Service[]>('/services/with-manifest-count');
  }

  async searchServices(query: string): Promise<Service[]> {
    return this.get<Service[]>(`/services/search?q=${encodeURIComponent(query)}`);
  }

  async getService(id: number): Promise<Service> {
    return this.get<Service>(`/services/${id}`);
  }

  async createService(data: FormData): Promise<{ message: string; data: Service }> {
    return this.post<{ message: string; data: Service }>('/services', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateService(id: number, data: FormData): Promise<{ message: string; data: Service }> {
    data.append('_method', 'PUT');
    return this.post<{ message: string; data: Service }>(`/services/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteService(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/services/${id}`);
  }
}

export const serviceService = new ServiceService();
export default serviceService;
