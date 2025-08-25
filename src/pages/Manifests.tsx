import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  User as UserIcon,
  Calendar,
  File,
  Settings,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import type { Manifest, User, Admin, Service, ManifestFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import UserSelectionModal from '../components/selectionModals/UserSelectionModal';
import AdminSelectionModal from '../components/selectionModals/AdminSelectionModal';
import ServiceSelectionModal from '../components/selectionModals/ServiceSelectionModal';
import ManifestForm from '../components/manifests/ManifestForm';
import ManifestView from '../components/manifests/ManifestView';

import Select from '../components/ui/Select';
import { FiltersPanel } from '../components/ui/FiltersPanel';

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
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zipCodeFilter, setZipCodeFilter] = useState<string>('');
  const [addressFilter, setAddressFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [cpfCnpjFilter, setCpfCnpjFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [phoneFilter, setPhoneFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [birthDateFilter, setBirthDateFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [filterService, setFilterService] = useState<Service | null>(null);
  const [formService, setFormService] = useState<Service | null>(null);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [showAdminSelectionModal, setShowAdminSelectionModal] = useState(false);
  const [showServiceSelectionModal, setShowServiceSelectionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { admin } = useAuth();

  useEffect(() => {
    fetchManifests();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchManifests = async () => {
    try {
      setIsLoading(true);

      // Construir filtros conforme a documentação da API
      const filters: ManifestFilters = {};

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (searchTerm.trim()) {
        filters.description = searchTerm;
      }

      if (selectedUser) {
        filters.user_id = selectedUser.id;
      }

      if (filterService) {
        filters.service_id = filterService.id;
      }

      if (selectedAdmin) {
        filters.admin_id = selectedAdmin.id;
      }

      if (zipCodeFilter.trim()) {
        filters.zip_code = zipCodeFilter;
      }

      if (addressFilter.trim()) {
        filters.address = addressFilter;
      }

      if (cityFilter.trim()) {
        filters.city = cityFilter;
      }

      if (cpfCnpjFilter.trim()) {
        filters.cpf_cnpj = cpfCnpjFilter;
      }

      if (nameFilter.trim()) {
        filters.name = nameFilter;
      }

      if (phoneFilter.trim()) {
        filters.phone = phoneFilter;
      }

      if (emailFilter.trim()) {
        filters.email = emailFilter;
      }

      if (birthDateFilter.trim()) {
        filters.birth_date = birthDateFilter;
      }

      // Fazer a requisição com filtros
      const response = await apiService.getManifests(filters, currentPage);

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (selectedUser) count++;
    if (selectedAdmin) count++;
    if (filterService) count++;
    if (zipCodeFilter.trim()) count++;
    if (addressFilter.trim()) count++;
    if (cityFilter.trim()) count++;
    if (cpfCnpjFilter.trim()) count++;
    if (nameFilter.trim()) count++;
    if (phoneFilter.trim()) count++;
    if (emailFilter.trim()) count++;
    if (birthDateFilter.trim()) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedUser(null);
    setSelectedAdmin(null);
    setFilterService(null);
    setFormService(null);
    setZipCodeFilter('');
    setAddressFilter('');
    setCityFilter('');
    setCpfCnpjFilter('');
    setNameFilter('');
    setPhoneFilter('');
    setEmailFilter('');
    setBirthDateFilter('');
    setCurrentPage(1);

    fetchManifests();
  };

  const handleCreateManifest = async (data: any) => {
    try {
      const { files, ...manifestData } = data;
      
      // Garantir que as coordenadas sejam sempre incluídas
      const latitude = manifestData.latitude || '';
      const longitude = manifestData.longitude || '';
      
      const finalManifestData = {
        ...manifestData,
        status: 'pending',
        neighborhood: manifestData.neighborhood || '',
        complement: manifestData.complement || '',
        latitude,
        longitude,
      };

      if (files && files.length > 0) {
        await apiService.createManifestWithAttachments(finalManifestData, files);
      } else {
        await apiService.createManifest(finalManifestData);
      }

      setShowCreateModal(false);
      setSelectedUser(null);
      setSelectedAdmin(null);
      setFormService(null);
      // Limpar filtros após criar
      setZipCodeFilter('');
      setAddressFilter('');
      setCityFilter('');
      setSearchTerm('');
      setStatusFilter('all');
      setCpfCnpjFilter('');
      setNameFilter('');
      setPhoneFilter('');
      setEmailFilter('');
      setBirthDateFilter('');
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

  const handleAdminSelect = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowAdminSelectionModal(false);
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
      const { files, existingAttachments, ...manifestData } = data;

      // Se há novos arquivos, usar createManifestWithAttachments
      if (files && files.length > 0) {
        await apiService.createManifestWithAttachments(manifestData, files);
      } else {
        await apiService.updateManifest(selectedManifest.id, manifestData);
      }

      setShowEditModal(false);
      setSelectedManifest(null);
      setSelectedUser(null);
      setSelectedAdmin(null);
      setFormService(null);
      fetchManifests();
      toast.success('Manifesto atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar manifesto.');
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const flatMsg = Object.values(apiErrors).flat().join(' ');
        toast.error('Erro de validação: ' + (flatMsg || apiMessage || 'Erro ao atualizar manifesto'));
      } else {
        toast.error('Erro: ' + (apiMessage || 'Erro ao atualizar manifesto'));
      }
    }
  };

  const handleDeleteManifest = async (manifest: Manifest) => {
    if (!confirm('Tem certeza que deseja excluir este manifesto?')) return;

    try {
      await apiService.deleteManifest(manifest.id);
      fetchManifests();
      toast.success('Manifesto excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir manifesto.');
    }
  };

  const handleStatusUpdate = async (manifest: Manifest, newStatus: string) => {
    try {
      const updatedManifest = await apiService.updateManifestStatus(manifest.id, newStatus);
      fetchManifests();
      setSelectedManifest(updatedManifest.data);
      toast.success('Status do manifesto atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status do manifesto.');
    }
  };

  const openEditModal = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    if (manifest.user) { setSelectedUser(manifest.user); }
    if (manifest.admin) { setSelectedAdmin(manifest.admin); }
    if (manifest.service) { setFormService(manifest.service); }
    setShowEditModal(true);
  };

  const openViewModal = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setSelectedUser(null);
    setSelectedAdmin(null);
    setFormService(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedManifest(null);
    setSelectedUser(null);
    setSelectedAdmin(null);
    setFormService(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedManifest(null);
    fetchManifests();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const canEditManifest = (manifest: Manifest) => {
    return manifest.status === 'pending';
  };

  const canDeleteManifest = (manifest: Manifest) => {
    return manifest.status === 'pending';
  };

  const canUpdateStatus = (manifest: Manifest) => {
    return manifest.admin_id === admin?.id;
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (manifest: Manifest) => <span className="font-mono text-sm">{manifest.id}</span>
    },
    {
      key: 'admin',
      header: 'Admin Responsável',
      render: (manifest: Manifest) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{manifest.admin?.name || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Nome',
      render: (manifest: Manifest) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{manifest.name || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'service',
      header: 'Serviço',
      render: (manifest: Manifest) => (
        <span className="text-sm text-gray-900">{manifest.service?.name || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (manifest: Manifest) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(manifest.status)}`}>
          {getStatusText(manifest.status)}
        </span>
      )
    },
    {
      key: 'attachments',
      header: 'Anexos',
      render: (manifest: Manifest) => (
        <div className="flex items-center space-x-2">
          <File className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{manifest.attachments?.length || 0}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (manifest: Manifest) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(manifest.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (manifest: Manifest) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(manifest)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canEditManifest(manifest) && (
          <Button
            onClick={() => openEditModal(manifest)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          )}
          {canDeleteManifest(manifest) && (
          <Button
            onClick={() => handleDeleteManifest(manifest)}
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
          Novo Manifesto
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
            {/* Busca por descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por descrição
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

            {/* Filtro por usuário (apenas admin) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Selecione usuário"
                  value={selectedUser?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => setShowUserSelectionModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <UserIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filtro por admin responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Responsável
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Selecione admin"
                  value={selectedAdmin?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => setShowAdminSelectionModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filtro por serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serviço
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Selecione serviço"
                  value={filterService?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => setShowServiceSelectionModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
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

            {/* Filtro por CPF/CNPJ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ
              </label>
              <Input
                type="text"
                placeholder="Digite o CPF/CNPJ..."
                value={cpfCnpjFilter}
                onChange={(e) => setCpfCnpjFilter(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>

            {/* Filtro por nome */}
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

            {/* Filtro por telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <Input
                type="text"
                placeholder="Digite o telefone..."
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>

            {/* Filtro por email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="text"
                placeholder="Digite o email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>

            {/* Filtro por data de nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <Input
                type="date"
                value={birthDateFilter}
                onChange={(e) => setBirthDateFilter(e.target.value)}
              />
            </div>
          </div>
        </FiltersPanel>

      {/* Tabela de Manifestos */}
      <div className="space-y-4">
        <Table
          title="Lista de Manifestos"
          data={manifests}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum manifesto encontrado. Tente ajustar os filtros ou criar um novo manifesto."
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
                    {manifests.length} manifestos
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
        title="Criar Novo Manifesto"
        size="3xl"
      >
        <ManifestForm
          onSubmit={handleCreateManifest}
          onCancel={closeCreateModal}
          selectedUser={selectedUser}
          selectedAdmin={selectedAdmin}
          selectedService={formService}
          onShowUserSelection={() => setShowUserSelectionModal(true)}
          onShowAdminSelection={() => setShowAdminSelectionModal(true)}
          onShowServiceSelection={() => setShowServiceSelectionModal(true)}
          showUserSelection={true}
          showAdminSelection={true}
          showServiceSelection={true}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Manifesto"
        size="3xl"
      >
        <ManifestForm
          manifest={selectedManifest}
          isEditing={true}
          onSubmit={handleUpdateManifest}
          onCancel={closeEditModal}
          selectedUser={selectedUser}
          selectedAdmin={selectedAdmin}
          selectedService={formService}
          onShowUserSelection={() => setShowUserSelectionModal(true)}
          onShowAdminSelection={() => setShowAdminSelectionModal(true)}
          onShowServiceSelection={() => setShowServiceSelectionModal(true)}
          showUserSelection={true}
          showAdminSelection={true}
          showServiceSelection={true}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Manifesto"
        size="3xl"
      >
        {selectedManifest && (
          <ManifestView
            manifest={selectedManifest}
            onClose={closeViewModal}
            onStatusUpdate={handleStatusUpdate}
            canUpdateStatus={canUpdateStatus}
          />
        )}
      </Modal>

      {/* Modal de Seleção de Usuário */}
      <UserSelectionModal
        isOpen={showUserSelectionModal}
        onClose={() => setShowUserSelectionModal(false)}
        onSelect={handleUserSelect}
      />

      {/* Modal de Seleção de Admin */}
      <AdminSelectionModal
        isOpen={showAdminSelectionModal}
        onClose={() => setShowAdminSelectionModal(false)}
        onSelect={handleAdminSelect}
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
