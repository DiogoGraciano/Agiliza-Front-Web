import React, { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import apiService from '../../services/api';
import type { Desk as DeskType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Table from '../ui/Table';
import Modal from '../ui/Modal';

interface DeskSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (desk: DeskType) => void;
  selectedLocationId?: number;
}

const DeskSelectionModal: React.FC<DeskSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedLocationId,
}) => {
  const [desks, setDesks] = useState<DeskType[]>([]);
  const [filteredDesks, setFilteredDesks] = useState<DeskType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen && selectedLocationId) {
      fetchDesks();
    }
  }, [isOpen, selectedLocationId, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = desks.filter(desk =>
        desk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desk.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDesks(filtered);
    } else {
      setFilteredDesks(desks);
    }
  }, [searchTerm, desks]);

  const fetchDesks = async () => {
    if (!selectedLocationId) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getDesks({ location_id: selectedLocationId }, currentPage);
      setDesks(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const response = await apiService.getDesks({ 
          location_id: selectedLocationId,
          name: searchTerm 
        }, 1);
        setDesks(response.data);
        setTotalPages(response.last_page);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchDesks();
    }
  };

  const handleDeskSelect = (desk: DeskType) => {
    onSelect(desk);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Nome da Mesa',
      render: (desk: DeskType) => (
        <div className="flex items-center space-x-3">
          <Monitor className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{desk.name}</p>
            <p className="text-xs text-gray-500">
              {desk.status === 'active' ? 'Ativa' : 'Inativa'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'number',
      header: 'Número',
      render: (desk: DeskType) => (
        <div className="text-sm text-gray-900">
          {desk.number}
        </div>
      )
    },
    {
      key: 'location',
      header: 'Localização',
      render: (desk: DeskType) => (
        <div className="text-sm text-gray-900">
          {desk.location?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (desk: DeskType) => (
        <Button
          onClick={() => handleDeskSelect(desk)}
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          disabled={desk.status !== 'active'}
        >
          Selecionar
        </Button>
      )
    }
  ];

  if (!selectedLocationId) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Selecionar Mesa"
        size="xl"
      >
        <div className="p-6 text-center">
          <p className="text-gray-500">Selecione uma localização primeiro para visualizar as mesas disponíveis.</p>
          <Button onClick={onClose} className="mt-4">
            Fechar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Mesa"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Buscar por nome ou número da mesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(''); fetchDesks(); }} variant="outline">
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
                data={filteredDesks}
                columns={tableColumns}
                emptyMessage="Nenhuma mesa encontrada para esta localização"
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

export default DeskSelectionModal;
