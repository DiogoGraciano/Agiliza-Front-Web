import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  FunnelX
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { User } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

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
  role: yup.string().optional(),
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
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [password, setPassword] = useState('');

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
      
      // Construir parâmetros de filtro
      const params = new URLSearchParams();
      
      if (nameFilter.trim()) {
        params.append('name', nameFilter);
      }
      
      if (emailFilter.trim()) {
        params.append('email', emailFilter);
      }
      
      if (cpfCnpjFilter.trim()) {
        params.append('cpf_cnpj', cpfCnpjFilter);
      }
      
      if (phoneFilter.trim()) {
        params.append('phone', phoneFilter);
      }
      
      if (birthDateFilter.trim()) {
        params.append('birth_date', birthDateFilter);
      }
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      
      params.append('page', currentPage.toString());
      
      const response = await apiService.getUsers(params.toString());
      setUsers(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const clearFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setCpfCnpjFilter('');
    setPhoneFilter('');
    setBirthDateFilter('');
    setRoleFilter('all');
    setCurrentPage(1);
  };

  const handleCreateUser = async (data: any) => {
    try {
      if (!password) {
        toast.error('Senha é obrigatória para novos usuários');
        return;
      }
      
      await apiService.createUser({
        ...data,
        password,
      });
      setShowCreateModal(false);
      reset();
      setPassword('');
      fetchUsers();
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário.');
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;
    
    try {
      await apiService.updateUser(selectedUser.id, data);
      setShowEditModal(false);
      reset();
      setSelectedUser(null);
      fetchUsers();
      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await apiService.deleteUser(id);
        fetchUsers();
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário.');
      }
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
    setValue('role', user.role || '');
    setValue('latitude', user.latitude || '');
    setValue('longitude', user.longitude || '');
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Filtros são aplicados no backend através dos parâmetros da API

  const columns = [
    {
      key: 'id',
      header: 'ID',
      className: 'w-16',
    },
    {
      key: 'name',
      header: 'Nome',
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF/CNPJ',
      render: (value: string) => (
        <span className="text-sm text-gray-900 font-mono">{value}</span>
      ),
    },
    {
      key: 'city',
      header: 'Localização',
      render: (value: string, item: User) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {value && item.state ? `${value}, ${item.state}` : 'Não informado'}
          </span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Tipo',
      render: (value: string) => (
        <div className="flex items-center">
          <Shield className={`h-4 w-4 mr-2 ${value === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            value === 'admin'
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {value === 'admin' ? 'Admin' : 'Usuário'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Data de Cadastro',
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
      render: (_: any, item: User) => (
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
            onClick={() => handleDeleteUser(item.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por email..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ
              </label>
              <Input
                placeholder="Buscar por CPF/CNPJ..."
                value={cpfCnpjFilter}
                onChange={(e) => setCpfCnpjFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por telefone..."
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">Todas as Funções</option>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="col-span-2">
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                <FunnelX className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={applyFilters}
                className="flex-1"
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
          data={users}
          isLoading={isLoading}
          emptyMessage="Nenhum usuário encontrado"
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
        title="Novo Usuário"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              placeholder="Nome do usuário"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="usuario@exemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CPF/CNPJ"
              placeholder="000.000.000-00"
              error={errors.cpf_cnpj?.message}
              {...register('cpf_cnpj')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Senha do usuário"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              error={errors.birth_date?.message}
              {...register('birth_date')}
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Complemento"
              placeholder="Apto, Casa, etc."
              error={errors.complement?.message}
              {...register('complement')}
            />
            <Input
              label="Bairro"
              placeholder="Bairro"
              error={errors.neighborhood?.message}
              {...register('neighborhood')}
            />
            <Input
              label="Cidade"
              placeholder="São Paulo"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Criar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Usuário"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateUser)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              placeholder="Nome do usuário"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="usuario@exemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CPF/CNPJ"
              placeholder="000.000.000-00"
              error={errors.cpf_cnpj?.message}
              {...register('cpf_cnpj')}
            />
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data de Nascimento"
              type="date"
              error={errors.birth_date?.message}
              {...register('birth_date')}
            />
            <Input
              label="CEP"
              placeholder="00000-000"
              error={errors.zip_code?.message}
              {...register('zip_code')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Input
              label="Complemento"
              placeholder="Apto, Casa, etc."
              error={errors.complement?.message}
              {...register('complement')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Bairro"
              placeholder="Bairro"
              error={errors.neighborhood?.message}
              {...register('neighborhood')}
            />
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
              Atualizar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes do Usuário"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className="flex items-center mt-1">
                  <Shield className={`h-4 w-4 mr-1 ${selectedUser.role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedUser.role === 'admin' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                <p className="text-sm text-gray-900 font-mono">{selectedUser.cpf_cnpj}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  {selectedUser.phone || 'Não informado'}
                </p>
              </div>
            </div>

            {selectedUser.birth_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  {new Date(selectedUser.birth_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {(selectedUser.address || selectedUser.city || selectedUser.state) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <div className="text-sm text-gray-900 space-y-1">
                  {selectedUser.address && (
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {selectedUser.address}, {selectedUser.number}
                      {selectedUser.complement && ` - ${selectedUser.complement}`}
                    </p>
                  )}
                  {selectedUser.neighborhood && (
                    <p className="ml-6">{selectedUser.neighborhood}</p>
                  )}
                  {(selectedUser.city || selectedUser.state) && (
                    <p className="ml-6">
                      {selectedUser.city && selectedUser.state 
                        ? `${selectedUser.city} - ${selectedUser.state}`
                        : selectedUser.city || selectedUser.state
                      }
                    </p>
                  )}
                  {selectedUser.zip_code && (
                    <p className="ml-6">CEP: {selectedUser.zip_code}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
              <p className="text-sm text-gray-900">
                {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
              </p>
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
                  openEditModal(selectedUser);
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

export default Users;
