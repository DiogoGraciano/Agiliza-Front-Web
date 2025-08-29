import { BaseService } from './BaseService';
import type { Queue, QueueFilters, PaginatedResponse } from '../types';

export class QueueService extends BaseService {
  async getQueues(filters?: QueueFilters, page: number = 1): Promise<PaginatedResponse<Queue>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/queues?${queryParams}`;
    return this.get<PaginatedResponse<Queue>>(url);
  }

  async getAllQueues(): Promise<Queue[]> {
    const response = await this.get<{ data: Queue[] }>('/queues?per_page=1000');
    return response.data;
  }

  async getQueue(id: number): Promise<Queue> {
    return this.get<Queue>(`/queues/${id}`);
  }

  async createQueue(data: Omit<Queue, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Queue }> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('priority', data.priority.toString());
    formData.append('is_active', data.is_active.toString());

    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.locations) {
      data.locations.forEach(location => {
        formData.append('locations[]', location.id.toString());
      });
    }

    return this.post<{ message: string; data: Queue }>('/queues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async updateQueue(id: number, data: Partial<Queue>): Promise<{ message: string; data: Queue }> {
    const formData = new FormData();

    if (data.name) {
      formData.append('name', data.name);
    }

    if (data.priority) {
      formData.append('priority', data.priority.toString());
    }

    if (data.is_active) {
      formData.append('is_active', data.is_active.toString());
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.locations) {
      data.locations.forEach(location => {
        formData.append('locations[]', location.id.toString());
      });
    }

    formData.append('_method', 'PUT');

    return this.post<{ message: string; data: Queue }>(`/queues/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async deleteQueue(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/queues/${id}`);
  }
}

export const queueService = new QueueService();
export default queueService;
