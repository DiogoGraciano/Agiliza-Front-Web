import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { User, UserFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import toast from 'react-hot-toast';
import { useCepSearch } from '../hooks/useCepSearch';

const userSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  cpf_cnpj: yup.string().required('CPF/CNPJ é obrigatório'),
  phone: yup.string().optional(),
  birth_date: yup.string().optional(),
  address: yup.string().optional(),
  number: yup.string().optional(),
  complement: yup.string().optional(),
  neighborhood: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),
  latitude: yup.string().optional(),
  longitude: yup.string().optional(),
});

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [cpfCnpjFilter, setCpfCnpjFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [birthDateFilter, setBirthDateFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [password, setPassword] = useState('');
  const [cepValue, setCepValue] = useState('');

  const { isSearching, error: cepError, searchCep, clearError } = useCepSearch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(userSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Construir filtros conforme a documentação da API
      const filters: UserFilters = {};
      
      if (nameFilter.trim()) {
        filters.name = nameFilter;
      }
      
      if (emailFilter.trim()) {
        filters.email = emailFilter;
      }
      
      if (cpfCnpjFilter.trim()) {
        filters.cpf_cnpj = cpfCnpjFilter;
      }
      
      if (phoneFilter.trim()) {
        filters.phone = phoneFilter;
      }
      
      if (birthDateFilter.trim()) {
        filters.birth_date = birthDateFilter;
      }
      
      // Fazer a requisição com filtros
      const response = await apiService.getUsers(filters, currentPage);
      
      setUsers(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Erro ao carregar usuários: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset para primeira página ao aplicar filtros
    fetchUsers();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (nameFilter.trim()) count++;
    if (emailFilter.trim()) count++;
    if (cpfCnpjFilter.trim()) count++;
    if (phoneFilter.trim()) count++;
    if (birthDateFilter.trim()) count++;
    return count;
  };

  const clearFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setCpfCnpjFilter('');
    setPhoneFilter('');
    setBirthDateFilter('');
    setCurrentPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const userData = {
        ...data,
        password: password,
      };
      
      await apiService.createUser(userData);
      setShowCreateModal(false);
      reset();
      setPassword('');
      setCepValue('');
      clearError();
      fetchUsers();
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar usuário: ' + error);
    }
  };

  const handleUpdateUser = async (data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!selectedUser) return;
    try {
      await apiService.updateUser(selectedUser.id, data);
      setShowEditModal(false);
      reset();
      setSelectedUser(null);
      setCepValue('');
      clearError();
      fetchUsers();
      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar usuário: ' + error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await apiService.deleteUser(user.id);
      fetchUsers();
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir usuário: ' + error);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('cpf_cnpj', user.cpf_cnpj);
    setValue('phone', user.phone || '');
    setValue('birth_date', user.birth_date || '');
    setValue('address', user.address || '');
    setValue('number', user.number || '');
    setValue('complement', user.complement || '');
    setValue('neighborhood', user.neighborhood || '');
    setValue('city', user.city || '');
    setValue('state', user.state || '');
    setValue('zip_code', user.zip_code || '');
    setValue('latitude', user.latitude || '');
    setValue('longitude', user.longitude || '');
    setCepValue(user.zip_code || '');
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCepSearch = async () => {
    if (!cepValue.trim()) {
      toast.error('Digite um CEP válido');
      return;
    }

    clearError();
    const address = await searchCep(cepValue);
    
    if (address) {
      setValue('address', address.address);
      setValue('neighborhood', address.neighborhood);
      setValue('city', address.city);
      setValue('state', address.state);
      setValue('zip_code', address.zip_code);
      toast.success('Endereço preenchido automaticamente!');
    }
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (user: User) => <span className="font-mono text-sm">{user.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{user.email}</span>
        </div>
      )
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF/CNPJ',
      render: (user: User) => (
        <span className="text-sm text-gray-900 font-mono">{user.cpf_cnpj}</span>
      )
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{user.phone || 'Não informado'}</span>
        </div>
      )
    },
    {
      key: 'address',
      header: 'Endereço',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <div className="text-sm text-gray-900">
            {user.address && user.city ? (
              <span>{user.address}, {user.city}</span>
            ) : (
              <span className="text-gray-500">Não informado</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'birth_date',
      header: 'Data Nasc.',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {user.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Data Cadastro',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(user.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(user)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => openEditModal(user)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => handleDeleteUser(user)}
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
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Usuários"
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
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Busca por email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por email
            </label>
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Busca por CPF/CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por CPF/CNPJ
            </label>
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={cpfCnpjFilter}
              onChange={(e) => setCpfCnpjFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Busca por telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por telefone
            </label>
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
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

      {/* Tabela de Usuários */}
      <div className="space-y-4">
        <Table
          title="Lista de Usuários"
          data={users}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum usuário encontrado. Tente ajustar os filtros ou criar um novo usuário."
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
                    {users.length} usuários
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
          onClose={() => {
            setShowCreateModal(false);
            setCepValue('');
            clearError();
          }}
          title="Criar Novo Usuário"
          size="xl"
        >
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <Input
                {...register('name')}
                placeholder="Nome completo"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="email@exemplo.com"
                error={errors.email?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ *
              </label>
              <Input
                {...register('cpf_cnpj')}
                placeholder="123.456.789-00"
                error={errors.cpf_cnpj?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <Input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <Input
                {...register('phone')}
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <Input
                {...register('birth_date')}
                type="date"
                error={errors.birth_date?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="12345-678"
                  value={cepValue}
                  onChange={(e) => setCepValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCepSearch()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleCepSearch}
                  disabled={isSearching}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {cepError && (
                <p className="text-sm text-red-600 mt-1">{cepError}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <Input
                {...register('address')}
                placeholder="Rua Exemplo"
                error={errors.address?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <Input
                {...register('number')}
                placeholder="123"
                error={errors.number?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <Input
                {...register('complement')}
                placeholder="Apto 45"
                error={errors.complement?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <Input
                {...register('neighborhood')}
                placeholder="Centro"
                error={errors.neighborhood?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <Input
                {...register('city')}
                placeholder="São Paulo"
                error={errors.city?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <Input
                {...register('state')}
                placeholder="SP"
                maxLength={2}
                error={errors.state?.message}
              />
            </div>
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
              Criar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
              <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCepValue('');
            clearError();
          }}
          title="Editar Usuário"
          size="xl"
        >
        <form onSubmit={handleSubmit(handleUpdateUser)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <Input
                {...register('name')}
                placeholder="Nome completo"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="email@exemplo.com"
                error={errors.email?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ *
              </label>
              <Input
                {...register('cpf_cnpj')}
                placeholder="123.456.789-00"
                error={errors.cpf_cnpj?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <Input
                {...register('phone')}
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <Input
                {...register('birth_date')}
                type="date"
                error={errors.birth_date?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <Input
                {...register('address')}
                placeholder="Rua Exemplo"
                error={errors.address?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <Input
                {...register('number')}
                placeholder="123"
                error={errors.number?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <Input
                {...register('complement')}
                placeholder="Apto 45"
                error={errors.complement?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <Input
                {...register('neighborhood')}
                placeholder="Centro"
                error={errors.neighborhood?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <Input
                {...register('city')}
                placeholder="São Paulo"
                error={errors.city?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <Input
                {...register('state')}
                placeholder="SP"
                maxLength={2}
                error={errors.state?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="12345-678"
                  value={cepValue}
                  onChange={(e) => setCepValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCepSearch()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleCepSearch}
                  disabled={isSearching}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {cepError && (
                <p className="text-sm text-red-600 mt-1">{cepError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP (Salvo)
              </label>
              <Input
                {...register('zip_code')}
                placeholder="12345-678"
                error={errors.zip_code?.message}
                readOnly
              />
            </div>
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
              Atualizar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Visualizar Usuário"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedUser.cpf_cnpj}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <p className="text-sm text-gray-900">{selectedUser.address || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <p className="text-sm text-gray-900">{selectedUser.number || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                    <p className="text-sm text-gray-900">{selectedUser.complement || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <p className="text-sm text-gray-900">{selectedUser.neighborhood || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <p className="text-sm text-gray-900">{selectedUser.city || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="text-sm text-gray-900">{selectedUser.state || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <p className="text-sm text-gray-900">{selectedUser.zip_code || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedUser);
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

export default Users;
