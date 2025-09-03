import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Smartphone,
  Hash,
  MapPin,
  Calendar,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Device, DeviceFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import DeviceForm from '../components/devices/DeviceForm';
import DeviceView from '../components/devices/DeviceView';

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDevices();
  }, [currentPage]);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      
      const filters: DeviceFilters = {};
      
      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }
      
      if (locationFilter.trim()) {
        const locationId = parseInt(locationFilter);
        if (!isNaN(locationId)) {
          filters.location_id = locationId;
        }
      }
      
      const response = await apiService.getDevices(filters, currentPage);
      setDevices(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
      toast.error('Erro ao buscar dispositivos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    if (!confirm('Tem certeza que deseja excluir este dispositivo?')) return;
    
    try {
      await apiService.deleteDevice(device.id);
      toast.success('Dispositivo excluído com sucesso!');
      fetchDevices();
    } catch (error: any) {
      toast.error('Erro ao excluir dispositivo.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      fetchDevices();
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar dispositivo.');
    }
  };

  const openEditModal = (device: Device) => {
    setSelectedDevice(device);
    setShowEditModal(true);
  };

  const openViewModal = (device: Device) => {
    setSelectedDevice(device);
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
    setSelectedDevice(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDevice(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchDevices();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
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
      render: (device: Device) => <span className="font-mono text-sm">{device.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (device: Device) => (
        <div className="flex items-center space-x-2">
          <Smartphone className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{device.name}</span>
        </div>
      )
    },
    {
      key: 'token',
      header: 'Token',
      render: (device: Device) => (
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4 text-gray-500" />
          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border">
            {device.token.length > 20 ? `${device.token.substring(0, 20)}...` : device.token}
          </code>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Localização',
      render: (device: Device) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {device.location ? device.location.name : 'Não definida'}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (device: Device) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(device.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (device: Device) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(device)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => openEditModal(device)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleDeleteDevice(device)}
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
          Novo Dispositivo
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Filtro por localização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID da Localização
            </label>
            <Input
              type="number"
              placeholder="Digite o ID da localização..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Dispositivos */}
      <div className="space-y-4">
        <Table
          title="Lista de Dispositivos"
          data={devices}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum dispositivo encontrado. Tente ajustar os filtros ou criar um novo dispositivo."
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
                    {devices.length} dispositivos
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
        title="Criar Novo Dispositivo"
        size="2xl"
      >
        <DeviceForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Dispositivo"
        size="2xl"
      >
        <DeviceForm
          device={selectedDevice}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Dispositivo"
        size="3xl"
      >
        {selectedDevice && (
          <DeviceView
            device={selectedDevice}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Devices;
