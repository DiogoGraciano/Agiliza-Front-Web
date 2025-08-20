import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Settings,
  Calendar,
  Image as ImageIcon,
  Layers,
  FunnelX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../services/api';
import type { Service, Type } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import SelectionModal from '../components/ui/SelectionModal';

const serviceSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  image: yup.string().url('URL inválida').optional().default(undefined),
});

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [useSearchApi, setUseSearchApi] = useState(false);
  const [selectedType, setSelectedType] = useState<Type | null>(null);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [types, setTypes] = useState<Type[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(serviceSchema),
  });

  useEffect(() => {
    fetchServices();
    fetchTypes();
  }, [currentPage]); // Removidas dependências dos filtros para evitar loops

  const fetchServices = async () => {
    try {
      setIsLoading(true);

      let response;

      if (useSearchApi && searchTerm.trim()) {
        // Usar a API de busca quando especificamente solicitado
        response = await apiService.searchServices(searchTerm);
        // A API de busca não retorna paginação
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        // Usar a API principal com filtros
        const params = new URLSearchParams();

        if (selectedType) {
          params.append('type_id', selectedType.id.toString());
        }

        if (searchTerm.trim()) {
          params.append('name', searchTerm);
        }

        params.append('page', currentPage.toString());

        response = await apiService.getServices(params.toString());
        setTotalPages(response.last_page);
      }

      setServices(response.data);
    } catch (error) {
      toast.error('Erro ao carregar serviços:');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async (data: any) => {
    try {
      await apiService.createService(data);
      setShowCreateModal(false);
      reset();
      fetchServices();
      toast.success('Serviço criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar serviço:');
    }
  };

  const handleUpdateService = async (data: any) => {
    if (!selectedService) return;

    try {
      await apiService.updateService(selectedService.id, data);
      setShowEditModal(false);
      reset();
      setSelectedService(null);
      fetchServices();
      toast.success('Serviço atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar serviço:');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await apiService.deleteService(id);
        fetchServices();
        toast.success('Serviço excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir serviço:');
      }
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setValue('name', service.name);
    setValue('description', service.description);
    setValue('image', service.image || '');
    setShowEditModal(true);
  };

  const openViewModal = (service: Service) => {
    setSelectedService(service);
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
          <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate">
            {value.length > 50 ? `${value.substring(0, 50)}...` : value}
          </p>
        </div>
      ),
    },
    {
      key: 'image',
      header: 'Imagem',
      render: (value: string) => (
        <div className="flex items-center">
          <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {value ? 'Sim' : 'Não'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Data de Criação',
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
      render: (_: any, item: Service) => (
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
            onClick={() => handleDeleteService(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(null);
    setUseSearchApi(false);
    setCurrentPage(1);
  };

  const fetchTypes = async () => {
    try {
      const response = await apiService.getTypes();
      setTypes(response.data);
    } catch (error) {
      toast.error('Erro ao carregar tipos:');
    }
  };

  const applyFilters = () => {
    setUseSearchApi(false);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os serviços oferecidos pelo sistema
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por Nome
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setUseSearchApi(false);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Selecione um tipo..."
                  value={selectedType ? selectedType.name : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTypeSelectionModal(true)}
                  size="sm"
                >
                  Selecionar
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <FunnelX className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={applyFilters}
                className="w-full"
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
          data={services}
          isLoading={isLoading}
          emptyMessage="Nenhum serviço encontrado"
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
        title="Novo Serviço"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateService)} className="space-y-4">
          <Input
            label="Nome do Serviço"
            placeholder="Ex: Suporte Técnico"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Descrição"
            rows={4}
            placeholder="Descreva detalhadamente o serviço oferecido..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="URL da Imagem (opcional)"
            placeholder="https://exemplo.com/imagem.jpg"
            error={errors.image?.message}
            {...register('image')}
            helperText="URL de uma imagem representativa do serviço"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
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
        size="lg"
      >
        <form onSubmit={handleSubmit(handleUpdateService)} className="space-y-4">
          <Input
            label="Nome do Serviço"
            placeholder="Ex: Suporte Técnico"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Descrição"
            rows={4}
            placeholder="Descreva detalhadamente o serviço oferecido..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="URL da Imagem (opcional)"
            placeholder="https://exemplo.com/imagem.jpg"
            error={errors.image?.message}
            {...register('image')}
            helperText="URL de uma imagem representativa do serviço"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
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
        title="Detalhes do Serviço"
        size="lg"
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedService.name}</h3>
                <p className="text-sm text-gray-500">Serviço do sistema</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <p className="text-sm text-gray-900 mt-1">{selectedService.description}</p>
            </div>

            {selectedService.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem</label>
                <div className="mt-2">
                  <img
                    src={selectedService.image}
                    alt={selectedService.name}
                    className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedService.image}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedService.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedService.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
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
                  openEditModal(selectedService);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Seleção de Tipo */}
      <SelectionModal
        isOpen={showTypeSelectionModal}
        onClose={() => setShowTypeSelectionModal(false)}
        title="Selecionar Tipo"
        items={types}
        onSelect={(type) => {
          setSelectedType(type as Type);
          setShowTypeSelectionModal(false);
        }}
        placeholder="Buscar por nome de tipo..."
        emptyMessage="Nenhum tipo encontrado"
        renderItem={(type) => (
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{type.name}</p>
              <p className="text-xs text-gray-500">ID: {type.id}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Services;
