import { BaseService } from './BaseService';
import type { ManifestAttachment, AttachmentResponse, PaginatedResponse } from '../types';

export class AttachmentService extends BaseService {
  async getManifestAttachments(filters?: { manifest_id?: number }, page: number = 1): Promise<PaginatedResponse<ManifestAttachment>> {
    const queryParams = this.buildQueryParams(filters, page);
    const url = `/manifest-attachments?${queryParams}`;
    return this.get<PaginatedResponse<ManifestAttachment>>(url);
  }

  async getAttachmentsByManifest(manifestId: number): Promise<ManifestAttachment[]> {
    return this.get<ManifestAttachment[]>(`/manifest-attachments/manifest/${manifestId}`);
  }

  async getAttachment(id: number): Promise<ManifestAttachment> {
    return this.get<ManifestAttachment>(`/manifest-attachments/${id}`);
  }

  async createAttachment(data: Omit<ManifestAttachment, 'id' | 'created_at' | 'updated_at'>): Promise<AttachmentResponse> {
    return this.post<AttachmentResponse>('/manifest-attachments', data);
  }

  async updateAttachment(id: number, data: Partial<ManifestAttachment>): Promise<{ message: string; data: ManifestAttachment }> {
    return this.put<{ message: string; data: ManifestAttachment }>(`/manifest-attachments/${id}`, data);
  }

  async deleteAttachment(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/manifest-attachments/${id}`);
  }

  // Upload de anexo com FormData
  async uploadAttachment(
    manifestId: number,
    file: File,
    onProgress?: (progressEvent: any) => void
  ): Promise<AttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('manifest_id', manifestId.toString());

    return this.post<AttachmentResponse>('/manifest-attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    });
  }
}

export const attachmentService = new AttachmentService();
export default attachmentService;
