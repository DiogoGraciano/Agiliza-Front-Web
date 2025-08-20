import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  User as UserIcon,
  Calendar,
  FunnelX,
  File
} from 'lucide-react';
import toast from 'react-hot-toast';

import apiService from '../services/api';
import type { Manifest, User, Service } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import UserSelectionModal from '../components/ui/UserSelectionModal';
import ServiceSelectionModal from '../components/ui/ServiceSelectionModal';
import FilePreview from '../components/ui/FilePreview';
import ManifestForm from '../components/ui/ManifestForm';
import { useAuth } from '../contexts/AuthContext';
import Select from '../components/ui/Select';

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'accepted', label: 'Aceitos' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'rejected', label: 'Rejeitados' },
  { value: 'cancelled', label: 'Cancelados' },
];

const Manifests: React.FC = () => {
  const { user } = useAuth();
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zipCodeFilter, setZipCodeFilter] = useState<string>('');
  const [addressFilter, setAddressFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(user?.role === 'admin' ? null : user);
  const [filterService, setFilterService] = useState<Service | null>(null);
  const [formService, setFormService] = useState<Service | null>(null);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [showServiceSelectionModal, setShowServiceSelectionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchManifests();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchManifests = async () => {
    try {
      setIsLoading(true);

      // Construir parâmetros de filtro
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm.trim()) {
        params.append('description', searchTerm);
      }

      if (selectedUser) {
        params.append('user_id', selectedUser.id.toString());
      }

      if (filterService) {
        params.append('service_id', filterService.id.toString());
      }

      if (zipCodeFilter.trim()) {
        params.append('zip_code', zipCodeFilter);
      }

      if (addressFilter.trim()) {
        params.append('address', addressFilter);
      }

      if (cityFilter.trim()) {
        params.append('city', cityFilter);
      }

      // Adicionar página atual
      params.append('page', currentPage.toString());

      // Fazer a requisição com filtros
      const response = await apiService.getManifests(params.toString());

      setManifests(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar manifestos.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset para primeira página ao aplicar filtros
    fetchManifests();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedUser(null);
    setFilterService(null);
    setFormService(null);
    setZipCodeFilter('');
    setAddressFilter('');
    setCityFilter('');
    setCurrentPage(1);

    fetchManifests();
  };

  const handleCreateManifest = async (data: any) => {
    try {
      const { files, ...manifestData } = data;
      const finalManifestData = {
        ...manifestData,
        status: 'pending',
        neighborhood: manifestData.neighborhood || '',
        complement: manifestData.complement || '',
        latitude: manifestData.latitude || '',
        longitude: manifestData.longitude || '',
      };

      if (files && files.length > 0) {
        await apiService.createManifestWithAttachments(finalManifestData, files);
      } else {
        await apiService.createManifest(finalManifestData);
      }
      
      setShowCreateModal(false);
      setSelectedUser(user?.role === 'admin' ? null : user);
      setFormService(null);
      // Limpar filtros após criar
      setZipCodeFilter('');
      setAddressFilter('');
      setCityFilter('');
      setSearchTerm('');
      setStatusFilter('all');
      fetchManifests();
      toast.success('Manifesto criado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar manifesto.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {

        // Mostra uma mensagem geral agregada
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao criar manifesto'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao criar manifesto'));
      }
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserSelectionModal(false);
  };

  const handleServiceSelect = (service: Service) => {
    // Determinar se é para filtro ou formulário baseado no modal ativo
    if (showCreateModal || showEditModal) {
      setFormService(service);
    } else {
      setFilterService(service);
    }
    setShowServiceSelectionModal(false);
  };

  const handleUpdateManifest = async (data: any) => {
    if (!selectedManifest) return;

    try {
      const { files, ...manifestData } = data;
      
      // Se há novos arquivos, usar createManifestWithAttachments
      if (files && files.length > 0) {
        await apiService.createManifestWithAttachments(manifestData, files);
      } else {
        await apiService.updateManifest(selectedManifest.id, manifestData);
      }
      
      setShowEditModal(false);
      setSelectedManifest(null);
      // Limpar seleções após editar
      setSelectedUser(user?.role === 'admin' ? null : user);
      setFormService(null);
      fetchManifests();
      toast.success('Manifesto atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar manifesto.');
      const anyErr: any = error;
      const apiMessage = anyErr.response?.data?.message;
      const apiErrors = anyErr.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {

        toast.error('Erro de validação: ' + (Object.values(apiErrors).flat().join(' ') || apiMessage || 'Erro ao atualizar manifesto'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar manifesto'));
      }
    }
  };

  const handleDeleteManifest = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este manifesto?')) {
      try {
        await apiService.deleteManifest(id);
        fetchManifests();
        toast.success('Manifesto excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir manifesto.');
      }
    }
  };

  const openEditModal = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    // Carregar usuário e serviço selecionados para edição
    if (manifest.user) {
      setSelectedUser(manifest.user);
    }
    if (manifest.service) {
      setFormService(manifest.service);
    }
    setShowEditModal(true);
  };

  const openViewModal = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Filtros são aplicados no backend através dos parâmetros da API
  const columns = [
    {
      key: 'id',
      header: 'ID',
      className: 'w-16',
    },
    {
      key: 'user',
      header: 'Usuário',
      render: (value: User) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value?.name}</span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Localização',
      render: (value: string, item: Manifest) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value}, {item.state}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    {
      key: 'attachments',
      header: 'Anexos',
      render: (_: any, item: Manifest) => (
        <div className="flex items-center">
          <File className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {item.attachments?.length || 0} arquivo(s)
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Data',
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
      render: (_: any, item: Manifest) => (
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
            onClick={() => handleDeleteManifest(item.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Manifestos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os manifestos do sistema
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Manifesto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${user?.role !== 'admin' ? 'col-span-2' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por Descrição
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
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
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as string)}
                searchable={true}
                searchPlaceholder="Pesquisar por status..."
                noOptionsText="Nenhum status encontrado"
              />
            </div>

            {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione um usuário..."
                  value={selectedUser ? selectedUser.name : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUserSelectionModal(true)}
                  size="sm"
                >
                  Selecionar
                </Button>
              </div>
            </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviço
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione um serviço..."
                  value={filterService ? filterService.name : ''}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <Input
                placeholder="Filtrar por CEP..."
                value={zipCodeFilter}
                onChange={(e) => setZipCodeFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <Input
                placeholder="Filtrar por cidade..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <Input
                placeholder="Filtrar por endereço..."
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full mr-2"
              >
                <FunnelX className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={applyFilters}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={manifests}
          isLoading={isLoading}
          emptyMessage="Nenhum manifesto encontrado"
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
        title="Novo Manifesto"
        size="lg"
      >
        <ManifestForm
          onSubmit={handleCreateManifest}
          onCancel={() => setShowCreateModal(false)}
          selectedUser={selectedUser}
          selectedService={formService}
          onShowUserSelection={() => setShowUserSelectionModal(true)}
          onShowServiceSelection={() => setShowServiceSelectionModal(true)}
          userRole={user?.role}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Manifesto"
        size="lg"
      >
        <ManifestForm
          manifest={selectedManifest}
          isEditing={true}
          onSubmit={handleUpdateManifest}
          onCancel={() => setShowEditModal(false)}
          selectedUser={selectedUser}
          selectedService={formService}
          onShowUserSelection={() => setShowUserSelectionModal(true)}
          onShowServiceSelection={() => setShowServiceSelectionModal(true)}
          userRole={user?.role}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes do Manifesto"
        size="lg"
      >
        {selectedManifest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedManifest.status)}`}>
                  {getStatusText(selectedManifest.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedManifest.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <p className="text-sm text-gray-900 mt-1">{selectedManifest.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuário</label>
                <p className="text-sm text-gray-900 mt-1">{selectedManifest.user?.name}</p>
                <p className="text-xs text-gray-500">{selectedManifest.user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serviço</label>
                <p className="text-sm text-gray-900 mt-1">{selectedManifest.service?.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <p className="text-sm text-gray-900 mt-1">
                {selectedManifest.address}, {selectedManifest.number}
                {selectedManifest.complement && ` - ${selectedManifest.complement}`}
              </p>
              <p className="text-sm text-gray-900">
                {selectedManifest.neighborhood && `${selectedManifest.neighborhood}, `}
                {selectedManifest.city} - {selectedManifest.state}
              </p>
              <p className="text-sm text-gray-900">CEP: {selectedManifest.zip_code}</p>
            </div>

            {/* Anexos do Manifesto */}
            <div className="pt-6">
              <FilePreview 
                attachments={selectedManifest.attachments || []}
              />
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
                  openEditModal(selectedManifest);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Seleção de Usuário */}
      <UserSelectionModal
        isOpen={showUserSelectionModal}
        onClose={() => setShowUserSelectionModal(false)}
        onSelect={handleUserSelect}
      />

      {/* Modal de Seleção de Serviço */}
      <ServiceSelectionModal
        isOpen={showServiceSelectionModal}
        onClose={() => setShowServiceSelectionModal(false)}
        onSelect={handleServiceSelect}
      />
    </div>
  );
};

export default Manifests;
