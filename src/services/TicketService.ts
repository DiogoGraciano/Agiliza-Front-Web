import { BaseService } from './BaseService';
import type { Ticket, TicketFilters, PaginatedResponse } from '../types';

export class TicketService extends BaseService {
  async getTickets(filters?: TicketFilters, page: number = 1): Promise<PaginatedResponse<Ticket>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/tickets?${queryParams}`;
    return this.get<PaginatedResponse<Ticket>>(url);
  }

  async getTicket(id: number): Promise<Ticket> {
    return this.get<Ticket>(`/tickets/${id}`);
  }

  async createTicket(data: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Ticket }> {
    return this.post<{ message: string; data: Ticket }>('/tickets', data);
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<{ message: string; data: Ticket }> {
    return this.put<{ message: string; data: Ticket }>(`/tickets/${id}`, data);
  }

  async deleteTicket(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/tickets/${id}`);
  }

  async getCurrentTicket(locationId: number): Promise<{ message: string; data: Ticket | null }> {
    return this.get<{ message: string; data: Ticket | null }>(`/tickets/current?location_id=${locationId}`);
  }
}

export const ticketService = new TicketService();
export default ticketService;
