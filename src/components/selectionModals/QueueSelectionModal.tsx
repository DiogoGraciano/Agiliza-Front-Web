import React, { useState, useEffect } from 'react';
import { Settings, Hash } from 'lucide-react';
import apiService from '../../services/api';
import type { Queue } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Table from '../ui/Table';
import Modal from '../ui/Modal';

interface QueueSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (queue: Queue) => void;
}

const QueueSelectionModal: React.FC<QueueSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [filteredQueues, setFilteredQueues] = useState<Queue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchQueues();
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = queues.filter(queue =>
        queue.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQueues(filtered);
    } else {
      setFilteredQueues(queues);
    }
  }, [searchTerm, queues]);

  const fetchQueues = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getQueues({}, currentPage);
      setQueues(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar filas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const response = await apiService.getQueues({ name: searchTerm }, 1);
        setQueues(response.data);
        setTotalPages(response.last_page);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchQueues();
    }
  };

  const handleQueueSelect = (queue: Queue) => {
    onSelect(queue);
    onClose();
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
      key: 'name',
      header: 'Nome',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-3">
          <Settings className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{queue.name}</p>
            <p className="text-xs text-gray-500">
              {queue.is_active ? 'Ativa' : 'Inativa'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Prioridade',
      render: (queue: Queue) => (
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-purple-500" />
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(queue.priority)}`}>
            {getPriorityText(queue.priority)}
          </span>
          <span className="text-sm text-gray-600">({queue.priority})</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (queue: Queue) => (
        <Button
          onClick={() => handleQueueSelect(queue)}
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          Selecionar
        </Button>
      )
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Fila"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Buscar por nome da fila..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(''); fetchQueues(); }} variant="outline">
              Limpar
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Table
                data={filteredQueues}
                columns={tableColumns}
                emptyMessage="Nenhuma fila encontrada"
              />
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QueueSelectionModal;
