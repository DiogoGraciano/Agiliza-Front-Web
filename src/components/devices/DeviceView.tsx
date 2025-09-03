import React from 'react';
import { 
  Calendar, 
  Smartphone, 
  MapPin,
  Key,
  Hash
} from 'lucide-react';
import type { Device } from '../../types';
import Button from '../ui/Button';

interface DeviceViewProps {
  device: Device;
  onClose: () => void;
}

const DeviceView: React.FC<DeviceViewProps> = ({
  device,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{device.name}</h2>
              <p className="text-gray-600">Criado em {formatDate(device.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
              <Hash className="w-4 h-4 mr-2" />
              ID: {device.id}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Informações do Dispositivo */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações do Dispositivo</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
              <p className="text-sm font-medium text-gray-900">{device.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Token</label>
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-gray-400" />
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border">
                  {device.token}
                </code>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">ID do Dispositivo</label>
              <p className="text-sm font-medium text-gray-900">#{device.id}</p>
            </div>
          </div>
        </div>

        {/* Card de Localização */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Localização</h4>
            </div>
          </div>
          <div className="p-4">
            {device.location ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome da Localização</label>
                  <p className="text-sm font-medium text-gray-900">{device.location.name}</p>
                </div>
                {device.location.address && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Endereço</label>
                    <div className="text-sm text-gray-600">
                      <p>{device.location.address}, {device.location.number}</p>
                      {device.location.complement && <p>{device.location.complement}</p>}
                      <p>{device.location.neighborhood}</p>
                      <p>{device.location.city}/{device.location.state}</p>
                      {device.location.zip_code && <p>CEP: {device.location.zip_code}</p>}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status da Localização</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    device.location.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {device.location.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Localização não encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações de Timestamps */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Informações de Sistema</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Criado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(device.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(device.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de fechar */}
      <div className="flex justify-end">
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-white hover:bg-gray-50 transition-colors"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default DeviceView;
