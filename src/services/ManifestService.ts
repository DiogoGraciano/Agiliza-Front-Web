import { BaseService } from './BaseService';
import type { 
  Manifest, 
  ManifestFilters, 
  PaginatedResponse, 
  ManifestWithAttachmentsResponse,
  ManifestComment,
  CreateCommentData,
  UpdateCommentData,
  CommentResponse
} from '../types';

export class ManifestService extends BaseService {
  async getManifests(filters?: ManifestFilters, page: number = 1): Promise<PaginatedResponse<Manifest>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/manifests?${queryParams}`;
    return this.get<PaginatedResponse<Manifest>>(url);
  }

  async getManifest(id: number): Promise<Manifest> {
    return this.get<Manifest>(`/manifests/${id}`);
  }

  async createManifest(data: Omit<Manifest, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; data: Manifest }> {
    return this.post<{ message: string; data: Manifest }>('/manifests', data);
  }

  // Criar manifesto com anexos
  async createManifestWithAttachments(
    manifestData: Omit<Manifest, 'id' | 'created_at' | 'updated_at'>,
    files: File[]
  ): Promise<ManifestWithAttachmentsResponse> {
    const formData = new FormData();

    // Adicionar dados do manifesto
    Object.entries(manifestData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Adicionar arquivos
    files.forEach((file, index) => {
      formData.append(`attachments[${index}][file]`, file);
    });

    return this.post<ManifestWithAttachmentsResponse>('/manifests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async updateManifest(id: number, data: Partial<Manifest>): Promise<{ message: string; data: Manifest }> {
    return this.put<{ message: string; data: Manifest }>(`/manifests/${id}`, data);
  }

  // Atualizar manifesto com novos anexos
  async updateManifestWithAttachments(
    id: number,
    data: Partial<Manifest>,
    files?: File[]
  ): Promise<ManifestWithAttachmentsResponse> {
    const formData = new FormData();

    // Adicionar dados do manifesto
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Adicionar arquivos (se houver)
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`attachments[${index}][file]`, file);
      });
    }

    return this.put<ManifestWithAttachmentsResponse>(`/manifests/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async deleteManifest(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/manifests/${id}`);
  }

  async updateManifestStatus(id: number, status: string): Promise<{ message: string; data: Manifest }> {
    return this.patch<{ message: string; data: Manifest }>(`/manifests/${id}/status`, { status });
  }

  async setManifestAdmin(manifestId: number): Promise<{ message: string; data: Manifest }> {
    return this.post<{ message: string; data: Manifest }>(`/manifests/${manifestId}/set-admin`);
  }

  async changeDeliveryForecastDate(manifestId: number, deliveryForecastDate: string): Promise<{ message: string; data: Manifest }> {
    return this.patch<{ message: string; data: Manifest }>(`/manifests/${manifestId}/change-delivery-forecast-date`, {
      delivery_forecast_date: deliveryForecastDate
    });
  }

  // Comentários de manifestos
  async getManifestComments(manifestId: number, page: number = 1): Promise<PaginatedResponse<ManifestComment>> {
    return this.get<PaginatedResponse<ManifestComment>>(`/manifests/${manifestId}/comments?page=${page}`);
  }

  async getComment(id: number): Promise<ManifestComment> {
    return this.get<ManifestComment>(`/manifest-comments/${id}`);
  }

  async createComment(data: CreateCommentData): Promise<CommentResponse> {
    const formData = new FormData();
    formData.append('manifest_id', data.manifest_id.toString());
    formData.append('comment', data.comment);

    if (data.status) {
      formData.append('status', data.status);
    }

    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    return this.post<CommentResponse>(`/manifests/${data.manifest_id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async updateComment(id: number, data: UpdateCommentData): Promise<CommentResponse> {
    const formData = new FormData();

    if (data.comment) {
      formData.append('comment', data.comment);
    }

    if (data.status) {
      formData.append('status', data.status);
    }

    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    formData.append('_method', 'PUT');
    return this.post<CommentResponse>(`/manifest-comments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }

  async deleteComment(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/manifest-comments/${id}`);
  }

  // Estatísticas dos manifestos
  async getManifestStatistics(filters?: {
    start_date?: string;
    end_date?: string;
    service_id?: number;
  }): Promise<{
    message: string;
    data: {
      total_manifests: number;
      status_distribution: Record<string, number>;
      monthly_trend: Array<{ month: string; count: number }>;
      service_distribution: Array<{ service_name: string; count: number }>;
      performance_metrics: {
        average_resolution_time_hours: number;
        overdue_manifests: number;
        average_response_time_hours: number;
      };
      filters_applied: {
        start_date: string | null;
        end_date: string | null;
        service_id: number | null;
      };
    };
  }> {
    const queryParams = this.buildQueryParams(filters);
    const url = `/manifests/statistics?${queryParams}`;
    return this.get(url);
  }
}

export const manifestService = new ManifestService();
export default manifestService;
