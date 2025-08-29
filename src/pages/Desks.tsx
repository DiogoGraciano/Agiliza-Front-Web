import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Settings,
  Hash,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Desk, DeskFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import DeskForm from '../components/desks/DeskForm';
import DeskView from '../components/desks/DeskView';

const Desks: React.FC = () => {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [numberFilter, setNumberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDesks();
  }, [currentPage]);

  const fetchDesks = async () => {
    try {
      setIsLoading(true);
      
      const filters: DeskFilters = {};
      
      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }
      
      if (numberFilter.trim()) {
        filters.number = numberFilter;
      }
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (locationFilter.trim()) {
        const locationId = parseInt(locationFilter);
        if (!isNaN(locationId)) {
          filters.location_id = locationId;
        }
      }
      
      const response = await apiService.getDesks(filters, currentPage);
      setDesks(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar guichês:', error);
      toast.error('Erro ao buscar guichês');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDesk = async (desk: Desk) => {
    if (!confirm('Tem certeza que deseja excluir este guichê?')) return;
    
    try {
      await apiService.deleteDesk(desk.id);
      toast.success('Guichê excluído com sucesso!');
      fetchDesks();
    } catch (error: any) {
      toast.error('Erro ao excluir guichê.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      fetchDesks();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar guichê.');
    }
  };

  const openEditModal = (desk: Desk) => {
    setSelectedDesk(desk);
    setShowEditModal(true);
  };

  const openViewModal = (desk: Desk) => {
    setSelectedDesk(desk);
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
    setSelectedDesk(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDesk(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setNumberFilter('');
    setStatusFilter('all');
    setLocationFilter('');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchDesks();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (numberFilter.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (locationFilter.trim()) count++;
    return count;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (desk: Desk) => <span className="font-mono text-sm">{desk.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (desk: Desk) => (
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{desk.name}</span>
        </div>
      )
    },
    {
      key: 'number',
      header: 'Número',
      render: (desk: Desk) => (
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-purple-600">{desk.number}</span>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Localização',
      render: (desk: Desk) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {desk.location ? desk.location.name : 'Não definida'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (desk: Desk) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${desk.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {desk.status === 'active' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Inativo
            </>
          )}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (desk: Desk) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(desk.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (desk: Desk) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(desk)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => openEditModal(desk)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleDeleteDesk(desk)}
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
          Novo Guichê
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Busca"
        onApply={applyFilters}
        onClear={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Filtro por número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <Input
              type="text"
              placeholder="Digite o número..."
              value={numberFilter}
              onChange={(e) => setNumberFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          {/* Filtro por localização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID da Localização
            </label>
            <Input
              type="number"
              placeholder="Digite o ID..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Guichês */}
      <div className="space-y-4">
        <Table
          title="Lista de Guichês"
          data={desks}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum guichê encontrado. Tente ajustar os filtros ou criar um novo guichê."
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
                    {desks.length} guichês
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
        title="Criar Novo Guichê"
        size="2xl"
      >
        <DeskForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Guichê"
        size="2xl"
      >
        <DeskForm
          desk={selectedDesk}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Guichê"
        size="3xl"
      >
        {selectedDesk && (
          <DeskView
            desk={selectedDesk}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Desks;
