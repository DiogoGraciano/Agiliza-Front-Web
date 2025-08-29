import { BaseService } from './BaseService';
import type { Enterprise } from '../types';

export class EnterpriseService extends BaseService {
  async getEnterprise(): Promise<Enterprise | null> {
    try {
      return await this.get<Enterprise>('/enterprise');
    } catch (error) {
      // Retorna null se não houver empresa cadastrada
      return null;
    }
  }

  async updateEnterprise(data: Partial<Enterprise>): Promise<{ message: string; data: Enterprise }> {
    return this.put<{ message: string; data: Enterprise }>('/enterprise', data);
  }
}

export const enterpriseService = new EnterpriseService();
export default enterpriseService;
