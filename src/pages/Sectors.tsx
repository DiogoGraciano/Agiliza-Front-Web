import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Briefcase,
  Mail,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Sector } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import toast from 'react-hot-toast';

const sectorSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
});

const Sectors: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(sectorSchema),
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSectors();
      setSectors(response);
    } catch (error) {
      toast.error('Erro ao carregar setores: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    fetchSectors();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchFilter.trim()) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchFilter('');
    fetchSectors();
  };

  const handleCreateSector = async (data: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiService.createSector(data);
      setShowCreateModal(false);
      reset();
      fetchSectors();
      toast.success('Setor criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar setor: ' + error);
    }
  };

  const handleUpdateSector = async (data: Partial<Omit<Sector, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!selectedSector) return;

    try {
      await apiService.updateSector(selectedSector.id, data);
      setShowEditModal(false);
      reset();
      setSelectedSector(null);
      fetchSectors();
      toast.success('Setor atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar setor: ' + error);
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    if (!confirm('Tem certeza que deseja excluir este setor?')) return;
    
    try {
      await apiService.deleteSector(sector.id);
      fetchSectors();
      toast.success('Setor excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir setor: ' + error);
    }
  };

  const openEditModal = (sector: Sector) => {
    setSelectedSector(sector);
    setValue('name', sector.name);
    setValue('email', sector.email);
    setShowEditModal(true);
  };

  const openViewModal = (sector: Sector) => {
    setSelectedSector(sector);
    setShowViewModal(true);
  };

  const filteredSectors = sectors.filter(sector => {
    if (searchFilter.trim()) {
      return sector.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
             sector.email.toLowerCase().includes(searchFilter.toLowerCase());
    }
    return true;
  });

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (sector: Sector) => <span className="font-mono text-sm">{sector.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (sector: Sector) => (
        <div className="flex items-center space-x-3">
          <Briefcase className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{sector.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (sector: Sector) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{sector.email}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Data Cadastro',
      render: (sector: Sector) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(sector.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (sector: Sector) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(sector)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => openEditModal(sector)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => handleDeleteSector(sector)}
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
          Novo Setor
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Setores"
        onApply={applyFilters}
        onClear={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Busca geral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome ou email
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

      {/* Tabela de Setores */}
      <div className="space-y-4">
        <Table
          title="Lista de Setores"
          data={filteredSectors}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum setor encontrado. Tente ajustar os filtros ou criar um novo setor."
          variant="modern"
          showRowNumbers={false}
        />

        {/* Estatísticas */}
        {!isLoading && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="p-4">
              <div className="flex justify-center items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {filteredSectors.length} setores encontrados
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Setor"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateSector)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <Input
                {...register('name')}
                placeholder="Nome do setor"
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
                placeholder="setor@empresa.com"
                error={errors.email?.message}
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Criar Setor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Setor"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateSector)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <Input
                {...register('name')}
                placeholder="Nome do setor"
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
                placeholder="setor@empresa.com"
                error={errors.email?.message}
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Atualizar Setor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Visualizar Setor"
        size="lg"
      >
        {selectedSector && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedSector.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedSector.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedSector.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedSector.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedSector.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedSector);
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

export default Sectors;
