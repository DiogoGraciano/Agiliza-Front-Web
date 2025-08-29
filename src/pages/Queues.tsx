import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Settings,
  Hash,
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Queue, QueueFilters } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FiltersPanel } from '../components/ui/FiltersPanel';
import QueueForm from '../components/queues/QueueForm';
import QueueView from '../components/queues/QueueView';

const Queues: React.FC = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQueues();
  }, [currentPage]);

  const fetchQueues = async () => {
    try {
      setIsLoading(true);
      
      const filters: QueueFilters = {};
      
      if (searchTerm.trim()) {
        filters.name = searchTerm;
      }
      
      if (priorityFilter.trim()) {
        const priority = parseInt(priorityFilter);
        if (!isNaN(priority)) {
          filters.priority = priority;
        }
      }
      
      if (isActiveFilter !== 'all') {
        filters.is_active = isActiveFilter === 'true';
      }
      
      const response = await apiService.getQueues(filters, currentPage);
      setQueues(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao buscar filas:', error);
      toast.error('Erro ao buscar filas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQueue = async (queue: Queue) => {
    if (!confirm('Tem certeza que deseja excluir esta fila?')) return;
    
    try {
      await apiService.deleteQueue(queue.id);
      toast.success('Fila excluída com sucesso!');
      fetchQueues();
    } catch (error: any) {
      toast.error('Erro ao excluir fila.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      fetchQueues();
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar fila.');
    }
  };

  const openEditModal = (queue: Queue) => {
    setSelectedQueue(queue);
    setShowEditModal(true);
  };

  const openViewModal = (queue: Queue) => {
    setSelectedQueue(queue);
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
    setSelectedQueue(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedQueue(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
    setIsActiveFilter('all');
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchQueues();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (priorityFilter.trim()) count++;
    if (isActiveFilter !== 'all') count++;
    return count;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-red-100 text-red-800';
    if (priority <= 4) return 'bg-orange-100 text-orange-800';
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityText = (priority: number) => {
    if (priority <= 2) return 'Alta';
    if (priority <= 4) return 'Média-Alta';
    if (priority <= 6) return 'Média';
    return 'Baixa';
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (queue: Queue) => <span className="font-mono text-sm">{queue.id}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{queue.name}</span>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Prioridade',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(queue.priority)}`}>
            {queue.priority} - {getPriorityText(queue.priority)}
          </span>
        </div>
      )
    },

    {
      key: 'image',
      header: 'Imagem',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {queue.image ? (
              <img 
                src={queue.image} 
                alt="Imagem da fila" 
                className="w-8 h-8 object-cover rounded border border-gray-200"
              />
            ) : 'Não'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (queue: Queue) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${queue.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {queue.is_active ? (
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
      key: 'created_at',
      header: 'Data',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">
            {new Date(queue.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openViewModal(queue)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => openEditModal(queue)}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleDeleteQueue(queue)}
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
          Nova Fila
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

          {/* Filtro por prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <Input
              type="number"
              placeholder="Digite a prioridade..."
              min="1"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtro por status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Todos os Status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>
      </FiltersPanel>

      {/* Tabela de Filas */}
      <div className="space-y-4">
        <Table
          title="Lista de Filas"
          data={queues}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage="Nenhuma fila encontrada. Tente ajustar os filtros ou criar uma nova fila."
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
                    {queues.length} filas
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
        title="Criar Nova Fila"
        size="2xl"
      >
        <QueueForm
          onCancel={closeCreateModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Fila"
        size="2xl"
      >
        <QueueForm
          queue={selectedQueue}
          isEditing={true}
          onCancel={closeEditModal}
          onSubmit={onSubmit}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Visualizar Fila"
        size="3xl"
      >
        {selectedQueue && (
          <QueueView
            queue={selectedQueue}
            onClose={closeViewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Queues;
