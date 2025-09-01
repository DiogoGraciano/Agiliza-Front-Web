import React from 'react';
import { 
  Calendar, 
  Briefcase, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Shield,
  Layers,
  Tag,
  Settings
} from 'lucide-react';
import type { Service } from '../../types';
import Button from '../ui/Button';

interface ServiceViewProps {
  service: Service;
  onClose: () => void;
}

const ServiceView: React.FC<ServiceViewProps> = ({
  service,
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
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
              <p className="text-gray-600">Serviço criado em {formatDate(service.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
              <Shield className="w-4 h-4 mr-2" />
              ID: {service.id}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Informações Básicas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações do Serviço</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
              <p className="text-sm font-medium text-gray-900">{service.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
              <p className="text-sm text-gray-900">{service.description}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dashboard</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${service.show_in_dashboard ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {service.show_in_dashboard ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Exibido no Dashboard
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Não exibido no Dashboard
                  </>
                )}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ordem de Exibição</label>
              <p className="text-sm font-medium text-gray-900">{service.order}</p>
            </div>
          </div>
        </div>

        {/* Card de Imagem */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Imagem</h4>
            </div>
          </div>
          <div className="p-4">
            {service.image ? (
              <div className="space-y-3">
                <img 
                  src={service.image} 
                  alt={`Imagem do serviço ${service.name}`}
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
                  href={service.image} 
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
      </div>

      {/* Card de Relacionamentos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Relacionamentos</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categorias */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-green-500" />
                <span>Categorias</span>
              </h5>
              {service.categories && service.categories.length > 0 ? (
                <div className="space-y-2">
                  {service.categories.map(category => (
                    <div key={category.id} className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center space-x-3">
                        <Tag className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          {category.type && (
                            <p className="text-xs text-gray-600">Tipo: {category.type.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : service.category ? (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Tag className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.category.name}</p>
                      {service.category.type && (
                        <p className="text-xs text-gray-600">Tipo: {service.category.type.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma categoria associada</p>
              )}
            </div>

            {/* Tipos */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Tipos</span>
              </h5>
              {service.types && service.types.length > 0 ? (
                <div className="space-y-2">
                  {service.types.map(type => (
                    <div key={type.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{type.name}</p>
                          {type.image && (
                            <img 
                              src={type.image} 
                              alt={type.name} 
                              className="w-6 h-6 object-cover rounded border border-gray-200 mt-1"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum tipo associado</p>
              )}
            </div>

            {/* Setor */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>Setor</span>
              </h5>
              {service.sector ? (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.sector.name}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum setor associado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card de Requisitos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h4 className="text-lg font-semibold text-gray-900">Requisitos do Serviço</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className={`w-3 h-3 rounded-full ${service.needs_attachment ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-700">Anexo obrigatório</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className={`w-3 h-3 rounded-full ${service.needs_address ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-700">Endereço obrigatório</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className={`w-3 h-3 rounded-full ${service.needs_phone ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-700">Telefone obrigatório</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className={`w-3 h-3 rounded-full ${service.needs_birth_date ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-700">Data de nascimento obrigatória</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className={`w-3 h-3 rounded-full ${service.needs_cpf_cnpj ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-700">CPF/CNPJ obrigatório</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className={`w-3 h-3 rounded-full ${service.needs_email ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm text-gray-700">Email obrigatório</span>
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
              <p className="text-sm font-medium text-gray-900">{formatDate(service.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(service.updated_at)}</p>
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

export default ServiceView;
