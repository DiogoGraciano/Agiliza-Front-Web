import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Layers,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Type, TypeFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import Select from '../components/ui/Select';
import TypeForm from '../components/types/TypeForm';
import TypeView from '../components/types/TypeView';

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

  useEffect(() => {
    fetchTypes();
  }, [currentPage]);

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      
      const filters: TypeFilters = {};
      
      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }
      
      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }
      
      const response = await apiService.getTypes(filters, currentPage);
      
      setTypes(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
      toast.error('Erro ao buscar tipos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteType = async (type: Type) => {
    if (!confirm('Tem certeza que deseja excluir este tipo?')) return;
    
    try {
      await apiService.deleteType(type.id);
      toast.success('Tipo excluído com sucesso!');
      fetchTypes();
    } catch (error: any) {
      toast.error('Erro ao excluir tipo.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      fetchTypes();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar tipo.');
    }
  };

  const openEditModal = (type: Type) => {
    setSelectedType(type);
    setShowEditModal(true);
  };

  const openViewModal = (type: Type) => {
    setSelectedType(type);
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
    setSelectedType(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedType(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchTypes();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    return count;
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
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
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
        onClose={closeCreateModal}
        title="Criar Novo Tipo"
        size="2xl"
      >
        <TypeForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Tipo"
        size="2xl"
      >
        <TypeForm
          type={selectedType}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Tipo"
        size="3xl"
      >
        {selectedType && (
          <TypeView
            type={selectedType}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Types;
