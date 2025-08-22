import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Layers,
  Calendar,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Type, TypeFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';

const typeSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  image: yup.string().url('URL inválida').optional(),
  is_active: yup.boolean().optional().default(true),
});

const Types: React.FC = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedType, setSelectedType] = useState<Type | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(typeSchema),
  });

  useEffect(() => {
    fetchTypes();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      
      // Construir filtros conforme a documentação da API
      const filters: TypeFilters = {};
      
      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }
      
      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }
      
      // Fazer a requisição com filtros
      const response = await apiService.getTypes(filters, currentPage);
      
      setTypes(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar tipos: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset para primeira página ao aplicar filtros
    fetchTypes();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    fetchTypes();
  };

  const handleCreateType = async (data: any) => {
    try {
      await apiService.createType(data);
      setShowCreateModal(false);
      reset();
      fetchTypes();
      toast.success('Tipo criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar tipo: ' + error);
    }
  };

  const handleUpdateType = async (data: any) => {
    if (!selectedType) return;
    try {
      await apiService.updateType(selectedType.id, data);
      setShowEditModal(false);
      reset();
      setSelectedType(null);
      fetchTypes();
      toast.success('Tipo atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar tipo: ' + error);
    }
  };

  const handleDeleteType = async (type: Type) => {
    if (!confirm('Tem certeza que deseja excluir este tipo?')) return;
    try {
      await apiService.deleteType(type.id);
      fetchTypes();
      toast.success('Tipo excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir tipo: ' + error);
    }
  };

  const openEditModal = (type: Type) => {
    setSelectedType(type);
    setValue('name', type.name);
    setValue('image', type.image || '');
    setValue('is_active', type.is_active);
    setShowEditModal(true);
  };

  const openViewModal = (type: Type) => {
    setSelectedType(type);
    setShowViewModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (type: Type) => <span className="font-mono text-sm">{type.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (type: Type) => (
        <div className="flex items-center space-x-3">
          {type.image ? (
            <img src={type.image} alt={type.name} className="h-8 w-8 rounded object-cover" />
          ) : (
            <Layers className="h-8 w-8 text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-900">{type.name}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (type: Type) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          type.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {type.is_active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (type: Type) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(type.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (type: Type) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(type)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => openEditModal(type)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => handleDeleteType(type)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Tipos"
        onApply={applyFilters}
        onClear={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Busca por nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome
            </label>
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as string)}
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: 'Ativos' },
                { value: 'inactive', label: 'Inativos' },
              ]}
            />
          </div>
        </div>
      </FiltersPanel>

            {/* Tabela de Tipos */}
      <div className="space-y-4">
        <Table
          title="Lista de Tipos"
          data={types}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum tipo encontrado. Tente ajustar os filtros ou criar um novo tipo."
          variant="modern"
          showRowNumbers={false}
        />

        {/* Paginação */}
        {!isLoading && totalPages > 1 && (
          <Card className="bg-gradient-to-r from-teal-50 to-blue-50">
            <div className="p-4">
              <div className="flex justify-center items-center space-x-4">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-md hover:shadow-lg"
                >
                  Anterior
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    {types.length} tipos
                  </span>
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-md hover:shadow-lg"
                >
                  Próxima
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Tipo"
        size="xl"
      >
        <form onSubmit={handleSubmit(handleCreateType)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <Input
              {...register('name')}
              placeholder="Nome do tipo"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem (URL)
            </label>
            <Input
              {...register('image')}
              placeholder="https://example.com/icon.png"
              error={errors.image?.message}
            />
          </div>

          <div>
            <Checkbox
              label="Tipo ativo"
              onChange={(e) => setValue('is_active', e.target.checked)}
              checked={watch('is_active')} 
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              onClick={() => setShowCreateModal(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button type="submit">
              Criar Tipo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Tipo"
        size="xl"
      >
        <form onSubmit={handleSubmit(handleUpdateType)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <Input
              {...register('name')}
              placeholder="Nome do tipo"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem (URL)
            </label>
            <Input
              {...register('image')}
              placeholder="https://example.com/icon.png"
              error={errors.image?.message}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <Checkbox
                label="Tipo ativo"
                onChange={(e) => setValue('is_active', e.target.checked)}
                checked={watch('is_active')} 
              />
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              onClick={() => setShowEditModal(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button type="submit">
              Atualizar Tipo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Visualizar Tipo"
        size="xl"
      >
        {selectedType && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Tipo</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedType.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedType.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedType.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedType.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedType.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Serviços Associados</h4>
                {selectedType.services && selectedType.services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedType.services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Settings className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum serviço associado</p>
                )}

                {selectedType.image && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Imagem</h4>
                    <img 
                      src={selectedType.image} 
                      alt={selectedType.name} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedType);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Editar
              </Button>
              <Button onClick={() => setShowViewModal(false)} variant="outline">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Types;
