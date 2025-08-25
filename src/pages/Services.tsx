import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Layers,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Service, Type, ServiceFilters, Category, UploadedFile } from '../types';
import { SERVICE_IMAGE_CONFIG } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Checkbox from '../components/ui/Checkbox';
import Textarea from '../components/ui/Textarea';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import TypeSelectionModal from '../components/selectionModals/TypeSelectionModal';
import CategorySelectionModal from '../components/selectionModals/CategorySelectionModal';
import FileUpload from '../components/ui/FileUpload';
import FilePreview from '../components/ui/FilePreview';

const serviceSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  type_id: yup.number().optional(),
  category_id: yup.number().optional(),
  needs_attachment: yup.boolean().optional().default(false),
  needs_email: yup.boolean().optional().default(false),
  needs_address: yup.boolean().optional().default(false),
  needs_phone: yup.boolean().optional().default(false),
  needs_birth_date: yup.boolean().optional().default(false),
  needs_cpf_cnpj: yup.boolean().optional().default(false),
});

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para filtros
  const [filterType, setFilterType] = useState<Type | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  
  // Estados para formulários
  const [formType, setFormType] = useState<Type | null>(null);
  const [formCategory, setFormCategory] = useState<Category | null>(null);
  
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [showCategorySelectionModal, setShowCategorySelectionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalContext, setModalContext] = useState<'filter' | 'form'>('filter');
  const [createImageFiles, setCreateImageFiles] = useState<UploadedFile[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<UploadedFile[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(serviceSchema),
  });

  const resetForm = () => {
    reset();
    setFormType(null);
    setFormCategory(null);
    setCreateImageFiles([]);
    setEditImageFiles([]);
  };

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

      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }

      response = await apiService.getServices(filters, currentPage);
      setTotalPages(response.last_page);

      setServices(response.data || response);
    } catch (error) {
      toast.error('Erro ao carregar serviços:');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset para primeira página ao aplicar filtros
    fetchServices();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (filterType) count++;
    if (filterCategory) count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType(null);
    setFilterCategory(null);
    setCurrentPage(1);
    fetchServices();
  };

  const handleCreateService = async (data: any) => {
    try {
      if (createImageFiles.length === 0) {
        toast.error('Por favor, selecione uma imagem');
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('image', createImageFiles[0].file);
      
      if (formType?.id) {
        formData.append('type_id', formType.id.toString());
      }
      if (formCategory?.id) {
        formData.append('category_id', formCategory.id.toString());
      }
      
      formData.append('needs_attachment', data.needs_attachment.toString());
      formData.append('needs_email', data.needs_email.toString());
      formData.append('needs_address', data.needs_address.toString());
      formData.append('needs_phone', data.needs_phone.toString());
      formData.append('needs_birth_date', data.needs_birth_date.toString());
      formData.append('needs_cpf_cnpj', data.needs_cpf_cnpj.toString());

      await apiService.createService(formData);
      
      setShowCreateModal(false);
      resetForm();
      setCreateImageFiles([]);
      fetchServices();
      toast.success('Serviço criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar serviço: ' + error);
    }
  };

  const handleUpdateService = async (data: any) => {
    if (!selectedService) return;
    try {
      if (editImageFiles.length === 0) {
        toast.error('Por favor, selecione uma imagem');
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('image', editImageFiles[0].file);
      
      if (formType?.id) {
        formData.append('type_id', formType.id.toString());
      }
      if (formCategory?.id) {
        formData.append('category_id', formCategory.id.toString());
      }
      
      formData.append('needs_attachment', data.needs_attachment.toString());
      formData.append('needs_email', data.needs_email.toString());
      formData.append('needs_address', data.needs_address.toString());
      formData.append('needs_phone', data.needs_phone.toString());
      formData.append('needs_birth_date', data.needs_birth_date.toString());
      formData.append('needs_cpf_cnpj', data.needs_cpf_cnpj.toString());

      await apiService.updateService(selectedService.id, formData);
      
      setShowEditModal(false);
      resetForm();
      setSelectedService(null);
      setEditImageFiles([]);
      fetchServices();
      toast.success('Serviço atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar serviço: ' + error);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await apiService.deleteService(service.id);
      fetchServices();
      toast.success('Serviço excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir serviço: ' + error);
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setValue('name', service.name);
    setValue('description', service.description);
    setValue('type_id', service.type_id || 0);
    setValue('category_id', service.category_id || 0);
    setValue('needs_attachment', service.needs_attachment || false);
    setValue('needs_address', service.needs_address || false);
    setValue('needs_phone', service.needs_phone || false);
    setValue('needs_birth_date', service.needs_birth_date || false);
    setValue('needs_cpf_cnpj', service.needs_cpf_cnpj || false);
    setValue('needs_email', service.needs_email || false);
    // Definir os tipos e categorias selecionados
    if (service.type) {
      setFormType(service.type);
    }
    if (service.category) {
      setFormCategory(service.category);
    }
    // Resetar arquivos de imagem
    setEditImageFiles([]);

    setShowEditModal(true);
  };

  const openViewModal = (service: Service) => {
    setSelectedService(service);
    setShowViewModal(true);
  };

  const handleTypeSelect = (type: Type) => {
    if (modalContext === 'filter') {
      setFilterType(type);
    } else {
      setFormType(type);
    }
    setShowTypeSelectionModal(false);
  };

  const handleCategorySelect = (category: Category) => {
    if (modalContext === 'filter') {
      setFilterCategory(category);
    } else {
      setFormCategory(category);
    }
    setShowCategorySelectionModal(false);
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
      key: 'description',
      header: 'Descrição',
      render: (service: Service) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate">{service.description}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (service: Service) => (
        <span className="text-sm text-gray-900">{service.type?.name || 'N/A'}</span>
      )
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (service: Service) => (
        <span className="text-sm text-gray-900">{service.category?.name || 'N/A'}</span>
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
      key: 'created_at',
      header: 'Data',
      render: (service: Service) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(service.created_at).toLocaleDateString('pt-BR')}
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
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
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
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Serviço"
        size="xl"
      >
        <form onSubmit={(e) => {
          handleSubmit(handleCreateService)(e);
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <Input
                {...register('name')}
                placeholder="Nome do serviço"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione tipo"
                  value={formType?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setModalContext('form');
                    setShowTypeSelectionModal(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione categoria"
                  value={formCategory?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setModalContext('form');
                    setShowCategorySelectionModal(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <Textarea
              {...register('description')}
              placeholder="Descrição do serviço"
              rows={4}
              error={errors.description?.message}
            />
          </div>

          <div>
            <FileUpload
              onFilesChange={setCreateImageFiles}
              config={SERVICE_IMAGE_CONFIG}
              placeholder="Arraste uma imagem aqui ou clique para selecionar"
              showUploadSection={true}
              disabled={false}
              title="Imagem *"
              subtitle="Carregue uma imagem para o serviço"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requisitos do Serviço
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox
                checked={watch('needs_attachment')}
                onChange={(e) => setValue('needs_attachment', e.target.checked)}
                label="Anexo obrigatório"
              />

              <Checkbox
                checked={watch('needs_address')}
                onChange={(e) => setValue('needs_address', e.target.checked)}
                label="Endereço obrigatório"
              />

              <Checkbox
                checked={watch('needs_phone')}
                onChange={(e) => setValue('needs_phone', e.target.checked)}
                label="Telefone obrigatório"
              />

              <Checkbox
                checked={watch('needs_birth_date')}
                onChange={(e) => setValue('needs_birth_date', e.target.checked)}
                label="Data de nascimento obrigatória"
              />

              <Checkbox
                checked={watch('needs_cpf_cnpj')}
                onChange={(e) => setValue('needs_cpf_cnpj', e.target.checked)}
                label="CPF/CNPJ obrigatório"
              />

              <Checkbox
                checked={watch('needs_email')}
                onChange={(e) => setValue('needs_email', e.target.checked)}
                label="Email obrigatório"
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
              Criar Serviço
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Serviço"
        size="xl"
      >
        <form onSubmit={(e) => {
          handleSubmit(handleUpdateService)(e);
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <Input
                {...register('name')}
                placeholder="Nome do serviço"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione tipo"
                  value={formType?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setModalContext('form');
                    setShowTypeSelectionModal(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione categoria"
                  value={formCategory?.name || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setModalContext('form');
                    setShowCategorySelectionModal(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <Textarea
              {...register('description')}
              placeholder="Descrição do serviço"
              rows={4}
              error={errors.description?.message}
            />
          </div>

          <div>
            <FileUpload
              onFilesChange={setEditImageFiles}
              config={SERVICE_IMAGE_CONFIG}
              placeholder="Arraste uma nova imagem aqui ou clique para selecionar"
              showUploadSection={true}
              disabled={false}
              title="Imagem *"
              subtitle="Carregue uma nova imagem para o serviço"
            />
            {editImageFiles.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Imagem é obrigatória</p>
            )}
            {selectedService?.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                <img 
                  src={selectedService.image} 
                  alt={selectedService.name} 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requisitos do Serviço
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox
                checked={watch('needs_attachment')}
                onChange={(e) => setValue('needs_attachment', e.target.checked)}
                label="Anexo obrigatório"
              />

              <Checkbox
                checked={watch('needs_address')}
                onChange={(e) => setValue('needs_address', e.target.checked)}
                label="Endereço obrigatório"
              />

              <Checkbox
                checked={watch('needs_phone')}
                onChange={(e) => setValue('needs_phone', e.target.checked)}
                label="Telefone obrigatório"
              />

              <Checkbox
                checked={watch('needs_birth_date')}
                onChange={(e) => setValue('needs_birth_date', e.target.checked)}
                label="Data de nascimento obrigatória"
              />

              <Checkbox
                checked={watch('needs_cpf_cnpj')}
                onChange={(e) => setValue('needs_cpf_cnpj', e.target.checked)}
                label="CPF/CNPJ obrigatório"
              />

              <Checkbox
                checked={watch('needs_email')}
                onChange={(e) => setValue('needs_email', e.target.checked)}
                label="Email obrigatório"
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
              Atualizar Serviço
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Visualizar Serviço"
        size="xl"
      >
        {selectedService && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Serviço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedService.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-sm text-gray-900">{selectedService.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <p className="text-sm text-gray-900">{selectedService.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="text-sm text-gray-900">{selectedService.type?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <p className="text-sm text-gray-900">{selectedService.category?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedService.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Requisitos</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${selectedService.needs_attachment ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">Anexo obrigatório</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${selectedService.needs_address ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">Endereço obrigatório</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${selectedService.needs_phone ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">Telefone obrigatório</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${selectedService.needs_birth_date ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">Data de nascimento obrigatória</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${selectedService.needs_cpf_cnpj ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">CPF/CNPJ obrigatório</span>
                  </div>
                </div>

                {selectedService.image && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Imagem</h4>
                    <FilePreview
                      attachments={[{
                        id: 0,
                        name: selectedService.name,
                        path: selectedService.image,
                        url: selectedService.image,
                        created_at: selectedService.created_at
                      }]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedService);
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

    </div>
  );
};

export default Services;
