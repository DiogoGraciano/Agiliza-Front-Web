import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  Shield,
  Search,
  UserCheck,
  Briefcase,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Admin, AdminFilters, Sector } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import SectorSelectionModal from '../components/selectionModals/SectorSelectionModal';
import toast from 'react-hot-toast';

const adminSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  cpf_cnpj: yup.string().required('CPF/CNPJ é obrigatório'),
  phone: yup.string().optional(),
});

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
  const [showSectorSelectionModal, setShowSectorSelectionModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(adminSchema),
  });

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
      toast.error('Erro ao carregar administradores: ' + error);
    } finally {
      setIsLoading(false);
    }
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

  const handleCreateAdmin = async (data: Omit<Admin, 'id' | 'created_at' | 'updated_at'>) => {
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const adminData: any = {
        ...data,
        password: password,
      };
      
      if (selectedSectors.length > 0) {
        adminData.sectors = selectedSectors.map(sector => sector.id);
      }
      
      await apiService.createAdmin(adminData);
      setShowCreateModal(false);
      reset();
      setPassword('');
      setConfirmPassword('');
      setSelectedSectors([]);
      fetchAdmins();
      toast.success('Administrador criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar administrador: ' + error);
    }
  };

  const handleUpdateAdmin = async (data: Partial<Omit<Admin, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!selectedAdmin) return;

    // Se uma nova senha foi fornecida, validar
    if (password && password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password && password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const updateData: any = { ...data };
      
      if (selectedSectors.length > 0) {
        updateData.sectors = selectedSectors.map(sector => sector.id);
      }
      
      if (password) {
        updateData.password = password;
      }

      await apiService.updateAdmin(selectedAdmin.id, updateData);
      setShowEditModal(false);
      reset();
      setSelectedAdmin(null);
      setPassword('');
      setConfirmPassword('');
      setSelectedSectors([]);
      fetchAdmins();
      toast.success('Administrador atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar administrador: ' + error);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;
    
    try {
      await apiService.deleteAdmin(admin.id);
      fetchAdmins();
      toast.success('Administrador excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir administrador: ' + error);
    }
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setValue('name', admin.name);
    setValue('email', admin.email);
    setValue('cpf_cnpj', admin.cpf_cnpj);
    setValue('phone', admin.phone || '');
    setPassword('');
    setConfirmPassword('');
    setSelectedSectors(admin.sectors || []);
    setShowEditModal(true);
  };

  const openViewModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleSectorSelect = (sector: Sector) => {
    if (!selectedSectors.find(s => s.id === sector.id)) {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleSectorRemove = (sectorId: number) => {
    setSelectedSectors(selectedSectors.filter(s => s.id !== sectorId));
  };

  const openSectorSelectionModal = () => {
    setShowSectorSelectionModal(true);
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
        <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700">
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
        onClose={() => {
          setShowCreateModal(false);
          setPassword('');
          setConfirmPassword('');
          setSelectedSectors([]);
        }}
        title="Criar Novo Administrador"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateAdmin)} className="space-y-6">
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
                placeholder="admin@exemplo.com"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha *
              </label>
              <Input
                type="password"
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Seleção de Setores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setores
            </label>
            <div className="space-y-3">
              {/* Setores selecionados */}
              {selectedSectors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSectors.map((sector) => (
                    <div
                      key={sector.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Briefcase className="h-4 w-4 mr-1" />
                      {sector.name}
                      <button
                        type="button"
                        onClick={() => handleSectorRemove(sector.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Botão para adicionar setores */}
              <Button
                type="button"
                onClick={openSectorSelectionModal}
                variant="outline"
                className="w-full"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                {selectedSectors.length > 0 ? 'Adicionar Mais Setores' : 'Selecionar Setores'}
              </Button>
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
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Criar Administrador
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setPassword('');
          setConfirmPassword('');
          setSelectedSectors([]);
        }}
        title="Editar Administrador"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateAdmin)} className="space-y-6">
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
                placeholder="admin@exemplo.com"
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
                Nova Senha (opcional)
              </label>
              <Input
                type="password"
                placeholder="Deixe em branco para manter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <Input
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!password}
              />
            </div>
          </div>

          {/* Seleção de Setores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setores
            </label>
            <div className="space-y-3">
              {/* Setores selecionados */}
              {selectedSectors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSectors.map((sector) => (
                    <div
                      key={sector.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Briefcase className="h-4 w-4 mr-1" />
                      {sector.name}
                      <button
                        type="button"
                        onClick={() => handleSectorRemove(sector.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Botão para adicionar setores */}
              <Button
                type="button"
                onClick={openSectorSelectionModal}
                variant="outline"
                className="w-full"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                {selectedSectors.length > 0 ? 'Adicionar Mais Setores' : 'Selecionar Setores'}
              </Button>
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
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Atualizar Administrador
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Visualizar Administrador"
        size="lg"
      >
        {selectedAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedAdmin.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedAdmin.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedAdmin.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedAdmin.cpf_cnpj}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-sm text-gray-900">{selectedAdmin.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedAdmin.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedAdmin.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  {/* Setores associados */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Setores</label>
                    {selectedAdmin.sectors && selectedAdmin.sectors.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAdmin.sectors.map((sector) => (
                          <div
                            key={sector.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Briefcase className="h-3 w-3 mr-1" />
                            {sector.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum setor associado</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedAdmin);
                }}
                className="bg-purple-600 hover:bg-purple-700"
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

      {/* Modal de Seleção de Setores */}
      <SectorSelectionModal
        isOpen={showSectorSelectionModal}
        onClose={() => {
          setShowSectorSelectionModal(false);
        }}
        onSelect={(sector) => {
          handleSectorSelect(sector);
        }}
        selectedSectors={selectedSectors}
      />
    </div>
  );
};

export default Admins;
