import React, { useState, useEffect } from 'react';
import { Search, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

export interface SelectableItem {
  id: number;
  name: string;
  [key: string]: any;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: SelectableItem[];
  onSelect: (item: SelectableItem) => void;
  placeholder?: string;
  searchFields?: string[];
  renderItem?: (item: SelectableItem) => React.ReactNode;
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSearch?: (searchTerm: string) => void;
  isLoading?: boolean;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  onSelect,
  placeholder = 'Buscar...',
  // searchFields = ['name'], // Campo removido pois não está sendo utilizado
  renderItem,
  emptyMessage = 'Nenhum item encontrado',
  size = 'lg',
  pagination,
  onPageChange,
  onSearch,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Chamar onSearch quando o termo de busca mudar
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleSelect = (item: SelectableItem) => {
    onSelect(item);
    onClose();
    setSearchTerm('');
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const defaultRenderItem = (item: SelectableItem) => (
    <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-blue-600" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
        {item.email && (
          <p className="text-sm text-gray-500">{item.email}</p>
        )}
        {item.description && (
          <p className="text-sm text-gray-500">{item.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      showCloseButton={true}
    >
      <div className="space-y-4">
        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de itens */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Carregando...</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="border-b border-gray-100 last:border-b-0"
              >
                {renderItem ? renderItem(item) : defaultRenderItem(item)}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        {pagination && (
          <div className="text-sm text-gray-500 text-center">
            {items.length} de {pagination.total} itens
          </div>
        )}

        {/* Paginação */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {pagination.current_page} de {pagination.last_page}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, pagination.current_page - 1))}
                disabled={pagination.current_page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(pagination.last_page, pagination.current_page + 1))}
                disabled={pagination.current_page === pagination.last_page}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SelectionModal;
