import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Category, CategoryFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';

const categorySchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  is_active: yup.boolean().optional().default(true),
});

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
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
    watch,
  } = useForm({
    resolver: yupResolver(categorySchema),
  });

  useEffect(() => {
    fetchCategories();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      // Construir filtros conforme a documentação da API
      const filters: CategoryFilters = {};

      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }

      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }

      // Fazer a requisição com filtros
      const response = await apiService.getCategories(filters, currentPage);

      setCategories(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar categorias:');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset para primeira página ao aplicar filtros
    fetchCategories();
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
    fetchCategories();
  };

  const handleCreateCategory = async (data: any) => {
    try {
      const categoryData = {
        ...data,
      };
      
      await apiService.createCategory(categoryData);
      setShowCreateModal(false);
      reset();
      fetchCategories();
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar categoria: ' + error);
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
      toast.error('Erro ao atualizar categoria: ' + error);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await apiService.deleteCategory(category.id);
      fetchCategories();
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir categoria: ' + error);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setValue('name', category.name);
    setValue('is_active', category.is_active);
    // TODO: Implementar seleção de serviço na edição
    setShowEditModal(true);
  };

  const openViewModal = (category: Category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (category: Category) => <span className="font-mono text-sm">{category.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (category: Category) => (
        <div className="flex items-center space-x-3">
          <Tag className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-900">{category.name}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (category: Category) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {category.is_active ? 'Ativa' : 'Inativa'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (category: Category) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(category.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (category: Category) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(category)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => openEditModal(category)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => handleDeleteCategory(category)}
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
          Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Categorias"
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
                { value: 'active', label: 'Ativas' },
                { value: 'inactive', label: 'Inativas' },
              ]}
            />
          </div>
        </div>
      </FiltersPanel>

            {/* Tabela de Categorias */}
      <div className="space-y-4">
        <Table
          title="Lista de Categorias"
          data={categories}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhuma categoria encontrada. Tente ajustar os filtros ou criar uma nova categoria."
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
                    {categories.length} categorias
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
        title="Criar Nova Categoria"
        size="xl"
      >
        <form onSubmit={handleSubmit(handleCreateCategory)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <Input
              {...register('name')}
              placeholder="Nome da categoria"
              error={errors.name?.message}
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <Checkbox
                {...register('is_active')}
                checked={watch('is_active')}
                onChange={(e) => setValue('is_active', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Categoria ativa</span>
            </label>
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
        size="xl"
      >
        <form onSubmit={handleSubmit(handleUpdateCategory)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <Input
              {...register('name')}
              placeholder="Nome da categoria"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <Checkbox
                {...register('is_active')}
                checked={watch('is_active')}
                onChange={(e) => setValue('is_active', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Categoria ativa</span>
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
              Atualizar Categoria
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Visualizar Categoria"
        size="xl"
      >
        {selectedCategory && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações da Categoria</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedCategory.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedCategory.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCategory.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCategory.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedCategory.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Serviços Associados</h4>
                {selectedCategory.services && selectedCategory.services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCategory.services.map((service) => (
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
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedCategory);
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

export default Categories;
