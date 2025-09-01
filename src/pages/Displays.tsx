import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Plus, 
  Eye,
  Edit, 
  Trash2, 
  Search,
  Settings,
  Palette,
  RefreshCw,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Display, DisplayFilters, Location } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import DisplayForm from '../components/displays/DisplayForm';
import DisplayView from '../components/displays/DisplayView';
import LocationSelectionModal from '../components/selectionModals/LocationSelectionModal';

const Displays: React.FC = () => {
  const [displays, setDisplays] = useState<Display[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [displayToOpen, setDisplayToOpen] = useState<Display | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDisplays();
  }, [currentPage]);

  const fetchDisplays = async () => {
    try {
      setIsLoading(true);
      
      const filters: DisplayFilters = {};
      
      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }
      
      if (templateFilter !== 'all') {
        filters.template = templateFilter;
      }
      
      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }
      
      const response = await apiService.getDisplays(filters, currentPage);
      setDisplays(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar displays:', error);
      toast.error('Erro ao buscar displays');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDisplay = async (display: Display) => {
    if (!confirm('Tem certeza que deseja excluir este display?')) return;
    
    try {
      await apiService.deleteDisplay(display.id);
      toast.success('Display excluído com sucesso!');
      fetchDisplays();
    } catch (error: any) {
      toast.error('Erro ao excluir display.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      fetchDisplays();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar display.');
    }
  };

  const openEditModal = (display: Display) => {
    setSelectedDisplay(display);
    setShowEditModal(true);
  };

  const openViewModal = (display: Display) => {
    setSelectedDisplay(display);
    setShowViewModal(true);
  };

  const openDisplayPanel = (display: Display) => {
    setDisplayToOpen(display);
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location: Location) => {
    if (displayToOpen) {
      const panelUrl = `/display/${displayToOpen.id}/preview?location=${location.id}`;
      window.open(panelUrl, '_blank');
    }
    setShowLocationModal(false);
    setDisplayToOpen(null);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedDisplay(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDisplay(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTemplateFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchDisplays();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (templateFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    return count;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTemplateLabel = (template: string) => {
    const templates: { [key: string]: string } = {
      'classic': 'Clássico',
      'modern': 'Moderno',
      'minimal': 'Minimalista',
      'default': 'Padrão'
    };
    return templates[template] || template;
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (display: Display) => <span className="font-mono text-sm">{display.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (display: Display) => (
        <div className="flex items-center space-x-2">
          <Monitor className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{display.name}</span>
        </div>
      )
    },
    {
      key: 'template',
      header: 'Template',
      render: (display: Display) => (
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-purple-600">{getTemplateLabel(display.template)}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (display: Display) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${display.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {display.is_active ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Inativo
            </>
          )}
        </span>
      )
    },
    {
      key: 'refresh',
      header: 'Atualização',
      render: (display: Display) => (
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            Manual
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (display: Display) => (
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(display.created_at).toLocaleDateString('pt-BR')}
      </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (display: Display) => (
        <div className="flex items-center space-x-2">
        <Button
            onClick={() => openDisplayPanel(display)}
            variant="ghost"
          size="sm"
            className="text-purple-600 hover:text-purple-700"
          title="Abrir Painel"
        >
            <Play className="h-4 w-4" />
        </Button>
        <Button
            onClick={() => openViewModal(display)}
            variant="ghost"
          size="sm"
            className="text-blue-600 hover:text-blue-700"
          title="Visualizar"
        >
            <Eye className="h-4 w-4" />
        </Button>
        <Button
            onClick={() => openEditModal(display)}
            variant="ghost"
          size="sm"
            className="text-green-600 hover:text-green-700"
          title="Editar"
        >
            <Edit className="h-4 w-4" />
        </Button>
        <Button
            onClick={() => handleDeleteDisplay(display)}
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
          Novo Display
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca por nome */}
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nome
                </label>
                <Input
              type="text"
              placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>

          {/* Filtro por template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Todos os Templates</option>
              <option value="classic">Clássico</option>
              <option value="modern">Moderno</option>
              <option value="minimal">Minimalista</option>
              <option value="default">Padrão</option>
            </select>
              </div>

          {/* Filtro por status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Displays */}
      <div className="space-y-4">
        <Table
          title="Lista de Displays"
          data={displays}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum display encontrado. Tente ajustar os filtros ou criar um novo display."
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
                    {displays.length} displays
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
        title="Criar Novo Display"
        size="3xl"
      >
        <DisplayForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Display"
        size="3xl"
      >
        <DisplayForm
          display={selectedDisplay}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Display"
        size="3xl"
      >
        {selectedDisplay && (
          <DisplayView
            display={selectedDisplay}
            onClose={closeViewModal}
          />
        )}
      </Modal>

      {/* Modal de Seleção de Localização */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setDisplayToOpen(null);
        }}
        onSelect={handleLocationSelect}
      />
    </div>
  );
};

export default Displays;
