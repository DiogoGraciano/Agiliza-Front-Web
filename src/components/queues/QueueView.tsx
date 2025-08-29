import React from 'react';
import { 
  Calendar, 
  Settings, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle,
  Hash,
  MapPin
} from 'lucide-react';
import type { Queue } from '../../types';
import Button from '../ui/Button';

interface QueueViewProps {
  queue: Queue;
  onClose: () => void;
}

const QueueView: React.FC<QueueViewProps> = ({
  queue,
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

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-red-100 text-red-800';
    if (priority <= 4) return 'bg-orange-100 text-orange-800';
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityText = (priority: number) => {
    if (priority <= 2) return 'Alta';
    if (priority <= 4) return 'Média-Alta';
    if (priority <= 6) return 'Média';
    return 'Baixa';
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
              <h2 className="text-2xl font-bold text-gray-900">{queue.name}</h2>
              <p className="text-gray-600">Criado em {formatDate(queue.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${queue.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {queue.is_active ? (
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Prioridade */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Prioridade</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nível</label>
              <p className="text-sm font-medium text-gray-900">{queue.priority}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Classificação</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(queue.priority)}`}>
                {getPriorityText(queue.priority)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <p>• Números menores = maior prioridade</p>
              <p>• 1-2: Alta prioridade</p>
              <p>• 3-4: Média-alta prioridade</p>
              <p>• 5-6: Média prioridade</p>
              <p>• 7+: Baixa prioridade</p>
            </div>
          </div>
        </div>

        {/* Card de Imagem */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <h4 className="text-lg font-semibold text-gray-900">Imagem</h4>
            </div>
          </div>
          <div className="p-4">
            {queue.image ? (
              <div className="space-y-3">
                <img 
                  src={queue.image} 
                  alt={`Imagem da fila ${queue.name}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-sm text-gray-500 text-center py-8">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Imagem não disponível</p>
                </div>
                <a 
                  href={queue.image} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Ver imagem completa
                </a>
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Nenhuma imagem definida</p>
              </div>
            )}
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
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${queue.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {queue.is_active ? (
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
              <p className="text-sm font-medium text-gray-900">{formatDate(queue.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Localizações */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Localizações Vinculadas</h4>
          </div>
        </div>
        <div className="p-4">
          {queue.locations && queue.locations.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Esta fila está disponível nas seguintes localizações:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queue.locations.map((location) => (
                  <div key={location.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {location.name}
                        </h5>
                        {location.address && (
                          <div className="mt-1 text-xs text-gray-600">
                            <p className="truncate">
                              {location.address}, {location.number}
                            </p>
                            <p className="truncate">
                              {location.neighborhood} - {location.city}/{location.state}
                            </p>
                            {location.zip_code && (
                              <p className="truncate">{location.zip_code}</p>
                            )}
                          </div>
                        )}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            location.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {location.is_active ? 'Ativa' : 'Inativa'}
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
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhuma localização vinculada</p>
              <p className="text-xs text-gray-400 mt-1">
                Esta fila estará disponível em todas as localizações
              </p>
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
              <p className="text-sm font-medium text-gray-900">{formatDate(queue.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(queue.updated_at)}</p>
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

export default QueueView;
