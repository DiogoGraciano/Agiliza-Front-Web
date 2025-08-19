import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Tag,
  Calendar,
  Settings,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Category, Service } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

const categorySchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  service_id: yup.number().required('Serviço é obrigatório'),
  is_active: yup.boolean().optional().default(true),
});

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(categorySchema),
  });

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [currentPage, statusFilter]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (statusFilter === 'all') {
        response = await apiService.getCategories();
      } else {
        response = await apiService.getCategories(); // API não tem filtro por status para categorias
      }
      
      setCategories(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await apiService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      await apiService.createCategory(data);
      setShowCreateModal(false);
      reset();
      fetchCategories();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleUpdateCategory = async (data: any) => {
    if (!selectedCategory) return;
    
    try {
      await apiService.updateCategory(selectedCategory.id, data);
      setShowEditModal(false);
      reset();
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await apiService.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await apiService.updateCategory(category.id, {
        ...category,
        is_active: !category.is_active,
      });
      fetchCategories();
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setValue('name', category.name);
    setValue('service_id', category.service_id);
    setValue('is_active', category.is_active);
    setShowEditModal(true);
  };

  const openViewModal = (category: Category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.is_active) ||
                         (statusFilter === 'inactive' && !category.is_active);
    return matchesSearch && matchesStatus;
  });

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
          <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            <Tag className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Serviço',
      render: (value: Service) => (
        <div className="flex items-center">
          <Settings className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value?.name || 'Não definido'}</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value: boolean, item: Category) => (
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
      render: (_: any, item: Category) => (
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
            onClick={() => handleDeleteCategory(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todas as categorias dos serviços
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
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
                placeholder="Buscar por nome ou serviço..."
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
              onClick={fetchCategories}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Atualizar Lista
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={filteredCategories}
          isLoading={isLoading}
          emptyMessage="Nenhuma categoria encontrada"
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
        title="Nova Categoria"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateCategory)} className="space-y-4">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Infraestrutura"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serviço
            </label>
            <select
              {...register('service_id')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Selecione um serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.service_id && (
              <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              defaultChecked={true}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Categoria Ativa
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
              Criar Categoria
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Categoria"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateCategory)} className="space-y-4">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Infraestrutura"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serviço
            </label>
            <select
              {...register('service_id')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit_is_active"
              {...register('is_active')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700">
              Categoria Ativa
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
              Atualizar Categoria
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes da Categoria"
        size="lg"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tag className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedCategory.name}</h3>
                <p className="text-sm text-gray-500">Categoria do serviço</p>
                <div className="flex items-center mt-1">
                  {selectedCategory.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedCategory.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCategory.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Serviço Associado</label>
              <p className="text-sm text-gray-900 mt-1 flex items-center">
                <Settings className="h-4 w-4 text-gray-400 mr-2" />
                {selectedCategory.service?.name || 'Não definido'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCategory.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCategory.updated_at).toLocaleDateString('pt-BR')}
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
                  openEditModal(selectedCategory);
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

export default Categories;
