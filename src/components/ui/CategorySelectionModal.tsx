import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import apiService from '../../services/api';
import type { Category as CategoryType } from '../../types';
import Button from './Button';
import Input from './Input';
import Table from './Table';
import Modal from './Modal';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: CategoryType) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCategories({}, currentPage);
      setCategories(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setIsLoading(true);
        const response = await apiService.getCategories({ name: searchTerm }, 1);
        setCategories(response.data);
        setTotalPages(response.last_page);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchCategories();
    }
  };

  const handleCategorySelect = (category: CategoryType) => {
    onSelect(category);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (category: CategoryType) => (
        <div className="flex items-center space-x-3">
          <Tag className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">{category.name}</p>
            <p className="text-xs text-gray-500">
              {category.is_active ? 'Ativa' : 'Inativa'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'services_count',
      header: 'Serviços',
      render: (category: CategoryType) => (
        <span className="text-sm text-gray-900">
          {category.services?.length || 0} serviço(s)
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (category: CategoryType) => (
        <Button
          onClick={() => handleCategorySelect(category)}
          variant="outline"
          size="sm"
          className="text-green-600 hover:text-green-700"
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
      title="Selecionar Categoria"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex space-x-3">
          <Input
            type="text"
            placeholder="Buscar por nome da categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            Buscar
          </Button>
          {searchTerm && (
            <Button onClick={() => { setSearchTerm(''); fetchCategories(); }} variant="outline">
              Limpar
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <Table
                data={filteredCategories}
                columns={tableColumns}
                emptyMessage="Nenhuma categoria encontrada"
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

export default CategorySelectionModal;
