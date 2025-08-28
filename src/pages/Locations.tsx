import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Location, LocationFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import LocationForm from '../components/locations/LocationForm';
import LocationView from '../components/locations/LocationView';

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'true', label: 'Ativas' },
  { value: 'false', label: 'Inativas' },
];

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [zipCodeFilter, setZipCodeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLocations();
  }, [currentPage]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);

      // Construir filtros
      const filters: LocationFilters = {};

      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'true';
      }

      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }

      if (nameFilter.trim()) {
        filters.name = nameFilter;
      }

      if (addressFilter.trim()) {
        filters.address = addressFilter;
      }

      if (cityFilter.trim()) {
        filters.city = cityFilter;
      }

      if (stateFilter.trim()) {
        filters.state = stateFilter;
      }

      if (zipCodeFilter.trim()) {
        filters.zip_code = zipCodeFilter;
      }

      const response = await apiService.getLocations(filters, currentPage);
      setLocations(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar localizações.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchLocations();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (nameFilter.trim()) count++;
    if (addressFilter.trim()) count++;
    if (cityFilter.trim()) count++;
    if (stateFilter.trim()) count++;
    if (zipCodeFilter.trim()) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setNameFilter('');
    setAddressFilter('');
    setCityFilter('');
    setStateFilter('');
    setZipCodeFilter('');
    setCurrentPage(1);
    fetchLocations();
  };

  const onSubmit = async (location: Location) => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setSelectedLocation(null);
    clearFilters();
    fetchLocations();
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) return;

    try {
      await apiService.deleteLocation(location.id);
      fetchLocations();
      toast.success('Localização excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir localização.');
    }
  };

  const openEditModal = (location: Location) => {
    setSelectedLocation(location);
    setShowEditModal(true);
  };

  const openViewModal = (location: Location) => {
    setSelectedLocation(location);
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
    setSelectedLocation(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedLocation(null);
    fetchLocations();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Inativo';
  };

  const canEditLocation = (location: Location) => {
    return true; // Todas as localizações podem ser editadas
  };

  const canDeleteLocation = (location: Location) => {
    return true; // Todas as localizações podem ser excluídas
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (location: Location) => <span className="font-mono text-sm">{location.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (location: Location) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{location.name}</span>
        </div>
      )
    },
    {
      key: 'address',
      header: 'Endereço',
      render: (location: Location) => (
        <span className="text-sm text-gray-900">
          {location.address ? (
            <>
              {location.address}
              {location.number && `, ${location.number}`}
              {location.complement && ` - ${location.complement}`}
            </>
          ) : 'N/A'}
        </span>
      )
    },
    {
      key: 'city_state',
      header: 'Cidade/Estado',
      render: (location: Location) => (
        <span className="text-sm text-gray-900">
          {location.city && location.state ? `${location.city}/${location.state}` : 'N/A'}
        </span>
      )
    },
    {
      key: 'zip_code',
      header: 'CEP',
      render: (location: Location) => (
        <span className="text-sm text-gray-900">{location.zip_code || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (location: Location) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(location.is_active)}`}>
          {getStatusText(location.is_active)}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (location: Location) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(location.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (location: Location) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(location)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canEditLocation(location) && (
            <Button
              onClick={() => openEditModal(location)}
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDeleteLocation(location) && (
            <Button
              onClick={() => handleDeleteLocation(location)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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
          Nova Localização
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
              options={statusOptions}
            />
          </div>

          {/* Filtro por nome específico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <Input
              type="text"
              placeholder="Digite o nome..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <Input
              type="text"
              placeholder="Digite o endereço..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <Input
              type="text"
              placeholder="Digite a cidade..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <Input
              type="text"
              placeholder="Digite o estado..."
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por CEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <Input
              type="text"
              placeholder="Digite o CEP..."
              value={zipCodeFilter}
              onChange={(e) => setZipCodeFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Localizações */}
      <div className="space-y-4">
        <Table
          title="Lista de Localizações"
          data={locations}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhuma localização encontrada. Tente ajustar os filtros ou criar uma nova localização."
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
                    {locations.length} localizações
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
        title="Criar Nova Localização"
        size="3xl"
      >
        <LocationForm
          onSubmit={onSubmit}
          onCancel={closeCreateModal}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Localização"
        size="3xl"
      >
        <LocationForm
          location={selectedLocation || undefined}
          isEditing={true}
          onSubmit={onSubmit}
          onCancel={closeEditModal}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Localização"
        size="3xl"
      >
        {selectedLocation && (
          <LocationView
            location={selectedLocation}
            onClose={closeViewModal}
            onEdit={() => {
              closeViewModal();
              openEditModal(selectedLocation);
            }}
            onDelete={() => {
              closeViewModal();
              handleDeleteLocation(selectedLocation);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Locations;
