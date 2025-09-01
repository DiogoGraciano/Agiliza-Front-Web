import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  Shield,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Admin, AdminFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import AdminForm from '../components/admins/AdminForm';
import AdminView from '../components/admins/AdminView';

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAdmins();
  }, [currentPage]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      
      const filters: AdminFilters = {};
      
      if (searchFilter.trim()) {
        filters.search = searchFilter;
      }
      
      const response = await apiService.getAdmins(filters, currentPage);
      
      setAdmins(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
      toast.error('Erro ao buscar administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;
    
    try {
      await apiService.deleteAdmin(admin.id);
      toast.success('Administrador excluído com sucesso!');
      fetchAdmins();
    } catch (error: any) {
      toast.error('Erro ao excluir administrador.');
    }
  };

  const onSubmit = async (_data: any) => {
    try {
      fetchAdmins();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar administrador.');
    }
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const openViewModal = (admin: Admin) => {
    setSelectedAdmin(admin);
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
    setSelectedAdmin(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAdmin(null);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchAdmins();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchFilter.trim()) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchFilter('');
    setCurrentPage(1);
    fetchAdmins();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (admin: Admin) => <span className="font-mono text-sm">{admin.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-3">
          <UserCheck className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{admin.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{admin.email}</span>
        </div>
      )
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF/CNPJ',
      render: (admin: Admin) => (
        <span className="text-sm text-gray-900 font-mono">{admin.cpf_cnpj}</span>
      )
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{admin.phone || 'Não informado'}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Data Cadastro',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(admin.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(admin)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => openEditModal(admin)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => handleDeleteAdmin(admin)}
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
        <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Administrador
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Administradores"
        onApply={applyFilters}
        onClear={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Busca geral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome, email ou CPF/CNPJ
            </label>
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Administradores */}
      <div className="space-y-4">
        <Table
          title="Lista de Administradores"
          data={admins}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum administrador encontrado. Tente ajustar os filtros ou criar um novo administrador."
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
                    {admins.length} administradores
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
        title="Criar Novo Administrador"
        size="2xl"
      >
        <AdminForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Administrador"
        size="2xl"
      >
        <AdminForm
          admin={selectedAdmin}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Administrador"
        size="3xl"
      >
        {selectedAdmin && (
          <AdminView
            admin={selectedAdmin}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Admins;
