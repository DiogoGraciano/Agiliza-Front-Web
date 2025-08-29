import React from 'react';
import type { Location } from '../../types';
import Button from '../ui/Button';

import { MapPin, Calendar, Edit, Trash2, Settings, Hash, CheckCircle, XCircle } from 'lucide-react';

interface LocationViewProps {
  location: Location;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const LocationView: React.FC<LocationViewProps> = ({
  location,
  onClose,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Inativo';
  };

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
              <p className="text-gray-600">Criado em {formatDate(location.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {location.is_active ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ativa
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Inativa
                </>
              )}
            </span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-2">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Informações Básicas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-teal-50 px-4 py-3 border-b border-teal-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações Básicas</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">ID</label>
              <p className="text-sm font-medium text-gray-900 font-mono">{location.id}</p>
            </div>
            
            {location.description && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
                <p className="text-sm text-gray-900">{location.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card de Status */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h4 className="text-lg font-semibold text-gray-900">Status</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado Atual</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {location.is_active ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ativa
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Inativa
                  </>
                )}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Última Atualização</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(location.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Card de Coordenadas */}
        {(location.latitude || location.longitude) && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Coordenadas</h4>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {location.latitude && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Latitude</label>
                  <p className="text-sm font-medium text-gray-900 font-mono">{location.latitude}</p>
                </div>
              )}
              
              {location.longitude && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Longitude</label>
                  <p className="text-sm font-medium text-gray-900 font-mono">{location.longitude}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card de Endereço */}
      {(location.address || location.city || location.state) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-green-50 px-4 py-3 border-b border-green-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Endereço</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {location.address && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Endereço</label>
                  <p className="text-sm font-medium text-gray-900">{location.address}</p>
                </div>
              )}
              
              {location.number && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Número</label>
                  <p className="text-sm font-medium text-gray-900">{location.number}</p>
                </div>
              )}
              
              {location.complement && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Complemento</label>
                  <p className="text-sm font-medium text-gray-900">{location.complement}</p>
                </div>
              )}
              
              {location.neighborhood && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bairro</label>
                  <p className="text-sm font-medium text-gray-900">{location.neighborhood}</p>
                </div>
              )}
              
              {location.city && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cidade</label>
                  <p className="text-sm font-medium text-gray-900">{location.city}</p>
                </div>
              )}
              
              {location.state && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                  <p className="text-sm font-medium text-gray-900">{location.state}</p>
                </div>
              )}
              
              {location.zip_code && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CEP</label>
                  <p className="text-sm font-medium text-gray-900">{location.zip_code}</p>
                </div>
              )}
              
              {location.country && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">País</label>
                  <p className="text-sm font-medium text-gray-900">{location.country}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card de Mapa */}
      {(location.latitude && location.longitude) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Localização no Mapa</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="h-64 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Mapa interativo disponível na edição</p>
                <p className="text-xs text-gray-400">
                  {location.latitude}, {location.longitude}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card de Filas Vinculadas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Filas Vinculadas</h4>
          </div>
        </div>
        <div className="p-4">
          {location.queues && location.queues.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Esta localização possui as seguintes filas disponíveis:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {location.queues.map((queue) => (
                  <div key={queue.id} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Settings className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {queue.name}
                        </h5>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-gray-600">
                              Prioridade: {queue.priority}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            queue.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {queue.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhuma fila vinculada</p>
              <p className="text-xs text-gray-400 mt-1">
                Esta localização não possui filas específicas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card de Informações do Sistema */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Informações do Sistema</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Criado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(location.created_at)}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(location.updated_at)}</p>
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

export default LocationView;
