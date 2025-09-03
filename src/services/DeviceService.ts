import { BaseService } from './BaseService';
import type { Device, DeviceFilters, PaginatedResponse } from '../types';

export class DeviceService extends BaseService {
  async getDevices(filters?: DeviceFilters, page: number = 1): Promise<PaginatedResponse<Device>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/devices?${queryParams}`;
    return this.get<PaginatedResponse<Device>>(url);
  }

  async getAllDevices(): Promise<Device[]> {
    const response = await this.get<{ data: Device[] }>('/devices?per_page=1000');
    return response.data;
  }

  async getDevice(id: number): Promise<Device> {
    return this.get<Device>(`/devices/${id}`);
  }

  async createDevice(data: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Device }> {
    return this.post<{ message: string; data: Device }>('/devices', data);
  }

  async updateDevice(id: number, data: Partial<Device>): Promise<{ message: string; data: Device }> {
    return this.put<{ message: string; data: Device }>(`/devices/${id}`, data);
  }

  async deleteDevice(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/devices/${id}`);
  }
}

export const deviceService = new DeviceService();
export default deviceService;
