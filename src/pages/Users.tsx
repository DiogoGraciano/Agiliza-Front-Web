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
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { User, UserFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import UserForm from '../components/users/UserForm';
import UserView from '../components/users/UserView';

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

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
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
      
      const response = await apiService.getUsers(filters, currentPage);
      
      setUsers(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await apiService.deleteUser(user.id);
      toast.success('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao excluir usuário.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      fetchUsers();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar usuário.');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
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
    setSelectedUser(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  const clearFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setCpfCnpjFilter('');
    setPhoneFilter('');
    setBirthDateFilter('');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
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
        onClose={closeCreateModal}
        title="Criar Novo Usuário"
        size="2xl"
      >
        <UserForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Usuário"
        size="2xl"
      >
        <UserForm
          user={selectedUser}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Usuário"
        size="3xl"
      >
        {selectedUser && (
          <UserView
            user={selectedUser}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Users;
