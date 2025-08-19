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
  Calendar
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Manifest, User, Service } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

const manifestSchema = yup.object({
  user_id: yup.number().required('Usuário é obrigatório'),
  service_id: yup.number().required('Serviço é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  zip_code: yup.string().required('CEP é obrigatório'),
  address: yup.string().required('Endereço é obrigatório'),
  number: yup.string().required('Número é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  state: yup.string().required('Estado é obrigatório'),
});

type ManifestFormData = yup.InferType<typeof manifestSchema>;

const Manifests: React.FC = () => {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<ManifestFormData>({
    resolver: yupResolver(manifestSchema),
  });

  useEffect(() => {
    fetchManifests();
    fetchUsers();
    fetchServices();
  }, [currentPage, statusFilter]);

  const fetchManifests = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (statusFilter === 'all') {
        response = await apiService.getManifests();
      } else {
        response = await apiService.getManifestsByStatus(statusFilter);
      }
      
      setManifests(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar manifestos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
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

  const handleCreateManifest = async (data: ManifestFormData) => {
    try {
      await apiService.createManifest({
        ...data,
        status: 'pending',
        neighborhood: '',
        complement: '',
        latitude: '',
        longitude: '',
      });
      setShowCreateModal(false);
      reset();
      fetchManifests();
    } catch (error) {
      console.error('Erro ao criar manifesto:', error);
    }
  };

  const handleUpdateManifest = async (data: ManifestFormData) => {
    if (!selectedManifest) return;
    
    try {
      await apiService.updateManifest(selectedManifest.id, data);
      setShowEditModal(false);
      reset();
      setSelectedManifest(null);
      fetchManifests();
    } catch (error) {
      console.error('Erro ao atualizar manifesto:', error);
    }
  };

  const handleDeleteManifest = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este manifesto?')) {
      try {
        await apiService.deleteManifest(id);
        fetchManifests();
      } catch (error) {
        console.error('Erro ao excluir manifesto:', error);
      }
    }
  };

  const openEditModal = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    setValue('user_id', manifest.user_id);
    setValue('service_id', manifest.service_id);
    setValue('description', manifest.description);
    setValue('zip_code', manifest.zip_code);
    setValue('address', manifest.address);
    setValue('number', manifest.number);
    setValue('city', manifest.city);
    setValue('state', manifest.state);
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

  const filteredManifests = manifests.filter(manifest => {
    const matchesSearch = manifest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manifest.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manifest.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: 'id',
      header: 'ID',
      className: 'w-16',
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900 truncate">
            {value.length > 50 ? `${value.substring(0, 50)}...` : value}
          </p>
        </div>
      ),
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por descrição, usuário ou cidade..."
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
              <option value="pending">Pendentes</option>
              <option value="accepted">Aceitos</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluídos</option>
              <option value="rejected">Rejeitados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={fetchManifests}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={filteredManifests}
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
        <form onSubmit={handleSubmit(handleCreateManifest)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <select
                {...register('user_id')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>
              )}
            </div>

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
          </div>

          <Input
            label="Descrição"
            placeholder="Descreva o problema ou solicitação"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="CEP"
              placeholder="00000-000"
              error={errors.zip_code?.message}
              {...register('zip_code')}
            />
            <Input
              label="Endereço"
              placeholder="Rua, Avenida, etc."
              error={errors.address?.message}
              {...register('address')}
            />
            <Input
              label="Número"
              placeholder="123"
              error={errors.number?.message}
              {...register('number')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cidade"
              placeholder="São Paulo"
              error={errors.city?.message}
              {...register('city')}
            />
            <Input
              label="Estado"
              placeholder="SP"
              error={errors.state?.message}
              {...register('state')}
            />
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
              Criar Manifesto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Manifesto"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateManifest)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <select
                {...register('user_id')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          <Input
            label="Descrição"
            placeholder="Descreva o problema ou solicitação"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="CEP"
              placeholder="00000-000"
              error={errors.zip_code?.message}
              {...register('zip_code')}
            />
            <Input
              label="Endereço"
              placeholder="Rua, Avenida, etc."
              error={errors.address?.message}
              {...register('address')}
            />
            <Input
              label="Número"
              placeholder="123"
              error={errors.number?.message}
              {...register('number')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cidade"
              placeholder="São Paulo"
              error={errors.city?.message}
              {...register('city')}
            />
            <Input
              label="Estado"
              placeholder="SP"
              error={errors.state?.message}
              {...register('state')}
            />
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
              Atualizar Manifesto
            </Button>
          </div>
        </form>
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
    </div>
  );
};

export default Manifests;
