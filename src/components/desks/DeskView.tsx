import React from 'react';
import { 
  Calendar, 
  Settings, 
  Hash,
  MapPin,
  CheckCircle, 
  XCircle
} from 'lucide-react';
import type { Desk } from '../../types';
import Button from '../ui/Button';

interface DeskViewProps {
  desk: Desk;
  onClose: () => void;
}

const DeskView: React.FC<DeskViewProps> = ({
  desk,
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
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{desk.name}</h2>
              <p className="text-gray-600">Criado em {formatDate(desk.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${desk.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {desk.status === 'active' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ativo
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Inativo
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Número */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Número do Guichê</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">{desk.number}</span>
              <p className="text-sm text-gray-500 mt-2">Identificador único</p>
            </div>
          </div>
        </div>

        {/* Card de Status */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h4 className="text-lg font-semibold text-gray-900">Status</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado Atual</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${desk.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {desk.status === 'active' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ativo
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Inativo
                  </>
                )}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Última Atualização</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(desk.updated_at)}</p>
            </div>
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
          {desk.location ? (
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-medium text-gray-900">
                      {desk.location.name}
                    </h5>
                    {desk.location.address && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          {desk.location.address}, {desk.location.number}
                        </p>
                        <p>
                          {desk.location.neighborhood} - {desk.location.city}/{desk.location.state}
                        </p>
                        {desk.location.zip_code && (
                          <p>{desk.location.zip_code}</p>
                        )}
                      </div>
                    )}
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        desk.location.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {desk.location.is_active ? 'Localização Ativa' : 'Localização Inativa'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Localização não definida</p>
            </div>
          )}
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
              <p className="text-sm font-medium text-gray-900">{formatDate(desk.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(desk.updated_at)}</p>
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

export default DeskView;
