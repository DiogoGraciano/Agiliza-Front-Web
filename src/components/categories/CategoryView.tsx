import React from 'react';
import { 
  Calendar, 
  Tag, 
  Layers,
  CheckCircle,
  XCircle,
  Shield,
  Settings
} from 'lucide-react';
import type { Category } from '../../types';
import Button from '../ui/Button';

interface CategoryViewProps {
  category: Category;
  onClose: () => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({
  category,
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
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              <p className="text-gray-600">Categoria criada em {formatDate(category.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
              <Shield className="w-4 h-4 mr-2" />
              ID: {category.id}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Informações Básicas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-green-50 px-4 py-3 border-b border-green-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações da Categoria</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
              <p className="text-sm font-medium text-gray-900">{category.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {category.is_active ? (
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
        </div>

        {/* Card de Tipo */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Tipo Associado</h4>
            </div>
          </div>
          <div className="p-4">
            {category.type ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{category.type.name}</h5>
                    {category.type.image && (
                      <img 
                        src={category.type.image} 
                        alt={category.type.name} 
                        className="w-8 h-8 object-cover rounded border border-gray-200 mt-1"
                      />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <p>• Esta categoria pertence ao tipo: <strong>{category.type.name}</strong></p>
                  <p>• O tipo define a classificação principal da categoria</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Layers className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Nenhum tipo associado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card de Serviços Associados */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Serviços Associados</h4>
          </div>
        </div>
        <div className="p-4">
          {category.services && category.services.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Esta categoria possui os seguintes serviços associados:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.services.map((service) => (
                  <div key={service.id} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Settings className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {service.name}
                        </h5>
                        {service.description && (
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Serviço
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
              <p className="text-sm text-gray-500">Nenhum serviço associado</p>
              <p className="text-xs text-gray-400 mt-1">
                Esta categoria ainda não possui serviços vinculados
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
              <p className="text-sm font-medium text-gray-900">{formatDate(category.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Atualizado em</label>
              <p className="text-sm font-medium text-gray-900">{formatDate(category.updated_at)}</p>
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

export default CategoryView;
