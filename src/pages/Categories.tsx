import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Category, CategoryFilters, Type } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import TypeSelectionModal from '../components/selectionModals/TypeSelectionModal';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryView from '../components/categories/CategoryView';

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
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [filterType, setFilterType] = useState<Type | null>(null);
  const [typeSelectionContext, setTypeSelectionContext] = useState<'filter' | 'form'>('filter');
  const [shouldApplyFilters, setShouldApplyFilters] = useState(true);

  useEffect(() => {
    if (shouldApplyFilters) {
      fetchCategories();
    } else {
      fetchCategoriesWithoutFilters();
    }
  }, [currentPage, shouldApplyFilters]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const filters: CategoryFilters = {};

      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }

      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }

      if (filterType) {
        filters.type_id = filterType.id;
      }

      const response = await apiService.getCategories(filters, currentPage);

      setCategories(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao buscar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoriesWithoutFilters = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCategories({}, currentPage);
      setCategories(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao buscar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await apiService.deleteCategory(category.id);
      toast.success('Categoria excluída com sucesso!');
      fetchCategories();
    } catch (error: any) {
      toast.error('Erro ao excluir categoria.');
    }
  };

  const onSubmit = async (_data: any) => {
    try {
      fetchCategories();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar categoria.');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const openViewModal = (category: Category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedCategory(null);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setShouldApplyFilters(true);
    fetchCategories();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (filterType) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFilterType(null);
    setCurrentPage(1);
    setShouldApplyFilters(false);
    fetchCategoriesWithoutFilters();
  };

  const handleTypeSelect = (type: Type) => {
    if (typeSelectionContext === 'filter') {
      setFilterType(type);
    }
    setShowTypeSelectionModal(false);
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
      key: 'type',
      header: 'Tipo',
      render: (category: Category) => (
        <div className="flex items-center space-x-3">
          <Layers className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-gray-900">{category.type?.name || 'N/A'}</span>
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
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
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

          {/* Filtro por categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Selecione tipo"
                value={filterType?.name}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => {
                  setTypeSelectionContext('filter');
                  setShowTypeSelectionModal(true);
                }}
                variant="outline"
                size="sm"
              >
                <Layers className="h-4 w-4" />
              </Button>
              {filterType && (
                <Button
                  onClick={() => {
                    setFilterType(null);
                    setShouldApplyFilters(false);
                    fetchCategoriesWithoutFilters();
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              )}
            </div>
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
        onClose={closeCreateModal}
        title="Criar Nova Categoria"
        size="2xl"
      >
        <CategoryForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Categoria"
        size="2xl"
      >
        <CategoryForm
          category={selectedCategory}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Categoria"
        size="3xl"
      >
        {selectedCategory && (
          <CategoryView
            category={selectedCategory}
            onClose={closeViewModal}
          />
        )}
      </Modal>

      <TypeSelectionModal
        isOpen={showTypeSelectionModal}
        onClose={() => setShowTypeSelectionModal(false)}
        onSelect={handleTypeSelect}
      />
    </div>
  );
};

export default Categories;
