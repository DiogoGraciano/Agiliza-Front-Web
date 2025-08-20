import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Layers,
  Calendar,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  FunnelX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Type } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

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
  } = useForm({
    resolver: yupResolver(typeSchema),
  });

  useEffect(() => {
    fetchTypes();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      
      // Construir parâmetros de filtro
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('is_active', statusFilter === 'active' ? 'true' : 'false');
      }
      
      if (searchTerm.trim()) {
        params.append('name', searchTerm);
      }
      
      // Adicionar página atual
      params.append('page', currentPage.toString());
      
      // Fazer a requisição com filtros
      const response = await apiService.getTypes(params.toString());
      
      setTypes(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar tipos: ' + error);
    } finally {
      setIsLoading(false);
    }
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

  const handleDeleteType = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo?')) {
      try {
        await apiService.deleteType(id);
        fetchTypes();
        toast.success('Tipo excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir tipo: ' + error);
      }
    }
  };

  const handleToggleStatus = async (type: Type) => {
    try {
      await apiService.updateType(type.id, {
        ...type,
        is_active: !type.is_active,
      });
      fetchTypes();
      toast.success('Status do tipo alterado com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar status do tipo: ' + error);
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

  const columns = [
    {
      key: 'id',
      header: 'ID',
      className: 'w-16',
    },
    {
      key: 'name',
      header: 'Nome',
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <Layers className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'image',
      header: 'Imagem',
      render: (value: string) => (
        <div className="flex items-center">
          <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {value ? 'Sim' : 'Não'}
          </span>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value: boolean, item: Type) => (
        <button
          onClick={() => handleToggleStatus(item)}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            value 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {value ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          <span>{value ? 'Ativo' : 'Inativo'}</span>
        </button>
      ),
    },
    {
      key: 'created_at',
      header: 'Data de Criação',
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString('pt-BR')}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (_: any, item: Type) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openViewModal(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteType(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchTypes();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os tipos de serviços do sistema
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={applyFilters}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full ml-2"
            >
              <FunnelX className="h-4 w-4 mr-2" />  
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={types}
          isLoading={isLoading}
          emptyMessage="Nenhum tipo encontrado"
        />
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Tipo"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateType)} className="space-y-4">
          <Input
            label="Nome do Tipo"
            placeholder="Ex: Urgente"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="URL da Imagem (opcional)"
            placeholder="https://exemplo.com/icone.png"
            error={errors.image?.message}
            {...register('image')}
            helperText="URL de um ícone representativo do tipo"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              defaultChecked={true}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Tipo Ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
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
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateType)} className="space-y-4">
          <Input
            label="Nome do Tipo"
            placeholder="Ex: Urgente"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="URL da Imagem (opcional)"
            placeholder="https://exemplo.com/icone.png"
            error={errors.image?.message}
            {...register('image')}
            helperText="URL de um ícone representativo do tipo"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit_is_active"
              {...register('is_active')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700">
              Tipo Ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
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
        title="Detalhes do Tipo"
        size="lg"
      >
        {selectedType && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Layers className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedType.name}</h3>
                <p className="text-sm text-gray-500">Tipo de serviço</p>
                <div className="flex items-center mt-1">
                  {selectedType.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedType.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedType.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            {selectedType.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem</label>
                <div className="mt-2">
                  <img
                    src={selectedType.image}
                    alt={selectedType.name}
                    className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedType.image}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedType.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedType.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedType);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Types;
