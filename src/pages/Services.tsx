import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Layers,
  Tag,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Service, Type, ServiceFilters, Category, Sector } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import TypeSelectionModal from '../components/selectionModals/TypeSelectionModal';
import CategorySelectionModal from '../components/selectionModals/CategorySelectionModal';
import SectorSelectionModal from '../components/selectionModals/SectorSelectionModal';
import ServiceForm from '../components/services/ServiceForm';
import ServiceView from '../components/services/ServiceView';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para filtros
  const [filterType, setFilterType] = useState<Type | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterSector, setFilterSector] = useState<Sector | null>(null);

  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [showCategorySelectionModal, setShowCategorySelectionModal] = useState(false);
  const [showSectorSelectionModal, setShowSectorSelectionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalContext, setModalContext] = useState<'filter' | 'form'>('filter');

  useEffect(() => {
    fetchServices();
  }, [currentPage]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);

      let response: any;

      const filters: ServiceFilters = {};

      if (filterType) {
        filters.type_id = filterType.id;
      }

      if (filterCategory) {
        filters.category_id = filterCategory.id;
      }

      if (filterSector) {
        filters.sector_id = filterSector.id;
      }

      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }

      response = await apiService.getServices(filters, currentPage);
      setTotalPages(response.last_page);

      setServices(response.data || response);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao buscar serviços');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      await apiService.deleteService(service.id);
      toast.success('Serviço excluído com sucesso!');
      fetchServices();
    } catch (error: any) {
      toast.error('Erro ao excluir serviço.');
    }
  };

  const onSubmit = async (_data: any) => {
    try {
      fetchServices();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar serviço.');
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const openViewModal = (service: Service) => {
    setSelectedService(service);
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
    setSelectedService(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedService(null);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchServices();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (filterType) count++;
    if (filterCategory) count++;
    if (filterSector) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType(null);
    setFilterCategory(null);
    setFilterSector(null);
    setCurrentPage(1);
    fetchServices();
  };

  const handleTypeSelect = (type: Type) => {
    if (modalContext === 'filter') {
      setFilterType(type);
    }
    setShowTypeSelectionModal(false);
  };

  const handleCategorySelect = (category: Category) => {
    if (modalContext === 'filter') {
      setFilterCategory(category);
    }
    setShowCategorySelectionModal(false);
  };

  const handleSectorSelect = (sector: Sector) => {
    if (modalContext === 'filter') {
      setFilterSector(sector);
    }
    setShowSectorSelectionModal(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (service: Service) => <span className="font-mono text-sm">{service.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (service: Service) => (
        <div className="flex items-center space-x-3">
          {service.image ? (
            <img src={service.image} alt={service.name} className="h-8 w-8 rounded object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-900">{service.name}</span>
        </div>
      )
    },
    {
      key: 'types',
      header: 'Tipos',
      render: (service: Service) => (
        <div className="flex flex-wrap gap-1">
          {service.types && service.types.length > 0 ? (
            service.types.map(type => (
              <span key={type.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {type.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'categories',
      header: 'Categorias',
      render: (service: Service) => (
        <div className="flex flex-wrap gap-1">
          {service.categories && service.categories.length > 0 ? (
            service.categories.map(category => (
              <span key={category.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {category.name}
              </span>
            ))
          ) : service.category ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {service.category.name}
            </span>
          ) : (
            <span className="text-sm text-gray-500">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'sector',
      header: 'Setor',
      render: (service: Service) => (
        <span className="text-sm text-gray-900">{service.sector?.name || 'N/A'}</span>
      )
    },
    {
      key: 'requirements',
      header: 'Requisitos',
      render: (service: Service) => (
        <div className="flex flex-wrap gap-1">
          {service.needs_attachment && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Anexo
            </span>
          )}
          {service.needs_address && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Endereço
            </span>
          )}
          {service.needs_phone && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Telefone
            </span>
          )}
          {service.needs_birth_date && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Data Nasc.
            </span>
          )}
          {service.needs_cpf_cnpj && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              CPF/CNPJ
            </span>
          )}
          {service.needs_email && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              Email
            </span>
          )}
        </div>
      )
    },
    {
      key: 'show_in_dashboard',
      header: 'Exibido no Dashboard',
      render: (service: Service) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${service.show_in_dashboard
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-200 text-gray-600'
            }`}
          title={
            service.show_in_dashboard
              ? 'Exibido no Dashboard'
              : 'Não exibido no Dashboard'
          }
        >
          {service.show_in_dashboard ? 'Sim' : 'Não'}
        </span>
      )
    },
    {
      key: 'order',
      header: 'Ordem',
      render: (service: Service) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900 font-semibold">
            {service.order}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (service: Service) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(service)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => openEditModal(service)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => handleDeleteService(service)}
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
          Novo Serviço
        </Button>
      </div>

      {/* Filtros */}
      <FiltersPanel
        title="Filtros de Serviços"
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Selecione tipo"
                value={filterType?.name || ''}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => {
                  setModalContext('filter');
                  setShowTypeSelectionModal(true);
                }}
                variant="outline"
                size="sm"
              >
                <Layers className="h-4 w-4" />
              </Button>
              {filterType && (
                <Button
                  onClick={() => setFilterType(null)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtro por categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Selecione categoria"
                value={filterCategory?.name || ''}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => {
                  setModalContext('filter');
                  setShowCategorySelectionModal(true);
                }}
                variant="outline"
                size="sm"
              >
                <Tag className="h-4 w-4" />
              </Button>
              {filterCategory && (
                <Button
                  onClick={() => setFilterCategory(null)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtro por setor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setor
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Selecione setor"
                value={filterSector?.name || ''}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => {
                  setModalContext('filter');
                  setShowSectorSelectionModal(true);
                }}
                variant="outline"
                size="sm"
              >
                <Briefcase className="h-4 w-4" />
              </Button>
              {filterSector && (
                <Button
                  onClick={() => setFilterSector(null)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Serviços */}
      <div className="space-y-4">
        <Table
          title="Lista de Serviços"
          data={services}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhum serviço encontrado. Tente ajustar os filtros ou criar um novo serviço."
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
                    {services.length} serviços
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
        title="Criar Novo Serviço"
        size="2xl"
      >
        <ServiceForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Serviço"
        size="2xl"
      >
        <ServiceForm
          service={selectedService}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Serviço"
        size="3xl"
      >
        {selectedService && (
          <ServiceView
            service={selectedService}
            onClose={closeViewModal}
          />
        )}
      </Modal>

      <CategorySelectionModal
        isOpen={showCategorySelectionModal}
        onClose={() => setShowCategorySelectionModal(false)}
        onSelect={handleCategorySelect}
      />

      <TypeSelectionModal
        isOpen={showTypeSelectionModal}
        onClose={() => setShowTypeSelectionModal(false)}
        onSelect={handleTypeSelect}
      />

      <SectorSelectionModal
        isOpen={showSectorSelectionModal}
        onClose={() => setShowSectorSelectionModal(false)}
        onSelect={handleSectorSelect}
      />
    </div>
  );
};

export default Services;
