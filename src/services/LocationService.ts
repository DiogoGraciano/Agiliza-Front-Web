import { BaseService } from './BaseService';
import type { Location, LocationFilters, PaginatedResponse, CreateLocationData, UpdateLocationData } from '../types';

export class LocationService extends BaseService {
  async getLocations(filters?: LocationFilters, page: number = 1): Promise<PaginatedResponse<Location>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/locations?${queryParams}`;
    return this.get<PaginatedResponse<Location>>(url);
  }

  async getAllLocations(): Promise<Location[]> {
    const response = await this.get<{ data: Location[] }>('/locations?per_page=1000');
    return response.data;
  }

  async getLocation(id: number): Promise<Location> {
    return this.get<Location>(`/locations/${id}`);
  }

  async createLocation(data: CreateLocationData): Promise<{ message: string; data: Location }> {
    return this.post<{ message: string; data: Location }>('/locations', data);
  }

  async updateLocation(id: number, data: UpdateLocationData): Promise<{ message: string; data: Location }> {
    return this.put<{ message: string; data: Location }>(`/locations/${id}`, data);
  }

  async deleteLocation(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/locations/${id}`);
  }
}

export const locationService = new LocationService();
export default locationService;
