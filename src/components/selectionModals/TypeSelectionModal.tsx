import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import apiService from '../../services/api';
import type { Type as TypeType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Table from '../ui/Table';
import Modal from '../ui/Modal';

interface TypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: TypeType) => void;
}

const TypeSelectionModal: React.FC<TypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [types, setTypes] = useState<TypeType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchTypes();
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = types.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(types);
    }
  }, [searchTerm, types]);

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTypes({}, currentPage);
      setTypes(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const response = await apiService.getTypes({ name: searchTerm }, 1);
        setTypes(response.data);
        setTotalPages(response.last_page);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchTypes();
    }
  };

  const handleTypeSelect = (type: TypeType) => {
    onSelect(type);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (type: TypeType) => (
        <div className="flex items-center space-x-3">
          <Layers className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{type.name}</p>
            <p className="text-xs text-gray-500">
              {type.is_active ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'image',
      header: 'Imagem',
      render: (type: TypeType) => (
        <div className="flex items-center space-x-2">
          {type.image ? (
            <img 
              src={type.image} 
              alt={type.name}
              className="h-8 w-8 rounded object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (type: TypeType) => (
        <Button
          onClick={() => handleTypeSelect(type)}
          variant="outline"
          size="sm"
          className="text-purple-600 hover:text-purple-700"
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
      title="Selecionar Tipo"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Buscar por nome do tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(''); fetchTypes(); }} variant="outline">
              Limpar
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <Table
                data={filteredTypes}
                columns={tableColumns}
                emptyMessage="Nenhum tipo encontrado"
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

export default TypeSelectionModal;
