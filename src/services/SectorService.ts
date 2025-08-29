import { BaseService } from './BaseService';
import type { Sector } from '../types';

export class SectorService extends BaseService {
  async getSectors(): Promise<Sector[]> {
    return this.get<Sector[]>('/sectors');
  }

  async createSector(data: Omit<Sector, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Sector }> {
    return this.post<{ message: string; data: Sector }>('/sectors', data);
  }

  async getSector(id: number): Promise<Sector> {
    return this.get<Sector>(`/sectors/${id}`);
  }

  async updateSector(id: number, data: Partial<Omit<Sector, 'id' | 'created_at' | 'updated_at'>>): Promise<{ message: string; data: Sector }> {
    return this.put<{ message: string; data: Sector }>(`/sectors/${id}`, data);
  }

  async deleteSector(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/sectors/${id}`);
  }
}

export const sectorService = new SectorService();
export default sectorService;
