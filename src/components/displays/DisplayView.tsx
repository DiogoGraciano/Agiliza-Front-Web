import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Monitor, 
  Palette,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  CheckCircle, 
  XCircle,
  Play
} from 'lucide-react';
import type { Display, Location } from '../../types';
import Button from '../ui/Button';
import LocationSelectionModal from '../selectionModals/LocationSelectionModal';

interface DisplayViewProps {
  display: Display;
  onClose: () => void;
}

const DisplayView: React.FC<DisplayViewProps> = ({
  display,
  onClose,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateLabel = (template: string) => {
    const templates: { [key: string]: string } = {
      'classic': 'Clássico',
      'modern': 'Moderno',
      'minimal': 'Minimalista',
      'default': 'Padrão'
    };
    return templates[template] || template;
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    const templateUrl = `/display/${display.id}/preview?location=${location.id}`;
    window.open(templateUrl, '_blank');
    setShowLocationModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Monitor className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{display.name}</h2>
              <p className="text-gray-600">Criado em {formatDate(display.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${display.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {display.is_active ? (
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
        {/* Card de Template */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Template</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-purple-600">{getTemplateLabel(display.template)}</span>
              <p className="text-sm text-gray-500 mt-2">Layout visual</p>
              
              {/* Botão de Iniciar Display */}
              <div className="mt-4">
                <Button
                  onClick={() => {
                    // Abrir modal de seleção de localização
                    setShowLocationModal(true);
                  }}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {selectedLocation ? `Iniciar em ${selectedLocation.name}` : 'Iniciar Display'}
                </Button>
              </div>
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
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${display.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {display.is_active ? (
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
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Localização Ativa</label>
              {selectedLocation ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{selectedLocation.name}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma localização selecionada</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Última Atualização</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(display.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Cores */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Configuração de Cores</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor Primária</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300" 
                  style={{ backgroundColor: display.color_primary }}
                />
                <span className="text-sm font-mono text-gray-700">{display.color_primary}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor Secundária</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300" 
                  style={{ backgroundColor: display.color_secondary }}
                />
                <span className="text-sm font-mono text-gray-700">{display.color_secondary}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor de Fundo</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300" 
                  style={{ backgroundColor: display.color_background }}
                />
                <span className="text-sm font-mono text-gray-700">{display.color_background}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor do Texto</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300" 
                  style={{ backgroundColor: display.color_text }}
                />
                <span className="text-sm font-mono text-gray-700">{display.color_text}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor de Destaque</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300" 
                  style={{ backgroundColor: display.color_accent }}
                />
                <span className="text-sm font-mono text-gray-700">{display.color_accent}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cor de Realce</label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300" 
                  style={{ backgroundColor: display.color_highlight }}
                />
                <span className="text-sm font-mono text-gray-700">{display.color_highlight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Imagens */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-green-50 px-4 py-3 border-b border-green-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900">Imagens</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Logo</h5>
              {display.image_logo ? (
                <div className="space-y-2">
                  <img 
                    src={display.image_logo} 
                    alt="Logo" 
                    className="w-24 h-24 mx-auto object-contain border rounded-lg"
                  />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.show_logo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {display.show_logo ? 'Exibindo' : 'Oculto'}
                  </span>
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Imagem de Fundo</h5>
              {display.image_background ? (
                <div className="space-y-2">
                  <img 
                    src={display.image_background} 
                    alt="Fundo" 
                    className="w-24 h-24 mx-auto object-contain border rounded-lg"
                  />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.show_background ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {display.show_background ? 'Exibindo' : 'Oculto'}
                  </span>
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Imagem Promocional</h5>
              {display.image_promotional ? (
                <div className="space-y-2">
                  <img 
                    src={display.image_promotional} 
                    alt="Promocional" 
                    className="w-24 h-24 mx-auto object-contain border rounded-lg"
                  />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.show_promotional ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {display.show_promotional ? 'Exibindo' : 'Oculto'}
                  </span>
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card de Configurações */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-orange-50 px-4 py-3 border-b border-orange-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-semibold text-gray-900">Configurações de Exibição</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Elementos Visuais</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Exibir Ticket Atual</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.show_current_ticket ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {display.show_current_ticket ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Exibir Histórico</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.show_ticket_history ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {display.show_ticket_history ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Exibir Info do Contador</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.show_counter_info ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {display.show_counter_info ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Atualização</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Atualização Automática</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    display.auto_refresh ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {display.auto_refresh ? 'Sim' : 'Não'}
                  </span>
                </div>
                {display.auto_refresh && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Intervalo</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {display.refresh_interval}s
                    </span>
                  </div>
                )}
              </div>
            </div>
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
              <p className="text-sm font-medium text-gray-900">{formatDate(display.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(display.updated_at)}</p>
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

      {/* Modal de Seleção de Localização */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
      />
    </div>
  );
};

export default DisplayView;
