import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Calendar, Shield, MapPin, UserCheck, Edit3 } from 'lucide-react';
import type { Manifest } from '../../types';
import Button from '../ui/Button';
import FilePreview from '../ui/FilePreview';
import ManifestComments from './ManifestComments';
import type { ManifestCommentsRef } from './ManifestComments';
import LocationMap from '../ui/LocationMap';
import DeliveryDateModal from './DeliveryDateModal';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface ManifestViewProps {
  manifest: Manifest;
  onClose: () => void;
  onStatusUpdate: (manifest: Manifest, newStatus: string) => void;
  canUpdateStatus: (manifest: Manifest) => boolean;
}

export interface ManifestViewRef {
  refreshComments: () => void;
}

const ManifestView = forwardRef<ManifestViewRef, ManifestViewProps>(({
  manifest: initialManifest,
  onClose,
  onStatusUpdate,
  canUpdateStatus
}, ref) => {
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);
  const [isDeliveryDateModalOpen, setIsDeliveryDateModalOpen] = useState(false);
  const [manifest, setManifest] = useState<Manifest>(initialManifest);
  const [status, setStatus] = useState<string>(initialManifest.status);
  const { admin: currentAdmin } = useAuth();
  const commentsRef = useRef<ManifestCommentsRef>(null);

  useImperativeHandle(ref, () => ({
    refreshComments: () => {
      commentsRef.current?.refreshComments();
    }
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const updateStatus = (manifest: Manifest, newStatus: string) => {
    setStatus(newStatus);
    setManifest(prev => ({ ...prev, status: newStatus as Manifest['status'] }));
    onStatusUpdate(manifest, newStatus);
    setTimeout(() => {
      commentsRef.current?.refreshComments();
    }, 100);
  };

  const handleSetAdmin = async () => {
    if (!currentAdmin) {
      toast.error('Você precisa estar logado para assumir um manifesto');
      return;
    }

    setIsSettingAdmin(true);
    try {
      const response = await apiService.setManifestAdmin(manifest.id);
      setManifest(response.data);
      toast.success('Manifesto assumido com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao assumir manifesto');
    } finally {
      setIsSettingAdmin(false);
    }
  };

  const canAssumeManifest = () => {
    return !manifest.admin || manifest.admin.id !== currentAdmin?.id;
  };

  const handleDeliveryDateUpdate = (updatedManifest: Manifest) => {
    setManifest(updatedManifest);
    setStatus(updatedManifest.status);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna principal - 70% da tela */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header com informações principais */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manifesto #{manifest.id}</h2>
                <p className="text-gray-600">Criado em {new Date(manifest.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                {getStatusText(status)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
            <p className="text-gray-700 leading-relaxed mb-4">{manifest.description}</p>
            
            {/* Data de Entrega Esperada */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Data de Entrega Esperada:</span>
                  {manifest.delivery_forecast_date ? (
                    <span className="text-sm text-blue-600 font-semibold">
                      {new Date(manifest.delivery_forecast_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Não definida</span>
                  )}
                </div>
                
                {/* Botão para alterar data de entrega - apenas para admins */}
                {currentAdmin && (
                  <Button
                    onClick={() => setIsDeliveryDateModalOpen(true)}
                    variant="outline"
                    size="xs"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Alterar Data
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de informações organizadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card do Admin Responsável */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-semibold text-gray-900">Admin Responsável</h4>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
                <p className="text-sm font-medium text-gray-900">{manifest.admin?.name || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
                <p className="text-sm font-medium text-gray-900">{manifest.admin?.email || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CPF/CNPJ</label>
                <p className="text-sm font-medium text-gray-900">{manifest.admin?.cpf_cnpj || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Card do Solicitante */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900">Solicitante</h4>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{manifest.name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CPF/CNPJ</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{manifest.cpf_cnpj || 'Não informado'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Telefone</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{manifest.phone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
                  <p className="text-sm font-medium text-gray-900 break-all">{manifest.email || 'Não informado'}</p>
                </div>
              </div>
                              <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Data de Nascimento</label>
                  <p className="text-sm font-medium text-gray-900">
                    {manifest.birth_date ? new Date(manifest.birth_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Não informado'}
                  </p>
                </div>
            </div>
          </div>

          {/* Card de Endereço */}
          {manifest.address && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900">Endereço</h4>
                  </div>
                  
                  {/* Botão para visualizar no mapa */}
                  {(manifest.latitude && manifest.longitude) && (
                    <Button
                      onClick={() => setIsLocationMapOpen(true)}
                      variant="outline"
                      size="xs"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Ver no Mapa
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CEP</label>
                    <p className="text-sm font-medium text-gray-900">{manifest.zip_code}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Endereço</label>
                    <p className="text-sm font-medium text-gray-900">{manifest.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Número</label>
                    <p className="text-sm font-medium text-gray-900">{manifest.number}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Complemento</label>
                    <p className="text-sm font-medium text-gray-900">{manifest.complement || 'Não informado'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bairro</label>
                    <p className="text-sm font-medium text-gray-900">{manifest.neighborhood || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cidade</label>
                    <p className="text-sm font-medium text-gray-900">{manifest.city}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                  <p className="text-sm font-medium text-gray-900">{manifest.state}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Anexos */}
        {manifest.attachments && manifest.attachments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <FilePreview
                attachments={manifest.attachments.map(attachment => ({
                  id: attachment.id,
                  name: attachment.name || attachment.path.split('/').pop() || 'arquivo',
                  path: attachment.path,
                  url: attachment.url,
                  created_at: attachment.created_at
                }))}
              />
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {/* Botão para assumir manifesto */}
              {currentAdmin && canAssumeManifest() && (
                <Button
                  onClick={handleSetAdmin}
                  disabled={isSettingAdmin}
                  variant="outline"
                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {isSettingAdmin ? 'Assumindo...' : 'Assumir Manifesto'}
                </Button>
              )}

              {/* Botões de status */}
              {canUpdateStatus(manifest) && (
                <>
                  <Button
                    onClick={() => updateStatus(manifest, 'accepted')}
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors max-sm:w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Aceitar
                  </Button>
                  <Button
                    onClick={() => updateStatus(manifest, 'rejected')}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 transition-colors max-sm:w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => updateStatus(manifest, 'in_progress')}
                    variant="outline"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors max-sm:w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Em Andamento
                  </Button>
                  <Button
                    onClick={() => updateStatus(manifest, 'completed')}
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 transition-colors max-sm:w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Concluir
                  </Button>
                </>
              )}
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white hover:bg-gray-50 transition-colors max-sm:w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fechar
            </Button>
          </div>
        </div>
      </div>

      {/* Coluna lateral - 30% da tela - Comentários */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
          <div className="p-4">
            <ManifestComments 
              manifestId={manifest.id} 
              ref={commentsRef}
            />
          </div>
        </div>
      </div>

      {/* Modal do Mapa de Localização */}
      <LocationMap
        isOpen={isLocationMapOpen}
        onClose={() => setIsLocationMapOpen(false)}
        latitude={manifest.latitude}
        longitude={manifest.longitude}
        address={manifest.address}
        city={manifest.city}
        state={manifest.state}
      />

      {/* Modal para alterar data de entrega */}
      <DeliveryDateModal
        isOpen={isDeliveryDateModalOpen}
        onClose={() => setIsDeliveryDateModalOpen(false)}
        manifestId={manifest.id}
        currentDate={manifest.delivery_forecast_date}
        onDateUpdated={handleDeliveryDateUpdate}
      />
    </div>
  );
});

export default ManifestView;
