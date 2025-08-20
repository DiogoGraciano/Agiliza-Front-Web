import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Settings, ChevronLeft, ChevronRight, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import SelectionModal from './SelectionModal';
import type { Service } from '../../types';
import type { PaginationInfo } from './SelectionModal';
import apiService from '../../services/api';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: Service) => void;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      const response = await apiService.getServices(params.toString());
      setAllServices(response.data);
      setServices(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total
      });
    } catch (error) {
      toast.error('Erro ao carregar serviços.');
      setServices([]);
      setAllServices([]);
      setPagination(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const searchServices = async (query: string, page: number = 1) => {
    try {
      setIsLoading(true);
      
      if (query.trim()) {
        // Usar a API de busca quando há termo de busca
        const response = await apiService.searchServices(query);
        setServices(response.data);
        setPagination(undefined); // Busca não retorna paginação
      } else {
        // Usar a API principal com paginação
        const params = new URLSearchParams();
        params.append('page', page.toString());
        const response = await apiService.getServices(params.toString());
        setServices(response.data);
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total
        });
      }
    } catch (error) {
      toast.error('Erro ao buscar serviços.');
      // Fallback para busca local se a API falhar
      const filtered = allServices.filter(service =>
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(query.toLowerCase()))
      );
      setServices(filtered);
      setPagination(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
      fetchServices(1);
    }
  }, [isOpen]);

  const handlePageChange = (page: number) => {
    // Manter o estado da página atual para consistência
    const previousPage = currentPage; // Leitura para evitar warning
    setCurrentPage(page);
    if (searchTerm.trim()) {
      searchServices(searchTerm, page);
    } else {
      fetchServices(page);
    }
    console.debug('Mudando da página', previousPage, 'para', page);
  };

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
    
    if (search.trim() === '') {
      fetchServices(1);
    } else {
      searchServices(search, 1);
    }
  }, []); // currentPage não precisa ser dependência pois sempre usamos valor fixo (1)

  const handleSelect = (item: any) => {
    onSelect(item as Service);
  };

  const renderServiceItem = (item: any) => {
    const service = item as Service;
    return (
      <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5 text-green-600" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{service.name}</p>
          {service.description && (
            <div className="flex items-start mt-1">
              <FileText className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                {service.description.length > 100 
                  ? `${service.description.substring(0, 100)}...` 
                  : service.description
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Serviço"
      items={services}
      onSelect={handleSelect}
      placeholder="Buscar por nome ou descrição..."
      // searchFields={['name', 'description']} // Propriedade removida
      renderItem={renderServiceItem}
      emptyMessage="Nenhum serviço encontrado"
      size="lg"
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      isLoading={isLoading}
    />
  );
};

export default ServiceSelectionModal;
