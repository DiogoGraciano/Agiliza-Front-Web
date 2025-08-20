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
  ToggleRight,
  FunnelX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Category, Service } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ServiceSelectionModal from '../components/ui/ServiceSelectionModal';

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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceSelectionModal, setShowServiceSelectionModal] = useState(false);
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
    watch,
  } = useForm({
    resolver: yupResolver(categorySchema),
  });

  useEffect(() => {
    fetchCategories();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  useEffect(() => {
    fetchServices();
  }, []); // Executar apenas uma vez ao montar o componente

  const fetchCategories = async () => {
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

      if (selectedService) {
        params.append('service_id', selectedService.id.toString());
      }

      // Adicionar página atual
      params.append('page', currentPage.toString());

      // Fazer a requisição com filtros
      const response = await apiService.getCategories(params.toString());

      setCategories(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar categorias:');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchCategories();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedService(null);
    setCurrentPage(1);
  };

  const fetchServices = async () => {
    try {
      const response = await apiService.getServices();
      setServices(response.data);
    } catch (error) {
      toast.error('Erro ao carregar serviços:');
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      await apiService.createCategory(data);
      setShowCreateModal(false);
      reset();
      fetchCategories();
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar categoria:');
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
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar categoria:');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await apiService.deleteCategory(id);
        fetchCategories();
        toast.success('Categoria excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir categoria:');
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
      toast.success('Status da categoria alterado com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar status da categoria:');
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
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${value
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
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serviço
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Selecione um serviço..."
                value={selectedService ? selectedService.name : ''}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowServiceSelectionModal(true)}
                size="sm"
              >
                Selecionar
              </Button>
            </div>
          </div>
        </div>

        {/* Botões de ação dos filtros */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            <FunnelX className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
          <Button
            variant="outline"
            onClick={applyFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={categories}
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

          <Select
            label="Serviço"
            options={services.map(service => ({
              value: service.id,
              label: service.name
            }))}
            placeholder="Selecione um serviço"
            error={errors.service_id?.message}
            name="service_id"
            onChange={(value) => setValue('service_id', Number(value))}
            searchable
            searchPlaceholder="Pesquisar serviços..."
            noOptionsText="Nenhum serviço encontrado"
            required
          />

          <Checkbox
            id="is_active"
            label="Categoria Ativa"
            description="Marque para ativar esta categoria"
            defaultChecked={true}
            {...register('is_active')}
          />

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

          <Select
            label="Serviço"
            options={services.map(service => ({
              value: service.id,
              label: service.name
            }))}
            error={errors.service_id?.message}
            name="service_id"
            value={watch('service_id')}
            onChange={(value) => setValue('service_id', Number(value))}
            searchable
            searchPlaceholder="Pesquisar serviços..."
            noOptionsText="Nenhum serviço encontrado"
            required
          />

          <Checkbox
            id="edit_is_active"
            label="Categoria Ativa"
            description="Marque para ativar esta categoria"
            {...register('is_active')}
          />

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
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${selectedCategory.is_active
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

      {/* Modal de Seleção de Serviço */}
      <ServiceSelectionModal
        isOpen={showServiceSelectionModal}
        onClose={() => setShowServiceSelectionModal(false)}
        onSelect={(service) => {
          setSelectedService(service as Service);
          setShowServiceSelectionModal(false);
        }}
      />
    </div>
  );
};

export default Categories;
