import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Briefcase,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Sector } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import SectorForm from '../components/sectors/SectorForm';
import SectorView from '../components/sectors/SectorView';

const Sectors: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSectors();
      setSectors(response);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      toast.error('Erro ao buscar setores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    if (!confirm('Tem certeza que deseja excluir este setor?')) return;
    
    try {
      await apiService.deleteSector(sector.id);
      toast.success('Setor excluído com sucesso!');
      fetchSectors();
    } catch (error: any) {
      toast.error('Erro ao excluir setor.');
    }
  };

  const onSubmit = async (_data: any) => {
    try {
      fetchSectors();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar setor.');
    }
  };

  const openEditModal = (sector: Sector) => {
    setSelectedSector(sector);
    setShowEditModal(true);
  };

  const openViewModal = (sector: Sector) => {
    setSelectedSector(sector);
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
    setSelectedSector(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedSector(null);
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
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
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
        onClose={closeCreateModal}
        title="Criar Novo Setor"
        size="2xl"
      >
        <SectorForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Setor"
        size="2xl"
      >
        <SectorForm
          sector={selectedSector}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Setor"
        size="3xl"
      >
        {selectedSector && (
          <SectorView
            sector={selectedSector}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Sectors;
